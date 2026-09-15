"""
Online Fiscal - Backend Principal
Sistema modular de contabilidad y gestión fiscal.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from modules.auth.router import router as auth_router, get_password_hash
from models import Usuario
import os
from dotenv import load_dotenv
from sqlalchemy.future import select

load_dotenv()

app = FastAPI(
    title="Nissan ERP",
    description="Sistema de gestión Nissan Universidad",
    version="1.0.0",
)

@app.on_event("startup")
async def create_initial_data():
    # Crear todas las tablas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Crear datos iniciales
    async with SessionLocal() as db:
        admin_email = os.getenv("ADMIN_EMAIL", "victor22skate@gmail.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Kenny_002")
        
        result = await db.execute(select(Usuario).filter(Usuario.email == admin_email))
        user = result.scalars().first()
        
        if not user:
            from fastapi.concurrency import run_in_threadpool
            hashed_pw = await run_in_threadpool(get_password_hash, admin_password)
            new_user = Usuario(
                email=admin_email,
                password_hash=hashed_pw,
                is_root=True
            )
            db.add(new_user)
            await db.commit()

# CORS restringido para seguridad
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers de módulos de negocio
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "app": "Nissan ERP",
        "modulos": ["Auth"],
        "version": "1.0.0",
        "status": "running",
    }
