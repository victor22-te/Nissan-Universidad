# ==============================================================================
# Backend Dockerfile - Online Fiscal
# FastAPI + SQLAlchemy + SQLite
# ==============================================================================
FROM python:3.12-slim

# Evitar escritura de archivos .pyc y forzar buffer directo en logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libxml2 \
    libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar requerimientos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente del backend
COPY . .

# Exponer el puerto de la API FastAPI
EXPOSE 8000

# Ejecutar con uvicorn escuchando en todas las interfaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
