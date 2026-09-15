"""
Rutas para asociar entidades a contratos.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Contrato, ObjetoContable, Beneficiario, Empleado
from schemas import AsociarObjetoRequest, AsociarBeneficiarioRequest, AsociarEmpleadoRequest

router = APIRouter(prefix="/api/asociaciones", tags=["Asociaciones"])


@router.post("/objeto")
def asociar_objeto(data: AsociarObjetoRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    objeto = db.query(ObjetoContable).filter(ObjetoContable.id == data.objeto_contable_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    if not objeto:
        raise HTTPException(status_code=404, detail="Objeto contable no encontrado")
    if objeto not in contrato.objetos_contables:
        contrato.objetos_contables.append(objeto)
        db.commit()
    return {"message": "Objeto contable asociado al contrato"}


@router.delete("/objeto")
def desasociar_objeto(data: AsociarObjetoRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    objeto = db.query(ObjetoContable).filter(ObjetoContable.id == data.objeto_contable_id).first()
    if not contrato or not objeto:
        raise HTTPException(status_code=404, detail="No encontrado")
    if objeto in contrato.objetos_contables:
        contrato.objetos_contables.remove(objeto)
        db.commit()
    return {"message": "Desasociado"}


@router.post("/beneficiario")
def asociar_beneficiario(data: AsociarBeneficiarioRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    benef = db.query(Beneficiario).filter(Beneficiario.id == data.beneficiario_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    if not benef:
        raise HTTPException(status_code=404, detail="Beneficiario no encontrado")
    if benef not in contrato.beneficiarios:
        contrato.beneficiarios.append(benef)
        db.commit()
    return {"message": "Beneficiario asociado al contrato"}


@router.delete("/beneficiario")
def desasociar_beneficiario(data: AsociarBeneficiarioRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    benef = db.query(Beneficiario).filter(Beneficiario.id == data.beneficiario_id).first()
    if not contrato or not benef:
        raise HTTPException(status_code=404, detail="No encontrado")
    if benef in contrato.beneficiarios:
        contrato.beneficiarios.remove(benef)
        db.commit()
    return {"message": "Desasociado"}


@router.post("/empleado")
def asociar_empleado(data: AsociarEmpleadoRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    empleado = db.query(Empleado).filter(Empleado.id == data.empleado_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    if empleado not in contrato.empleados:
        contrato.empleados.append(empleado)
        db.commit()
    return {"message": "Empleado asociado al contrato"}


@router.delete("/empleado")
def desasociar_empleado(data: AsociarEmpleadoRequest, db: Session = Depends(get_db)):
    contrato = db.query(Contrato).filter(Contrato.id == data.contrato_id).first()
    empleado = db.query(Empleado).filter(Empleado.id == data.empleado_id).first()
    if not contrato or not empleado:
        raise HTTPException(status_code=404, detail="No encontrado")
    if empleado in contrato.empleados:
        contrato.empleados.remove(empleado)
        db.commit()
    return {"message": "Desasociado"}
