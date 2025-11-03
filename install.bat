@echo off
chcp 65001 >nul
title BookVerse - Instalação Automática

echo.
echo ████████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
echo ██╔══██║██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
echo ██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗  
echo ██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
echo ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗
echo ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
echo.
echo 🚀 Instalação Automática do BookVerse
echo ====================================
echo.

REM Verificar se está executando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
) else (
    echo ❌ Este script precisa ser executado como administrador
    echo 💡 Clique com botão direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo 📋 Verificando sistema...
echo Sistema: %OS%
echo Arquitetura: %PROCESSOR_ARCHITECTURE%
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Git já instalado
) else (
    echo 📥 Instalando Git...
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorLevel% neq 0 (
        echo ❌ Erro ao instalar Git
        echo 💡 Instale manualmente: https://git-scm.com/download/win
        pause
        exit /b 1
    )
)

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js já instalado
) else (
    echo 📥 Instalando Node.js...
    winget install OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    if %errorLevel% neq 0 (
        echo ❌ Erro ao instalar Node.js
        echo 💡 Instale manualmente: https://nodejs.org/
        pause
        exit /b 1
    )
    echo ⚠️ Reinicie o terminal após a instalação do Node.js
    pause
)

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Python já instalado
) else (
    echo 📥 Instalando Python...
    winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements
    if %errorLevel% neq 0 (
        echo ❌ Erro ao instalar Python
        echo 💡 Instale manualmente: https://python.org/
        pause
        exit /b 1
    )
)

echo.
echo 📂 Escolha o diretório de instalação:
echo 1. Desktop (Recomendado)
echo 2. Documentos
echo 3. Pasta atual
echo 4. Personalizado
echo.
set /p choice="Digite sua escolha (1-4): "

if "%choice%"=="1" (
    set "install_dir=%USERPROFILE%\Desktop\BookVerse"
) else if "%choice%"=="2" (
    set "install_dir=%USERPROFILE%\Documents\BookVerse"
) else if "%choice%"=="3" (
    set "install_dir=%CD%\BookVerse"
) else if "%choice%"=="4" (
    set /p install_dir="Digite o caminho completo: "
) else (
    echo ❌ Opção inválida
    pause
    exit /b 1
)

echo.
echo 📥 Baixando BookVerse para: %install_dir%
echo.

REM Criar diretório se não existir
if not exist "%install_dir%" (
    mkdir "%install_dir%"
)

REM Clonar repositório
cd /d "%install_dir%\.."
if exist "%install_dir%" (
    echo ⚠️ Diretório já existe. Atualizando...
    cd /d "%install_dir%"
    git pull origin main
) else (
    echo 📥 Clonando repositório...
    git clone https://github.com/yt-jpg/BookVerse.git
    cd /d "%install_dir%"
)

if %errorLevel% neq 0 (
    echo ❌ Erro ao baixar o projeto
    pause
    exit /b 1
)

echo ✅ Projeto baixado com sucesso!
echo.

echo 📦 Instalando dependências do servidor...
call npm install
if %errorLevel% neq 0 (
    echo ❌ Erro ao instalar dependências do servidor
    pause
    exit /b 1
)

echo 📦 Instalando dependências do cliente...
cd client
call npm install
if %errorLevel% neq 0 (
    echo ❌ Erro ao instalar dependências do cliente
    pause
    exit /b 1
)
cd ..

echo ⚙️ Configurando ambiente...
if not exist ".env" (
    copy ".env.example" ".env"
    echo ✅ Arquivo .env criado
)

if not exist "client\.env" (
    copy "client\.env.example" "client\.env"
    echo ✅ Arquivo client\.env criado
)

echo.
echo 🗄️ Configuração do banco de dados:
echo 1. MySQL (Recomendado)
echo 2. MongoDB
echo 3. Sem banco (apenas teste)
echo.
set /p db_choice="Escolha o banco (1-3): "

if "%db_choice%"=="1" (
    echo 📥 Instalando MySQL...
    winget install Oracle.MySQL --accept-package-agreements --accept-source-agreements
    echo ⚙️ Configurando MySQL no .env...
    powershell -Command "(Get-Content .env) -replace 'DB_TYPE=.*', 'DB_TYPE=mysql' | Set-Content .env"
    echo ✅ MySQL configurado
) else if "%db_choice%"=="2" (
    echo 📥 Instalando MongoDB...
    winget install MongoDB.Server --accept-package-agreements --accept-source-agreements
    echo ⚙️ Configurando MongoDB no .env...
    powershell -Command "(Get-Content .env) -replace 'DB_TYPE=.*', 'DB_TYPE=mongodb' | Set-Content .env"
    echo ✅ MongoDB configurado
) else (
    echo ⚠️ Continuando sem banco de dados
)

echo.
echo 🧪 Testando instalação...
call node diagnose.js

echo.
echo 🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo =====================================
echo.
echo 📁 Projeto instalado em: %install_dir%
echo.
echo 🚀 Para iniciar o projeto:
echo    1. Abra um terminal nesta pasta
echo    2. Execute: npm run dev
echo    3. Acesse: http://localhost:5000
echo.
echo 📚 Documentação:
echo    • README.md - Guia completo
echo    • QUICK-START.md - Início rápido
echo    • DATABASE-SETUP.md - Configuração do banco
echo.
echo 🔧 Comandos úteis:
echo    • npm run dev - Iniciar desenvolvimento
echo    • node diagnose.js - Verificar sistema
echo    • npm run build:optimized - Build de produção
echo.

REM Criar atalho na área de trabalho
echo 🔗 Criando atalho na área de trabalho...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\BookVerse.lnk'); $Shortcut.TargetPath = '%install_dir%'; $Shortcut.Save()"

echo ✅ Atalho criado na área de trabalho
echo.

set /p start_now="Deseja iniciar o projeto agora? (s/N): "
if /i "%start_now%"=="s" (
    echo 🚀 Iniciando BookVerse...
    start cmd /k "cd /d %install_dir% && npm run dev"
    echo ✅ Servidor iniciado em nova janela
    echo 🌐 Aguarde alguns segundos e acesse: http://localhost:5000
)

echo.
echo 🎯 Instalação finalizada!
echo Pressione qualquer tecla para sair...
pause >nul