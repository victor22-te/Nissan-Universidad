#!/usr/bin/env bash
# ==============================================================================
# Iniciar NISSAN UNIVERSIDAD - ERP
# Compatible con Linux, macOS, WSL y Git Bash (Windows)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}         Iniciando NISSAN UNIVERSIDAD - ERP                  ${NC}"
echo -e "${GREEN}==========================================================${NC}"

# Ruta raíz del proyecto
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Asegurar directorios locales en el PATH si existen (~/.local/bin para uv, etc.)
if [ -d "$HOME/.local/bin" ] && [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    export PATH="$HOME/.local/bin:$PATH"
fi

# Detectar comando de Python disponible
PYTHON_CMD=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

# 1. Configuración y activación de entorno virtual (.venv)
VENV_ACTIVATED=false
for venv_candidate in "$BASE_DIR/backend/.venv" "$BASE_DIR/backend/venv" "$BASE_DIR/.venv" "$BASE_DIR/venv"; do
    if [ -d "$venv_candidate" ]; then
        if [ -f "$venv_candidate/bin/activate" ]; then
            # Linux / macOS / WSL
            source "$venv_candidate/bin/activate"
            VENV_ACTIVATED=true
            break
        elif [ -f "$venv_candidate/Scripts/activate" ]; then
            # Git Bash en Windows
            source "$venv_candidate/Scripts/activate"
            VENV_ACTIVATED=true
            break
        fi
    fi
done

if [ "$VENV_ACTIVATED" = false ]; then
    echo -e "${YELLOW}Configurando entorno virtual de Python (.venv)...${NC}"
    if command -v uv >/dev/null 2>&1; then
        uv venv "$BASE_DIR/backend/.venv" --python 3.12 2>/dev/null || uv venv "$BASE_DIR/backend/.venv"
    elif [ -n "$PYTHON_CMD" ]; then
        $PYTHON_CMD -m venv "$BASE_DIR/backend/.venv" 2>/dev/null || true
    fi

    # Activar entorno recién creado
    if [ -f "$BASE_DIR/backend/.venv/bin/activate" ]; then
        source "$BASE_DIR/backend/.venv/bin/activate"
        VENV_ACTIVATED=true
    elif [ -f "$BASE_DIR/backend/.venv/Scripts/activate" ]; then
        source "$BASE_DIR/backend/.venv/Scripts/activate"
        VENV_ACTIVATED=true
    fi
fi

# 2. Verificación e instalación de dependencias de Backend
cd "$BASE_DIR/backend"
if [ -f "requirements.txt" ]; then
    # Verificar si uvicorn y fastapi están instalados
    if ! python -c "import uvicorn, fastapi" >/dev/null 2>&1; then
        echo -e "${CYAN}Instalando dependencias de Python (FastAPI, Uvicorn, etc.)...${NC}"
        if command -v uv >/dev/null 2>&1; then
            uv pip install -r requirements.txt
        else
            pip install -r requirements.txt -q
        fi
    fi
fi

# 3. Verificación e instalación de dependencias de Frontend
cd "$BASE_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Instalando dependencias de Node (esto tomará un momento)...${NC}"
    npm install
fi

# 4. Manejo de cierre limpio al presionar Ctrl + C
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    trap - SIGINT SIGTERM INT TERM EXIT
    echo ""
    echo -e "${YELLOW}Deteniendo servicios (Backend y Frontend)...${NC}"

    if [ -n "$BACKEND_PID" ]; then
        pkill -P "$BACKEND_PID" 2>/dev/null || true
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        pkill -P "$FRONTEND_PID" 2>/dev/null || true
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
    fi

    # Liberar puertos por seguridad si quedara algún subproceso colgado
    if command -v fuser >/dev/null 2>&1; then
        fuser -k 8000/tcp 2>/dev/null || true
        fuser -k 5173/tcp 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ Todos los servicios se han detenido correctamente.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM INT TERM EXIT

# 5. Iniciar Backend en segundo plano
echo -e "${CYAN}Levantando Backend (FastAPI)...${NC}"
(cd "$BASE_DIR/backend" && exec python -m uvicorn main:app --reload) &
BACKEND_PID=$!

# 6. Iniciar Frontend en segundo plano
echo -e "${CYAN}Levantando Frontend (React/Vite)...${NC}"
(cd "$BASE_DIR/frontend" && exec npm run dev) &
FRONTEND_PID=$!

# 7. Información para el usuario
echo -e "${GREEN}==========================================================${NC}"
echo -e "${YELLOW}¡Ambos servicios se están ejecutando!${NC}"
echo -e "  ➜ Backend API:    ${CYAN}http://127.0.0.1:8000${NC}"
echo -e "  ➜ Swagger Docs:   ${CYAN}http://127.0.0.1:8000/docs${NC}"
echo -e "  ➜ Frontend Web:   ${CYAN}http://localhost:5173${NC}"
echo -e "  ➜ Detener:        ${YELLOW}Presiona [Ctrl + C] para apagar ambos${NC}"
echo -e "${GREEN}==========================================================${NC}"

# Esperar a que termine alguno de los servicios o se reciba interrupción
wait -n "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
cleanup
