"""
Modelos de base de datos para el sistema ERP.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database import Base

# ─────────────────────────────────────────────────────────────
# Tabla de Usuarios
# ─────────────────────────────────────────────────────────────
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column(String(300), nullable=False)
    is_root = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
