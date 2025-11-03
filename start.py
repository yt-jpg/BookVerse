#!/usr/bin/env python3
"""
BookVerse - Inicializador Simples
Inicia a aplicação BookVerse de forma simples e rápida
"""

import os
import sys
import subprocess
import signal
import time
from pathlib import Path

class Colors:
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    CYAN = '\033[96m'

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.ENDC}")

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print_info("Verificando dependências...")
    
    # Verificar Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print_success(f"Node.js: {result.stdout.strip()}")
        else:
            print_error("Node.js não encontrado")
            return False
    except FileNotFoundError:
        print_error("Node.js não está instalado")
        return False
    
    # Verificar npm
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print_success(f"npm: {result.stdout.strip()}")
        else:
            print_error("npm não encontrado")
            return False
    except FileNotFoundError:
        print_error("npm não está instalado")
        return False
    
    return True

def install_dependencies():
    """Instala dependências se necessário"""
    if not os.path.exists('node_modules'):
        print_info("Instalando dependências do servidor...")
        result = subprocess.run(['npm', 'install'], cwd='.')
        if result.returncode != 0:
            print_error("Falha ao instalar dependências do servidor")
            return False
    
    if os.path.exists('client') and not os.path.exists('client/node_modules'):
        print_info("Instalando dependências do cliente...")
        result = subprocess.run(['npm', 'install'], cwd='client')
        if result.returncode != 0:
            print_error("Falha ao instalar dependências do cliente")
            return False
    
    return True

def build_frontend():
    """Faz build do frontend se necessário"""
    if os.path.exists('client') and not os.path.exists('client/build'):
        print_info("Fazendo build do frontend...")
        result = subprocess.run(['npm', 'run', 'build'], cwd='client')
        if result.returncode != 0:
            print_error("Falha no build do frontend")
            return False
        print_success("Build do frontend concluído")
    
    return True

def check_env_file():
    """Verifica se arquivo .env existe"""
    if not os.path.exists('.env'):
        print_warning("Arquivo .env não encontrado")
        create_env = input("Deseja criar um arquivo .env básico? (s/n): ")
        
        if create_env.lower() in ['s', 'sim', 'y', 'yes']:
            env_content = """# BookVerse - Configuração Básica
PORT=5000
NODE_ENV=development

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/bookverse

# JWT Secret (ALTERAR EM PRODUÇÃO)
JWT_SECRET=sua_chave_secreta_super_forte_aqui

# CORS
FRONTEND_URL=http://localhost:3000

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
"""
            with open('.env', 'w') as f:
                f.write(env_content)
            print_success("Arquivo .env criado")
        else:
            print_error("Arquivo .env é necessário para executar a aplicação")
            return False
    
    return True

def start_server():
    """Inicia o servidor"""
    print_info("Iniciando servidor BookVerse...")
    
    # Criar diretório de uploads se não existir
    os.makedirs('uploads', exist_ok=True)
    
    try:
        # Iniciar servidor
        process = subprocess.Popen(['node', 'server/server.js'])
        
        print_success("Servidor iniciado!")
        print_info("🌐 Acesse: http://localhost:5000")
        print_info("⚙️  Admin: http://localhost:5000/admin")
        print_info("📊 API Status: http://localhost:5000/api/status")
        print_info("\nPressione Ctrl+C para parar o servidor")
        
        # Aguardar sinal de interrupção
        def signal_handler(sig, frame):
            print_info("\nParando servidor...")
            process.terminate()
            process.wait()
            print_success("Servidor parado")
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        
        # Aguardar processo terminar
        process.wait()
        
    except FileNotFoundError:
        print_error("Arquivo server/server.js não encontrado")
        return False
    except Exception as e:
        print_error(f"Erro ao iniciar servidor: {e}")
        return False
    
    return True

def main():
    """Função principal"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("🚀 BookVerse - Inicializador")
    print("=" * 40)
    print(f"{Colors.ENDC}")
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('server/server.js'):
        print_error("Execute este script no diretório raiz do BookVerse")
        sys.exit(1)
    
    # Executar verificações e inicialização
    if not check_dependencies():
        print_error("Dependências não atendidas")
        sys.exit(1)
    
    if not install_dependencies():
        print_error("Falha na instalação de dependências")
        sys.exit(1)
    
    if not build_frontend():
        print_error("Falha no build do frontend")
        sys.exit(1)
    
    if not check_env_file():
        print_error("Configuração não encontrada")
        sys.exit(1)
    
    # Iniciar servidor
    start_server()

if __name__ == "__main__":
    main()