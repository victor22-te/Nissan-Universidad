# Auditoría Técnica Senior - Nissan Universidad ERP

**Fecha de Auditoría:** Septiembre 2026
**Estado del Sistema:** MVP Funcional (Fase de cimentación y limpieza)

A continuación se detalla una auditoría técnica profunda del repositorio tras la purga del código legado "Online Fiscal". El objetivo es evaluar la arquitectura actual e identificar deudas técnicas críticas antes de comenzar el desarrollo de los nuevos módulos (Ventanilla Única, Status Vehículo).

---

## 1. Backend (FastAPI + SQLAlchemy)

### Fortalezas 🟢
- **Framework Moderno:** El uso de FastAPI proporciona un alto rendimiento y documentación automática (Swagger).
- **Seguridad en Hash:** El reemplazo de `passlib` por `bcrypt` nativo eliminó problemas de dependencias obsoletas y colisiones de longitud.
- **Estructura Modular:** Separar el negocio en carpetas dentro de `modules/` (como `auth/`) es una excelente práctica para evitar acoplamiento en `main.py`.

### Riesgos y Deuda Técnica 🔴
1. **Secretos Hardcodeados (¡Crítico!)**: 
   - La clave `SECRET_KEY` del JWT está quemada en código dentro de `auth/router.py`.
   - Las credenciales del administrador (correo y contraseña) están hardcodeadas en `main.py` durante el evento `startup`.
   - *Solución*: Implementar `python-dotenv` y migrar todos estos secretos a un archivo `.env`.
2. **Bloqueo del Event Loop (Rendimiento)**:
   - La base de datos actual utiliza una conexión síncrona `sqlite:///`. FastAPI es un framework asíncrono; las llamadas síncronas a la DB bloquean el *event loop* de la aplicación, limitando drásticamente la concurrencia.
   - La función `bcrypt.hashpw` es síncrona e intensiva para el procesador.
   - *Solución*: Migrar la URL a `sqlite+aiosqlite:///` (o `postgresql+asyncpg://` en producción). Usar `run_in_threadpool` para los hashes.
3. **CORS Permisivo (Seguridad)**:
   - `allow_origins=["*", ...]` combinado con `allow_credentials=True` es un vector de ataque (y muchos navegadores lo bloquean por defecto). 
   - *Solución*: Parametrizar los orígenes permitidos por entorno.
4. **Falta de Migraciones**:
   - `Base.metadata.create_all()` es útil para prototipos, pero inviable en producción para actualizar esquemas de bases de datos sin perder datos.
   - *Solución*: Configurar e inicializar `Alembic`.

---

## 2. Frontend (React + Vite)

### Fortalezas 🟢
- **Build Tool:** Vite garantiza tiempos de arranque instantáneos y un empaquetado moderno (ESM).
- **Diseño Premium:** La interfaz *Glassmorphism* está muy bien lograda y proyecta una identidad corporativa limpia.
- **Protección de Rutas:** El uso de `<ProtectedRoute>` en `react-router-dom` centraliza la seguridad del lado del cliente.

### Riesgos y Deuda Técnica 🔴
1. **Almacenamiento del Token JWT (Seguridad)**:
   - Actualmente, el token se almacena en `localStorage`. Esto deja la sesión vulnerable a ataques XSS (Cross-Site Scripting). Si un atacante inyecta JS, roba el token fácilmente.
   - *Solución*: Migrar a **HttpOnly Cookies**. El backend debe enviar la cookie y el frontend debe adjuntarla.
2. **Estilos Inline Mantenibles**:
   - Componentes como `Login.jsx` usan extensos bloques de estilos *inline* (`style={{...}}`). A medida que el proyecto escale, esto dificultará el re-uso de estilos y el soporte a responsividad (media queries).
   - *Solución*: Migrar esos estilos a clases en `App.css` o adoptar CSS Modules (`Login.module.css`).
3. **Gestión de Estado Ausente**:
   - Al crecer el ERP, `useState` no será suficiente para cachear respuestas del backend (como la tabla de Ventanilla Única).
   - *Solución*: Incorporar una librería de sincronización como **React Query (@tanstack/react-query)** para cache, loading states y reintentos automáticos.

---

## 3. Entorno de Desarrollo y Despliegue

### Riesgos y Deuda Técnica 🔴
1. **Acoplamiento a Scripts Bash**:
   - El archivo `iniciar_sistema.sh` es propenso a fallar dependiendo del sistema operativo (Mac/Linux/Windows). No hay garantía de que dos desarrolladores tengan las mismas versiones de Node.js o Python.
   - *Solución*: Crear un `docker-compose.yml` (para db, backend, y frontend) que garantice un entorno reproducible en cualquier máquina sin instalar dependencias globales.
2. **Falta de Linters**:
   - No hay configuraciones de `ESLint` ni `Prettier` en el frontend, ni `Ruff` o `Black` en el backend.
   - *Solución*: Agregar *pre-commit hooks* para estandarizar el código.

---

## Plan de Acción Recomendado (Próximos Pasos)

Antes de programar lógica profunda de *Ventanilla Única*, se sugiere como prioridad inmediata:
1. **Configurar el `.env`** para limpiar las credenciales de `main.py` y el `SECRET_KEY`.
2. **Refactorizar `Login.jsx`** para limpiar los estilos inline.
3. **Migrar a Async SQLAlchemy** (o implementar `Alembic` temprano para evitar dolor futuro).
4. Empezar el desarrollo de los componentes de negocio usando **React Query**.
