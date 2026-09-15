#!/usr/bin/env bash
# ==============================================================================
# Script de Instalación de Docker y Docker Compose para Ubuntu / Debian
# ==============================================================================
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}      Instalación de Docker y Docker Compose              ${NC}"
echo -e "${GREEN}==========================================================${NC}"

if command -v docker >/dev/null 2>&1; then
    echo -e "${CYAN}✓ Docker ya está instalado:${NC} $(docker --version)"
else
    echo -e "${YELLOW}Instalando docker.io y docker-compose-v2 desde los repositorios oficiales...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose-v2
    
    echo -e "${CYAN}Habilitando e iniciando servicio Docker...${NC}"
    sudo systemctl enable --now docker

    echo -e "${CYAN}Agregando usuario '$USER' al grupo docker...${NC}"
    sudo usermod -aG docker "$USER"
    echo -e "${GREEN}✓ Docker instalado correctamente.${NC}"
fi

echo -e "${GREEN}==========================================================${NC}"
echo -e "${YELLOW}Pasos siguientes para generar y levantar las imágenes:${NC}"
echo -e "  1. Aplica los permisos de grupo ejecutando:"
echo -e "     ${CYAN}newgrp docker${NC}"
echo -e "  2. Construye y levanta los contenedores con:"
echo -e "     ${CYAN}docker compose up --build -d${NC}"
echo -e "  3. Revisa el estado con:"
echo -e "     ${CYAN}docker compose ps${NC}"
echo -e "${GREEN}==========================================================${NC}"
