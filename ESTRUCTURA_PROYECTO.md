# Estructura del Proyecto: Nissan Universidad ERP

El proyecto se divide físicamente en dos entornos, acoplados a través de la API REST.

## 1. Root Directory

- `iniciar_sistema.sh`: Script unificado para desarrollo local.
- `online_fiscal.db`: **ELIMINADO**. Reemplazado por `nissan_erp.db`.
- `README.md`: Instrucciones principales.

## 2. Backend (`/backend`)

Entorno Python (`uv` virtualenv recomendado).

- `main.py`: Crea las tablas de BD e inicializa FastAPI.
- `database.py`: Define `engine`, `SessionLocal` y `Base`. (Apunta a `nissan_erp.db`).
- `models.py`: Modelos SQLAlchemy centralizados (Usuario, etc.).
- `requirements.txt`: Lista dependencias (`fastapi`, `sqlalchemy`, `bcrypt`, etc.).
- `modules/`:
  - `auth/`: Rutas de login y generación de tokens JWT. 
  - *(Futuros módulos: ventanilla_unica, status_vehiculo)*

## 3. Frontend (`/frontend`)

Entorno Node.js (React 18 + Vite).

- `index.html`: Punto de entrada DOM (apunta a `nissan-logo.svg`).
- `src/App.jsx`: Maneja el React Router, protegiendo las rutas con `ProtectedRoute` bajo el layout principal.
- `src/pages/`: Vistas completas (`Login.jsx`, `VentanillaUnicaPage.jsx`, `StatusVehiculoPage.jsx`).
- `src/shared/`: Componentes comunes como el `Sidebar.jsx`.
- `src/index.css`: Sistema centralizado de diseño (variables, temas, CSS Reset).
- `src/App.css`: Estilos estructurales (`.main-content-glass`).
