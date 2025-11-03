#!/usr/bin/env python3
"""
Script para configurar repositório GitHub
Automatiza a criação e configuração do repositório
"""

import subprocess
import sys
import os
import json
import requests
from getpass import getpass

def run_command(command, check=True):
    """Executa comando no terminal"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=check)
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar: {command}")
        print(f"Erro: {e.stderr}")
        return None, e.stderr

def check_git_config():
    """Verifica configuração do Git"""
    print("🔍 Verificando configuração do Git...")
    
    name, _ = run_command("git config --global user.name", check=False)
    email, _ = run_command("git config --global user.email", check=False)
    
    if not name:
        name = input("Digite seu nome para o Git: ")
        run_command(f'git config --global user.name "{name}"')
    
    if not email:
        email = input("Digite seu email para o Git: ")
        run_command(f'git config --global user.email "{email}"')
    
    print(f"✅ Git configurado para: {name} <{email}>")
    return name, email

def create_github_repo():
    """Cria repositório no GitHub via API"""
    print("\n🚀 Configuração do GitHub")
    
    repo_name = input("Nome do repositório (padrão: bookverse): ").strip() or "bookverse"
    description = input("Descrição (padrão: Sistema de biblioteca digital): ").strip() or "Sistema de biblioteca digital"
    private = input("Repositório privado? (s/N): ").strip().lower() == 's'
    
    print("\nPara criar o repositório automaticamente, você precisa de um token do GitHub.")
    print("Crie um token em: https://github.com/settings/tokens")
    print("Permissões necessárias: repo, workflow")
    
    use_api = input("\nUsar API do GitHub? (s/N): ").strip().lower() == 's'
    
    if use_api:
        token = getpass("Token do GitHub: ")
        
        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        data = {
            'name': repo_name,
            'description': description,
            'private': private,
            'auto_init': False
        }
        
        try:
            response = requests.post('https://api.github.com/user/repos', 
                                   headers=headers, json=data)
            
            if response.status_code == 201:
                repo_info = response.json()
                print(f"✅ Repositório criado: {repo_info['html_url']}")
                return repo_info['clone_url'], repo_info['ssh_url']
            else:
                print(f"❌ Erro ao criar repositório: {response.json()}")
                return None, None
                
        except Exception as e:
            print(f"❌ Erro na API: {e}")
            return None, None
    
    else:
        print(f"\n📝 Instruções manuais:")
        print(f"1. Acesse: https://github.com/new")
        print(f"2. Nome: {repo_name}")
        print(f"3. Descrição: {description}")
        print(f"4. {'Privado' if private else 'Público'}")
        print(f"5. NÃO inicialize com README")
        
        input("\nPressione Enter após criar o repositório...")
        
        username = input("Seu username do GitHub: ")
        https_url = f"https://github.com/{username}/{repo_name}.git"
        ssh_url = f"git@github.com:{username}/{repo_name}.git"
        
        return https_url, ssh_url

def setup_remote(https_url, ssh_url):
    """Configura remote do repositório"""
    print("\n🔗 Configurando remote...")
    
    # Verificar se já existe remote
    stdout, _ = run_command("git remote -v", check=False)
    
    if "origin" in stdout:
        print("Remote 'origin' já existe. Removendo...")
        run_command("git remote remove origin", check=False)
    
    # Escolher tipo de URL
    use_ssh = input("Usar SSH (recomendado se configurado)? (S/n): ").strip().lower() != 'n'
    
    url = ssh_url if use_ssh else https_url
    
    run_command(f"git remote add origin {url}")
    print(f"✅ Remote configurado: {url}")
    
    return url

def push_to_github(url):
    """Faz push para o GitHub"""
    print("\n📤 Fazendo push para o GitHub...")
    
    # Verificar se há commits
    stdout, _ = run_command("git log --oneline", check=False)
    if not stdout:
        print("❌ Nenhum commit encontrado. Faça um commit primeiro.")
        return False
    
    # Push
    stdout, stderr = run_command("git push -u origin main", check=False)
    
    if "error" in stderr.lower() or "fatal" in stderr.lower():
        print(f"❌ Erro no push: {stderr}")
        
        if "ssh" in url.lower():
            print("\n💡 Dica: Configure sua chave SSH:")
            print("1. ssh-keygen -t ed25519 -C 'seu-email@example.com'")
            print("2. cat ~/.ssh/id_ed25519.pub")
            print("3. Adicione a chave em: https://github.com/settings/keys")
        
        return False
    
    print("✅ Push realizado com sucesso!")
    return True

def setup_github_actions():
    """Configura GitHub Actions"""
    print("\n⚙️ Configurando GitHub Actions...")
    
    if not os.path.exists(".github"):
        os.makedirs(".github")
    
    if not os.path.exists(".github/workflows"):
        os.makedirs(".github/workflows")
    
    # Workflow de CI/CD
    workflow = """name: 🚀 CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: 🧪 Tests
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm run install-all
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build:optimized

  performance:
    name: ⚡ Performance Audit
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm run install-all
    
    - name: Build project
      run: npm run build:optimized
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        configPath: './lighthouserc.json'
        uploadArtifacts: true

  deploy:
    name: 🚀 Deploy
    runs-on: ubuntu-latest
    needs: [test, performance]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: echo "Deploy configurado para produção"
"""
    
    with open(".github/workflows/ci-cd.yml", "w", encoding="utf-8") as f:
        f.write(workflow)
    
    # Configuração do Lighthouse CI
    lighthouse_config = {
        "ci": {
            "collect": {
                "startServerCommand": "npm run start:optimized",
                "url": ["http://localhost:5000"]
            },
            "assert": {
                "assertions": {
                    "categories:performance": ["error", {"minScore": 0.9}],
                    "categories:accessibility": ["error", {"minScore": 0.9}],
                    "categories:best-practices": ["error", {"minScore": 0.9}],
                    "categories:seo": ["error", {"minScore": 0.9}]
                }
            }
        }
    }
    
    with open("lighthouserc.json", "w", encoding="utf-8") as f:
        json.dump(lighthouse_config, f, indent=2)
    
    print("✅ GitHub Actions configurado!")

def create_issue_templates():
    """Cria templates de issues"""
    print("\n📝 Criando templates de issues...")
    
    if not os.path.exists(".github/ISSUE_TEMPLATE"):
        os.makedirs(".github/ISSUE_TEMPLATE")
    
    # Bug report
    bug_template = """---
name: 🐛 Bug Report
about: Reportar um bug
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Descrição do Bug
Uma descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

## ✅ Comportamento Esperado
Uma descrição clara do que você esperava que acontecesse.

## 📱 Screenshots
Se aplicável, adicione screenshots para ajudar a explicar o problema.

## 🖥️ Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

## 📋 Contexto Adicional
Adicione qualquer outro contexto sobre o problema aqui.
"""
    
    with open(".github/ISSUE_TEMPLATE/bug_report.md", "w", encoding="utf-8") as f:
        f.write(bug_template)
    
    # Feature request
    feature_template = """---
name: ✨ Feature Request
about: Sugerir uma nova funcionalidade
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## ✨ Descrição da Funcionalidade
Uma descrição clara e concisa da funcionalidade que você gostaria.

## 🎯 Problema que Resolve
Uma descrição clara do problema que esta funcionalidade resolveria.

## 💡 Solução Proposta
Uma descrição clara de como você gostaria que funcionasse.

## 🔄 Alternativas Consideradas
Uma descrição clara de quaisquer soluções alternativas que você considerou.

## 📋 Contexto Adicional
Adicione qualquer outro contexto ou screenshots sobre a solicitação aqui.
"""
    
    with open(".github/ISSUE_TEMPLATE/feature_request.md", "w", encoding="utf-8") as f:
        f.write(feature_template)
    
    print("✅ Templates de issues criados!")

def main():
    """Função principal"""
    print("🚀 Setup do Repositório GitHub - BookVerse")
    print("=" * 50)
    
    # Verificar se estamos em um repositório Git
    if not os.path.exists(".git"):
        print("❌ Este não é um repositório Git!")
        print("Execute: git init")
        return
    
    # Verificar configuração do Git
    check_git_config()
    
    # Criar repositório no GitHub
    https_url, ssh_url = create_github_repo()
    
    if not https_url:
        print("❌ Não foi possível configurar o repositório")
        return
    
    # Configurar remote
    url = setup_remote(https_url, ssh_url)
    
    # Configurar GitHub Actions
    setup_github_actions()
    
    # Criar templates
    create_issue_templates()
    
    # Commit das configurações
    run_command("git add .")
    run_command('git commit -m "🔧 config: Configuração do GitHub Actions e templates"', check=False)
    
    # Push para GitHub
    success = push_to_github(url)
    
    if success:
        print("\n🎉 Repositório configurado com sucesso!")
        print(f"🔗 URL: {https_url.replace('.git', '')}")
        print("\n📋 Próximos passos:")
        print("1. Configure secrets no GitHub (se necessário)")
        print("2. Ative GitHub Pages (se desejar)")
        print("3. Configure branch protection rules")
        print("4. Convide colaboradores")
    else:
        print("\n⚠️ Repositório criado, mas push falhou")
        print("Configure manualmente e tente novamente")

if __name__ == "__main__":
    main()