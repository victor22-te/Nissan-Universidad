"""
Rutas para gestión de cuatrimestres.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cuatrimestre
from schemas import CuatrimestreCreate, CuatrimestreOut

router = APIRouter(prefix="/api/cuatrimestres", tags=["Cuatrimestres"])

PERIODOS = {
    1: "Enero - Abril",
    2: "Mayo - Agosto",
    3: "Septiembre - Diciembre",
}


@router.get("/", response_model=list[CuatrimestreOut])
def listar_cuatrimestres(db: Session = Depends(get_db)):
    return db.query(Cuatrimestre).order_by(Cuatrimestre.anio.desc(), Cuatrimestre.periodo.desc()).all()


@router.post("/", response_model=CuatrimestreOut)
def crear_cuatrimestre(data: CuatrimestreCreate, db: Session = Depends(get_db)):
    # Verificar que no exista ya
    existe = db.query(Cuatrimestre).filter(
        Cuatrimestre.anio == data.anio,
        Cuatrimestre.periodo == data.periodo
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Este cuatrimestre ya existe")

    nombre = f"{PERIODOS[data.periodo]} {data.anio}"
    cuatrimestre = Cuatrimestre(
        anio=data.anio,
        periodo=data.periodo,
        nombre=nombre
    )
    db.add(cuatrimestre)
    db.commit()
    db.refresh(cuatrimestre)
    return cuatrimestre


@router.get("/{cuatrimestre_id}", response_model=CuatrimestreOut)
def obtener_cuatrimestre(cuatrimestre_id: int, db: Session = Depends(get_db)):
    cuatrimestre = db.query(Cuatrimestre).filter(Cuatrimestre.id == cuatrimestre_id).first()
    if not cuatrimestre:
        raise HTTPException(status_code=404, detail="Cuatrimestre no encontrado")
    return cuatrimestre


@router.delete("/{cuatrimestre_id}")
def eliminar_cuatrimestre(cuatrimestre_id: int, db: Session = Depends(get_db)):
    cuatrimestre = db.query(Cuatrimestre).filter(Cuatrimestre.id == cuatrimestre_id).first()
    if not cuatrimestre:
        raise HTTPException(status_code=404, detail="Cuatrimestre no encontrado")
    db.delete(cuatrimestre)
    db.commit()
    return {"message": "Cuatrimestre eliminado"}
