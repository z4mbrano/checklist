# 🚀 Guia de Execução Local (Passo a Passo)

Este guia fornece instruções diretas para executar o projeto **Checklist System** em seu ambiente local (Windows).

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:
1. **Python 3.11+** ([Download](https://www.python.org/downloads/))
2. **Node.js 18+** ([Download](https://nodejs.org/))
3. **Git** ([Download](https://git-scm.com/))
4. **MySQL 8.0+** (Para execução Full Local) **OU** **Docker Desktop** (Para execução Híbrida)

---

## ⚡ Opção A: Execução Híbrida (Recomendada)
*Backend e Banco no Docker | Frontend Local*

Esta é a forma mais rápida de iniciar.

1. **Execute o script de setup automático:**
   ```powershell
   .\setup.bat
   ```
   *Este script irá verificar Docker/Node, configurar containers, rodar migrações e instalar dependências.*

2. **Inicie o Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Acesse:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

---

## 💻 Opção B: Execução Full Local (Desenvolvimento)
*Tudo rodando diretamente no Windows (Sem Docker)*

Ideal para desenvolvimento, debugging e testes rápidos.

### 1. Configuração do Banco de Dados (MySQL)

1. Abra seu cliente MySQL (Workbench, DBeaver, ou terminal).
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE checkinsys_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2. Configuração do Backend (Python/FastAPI)

Abra um terminal **PowerShell** na pasta `backend`:

1. **Crie e ative o ambiente virtual:**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Instale as dependências:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo de exemplo:
     ```powershell
     copy .env.example .env
     ```
   - **Edite o arquivo `.env`** e ajuste a conexão com o banco:
     ```ini
     # Exemplo para MySQL local
     DATABASE_URL=mysql+pymysql://root:sua_senha@localhost:3306/checkinsys_db
     ```

4. **Execute as migrações (Criar tabelas):**
   ```powershell
   alembic upgrade head
   ```

5. **Popule o banco com dados iniciais:**
   ```powershell
   python app/scripts/seed.py
   ```

6. **Inicie o servidor Backend:**
   ```powershell
   uvicorn app.main:app --reload
   ```
   *O backend estará rodando em http://localhost:8000*

### 3. Configuração do Frontend (React/Vite)

Abra **outro terminal** na pasta `frontend`:

1. **Instale as dependências:**
   ```powershell
   cd frontend
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```powershell
   copy .env.example .env.local
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```powershell
   npm run dev
   ```
   *O frontend estará rodando em http://localhost:3000*

---

## 🧪 Executando Testes

### Testes de Integração (Backend)
Utiliza SQLite em memória (não requer MySQL rodando).

```powershell
cd backend
.\venv\Scripts\activate
pytest tests/integration -v
```

### Testes Unitários (Backend)
```powershell
pytest tests/unit -v
```

---

## 👤 Credenciais de Acesso Padrão

| Role | Email | Senha |
|------|-------|-------|
| **Admin** | `admin@vrdsolution.com` | `Admin@123` |
| **Supervisor** | `supervisor@vrdsolution.com` | `Supervisor@123` |
| **Técnico** | `arthur@vrdsolution.com` | `Arthur@123` |

---

## 🆘 Solução de Problemas Comuns

**Erro: "Module not found" no Backend**
- Certifique-se de que o `venv` está ativo (`(venv)` aparece no terminal).
- Execute `pip install -r requirements.txt` novamente.

**Erro de Conexão com Banco de Dados**
- Verifique se o MySQL está rodando.
- Confirme se as credenciais no arquivo `.env` (usuário, senha, porta) estão corretas.
- Tente conectar manualmente com um cliente SQL.

**Erro no Frontend "Connection refused"**
- Verifique se o Backend está rodando na porta 8000.
- Verifique se o arquivo `frontend/.env.local` aponta para `http://localhost:8000`.
