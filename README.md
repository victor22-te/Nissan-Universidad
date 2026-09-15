# Nissan Universidad - ERP

Plataforma integral (ERP) desarrollada para la gestión académica y operativa de Nissan Universidad. El sistema está diseñado con una arquitectura cliente-servidor, separando claramente el Frontend (React/Vite) del Backend (FastAPI).

## Arquitectura

- **Frontend (`/frontend`)**: Aplicación Single Page Application (SPA) en React 18 con Vite. Interfaz premium con tema Glassmorphism adaptativo (Dark/Light mode).
- **Backend (`/backend`)**: API RESTful construida con FastAPI y Python 3.12. Base de datos SQLite (`nissan_erp.db`) gestionada con SQLAlchemy y migraciones automáticas.
- **Autenticación**: JWT con contraseñas encriptadas nativamente mediante `bcrypt`.

## Ejecución Local (Docker)

El proyecto está 100% dockerizado para asegurar paridad de desarrollo. Para levantar todo el entorno de desarrollo (Backend y Frontend simultáneamente), asegúrate de tener Docker instalado y ejecuta en la raíz del proyecto:

```bash
docker compose up -d --build
```

Para detener el sistema se puede usar:

```bash
docker compose down
```

Para ver los logs del sistema se puede usar:

```bash
docker compose logs -f
```


El orquestador levantará:
- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:5173

Los contenedores cuentan con volúmenes montados, por lo que cualquier cambio en el código se reflejará instantáneamente sin necesidad de reiniciar.

## Credenciales Base
En el arranque, el sistema crea un usuario root por defecto:
- **Correo**: victor22skate@gmail.com
- **Contraseña**: Kenny_002
