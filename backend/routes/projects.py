"""
Rutas del módulo de Gestión de Proyectos.
Re-exporta el router desde modules.projects para retrocompatibilidad.
"""
from modules.projects.router import router

__all__ = ["router"]
