# Guía Global para Agentes de Inteligencia Artificial (AGENTS.md)

Este repositorio contiene el **Software de Contabilidad y Gestión Fiscal Online** (módulos principales: **Gestión REPSE** con reportes automáticos ICSOE/SISUB y **Gestión de Proyectos** estilo Monday).

Este documento establece las reglas estrictas de **Seguridad**, **Orden Arquitectónico** y **Escalabilidad** que cualquier agente de IA o desarrollador debe acatar sin excepciones al modificar este código.

---

## 1. Arquitectura del Repositorio (Feature-First / Modular por Dominios)

El proyecto está estructurado bajo un patrón modular por dominios de negocio:

```text
.
├── backend/                         # API REST (FastAPI + SQLAlchemy + Pydantic)
│   ├── modules/                     # Módulos de negocio backend (repse, projects, etc.)
│   ├── services/                    # Servicios puros desacoplados (e.g. excel_builder.py)
│   ├── database.py                  # Conexión y sesión de base de datos
│   ├── models.py                    # Modelos ORM SQLAlchemy
│   ├── main.py                      # Punto de entrada y agregador de routers
│   └── AGENTS.md                    # Reglas estrictas para desarrollo backend
│
├── frontend/                        # SPA Cliente (React + Vite + Vanilla CSS)
│   ├── src/
│   │   ├── modules/                 # Módulos de negocio frontend (repse, projects, etc.)
│   │   ├── shared/                  # Componentes, hooks, contextos y utilidades globales
│   │   └── App.jsx                  # Enrutador principal y layout
│   └── AGENTS.md                    # Reglas estrictas para desarrollo frontend
│
├── iniciar_sistema.sh               # Launcher universal para Linux / Git Bash
├── iniciar_sistema.ps1              # Launcher para PowerShell en Windows
└── audit.md                         # Registro de auditoría técnica continua
```

### Regla para Nuevos Módulos:
Si se agrega un nuevo dominio (ejemplo: `facturacion`, `nomina`, `empresa`):
1. **En Backend**: Crear `backend/modules/<nombre_modulo>/` con su propio `router.py`, `schemas.py` y sub-rutas. Montar el router en `backend/main.py`.
2. **En Frontend**: Crear `frontend/src/modules/<nombre_modulo>/` conteniendo sus `components/`, `hooks/`, `services/` y `context/` si maneja estado global propio. Registrar la ruta en `App.jsx`.

---

## 2. Reglas Estrictas de Seguridad Global (OWASP Top 10)

1. **Prevención de Pérdida Accidental de Datos**:
   - **NUNCA** ejecutar comandos SQL destructivos (`DROP TABLE`, `TRUNCATE`, o `DELETE` sin cláusula `WHERE`).
   - Proteger el archivo de base de datos local `online_fiscal.db`. Nunca sobreescribirlo ni eliminarlo sin confirmación explícita.
2. **Manejo de Secretos y Credenciales**:
   - **NUNCA** incluir contraseñas, tokens JWT, claves privadas ni cadenas de conexión hardcodeadas en el código fuente.
   - Usar siempre variables de entorno (`.env`) y verificar que `.env` esté incluido en `.gitignore`.
3. **Validación Estricta de Entradas (Boundary Layer)**:
   - Todo dato proveniente del usuario o cliente debe validarse en el backend mediante schemas Pydantic v2 antes de llegar a la base de datos o lógica de negocio.
4. **Auditoría de Vulnerabilidades en Dependencias (SCA)**:
   - En frontend: ejecutar periódicamente `npm audit` y mantener paquetes sin vulnerabilidades críticas.
   - En backend: auditar librerías con herramientas como `pip-audit` o `safety`.

---

## 3. Skills y Herramientas Recomendadas para Agentes

Cualquier agente que trabaje en este repositorio debe apoyarse en las siguientes herramientas y skills de seguridad:

| Herramienta / Skill | Propósito | Comando de Ejecución |
| :--- | :--- | :--- |
| **Semgrep** | Análisis estático de seguridad (SAST) políglota para detectar SQLi, XSS y configuraciones inseguras. | `semgrep scan --config auto` |
| **Bandit** | Auditoría estática de seguridad especializada en código Python. | `cd backend && bandit -r . -ll` |
| **pip-audit** | Detección de vulnerabilidades conocidas (CVE) en paquetes Python de `requirements.txt`. | `pip-audit -r backend/requirements.txt` |
| **npm audit** | Escaneo de vulnerabilidades en el árbol de dependencias de Node.js. | `cd frontend && npm audit` |
| **Vitest** | Suite de pruebas unitarias y de integración del frontend. | `cd frontend && npm test` |
| **Vite Build Check** | Verificación de tipos, imports y empaquetado de producción. | `cd frontend && npm run build` |

---

## 4. Convenciones de Código y Flujo de Trabajo

1. **Commits Semánticos**:
   - Formato obligatorio: `<tipo>: <descripción breve en minúsculas>`.
   - Tipos válidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
   - Ejemplo: `feat: agregar validacion de rfc en modulo repse`.
2. **Preservación de Comentarios y Funcionalidad**:
   - Respetar los comentarios existentes y la documentación de funciones (`docstrings` y `JSDoc`).
3. **Verificación Pre-Commit Obligatoria**:
   - Antes de dar por terminada una tarea, el agente debe ejecutar:
     ```bash
     cd frontend && npm test && npm run build
     cd ../backend && python -c "import main; print('Backend OK')"
     ```
   - Si cualquiera de los dos falla, el cambio **NO** está listo.
