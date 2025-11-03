#!/bin/bash

# 🚀 BookVerse - Instalação e Execução Automática
# Script único que faz tudo: baixa, instala e executa o projeto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de output
print_header() {
    echo -e "\n${PURPLE}🚀 $1${NC}"
    echo "=================================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Instalar dependências baseado no OS
install_dependencies() {
    print_header "Instalando Dependências"
    
    OS=$(detect_os)
    print_info "Sistema detectado: $OS"
    
    case $OS in
        "debian")
            print_info "Atualizando repositórios..."
            sudo apt-get update -qq
            
            print_info "Instalando dependências básicas..."
            sudo apt-get install -y curl wget git python3 python3-pip
            
            # Node.js
            if ! command_exists node; then
                print_info "Instalando Node.js 18..."
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            
            # MongoDB
            if ! command_exists mongod; then
                print_info "Instalando MongoDB..."
                sudo apt-get install -y mongodb
                sudo systemctl start mongodb
                sudo systemctl enable mongodb
            fi
            ;;
            
        "redhat")
            print_info "Atualizando repositórios..."
            sudo yum update -y
            
            print_info "Instalando dependências básicas..."
            sudo yum install -y curl wget git python3 python3-pip
            
            # Node.js
            if ! command_exists node; then
                print_info "Instalando Node.js 18..."
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo yum install -y nodejs
            fi
            ;;
            
        "macos")
            # Verificar se Homebrew está instalado
            if ! command_exists brew; then
                print_info "Instalando Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            print_info "Instalando dependências..."
            brew install node python3 git mongodb/brew/mongodb-community
            brew services start mongodb/brew/mongodb-community
            ;;
            
        *)
            print_warning "Sistema não reconhecido. Tentando instalação manual..."
            ;;
    esac
    
    # Verificar instalações
    if command_exists node; then
        print_success "Node.js $(node --version) instalado"
    else
        print_error "Falha ao instalar Node.js"
        exit 1
    fi
    
    if command_exists npm; then
        print_success "npm $(npm --version) instalado"
    else
        print_error "npm não encontrado"
        exit 1
    fi
    
    if command_exists python3; then
        print_success "Python3 $(python3 --version) instalado"
    else
        print_error "Python3 não encontrado"
        exit 1
    fi
}

# Baixar projeto
download_project() {
    print_header "Baixando Projeto BookVerse"
    
    PROJECT_DIR="BookVerse"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_info "Diretório já existe. Atualizando..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        print_info "Clonando repositório..."
        git clone https://github.com/yt-jpg/BookVerse.git
        cd "$PROJECT_DIR"
    fi
    
    print_success "Projeto baixado com sucesso!"
}

# Instalar dependências do projeto
install_project_dependencies() {
    print_header "Instalando Dependências do Projeto"
    
    # Dependências do servidor
    print_info "Instalando dependências do servidor..."
    npm install
    
    # Dependências do cliente
    print_info "Instalando dependências do cliente..."
    cd client
    npm install
    cd ..
    
    # Dependências Python
    print_info "Instalando dependências Python..."
    pip3 install requests psutil || python3 -m pip install requests psutil
    
    print_success "Todas as dependências instaladas!"
}

# Configurar ambiente
setup_environment() {
    print_header "Configurando Ambiente"
    
    # Configurar servidor
    if [ ! -f .env ]; then
        print_info "Criando arquivo .env do servidor..."
        cp .env.example .env
        
        # Gerar JWT secret aleatório
        JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        sed -i "s/seu_jwt_secret_super_seguro_aqui/$JWT_SECRET/g" .env
        
        # Configurar para produção
        sed -i "s/NODE_ENV=development/NODE_ENV=production/g" .env
        sed -i "s/HOST=localhost/HOST=0.0.0.0/g" .env
    fi
    
    # Configurar cliente
    if [ ! -f client/.env ]; then
        print_info "Criando arquivo .env do cliente..."
        cp client/.env.example client/.env
        
        # Detectar IP local
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        sed -i "s/localhost/$LOCAL_IP/g" client/.env
    fi
    
    print_success "Ambiente configurado!"
}

# Build do projeto
build_project() {
    print_header "Fazendo Build do Projeto"
    
    print_info "Fazendo build otimizado do cliente..."
    npm run build:optimized
    
    print_success "Build concluído!"
}

# Iniciar projeto
start_project() {
    print_header "Iniciando Projeto BookVerse"
    
    # Verificar se PM2 está instalado
    if ! command_exists pm2; then
        print_info "Instalando PM2..."
        sudo npm install -g pm2
    fi
    
    # Parar processos existentes
    print_info "Parando processos existentes..."
    pm2 stop bookverse-server 2>/dev/null || true
    pm2 delete bookverse-server 2>/dev/null || true
    
    # Iniciar servidor com PM2
    print_info "Iniciando servidor..."
    pm2 start server/server-optimized.js --name bookverse-server
    
    # Salvar configuração PM2
    pm2 save
    
    # Configurar PM2 para iniciar no boot
    pm2 startup | grep -E "sudo.*pm2" | bash || true
    
    print_success "Servidor iniciado com PM2!"
}

# Verificar se tudo está funcionando
verify_installation() {
    print_header "Verificando Instalação"
    
    # Aguardar servidor iniciar
    print_info "Aguardando servidor inicializar..."
    sleep 5
    
    # Detectar IP
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    # Testar servidor
    if curl -s http://localhost:5000 >/dev/null 2>&1; then
        print_success "Servidor respondendo na porta 5000"
    else
        print_warning "Servidor pode não estar respondendo ainda"
    fi
    
    # Mostrar status PM2
    print_info "Status do PM2:"
    pm2 status
    
    print_success "Verificação concluída!"
}

# Mostrar informações finais
show_final_info() {
    print_header "🎉 BookVerse Instalado e Executando!"
    
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    
    echo -e "${GREEN}✅ Instalação concluída com sucesso!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Acesso:${NC}"
    echo -e "   • Local: ${YELLOW}http://localhost:5000${NC}"
    echo -e "   • Rede: ${YELLOW}http://$LOCAL_IP:5000${NC}"
    echo ""
    echo -e "${CYAN}🔧 Comandos úteis:${NC}"
    echo -e "   • Status: ${YELLOW}pm2 status${NC}"
    echo -e "   • Logs: ${YELLOW}pm2 logs bookverse-server${NC}"
    echo -e "   • Restart: ${YELLOW}pm2 restart bookverse-server${NC}"
    echo -e "   • Stop: ${YELLOW}pm2 stop bookverse-server${NC}"
    echo -e "   • Monitor: ${YELLOW}pm2 monit${NC}"
    echo ""
    echo -e "${CYAN}📊 Performance:${NC}"
    echo -e "   • Monitor: ${YELLOW}python3 performance-monitor.py${NC}"
    echo -e "   • Otimizar: ${YELLOW}python3 optimize.py${NC}"
    echo ""
    echo -e "${CYAN}📚 Documentação:${NC}"
    echo -e "   • README.md - Documentação principal"
    echo -e "   • QUICK-START.md - Guia rápido"
    echo -e "   • README-PERFORMANCE.md - Performance"
    echo ""
    echo -e "${GREEN}🚀 Seu BookVerse está rodando!${NC}"
}

# Função principal
main() {
    print_header "BookVerse - Instalação Automática Completa"
    print_info "Este script irá instalar e executar o BookVerse automaticamente"
    
    # Verificar se é root
    if [ "$EUID" -eq 0 ]; then
        print_warning "Executando como root. Recomendamos usar um usuário normal."
        read -p "Continuar mesmo assim? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Criando usuário bookverse..."
            adduser --disabled-password --gecos "" bookverse || true
            usermod -aG sudo bookverse || true
            print_info "Execute: su - bookverse && curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install-and-run.sh | bash"
            exit 0
        fi
    fi
    
    # Executar instalação
    install_dependencies
    download_project
    install_project_dependencies
    setup_environment
    build_project
    start_project
    verify_installation
    show_final_info
    
    print_success "🎉 Instalação completa! BookVerse está rodando!"
}

# Executar script principal
main "$@"