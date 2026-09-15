# Nissan Universidad - ERP

Plataforma integral (ERP) desarrollada para la gestión académica y operativa de Nissan Universidad. El sistema está diseñado con una arquitectura cliente-servidor, separando claramente el Frontend (React/Vite) del Backend (FastAPI).

## Arquitectura

- **Frontend (`/frontend`)**: Aplicación Single Page Application (SPA) en React 18 con Vite. Interfaz premium con tema Glassmorphism adaptativo (Dark/Light mode).
- **Backend (`/backend`)**: API RESTful construida con FastAPI y Python 3.12. Base de datos SQLite (`nissan_erp.db`) gestionada con SQLAlchemy y migraciones automáticas.
- **Autenticación**: JWT con contraseñas encriptadas nativamente mediante `bcrypt`.

## Ejecución Local

Para levantar todo el entorno de desarrollo (Backend y Frontend simultáneamente), ejecutar en la raíz del proyecto:

```bash
./iniciar_sistema.sh
```

El script levantará el backend en el puerto `8000` y el frontend en el puerto `5173`.
* Nota: El script de Windows `iniciar_sistema.ps1` hace lo mismo para entornos PowerShell.

## Credenciales Base
En el arranque, el sistema crea un usuario root por defecto:
- **Correo**: victor22skate@gmail.com
- **Contraseña**: Kenny_002
