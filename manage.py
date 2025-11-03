#!/usr/bin/env python3
"""
BookVerse - Gerenciador da Aplicação
Gerencia a aplicação BookVerse com PM2 ou processo simples
"""

import os
import sys
import subprocess
import json
import argparse
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

def run_command(command, capture=True):
    """Executa comando e retorna resultado"""
    try:
        if capture:
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return result
        else:
            result = subprocess.run(command, shell=True)
            return result
    except Exception as e:
        print_error(f"Erro ao executar comando: {e}")
        return None

def check_pm2():
    """Verifica se PM2 está disponível"""
    result = run_command("pm2 --version")
    return result and result.returncode == 0

def start_app():
    """Inicia a aplicação"""
    print_info("Iniciando BookVerse...")
    
    if check_pm2():
        # Usar PM2
        print_info("Usando PM2 para gerenciar a aplicação")
        
        # Verificar se já está rodando
        result = run_command("pm2 list | grep bookverse")
        if result and "bookverse" in result.stdout:
            print_warning("Aplicação já está rodando")
            return
        
        # Iniciar com PM2
        result = run_command("pm2 start server/server.js --name bookverse")
        if result and result.returncode == 0:
            print_success("Aplicação iniciada com PM2")
            run_command("pm2 save", capture=False)
        else:
            print_error("Falha ao iniciar com PM2")
    else:
        # Usar processo simples
        print_info("PM2 não disponível, usando processo simples")
        print_info("Execute: python3 start.py")

def stop_app():
    """Para a aplicação"""
    print_info("Parando BookVerse...")
    
    if check_pm2():
        result = run_command("pm2 stop bookverse")
        if result and result.returncode == 0:
            print_success("Aplicação parada")
        else:
            print_warning("Aplicação pode não estar rodando")
    else:
        print_info("Use Ctrl+C no terminal onde a aplicação está rodando")

def restart_app():
    """Reinicia a aplicação"""
    print_info("Reiniciando BookVerse...")
    
    if check_pm2():
        result = run_command("pm2 restart bookverse")
        if result and result.returncode == 0:
            print_success("Aplicação reiniciada")
        else:
            print_error("Falha ao reiniciar aplicação")
    else:
        print_info("Para reiniciar sem PM2:")
        print_info("1. Pare a aplicação (Ctrl+C)")
        print_info("2. Execute: python3 start.py")

def status_app():
    """Mostra status da aplicação"""
    print_info("Status do BookVerse:")
    
    if check_pm2():
        result = run_command("pm2 list")
        if result:
            print(result.stdout)
        
        # Mostrar logs recentes
        print_info("\nLogs recentes:")
        result = run_command("pm2 logs bookverse --lines 10")
        if result:
            print(result.stdout)
    else:
        print_info("PM2 não disponível")
        
        # Verificar se processo está rodando
        result = run_command("pgrep -f 'node.*server.js'")
        if result and result.stdout.strip():
            print_success("Processo Node.js encontrado")
            print_info(f"PID: {result.stdout.strip()}")
        else:
            print_warning("Nenhum processo Node.js encontrado")

def logs_app():
    """Mostra logs da aplicação"""
    print_info("Logs do BookVerse:")
    
    if check_pm2():
        run_command("pm2 logs bookverse --lines 50", capture=False)
    else:
        print_info("PM2 não disponível")
        print_info("Logs são exibidos no terminal onde a aplicação está rodando")

def install_deps():
    """Instala dependências"""
    print_info("Instalando dependências...")
    
    # Backend
    result = run_command("npm install")
    if result and result.returncode == 0:
        print_success("Dependências do backend instaladas")
    else:
        print_error("Falha ao instalar dependências do backend")
        return
    
    # Frontend
    if os.path.exists('client'):
        result = run_command("cd client && npm install")
        if result and result.returncode == 0:
            print_success("Dependências do frontend instaladas")
        else:
            print_error("Falha ao instalar dependências do frontend")

def build_app():
    """Faz build da aplicação"""
    print_info("Fazendo build da aplicação...")
    
    if os.path.exists('client'):
        result = run_command("cd client && npm run build")
        if result and result.returncode == 0:
            print_success("Build do frontend concluído")
        else:
            print_error("Falha no build do frontend")
    else:
        print_warning("Diretório client não encontrado")

def create_admin():
    """Cria usuário administrador"""
    print_info("Criando usuário administrador...")
    
    result = run_command("npm run create-admin", capture=False)
    if result and result.returncode == 0:
        print_success("Usuário administrador criado")
    else:
        print_error("Falha ao criar usuário administrador")

def setup_pm2():
    """Configura PM2 para produção"""
    print_info("Configurando PM2 para produção...")
    
    if not check_pm2():
        print_error("PM2 não está instalado")
        print_info("Instale com: sudo npm install -g pm2")
        return
    
    # Criar configuração do PM2
    pm2_config = {
        "apps": [{
            "name": "bookverse",
            "script": "server/server.js",
            "instances": 1,
            "exec_mode": "cluster",
            "env": {
                "NODE_ENV": "production"
            },
            "error_file": "./logs/err.log",
            "out_file": "./logs/out.log",
            "log_file": "./logs/combined.log",
            "time": True,
            "watch": False,
            "max_memory_restart": "1G"
        }]
    }
    
    # Criar diretório de logs
    os.makedirs('logs', exist_ok=True)
    
    # Salvar configuração
    with open('ecosystem.config.json', 'w') as f:
        json.dump(pm2_config, f, indent=2)
    
    print_success("Configuração PM2 criada: ecosystem.config.json")
    print_info("Para usar: pm2 start ecosystem.config.json")

def monitor_app():
    """Inicia monitor em tempo real"""
    print_info("Iniciando monitor BookVerse...")
    
    try:
        result = run_command("python3 monitor.py", capture=False)
        return result and result.returncode == 0
    except KeyboardInterrupt:
        print_info("Monitor encerrado pelo usuário")
        return True
    except Exception as e:
        print_error(f"Erro ao iniciar monitor: {e}")
        return False

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='BookVerse - Gerenciador da Aplicação')
    parser.add_argument('action', choices=[
        'start', 'stop', 'restart', 'status', 'logs',
        'install', 'build', 'create-admin', 'setup-pm2', 'monitor'
    ], help='Ação a ser executada')
    
    args = parser.parse_args()
    
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("🚀 BookVerse - Gerenciador")
    print("=" * 40)
    print(f"{Colors.ENDC}")
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('server/server.js'):
        print_error("Execute este script no diretório raiz do BookVerse")
        sys.exit(1)
    
    # Executar ação
    if args.action == 'start':
        start_app()
    elif args.action == 'stop':
        stop_app()
    elif args.action == 'restart':
        restart_app()
    elif args.action == 'status':
        status_app()
    elif args.action == 'logs':
        logs_app()
    elif args.action == 'install':
        install_deps()
    elif args.action == 'build':
        build_app()
    elif args.action == 'create-admin':
        create_admin()
    elif args.action == 'setup-pm2':
        setup_pm2()
    elif args.action == 'monitor':
        monitor_app()

if __name__ == "__main__":
    main()