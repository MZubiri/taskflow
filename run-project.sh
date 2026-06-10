#!/bin/bash

# Script para iniciar todo el ecosistema de TaskFlow (Microservicios + Frontend)

# Variables de colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}=== Iniciando Ecosistema TaskFlow Monorepo ===${NC}"
echo -e "${BLUE}==============================================${NC}"

# 1. Verificar contenedor MySQL
echo -e "${BLUE}[1/6] Verificando Contenedor de Base de Datos MySQL...${NC}"
if ! docker ps | grep -q "ligo-mysql"; then
  echo -e "${RED}ERROR: El contenedor de MySQL 'ligo-mysql' no está activo.${NC}"
  echo -e "${YELLOW}Ejecute 'docker start ligo-mysql' antes de lanzar el proyecto.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ MySQL en puerto 5510 detectado correctamente.${NC}"

# Crear directorio para logs locales
mkdir -p logs

# Lista de identificadores de procesos (PIDs)
PIDS=()

# Función para apagar todos los procesos al salir
cleanup() {
  echo -e "\n${RED}=== Deteniendo todos los servicios activos... ===${NC}"
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null
    fi
  done
  echo -e "${GREEN}✓ Todos los servicios se han detenido correctamente.${NC}"
  exit 0
}

# Capturar señales de salida
trap cleanup SIGINT SIGTERM

# 2. Servidor Eureka
echo -e "${BLUE}[2/6] Iniciando Eureka Server (discovery-server)...${NC}"
cd discovery-server
chmod +x mvnw
./mvnw spring-boot:run > ../logs/discovery-server.log 2>&1 &
PIDS+=($!)
cd ..

echo -e "Esperando a que Eureka se registre en puerto 8761..."
sleep 12

# 3. Microservicio Auth
echo -e "${BLUE}[3/6] Iniciando Auth Service...${NC}"
cd auth-service
chmod +x mvnw
./mvnw spring-boot:run > ../logs/auth-service.log 2>&1 &
PIDS+=($!)
cd ..

# 4. Microservicio Tareas
echo -e "${BLUE}[4/6] Iniciando Task Service...${NC}"
cd task-service
chmod +x mvnw
./mvnw spring-boot:run > ../logs/task-service.log 2>&1 &
PIDS+=($!)
cd ..

# 5. API Gateway
echo -e "${BLUE}[5/6] Iniciando API Gateway (puerto 8080)...${NC}"
cd api-gateway
chmod +x mvnw
./mvnw spring-boot:run > ../logs/api-gateway.log 2>&1 &
PIDS+=($!)
cd ..

echo -e "Esperando el inicio de los microservicios en el Gateway..."
sleep 12

# 6. Angular Frontend
echo -e "${BLUE}[6/6] Iniciando Angular Frontend (puerto 4200)...${NC}"
cd Taskflow-front
npm run start > ../logs/frontend.log 2>&1 &
PIDS+=($!)
cd ..

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}✓ ¡Ecosistema TaskFlow inicializado con éxito!${NC}"
echo -e " - Eureka Dashboard : http://localhost:8761"
echo -e " - API Gateway      : http://localhost:8080"
echo -e " - Frontend Portal  : http://localhost:4200"
echo -e ""
echo -e "Logs disponibles en: ./logs/"
echo -e "Presiona [Ctrl+C] en esta terminal para apagar todo."
echo -e "${GREEN}====================================================${NC}"

# Mantener el script activo
wait
