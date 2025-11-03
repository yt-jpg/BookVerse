# 🚀 BookVerse - Instalação One-Click

## ⚡ Instalação em 1 Comando

### Linux/Mac (Bash)
```bash
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install-and-run.sh | bash
```

### Qualquer Sistema (Python)
```bash
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install-and-run.py | python3
```

### Download Manual
```bash
# Baixar script
wget https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install-and-run.sh
chmod +x install-and-run.sh

# Executar
./install-and-run.sh
```

## 🎯 O que o Script Faz

### 1. **Instala Dependências**
- Node.js 18+
- Python 3
- Git
- MongoDB (se disponível)
- PM2 (gerenciador de processos)

### 2. **Baixa o Projeto**
- Clona repositório do GitHub
- Ou atualiza se já existir

### 3. **Configura Ambiente**
- Instala dependências npm (servidor + cliente)
- Cria arquivos .env automaticamente
- Gera JWT secret seguro
- Detecta IP local automaticamente

### 4. **Faz Build**
- Build otimizado do React
- Minificação e compressão
- Otimizações de performance

### 5. **Inicia Aplicação**
- Servidor com PM2 (produção)
- Restart automático
- Logs centralizados
- Monitoramento integrado

## 📊 Resultado Final

Após executar o script:

- ✅ **Aplicação rodando**: http://localhost:5000
- ✅ **Acesso na rede**: http://SEU_IP:5000
- ✅ **PM2 configurado**: `pm2 status`
- ✅ **Logs disponíveis**: `pm2 logs bookverse-server`
- ✅ **Restart automático**: Em caso de crash
- ✅ **Performance otimizada**: Cache, compressão, etc.

## 🔧 Comandos Úteis

```bash
# Status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs bookverse-server

# Reiniciar aplicação
pm2 restart bookverse-server

# Parar aplicação
pm2 stop bookverse-server

# Monitor de recursos
pm2 monit

# Performance monitor
python3 performance-monitor.py
```

## 🛠️ Sistemas Suportados

- ✅ **Ubuntu/Debian** - Instalação automática completa
- ✅ **CentOS/RHEL/Fedora** - Instalação automática completa
- ✅ **macOS** - Com Homebrew
- ⚠️ **Windows** - Instalação manual de dependências

## 🔒 Segurança

- ✅ **Usuário não-root** recomendado
- ✅ **JWT secrets** gerados automaticamente
- ✅ **Variáveis de ambiente** configuradas
- ✅ **Firewall** configuração manual recomendada

## 📋 Pré-requisitos

- **Sistema**: Linux, macOS ou Windows
- **Acesso**: sudo (para instalar dependências)
- **Rede**: Conexão com internet
- **Espaço**: ~500MB livres

## 🚨 Troubleshooting

### Erro de Permissão
```bash
# Se erro de permissão, execute como usuário normal
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install-and-run.sh | bash
```

### Porta 5000 Ocupada
```bash
# Verificar o que está usando a porta
sudo lsof -i :5000

# Ou usar porta diferente editando .env
nano .env
# Alterar PORT=5000 para PORT=3001
pm2 restart bookverse-server
```

### Dependências Faltando
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install curl wget git

# CentOS/RHEL
sudo yum install curl wget git

# macOS
xcode-select --install
```

### MongoDB Não Instalado
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Ou use MySQL editando .env:
# DB_TYPE=mysql
```

## 🎉 Pronto!

Após executar o script, seu BookVerse estará:

- 🚀 **Rodando** em produção
- ⚡ **Otimizado** para performance
- 📊 **Monitorado** com PM2
- 🔄 **Reiniciando** automaticamente
- 📱 **Acessível** na rede local

**Acesse**: http://localhost:5000

---

**🎯 Um comando, aplicação completa rodando!** 🚀