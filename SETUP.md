# Guia de Configuração Rápida

## Passo a Passo para Iniciar a Plataforma

### 1. Instalar Dependências
```bash
npm run install-all
```

### 2. Configurar MongoDB
Certifique-se de que o MongoDB está rodando:
- **Local:** Inicie o serviço MongoDB
- **Atlas:** Configure a string de conexão no arquivo `.env`

### 3. Configurar Variáveis de Ambiente
Edite o arquivo `.env` se necessário:
```
MONGODB_URI=mongodb://localhost:27017/bookplatform
JWT_SECRET=seu_jwt_secret_seguro_aqui
PORT=5000
```

### 4. Criar Administrador (Opcional)
```bash
npm run create-admin
```
Isso criará um usuário administrador com:
- Email: admin@bookverse.com
- Senha: admin123

### 5. Iniciar a Aplicação
```bash
npm run dev
```

### 6. Acessar a Plataforma
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Primeiro Uso

1. **Cadastre-se** como usuário normal em http://localhost:3000/register
2. **Faça login** e explore o dashboard do usuário
3. **Para acessar como admin:** Use as credenciais criadas no passo 4 ou altere manualmente no MongoDB o campo `role` de um usuário para `admin`

## Funcionalidades Principais

### Usuário:
- ✅ Buscar livros por título, autor ou categoria
- ✅ Baixar livros via links ou arquivos
- ✅ Compartilhar novos livros (upload ou links)
- ✅ Dashboard personalizado

### Administrador:
- ✅ Painel administrativo separado
- ✅ Aprovar/rejeitar livros pendentes
- ✅ Visualizar estatísticas da plataforma
- ✅ Gerenciar usuários
- ✅ Deletar livros

## Estrutura de Pastas
```
├── server/           # Backend (Node.js + Express)
├── client/           # Frontend (React)
├── uploads/          # Arquivos enviados pelos usuários
└── .env             # Configurações do ambiente
```

## Problemas Comuns

### MongoDB não conecta:
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`

### Erro de CORS:
- Certifique-se de que o backend está rodando na porta 5000
- Verifique se o frontend está fazendo requisições para http://localhost:5000

### Uploads não funcionam:
- Verifique se a pasta `uploads/` existe
- Confirme as permissões da pasta

## Próximos Passos

Para expandir a plataforma, considere adicionar:
- Sistema de avaliações e comentários
- Categorias mais específicas
- Sistema de favoritos
- Notificações por email
- API de busca externa (Google Books, etc.)
- Sistema de recomendações