# 🚀 BookVerse - Plataforma de Livros Digitais

Uma plataforma moderna para buscar, visualizar e fazer download de livros digitais, otimizada para deploy em VPS com Python.

## ⚡ Deploy Rápido em VPS

### Opção 1: Deploy Automático (Recomendado)
```bash
# Fazer download do projeto
git clone https://github.com/seu-usuario/bookverse.git
cd bookverse

# Executar deploy automático
sudo python3 deploy_vps.py
```

### Opção 2: Inicialização Simples
```bash
# Iniciar aplicação localmente
python3 start.py
```

### Opção 3: Gerenciamento Avançado
```bash
# Instalar dependências
python3 manage.py install

# Fazer build
python3 manage.py build

# Criar admin
python3 manage.py create-admin

# Iniciar aplicação
python3 manage.py start

# Ver status
python3 manage.py status

# Ver logs
python3 manage.py logs
```

## 🛠️ Tecnologias

- **Frontend:** React 18, CSS3, Socket.io
- **Backend:** Node.js, Express, MongoDB
- **Deploy:** Python 3, PM2, Nginx
- **Segurança:** JWT, Firewall, Rate Limiting

## 📦 Estrutura Simplificada

```
bookverse/
├── server/                 # Backend Node.js
├── client/                 # Frontend React
├── uploads/               # Arquivos enviados
├── deploy_vps.py          # Deploy automático VPS
├── start.py               # Inicializador simples
├── manage.py              # Gerenciador avançado
└── package.json           # Dependências
```

## 🔧 Scripts Python Disponíveis

### Deploy e Configuração
- `python3 deploy_vps.py` - Deploy completo automático
- `python3 start.py` - Iniciar aplicação simples
- `python3 manage.py install` - Instalar dependências
- `python3 manage.py build` - Build do frontend

### Gerenciamento da Aplicação
- `python3 manage.py start` - Iniciar com PM2
- `python3 manage.py stop` - Parar aplicação
- `python3 manage.py restart` - Reiniciar aplicação
- `python3 manage.py status` - Ver status
- `python3 manage.py logs` - Ver logs

### Administração
- `python3 manage.py create-admin` - Criar usuário admin
- `python3 manage.py setup-pm2` - Configurar PM2

## 🌐 Acesso à Aplicação

Após o deploy:
- **Site:** `https://seudominio.com`
- **Admin:** `https://seudominio.com/admin`
- **API:** `https://seudominio.com/api/status`

## 🔑 Credenciais Padrão

- **Admin Supremo:** `admin_supremo` / `BookVerse2024!@#$%`
- **Admin Personalizado:** Criado via `python3 manage.py create-admin`

## 🚨 Requisitos do Sistema

### VPS Recomendado
- **OS:** Ubuntu 20.04+ ou Debian 11+
- **RAM:** 1GB mínimo, 2GB recomendado
- **Storage:** 10GB mínimo
- **CPU:** 1 vCPU mínimo

### Dependências Instaladas Automaticamente
- Node.js 18+
- MongoDB 6.0+
- PM2 (gerenciador de processos)
- Nginx (proxy reverso)
- Certbot (SSL gratuito)

## 🔒 Segurança Incluída

- ✅ **Firewall UFW** configurado
- ✅ **SSL/HTTPS** com Let's Encrypt
- ✅ **Rate Limiting** automático
- ✅ **Proxy Nginx** otimizado
- ✅ **Headers de Segurança**
- ✅ **Logs de Auditoria**

## 📊 Monitoramento

```bash
# Ver status da aplicação
python3 manage.py status

# Ver logs em tempo real
python3 manage.py logs

# Status do sistema
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

## 🆘 Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
python3 manage.py logs

# Reiniciar serviços
sudo systemctl restart nginx
sudo systemctl restart mongod
python3 manage.py restart
```

### Problemas de conectividade
```bash
# Testar API
curl http://localhost:5000/api/status

# Verificar portas
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
```

## 🔄 Atualizações

```bash
# Backup antes de atualizar
sudo cp -r /var/www/bookverse /backup/bookverse-$(date +%Y%m%d)

# Atualizar código
git pull origin main
python3 manage.py install
python3 manage.py build
python3 manage.py restart
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs: `python3 manage.py logs`
2. Testar API: `curl http://localhost:5000/api/status`
3. Verificar serviços: `pm2 status`

---

**🎯 BookVerse** - Deploy simples, gerenciamento fácil com Python! 📚✨