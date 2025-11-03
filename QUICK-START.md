# 🚀 Quick Start - Performance System

## Comandos Corretos

### ⚠️ IMPORTANTE: Execute os comandos na RAIZ do projeto, não na pasta client!

```bash
# Navegar para a raiz do projeto
cd ~/Desktop/bookverse

# OU se estiver na pasta client:
cd ..
```

## 🎯 Comandos Principais

### 1. Servidor Otimizado
```bash
# Na raiz do projeto
npm run start:optimized
```

### 2. Monitor de Performance
```bash
# Na raiz do projeto
python3 performance-monitor.py
```

### 3. Desenvolvimento Completo
```bash
# Servidor + Cliente simultaneamente
npm run full-dev
```

### 4. Build Otimizado
```bash
npm run build:optimized
```

### 5. Auditoria Lighthouse
```bash
npm run lighthouse
```

## 🔧 Scripts Auxiliares

### Windows
```cmd
# Execute o script interativo
start-performance.bat
```

### Linux/Mac
```bash
# Torne executável primeiro
chmod +x start-performance.sh

# Execute o script interativo
./start-performance.sh
```

## 📊 Verificar Performance

### 1. Iniciar Monitor
```bash
python3 performance-monitor.py
```
Depois digite: `start`

### 2. Ver Métricas em Tempo Real
- CPU, Memória, Rede
- Tempos de resposta
- Erros e alertas

### 3. Lighthouse Audit
```bash
# Certifique-se que o cliente está rodando em localhost:3000
npm run client

# Em outro terminal, execute:
npm run lighthouse
```

## 🐛 Troubleshooting

### Erro: "Missing script"
- ✅ Certifique-se de estar na **raiz** do projeto
- ✅ Verifique se o arquivo `package.json` existe no diretório atual

### Erro: "can't open file performance-monitor.py"
- ✅ Execute `ls` ou `dir` para verificar se o arquivo existe
- ✅ Certifique-se de estar na raiz do projeto

### Erro: "Module not found"
```bash
# Instalar dependências
npm run install-all

# Ou manualmente:
npm install
cd client && npm install
```

## 🎯 Fluxo Recomendado

### Para Desenvolvimento
```bash
# 1. Instalar dependências
npm run install-all

# 2. Iniciar desenvolvimento completo
npm run full-dev
```

### Para Produção
```bash
# 1. Build otimizado
npm run build:optimized

# 2. Servidor otimizado
npm run start:optimized

# 3. Monitor (em outro terminal)
python3 performance-monitor.py
```

### Para Auditoria
```bash
# 1. Cliente em desenvolvimento
npm run client

# 2. Lighthouse (em outro terminal)
npm run lighthouse

# 3. Monitor de performance
python3 performance-monitor.py
```

## 📁 Estrutura de Arquivos

```
bookverse/                    ← EXECUTE COMANDOS AQUI
├── package.json             ← Scripts principais
├── performance-monitor.py   ← Monitor de performance
├── start-performance.bat    ← Script Windows
├── start-performance.sh     ← Script Linux/Mac
├── server/
│   ├── server-optimized.js  ← Servidor otimizado
│   └── middleware/
│       └── performance.js   ← Middleware de performance
└── client/
    ├── package.json         ← Scripts do cliente
    ├── craco.config.js      ← Configuração otimizada
    └── src/
        ├── utils/
        │   ├── performance.js
        │   └── webVitals.js
        └── components/
            ├── LazyImage/
            └── VirtualList/
```

## 🎉 Resultado Esperado

Após executar corretamente:
- ⚡ Carregamento < 2 segundos
- 📊 Lighthouse Score > 90
- 🚀 Resposta < 200ms
- 💾 Cache otimizado
- 📈 Monitoramento em tempo real

---

**Dica**: Use sempre a raiz do projeto (`~/Desktop/bookverse`) para executar os comandos! 🎯