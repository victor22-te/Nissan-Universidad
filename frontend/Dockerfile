# ==============================================================================
# Frontend Dockerfile - Online Fiscal
# Multi-stage build: Node.js (Build) -> Nginx (Production Server)
# ==============================================================================

# Etapa 1: Compilación del bundle de React con Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx ligero para producción
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
