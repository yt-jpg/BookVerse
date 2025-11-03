#!/usr/bin/env python3
"""
BookVerse - Instruções de Deploy
Mostra exatamente como fazer deploy no VPS
"""

import os
import sys

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

def print_step(number, text):
    print(f"\n{Colors.OKBLUE}{Colors.BOLD}{number}️⃣ {text}{Colors.ENDC}")

def print_command(text):
    print(f"{Colors.WARNING}$ {text}{Colors.ENDC}")

def main():
    print_header("BookVerse - Instruções de Deploy VPS")
    
    # Verificar se está executando como root
    if os.geteuid() == 0:
        print_error("Você está executando como ROOT!")
        print_info("O deploy deve ser feito em duas etapas:")
        print_info("1. Configuração inicial (como root)")
        print_info("2. Deploy da aplicação (como usuário)")
        print()
        
        print_step("1", "CONFIGURAÇÃO INICIAL (Como Root)")
        print_info("Execute estes comandos como root:")
        print_command("curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/setup-user.sh -o setup-user.sh")
        print_command("chmod +x setup-user.sh")
        print_command("./setup-user.sh")
        print()
        print_success("Isso criará o usuário 'bookverse' e configurará o ambiente")
        
        print_step("2", "DEPLOY DA APLICAÇÃO (Como Usuário)")
        print_info("Após a configuração inicial, execute:")
        print_command("su - bookverse")
        print_command("./deploy-bookverse.sh")
        print()
        
        print_step("3", "CONFIGURAR SSL (Opcional)")
        print_info("Para configurar HTTPS com seu domínio:")
        print_command("exit  # Voltar para root")
        print_command("certbot --nginx -d seu-dominio.com")
        
    else:
        username = os.getenv('USER', 'unknown')
        print_success(f"Executando como usuário: {username}")
        
        if username == 'bookverse':
            print_info("Perfeito! Você está no usuário correto.")
            print_step("1", "DEPLOY AUTOMÁTICO")
            print_info("Execute o script de deploy:")
            print_command("./deploy-bookverse.sh")
            print()
            print_info("OU faça deploy manual:")
            print_command("mkdir -p ~/apps && cd ~/apps")
            print_command("git clone https://github.com/yt-jpg/BookVerse.git")
            print_command("cd BookVerse")
            print_command("npm install && cd client && npm install && cd ..")
            print_command("cp .env.example .env")
            print_command("nano .env  # Configure suas variáveis")
            print_command("npm run build:optimized")
            print_command("pm2 start server/server-optimized.js --name bookverse")
            print_command("pm2 save && pm2 startup")
            
        else:
            print_warning(f"Você está como usuário '{username}', mas recomendamos usar 'bookverse'")
            print_info("Opções:")
            print_info("1. Continuar com usuário atual (não recomendado)")
            print_info("2. Criar usuário bookverse (recomendado)")
            print()
            
            choice = input("Continuar mesmo assim? (s/N): ").strip().lower()
            if choice == 's':
                print_step("1", "DEPLOY COM USUÁRIO ATUAL")
                print_warning("Continuando com usuário atual...")
                print_command("python3 deploy_vps.py")
            else:
                print_info("Para criar usuário bookverse, execute como root:")
                print_command("sudo ./setup-user.sh")
                print_command("su - bookverse")
                sys.exit(0)
    
    print()
    print_header("INFORMAÇÕES IMPORTANTES")
    
    print_info("📋 Após o deploy:")
    print("   • Aplicação: http://SEU_IP:5000")
    print("   • Monitorar: pm2 status")
    print("   • Logs: pm2 logs bookverse")
    print("   • Restart: pm2 restart bookverse")
    
    print()
    print_info("🔧 Arquivos importantes:")
    print("   • ~/.env - Configurações da aplicação")
    print("   • ~/apps/BookVerse - Código da aplicação")
    print("   • ~/backups/ - Backups automáticos")
    print("   • ~/logs/ - Logs da aplicação")
    
    print()
    print_info("📚 Documentação:")
    print("   • DEPLOY-VPS.md - Guia completo")
    print("   • DEPLOY-QUICK.md - Guia rápido")
    print("   • README.md - Documentação geral")
    
    print()
    print_info("🆘 Suporte:")
    print("   • GitHub: https://github.com/yt-jpg/BookVerse/issues")
    print("   • Logs: pm2 logs bookverse")
    print("   • Monitor: ./monitor-bookverse.sh")
    
    print()
    print_success("🎉 Boa sorte com seu deploy!")

if __name__ == "__main__":
    main()