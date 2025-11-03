#!/usr/bin/env python3
"""
BookVerse - Instalador Automático VPS
Autor: BookVerse Team
Versão: 2.0.0

Instalação completa com um clique para VPS Ubuntu/Debian.
Instala e configura tudo automaticamente.
"""

import os
import sys
import subprocess
import json
import secrets
import string
import time
import urllib.request
from pathlib import Path

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}🚀 {text}{Colors.ENDC}")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def run_command(command, description="", check=True):
    """Executa comando e trata erros"""
    if description:
        print_info(f"{description}...")
    
    try:
        result = subprocess.run(command, shell=True, check=check, 
                              capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.strip())
        return result
    except subprocess.CalledProcessError as e:
        print_error(f"Erro ao executar: {command}")
        print_error(f"Saída: {e.stderr}")
        if check:
            sys.exit(1)
        return e

def check_system():
    """Verifica se o sistema é compatível"""
    print_header("Verificando Sistema")
    
    # Verificar se é Linux
    if os.name != 'posix':
        print_error("Este script funciona apenas em sistemas Linux")
        sys.exit(1)
    
    # Verificar distribuição
    try:
        with open('/etc/os-release', 'r') as f:
            os_info = f.read()
            if 'ubuntu' in os_info.lower() or 'debian' in os_info.lower():
                print_success("Sistema compatível detectado")
            else:
                print_warning("Sistema não testado, mas pode funcionar")
    except:
        print_warning("Não foi possível detectar a distribuição")

def install_dependencies():
    """Instala dependências do sistema"""
    print_header("Instalando Dependências do Sistema")
    
    # Atualizar sistema
    run_command("sudo apt update", "Atualizando lista de pacotes")
    
    # Instalar curl e wget se necessário
    run_command("sudo apt install -y curl wget gnupg2 software-properties-common", 
                "Instalando ferramentas básicas")
    
    # Instalar Node.js 18
    print_info("Instalando Node.js 18...")
    run_command("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
    run_command("sudo apt-get install -y nodejs")
    
    # Verificar instalação do Node.js
    result = run_command("node --version", check=False)
    if result.returncode == 0:
        print_success(f"Node.js instalado: {result.stdout.strip()}")
    else:
        print_error("Falha na instalação do Node.js")
        sys.exit(1)
    
    # Instalar MongoDB
    print_info("Instalando MongoDB...")
    run_command("wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -")
    run_command('echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list')
    run_command("sudo apt-get update")
    run_command("sudo apt-get install -y mongodb-org")
    
    # Iniciar MongoDB
    run_command("sudo systemctl start mongod")
    run_command("sudo systemctl enable mongod")
    
    # Instalar PM2
    run_command("sudo npm install -g pm2", "Instalando PM2")
    
    # Instalar Nginx
    run_command("sudo apt install -y nginx", "Instalando Nginx")
    
    print_success("Todas as dependências foram instaladas")

def setup_application():
    """Configura a aplicação"""
    print_header("Configurando Aplicação")
    
    # Criar diretório da aplicação
    app_dir = "/var/www/bookverse"
    run_command(f"sudo mkdir -p {app_dir}")
    run_command(f"sudo chown -R $USER:$USER {app_dir}")
    
    # Copiar arquivos (assumindo que estamos no diretório do projeto)
    current_dir = os.getcwd()
    print_info(f"Copiando arquivos de {current_dir} para {app_dir}")
    
    # Fazer build do frontend
    if os.path.exists("client"):
        run_command("cd client && npm install", "Instalando dependências do frontend")
        run_command("cd client && npm run build", "Fazendo build do frontend")
    
    # Copiar arquivos necessários
    run_command(f"cp -r server {app_dir}/")
    run_command(f"cp package.json {app_dir}/")
    run_command(f"cp README.md {app_dir}/")
    
    if os.path.exists("client/build"):
        run_command(f"cp -r client/build {app_dir}/client/")
    
    # Instalar dependências do backend
    run_command(f"cd {app_dir} && npm install --production", "Instalando dependências do backend")
    
    return app_dir

def generate_env_file(app_dir, domain):
    """Gera arquivo .env"""
    print_header("Configurando Variáveis de Ambiente")
    
    # Gerar JWT secret
    jwt_secret = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*') for _ in range(64))
    
    env_content = f"""# BookVerse - Configuração VPS
PORT=5000
NODE_ENV=production

# Banco de Dados MongoDB
MONGODB_URI=mongodb://localhost:27017/bookverse

# JWT Secret
JWT_SECRET={jwt_secret}

# CORS
FRONTEND_URL=https://{domain}

# Upload de arquivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Configurações VPS
HOSTING_TYPE=vps
SERVE_STATIC=true
"""
    
    env_path = os.path.join(app_dir, '.env')
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print_success("Arquivo .env criado")
    return env_path

def setup_nginx(domain, app_dir):
    """Configura Nginx"""
    print_header("Configurando Nginx")
    
    nginx_config = f"""server {{
    listen 80;
    server_name {domain} www.{domain};

    # Redirecionar HTTP para HTTPS (será configurado depois)
    # return 301 https://$server_name$request_uri;

    location / {{
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}

    # Servir arquivos estáticos diretamente
    location /uploads/ {{
        alias {app_dir}/uploads/;
        expires 1M;
        add_header Cache-Control "public, immutable";
    }}

    # Logs
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}}"""
    
    # Escrever configuração do Nginx
    config_path = f"/etc/nginx/sites-available/{domain}"
    with open(config_path, 'w') as f:
        f.write(nginx_config)
    
    # Ativar site
    run_command(f"sudo ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/")
    
    # Testar configuração
    run_command("sudo nginx -t", "Testando configuração do Nginx")
    
    # Reiniciar Nginx
    run_command("sudo systemctl restart nginx")
    run_command("sudo systemctl enable nginx")
    
    print_success("Nginx configurado")

def setup_pm2(app_dir):
    """Configura PM2"""
    print_header("Configurando PM2")
    
    # Criar arquivo de configuração do PM2
    pm2_config = {
        "apps": [{
            "name": "bookverse",
            "script": "server/server.js",
            "cwd": app_dir,
            "instances": 1,
            "exec_mode": "cluster",
            "env": {
                "NODE_ENV": "production"
            },
            "error_file": f"{app_dir}/logs/err.log",
            "out_file": f"{app_dir}/logs/out.log",
            "log_file": f"{app_dir}/logs/combined.log",
            "time": True,
            "watch": False,
            "max_memory_restart": "1G"
        }]
    }
    
    # Criar diretório de logs
    run_command(f"mkdir -p {app_dir}/logs")
    
    # Escrever configuração
    config_path = os.path.join(app_dir, 'ecosystem.config.json')
    with open(config_path, 'w') as f:
        json.dump(pm2_config, f, indent=2)
    
    # Iniciar aplicação com PM2
    run_command(f"cd {app_dir} && pm2 start ecosystem.config.json")
    
    # Configurar PM2 para iniciar no boot
    run_command("pm2 startup", "Configurando PM2 para iniciar no boot")
    run_command("pm2 save", "Salvando configuração do PM2")
    
    print_success("PM2 configurado")

def create_admin_user(app_dir):
    """Cria usuário administrador"""
    print_header("Criando Usuário Administrador")
    
    run_command(f"cd {app_dir} && npm run create-admin", "Criando usuário admin")
    
    print_success("Usuário administrador criado")

def setup_ssl(domain):
    """Configura SSL com Let's Encrypt"""
    print_header("Configurando SSL (Opcional)")
    
    response = input(f"{Colors.OKCYAN}Deseja configurar SSL gratuito com Let's Encrypt? (s/n): {Colors.ENDC}")
    
    if response.lower() in ['s', 'sim', 'y', 'yes']:
        # Instalar Certbot
        run_command("sudo apt install -y certbot python3-certbot-nginx")
        
        # Obter certificado
        run_command(f"sudo certbot --nginx -d {domain} -d www.{domain}", 
                   "Obtendo certificado SSL")
        
        # Configurar renovação automática
        run_command("sudo systemctl enable certbot.timer")
        
        print_success("SSL configurado com sucesso")
    else:
        print_info("SSL não configurado. Você pode configurar depois com: sudo certbot --nginx")

def setup_firewall():
    """Configura firewall básico"""
    print_header("Configurando Firewall")
    
    # Instalar UFW se não estiver instalado
    run_command("sudo apt install -y ufw", check=False)
    
    # Configurar regras básicas
    run_command("sudo ufw default deny incoming")
    run_command("sudo ufw default allow outgoing")
    run_command("sudo ufw allow ssh")
    run_command("sudo ufw allow 'Nginx Full'")
    
    # Ativar firewall
    run_command("sudo ufw --force enable")
    
    print_success("Firewall configurado")

def main():
    """Função principal"""
    print_header("BookVerse - Deploy Automático para VPS")
    print_info("Este script irá instalar e configurar automaticamente o BookVerse em seu VPS")
    
    # Verificar se é root
    if os.geteuid() == 0:
        print_error("Não execute este script como root. Use um usuário com sudo.")
        sys.exit(1)
    
    # Obter informações do usuário
    domain = input(f"{Colors.OKCYAN}Digite seu domínio (ex: meusite.com): {Colors.ENDC}").strip()
    if not domain:
        print_error("Domínio é obrigatório")
        sys.exit(1)
    
    try:
        # Executar etapas do deploy
        check_system()
        install_dependencies()
        app_dir = setup_application()
        generate_env_file(app_dir, domain)
        setup_nginx(domain, app_dir)
        setup_pm2(app_dir)
        create_admin_user(app_dir)
        setup_ssl(domain)
        setup_firewall()
        
        # Informações finais
        print_header("Deploy Concluído com Sucesso!")
        print_success(f"BookVerse está rodando em: http://{domain}")
        print_success(f"Painel Admin: http://{domain}/admin")
        print_success(f"API Status: http://{domain}/api/status")
        
        print_info("\n📋 Credenciais padrão:")
        print_info("Admin Supremo: admin_supremo / BookVerse2024!@#$%")
        
        print_info("\n🔧 Comandos úteis:")
        print_info("Ver logs: pm2 logs bookverse")
        print_info("Reiniciar: pm2 restart bookverse")
        print_info("Status: pm2 status")
        print_info("Nginx logs: sudo tail -f /var/log/nginx/access.log")
        
        print_info(f"\n📁 Arquivos da aplicação: {app_dir}")
        
    except KeyboardInterrupt:
        print_error("\nDeploy cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro durante o deploy: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()