# 🚀 Guia de Deploy VPS - BookVerse

Este guia te ajudará a fazer deploy do BookVerse em um VPS Ubuntu/Debian de forma segura e otimizada.

## 📋 Pré-requisitos

- VPS Ubuntu 20.04+ ou Debian 11+
- Acesso root via SSH
- Domínio (opcional, mas recomendado)
- Pelo menos 1GB RAM e 10GB de espaço

## 🔧 Configuração Inicial (Como Root)

### 1. Conectar ao VPS
```bash
ssh root@SEU_IP_VPS
```

### 2. Atualizar Sistema
```bash
apt update && apt upgrade -y
```

### 3. Configurar Usuário (Recomendado)
```bash
# Baixar e executar script de configuração
wget https://raw.githubusercontent.com/yt-jpg/BookVerse/main/setup-user.sh
chmod +x setup-user.sh
./setup-user.sh
```

**OU criar usuário manualmente:**
```bash
# Criar usuário
adduser bookverse
usermod -aG sudo bookverse

# Configurar SSH
mkdir -p /home/bookverse/.ssh
chmod 700 /home/bookverse/.ssh
chown bookverse:bookverse /home/bookverse/.ssh
```

## 🚀 Deploy Automático (Usuário bookverse)

### 1. Fazer Login como Usuário
```bash
su - bookverse
# OU via SSH: ssh bookverse@SEU_IP_VPS
```

### 2. Executar Deploy Automático
```bash
# O script foi criado automaticamente pelo setup-user.sh
./deploy-bookverse.sh
```

**OU fazer deploy manual:**

### 3. Deploy Manual

```bash
# Criar diretório
mkdir -p ~/apps && cd ~/apps

# Clonar repositório
git clone https://github.com/yt-jpg/BookVerse.git
cd BookVerse

# Instalar dependências
npm install
cd client && npm install && cd ..

# Configurar ambiente
cp .env.example .env
nano .env  # Configure suas variáveis
```

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# Servidor
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Banco de Dados (MongoDB)
MONGODB_URI=mongodb://localhost:27017/bookverse

# OU MySQL
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_USER=bookverse
# DB_PASSWORD=sua_senha_segura
# DB_NAME=bookverse

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHE=true
CACHE_TTL=3600
```

### 5. Build e Deploy

```bash
# Build otimizado
npm run build:optimized

# Instalar PM2 (se não instalado)
sudo npm install -g pm2

# Iniciar servidor
pm2 start server/server-optimized.js --name bookverse

# Salvar configuração PM2
pm2 save
pm2 startup  # Seguir instruções
```

## 🗄️ Configuração do Banco de Dados

### MongoDB (Recomendado)

```bash
# Instalar MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Criar banco e usuário
mongo
> use bookverse
> db.createUser({
    user: "bookverse",
    pwd: "senha_segura",
    roles: ["readWrite"]
  })
> exit
```

### MySQL (Alternativo)

```bash
# Instalar MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Criar banco e usuário
sudo mysql
> CREATE DATABASE bookverse;
> CREATE USER 'bookverse'@'localhost' IDENTIFIED BY 'senha_segura';
> GRANT ALL PRIVILEGES ON bookverse.* TO 'bookverse'@'localhost';
> FLUSH PRIVILEGES;
> EXIT;
```

## 🔧 Configuração do Nginx (Recomendado)

### 1. Instalar Nginx
```bash
sudo apt install -y nginx
```

### 2. Configurar Virtual Host
```bash
sudo nano /etc/nginx/sites-available/bookverse
```

Adicione a configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Servir arquivos estáticos
    location / {
        root /home/bookverse/apps/BookVerse/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket para notificações
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/bookverse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuração SSL (HTTPS)

### 1. Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 3. Renovação Automática
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento e Manutenção

### 1. Monitorar Aplicação
```bash
# Status do PM2
pm2 status
pm2 monit

# Logs
pm2 logs bookverse

# Restart se necessário
pm2 restart bookverse
```

### 2. Script de Monitoramento
```bash
# Usar script criado automaticamente
./monitor-bookverse.sh
```

### 3. Backup Automático
```bash
# Criar script de backup
nano ~/backup-bookverse.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# Backup do banco MongoDB
mongodump --db bookverse --out "$BACKUP_DIR/mongo_$DATE"

# Backup dos arquivos
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C "$HOME/apps" BookVerse

# Manter apenas últimos 7 backups
find "$BACKUP_DIR" -name "mongo_*" -mtime +7 -exec rm -rf {} \;
find "$BACKUP_DIR" -name "files_*" -mtime +7 -delete

echo "✅ Backup concluído: $DATE"
```

```bash
chmod +x ~/backup-bookverse.sh

# Agendar backup diário
crontab -e
# Adicionar: 0 2 * * * /home/bookverse/backup-bookverse.sh
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Porta 5000 não acessível**
   ```bash
   sudo ufw allow 5000
   sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
   ```

2. **PM2 não inicia no boot**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Erro de permissões**
   ```bash
   sudo chown -R bookverse:bookverse /home/bookverse/apps/BookVerse
   ```

4. **Banco de dados não conecta**
   ```bash
   # Verificar status
   sudo systemctl status mongodb
   # OU
   sudo systemctl status mysql
   ```

### Logs Importantes
```bash
# Logs da aplicação
pm2 logs bookverse

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -f
```

## 🚀 Comandos Úteis

```bash
# Atualizar aplicação
cd ~/apps/BookVerse
git pull origin main
npm run build:optimized
pm2 restart bookverse

# Verificar performance
npm run lighthouse

# Monitor de recursos
htop
df -h
free -h

# Verificar portas
netstat -tlnp | grep -E ":80|:443|:5000"
```

## 📈 Otimizações de Produção

### 1. Configurar Redis
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
```

### 2. Configurar Swap (se pouca RAM)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. Otimizar Nginx
```bash
# Editar configuração
sudo nano /etc/nginx/nginx.conf

# Adicionar otimizações:
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

## 🎯 Checklist Final

- [ ] ✅ Usuário não-root criado
- [ ] ✅ Aplicação rodando com PM2
- [ ] ✅ Banco de dados configurado
- [ ] ✅ Nginx configurado
- [ ] ✅ SSL/HTTPS ativo
- [ ] ✅ Firewall configurado
- [ ] ✅ Backup automático
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Domínio apontando
- [ ] ✅ Performance testada

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique logs**: `pm2 logs bookverse`
2. **Teste conectividade**: `curl http://localhost:5000/api/health`
3. **Verifique recursos**: `./monitor-bookverse.sh`
4. **Consulte documentação**: [GitHub Issues](https://github.com/yt-jpg/BookVerse/issues)

---

**🎉 Parabéns! Seu BookVerse está rodando em produção!** 🚀