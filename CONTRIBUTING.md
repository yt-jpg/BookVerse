# 🤝 Guia de Contribuição - BookVerse

Obrigado por considerar contribuir para o BookVerse! Este guia ajudará você a contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

## 📜 Código de Conduta

Este projeto segue o [Código de Conduta do Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em seguir este código.

## 🚀 Como Contribuir

### Tipos de Contribuição

- 🐛 **Bug Reports**: Reportar problemas encontrados
- ✨ **Feature Requests**: Sugerir novas funcionalidades
- 📝 **Documentação**: Melhorar ou adicionar documentação
- 🔧 **Code**: Implementar correções ou funcionalidades
- 🎨 **Design**: Melhorar UI/UX
- ⚡ **Performance**: Otimizações de performance
- 🧪 **Testes**: Adicionar ou melhorar testes

### Primeiros Passos

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Configure** o ambiente de desenvolvimento
4. **Crie** uma branch para sua contribuição
5. **Faça** suas alterações
6. **Teste** suas alterações
7. **Commit** seguindo os padrões
8. **Push** para seu fork
9. **Abra** um Pull Request

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 16+
- Python 3.8+
- Git
- MongoDB ou MySQL
- Redis (opcional)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/bookverse.git
cd bookverse

# 2. Instale dependências
npm run install-all

# 3. Configure ambiente
cp .env.example .env
cp client/.env.example client/.env

# 4. Configure banco de dados
# Edite o arquivo .env com suas configurações

# 5. Inicie desenvolvimento
npm run full-dev
```

### Estrutura do Projeto

```
bookverse/
├── 📁 server/           # Backend (Node.js/Express)
├── 📁 client/           # Frontend (React)
├── 📁 docs/             # Documentação
├── 📁 tests/            # Testes
└── 📁 scripts/          # Scripts utilitários
```

## 📏 Padrões de Código

### JavaScript/React

- **ESLint**: Seguir configuração do projeto
- **Prettier**: Formatação automática
- **Naming**: camelCase para variáveis, PascalCase para componentes
- **Imports**: Organizar em ordem (externos, internos, relativos)

```javascript
// ✅ Bom
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useAuth } from '../hooks/useAuth';
import Button from './Button';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  // ...
};

// ❌ Ruim
import React, {useState,useEffect} from 'react'
import {useAuth} from '../hooks/useAuth'
import axios from 'axios'
import Button from './Button'

const userProfile = ({userId}) => {
  const [User, setUser] = useState(null)
  // ...
}
```

### Python

- **PEP 8**: Seguir padrões Python
- **Type Hints**: Usar quando possível
- **Docstrings**: Documentar funções e classes

```python
# ✅ Bom
def calculate_performance_score(metrics: dict) -> float:
    """
    Calcula score de performance baseado nas métricas.
    
    Args:
        metrics: Dicionário com métricas de performance
        
    Returns:
        Score de performance (0-100)
    """
    return sum(metrics.values()) / len(metrics)

# ❌ Ruim
def calc_perf(m):
    return sum(m.values())/len(m)
```

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>[escopo opcional]: <descrição>

# Exemplos
feat: adicionar sistema de notificações
fix: corrigir bug no login
docs: atualizar README
style: formatar código
refactor: reorganizar componentes
perf: otimizar carregamento de imagens
test: adicionar testes para API
chore: atualizar dependências
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta lógica)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas de manutenção

## 🔄 Processo de Pull Request

### Antes de Abrir o PR

1. **Sincronize** com a branch main
2. **Execute** todos os testes
3. **Verifique** lint e formatação
4. **Teste** manualmente suas alterações
5. **Atualize** documentação se necessário

```bash
# Sincronizar com main
git checkout main
git pull upstream main
git checkout sua-branch
git rebase main

# Executar testes
npm test
npm run lint
npm run build:optimized

# Verificar performance
npm run lighthouse
```

### Template do PR

```markdown
## 📝 Descrição
Breve descrição das alterações realizadas.

## 🎯 Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## 🧪 Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## 📋 Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Performance verificada
- [ ] Sem breaking changes (ou documentado)

## 📸 Screenshots (se aplicável)
Adicione screenshots das alterações visuais.
```

### Revisão de Código

- **Seja respeitoso** nos comentários
- **Explique** o raciocínio por trás das sugestões
- **Teste** as alterações localmente
- **Aprove** apenas se estiver satisfeito com a qualidade

## 🐛 Reportando Bugs

### Antes de Reportar

1. **Verifique** se já existe uma issue similar
2. **Teste** na versão mais recente
3. **Reproduza** o bug consistentemente

### Template de Bug Report

```markdown
## 🐛 Descrição do Bug
Descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## ✅ Comportamento Esperado
O que deveria acontecer.

## 📱 Ambiente
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versão: [1.0.0]

## 📋 Logs/Screenshots
Adicione logs de erro ou screenshots.
```

## ✨ Sugerindo Funcionalidades

### Antes de Sugerir

1. **Verifique** se já existe uma issue similar
2. **Considere** se a funcionalidade se alinha com os objetivos do projeto
3. **Pense** na implementação e impacto

### Template de Feature Request

```markdown
## ✨ Descrição da Funcionalidade
Descrição clara da funcionalidade desejada.

## 🎯 Problema que Resolve
Que problema esta funcionalidade resolve?

## 💡 Solução Proposta
Como você imagina que deveria funcionar?

## 🔄 Alternativas Consideradas
Outras soluções que você considerou?

## 📋 Contexto Adicional
Informações adicionais, mockups, etc.
```

## 🏷️ Labels

### Por Tipo
- `bug`: Bugs reportados
- `enhancement`: Novas funcionalidades
- `documentation`: Melhorias na documentação
- `performance`: Otimizações de performance
- `security`: Questões de segurança

### Por Prioridade
- `priority: high`: Alta prioridade
- `priority: medium`: Média prioridade
- `priority: low`: Baixa prioridade

### Por Status
- `status: needs-review`: Precisa de revisão
- `status: in-progress`: Em desenvolvimento
- `status: blocked`: Bloqueado
- `good first issue`: Boa para iniciantes

## 🎯 Áreas de Contribuição

### Frontend (React)
- Componentes reutilizáveis
- Otimizações de performance
- Acessibilidade
- Responsividade
- Testes unitários

### Backend (Node.js)
- APIs RESTful
- Middleware de segurança
- Otimizações de banco de dados
- Cache e performance
- Testes de integração

### DevOps
- CI/CD pipelines
- Docker containers
- Scripts de deploy
- Monitoramento
- Documentação

### Documentação
- Guias de uso
- Tutoriais
- API documentation
- Exemplos de código
- Traduções

## 🏆 Reconhecimento

Contribuidores são reconhecidos:

- **README**: Lista de contribuidores
- **Releases**: Menção em changelogs
- **Issues**: Crédito em resoluções
- **Badges**: Badges especiais para contribuidores frequentes

## 📞 Suporte

- 💬 **Discussions**: Para perguntas gerais
- 🐛 **Issues**: Para bugs e funcionalidades
- 📧 **Email**: contato@bookverse.com
- 💬 **Discord**: [BookVerse Community]

## 📚 Recursos Úteis

- [React Documentation](https://reactjs.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Obrigado por contribuir para o BookVerse! 🚀**