# Nissan ERP - Backend

El backend de Nissan ERP está construido con **FastAPI** y **SQLAlchemy**, utilizando SQLite (`nissan_erp.db`) como base de datos por defecto.

## Estructura Principal

- `main.py`: Archivo raíz que inicializa la aplicación FastAPI y donde se registran todas las rutas (APIs).
- `database.py`: Configura la conexión a la base de datos (Motor, Sesión base).
- `models.py`: Centraliza todos los modelos (Tablas ORM).
- `modules/`: Carpeta recomendada para módulos de negocio (Ej. `auth/`, `ventanilla_unica/`). Agrupa la lógica, esquemas y rutas.
- `routes/` / `services/`: Carpetas para enrutadores y lógica general.

## ¿Cómo crear un nuevo Endpoint/API?

A continuación se muestra un ejemplo básico para crear una nueva API y conectarla.

### 1. Definir Modelo (Opcional si usas BD)
En `models.py`:
```python
from sqlalchemy import Column, Integer, String
from database import Base

class MiTabla(Base):
    __tablename__ = "mi_tabla"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
```

### 2. Crear la Ruta
Crea tu archivo en `modules/mi_modulo/routes.py` (o en `routes/mi_ruta.py`):
```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/mi-modulo", tags=["MiModulo"])

@router.get("/saludo")
def obtener_saludo():
    return {"mensaje": "¡Hola, esta es una nueva API en el ERP de Nissan!"}
```

### 3. Registrar la Ruta en `main.py`
En `main.py`, importa tu router y agrégalo a la app:
```python
from modules.mi_modulo.routes import router as mi_modulo_router

app.include_router(mi_modulo_router)
```
