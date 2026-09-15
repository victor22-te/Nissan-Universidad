"""
Rutas para gestión de contratos.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Contrato
from schemas import ContratoCreate, ContratoUpdate, ContratoOut

router = APIRouter(prefix="/api/contratos", tags=["Contratos"])


@router.get("/cuatrimestre/{cuatrimestre_id}", response_model=list[ContratoOut])
def listar_contratos(cuatrimestre_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Contrato)
        .options(
            joinedload(Contrato.objetos_contables),
            joinedload(Contrato.beneficiarios),
            joinedload(Contrato.empleados),
        )
        .filter(Contrato.cuatrimestre_id == cuatrimestre_id)
        .all()
    )


@router.post("/", response_model=ContratoOut)
def crear_contrato(data: ContratoCreate, db: Session = Depends(get_db)):
    contrato = Contrato(**data.model_dump())
    db.add(contrato)
    db.commit()
    db.refresh(contrato)
    return contrato


@router.get("/{contrato_id}", response_model=ContratoOut)
def obtener_contrato(contrato_id: int, db: Session = Depends(get_db)):
    contrato = (
        db.query(Contrato)
        .options(
            joinedload(Contrato.objetos_contables),
            joinedload(Contrato.beneficiarios),
            joinedload(Contrato.empleados),
        )
        .filter(Contrato.id == contrato_id)
        .first()
    )
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contrato


@router.put("/{contrato_id}", response_model=ContratoOut)
def actualizar_contrato(contrato_id: int, data: ContratoUpdate, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contrato, key, value)

    db.commit()
    db.refresh(contrato)
    return contrato


@router.delete("/{contrato_id}")
def eliminar_contrato(contrato_id: int, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    db.delete(contrato)
    db.commit()
    return {"message": "Contrato eliminado"}
