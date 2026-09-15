"""
Router agregador para el Módulo de Gestión REPSE.
Unifica todos los sub-routers del dominio manteniendo exactamente los mismos prefijos URL.
"""
from fastapi import APIRouter
from .routes import (
    cuatrimestres,
    contratos,
    objetos_contables,
    beneficiarios,
    empleados,
    asociaciones,
    reportes,
)

repse_router = APIRouter()

# Registrar cada uno de los sub-routers del dominio REPSE
repse_router.include_router(cuatrimestres.router)
repse_router.include_router(contratos.router)
repse_router.include_router(objetos_contables.router)
repse_router.include_router(beneficiarios.router)
repse_router.include_router(empleados.router)
repse_router.include_router(asociaciones.router)
repse_router.include_router(reportes.router)
