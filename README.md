# 📚 BookVerse - Sistema de Biblioteca Digital

> Sistema completo de biblioteca digital com performance otimizada, interface moderna e recursos avançados.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Performance](https://img.shields.io/badge/Lighthouse-90+-brightgreen.svg)](https://developers.google.com/web/tools/lighthouse)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI/CD](https://github.com/yt-jpg/BookVerse/workflows/🚀%20CI/CD%20Pipeline%20-%20BookVerse/badge.svg)](https://github.com/yt-jpg/BookVerse/actions)

## 🚀 Características Principais

### 📖 Funcionalidades
- **Catálogo Digital**: Gerenciamento completo de livros e autores
- **Sistema de Usuários**: Autenticação segura com JWT
- **Busca Avançada**: Filtros inteligentes e busca em tempo real
- **Notificações**: Sistema de notificações em tempo real
- **Responsivo**: Interface adaptável para todos os dispositivos
- **Multilíngue**: Suporte a múltiplos idiomas
- **Temas**: Modo claro e escuro

### ⚡ Performance Otimizada
- **Lighthouse Score**: 90+ em todas as métricas
- **Carregamento**: < 2 segundos
- **Tempo de Resposta**: < 200ms
- **Cache Inteligente**: Redis + Service Workers
- **Lazy Loading**: Componentes e imagens sob demanda
- **Virtual Scrolling**: Listas com milhares de itens
- **Code Splitting**: Bundles otimizados

### 🛡️ Segurança
- **Firewall Integrado**: Proteção contra ataques
- **Rate Limiting**: Proteção contra spam
- **Sanitização**: Proteção contra XSS e SQL Injection
- **HTTPS**: Certificados SSL automáticos
- **Backup**: Sistema de backup automático

## 🎯 Quick Start

### Pré-requisitos
- Node.js 16+
- Python 3.8+
- MongoDB ou MySQL

### 🚀 Instalação Inteligente

#### 🌐 Método 1: Instalador Web (Recomendado)
```bash
# Iniciar instalador web com detecção automática
npm run web-installer
# Acesse: http://localhost:8080
```
**Funcionalidades:**
- 🔍 Detecção automática de plataforma (Windows, macOS, Linux)
- 🎯 Configuração inteligente baseada no seu sistema
- 📱 Interface responsiva que funciona em qualquer dispositivo
- 🛠️ Scripts personalizados gerados automaticamente

#### 🎯 Método 2: Setup Inteligente
```bash
# Setup interativo com detecção automática
node setup.js
```

#### ⚡ Método 3: Scripts Automáticos
```bash
# Linux/Mac
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install.sh | bash

# Windows (PowerShell como Administrador)
curl -o install.bat https://raw.githubusercontent.com/yt-jpg/BookVerse/main/install.bat && install.bat
```

#### 🔧 Método 4: Manual
```bash
# Clonar repositório
git clone https://github.com/yt-jpg/BookVerse.git
cd BookVerse

# Instalar dependências
npm install
cd client && npm install && cd ..

# Configurar ambiente
cp .env.example .env
cp client/.env.example client/.env
# Edite os arquivos .env com suas configurações

# Iniciar desenvolvimento
npm run dev
```

#### 🔍 Diagnóstico do Sistema
```bash
# Verificar configuração e dependências
npm run diagnose
```

### Scripts Disponíveis

```bash
# Instalação e Configuração
npm run setup              # Setup inteligente com detecção automática
npm run diagnose           # Diagnóstico completo do sistema
npm run web-installer      # Instalador web (http://localhost:8080)

# Desenvolvimento
npm run dev                # Servidor de desenvolvimento
npm run start:optimized    # Servidor otimizado para produção

# Build
npm run build              # Build do cliente
npm run build:optimized    # Build otimizado

# Utilitários
npm run create-admin       # Criar usuário admin
```

## 📁 Estrutura do Projeto

```
bookverse/
├── 📁 server/                 # Backend Node.js/Express
│   ├── 📁 routes/            # Rotas da API
│   ├── 📁 models/            # Modelos do banco de dados
│   ├── 📁 middleware/        # Middlewares personalizados
│   ├── 📁 config/            # Configurações
│   └── 📄 server-optimized.js # Servidor otimizado
├── 📁 client/                # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/    # Componentes React
│   │   ├── 📁 hooks/         # Hooks personalizados
│   │   ├── 📁 utils/         # Utilitários
│   │   └── 📁 contexts/      # Contextos React
│   ├── 📁 public/            # Arquivos públicos
│   └── 📄 craco.config.js    # Configuração otimizada
├── 📁 installers/            # Scripts de instalação
├── 📄 performance-monitor.py  # Monitor de performance
├── 📄 optimize.py            # Script de otimização
└── 📄 deploy_vps.py          # Script de deploy
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/bookverse
# OU para MySQL:
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=senha
# DB_NAME=bookverse

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRE=7d

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHE=true
CACHE_TTL=3600

# Monitoramento
ENABLE_MONITORING=true
```

### Configuração do Cliente

Crie um arquivo `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ANALYTICS_ENDPOINT=https://analytics.example.com
```

## 🚀 Deploy

### Produção

```bash
# Build de produção
npm run build:optimized

# Iniciar servidor otimizado
npm run start:optimized
```

### Docker

```bash
cd installers/docker-installer
docker-compose up -d
```

## 📊 Performance

### Métricas Alvo
- **Lighthouse Performance**: > 90
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### Monitoramento

```bash
# Monitor em tempo real
python3 performance-monitor.py

# Auditoria Lighthouse
npm run lighthouse

# Métricas do sistema
npm run performance
```

## 🛡️ Segurança

### Recursos Implementados
- ✅ Helmet.js para headers de segurança
- ✅ Rate limiting por IP
- ✅ Sanitização de dados
- ✅ Validação de entrada
- ✅ Firewall de aplicação
- ✅ Proteção CSRF
- ✅ Criptografia de senhas

### Configuração de Firewall

```bash
# Ativar firewall
python3 manage.py firewall --enable

# Configurar regras
python3 manage.py firewall --config
```

## 🔄 Backup e Recuperação

```bash
# Backup automático
python3 manage.py backup

# Restaurar backup
python3 manage.py restore --file backup_20231103.sql

# Monitorar sistema
python3 monitor.py
```

## 🧪 Testes

```bash
# Testes do servidor
npm test

# Testes do cliente
cd client && npm test

# Testes de performance
npm run performance
```

## 📚 Documentação

- [📖 Guia de Performance](README-PERFORMANCE.md)
- [🚀 Quick Start](QUICK-START.md)
- [🔧 API Documentation](docs/API.md)
- [🎨 Component Library](docs/COMPONENTS.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (2024-11-03)
- ✨ Sistema completo de biblioteca digital
- ⚡ Otimizações de performance implementadas
- 🛡️ Sistema de segurança robusto
- 📊 Monitoramento em tempo real
- 🚀 Deploy automatizado

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome]
- **Performance Engineer**: Kiro AI
- **Security Consultant**: Kiro AI

## 🆘 Suporte

- 📧 Email: suporte@bookverse.com
- 💬 Discord: [BookVerse Community]
- 📖 Wiki: [GitHub Wiki]
- 🐛 Issues: [GitHub Issues]

## 🌟 Agradecimentos

- React Team pela excelente biblioteca
- Express.js pela simplicidade
- Comunidade open source

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[🚀 Demo](https://bookverse-demo.com) • [📖 Docs](https://docs.bookverse.com) • [💬 Community](https://discord.gg/bookverse)

</div>
