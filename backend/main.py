"""
Online Fiscal - Backend Principal
Sistema modular de contabilidad y gestión fiscal.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from modules.auth.router import router as auth_router, get_password_hash
from models import Usuario

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nissan ERP",
    description="Sistema de gestión Nissan Universidad",
    version="1.0.0",
)

@app.on_event("startup")
def create_initial_data():
    db = SessionLocal()
    try:
        user = db.query(Usuario).filter(Usuario.email == "victor22skate@gmail.com").first()
        if not user:
            new_user = Usuario(
                email="victor22skate@gmail.com",
                password_hash=get_password_hash("Kenny_002"),
                is_root=True
            )
            db.add(new_user)
            db.commit()
    finally:
        db.close()

# CORS para permitir peticiones desde el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
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
