"""
Rutas para gestión de empleados.
Incluye carga manual y extracción automática desde XML de nómina CFDI 4.0/3.3.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Empleado
from schemas import EmpleadoCreate, EmpleadoOut
from lxml import etree
from typing import List

router = APIRouter(prefix="/api/empleados", tags=["Empleados"])

# ── Namespaces XML del SAT ───────────────────────────────────
_CFDI_NAMESPACES = {
    "cfdi": "http://www.sat.gob.mx/cfd/4",
    "nomina12": "http://www.sat.gob.mx/nomina12",
    "tfd": "http://www.sat.gob.mx/TimbreFiscalDigital",
}

# Fallback para CFDI 3.3
_CFDI_33_RECEPTOR = ".//{http://www.sat.gob.mx/cfd/3}Receptor"
_NOMINA_12_NS = "{http://www.sat.gob.mx/nomina12}"


# ── Parser XML ───────────────────────────────────────────────

def _parsear_xml_a_arbol(xml_content: bytes) -> etree._Element:
    """Parsea bytes de XML y retorna el elemento raíz, o lanza 400 si es inválido."""
    try:
        return etree.fromstring(xml_content)
    except etree.XMLSyntaxError:
        raise HTTPException(status_code=400, detail="El archivo XML no es válido")


def _extraer_datos_receptor(raiz: etree._Element) -> tuple:
    """Extrae RFC y Nombre del nodo Receptor del CFDI."""
    receptor = raiz.find(".//cfdi:Receptor", _CFDI_NAMESPACES)
    if receptor is None:
        receptor = raiz.find(_CFDI_33_RECEPTOR)
    if receptor is None:
        raise HTTPException(status_code=400, detail="No se encontró el nodo Receptor en el XML")

    rfc = receptor.get("Rfc", "")
    nombre = receptor.get("Nombre", "")
    return rfc, nombre


def _extraer_datos_nomina(raiz: etree._Element) -> dict:
    """
    Extrae CURP, NSS, salario base y datos generales de la sección Nómina.
    Retorna un diccionario con las claves: curp, nss, datos_nomina, salario_base_cotizacion.
    """
    nomina = raiz.find(".//nomina12:Nomina", _CFDI_NAMESPACES)
    if nomina is None:
        nomina = raiz.find(f".//{_NOMINA_12_NS}Nomina")

    curp = ""
    nss = ""
    datos_nomina = {}
    salario_base = 0.0

    if nomina is None:
        return {"curp": curp, "nss": nss, "datos_nomina": datos_nomina, "salario_base_cotizacion": salario_base}

    # Datos del receptor de nómina (empleado)
    receptor_nomina = nomina.find("nomina12:Receptor", _CFDI_NAMESPACES)
    if receptor_nomina is None:
        receptor_nomina = nomina.find(f"{_NOMINA_12_NS}Receptor")

    if receptor_nomina is not None:
        curp = receptor_nomina.get("Curp", "")
        nss = receptor_nomina.get("NumSeguridadSocial", "")
        datos_nomina = dict(receptor_nomina.attrib)

        # Extraer salario base de cotización
        sbc_texto = receptor_nomina.get("SalarioBaseCotAport", "")
        if sbc_texto:
            try:
                salario_base = float(sbc_texto)
            except ValueError:
                salario_base = 0.0
        datos_nomina["SalarioBaseCotAport"] = salario_base

    # Datos generales de la nómina
    campos_nomina_general = [
        "TipoNomina", "FechaPago", "FechaInicialPago",
        "FechaFinalPago", "TotalPercepciones", "TotalDeducciones",
    ]
    for campo in campos_nomina_general:
        datos_nomina[campo] = nomina.get(campo, "")

    return {
        "curp": curp,
        "nss": nss,
        "datos_nomina": datos_nomina,
        "salario_base_cotizacion": salario_base,
    }


def parsear_xml_nomina(xml_content: bytes) -> dict:
    """
    Parsea un XML de nómina CFDI 4.0 y extrae los datos completos del empleado.
    Retorna un diccionario con: rfc, curp, nombre, nss, datos_nomina, salario_base_cotizacion.
    """
    raiz = _parsear_xml_a_arbol(xml_content)
    rfc, nombre = _extraer_datos_receptor(raiz)
    datos_nomina = _extraer_datos_nomina(raiz)

    return {
        "rfc": rfc,
        "nombre": nombre,
        **datos_nomina,
    }


# ── Helpers CRUD ─────────────────────────────────────────────

def _buscar_empleado_existente(db: Session, cuatrimestre_id: int, rfc: str, curp: str):
    """Busca un empleado por cuatrimestre + RFC + CURP para evitar duplicados."""
    return db.query(Empleado).filter(
        Empleado.cuatrimestre_id == cuatrimestre_id,
        Empleado.rfc == rfc,
        Empleado.curp == curp,
    ).first()


def _crear_o_actualizar_desde_xml(db: Session, cuatrimestre_id: int, datos: dict) -> Empleado:
    """Crea un empleado nuevo desde XML o actualiza uno existente si ya se registró."""
    existente = _buscar_empleado_existente(db, cuatrimestre_id, datos["rfc"], datos["curp"])

    if existente:
        existente.datos_nomina = datos["datos_nomina"]
        existente.nombre = datos["nombre"]
        existente.nss = datos["nss"]
        existente.salario_base_cotizacion = datos["salario_base_cotizacion"]
        db.commit()
        db.refresh(existente)
        return existente

    empleado = Empleado(
        cuatrimestre_id=cuatrimestre_id,
        rfc=datos["rfc"],
        curp=datos["curp"],
        nombre=datos["nombre"],
        nss=datos["nss"],
        datos_nomina=datos["datos_nomina"],
        salario_base_cotizacion=datos["salario_base_cotizacion"],
        origen="xml",
    )
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado


# ── Endpoints ────────────────────────────────────────────────

@router.get("/cuatrimestre/{cuatrimestre_id}", response_model=list[EmpleadoOut])
def listar_empleados(cuatrimestre_id: int, db: Session = Depends(get_db)):
    """Lista todos los empleados de un cuatrimestre."""
    return db.query(Empleado).filter(
        Empleado.cuatrimestre_id == cuatrimestre_id
    ).all()


@router.post("/", response_model=EmpleadoOut)
def crear_empleado_manual(data: EmpleadoCreate, db: Session = Depends(get_db)):
    """Registra un empleado de forma manual."""
    empleado = Empleado(**data.model_dump())
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado


@router.post("/xml/{cuatrimestre_id}", response_model=list[EmpleadoOut])
async def cargar_empleados_xml(
    cuatrimestre_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Carga uno o varios XMLs de nómina CFDI y extrae los datos de los empleados.
    Si el empleado ya existe (por RFC + CURP en el cuatrimestre), actualiza sus datos.
    """
    empleados_procesados = []

    for archivo in files:
        if not archivo.filename.lower().endswith(".xml"):
            continue

        contenido = await archivo.read()
        datos_empleado = parsear_xml_nomina(contenido)
        empleado = _crear_o_actualizar_desde_xml(db, cuatrimestre_id, datos_empleado)
        empleados_procesados.append(empleado)

    if not empleados_procesados:
        raise HTTPException(status_code=400, detail="No se encontraron XMLs válidos")

    return empleados_procesados


@router.put("/{empleado_id}", response_model=EmpleadoOut)
def actualizar_empleado(empleado_id: int, data: EmpleadoCreate, db: Session = Depends(get_db)):
    """Actualiza los datos de un empleado existente."""
    empleado = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    datos_actualizacion = data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizacion.items():
        setattr(empleado, campo, valor)

    db.commit()
    db.refresh(empleado)
    return empleado


@router.delete("/{empleado_id}")
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    """Elimina un empleado por su ID."""
    empleado = db.query(Empleado).filter(Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(empleado)
    db.commit()
    return {"message": "Empleado eliminado"}
