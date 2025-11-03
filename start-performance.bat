@echo off
echo 🚀 Iniciando Sistema de Performance - Biblioteca Digital
echo ==================================================

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Execute este script na raiz do projeto!
    pause
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js 16+ primeiro.
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado. Instale npm primeiro.
    pause
    exit /b 1
)

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado. Instale Python 3.8+ primeiro.
    pause
    exit /b 1
)

echo ✅ Dependências verificadas!

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências do servidor...
    npm install
)

if not exist "client\node_modules" (
    echo 📦 Instalando dependências do cliente...
    cd client
    npm install
    cd ..
)

echo.
echo Escolha uma opção:
echo 1. Servidor otimizado (produção)
echo 2. Desenvolvimento com hot reload
echo 3. Monitor de performance
echo 4. Build otimizado
echo 5. Auditoria Lighthouse
echo 6. Desenvolvimento completo (servidor + cliente)
echo 7. Instalar todas as dependências

set /p choice="Digite sua escolha (1-7): "

if "%choice%"=="1" (
    echo 🚀 Iniciando servidor otimizado...
    npm run start:optimized
) else if "%choice%"=="2" (
    echo 🔧 Iniciando desenvolvimento...
    npm run dev:optimized
) else if "%choice%"=="3" (
    echo 📊 Iniciando monitor de performance...
    python performance-monitor.py
) else if "%choice%"=="4" (
    echo 🏗️ Fazendo build otimizado...
    npm run build:optimized
) else if "%choice%"=="5" (
    echo 🔍 Executando auditoria Lighthouse...
    npm run lighthouse
) else if "%choice%"=="6" (
    echo 🚀 Iniciando desenvolvimento completo...
    npm run full-dev
) else if "%choice%"=="7" (
    echo 📦 Instalando todas as dependências...
    npm run install-all
) else (
    echo ❌ Opção inválida!
    pause
    exit /b 1
)

pause