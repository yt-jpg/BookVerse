# 🚀 Instalação Automática - BookVerse

## 🌐 Instalador Web Inteligente (Novo!)

### ⭐ Método Mais Fácil - Detecção Automática
```
🔗 Acesse: https://bookverse-installer.netlify.app
```

**Funcionalidades:**
- 🔍 **Detecção automática** da sua plataforma (Windows, macOS, Linux)
- 🎯 **Configuração inteligente** baseada no seu sistema
- 📱 **Interface responsiva** que funciona em qualquer dispositivo
- 🛠️ **Scripts personalizados** gerados automaticamente
- ⚙️ **Configuração manual** para usuários avançados

## ⚡ Instalação em 1 Comando

### Windows
```cmd
# Baixar e executar (como Administrador)
curl -o install.bat https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install.bat && install.bat
```

### Linux/Mac
```bash
# Instalação automática
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install.sh | bash
```

## 🎯 Setup Inteligente (Node.js)
```bash
# Detecção automática e configuração personalizada
node setup.js
```

## 🎯 O que o Script Faz

### 1. **Instala Dependências**
- ✅ Node.js 18+
- ✅ Python 3
- ✅ Git
- ✅ Ferramentas de build

### 2. **Baixa o Projeto**
- ✅ Clona do GitHub
- ✅ Ou atualiza se já existir

### 3. **Configura Ambiente**
- ✅ Instala dependências npm
- ✅ Cria arquivos .env
- ✅ Gera JWT secrets seguros

### 4. **Configura Banco de Dados**
- ✅ MySQL (recomendado)
- ✅ MongoDB (alternativo)
- ✅ Sem banco (apenas teste)

### 5. **Testa Instalação**
- ✅ Verifica dependências
- ✅ Testa configuração
- ✅ Cria atalhos

## 📋 Pré-requisitos

### Windows
- Windows 10/11
- Conexão com internet
- Executar como Administrador

### Linux
- Ubuntu 18.04+ / Debian 10+
- CentOS 7+ / RHEL 7+
- Fedora 30+
- Conexão com internet
- Acesso sudo

### macOS
- macOS 10.15+
- Xcode Command Line Tools
- Conexão com internet

## 🔧 Instalação Manual (se preferir)

### 1. Instalar Dependências

**Windows:**
```cmd
# Node.js
winget install OpenJS.NodeJS

# Git
winget install Git.Git

# Python
winget install Python.Python.3.11
```

**Ubuntu/Debian:**
```bash
# Atualizar sistema
sudo apt update

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Outras dependências
sudo apt install -y git python3 python3-pip build-essential
```

**macOS:**
```bash
# Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Dependências
brew install node python3 git
```

### 2. Baixar Projeto
```bash
git clone https://github.com/yt-jpg/BookVerse.git
cd BookVerse
```

### 3. Instalar Dependências
```bash
# Servidor
npm install

# Cliente
cd client && npm install && cd ..
```

### 4. Configurar Ambiente
```bash
# Copiar arquivos de exemplo
cp .env.example .env
cp client/.env.example client/.env

# Editar configurações (opcional)
nano .env
```

### 5. Iniciar Projeto
```bash
npm run dev
```

## 🗄️ Configuração do Banco

### MySQL (Recomendado)
```bash
# Ubuntu/Debian
sudo apt install mysql-server
sudo mysql_secure_installation

# Criar banco
sudo mysql -e "CREATE DATABASE bookverse;"

# Configurar .env
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=sua_senha
```

### MongoDB (Alternativo)
```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Configurar .env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/bookverse
```

### Sem Banco (Teste)
```bash
# O projeto funciona sem banco para testes
npm run dev
```

## 🚀 Após a Instalação

### Verificar Instalação
```bash
# Diagnóstico completo
node diagnose.js

# Testar servidor
npm run dev
```

### Acessar Aplicação
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Produção
npm run start:optimized

# Build otimizado
npm run build:optimized

# Diagnóstico
node diagnose.js
```

## 🐛 Troubleshooting

### Erro: "Node.js não encontrado"
```bash
# Verificar instalação
node --version
npm --version

# Reinstalar se necessário
# Windows: winget install OpenJS.NodeJS
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### Erro: "Permissão negada"
```bash
# Linux/Mac: Verificar permissões
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./BookVerse

# Windows: Executar como Administrador
```

### Erro: "Porta ocupada"
```bash
# Verificar processos
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000

# Matar processo se necessário
kill -9 $(lsof -t -i:5000)
```

### Erro: "Banco não conecta"
```bash
# Verificar status do banco
# MySQL
sudo systemctl status mysql

# MongoDB
sudo systemctl status mongodb

# Verificar configuração
cat .env | grep DB_
```

## 📊 Estrutura Após Instalação

```
BookVerse/
├── 📄 package.json          # Dependências do servidor
├── 📄 .env                  # Configurações do servidor
├── 📄 diagnose.js           # Script de diagnóstico
├── 📄 start-bookverse.sh    # Script de inicialização (Linux/Mac)
├── 📁 server/               # Código do servidor
├── 📁 client/               # Código do cliente React
│   ├── 📄 package.json      # Dependências do cliente
│   └── 📄 .env              # Configurações do cliente
├── 📁 docs/                 # Documentação
└── 📁 installers/           # Scripts de instalação
```

## 🎯 Próximos Passos

1. **Configurar banco de dados** (se necessário)
2. **Personalizar configurações** nos arquivos .env
3. **Desenvolver funcionalidades** personalizadas
4. **Fazer deploy** em produção

## 🆘 Suporte

- 📖 **Documentação**: README.md
- 🚀 **Início Rápido**: QUICK-START.md
- 🗄️ **Banco de Dados**: DATABASE-SETUP.md
- 🐛 **Issues**: [GitHub Issues](https://github.com/yt-jpg/BookVerse/issues)

---

**🎉 Instalação simples e rápida para qualquer máquina!** 🚀