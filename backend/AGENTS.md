# Guía para Agentes de IA - Backend (FastAPI)

## Core Tecnológico
- **Framework REST**: FastAPI.
- **ORM**: SQLAlchemy.
- **Base de Datos**: SQLite (`nissan_erp.db`) como predeterminado de desarrollo.
- **Seguridad**: Autenticación Bearer (JWT) y hashing con `bcrypt`.

## Reglas de Arquitectura
1. **Modelos**: Agrupados en `models.py` (por ahora, hasta escalar, luego pasar a sus respectivas carpetas si crecen mucho).
2. **Módulos de Negocio**: Carpeta `modules/<nombre>/`. Cada módulo debe tener:
   - `router.py` (Montado en `main.py`).
   - `schemas.py` (Validación con Pydantic).
3. **Migraciones**: Si se cambian modelos, SQLAlchemy creará las tablas automáticamente en el inicio (gracias a `Base.metadata.create_all` en `main.py`).

## Seguridad
- `passlib` está prohibido por bugs de versiones. Usar `bcrypt` explícitamente.
- Todo dato entrante debe estar fuertemente tipado en un schema Pydantic.
