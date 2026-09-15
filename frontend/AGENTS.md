# Guía para Agentes de IA - Frontend (React / Vite)

## Core Tecnológico
- **UI**: React 18+ (Hooks funcionales).
- **Build Tool**: Vite.
- **Enrutamiento**: `react-router-dom` con Layout de rutas protegidas.

## Reglas de Desarrollo
1. **Estilos**: Todo CSS debe adherirse al sistema `Glassmorphism` descrito en `fonted_desing.md`. Usar variables globales de `index.css`.
2. **Estructura**: Páginas nuevas en `src/pages/`, componentes reutilizables en `src/shared/`.
3. **Manejo de API**: Las peticiones al backend deben usar `fetch` hacia `http://127.0.0.1:8000/api/...` adjuntando el Token JWT (Bearar) almacenado en `localStorage`.

## Seguridad
- No exponer el Token en logs.
- Todo módulo protegido debe validarse contra `localStorage.getItem('token')` mediante `ProtectedRoute`.
