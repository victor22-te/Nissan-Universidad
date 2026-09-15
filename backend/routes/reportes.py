"""
Rutas para generación de reportes ICSOE y SISUB en Excel.
"""
from modules.repse.routes.reportes import router, generar_icsoe, generar_sisub_contratos, generar_sisub_trabajadores

__all__ = ["router", "generar_icsoe", "generar_sisub_contratos", "generar_sisub_trabajadores"]
