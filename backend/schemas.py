"""
Esquemas Pydantic para validación de datos de entrada/salida.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date, datetime


# ─────────────────────────────────────────────────────────────
# Cuatrimestre
# ─────────────────────────────────────────────────────────────
class CuatrimestreCreate(BaseModel):
    anio: int = Field(..., ge=2020, le=2050)
    periodo: int = Field(..., ge=1, le=3)

class CuatrimestreOut(BaseModel):
    id: int
    anio: int
    periodo: int
    nombre: str
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Contrato
# ─────────────────────────────────────────────────────────────
class ContratoCreate(BaseModel):
    cuatrimestre_id: int
    numero_contrato: str
    monto: float
    trabajadores_estimados: int
    vigencia: Optional[str] = None
    fecha_inicio: date
    fecha_fin: date

class ContratoUpdate(BaseModel):
    numero_contrato: Optional[str] = None
    monto: Optional[float] = None
    trabajadores_estimados: Optional[int] = None
    vigencia: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class ContratoOut(BaseModel):
    id: int
    cuatrimestre_id: int
    numero_contrato: str
    monto: float
    trabajadores_estimados: int
    vigencia: Optional[str]
    fecha_inicio: date
    fecha_fin: date
    created_at: datetime
    objetos_contables: List["ObjetoContableOut"] = []
    beneficiarios: List["BeneficiarioOut"] = []
    empleados: List["EmpleadoOut"] = []

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Objeto Contable
# ─────────────────────────────────────────────────────────────
class ObjetoContableCreate(BaseModel):
    cuatrimestre_id: int
    descripcion: str

class ObjetoContableOut(BaseModel):
    id: int
    cuatrimestre_id: int
    descripcion: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Beneficiario
# ─────────────────────────────────────────────────────────────
class BeneficiarioCreate(BaseModel):
    cuatrimestre_id: int
    razon_social: str
    rfc: str
    registro_patronal: str
    correo: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[str] = None
    municipio: Optional[str] = None
    cp: Optional[str] = None
    colonia: Optional[str] = None
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    entre_calle_1: Optional[str] = None
    entre_calle_2: Optional[str] = None

class BeneficiarioOut(BaseModel):
    id: int
    cuatrimestre_id: int
    razon_social: str
    rfc: str
    registro_patronal: str
    correo: Optional[str]
    telefono: Optional[str]
    estado: Optional[str]
    municipio: Optional[str]
    cp: Optional[str]
    colonia: Optional[str]
    calle: Optional[str]
    num_exterior: Optional[str]
    num_interior: Optional[str]
    entre_calle_1: Optional[str]
    entre_calle_2: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Empleado
# ─────────────────────────────────────────────────────────────
class EmpleadoCreate(BaseModel):
    cuatrimestre_id: int
    rfc: str
    curp: str
    nombre: str
    nss: str
    datos_nomina: Optional[Any] = None
    origen: str = "manual"
    salario_base_cotizacion: Optional[float] = 0.00

class EmpleadoOut(BaseModel):
    id: int
    cuatrimestre_id: int
    rfc: str
    curp: str
    nombre: str
    nss: str
    origen: str
    salario_base_cotizacion: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Asociaciones
# ─────────────────────────────────────────────────────────────
class AsociarObjetoRequest(BaseModel):
    contrato_id: int
    objeto_contable_id: int

class AsociarBeneficiarioRequest(BaseModel):
    contrato_id: int
    beneficiario_id: int

class AsociarEmpleadoRequest(BaseModel):
    contrato_id: int
    empleado_id: int
    modo: str = "manual"  # "manual" o "xml"


# Resolver forward references
ContratoOut.model_rebuild()
