# 🚀 Quick Start - BookVerse

## ⚡ Instalação Rápida

```bash
# 1. Clonar repositório
git clone https://github.com/yt-jpg/BookVerse.git
cd BookVerse

# 2. Instalar dependências
npm install
cd client && npm install && cd ..

# 3. Configurar ambiente
cp .env.example .env
cp client/.env.example client/.env

# 4. Iniciar desenvolvimento
npm run dev
```

## 🎯 Comandos Principais

### Desenvolvimento
```bash
npm run dev                 # Servidor de desenvolvimento
```

### Produção
```bash
npm run build:optimized     # Build otimizado
npm run start:optimized     # Servidor otimizado
```

### Performance
```bash
python3 performance-monitor.py  # Monitor de performance
```

## 🔧 Configuração

### Arquivo .env (Servidor)
```env
PORT=5000
NODE_ENV=development
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=
JWT_SECRET=seu_jwt_secret_aqui
```

### Arquivo client/.env (Cliente)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🗄️ Banco de Dados (Opcional)

O projeto funciona sem banco, mas para funcionalidades completas:

```bash
# MySQL (recomendado)
sudo apt install mysql-server
sudo mysql -e "CREATE DATABASE bookverse;"

# OU MongoDB
sudo apt install mongodb
sudo systemctl start mongodb
```

Ver: [DATABASE-SETUP.md](DATABASE-SETUP.md)

## 🎉 Resultado

- 🌐 **Servidor**: http://localhost:5000
- ⚡ **Performance otimizada**
- 📊 **Monitoramento disponível**

---

**Simples e direto!** 🎯