#!/usr/bin/env python3
"""
BookVerse - Iniciar Monitor
Script simples para iniciar o monitor de servidor
"""

import subprocess
import sys
import os

def main():
    print("🚀 Iniciando Monitor BookVerse...")
    
    # Verificar se monitor.py existe
    if not os.path.exists('monitor.py'):
        print("❌ Arquivo monitor.py não encontrado!")
        print("Execute este script no diretório raiz do BookVerse")
        sys.exit(1)
    
    try:
        # Executar monitor
        subprocess.run([sys.executable, 'monitor.py'])
    except KeyboardInterrupt:
        print("\n👋 Monitor encerrado")
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()