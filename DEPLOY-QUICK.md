# 🚀 Deploy Rápido - BookVerse VPS

## ⚡ Deploy em 3 Comandos

### 1️⃣ Como Root (Configuração Inicial)
```bash
# Conectar ao VPS
ssh root@SEU_IP_VPS

# Baixar e executar configuração
curl -sSL https://raw.githubusercontent.com/yt-jpg/BookVerse/main/setup-user.sh | bash
```

### 2️⃣ Como Usuário (Deploy)
```bash
# Fazer login como usuário bookverse
su - bookverse

# Executar deploy automático
./deploy-bookverse.sh
```

### 3️⃣ Configurar Domínio (Opcional)
```bash
# Como root, configurar SSL
sudo certbot --nginx -d seu-dominio.com
```

## 🎯 Resultado

- ✅ **Aplicação rodando**: http://SEU_IP:5000
- ✅ **PM2 configurado**: `pm2 status`
- ✅ **Nginx configurado**: Proxy reverso
- ✅ **SSL disponível**: HTTPS automático
- ✅ **Backup automático**: Diário às 2h
- ✅ **Monitoramento**: `./monitor-bookverse.sh`

## 🔧 Comandos Úteis

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs bookverse

# Restart da aplicação
pm2 restart bookverse

# Monitorar recursos
./monitor-bookverse.sh

# Backup manual
./backup-bookverse.sh

# Atualizar aplicação
cd ~/apps/BookVerse
git pull origin main
npm run build:optimized
pm2 restart bookverse
```

## 🆘 Problemas?

1. **Não consegue acessar**: Verifique firewall `sudo ufw status`
2. **Erro de permissão**: Execute como usuário correto
3. **Aplicação não inicia**: Verifique logs `pm2 logs bookverse`
4. **Banco não conecta**: Verifique configuração `.env`

## 📚 Documentação Completa

- [DEPLOY-VPS.md](DEPLOY-VPS.md) - Guia completo
- [README.md](README.md) - Documentação principal
- [QUICK-START.md](QUICK-START.md) - Desenvolvimento local

---

**🎉 Seu BookVerse estará rodando em minutos!** 🚀