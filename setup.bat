@echo off
setlocal enabledelayedexpansion

echo 🚀 VRD Solution - Sistema de Check-in/Check-out
echo ================================================
echo.

:: Check if Docker is installed
echo [STEP] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker nao encontrado. Por favor, instale o Docker primeiro.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose nao encontrado. Por favor, instale o Docker Compose primeiro.
    pause
    exit /b 1
)
echo [SUCCESS] Docker encontrado!

:: Check if Node.js is installed
echo [STEP] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js nao encontrado. Por favor, instale o Node.js 18+ primeiro.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js encontrado!

:: Setup backend
echo [STEP] Configurando backend...
cd backend

:: Copy environment file
if not exist .env (
    copy .env.example .env >nul
    echo [SUCCESS] Arquivo .env criado!
) else (
    echo [WARNING] Arquivo .env ja existe.
)

:: Start Docker services
echo [STEP] Iniciando servicos Docker...
docker-compose up -d

:: Wait for database
echo [STEP] Aguardando banco de dados...
timeout /t 10 /nobreak >nul

:: Run migrations
echo [STEP] Executando migracoes...
docker-compose exec backend alembic upgrade head

:: Seed database
echo [STEP] Populando banco de dados...
docker-compose exec backend python app/scripts/seed.py

echo [SUCCESS] Backend configurado com sucesso!
cd ..

:: Setup frontend
echo [STEP] Configurando frontend...
cd frontend

:: Copy environment file
if not exist .env.local (
    copy .env.example .env.local >nul
    echo [SUCCESS] Arquivo .env.local criado!
) else (
    echo [WARNING] Arquivo .env.local ja existe.
)

:: Install dependencies
echo [STEP] Instalando dependencias do frontend...
npm install

echo [SUCCESS] Frontend configurado com sucesso!
cd ..

:: Show access information
echo.
echo 🎉 Setup concluido com sucesso!
echo ================================
echo.
echo 📌 Acesse os servicos:
echo   🖥️  Frontend:    http://localhost:3000
echo   🔧 Backend API:  http://localhost:8000
echo   📚 API Docs:     http://localhost:8000/docs
echo.
echo 👤 Usuarios padrao:
echo   Admin:      admin@vrdsolution.com      / Admin@123
echo   Supervisor: supervisor@vrdsolution.com / Supervisor@123
echo   Tecnico:    arthur@vrdsolution.com     / Arthur@123
echo   Tecnico:    diego@vrdsolution.com      / Diego@123
echo   Tecnico:    gui@vrdsolution.com        / Gui@123
echo.
echo 🚀 Para iniciar o frontend:
echo   cd frontend ^&^& npm run dev
echo.
echo 📋 Para verificar logs do backend:
echo   cd backend ^&^& docker-compose logs -f
echo.

pause