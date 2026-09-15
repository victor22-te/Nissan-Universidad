# Guía para Agentes de Inteligencia Artificial - Frontend (React / Vite)

Este documento define los estándares arquitectónicos, reglas de seguridad y buenas prácticas de escalabilidad para el desarrollo en el directorio `frontend/`.

---

## 1. Stack Tecnológico y Herramientas

- **Librería UI**: React 18+ (Hooks, Context API, programación funcional).
- **Herramienta de Construcción**: Vite 8+ (desarrollo rápido con HMR y build optimizado con Rolldown).
- **Estilos**: Vanilla CSS modular apoyado en el sistema de diseño central de variables y tokens en `src/index.css` (con soporte completo Dark/Light mode).
- **Iconografía**: `lucide-react`.
- **Testing**: Vitest con entorno JSDOM.

---

## 2. Estructura de Directorios del Frontend (Feature-First)

```text
frontend/src/
├── main.jsx
├── App.jsx                          # Enrutador principal y layout general
├── index.css                        # Tokens de diseño globales, variables CSS y estilos base
│
├── modules/                         # Módulos de negocio independientes
│   ├── repse/                       # Dominio Gestión REPSE
│   │   ├── RepseModule.jsx          # Contenedor principal con barra de pestañas
│   │   ├── context/                 # RepseContext (cuatrimestre seleccionado y periodos)
│   │   ├── hooks/                   # Custom Hooks con lógica de negocio (useAsociarContratos)
│   │   ├── components/asociar/      # Modales y subcomponentes aislados
│   │   ├── tabs/                    # Vistas de cada pestaña (Inicio, Contratos, etc.)
│   │   └── services/                # Servicios API específicos del dominio
│   │
│   └── projects/                    # Dominio Gestión de Proyectos
│       ├── ProjectsPage.jsx         # Vista principal de tableros
│       ├── components/              # BoardView, CellRenderer (13 tipos de celdas)
│       └── services/                # projectsApi.js
│
└── shared/                          # Recursos transversales reutilizables
    ├── components/                  # Modal.jsx, Sidebar.jsx
    ├── context/                     # ToastContext.jsx (notificaciones globales)
    ├── hooks/                       # useToast.jsx
    └── utils/                       # fileDownloader.js (descarga limpia de Blobs)
```

---

## 3. Reglas Arquitectónicas Estrictas

### A. Eliminación de *Prop Drilling* (Estado Global por Contexto)
- **PROHIBIDO** pasar props comunes como `cuatrimestre` o `addToast` en cascada a través de múltiples niveles de componentes.
- **OBLIGATORIO**:
  - Para notificaciones: consumir el hook `useToastContext()` de `shared/context/ToastContext.jsx`.
  - Para el periodo fiscal activo: consumir el hook `useRepse()` de `modules/repse/context/RepseContext.jsx`.

### B. Separación de Responsabilidades (Vistas vs. Lógica)
- Los componentes de vistas (`tabs/*.jsx`) deben ser **puramente declarativos**: enfocados en renderizar JSX y recibir eventos de usuario.
- Cualquier operación compleja (múltiples llamadas a la API en paralelo, sincronización de estados, manejo de modales cruzados) debe extraerse a un **Custom Hook** en la carpeta `hooks/` del módulo.

### C. Límite de Tamaño de Componentes
- Ningún componente React debe superar ~150 líneas de código.
- Si un componente contiene modales, tablas grandes o formularios extensos, **debe subdividirse** en subcomponentes dedicados dentro de su carpeta `components/`.

---

## 4. Reglas Estrictas de Seguridad Frontend

### A. Prevención de Cross-Site Scripting (XSS)
- **ESTRICTAMENTE PROHIBIDO**: El uso de `dangerouslySetInnerHTML`. Si alguna vez se requiriera inyectar contenido HTML, debe sanitizarse previamente con una librería confiable como `DOMPurify`.
- **Enlaces Seguros**:
  - Todo enlace dinámico (`<a href={url}>`) debe validarse para asegurar que comience con `http://`, `https://` o una ruta relativa `/`.
  - **PROHIBIDO** permitir URLs con el protocolo `javascript:`.
  - Todo enlace externo (`target="_blank"`) debe incluir `rel="noopener noreferrer"`.

### B. Almacenamiento Seguro (Safe Storage)
- **NUNCA** almacenar tokens de autenticación sensibles ni datos fiscales personales o confidenciales (RFC, CURP, NSS, salarios) en `localStorage` o `sessionStorage` sin cifrado.
- Preferir cookies `HttpOnly` gestionadas por el backend o estado en memoria durante la sesión.

### C. Prohibición de Manejo Silencioso de Errores
- **ESTRICTAMENTE PROHIBIDO**:
  ```javascript
  // PROHIBIDO:
  try {
    await api.cargar();
  } catch { /* empty */ }
  ```
- **OBLIGATORIO**: Todo bloque `catch` debe registrar el error en consola para diagnóstico técnico y notificar al usuario mediante un mensaje amigable:
  ```javascript
  // CORRECTO:
  try {
    await api.cargar();
  } catch (error) {
    console.error('Error cargando datos:', error);
    addToast(error.message || 'Error al cargar la información', 'error');
  }
  ```

---

## 5. Diseño y Reglas de Estilos

1. **Uso de Tokens de Diseño**:
   - Utilizar siempre las variables CSS globales de `src/index.css`:
     - Colores: `var(--bg-primary)`, `var(--bg-card)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--accent)`, `var(--border)`.
     - Estados: `var(--success)`, `var(--danger)`, `var(--warning)`, `var(--info)`.
     - Radios y sombras: `var(--radius-sm)`, `var(--radius-md)`, `var(--shadow-sm)`.
2. **Prohibición de TailwindCSS**:
   - No introducir clases utilitarias de TailwindCSS a menos que el usuario lo solicite expresamente. Mantener Vanilla CSS.

---

## 6. Comandos de Verificación para Agentes

Antes de finalizar cualquier tarea en el frontend:

```bash
# 1. Ejecutar la suite de pruebas unitarias (Vitest):
cd frontend && npm test

# 2. Validar que la compilación de producción no tenga errores de sintaxis ni imports rotos:
cd frontend && npm run build

# 3. Auditar paquetes para detectar vulnerabilidades en el árbol de Node:
cd frontend && npm audit
```
