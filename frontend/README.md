# Nissan ERP - Frontend

El frontend está desarrollado con **React (Vite)** y adopta un diseño **Glassmorphism** que le da un aspecto premium, utilizando transparencias e integrándose visualmente con fondos institucionales de Nissan.

## Estructura Principal

- `src/App.jsx`: Contiene el **Router Principal**. Toda ruta nueva debe ser registrada aquí.
- `src/pages/`: Directorio para las vistas/pantallas principales completas. (Ej. `Login.jsx`, `VentanillaUnicaPage.jsx`).
- `src/shared/`: Componentes reutilizables, layout y contextos que pueden ser usados por cualquier página (Ej. `Sidebar`, `ToastContext`).
- `src/index.css`: Sistema de diseño global, tipografías y variables de estilo.
- `src/App.css`: Estilos principales y clases base estructurales (como `.main-content-glass`).

## ¿Cómo crear una nueva pantalla / vista?

Para crear una pantalla que mantenga la coherencia visual del proyecto:

### 1. Crear el Componente de Página
Crea un archivo nuevo, por ejemplo en `src/pages/MiModulo/MiModuloPage.jsx`:
```jsx
import React from 'react';

const MiModuloPage = () => {
  return (
    // Es crítico usar las clases existentes para mantener el Glassmorphism
    <div className="main-content-glass p-6">
      <h1 className="text-3xl font-bold mb-6 text-nissan-red">Mi Nuevo Módulo</h1>
      
      <div className="bg-white/10 p-4 rounded-xl shadow-inner border border-white/20">
        <p className="text-white">
          Aquí va el contenido de tu vista. Ya está adaptada al diseño global.
        </p>
      </div>
    </div>
  );
};

export default MiModuloPage;
```

### 2. Registrar la Ruta en `src/App.jsx`
Agrega tu nueva página a las rutas declaradas:
```jsx
import MiModuloPage from './pages/MiModulo/MiModuloPage';

// Dentro del componente Routes:
<Route path="/" element={<ProtectedRoute />}>
  <Route path="mi-modulo" element={<MiModuloPage />} />
</Route>
```

### 3. Agregarlo al Menú de Navegación (Sidebar)
Si deseas que la página sea accesible desde la barra lateral, ve a `src/shared/components/Sidebar/Sidebar.jsx` y añade un nuevo botón/enlace de navegación (usando `<Link>` o el método que utilice el Sidebar) apuntando a `/mi-modulo`.
