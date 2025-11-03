#!/bin/bash

# BookVerse - Instalação Automática para Linux/Mac
# Execute: curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install.sh | bash

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

# Instalar dependências
install_dependencies() {
    print_header "Instalando Dependências"
    
    OS=$(detect_os)
    print_info "Sistema detectado: $OS"
    
    case $OS in
        "debian")
            print_info "Atualizando repositórios..."
            sudo apt-get update -qq
            
            print_info "Instalando dependências básicas..."
            sudo apt-get install -y curl wget git build-essential
            
            # Node.js
            if ! command_exists node; then
                print_info "Instalando Node.js 18..."
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            
            # Python
            if ! command_exists python3; then
                print_info "Instalando Python3..."
                sudo apt-get install -y python3 python3-pip
            fi
            ;;
            
        "redhat")
            print_info "Atualizando sistema..."
            sudo yum update -y
            
            print_info "Instalando dependências básicas..."
            sudo yum install -y curl wget git gcc gcc-c++ make
            
            # Node.js
            if ! command_exists node; then
                print_info "Instalando Node.js 18..."
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo yum install -y nodejs
            fi
            
            # Python
            if ! command_exists python3; then
                print_info "Instalando Python3..."
                sudo yum install -y python3 python3-pip
            fi
            ;;
            
        "macos")
            # Verificar se Homebrew está instalado
            if ! command_exists brew; then
                print_info "Instalando Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            print_info "Instalando dependências..."
            brew install node python3 git
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
        print_warning "Python3 não encontrado (opcional)"
    fi
}

# Escolher diretório de instalação
choose_directory() {
    print_header "Escolha do Diretório"
    
    echo "Onde deseja instalar o BookVerse?"
    echo "1. ~/BookVerse (Recomendado)"
    echo "2. ~/Desktop/BookVerse"
    echo "3. ~/Documents/BookVerse"
    echo "4. Diretório atual"
    echo "5. Personalizado"
    
    read -p "Digite sua escolha (1-5): " choice
    
    case $choice in
        1) INSTALL_DIR="$HOME/BookVerse" ;;
        2) INSTALL_DIR="$HOME/Desktop/BookVerse" ;;
        3) INSTALL_DIR="$HOME/Documents/BookVerse" ;;
        4) INSTALL_DIR="$(pwd)/BookVerse" ;;
        5) 
            read -p "Digite o caminho completo: " INSTALL_DIR
            ;;
        *) 
            print_error "Opção inválida"
            exit 1
            ;;
    esac
    
    print_info "Diretório de instalação: $INSTALL_DIR"
}

# Baixar projeto
download_project() {
    print_header "Baixando BookVerse"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Diretório já existe. Atualizando..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        print_info "Clonando repositório..."
        git clone https://github.com/yt-jpg/BookVerse.git "$INSTALL_DIR"
        cd "$INSTALL_DIR"
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
    
    # Dependências Python (opcional)
    if command_exists python3; then
        print_info "Instalando dependências Python..."
        pip3 install requests psutil 2>/dev/null || python3 -m pip install requests psutil 2>/dev/null || true
    fi
    
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
        if command_exists openssl; then
            JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
            sed -i.bak "s/seu_jwt_secret_aqui_mude_em_producao/$JWT_SECRET/g" .env
        fi
    fi
    
    # Configurar cliente
    if [ ! -f client/.env ]; then
        print_info "Criando arquivo .env do cliente..."
        cp client/.env.example client/.env
    fi
    
    print_success "Ambiente configurado!"
}

# Configurar banco de dados
setup_database() {
    print_header "Configuração do Banco de Dados"
    
    echo "Escolha o banco de dados:"
    echo "1. MySQL (Recomendado)"
    echo "2. MongoDB"
    echo "3. Sem banco (apenas teste)"
    
    read -p "Digite sua escolha (1-3): " db_choice
    
    case $db_choice in
        1)
            print_info "Configurando MySQL..."
            OS=$(detect_os)
            
            case $OS in
                "debian")
                    sudo apt-get install -y mysql-server
                    ;;
                "redhat")
                    sudo yum install -y mysql-server
                    ;;
                "macos")
                    brew install mysql
                    brew services start mysql
                    ;;
            esac
            
            # Configurar .env para MySQL
            sed -i.bak 's/DB_TYPE=.*/DB_TYPE=mysql/' .env
            print_success "MySQL configurado"
            ;;
            
        2)
            print_info "Configurando MongoDB..."
            OS=$(detect_os)
            
            case $OS in
                "debian")
                    sudo apt-get install -y mongodb
                    sudo systemctl start mongodb
                    sudo systemctl enable mongodb
                    ;;
                "redhat")
                    sudo yum install -y mongodb-server
                    sudo systemctl start mongod
                    sudo systemctl enable mongod
                    ;;
                "macos")
                    brew install mongodb/brew/mongodb-community
                    brew services start mongodb/brew/mongodb-community
                    ;;
            esac
            
            # Configurar .env para MongoDB
            sed -i.bak 's/DB_TYPE=.*/DB_TYPE=mongodb/' .env
            print_success "MongoDB configurado"
            ;;
            
        3)
            print_warning "Continuando sem banco de dados"
            ;;
            
        *)
            print_error "Opção inválida"
            exit 1
            ;;
    esac
}

# Testar instalação
test_installation() {
    print_header "Testando Instalação"
    
    if [ -f diagnose.js ]; then
        print_info "Executando diagnóstico..."
        node diagnose.js
    else
        print_warning "Arquivo de diagnóstico não encontrado"
    fi
}

# Criar atalhos
create_shortcuts() {
    print_header "Criando Atalhos"
    
    # Criar script de inicialização
    cat > start-bookverse.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando BookVerse..."
npm run dev
EOF
    
    chmod +x start-bookverse.sh
    print_success "Script de inicialização criado: ./start-bookverse.sh"
    
    # Adicionar ao PATH (opcional)
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> ~/.bashrc
        print_info "Diretório adicionado ao PATH"
    fi
}

# Mostrar informações finais
show_final_info() {
    print_header "🎉 Instalação Concluída!"
    
    echo -e "${GREEN}✅ BookVerse instalado com sucesso!${NC}"
    echo ""
    echo -e "${CYAN}📁 Localização: ${YELLOW}$INSTALL_DIR${NC}"
    echo ""
    echo -e "${CYAN}🚀 Para iniciar:${NC}"
    echo -e "   ${YELLOW}cd $INSTALL_DIR${NC}"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${CYAN}🌐 Acesso:${NC}"
    echo -e "   • Frontend: ${YELLOW}http://localhost:3000${NC}"
    echo -e "   • Backend: ${YELLOW}http://localhost:5000${NC}"
    echo ""
    echo -e "${CYAN}📚 Documentação:${NC}"
    echo "   • README.md - Guia completo"
    echo "   • QUICK-START.md - Início rápido"
    echo "   • DATABASE-SETUP.md - Configuração do banco"
    echo ""
    echo -e "${CYAN}🔧 Comandos úteis:${NC}"
    echo -e "   • ${YELLOW}npm run dev${NC} - Desenvolvimento"
    echo -e "   • ${YELLOW}node diagnose.js${NC} - Diagnóstico"
    echo -e "   • ${YELLOW}./start-bookverse.sh${NC} - Iniciar rápido"
    echo ""
}

# Função principal
main() {
    clear
    echo -e "${PURPLE}"
    echo "████████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗██████╗ ███████╗███████╗"
    echo "██╔══██║██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝"
    echo "██████╔╝██║   ██║██║   ██║█████╔╝ ██║   ██║█████╗  ██████╔╝███████╗█████╗  "
    echo "██╔══██╗██║   ██║██║   ██║██╔═██╗ ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  "
    echo "██████╔╝╚██████╔╝╚██████╔╝██║  ██╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗"
    echo "╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝"
    echo -e "${NC}"
    echo ""
    print_header "BookVerse - Instalação Automática"
    print_info "Este script irá instalar e configurar o BookVerse automaticamente"
    echo ""
    
    # Verificar se é root
    if [ "$EUID" -eq 0 ]; then
        print_warning "Executando como root. Recomendamos usar um usuário normal."
        read -p "Continuar mesmo assim? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Execute como usuário normal para maior segurança"
            exit 0
        fi
    fi
    
    # Executar instalação
    install_dependencies
    choose_directory
    download_project
    install_project_dependencies
    setup_environment
    setup_database
    test_installation
    create_shortcuts
    show_final_info
    
    # Perguntar se quer iniciar
    echo ""
    read -p "Deseja iniciar o BookVerse agora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Iniciando BookVerse..."
        npm run dev
    else
        print_success "Instalação finalizada! Execute 'npm run dev' quando estiver pronto."
    fi
}

# Executar script principal
main "$@"