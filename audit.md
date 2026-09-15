# Auditoría del Sistema: Online Fiscal

## 1. MAPA DE DEPENDENCIAS

### Backend (Python / FastAPI)
- `main.py` -> Es el punto de entrada. Depende de `database.py` y carga todos los enrutadores (`routes/*.py`).
- `models.py` -> Define los esquemas de base de datos usando SQLAlchemy; depende indirectamente de `database.py`.
- `routes/` (Ej. `reportes.py`, `projects.py`, `contratos.py`) -> Todos dependen de `models.py` (para las consultas a BD) y `database.py`. Adicionalmente, `reportes.py` tiene dependencia directa de la librería externa `openpyxl`.

### Frontend (React / Vite)
- `src/App.jsx` -> Punto de inicio de la UI. Orquesta las vistas (`pages/*.jsx`) y componentes.
- `src/pages/` (Ej. `AsociarPage.jsx`, `ContratosPage.jsx`) -> Dependen fuertemente de los servicios de API centralizados (`services/api.js` y `services/projectsApi.js`) y componentes reutilizables como `Modal.jsx`.
- `src/services/api.js` -> Centraliza toda la comunicación HTTP hacia el Backend. Es invocado por casi todas las páginas.

---

## 2. PROBLEMAS CRÍTICOS (Bloquean escalabilidad)

### Funciones con más de 50 líneas
1. **`backend/routes/reportes.py`**:
   - `generar_icsoe` (56 líneas aprox.)
   - `generar_sisub_contratos` (60 líneas aprox.)
   - `generar_sisub_trabajadores` (50 líneas aprox.)
2. **`backend/routes/projects.py`**:
   - `get_board` (47 líneas). El problema aquí no es solo el tamaño, sino la ejecución de consultas en bucle.
3. **`frontend/src/pages/AsociarPage.jsx`**:
   - Componente React principal extremadamente largo (~150 líneas) manejando 3 estados de modales distintos simultáneamente.

### Lógica de negocio mezclada con presentación
- **Backend (`reportes.py`)**: Las consultas a la base de datos se mezclan directamente con la inyección de estilos de celda (ej: `cell.border = THIN_BORDER`) y la construcción del Excel.
- **Frontend**: Componentes como `ContratosPage.jsx` y `AsociarPage.jsx` están realizando el parseo directo de datos y manejando try-catch de las APIs dentro del flujo de renderizado en vez de usar *custom hooks* (ej: separando la capa de servicio de la de vista).

### Variables globales o estado compartido sin control
- **Frontend**: Se nota un alto acoplamiento de "prop drilling" pasando variables como `cuatrimestre` y funciones como `addToast` en cascada hacia las páginas, en lugar de manejar una tienda global (Context API, Zustand o Redux). Si la aplicación crece, esto se volverá insostenible.

### Código duplicado

**Fragmento 1: Descarga de archivos (Frontend - `api.js`)**
Repetido en `descargarICSOE`, `descargarSISUBContratos` y `descargarSISUBTrabajadores`:
```javascript
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `...`;
a.click();
URL.revokeObjectURL(url);
```

**Fragmento 2: Exportación de Excel (Backend - `reportes.py`)**
Repetido en los 3 endpoints de reportes:
```python
output = io.BytesIO()
wb.save(output)
output.seek(0)
filename = f"..."
return StreamingResponse(
    output,
    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    headers={"Content-Disposition": f"attachment; filename={filename}"},
)
```

---

## 3. DEUDA TÉCNICA (Riesgo medio)

- **Problema N+1 en Base de Datos**: En `backend/routes/projects.py` -> `get_board()`. Se iteran los grupos y por cada uno se hace una consulta de `items`, y por cada item se hace una consulta de `subitems`. Esto disparará cientos de queries cuando el tablero crezca, saturando el servidor. Se deben usar `joinedload` u opciones de Eager Loading.
- **Nomenclatura confusa**: 
  - En backend: Uso de variables cortas poco descriptivas (`cuat` en vez de `cuatrimestre`, `c`, `o`, `b`).
  - En frontend: `modoEmp`, función `set` genérica en `ContratosPage`, `selContrato`.
- **Manejo silencioso de Errores**: Uso del patrón `catch { /* empty */ }` o `catch { /* */ }` en `AsociarPage.jsx` y `ContratosPage.jsx`. Si algo falla al cargar, el usuario no recibe ningún feedback ni la consola registra el error.

---

## 4. LO QUE FUNCIONA BIEN (No tocar)

- **Centralización de llamadas a la API**: La forma en la que `frontend/src/services/api.js` centraliza las peticiones usando un envoltorio base (`request()`) es una excelente práctica.
- **Estructura de Base de Datos y ORM**: La definición de modelos usando SQLAlchemy (`backend/models.py`) con sus correspondientes relaciones declaradas está muy bien ejecutada.
- **Validación Backend (FastAPI Pydantic)**: El uso intensivo de *Schemas* Pydantic (como se ve en `projects.py`) garantiza validación estricta de payloads entrantes, lo cual es muy robusto.
- **Arquitectura de diseño UI Base**: El archivo global `index.css` y las variables de colores mantienen la identidad sólida y consistente.

---

## 5. PLAN DE REFACTOR PROPUESTO

*(Orden de recomendación, de menor a mayor riesgo para el sistema)*

1. **(Bajo Riesgo) Extraer funciones utilitarias de código duplicado**:
   - Mover la lógica de manipulación del Blob en Frontend a una función `downloadFile(blob, filename)` en un archivo `utils.js`.
   - Mover la respuesta `StreamingResponse` del Backend a un helper como `enviar_excel(workbook, filename)`.
2. **(Bajo Riesgo) Mejorar Nomenclatura y manejo de excepciones**: Reemplazar todos los `catch { /* empty */ }` con registros reales de errores (`console.error` u observabilidad) y expandir el nombre de las variables.
3. **(Riesgo Medio) Optimizar consultas (Problema N+1)**: Refactorizar `get_board` en `projects.py` para usar `joinedload(ProjectBoard.groups, ProjectGroup.items)` para traer toda la jerarquía en una sola consulta.
4. **(Riesgo Medio) Abstraer Componentes Frontend Largos**: Dividir `AsociarPage.jsx` extrayendo cada uno de los 3 Modales en archivos independientes y crear Custom Hooks (`useAsociaciones()`) para manejar su lógica interna.
5. **(Riesgo Alto) Desacoplar la generación de Excel**: Refactorizar `reportes.py`. Crear una clase o módulo independiente llamado `ExcelBuilder` que reciba solo una lista de diccionarios, separando la lógica de obtención de base de datos de la lógica de presentación visual.
6. **(Riesgo Alto) Implementar Gestor de Estado Global**: Instalar Context API o Zustand para quitar el "prop drilling" de propiedades compartidas a lo largo de las vistas de React (`cuatrimestre`, `addToast`).
