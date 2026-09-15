Write-Host "Iniciando Online Fiscal - REPSE..." -ForegroundColor Green

# Obtiene la ruta de la carpeta donde está este script
$baseDir = $PSScriptRoot

# Iniciar Backend en una nueva ventana de PowerShell
Write-Host "Levantando Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; if (Test-Path 'requirements.txt') { Write-Host 'Verificando/Instalando dependencias del backend...'; pip install -r requirements.txt -q }; uvicorn main:app --reload" -WindowStyle Normal

# Iniciar Frontend en una nueva ventana de PowerShell
Write-Host "Levantando Frontend (React/Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; if (!(Test-Path 'node_modules')) { Write-Host 'Instalando dependencias de Node (esto tomará un momento)...'; npm install }; npm run dev" -WindowStyle Normal

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "¡Ambos servicios se están iniciando en ventanas separadas!" -ForegroundColor Yellow
Write-Host "Backend correra en: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "Frontend correra en: http://localhost:5173" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green

# Mantener la ventana principal abierta un par de segundos para leer el mensaje
Start-Sleep -Seconds 4
