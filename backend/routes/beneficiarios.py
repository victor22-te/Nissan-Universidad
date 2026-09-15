"""
Rutas para gestión de beneficiarios.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Beneficiario
from schemas import BeneficiarioCreate, BeneficiarioOut

router = APIRouter(prefix="/api/beneficiarios", tags=["Beneficiarios"])


@router.get("/cuatrimestre/{cuatrimestre_id}", response_model=list[BeneficiarioOut])
def listar_beneficiarios(cuatrimestre_id: int, db: Session = Depends(get_db)):
    return db.query(Beneficiario).filter(
        Beneficiario.cuatrimestre_id == cuatrimestre_id
    ).all()


@router.post("/", response_model=BeneficiarioOut)
def crear_beneficiario(data: BeneficiarioCreate, db: Session = Depends(get_db)):
    beneficiario = Beneficiario(**data.model_dump())
    db.add(beneficiario)
    db.commit()
    db.refresh(beneficiario)
    return beneficiario


@router.get("/{beneficiario_id}", response_model=BeneficiarioOut)
def obtener_beneficiario(beneficiario_id: int, db: Session = Depends(get_db)):
    beneficiario = db.query(Beneficiario).filter(Beneficiario.id == beneficiario_id).first()
    if not beneficiario:
        raise HTTPException(status_code=404, detail="Beneficiario no encontrado")
    return beneficiario


@router.put("/{beneficiario_id}", response_model=BeneficiarioOut)
def actualizar_beneficiario(beneficiario_id: int, data: BeneficiarioCreate, db: Session = Depends(get_db)):
    beneficiario = db.query(Beneficiario).filter(Beneficiario.id == beneficiario_id).first()
    if not beneficiario:
        raise HTTPException(status_code=404, detail="Beneficiario no encontrado")

    update_data = data.model_dump()
    for key, value in update_data.items():
        setattr(beneficiario, key, value)

    db.commit()
    db.refresh(beneficiario)
    return beneficiario


@router.delete("/{beneficiario_id}")
def eliminar_beneficiario(beneficiario_id: int, db: Session = Depends(get_db)):
    beneficiario = db.query(Beneficiario).filter(Beneficiario.id == beneficiario_id).first()
    if not beneficiario:
        raise HTTPException(status_code=404, detail="Beneficiario no encontrado")
    db.delete(beneficiario)
    db.commit()
    return {"message": "Beneficiario eliminado"}
