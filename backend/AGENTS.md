# Guía para Agentes de Inteligencia Artificial - Backend (FastAPI / SQLAlchemy)

Este documento define los estándares arquitectónicos, reglas de seguridad y buenas prácticas de escalabilidad para el desarrollo en el directorio `backend/`.

---

## 1. Stack Tecnológico y Herramientas

- **Lenguaje**: Python 3.12+ (entorno virtual administrado mediante `.venv` / `uv`).
- **Framework API**: FastAPI 0.115+.
- **ORM & Base de Datos**: SQLAlchemy 2.0+ con SQLite (`online_fiscal.db`).
- **Validación de Datos**: Pydantic v2 (`BaseModel`, `model_dump()`, schemas estrictos).
- **Procesamiento de Archivos**: `openpyxl` para hojas de cálculo Excel; `lxml` para parsing de CFDIs de nómina.

---

## 2. Estructura de Directorios del Backend (Feature-First)

```text
backend/
├── main.py                          # Entrada principal. Solo configura CORS y monta routers de módulos
├── database.py                      # Conexión SQLAlchemy, Base y get_db()
├── models.py                        # Definición central de modelos de Base de Datos
├── schemas.py                       # Schemas generales compartidos
├── requirements.txt
│
├── services/                        # Servicios de negocio desacoplados de FastAPI y SQLAlchemy
│   └── excel_builder.py             # Generación visual de Excel (openpyxl)
│
└── modules/                         # Módulos organizados por dominio de negocio
    ├── repse/                       # Dominio Gestión REPSE
    │   ├── __init__.py              # Exporta repse_router
    │   ├── router.py                # Agrega los sub-routers del dominio REPSE
    │   └── routes/                  # Endpoints del dominio
    │       ├── cuatrimestres.py
    │       ├── contratos.py
    │       ├── beneficiarios.py
    │       ├── objetos_contables.py
    │       ├── empleados.py
    │       ├── asociaciones.py
    │       └── reportes.py
    │
    └── projects/                    # Dominio Gestión de Proyectos (tableros)
        ├── __init__.py              # Exporta projects_router
        ├── router.py                # Endpoints del dominio Proyectos
        └── schemas.py               # Schemas Pydantic específicos de proyectos
```

---

## 3. Reglas Estrictas de Seguridad Backend

### A. Prevención de Inyecciones SQL (SQLi)
- **OBLIGATORIO**: Todas las consultas a base de datos deben realizarse a través del ORM de SQLAlchemy utilizando parámetros tipados:
  ```python
  # CORRECTO:
  db.query(Contrato).filter(Contrato.id == contrato_id).first()
  ```
- **PROHIBIDO**: El uso de cadenas formateadas (`f-strings`), interpolación (`%` o `.format()`) o concatenación en consultas SQL directas:
  ```python
  # ESTRICTAMENTE PROHIBIDO:
  db.execute(f"SELECT * FROM contratos WHERE id = {contrato_id}")
  ```

### B. Prevención de Asignación Masiva (Mass Assignment)
- Al crear o actualizar registros, **NUNCA** volcar diccionarios arbitrarios del usuario directamente a los modelos.
- Utilizar esquemas Pydantic con validación de campos permitidos:
  ```python
  # CORRECTO:
  datos_actualizados = data.model_dump(exclude_unset=True)
  for campo, valor in datos_actualizados.items():
      if campo in CAMPOS_PERMITIDOS:
          setattr(registro, campo, valor)
  ```

### C. Seguridad en Carga y Procesamiento de Archivos (CFDI XML y Excel)
- **Prevención de Ataques XXE (XML External Entity)**:
  - Al procesar comprobantes XML de nómina con `lxml`, desactivar la resolución de entidades externas y el acceso a red:
    ```python
    parser = etree.XMLParser(resolve_entities=False, no_network=True)
    ```
- **Prevención de Path Traversal**:
  - Al generar o devolver nombres de archivo descargables, sanitizar el nombre utilizando `os.path.basename` o plantillas controladas (ej: `f"ICSOE_{nombre_sanitizado}.xlsx"`).
  - Nunca concatenar rutas relativas proporcionadas directamente por el cliente (`../../etc/passwd`).

### D. Fuga de Información en Manejo de Excepciones
- **PROHIBIDO** devolver stack traces de Python o mensajes directos de SQLite/SQLAlchemy al cliente en respuestas HTTP.
- Manejar excepciones con mensajes seguros y claros:
  ```python
  try:
      ...
  except Exception as err:
      # Log interno para depuración del desarrollador:
      logger.error(f"Error interno procesando contrato: {err}")
      # Respuesta genérica y controlada al usuario:
      raise HTTPException(status_code=500, detail="Error interno al procesar el contrato")
  ```

### E. Configuración de CORS
- Nunca usar `allow_origins=["*"]` en combinación con `allow_credentials=True` en producción.
- Limitar los orígenes a las URLs del frontend autorizadas (`http://localhost:5173`, etc.).

---

## 4. Rendimiento y Escalabilidad de Consultas (Regla Anti N+1)

1. **Eager Loading Obligatorio**:
   - Para relaciones 1 a 1 o 1 a N de cardinalidad baja: usar `joinedload()`.
   - Para relaciones jerárquicas multinivel (ejemplo: `tableros -> grupos -> items -> subitems`): usar `subqueryload()`.
2. **Consultas en Bucles**:
   - **PROHIBIDO** ejecutar consultas dentro de bucles `for` (`for item in items: db.query(...)`).
3. **Manejo de Transacciones**:
   - Cada operación de escritura debe llamar explícitamente a `db.commit()` y en caso de error manejar `db.rollback()`.

---

## 5. Comandos de Verificación para Agentes

Antes de finalizar cambios en el backend:

```bash
# 1. Verificar carga limpia de la aplicación y todas sus rutas:
source .venv/bin/activate && python -c "import main; print('Rutas cargadas:', len(main.app.routes))"

# 2. Análisis estático de seguridad con Bandit (si está instalado):
bandit -r modules/ services/ -ll

# 3. Auditoría de dependencias:
pip-audit -r requirements.txt
```
