# 📋 Sistema de Check-in/Check-out - VRD Solution

Sistema completo de controle de tempo e atividades para técnicos, desenvolvido com **FastAPI + React + TypeScript**.

## 🎯 Funcionalidades Principais

### ⏱️ Core System
- ✅ **Check-in automático** com cronômetro em tempo real
- ✅ **Check-out inteligente** com seleção de tarefas executadas
- ✅ **Cálculo automático** de duração (HH:MM)
- ✅ **Histórico completo** com filtros avançados
- ✅ **Geolocalização** opcional (início/fim)

### 👥 Gestão de Usuários
- ✅ **3 níveis de acesso**: Admin, Supervisor, Técnico
- ✅ **Autenticação JWT** com refresh token
- ✅ **Perfis personalizados** por tipo de usuário

### 📊 Gestão de Projetos
- ✅ **CRUD completo** de clientes e projetos
- ✅ **Status tracking** (Planejamento → Em Andamento → Concluído)
- ✅ **Tarefas categorizadas** por tipo de trabalho
- ✅ **Relatórios de produtividade**

### 🔒 Segurança & Auditoria
- ✅ **Log completo** de todas as operações
- ✅ **Soft delete** para preservação de dados
- ✅ **Validações rigorosas** (CNPJ, email, etc.)
- ✅ **Controle de permissões** por role

## 🏗️ Arquitetura

```
checklist/
├── backend/          # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── api/v1/       # REST endpoints
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── core/         # Config, security, database
│   ├── alembic/          # Database migrations
│   └── docker-compose.yml
│
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── pages/        # Page components
    │   ├── components/   # Reusable components
    │   ├── services/     # API services
    │   ├── store/        # Zustand state management
    │   ├── types/        # TypeScript definitions
    │   └── hooks/        # Custom React hooks
    └── public/
```

## 🚀 Quick Start

### 📋 Pré-requisitos

- **Node.js** 18+ 
- **Python** 3.11+
- **Docker** & Docker Compose
- **PostgreSQL** 15+ (ou use Docker)

### 🐳 Opção 1: Com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone <repository-url>
cd checklist

# 2. Inicie o backend
cd backend
docker-compose up -d

# 3. Execute migrations e seed
docker-compose exec backend alembic upgrade head
docker-compose exec backend python app/scripts/seed.py

# 4. Instale dependências do frontend
cd ../frontend
npm install

# 5. Inicie o frontend
npm run dev
```

### 💻 Opção 2: Setup Local

> **📝 Nota:** Para um guia detalhado passo a passo específico para Windows e execução sem Docker, consulte o arquivo [LOCAL_SETUP.md](./LOCAL_SETUP.md).

#### Backend
```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
createdb checkinsys_db

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env conforme necessário

# Executar migrations
alembic upgrade head

# Popular banco com dados iniciais
python app/scripts/seed.py

# Iniciar servidor
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite conforme necessário

# Iniciar desenvolvimento
npm run dev
```

## 🌐 Acessos

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface do usuário |
| **Backend API** | http://localhost:8000 | API REST |
| **API Docs** | http://localhost:8000/docs | Documentação Swagger |
| **Database** | localhost:5432 | PostgreSQL |

## 👤 Usuários Padrão

| Email | Senha | Role | Descrição |
|-------|--------|------|-----------|
| admin@vrdsolution.com | Admin@123 | Admin | Acesso total |
| supervisor@vrdsolution.com | Supervisor@123 | Supervisor | Visualizar todos os projetos |
| arthur@vrdsolution.com | Arthur@123 | Técnico | Fazer check-in/check-out |
| diego@vrdsolution.com | Diego@123 | Técnico | Fazer check-in/check-out |
| gui@vrdsolution.com | Gui@123 | Técnico | Fazer check-in/check-out |

## 🎨 Design System

O frontend foi desenvolvido seguindo o design das imagens fornecidas:

### 🎨 Cores
- **Fundo Principal**: `#1a252f` (vrd-darker)
- **Fundo Cards**: `#2c3e50` (vrd-dark)
- **Azul VRD**: `#3498db` (vrd-blue)
- **Verde**: `#27ae60` (sucesso)
- **Vermelho**: `#e74c3c` (erro/ativo)
- **Laranja**: `#f39c12` (alerta)

### 📱 Telas Implementadas
1. **Login** - Autenticação com email/senha
2. **Dashboard** - Visão geral e check-in rápido
3. **Check-in** - Seleção de projeto e início de trabalho
4. **Check-out** - Finalização com tarefas executadas
5. **Histórico** - Listagem de todos os check-ins
6. **Detalhes do Projeto** - Informações completas

## 🔄 Fluxo de Trabalho

### 1. Login
```
👤 Técnico faz login → JWT Token → Dashboard
```

### 2. Check-in
```
📋 Seleciona projeto → ▶️ Inicia check-in → ⏰ Cronômetro ativo
```

### 3. Durante o Trabalho
```
⏱️ Timer roda em tempo real → 📍 Localização opcional
```

### 4. Check-out
```
⏹️ Finaliza → ✅ Seleciona tarefas → 📝 Observações → 💾 Salva
```

### 5. Resultado
```
📊 Duração calculada → 📋 Registro no histórico → 📈 Relatórios
```

## 🔧 Stack Tecnológica

### Backend
- **FastAPI** - Framework web moderno
- **SQLAlchemy 2.0** - ORM
- **PostgreSQL** - Banco de dados
- **Alembic** - Migrations
- **JWT** - Autenticação
- **Pydantic V2** - Validação
- **Docker** - Containerização

### Frontend
- **React 18** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno
- **TailwindCSS** - Estilização
- **Zustand** - Estado global
- **React Query** - Estado servidor
- **React Hook Form + Zod** - Formulários

## 📊 Funcionalidades Avançadas

### 🔍 Filtros e Busca
- **Data Range**: Filtrar por período
- **Status**: Em andamento, concluído, cancelado
- **Projeto**: Filtrar por projeto específico
- **Técnico**: Filtrar por responsável
- **Cliente**: Filtrar por cliente

### 📈 Relatórios
- **Tempo total** trabalhado por técnico
- **Produtividade** por projeto
- **Tarefas mais executadas**
- **Clientes mais atendidos**
- **Duração média** por tipo de tarefa

### 🔐 Segurança
- **Hash bcrypt** para senhas
- **JWT com refresh token**
- **CORS configurado**
- **Rate limiting** (futuro)
- **Logs de auditoria** completos

## 🧪 Testes

### Backend
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Frontend
```bash
cd frontend
npm run test
npm run e2e  # Playwright
```

## 🚀 Deploy

### Docker Compose (Produção)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://...
      - SECRET_KEY=...
      - ENVIRONMENT=production
  
  frontend:
    build: ./frontend
    environment:
      - VITE_API_BASE_URL=https://api.yourdom.com
```

### Variáveis de Ambiente Produção
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=sua-chave-super-secreta
ENVIRONMENT=production
DEBUG=False

# Frontend  
VITE_API_BASE_URL=https://api.yourdom.com
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add some AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Abra um Pull Request

## 📝 Roadmap

### ✅ Versão 1.0 (Atual)
- [x] Sistema completo de check-in/check-out
- [x] Interface responsiva dark theme
- [x] Autenticação JWT
- [x] CRUD completo
- [x] Docker ready

### 🚧 Versão 1.1 (Próxima)
- [ ] **App Mobile** (React Native)
- [ ] **Push notifications**
- [ ] **Relatórios avançados** (PDF/Excel)
- [ ] **Dashboard analytics**
- [ ] **Integração GPS** nativa

### 🔮 Versão 2.0 (Futuro)
- [ ] **Multi-tenancy**
- [ ] **Chat interno**
- [ ] **Integração com ERP**
- [ ] **API pública**
- [ ] **Webhooks**

## 📞 Suporte

### 🐛 Problemas Conhecidos
1. **CORS em desenvolvimento**: Certifique-se que o backend está rodando na porta 8000
2. **Migrations**: Se houver erro, execute `alembic downgrade base` e `alembic upgrade head`
3. **Login falha**: Verifique se o seed foi executado corretamente

### 📚 Documentação
- **API**: http://localhost:8000/docs
- **Backend**: `backend/README.md`
- **Tipos TypeScript**: Veja arquivos em `frontend/src/types/`

### 🎯 Contato
- **Email**: desenvolvimento@vrdsolution.com
- **GitHub Issues**: Para reportar bugs
- **Discussions**: Para dúvidas e sugestões

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ pela equipe VRD Solution**

© 2025 VRD Solution. Todos os direitos reservados.