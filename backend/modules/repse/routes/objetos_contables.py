"""
Rutas para gestión de objetos contables.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ObjetoContable
from schemas import ObjetoContableCreate, ObjetoContableOut

router = APIRouter(prefix="/api/objetos-contables", tags=["Objetos Contables"])


@router.get("/cuatrimestre/{cuatrimestre_id}", response_model=list[ObjetoContableOut])
def listar_objetos(cuatrimestre_id: int, db: Session = Depends(get_db)):
    return db.query(ObjetoContable).filter(
        ObjetoContable.cuatrimestre_id == cuatrimestre_id
    ).all()


@router.post("/", response_model=ObjetoContableOut)
def crear_objeto(data: ObjetoContableCreate, db: Session = Depends(get_db)):
    obj = ObjetoContable(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{objeto_id}", response_model=ObjetoContableOut)
def actualizar_objeto(objeto_id: int, data: ObjetoContableCreate, db: Session = Depends(get_db)):
    obj = db.query(ObjetoContable).filter(ObjetoContable.id == objeto_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Objeto contable no encontrado")
    obj.descripcion = data.descripcion
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{objeto_id}")
def eliminar_objeto(objeto_id: int, db: Session = Depends(get_db)):
    obj = db.query(ObjetoContable).filter(ObjetoContable.id == objeto_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Objeto contable no encontrado")
    db.delete(obj)
    db.commit()
    return {"message": "Objeto contable eliminado"}
