"""
Configuración de la base de datos SQLAlchemy.
Para desarrollo se usa SQLite. En producción se puede cambiar a PostgreSQL
cambiando solo la variable DATABASE_URL.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Para producción, cambiar a PostgreSQL async (asyncpg):
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nissan_erp.db")

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
Base = declarative_base()


async def get_db():
    """Dependency para obtener sesión de base de datos de forma asíncrona."""
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
