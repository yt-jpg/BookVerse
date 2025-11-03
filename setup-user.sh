#!/bin/bash

# 🚀 BookVerse - Configuração de Usuário para Deploy
# Execute este script para configurar um usuário não-root para deploy

set -e

echo "🚀 BookVerse - Configuração de Usuário"
echo "======================================"

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root para criar usuário"
    echo "Execute: sudo ./setup-user.sh"
    exit 1
fi

# Função para gerar senha aleatória
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Criar usuário bookverse se não existir
USERNAME="bookverse"
if id "$USERNAME" &>/dev/null; then
    echo "✅ Usuário $USERNAME já existe"
else
    echo "📝 Criando usuário $USERNAME..."
    
    # Gerar senha aleatória
    PASSWORD=$(generate_password)
    
    # Criar usuário
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    
    # Adicionar ao grupo sudo
    usermod -aG sudo "$USERNAME"
    
    echo "✅ Usuário $USERNAME criado com sucesso!"
    echo "🔑 Senha temporária: $PASSWORD"
    echo "⚠️  IMPORTANTE: Anote esta senha e mude após o primeiro login!"
fi

# Configurar SSH para o usuário
echo "🔐 Configurando SSH..."

# Criar diretório .ssh se não existir
USER_HOME="/home/$USERNAME"
SSH_DIR="$USER_HOME/.ssh"

if [ ! -d "$SSH_DIR" ]; then
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
    chown "$USERNAME:$USERNAME" "$SSH_DIR"
fi

# Configurar sudoers para não pedir senha (opcional)
echo "🛡️ Configurando sudoers..."
if ! grep -q "$USERNAME ALL=(ALL) NOPASSWD:ALL" /etc/sudoers; then
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
    echo "✅ Sudoers configurado (sem senha para sudo)"
fi

# Instalar dependências básicas
echo "📦 Instalando dependências básicas..."
apt-get update
apt-get install -y curl wget git python3 python3-pip nodejs npm

# Configurar Node.js versão mais recente
echo "🟢 Configurando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalar PM2 globalmente
echo "⚙️ Instalando PM2..."
npm install -g pm2

# Configurar firewall básico
echo "🛡️ Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 5000

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
sudo -u "$USERNAME" mkdir -p "$USER_HOME/apps"
sudo -u "$USERNAME" mkdir -p "$USER_HOME/backups"
sudo -u "$USERNAME" mkdir -p "$USER_HOME/logs"

# Criar script de deploy para o usuário
cat > "$USER_HOME/deploy-bookverse.sh" << 'EOF'
#!/bin/bash

# 🚀 BookVerse - Deploy Script (Usuário)
# Execute este script como usuário bookverse

set -e

echo "🚀 Iniciando deploy do BookVerse..."

# Navegar para diretório de apps
cd ~/apps

# Clonar ou atualizar repositório
if [ -d "BookVerse" ]; then
    echo "📥 Atualizando repositório..."
    cd BookVerse
    git pull origin main
else
    echo "📥 Clonando repositório..."
    git clone https://github.com/yt-jpg/BookVerse.git
    cd BookVerse
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install
cd client && npm install && cd ..

# Configurar ambiente
echo "⚙️ Configurando ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Configure o arquivo .env antes de continuar!"
    echo "Editando .env..."
    nano .env
fi

# Build do cliente
echo "🏗️ Fazendo build do cliente..."
npm run build:optimized

# Parar serviços existentes
echo "⏹️ Parando serviços existentes..."
pm2 stop bookverse || true
pm2 delete bookverse || true

# Iniciar servidor com PM2
echo "🚀 Iniciando servidor..."
pm2 start server/server-optimized.js --name bookverse
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "🌐 Servidor rodando em: http://$(curl -s ifconfig.me):5000"
echo "📊 Monitorar com: pm2 monit"
echo "📋 Logs com: pm2 logs bookverse"
EOF

# Tornar script executável
chmod +x "$USER_HOME/deploy-bookverse.sh"
chown "$USERNAME:$USERNAME" "$USER_HOME/deploy-bookverse.sh"

# Criar script de monitoramento
cat > "$USER_HOME/monitor-bookverse.sh" << 'EOF'
#!/bin/bash

# 📊 BookVerse - Monitor Script

echo "📊 Status do BookVerse"
echo "====================="

# Status do PM2
echo "🔄 Status do PM2:"
pm2 status

echo ""
echo "💾 Uso de memória:"
pm2 show bookverse | grep -E "(memory|cpu)"

echo ""
echo "📋 Últimos logs:"
pm2 logs bookverse --lines 10

echo ""
echo "🌐 Portas em uso:"
netstat -tlnp | grep -E ":3000|:5000"

echo ""
echo "💻 Recursos do sistema:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disco: $(df -h / | awk 'NR==2{print $3 "/" $2 " (" $5 ")"}')"
EOF

chmod +x "$USER_HOME/monitor-bookverse.sh"
chown "$USERNAME:$USERNAME" "$USER_HOME/monitor-bookverse.sh"

# Informações finais
echo ""
echo "🎉 Configuração concluída!"
echo "========================="
echo ""
echo "👤 Usuário criado: $USERNAME"
echo "🏠 Diretório home: $USER_HOME"
echo "🔑 Senha temporária: $PASSWORD"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça login como usuário $USERNAME:"
echo "   su - $USERNAME"
echo ""
echo "2. Execute o deploy:"
echo "   ./deploy-bookverse.sh"
echo ""
echo "3. Monitore o sistema:"
echo "   ./monitor-bookverse.sh"
echo ""
echo "4. Configure SSL (opcional):"
echo "   sudo certbot --nginx -d seu-dominio.com"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Mude a senha do usuário após o primeiro login"
echo "- Configure o arquivo .env com suas credenciais"
echo "- Configure um domínio e SSL para produção"
echo ""
echo "🔗 Acesso:"
echo "- HTTP: http://$(curl -s ifconfig.me):5000"
echo "- SSH: ssh $USERNAME@$(curl -s ifconfig.me)"