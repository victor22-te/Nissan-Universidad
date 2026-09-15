# Diseño de Interfaz Frontend (Nissan Universidad)

## Tema y Estilo Base
- **Glassmorphism Premium**: La aplicación se sitúa sobre un fondo estático de alta calidad (`nissan_photo.jpg`).
- **Contenedores**: 
  - Paneles (`Sidebar`) y áreas de contenido (`.main-content-glass`) tienen fondos semitransparentes (`rgba(0,0,0,0.65)` en modo oscuro).
  - Usan `backdrop-filter: blur(12px)` para desenfocar la imagen detrás.
  - Bordes translúcidos (`1px solid rgba(255,255,255,0.1)`).

## Esquema de Color
- **Rojo Nissan**: `#c3002f` (Usado en el botón primario de inicio de sesión).
- **Dark Mode (Default)**: Textos blancos, contenedores en negro con baja opacidad.
- **Light Mode**: Textos grises/negros (`#171717`), contenedores en blanco con opacidad (`rgba(255,255,255,0.75)`).

## Tipografía e Íconos
- **Fuente**: Inter, Roboto, sans-serif.
- **Íconos**: Lucide React (`lucide-react`), usados con tamaños fijos (`16x16` o `24x24`).

## Clases Utilitarias (App.css & index.css)
Cualquier desarrollo nuevo debe utilizar:
- Contenedores: Evitar fondos sólidos opacos para no tapar el efecto de fondo.
- Botones: Integrados, sin sombras duras.