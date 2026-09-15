"""
Rutas para generación de reportes ICSOE y SISUB en Excel.

ICSOE: Informe de Contratos de Servicios u Obras Especializados (IMSS).
SISUB: Sistema de Información de Subcontratación (INFONAVIT).
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Contrato, Cuatrimestre
from services.excel_builder import ExcelReportBuilder

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


def _obtener_cuatrimestre_o_404(cuatrimestre_id: int, db: Session) -> Cuatrimestre:
    """Busca un cuatrimestre por ID o lanza HTTP 404."""
    cuatrimestre = db.query(Cuatrimestre).filter(Cuatrimestre.id == cuatrimestre_id).first()
    if not cuatrimestre:
        raise HTTPException(status_code=404, detail="Cuatrimestre no encontrado")
    return cuatrimestre


def _obtener_contratos_con_relaciones(cuatrimestre_id: int, db: Session, relaciones: list):
    """Carga contratos de un cuatrimestre con las relaciones especificadas (eager loading)."""
    query = db.query(Contrato).filter(Contrato.cuatrimestre_id == cuatrimestre_id)
    for relacion in relaciones:
        query = query.options(joinedload(relacion))
    return query.all()


def _enviar_como_excel(workbook, nombre_archivo: str) -> StreamingResponse:
    """Serializa un Workbook y lo devuelve como StreamingResponse descargable."""
    buffer = ExcelReportBuilder.workbook_to_bytes(workbook)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"},
    )


# ── Endpoints ─────────────────────────────────────────────────

@router.get("/icsoe/{cuatrimestre_id}")
def generar_icsoe(cuatrimestre_id: int, db: Session = Depends(get_db)):
    """Genera el reporte ICSOE en Excel (formato captura IMSS: NSS, CURP, SBC)."""
    cuatrimestre = _obtener_cuatrimestre_o_404(cuatrimestre_id, db)

    contratos = _obtener_contratos_con_relaciones(
        cuatrimestre_id, db,
        [Contrato.objetos_contables, Contrato.beneficiarios, Contrato.empleados],
    )

    filas = []
    for contrato in contratos:
        for empleado in contrato.empleados:
            salario = empleado.salario_base_cotizacion if empleado.salario_base_cotizacion is not None else 0.00
            filas.append([empleado.nss, empleado.curp, f"{salario:.2f}"])

    workbook = ExcelReportBuilder.build_icsoe(filas)
    nombre_archivo = f"ICSOE_{cuatrimestre.nombre.replace(' ', '_')}.xlsx"
    return _enviar_como_excel(workbook, nombre_archivo)


@router.get("/sisub-contratos/{cuatrimestre_id}")
def generar_sisub_contratos(cuatrimestre_id: int, db: Session = Depends(get_db)):
    """Genera el reporte SISUB de contratos en Excel."""
    cuatrimestre = _obtener_cuatrimestre_o_404(cuatrimestre_id, db)

    contratos = _obtener_contratos_con_relaciones(
        cuatrimestre_id, db,
        [Contrato.objetos_contables, Contrato.beneficiarios],
    )

    filas = []
    for contrato in contratos:
        descripcion_objetos = ", ".join([obj.descripcion for obj in contrato.objetos_contables]) or ""
        for beneficiario in contrato.beneficiarios:
            filas.append([
                contrato.numero_contrato, descripcion_objetos, contrato.monto,
                contrato.trabajadores_estimados, contrato.vigencia,
                contrato.fecha_inicio.strftime("%d/%m/%Y"),
                contrato.fecha_fin.strftime("%d/%m/%Y"),
                beneficiario.rfc, beneficiario.razon_social, beneficiario.registro_patronal,
            ])

    workbook = ExcelReportBuilder.build_sisub_contratos(filas)
    nombre_archivo = f"SISUB_Contratos_{cuatrimestre.nombre.replace(' ', '_')}.xlsx"
    return _enviar_como_excel(workbook, nombre_archivo)


@router.get("/sisub-trabajadores/{cuatrimestre_id}")
def generar_sisub_trabajadores(cuatrimestre_id: int, db: Session = Depends(get_db)):
    """Genera el reporte SISUB de trabajadores en Excel."""
    cuatrimestre = _obtener_cuatrimestre_o_404(cuatrimestre_id, db)

    contratos = _obtener_contratos_con_relaciones(
        cuatrimestre_id, db,
        [Contrato.empleados],
    )

    filas = []
    for contrato in contratos:
        for empleado in contrato.empleados:
            filas.append([
                contrato.numero_contrato,
                empleado.rfc, empleado.curp, empleado.nombre, empleado.nss,
            ])

    workbook = ExcelReportBuilder.build_sisub_trabajadores(filas)
    nombre_archivo = f"SISUB_Trabajadores_{cuatrimestre.nombre.replace(' ', '_')}.xlsx"
    return _enviar_como_excel(workbook, nombre_archivo)
