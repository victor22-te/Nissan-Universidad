"""
Online Fiscal - Backend Principal
Sistema modular de contabilidad y gestión fiscal.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from modules.repse.router import repse_router
from modules.projects.router import router as projects_router

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Online Fiscal - REPSE",
    description="Sistema de gestión REPSE con reportes automáticos ICSOE y SISUB",
    version="1.0.0",
)

# CORS para permitir peticiones desde el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers de módulos de negocio
app.include_router(repse_router)
app.include_router(projects_router)


@app.get("/")
def root():
    return {
        "app": "Online Fiscal",
        "modulos": ["REPSE", "Projects"],
        "version": "1.0.0",
        "status": "running",
    }
