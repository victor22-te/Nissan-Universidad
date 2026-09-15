"""
Configuración de la base de datos SQLAlchemy.
Para desarrollo se usa SQLite. En producción se puede cambiar a PostgreSQL
cambiando solo la variable DATABASE_URL.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Para producción, cambiar a PostgreSQL:
# DATABASE_URL = "postgresql://user:password@host:5432/nissan_erp"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nissan_erp.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency para obtener sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
