# Estructura del Proyecto: Online Fiscal

Este documento define la arquitectura y la estructura de directorios del proyecto **Online Fiscal**. El objetivo de esta guía es asegurar que el proyecto se mantenga organizado y escalable a medida que crece.

Actualmente el sistema cuenta con el módulo **REPSE**, pero en el futuro se agregarán módulos como un entorno **tipo Notion** y módulos de **Contabilidad (Contalink)**. 

Para que los equipos puedan colaborar sin conflictos, **cada desarrollador debe trabajar exclusivamente dentro del alcance de su módulo asignado** siguiendo estas directrices.

---

## 🏗️ Arquitectura General

El proyecto está dividido en dos partes principales:
1. **Frontend**: Aplicación en React (Vite) en la carpeta `/frontend`.
2. **Backend**: API RESTful en Python (FastAPI) en la carpeta `/backend`.

Se utiliza un enfoque modular. Cada gran funcionalidad del negocio (REPSE, Notion, Contabilidad) se considera un **"Módulo"**. Los módulos deben ser independientes en la medida de lo posible.

---

## 📂 1. Estructura del Backend (FastAPI)

Ubicación: `/backend`

```text
backend/
├── main.py               # Punto de entrada de la aplicación. Registro de routers.
├── database.py           # Configuración de conexión a la base de datos.
├── models.py             # Modelos ORM (SQLAlchemy) - *Se recomienda separar por módulo en el futuro*.
├── schemas.py            # Esquemas Pydantic para validación de datos.
└── routes/               # Rutas (Endpoints) agrupadas por módulo
    ├── repse.py          # Endpoints exclusivos del módulo REPSE
    ├── notion.py         # Endpoints para el futuro módulo tipo Notion (Ejemplo)
    └── contalink.py      # Endpoints para el módulo de Contabilidad (Ejemplo)
```

### Reglas para desarrolladores en el Backend:
- **Nuevos Endpoints**: Si estás trabajando en el módulo "Contabilidad", tus endpoints deben ir en `routes/contalink.py` o `routes/contabilidad.py`. NO modifiques `repse.py` a menos que sea estrictamente necesario.
- **Registro de Rutas**: Agrega el router de tu nuevo módulo en `main.py` usando `app.include_router()`.
- **Modelos y Esquemas**: Añade tus modelos en `models.py` y esquemas en `schemas.py`. Asegúrate de nombrar las clases claramente indicando a qué módulo pertenecen (ej. `RepseContrato`, `ContalinkFactura`), o bien, crea carpetas `/models` y `/schemas` y divídelas por archivos si los archivos actuales se vuelven muy grandes.

---

## 🎨 2. Estructura del Frontend (React)

Ubicación: `/frontend`

```text
frontend/src/
├── App.jsx               # Configuración de rutas (React Router) principal
├── index.css / App.css   # Estilos globales y tokens de diseño
├── hooks/                # Hooks personalizados globales (ej. useToast)
├── assets/               # Imágenes, íconos y otros recursos
├── components/           # Componentes UI reutilizables
│   ├── common/           # Componentes genéricos (Botones, Modales, Inputs)
│   ├── repse/            # Componentes específicos del módulo REPSE
│   ├── notion/           # Componentes específicos del módulo Notion
│   └── contalink/        # Componentes específicos de Contabilidad
├── pages/                # Vistas principales de la aplicación
│   ├── repse/            # Vistas completas de REPSE (Dashboard REPSE, etc)
│   ├── notion/           # Vistas del espacio de trabajo tipo Notion
│   └── contalink/        # Vistas de contabilidad
└── services/             # Peticiones a la API (Axios/Fetch)
    ├── repseApi.js       # Llamadas a la API del módulo REPSE
    ├── notionApi.js      # Llamadas a la API del módulo Notion
    └── contalinkApi.js   # Llamadas a la API del módulo Contalink
```

### Reglas para desarrolladores en el Frontend:
- **Separación de Responsabilidades**: Todo lo que sea exclusivo de un módulo debe ir en la carpeta de su respectivo módulo dentro de `components/`, `pages/` y `services/`.
- **Componentes Compartidos**: Si creas un componente que puede ser útil para otros módulos (ej. una tabla de datos genérica o un modal), colócalo en `components/common/`. Si es exclusivo de tu módulo (ej. `CalculadoraImpuestos`), colócalo en `components/tu_modulo/`.
- **Estado Global**: Para compartir información entre módulos (ej. Sesión del usuario), utilizar el contexto de React (Context API) en la raíz de la app.

---

## 🚀 3. Guía de Crecimiento para Nuevos Módulos

Cuando te asignen un **nuevo módulo** (por ejemplo, el entorno colaborativo tipo Notion), sigue este checklist:

1. **Backend**:
   - Crea `backend/routes/notion.py`.
   - Agrega tus modelos de base de datos a `models.py`.
   - Agrega tus modelos de validación Pydantic a `schemas.py`.
   - Incluye el router en `main.py`: `app.include_router(notion.router, prefix="/api/notion")`.

2. **Frontend**:
   - Crea una carpeta `src/pages/notion/`.
   - Crea una carpeta `src/components/notion/`.
   - Crea el archivo de servicios `src/services/notionApi.js` para tus peticiones HTTP.
   - Registra tus nuevas páginas en las rutas principales dentro de `App.jsx`.

3. **Colaboración Git**:
   - Trabaja siempre en una rama (branch) correspondiente a tu módulo/característica: `git checkout -b feature/modulo-notion`.
   - No toques el código de los otros módulos a menos que estés actualizando un componente global (en cuyo caso debes avisar al equipo).

---

## 📋 Resumen de Módulos (Actual y Futuro)

| Módulo | Estado | Descripción | Responsable / Rama |
| :--- | :--- | :--- | :--- |
| **REPSE** | 🟢 Activo | Gestión de cuatrimestres, ICSOE, SISUB, y reportes Excel. | *[Nombre/Equipo]* |
| **Notion-like** | 🟡 Planeado | Espacios de trabajo colaborativo, notas y documentos estructurados. | *[Nombre/Equipo]* |
| **Contalink** | 🟡 Planeado | Sistema integral de contabilidad, CFDI, y registro de pólizas. | *[Nombre/Equipo]* |

> **Nota para el equipo**: Seguir esta estructura evitará cuellos de botella ("merge conflicts") y permitirá que el proyecto siga siendo fácil de mantener, incluso cuando tengamos decenas de submódulos en el futuro.
