"""
Módulo de Gestión REPSE.
Contiene rutas, servicios y lógica de cuatrimestres, contratos, beneficiarios,
empleados, objetos contables, asociaciones y generación de reportes ICSOE/SISUB.
"""
from .router import repse_router

__all__ = ["repse_router"]
