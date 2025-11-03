#!/usr/bin/env python3
"""
BookVerse - Inicializador Git
Prepara o repositório para upload no GitHub
"""

import os
import subprocess
import sys

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

def run_command(command, description=""):
    """Executa comando e trata erros"""
    if description:
        print_info(f"{description}...")
    
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Erro: {e.stderr}")
        return False

def check_git():
    """Verifica se Git está instalado"""
    try:
        subprocess.run(['git', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Git não está instalado")
        return False

def init_repository():
    """Inicializa repositório Git"""
    print_info("Inicializando repositório Git...")
    
    # Verificar se já é um repositório
    if os.path.exists('.git'):
        print_warning("Repositório Git já existe")
        return True
    
    # Inicializar repositório
    if not run_command("git init", "Inicializando Git"):
        return False
    
    # Configurar branch principal
    run_command("git branch -M main", "Configurando branch main")
    
    return True

def setup_gitignore():
    """Verifica se .gitignore está correto"""
    if not os.path.exists('.gitignore'):
        print_error(".gitignore não encontrado")
        return False
    
    print_success(".gitignore encontrado")
    return True

def add_files():
    """Adiciona arquivos ao Git"""
    print_info("Adicionando arquivos ao Git...")
    
    # Adicionar todos os arquivos
    if not run_command("git add .", "Adicionando arquivos"):
        return False
    
    # Verificar status
    run_command("git status", "Status do repositório")
    
    return True

def create_initial_commit():
    """Cria commit inicial"""
    print_info("Criando commit inicial...")
    
    commit_message = "🚀 Initial commit: BookVerse v1.0.0\n\n✨ Features:\n- Deploy automático VPS com Python\n- Sistema completo de gerenciamento\n- Frontend React + Backend Node.js\n- Segurança avançada com firewall\n- SSL automático com Let's Encrypt\n- Dashboard administrativo\n- Sistema de notificações em tempo real"
    
    if not run_command(f'git commit -m "{commit_message}"', "Criando commit"):
        return False
    
    return True

def show_next_steps():
    """Mostra próximos passos"""
    print_info("\n📋 Próximos passos para GitHub:")
    print("1. Crie um repositório no GitHub: https://github.com/new")
    print("2. Execute os comandos:")
    print(f"   {Colors.CYAN}git remote add origin https://github.com/SEU_USUARIO/bookverse.git{Colors.ENDC}")
    print(f"   {Colors.CYAN}git push -u origin main{Colors.ENDC}")
    print("\n🔧 Ou use GitHub CLI:")
    print(f"   {Colors.CYAN}gh repo create bookverse --public --push{Colors.ENDC}")
    
    print("\n📚 Documentação criada:")
    print("- README.md - Documentação principal")
    print("- CONTRIBUTING.md - Guia de contribuição")
    print("- SECURITY.md - Política de segurança")
    print("- CHANGELOG.md - Histórico de mudanças")
    print("- LICENSE - Licença MIT")
    
    print("\n🤖 CI/CD configurado:")
    print("- .github/workflows/ci.yml - GitHub Actions")
    print("- Templates para issues e PRs")

def main():
    """Função principal"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("🚀 BookVerse - Inicializador Git")
    print("=" * 40)
    print(f"{Colors.ENDC}")
    
    # Verificar Git
    if not check_git():
        print_error("Instale o Git primeiro: https://git-scm.com/")
        sys.exit(1)
    
    # Verificar se estamos no diretório correto
    if not os.path.exists('package.json'):
        print_error("Execute este script no diretório raiz do BookVerse")
        sys.exit(1)
    
    # Executar etapas
    if not init_repository():
        sys.exit(1)
    
    if not setup_gitignore():
        sys.exit(1)
    
    if not add_files():
        sys.exit(1)
    
    if not create_initial_commit():
        sys.exit(1)
    
    print_success("Repositório Git preparado com sucesso!")
    show_next_steps()

if __name__ == "__main__":
    main()