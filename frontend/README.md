# 💻 Frontend - Software de Contabilidad y Gestión Fiscal Online

Cliente Web SPA desarrollado con **React 18**, **Vite 8** y **Vanilla CSS** (arquitectura modular por dominios de negocio).

Para ver la documentación completa y detallada de todo el proyecto, consulta el [README Principal](../../README.md).

---

## 📁 Estructura del Frontend (`src/`)

```text
src/
├── main.jsx                     # Punto de entrada React (renderiza App en root)
├── App.jsx                      # Layout principal y enrutador de módulos
├── App.css                      # Estilos de la página de inicio y configuración
├── index.css                    # Sistema de diseño, variables CSS y estilos globales
│
├── shared/                      # Componentes y contextos reutilizables en toda la app
│   ├── components/              # Modal.jsx (Modal.css), Sidebar.jsx (Sidebar.css)
│   ├── context/                 # ToastContext.jsx, Toast.css (notificaciones globales)
│   ├── hooks/                   # useToast.jsx
│   └── utils/                   # fileDownloader.js (descargas binarias seguras)
│
├── modules/                     # Módulos de negocio aislados
│   ├── repse/                   # Módulo REPSE (ICSOE / SISUB)
│   │   ├── RepseModule.jsx      # Contenedor con barra de navegación de pestañas
│   │   ├── RepseModule.css      # Estilos del encabezado, badges y contenedor REPSE
│   │   ├── repse.css            # Estilos de formularios, tablas, badges y tarjetas REPSE
│   │   ├── context/             # RepseContext.jsx (cuatrimestre activo)
│   │   ├── hooks/               # useAsociarContratos.js (lógica de negocio)
│   │   ├── components/asociar/  # Modales de asignación
│   │   ├── tabs/                # Pestañas individuales (Inicio, Contratos, etc.)
│   │   └── services/            # repseApi.js
│   │
│   └── projects/                # Módulo Tableros de Proyectos (tipo Monday)
│       ├── ProjectsPage.jsx     # Vista principal de tableros
│       ├── projects.css         # Estilos de tableros, columnas interactivas y 13 tipos de celda
│       ├── components/          # BoardView.jsx, CellRenderer.jsx
│       └── services/            # projectsApi.js
│
└── services/
    ├── api.js                   # Cliente HTTP base (Fetch wrapper)
    └── api.test.js              # Suite de pruebas unitarias (Vitest)
```

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con recarga en vivo (puerto 5173)
npm run dev

# Ejecutar pruebas unitarias (Vitest)
npm test

# Compilar para producción (carpeta dist/)
npm run build
```
