# 💼 Software de Contabilidad y Gestión Fiscal Online

> **Sistema web integral para la Gestión REPSE (cumplimiento normativo ICSOE / SISUB) y Gestión de Proyectos colaborativos estilo Monday.**

---

## 📋 Tabla de Contenidos

- [1. ¿Qué es este proyecto?](#1-qué-es-este-proyecto)
- [2. Guía de Inicio Rápido (Cómo correr el sistema)](#2-guía-de-inicio-rápido-cómo-correr-el-sistema)
  - [Opción A: Con Docker (Recomendado para no instalar nada)](#opción-a-con-docker-recomendado-para-no-instalar-nada)
  - [Opción B: Con Scripts Automáticos (Modo Desarrollo con Recarga en Vivo)](#opción-b-con-scripts-automáticos-modo-desarrollo-con-recarga-en-vivo)
  - [Opción C: Inicio Manual Paso a Paso](#opción-c-inicio-manual-paso-a-paso)
- [3. Arquitectura General del Sistema](#3-arquitectura-general-del-sistema)
- [4. Estructura del Proyecto: Carpeta por Carpeta y Archivo por Archivo](#4-estructura-del-proyecto-carpeta-por-carpeta-y-archivo-por-archivo)
  - [4.1 Raíz del Proyecto](#41-raíz-del-proyecto)
  - [4.2 Backend (FastAPI + SQLAlchemy + SQLite)](#42-backend-fastapi--sqlalchemy--sqlite)
  - [4.3 Frontend (React + Vite + Vanilla CSS)](#43-frontend-react--vite--vanilla-css)
- [5. Guía Práctica: "¿En qué archivo debo trabajar si quiero... ?"](#5-guía-práctica-en-qué-archivo-debo-trabajar-si-quiero-)
- [6. Reglas de Oro y Seguridad antes de hacer Commit](#6-reglas-de-oro-y-seguridad-antes-de-hacer-commit)

---

## 1. ¿Qué es este proyecto?

Este software resuelve dos grandes necesidades operativas y fiscales para empresas y despachos contables en México:

1. **Módulo REPSE (Registro de Prestadoras de Servicios Especializados u Obras Especializadas)**:
   - Permite administrar cuatrimestres fiscales.
   - Registra contratos de servicios, objetos contables, beneficiarios y empleados.
   - Permite importar masivamente empleados mediante archivos **XML de CFDI de nómina** (extrayendo automáticamente RFC, CURP, NSS, salarios y fechas).
   - Relaciona de manera visual contratos con objetos, beneficiarios y trabajadores.
   - **Genera automáticamente los reportes oficiales en Excel para el IMSS (ICSOE) y el INFONAVIT (SISUB)** con el formato y validaciones requeridas por la autoridad.

2. **Módulo de Gestión de Proyectos (Estilo Monday)**:
   - Tableros interactivos con grupos colapsables.
   - Soporta 13 tipos de columnas dinámicas: Texto, Número, Estado, Fecha, Persona, Email, Teléfono, Cronograma, Prioridad, Checkbox, Enlace, Desplegable y Calificación.
   - Sub-elementos jerárquicos (tareas anidadas) con cálculo visual en tiempo real.

---

## 2. Guía de Inicio Rápido (Cómo correr el sistema)

### Opción A: Con Docker (Recomendado para no instalar nada)
No necesitas tener Python ni Node.js instalados en tu computadora.

```bash
# 1. Clonar el repositorio y entrar a la carpeta
git clone https://github.com/victor22-te/Software-Contabilidad-Fiscal-Online.git
cd Software-Contabilidad-Fiscal-Online

# 2. Levantar los contenedores
docker compose up --build -d
```
- **Frontend Web**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

Para detener los contenedores:
```bash
docker compose down
```

---

### Opción B: Con Scripts Automáticos (Modo Desarrollo con Recarga en Vivo)
Ideal para programar día a día. Cualquier cambio que guardes en el código se reflejará al instante en el navegador (*Hot Reload*).

- **En Linux / Mac / Git Bash de Windows**:
  ```bash
  ./iniciar_sistema.sh
  ```
- **En Windows (PowerShell)**:
  ```powershell
  .\iniciar_sistema.ps1
  ```

*(El script crea el entorno virtual, instala las dependencias y levanta el backend y frontend juntos. Presiona `Ctrl + C` para apagar ambos limpiamente).*

---

### Opción C: Inicio Manual Paso a Paso

#### 1. Backend (Terminal 1):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Frontend (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Arquitectura General del Sistema

El proyecto sigue una arquitectura **Feature-First / Modular por Dominios de Negocio**:

```text
.
├── backend/                         # Servidor API REST (FastAPI + SQLAlchemy)
│   ├── database.py                  # Conexión a Base de Datos
│   ├── models.py                    # Modelos de tablas (ORM)
│   ├── services/                    # Lógica pura desacoplada (Generador de Excel)
│   └── modules/                     # Módulos de negocio (repse, projects)
│
├── frontend/                        # Cliente Web SPA (React + Vite)
│   ├── src/
│   │   ├── modules/                 # Módulos de negocio (repse, projects)
│   │   ├── shared/                  # Componentes y contextos compartidos
│   │   └── App.jsx                  # Enrutador principal y Sidebar
│
├── iniciar_sistema.sh               # Lanzador Linux / Git Bash
├── iniciar_sistema.ps1              # Lanzador Windows PowerShell
├── docker-compose.yml               # Orquestador Docker
└── AGENTS.md                        # Reglas estrictas de seguridad y arquitectura
```

---

## 4. Estructura del Proyecto: Carpeta por Carpeta y Archivo por Archivo

A continuación se explica **cada archivo existente en el repositorio** para que cualquier integrante del equipo sepa exactamente su función:

---

### 4.1 Raíz del Proyecto

| Archivo / Carpeta | ¿Qué es y para qué sirve? |
| :--- | :--- |
| **`docker-compose.yml`** | Archivo de configuración de Docker Compose. Conecta el contenedor de Backend (FastAPI) y el de Frontend (Nginx), mapea los puertos `8000` y `5173` y asegura que la base de datos `online_fiscal.db` se guarde en tu máquina física sin perderse. |
| **`iniciar_sistema.sh`** | Script ejecutable para Linux / Mac / Git Bash. Detecta el entorno virtual de Python, instala dependencias si faltan, arranca Frontend y Backend en paralelo, y con `Ctrl + C` apaga ambos liberando los puertos. |
| **`iniciar_sistema.ps1`** | Script ejecutable para Windows PowerShell con la misma funcionalidad que el script bash. |
| **`instalar_docker.sh`** | Script auxiliar para instalar Docker y Docker Compose automáticamente en distribuciones Ubuntu / Debian. |
| **`AGENTS.md`** | Guía de reglas globales de seguridad, arquitectura y estándares para desarrolladores y asistentes de inteligencia artificial. |
| **`audit.md`** | Documento de registro y seguimiento de mejoras técnicas de auditoría en el código. |
| **`.dockerignore`** | Evita que carpetas pesadas como `node_modules` o entornos virtuales `.venv` se copien innecesariamente al construir imágenes Docker. |
| **`plantilla_carga_trabajadores.xlsm`** | Archivo plantilla de Excel para captura y carga masiva de trabajadores. |

---

### 4.2 Backend (FastAPI + SQLAlchemy + SQLite)

Ubicado en `backend/`. Proporciona la API REST que almacena los datos y genera los archivos Excel descargables.

```text
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── AGENTS.md
├── services/
│   └── excel_builder.py
└── modules/
    ├── repse/
    │   ├── __init__.py
    │   ├── router.py
    │   └── routes/
    │       ├── cuatrimestres.py
    │       ├── contratos.py
    │       ├── beneficiarios.py
    │       ├── objetos_contables.py
    │       ├── empleados.py
    │       ├── asociaciones.py
    │       └── reportes.py
    └── projects/
        ├── __init__.py
        ├── router.py
        └── schemas.py
```

#### Detalle de archivos en `backend/`:

| Archivo | Función y Cuándo Modificarlo |
| :--- | :--- |
| **`main.py`** | **Punto de entrada de la API.** Configura FastAPI, los permisos de CORS para que React pueda conectarse y monta los routers principales de cada módulo (`repse_router` y `projects_router`). *Modifícalo solo si agregas un nuevo módulo de negocio completo o nuevos middlewares globales.* |
| **`database.py`** | Configura la conexión a la base de datos SQLAlchemy (`sqlite:///./online_fiscal.db`) y la función `get_db()` que inyecta la sesión de base de datos en cada endpoint. |
| **`models.py`** | **Estructura de las tablas de la base de datos.** Contiene las clases de SQLAlchemy: `Cuatrimestre`, `Contrato`, `ObjetoContable`, `Beneficiario`, `Empleado`, `ProjectBoard`, `ProjectGroup`, `ProjectColumn`, `ProjectItem`, `ProjectSubItem` y las tablas intermedias de relación. *Modifícalo si necesitas agregar columnas o tablas nuevas.* |
| **`schemas.py`** | Schemas Pydantic generales para validar datos de entrada y salida (DTOs) en las peticiones HTTP. |
| **`requirements.txt`** | Lista de librerías de Python requeridas (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `openpyxl`, `lxml`, etc.). *Si instalas una librería nueva con pip, agrégala aquí.* |
| **`Dockerfile`** | Instrucciones para empaquetar el backend en un contenedor Docker con Python 3.12 Slim. |
| **`services/excel_builder.py`** | **Servicio constructor de hojas Excel.** Contiene la clase `ExcelReportBuilder` que aplica formatos corporativos, fuentes blancas, fondos azul marino, bordes y anchos de columna automáticos para los reportes de ICSOE y SISUB utilizando `openpyxl`. *Modifícalo si cambias el formato visual o las columnas de los reportes Excel.* |
| **`modules/repse/router.py`** | Router agregador de REPSE. Unifica todas las rutas de contratos, beneficiarios, empleados y reportes bajo el módulo REPSE. |
| **`modules/repse/routes/cuatrimestres.py`** | Endpoints para crear, listar y eliminar periodos cuatrimestrales (ej: 2024-1, 2024-2). |
| **`modules/repse/routes/contratos.py`** | Endpoints para crear, editar, listar y eliminar contratos con carga optimizada de relaciones (`joinedload`). |
| **`modules/repse/routes/objetos_contables.py`** | Endpoints CRUD para los objetos o servicios especializados del contrato. |
| **`modules/repse/routes/beneficiarios.py`** | Endpoints CRUD para los clientes o empresas beneficiarias del servicio. |
| **`modules/repse/routes/empleados.py`** | Endpoints CRUD para empleados y el endpoint de **carga masiva de XMLs de nómina CFDI** con parsing automático de RFC, CURP y NSS. |
| **`modules/repse/routes/asociaciones.py`** | Endpoints para asociar y desasociar contratos con sus respectivos objetos, beneficiarios y empleados. |
| **`modules/repse/routes/reportes.py`** | Endpoints que consultan la base de datos y utilizan `ExcelReportBuilder` para devolver los archivos binarios `.xlsx` descargables de ICSOE, SISUB Contratos y SISUB Trabajadores. |
| **`modules/projects/router.py`** | Endpoints completos para la gestión de tableros estilo Monday: crear tableros, grupos, columnas dinámicas, items y subitems. |
| **`modules/projects/schemas.py`** | Validaciones Pydantic específicas para los tableros de proyectos (`BoardCreate`, `ColumnCreate`, `ItemUpdate`, etc.). |

---

### 4.3 Frontend (React + Vite + Vanilla CSS)

Ubicado en `frontend/`. Es la interfaz de usuario interactiva y responsiva.

```text
frontend/src/
├── main.jsx
├── App.jsx
├── App.css
├── index.css
│
├── shared/                          # Capa Compartida Global
│   ├── components/
│   │   ├── Modal.jsx                # Ventana modal reutilizable
│   │   ├── Modal.css                # Estilos del componente Modal
│   │   ├── Sidebar.jsx              # Barra lateral de navegación
│   │   └── Sidebar.css              # Estilos de la barra lateral
│   ├── context/
│   │   ├── ToastContext.jsx         # Notificaciones Toast globales
│   │   └── Toast.css                # Estilos y animaciones del Toast
│   ├── hooks/
│   │   └── useToast.jsx
│   └── utils/
│       └── fileDownloader.js        # Descargador universal de archivos blob
│
├── modules/
│   ├── repse/                       # Módulo Gestión REPSE
│   │   ├── RepseModule.jsx          # Contenedor con barra de pestañas
│   │   ├── RepseModule.css          # Estilos del encabezado y contenedor REPSE
│   │   ├── repse.css                # Estilos globales de tablas, tarjetas y formularios REPSE
│   │   ├── context/
│   │   │   └── RepseContext.jsx     # Guarda el cuatrimestre seleccionado
│   │   ├── hooks/
│   │   │   └── useAsociarContratos.js # Lógica de asociaciones
│   │   ├── components/asociar/      # Modales de selección
│   │   │   ├── ModalAsociarObjeto.jsx
│   │   │   ├── ModalAsociarBeneficiario.jsx
│   │   │   └── ModalAsociarEmpleado.jsx
│   │   ├── tabs/                    # Vistas de cada pestaña
│   │   │   ├── InicioTab.jsx
│   │   │   ├── ContratosTab.jsx
│   │   │   ├── ObjetosTab.jsx
│   │   │   ├── BeneficiariosTab.jsx
│   │   │   ├── EmpleadosTab.jsx
│   │   │   ├── AsociarTab.jsx
│   │   │   └── ReportesTab.jsx
│   │   └── services/
│   │       └── repseApi.js          # Llamadas HTTP a endpoints de REPSE
│   │
│   └── projects/                    # Módulo Gestión de Proyectos
│       ├── ProjectsPage.jsx         # Vista principal de tableros
│       ├── projects.css             # Estilos de tableros, columnas y 13 tipos de celda
│       ├── components/
│       │   ├── BoardView.jsx        # Renderizado de grupos, filas y columnas
│       │   └── CellRenderer.jsx     # Renderizado de los 13 tipos de celda
│       └── services/
│           └── projectsApi.js       # Llamadas HTTP a endpoints de proyectos
│
└── services/
    ├── api.js                       # Cliente HTTP base (Fetch wrapper)
    └── api.test.js                  # Suite de pruebas unitarias (Vitest)
```

#### Detalle de archivos en `frontend/`:

| Archivo | Función y Cuándo Modificarlo |
| :--- | :--- |
| **`index.html`** | Página HTML principal donde se monta la aplicación React. Contiene el título de la pestaña y fuentes. |
| **`vite.config.js`** | Configuración del empaquetador Vite y entorno de pruebas Vitest. |
| **`package.json`** | Lista de paquetes y scripts de Node.js (`dev`, `build`, `test`, `lint`). |
| **`src/index.css`** | **Sistema de diseño y estilos globales.** Contiene las variables CSS de color (`--bg-primary`, `--accent`, `--text-primary`, `--border`), modo oscuro/claro y clases utilitarias. *Modifícalo si quieres cambiar los colores o tipografía de toda la aplicación.* |
| **`src/App.jsx`** | **Componente raíz y enrutador.** Conecta el `Sidebar` con la vista activa (`repse` o `projects`) y envuelve la aplicación en el `ToastProvider`. |
| **`src/shared/components/Sidebar.jsx`** | Menú lateral colapsable con logotipo, accesos directos a módulos e indicador de estado de la API. |
| **`src/shared/components/Modal.jsx`** | Componente de ventana modal genérica y accesible (se cierra con la tecla `Escape` o clic afuera). |
| **`src/shared/context/ToastContext.jsx`** | **Contexto global de notificaciones.** Permite mostrar mensajes verdes de éxito o rojos de error desde cualquier lugar llamando a `addToast('Mensaje', 'success')`. |
| **`src/shared/utils/fileDownloader.js`** | Función auxiliar para descargar en el navegador los archivos binarios de Excel recibidos de la API. |
| **`src/modules/repse/RepseModule.jsx`** | Contenedor del módulo REPSE. Renderiza la barra superior de pestañas (Inicio, Contratos, Objetos, Beneficiarios, Empleados, Asociar, Reportes) y envuelve todo en `RepseProvider`. |
| **`src/modules/repse/context/RepseContext.jsx`** | Estado global de REPSE. Almacena qué cuatrimestre está seleccionado y proporciona la función `useRepse()` para que todas las pestañas sincronicen sus datos sin tener que pasarse props. |
| **`src/modules/repse/tabs/InicioTab.jsx`** | Pantalla de bienvenida, selección y creación de cuatrimestres fiscales. |
| **`src/modules/repse/tabs/ContratosTab.jsx`** | Formulario y tabla para dar de alta y administrar contratos del cuatrimestre. |
| **`src/modules/repse/tabs/ObjetosTab.jsx`** | Formulario y listado de objetos y actividades de subcontratación. |
| **`src/modules/repse/tabs/BeneficiariosTab.jsx`** | Catálogo de clientes con razón social, RFC, registro patronal y domicilio fiscal. |
| **`src/modules/repse/tabs/EmpleadosTab.jsx`** | Gestión de trabajadores con alta manual y botón para **arrastrar y procesar archivos XML de nómina masivamente**. |
| **`src/modules/repse/tabs/AsociarTab.jsx`** | Vista visual de tarjetas por contrato para vincular objetos, clientes y empleados. |
| **`src/modules/repse/tabs/ReportesTab.jsx`** | Vista con tarjetas de descarga directa de los reportes oficiales en Excel (ICSOE, SISUB Contratos, SISUB Trabajadores). |
| **`src/modules/projects/ProjectsPage.jsx`** | Vista principal de gestión de tableros de proyectos estilo Monday. |
| **`src/modules/projects/components/BoardView.jsx`** | Renderiza la tabla de tablero con grupos colapsables, items, cálculo de totales y drag/drop. |
| **`src/modules/projects/components/CellRenderer.jsx`** | Renderiza de forma interactiva los 13 tipos de columna (selectores de estado, fecha con calendario, prioridades con colores, calificaciones de estrellas, etc.). |
| **`src/services/api.js`** | Wrapper base para realizar peticiones HTTP `GET`, `POST`, `PUT`, `DELETE` hacia FastAPI con manejo centralizado de errores. |
| **`src/services/api.test.js`** | Suite de pruebas automatizadas con Vitest que verifica el correcto funcionamiento del cliente HTTP y descargas. |

---

## 5. Guía Práctica: "¿En qué archivo debo trabajar si quiero... ?"

### Caso 1: Quiero agregar un campo nuevo a los Contratos (ejemplo: "Moneda USD/MXN")
1. **En Backend**:
   - Agrega la columna en [`backend/models.py`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/backend/models.py) dentro de la clase `Contrato`.
   - Agrega el campo en los schemas de [`backend/schemas.py`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/backend/schemas.py) (`ContratoCreate`, `ContratoUpdate`, `ContratoOut`).
2. **En Frontend**:
   - Agrega el input en el formulario de [`frontend/src/modules/repse/tabs/ContratosTab.jsx`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/frontend/src/modules/repse/tabs/ContratosTab.jsx) y la columna en la tabla.

### Caso 2: Quiero cambiar los colores o estilos de la aplicación
- Abre [`frontend/src/index.css`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/frontend/src/index.css) y ajusta las variables CSS principales:
  - Color de acento/botones: `--accent` y `--accent-hover`.
  - Fondos: `--bg-primary` y `--bg-card`.
  - Textos: `--text-primary` y `--text-secondary`.

### Caso 3: Quiero modificar los encabezados o colores de los reportes Excel descargables
- Abre [`backend/services/excel_builder.py`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/backend/services/excel_builder.py) y edita los métodos `build_icsoe()`, `build_sisub_contratos()` o `build_sisub_trabajadores()`.

### Caso 4: Quiero agregar un MÓDULO NUEVO (ejemplo: "Facturación")
1. **Backend**:
   - Crea la carpeta `backend/modules/facturacion/` con su `router.py`.
   - Regístralo en [`backend/main.py`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/backend/main.py) con `app.include_router(facturacion_router)`.
2. **Frontend**:
   - Crea la carpeta `frontend/src/modules/facturacion/` con su componente principal `FacturacionPage.jsx`.
   - Agrega la opción al menú en [`frontend/src/shared/components/Sidebar.jsx`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/frontend/src/shared/components/Sidebar.jsx).
   - Monta la vista en [`frontend/src/App.jsx`](file:///home/spider-man/Repos/Software-Contabilidad-Fiscal-Online/frontend/src/App.jsx).

---

## 6. Reglas de Oro y Seguridad antes de hacer Commit

Para mantener el código limpio y seguro, antes de enviar cambios con `git push`, ejecuta siempre:

```bash
# 1. Probar que las pruebas del frontend pasen (6/6):
cd frontend && npm test

# 2. Verificar que el frontend compile sin errores de importación:
npm run build

# 3. Verificar que el backend cargue correctamente:
cd ../backend && python -c "import main; print('Backend OK')"
```

### Reglas de Seguridad Clave:
- 🔒 **No subas credenciales**: Nunca agregues contraseñas ni tokens en el código fuente. Usa variables de entorno (`.env`).
- 🛡️ **Prevención SQLi**: Usa siempre las consultas ORM de SQLAlchemy (`db.query(...)`). Nunca escribas consultas con f-strings (`f"SELECT ..."`).
- ⚡ **Anti XSS**: En React, nunca utilices `dangerouslySetInnerHTML`.
- 📦 **Manejo de Errores**: Nunca dejes un bloque `catch` vacío. Siempre usa `console.error` y avisa al usuario con `addToast(error.message, 'error')`.

---

¡Listo! Con esta guía cualquier desarrollador puede entender la arquitectura, correr el sistema en minutos y saber con exactitud qué archivo modificar. 🚀
