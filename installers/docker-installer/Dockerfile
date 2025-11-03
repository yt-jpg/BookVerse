# BookVerse Docker Container
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY client/package*.json ./client/

# Instalar dependências
RUN npm install
RUN cd client && npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bookverse -u 1001

# Criar diretórios necessários
RUN mkdir -p uploads logs
RUN chown -R bookverse:nodejs /app

# Mudar para usuário não-root
USER bookverse

# Expor porta
EXPOSE 5000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicialização
CMD ["npm", "start"]