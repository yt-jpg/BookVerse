#!/bin/bash

# BookVerse Docker Setup Script
# Configura e inicia a aplicação usando Docker

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🐳 BOOKVERSE DOCKER SETUP                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Instale o Docker primeiro.${NC}"
    echo "📖 Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker encontrado${NC}"

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker não está rodando. Inicie o Docker e tente novamente.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está rodando${NC}"

# Criar arquivo .env se não existir
if [[ ! -f .env ]]; then
    echo -e "${YELLOW}⚙️ Criando arquivo de configuração...${NC}"
    
    # Gerar JWT secret aleatório
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d "=+/" | cut -c1-32)
    
    cat > .env << EOF
# BookVerse Configuration
NODE_ENV=production
PORT=5000
SITE_NAME=BookVerse

# Database
MONGODB_URI=mongodb://mongo:27017/bookverse
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$(openssl rand -hex 16)

# Security
JWT_SECRET=$JWT_SECRET

# Features
ALLOW_REGISTRATION=true
REQUIRE_EMAIL_VERIFICATION=false
MAX_FILE_SIZE=50MB

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
EOF
    
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${BLUE}ℹ️ Usando arquivo .env existente${NC}"
fi

# Criar diretórios necessários
echo -e "${YELLOW}📁 Criando diretórios...${NC}"
mkdir -p uploads logs ssl

# Verificar se existe docker-compose.yml
if [[ ! -f docker-compose.yml ]]; then
    echo -e "${RED}❌ Arquivo docker-compose.yml não encontrado${NC}"
    echo "Execute este script do diretório installers/docker-installer/"
    exit 1
fi

# Parar containers existentes (se houver)
echo -e "${YELLOW}🛑 Parando containers existentes...${NC}"
docker-compose down 2>/dev/null || true

# Limpar volumes órfãos (opcional)
read -p "Deseja limpar dados antigos? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Limpando volumes antigos...${NC}"
    docker-compose down -v
    docker system prune -f
fi

# Build e start dos containers
echo -e "${BLUE}🏗️ Construindo e iniciando containers...${NC}"

# Usar docker-compose ou docker compose baseado na disponibilidade
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

$COMPOSE_CMD build --no-cache
$COMPOSE_CMD up -d

# Aguardar containers iniciarem
echo -e "${YELLOW}⏳ Aguardando containers iniciarem...${NC}"
sleep 10

# Verificar status dos containers
echo -e "${BLUE}📊 Status dos containers:${NC}"
$COMPOSE_CMD ps

# Verificar se a aplicação está respondendo
echo -e "${YELLOW}🔍 Verificando aplicação...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5000/api/status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação está respondendo!${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Aplicação não está respondendo após 30 tentativas${NC}"
        echo -e "${YELLOW}📋 Logs da aplicação:${NC}"
        $COMPOSE_CMD logs bookverse
        exit 1
    fi
    
    echo -n "."
    sleep 1
done

# Configurar SSL (opcional)
read -p "Deseja configurar SSL com certificado auto-assinado? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔐 Gerando certificado SSL...${NC}"
    
    if command -v openssl &> /dev/null; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=BR/ST=State/L=City/O=BookVerse/CN=localhost"
        
        echo -e "${GREEN}✅ Certificado SSL gerado${NC}"
        echo -e "${BLUE}ℹ️ Descomente as linhas HTTPS no nginx.conf e reinicie${NC}"
    else
        echo -e "${YELLOW}⚠️ OpenSSL não encontrado. Pule a configuração SSL.${NC}"
    fi
fi

# Mostrar informações finais
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 SETUP CONCLUÍDO                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📍 URLs de Acesso:${NC}"
echo -e "   🌐 Aplicação: http://localhost:5000"
echo -e "   🗄️ MongoDB: mongodb://localhost:27017"

echo -e "\n${BLUE}🔧 Comandos Úteis:${NC}"
echo -e "   $COMPOSE_CMD logs -f           # Ver logs em tempo real"
echo -e "   $COMPOSE_CMD restart           # Reiniciar todos os serviços"
echo -e "   $COMPOSE_CMD stop              # Parar todos os serviços"
echo -e "   $COMPOSE_CMD down              # Parar e remover containers"
echo -e "   $COMPOSE_CMD ps                # Ver status dos containers"

echo -e "\n${BLUE}📁 Estrutura:${NC}"
echo -e "   📂 uploads/     # Arquivos enviados"
echo -e "   📂 logs/        # Logs da aplicação"
echo -e "   📂 ssl/         # Certificados SSL"

echo -e "\n${YELLOW}⚠️ Próximos Passos:${NC}"
echo -e "   1. Acesse http://localhost:5000"
echo -e "   2. Complete o setup inicial"
echo -e "   3. Crie sua conta de administrador"
echo -e "   4. Configure backup dos volumes Docker"

echo -e "\n${BLUE}💾 Backup dos Dados:${NC}"
echo -e "   docker run --rm -v bookverse_mongo-data:/data -v \$(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data"

echo -e "\n${GREEN}🚀 BookVerse está rodando!${NC}"