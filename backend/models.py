"""
Modelos de base de datos para el sistema REPSE.
Define las tablas: Cuatrimestre, Contrato, ObjetoContable, Beneficiario, Empleado
y las tablas de asociación.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Date, Text, JSON,
    ForeignKey, Table, DateTime, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# ─────────────────────────────────────────────────────────────
# Tabla de asociación: Contrato <-> ObjetoContable
# ─────────────────────────────────────────────────────────────
contrato_objeto = Table(
    "contrato_objeto",
    Base.metadata,
    Column("contrato_id", Integer, ForeignKey("contratos.id"), primary_key=True),
    Column("objeto_contable_id", Integer, ForeignKey("objetos_contables.id"), primary_key=True),
)

# ─────────────────────────────────────────────────────────────
# Tabla de asociación: Contrato <-> Beneficiario
# ─────────────────────────────────────────────────────────────
contrato_beneficiario = Table(
    "contrato_beneficiario",
    Base.metadata,
    Column("contrato_id", Integer, ForeignKey("contratos.id"), primary_key=True),
    Column("beneficiario_id", Integer, ForeignKey("beneficiarios.id"), primary_key=True),
)

# ─────────────────────────────────────────────────────────────
# Tabla de asociación: Contrato <-> Empleado
# ─────────────────────────────────────────────────────────────
contrato_empleado = Table(
    "contrato_empleado",
    Base.metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("contrato_id", Integer, ForeignKey("contratos.id")),
    Column("empleado_id", Integer, ForeignKey("empleados.id")),
    Column("modo", String(20), default="manual"),  # "manual" o "xml"
)


class Cuatrimestre(Base):
    """Período cuatrimestral de trabajo."""
    __tablename__ = "cuatrimestres"

    id = Column(Integer, primary_key=True, index=True)
    anio = Column(Integer, nullable=False)
    periodo = Column(Integer, nullable=False)  # 1=Ene-Abr, 2=May-Ago, 3=Sep-Dic
    nombre = Column(String(50), nullable=False)  # Ej: "Enero - Abril 2026"
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    contratos = relationship("Contrato", back_populates="cuatrimestre", cascade="all, delete-orphan")
    objetos_contables = relationship("ObjetoContable", back_populates="cuatrimestre", cascade="all, delete-orphan")
    beneficiarios = relationship("Beneficiario", back_populates="cuatrimestre", cascade="all, delete-orphan")
    empleados = relationship("Empleado", back_populates="cuatrimestre", cascade="all, delete-orphan")


class Contrato(Base):
    """Contrato de servicios especializados u obras especializadas."""
    __tablename__ = "contratos"

    id = Column(Integer, primary_key=True, index=True)
    cuatrimestre_id = Column(Integer, ForeignKey("cuatrimestres.id"), nullable=False)
    numero_contrato = Column(String(100), nullable=False)
    monto = Column(Float, nullable=False)
    trabajadores_estimados = Column(Integer, nullable=False)
    vigencia = Column(String(200), nullable=True)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cuatrimestre = relationship("Cuatrimestre", back_populates="contratos")
    objetos_contables = relationship("ObjetoContable", secondary=contrato_objeto, back_populates="contratos")
    beneficiarios = relationship("Beneficiario", secondary=contrato_beneficiario, back_populates="contratos")
    empleados = relationship("Empleado", secondary=contrato_empleado, back_populates="contratos")


class ObjetoContable(Base):
    """Objeto de contrato (ej: Construcción Hospital Juan Diego)."""
    __tablename__ = "objetos_contables"

    id = Column(Integer, primary_key=True, index=True)
    cuatrimestre_id = Column(Integer, ForeignKey("cuatrimestres.id"), nullable=False)
    descripcion = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cuatrimestre = relationship("Cuatrimestre", back_populates="objetos_contables")
    contratos = relationship("Contrato", secondary=contrato_objeto, back_populates="objetos_contables")


class Beneficiario(Base):
    """Beneficiario del contrato (datos del cliente)."""
    __tablename__ = "beneficiarios"

    id = Column(Integer, primary_key=True, index=True)
    cuatrimestre_id = Column(Integer, ForeignKey("cuatrimestres.id"), nullable=False)
    razon_social = Column(String(300), nullable=False)
    rfc = Column(String(13), nullable=False)
    registro_patronal = Column(String(20), nullable=False)
    correo = Column(String(200), nullable=True)
    telefono = Column(String(20), nullable=True)
    estado = Column(String(100), nullable=True)
    municipio = Column(String(200), nullable=True)
    cp = Column(String(10), nullable=True)
    colonia = Column(String(200), nullable=True)
    calle = Column(String(300), nullable=True)
    num_exterior = Column(String(20), nullable=True)
    num_interior = Column(String(20), nullable=True)
    entre_calle_1 = Column(String(300), nullable=True)
    entre_calle_2 = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cuatrimestre = relationship("Cuatrimestre", back_populates="beneficiarios")
    contratos = relationship("Contrato", secondary=contrato_beneficiario, back_populates="beneficiarios")


class Empleado(Base):
    """Empleado registrado (puede ser manual o desde XML de nómina)."""
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)
    cuatrimestre_id = Column(Integer, ForeignKey("cuatrimestres.id"), nullable=False)
    rfc = Column(String(13), nullable=False)
    curp = Column(String(18), nullable=False)
    nombre = Column(String(300), nullable=False)
    nss = Column(String(15), nullable=False)  # Número de Seguridad Social
    # Datos de nómina del XML (se guardan pero no se muestran en la interfaz)
    datos_nomina = Column(JSON, nullable=True)
    origen = Column(String(20), default="manual")  # "manual" o "xml"
    salario_base_cotizacion = Column(Float, nullable=True, default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cuatrimestre = relationship("Cuatrimestre", back_populates="empleados")
    contratos = relationship("Contrato", secondary=contrato_empleado, back_populates="empleados")


# ═════════════════════════════════════════════════════════════
# Módulo de Gestión de Proyectos (estilo Monday)
# ═════════════════════════════════════════════════════════════

class ProjectBoard(Base):
    """Tablero de proyecto."""
    __tablename__ = "project_boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, default="")
    color = Column(String(20), default="#3b82f6")
    created_at = Column(DateTime, default=datetime.utcnow)

    groups = relationship("ProjectGroup", back_populates="board", cascade="all, delete-orphan", order_by="ProjectGroup.position")
    columns = relationship("ProjectColumn", back_populates="board", cascade="all, delete-orphan", order_by="ProjectColumn.position")


class ProjectGroup(Base):
    """Grupo dentro de un tablero."""
    __tablename__ = "project_groups"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("project_boards.id"), nullable=False)
    name = Column(String(300), nullable=False)
    color = Column(String(20), default="#3b82f6")
    collapsed = Column(Boolean, default=False)
    position = Column(Integer, default=0)

    board = relationship("ProjectBoard", back_populates="groups")
    items = relationship("ProjectItem", back_populates="group", cascade="all, delete-orphan", order_by="ProjectItem.position")


class ProjectColumn(Base):
    """Definición de columna en un tablero."""
    __tablename__ = "project_columns"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("project_boards.id"), nullable=False)
    title = Column(String(200), nullable=False)
    column_type = Column(String(30), nullable=False)
    settings = Column(JSON, default={})
    width = Column(Integer, default=150)
    position = Column(Integer, default=0)

    board = relationship("ProjectBoard", back_populates="columns")


class ProjectItem(Base):
    """Item (fila) dentro de un grupo."""
    __tablename__ = "project_items"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("project_groups.id"), nullable=False)
    name = Column(String(500), nullable=False)
    column_values = Column(JSON, default={})
    position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("ProjectGroup", back_populates="items")
    subitems = relationship("ProjectSubItem", back_populates="item", cascade="all, delete-orphan", order_by="ProjectSubItem.position")


class ProjectSubItem(Base):
    """Sub-item dentro de un item."""
    __tablename__ = "project_subitems"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("project_items.id"), nullable=False)
    name = Column(String(500), nullable=False)
    column_values = Column(JSON, default={})
    position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("ProjectItem", back_populates="subitems")
