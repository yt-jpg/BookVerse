# 🗄️ Configuração do Banco de Dados

## ⚡ Opções Simples

### 1. **Sem Banco (Mais Rápido)**
```bash
# Funciona sem banco de dados
npm run dev
# Acesse: http://localhost:5000
```

### 2. **MySQL (Recomendado)**
```bash
# Ubuntu/Debian
sudo apt install mysql-server
sudo mysql_secure_installation

# Criar banco
sudo mysql
CREATE DATABASE bookverse;
exit

# Configurar .env
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=sua_senha
```

### 3. **MongoDB (Alternativo)**
```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Configurar .env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/bookverse
```

### 4. **XAMPP (Windows/Linux)**
```bash
# Baixar XAMPP: https://www.apachefriends.org/
# Iniciar MySQL no painel XAMPP

# Configurar .env
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=
```

## 🔧 Arquivo .env

```env
# Banco de Dados
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=

# Servidor
PORT=5000
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
```

## ✅ Testar

```bash
npm run dev
# Deve mostrar: ✅ MySQL conectado
# OU: ⚠️ Continuando sem banco de dados
```

---

**💡 Dica**: O projeto funciona sem banco, mas para funcionalidades completas, configure MySQL ou MongoDB.