# Guía Global para Agentes de Inteligencia Artificial (AGENTS.md)

Este repositorio contiene el **Sistema ERP de Nissan Universidad** (módulos principales por desarrollar: **Ventanilla Única** y **Status Vehículo**).

Este documento establece las reglas estrictas de **Seguridad**, **Orden Arquitectónico** y **Estilo Visual** que cualquier agente de IA o desarrollador debe acatar.

---

## 1. Arquitectura del Repositorio

El proyecto está estructurado bajo un patrón modular:

```text
.
├── backend/                         # API REST (FastAPI + SQLAlchemy + Pydantic)
│   ├── modules/                     # Módulos de negocio (auth, ventanilla_unica, etc.)
│   ├── database.py                  # Conexión SQLite (nissan_erp.db)
│   ├── models.py                    # Modelos ORM globales
│   ├── main.py                      # Punto de entrada
│   └── AGENTS.md                    # Reglas backend
│
├── frontend/                        # SPA Cliente (React + Vite + Vanilla CSS)
│   ├── src/
│   │   ├── pages/                   # Páginas principales
│   │   ├── shared/                  # Componentes y utilidades compartidas
│   │   └── App.jsx                  # Enrutador
│   └── AGENTS.md                    # Reglas frontend
│
├── iniciar_sistema.sh               # Launcher universal
└── ESTRUCTURA_PROYECTO.md           # Detalles completos
```

## 2. Reglas Estrictas de Seguridad

1. **Base de Datos**: 
   - Proteger el archivo `backend/nissan_erp.db`. 
   - Nunca ejecutar comandos destructivos sin confirmación.
2. **Autenticación**:
   - Usar `bcrypt` nativo (sin `passlib`).
   - Tokens JWT para autenticación.

## 3. Interfaz Visual (Glassmorphism)
- El frontend usa un diseño "Premium Glassmorphism" con el Hero de Nissan de fondo.
- Todo desarrollo de UI nuevo debe integrarse con las clases base de `index.css` y respetar la transparencia adaptativa de los contenedores (`.main-content-glass`, `.sidebar`).
