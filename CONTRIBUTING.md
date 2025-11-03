# 🤝 Contribuindo para o BookVerse

Obrigado por considerar contribuir para o BookVerse! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Fork do Repositório
```bash
# Fork no GitHub e clone seu fork
git clone https://github.com/yt-jpg/BookVerse
cd bookverse
```

### 2. Configurar Ambiente de Desenvolvimento
```bash
# Instalar dependências
python3 manage.py install

# Criar arquivo .env
cp .env.example .env
# Edite .env com suas configurações

# Fazer build
python3 manage.py build

# Iniciar em modo desenvolvimento
npm run dev
```

### 3. Criar Branch para sua Feature
```bash
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

### 4. Fazer suas Alterações
- Mantenha o código limpo e bem documentado
- Siga as convenções de código existentes
- Teste suas alterações localmente

### 5. Commit e Push
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 6. Criar Pull Request
- Vá para o GitHub e crie um Pull Request
- Descreva claramente suas alterações
- Referencie issues relacionadas se houver

## 📝 Convenções de Commit

Use commits semânticos:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas de manutenção

## 🧪 Testes

Antes de submeter:
```bash
# Verificar se aplicação inicia
python3 start.py

# Testar build
python3 manage.py build

# Verificar se não há erros no console
```

## 📋 Checklist do Pull Request

- [ ] Código testado localmente
- [ ] Documentação atualizada se necessário
- [ ] Commits seguem convenção semântica
- [ ] Não quebra funcionalidades existentes
- [ ] Segue padrões de código do projeto

## 🐛 Reportando Bugs

Use o template de issue para bugs:
1. Descreva o comportamento esperado
2. Descreva o comportamento atual
3. Passos para reproduzir
4. Ambiente (OS, Node.js version, etc.)
5. Screenshots se aplicável

## 💡 Sugerindo Funcionalidades

Para novas funcionalidades:
1. Verifique se já não existe issue similar
2. Descreva o problema que resolve
3. Proponha uma solução
4. Considere alternativas

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
bookverse/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── deploy_vps.py    # Deploy automático
├── start.py         # Inicializador
└── manage.py        # Gerenciador
```

### Scripts Úteis
```bash
# Desenvolvimento
npm run dev

# Build
python3 manage.py build

# Logs
python3 manage.py logs

# Status
python3 manage.py status
```

## 📞 Dúvidas?

- Abra uma issue para discussão
- Verifique issues existentes
- Consulte a documentação

Obrigado por contribuir! 🚀