#!/bin/bash

echo "🚀 Iniciando Sistema de Performance - Biblioteca Digital"
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto!"
    exit 1
fi

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo "🔍 Verificando dependências..."

if ! command_exists node; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python3 não encontrado. Instale Python 3.8+ primeiro."
    exit 1
fi

echo "✅ Dependências verificadas!"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do servidor..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependências do cliente..."
    cd client && npm install && cd ..
fi

# Menu de opções
echo ""
echo "Escolha uma opção:"
echo "1. Servidor otimizado (produção)"
echo "2. Desenvolvimento com hot reload"
echo "3. Monitor de performance"
echo "4. Build otimizado"
echo "5. Auditoria Lighthouse"
echo "6. Desenvolvimento completo (servidor + cliente)"
echo "7. Instalar todas as dependências"

read -p "Digite sua escolha (1-7): " choice

case $choice in
    1)
        echo "🚀 Iniciando servidor otimizado..."
        npm run start:optimized
        ;;
    2)
        echo "🔧 Iniciando desenvolvimento..."
        npm run dev:optimized
        ;;
    3)
        echo "📊 Iniciando monitor de performance..."
        python3 performance-monitor.py
        ;;
    4)
        echo "🏗️ Fazendo build otimizado..."
        npm run build:optimized
        ;;
    5)
        echo "🔍 Executando auditoria Lighthouse..."
        npm run lighthouse
        ;;
    6)
        echo "🚀 Iniciando desenvolvimento completo..."
        npm run full-dev
        ;;
    7)
        echo "📦 Instalando todas as dependências..."
        npm run install-all
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac