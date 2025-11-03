#!/usr/bin/env python3
"""
🚀 BookVerse - Instalação e Execução Automática
Script único que faz tudo: baixa, instala e executa o projeto
"""

import os
import sys
import subprocess
import platform
import time
import urllib.request
import json
import secrets
import string

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
    print("=" * 50)

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def run_command(command, description="", check=True, shell=True):
    """Executa comando e trata erros"""
    if description:
        print_info(f"{description}...")
    
    try:
        result = subprocess.run(command, shell=shell, capture_output=True, text=True, check=check)
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.CalledProcessError as e:
        if check:
            print_error(f"Erro ao executar: {command}")
            print_error(f"Erro: {e.stderr}")
            return None, e.stderr
        return e.stdout, e.stderr
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        return None, str(e)

def command_exists(command):
    """Verifica se comando existe"""
    try:
        subprocess.run([command, "--version"], capture_output=True, check=True)
        return True
    except:
        return False

def detect_os():
    """Detecta sistema operacional"""
    system = platform.system().lower()
    if system == "linux":
        try:
            with open("/etc/os-release", "r") as f:
                content = f.read().lower()
                if "ubuntu" in content or "debian" in content:
                    return "debian"
                elif "centos" in content or "rhel" in content or "fedora" in content:
                    return "redhat"
        except:
            pass
        return "linux"
    elif system == "darwin":
        return "macos"
    elif system == "windows":
        return "windows"
    return "unknown"

def install_dependencies():
    """Instala dependências do sistema"""
    print_header("Instalando Dependências do Sistema")
    
    os_type = detect_os()
    print_info(f"Sistema detectado: {os_type}")
    
    if os_type == "debian":
        # Ubuntu/Debian
        run_command("sudo apt-get update -qq", "Atualizando repositórios")
        run_command("sudo apt-get install -y curl wget git python3 python3-pip", "Instalando dependências básicas")
        
        # Node.js
        if not command_exists("node"):
            print_info("Instalando Node.js 18...")
            run_command("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
            run_command("sudo apt-get install -y nodejs")
        
        # MongoDB
        if not command_exists("mongod"):
            print_info("Instalando MongoDB...")
            run_command("sudo apt-get install -y mongodb", check=False)
            run_command("sudo systemctl start mongodb", check=False)
            run_command("sudo systemctl enable mongodb", check=False)
    
    elif os_type == "redhat":
        # CentOS/RHEL/Fedora
        run_command("sudo yum update -y", "Atualizando sistema")
        run_command("sudo yum install -y curl wget git python3 python3-pip", "Instalando dependências básicas")
        
        # Node.js
        if not command_exists("node"):
            print_info("Instalando Node.js 18...")
            run_command("curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -")
            run_command("sudo yum install -y nodejs")
    
    elif os_type == "macos":
        # macOS
        if not command_exists("brew"):
            print_info("Instalando Homebrew...")
            run_command('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')
        
        run_command("brew install node python3 git", "Instalando dependências")
        run_command("brew install mongodb/brew/mongodb-community", check=False)
        run_command("brew services start mongodb/brew/mongodb-community", check=False)
    
    elif os_type == "windows":
        print_warning("Windows detectado. Instale manualmente:")
        print_info("1. Node.js: https://nodejs.org/")
        print_info("2. Python: https://python.org/")
        print_info("3. Git: https://git-scm.com/")
        input("Pressione Enter após instalar as dependências...")
    
    # Verificar instalações
    verify_dependencies()

def verify_dependencies():
    """Verifica se dependências foram instaladas"""
    print_info("Verificando dependências...")
    
    dependencies = {
        "node": "Node.js",
        "npm": "npm", 
        "python3": "Python3",
        "git": "Git"
    }
    
    for cmd, name in dependencies.items():
        if command_exists(cmd):
            stdout, _ = run_command(f"{cmd} --version", check=False)
            print_success(f"{name} instalado: {stdout}")
        else:
            print_error(f"{name} não encontrado")
            if name in ["Node.js", "npm"]:
                sys.exit(1)

def download_project():
    """Baixa o projeto do GitHub"""
    print_header("Baixando Projeto BookVerse")
    
    project_dir = "BookVerse"
    
    if os.path.exists(project_dir):
        print_info("Diretório já existe. Atualizando...")
        os.chdir(project_dir)
        run_command("git pull origin main", "Atualizando repositório")
    else:
        print_info("Clonando repositório...")
        run_command("git clone https://github.com/yt-jpg/BookVerse.git", "Clonando projeto")
        os.chdir(project_dir)
    
    print_success("Projeto baixado com sucesso!")

def install_project_dependencies():
    """Instala dependências do projeto"""
    print_header("Instalando Dependências do Projeto")
    
    # Dependências do servidor
    print_info("Instalando dependências do servidor...")
    run_command("npm install", "Instalando pacotes npm do servidor")
    
    # Dependências do cliente
    print_info("Instalando dependências do cliente...")
    os.chdir("client")
    run_command("npm install", "Instalando pacotes npm do cliente")
    os.chdir("..")
    
    # Dependências Python
    print_info("Instalando dependências Python...")
    run_command("pip3 install requests psutil", "Instalando pacotes Python", check=False)
    
    print_success("Todas as dependências instaladas!")

def setup_environment():
    """Configura arquivos de ambiente"""
    print_header("Configurando Ambiente")
    
    # Configurar servidor
    if not os.path.exists(".env"):
        print_info("Criando arquivo .env do servidor...")
        
        # Copiar exemplo
        with open(".env.example", "r") as f:
            env_content = f.read()
        
        # Gerar JWT secret
        jwt_secret = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        env_content = env_content.replace("seu_jwt_secret_super_seguro_aqui", jwt_secret)
        
        # Configurar para produção
        env_content = env_content.replace("NODE_ENV=development", "NODE_ENV=production")
        env_content = env_content.replace("HOST=localhost", "HOST=0.0.0.0")
        
        with open(".env", "w") as f:
            f.write(env_content)
    
    # Configurar cliente
    if not os.path.exists("client/.env"):
        print_info("Criando arquivo .env do cliente...")
        
        # Detectar IP local
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
        except:
            local_ip = "localhost"
        
        with open("client/.env.example", "r") as f:
            client_env = f.read()
        
        client_env = client_env.replace("localhost", local_ip)
        
        with open("client/.env", "w") as f:
            f.write(client_env)
    
    print_success("Ambiente configurado!")

def build_project():
    """Faz build do projeto"""
    print_header("Fazendo Build do Projeto")
    
    print_info("Fazendo build otimizado do cliente...")
    run_command("npm run build:optimized", "Build do cliente")
    
    print_success("Build concluído!")

def start_project():
    """Inicia o projeto"""
    print_header("Iniciando Projeto BookVerse")
    
    # Verificar se PM2 está instalado
    if not command_exists("pm2"):
        print_info("Instalando PM2...")
        run_command("sudo npm install -g pm2", "Instalando PM2 globalmente")
    
    # Parar processos existentes
    print_info("Parando processos existentes...")
    run_command("pm2 stop bookverse-server", check=False)
    run_command("pm2 delete bookverse-server", check=False)
    
    # Iniciar servidor
    print_info("Iniciando servidor...")
    run_command("pm2 start server/server-optimized.js --name bookverse-server", "Iniciando com PM2")
    
    # Salvar configuração
    run_command("pm2 save", "Salvando configuração PM2")
    
    # Configurar startup
    stdout, _ = run_command("pm2 startup", check=False)
    if "sudo" in stdout:
        print_info("Execute o comando mostrado acima para configurar startup automático")
    
    print_success("Servidor iniciado com PM2!")

def verify_installation():
    """Verifica se instalação foi bem-sucedida"""
    print_header("Verificando Instalação")
    
    print_info("Aguardando servidor inicializar...")
    time.sleep(5)
    
    # Testar servidor
    try:
        urllib.request.urlopen("http://localhost:5000", timeout=10)
        print_success("Servidor respondendo na porta 5000")
    except:
        print_warning("Servidor pode não estar respondendo ainda")
    
    # Mostrar status PM2
    print_info("Status do PM2:")
    stdout, _ = run_command("pm2 status", check=False)
    print(stdout)
    
    print_success("Verificação concluída!")

def show_final_info():
    """Mostra informações finais"""
    print_header("🎉 BookVerse Instalado e Executando!")
    
    # Detectar IP local
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "localhost"
    
    print(f"{Colors.OKGREEN}✅ Instalação concluída com sucesso!{Colors.ENDC}")
    print()
    print(f"{Colors.OKCYAN}🌐 Acesso:{Colors.ENDC}")
    print(f"   • Local: {Colors.WARNING}http://localhost:5000{Colors.ENDC}")
    print(f"   • Rede: {Colors.WARNING}http://{local_ip}:5000{Colors.ENDC}")
    print()
    print(f"{Colors.OKCYAN}🔧 Comandos úteis:{Colors.ENDC}")
    print(f"   • Status: {Colors.WARNING}pm2 status{Colors.ENDC}")
    print(f"   • Logs: {Colors.WARNING}pm2 logs bookverse-server{Colors.ENDC}")
    print(f"   • Restart: {Colors.WARNING}pm2 restart bookverse-server{Colors.ENDC}")
    print(f"   • Stop: {Colors.WARNING}pm2 stop bookverse-server{Colors.ENDC}")
    print(f"   • Monitor: {Colors.WARNING}pm2 monit{Colors.ENDC}")
    print()
    print(f"{Colors.OKCYAN}📊 Performance:{Colors.ENDC}")
    print(f"   • Monitor: {Colors.WARNING}python3 performance-monitor.py{Colors.ENDC}")
    print(f"   • Otimizar: {Colors.WARNING}python3 optimize.py{Colors.ENDC}")
    print()
    print(f"{Colors.OKCYAN}📚 Documentação:{Colors.ENDC}")
    print("   • README.md - Documentação principal")
    print("   • QUICK-START.md - Guia rápido")
    print("   • README-PERFORMANCE.md - Performance")
    print()
    print(f"{Colors.OKGREEN}🚀 Seu BookVerse está rodando!{Colors.ENDC}")

def main():
    """Função principal"""
    print_header("BookVerse - Instalação Automática Completa")
    print_info("Este script irá instalar e executar o BookVerse automaticamente")
    
    # Verificar se é root
    if os.geteuid() == 0:
        print_warning("Executando como root. Recomendamos usar um usuário normal.")
        response = input("Continuar mesmo assim? (s/N): ").strip().lower()
        if response != 's':
            print_info("Execute como usuário normal para maior segurança")
            sys.exit(0)
    
    try:
        # Executar instalação
        install_dependencies()
        download_project()
        install_project_dependencies()
        setup_environment()
        build_project()
        start_project()
        verify_installation()
        show_final_info()
        
        print_success("🎉 Instalação completa! BookVerse está rodando!")
        
    except KeyboardInterrupt:
        print_error("\nInstalação cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro durante instalação: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()