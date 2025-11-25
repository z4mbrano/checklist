# 🚀 Guia Completo de Deploy no KingHost

**Sistema de Check-in/Check-out - Full Stack (FastAPI + React)**

Este guia fornece instruções passo-a-passo (tipo receita de bolo) para fazer o deploy completo da aplicação no KingHost.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta ativa no KingHost
- ✅ Acesso ao painel de controle
- ✅ Cliente FTP instalado (FileZilla recomendado)
- ✅ SSH habilitado (verificar no painel)
- ✅ Node.js instalado localmente (para build do frontend)
- ✅ Git instalado localmente

---

## 🗂️ Estrutura Final no Servidor

```
/home/vrdsolution/public_html/
├── api/                              # Subdomínio: api.vrdsolution.com.br
│   ├── passenger_wsgi.py
│   ├── .htaccess
│   ├── .env
│   ├── requirements-production.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── schemas/
│   ├── alembic/
│   ├── logs/
│   ├── uploads/
│   └── tmp/
│
└── www/                              # Domínio: www.vrdsolution.com.br
    ├── index.html
    ├── .htaccess
    └── assets/
        ├── index-[hash].js
        └── index-[hash].css
```

---

## 📦 PARTE 1: PREPARAÇÃO LOCAL

### Passo 1: Preparar Backend Localmente

#### 1.1 Configurar arquivo `.env` de produção

```bash
cd backend
cp .env.production .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database - Obtenha do painel KingHost > Gerenciar bancos PgSQL
DB_HOST=localhost
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=checklist_db
DB_PORT=5432

# JWT - Gere uma chave segura
SECRET_KEY=cole_aqui_uma_chave_segura_de_32_caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS - Seus domínios
ALLOWED_ORIGINS=https://www.vrdsolution.com.br,https://vrdsolution.com.br

# Environment
ENVIRONMENT=production
DEBUG=False
```

**🔑 Para gerar SECRET_KEY segura:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 1.2 Testar localmente (opcional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements-production.txt
python run_dev.py
```

Acesse: http://localhost:8000/docs

### Passo 2: Preparar Frontend Localmente

#### 2.1 Verificar `.env.production`

```bash
cd frontend
```

Verifique se `.env.production` contém:

```env
VITE_API_URL=https://api.vrdsolution.com.br/api/v1
```

#### 2.2 Fazer build de produção

```bash
npm install
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

#### 2.3 Verificar arquivos gerados

```bash
ls dist/
# Deve conter: index.html, assets/, .htaccess
```

---

## 🗄️ PARTE 2: CONFIGURAR BANCO DE DADOS

### Passo 3: Criar Banco PostgreSQL no KingHost

#### 3.1 Acessar painel KingHost

1. Faça login no painel: https://painel.kinghost.com.br
2. Navegue até: **"Gerenciar bancos PgSQL"**

#### 3.2 Criar novo banco

1. Clique em **"Criar novo banco"**
2. Preencha:
   - **Nome do banco**: `checklist_db`
   - **Descrição**: Check-in System Database
3. Clique em **"Criar"**

#### 3.3 Anotar credenciais

O sistema vai gerar:
- **Host**: `localhost` (ou outro fornecido)
- **Usuário**: (ex: `vrdsolution_user`)
- **Senha**: (será gerada - anote!)
- **Porta**: `5432`

⚠️ **IMPORTANTE**: Guarde essas informações para configurar o `.env`

---

## 🌐 PARTE 3: CONFIGURAR SUBDOMÍNIO

### Passo 4: Configurar api.vrdsolution.com.br

#### 4.1 Criar/Configurar subdomínio

1. No painel KingHost, vá em: **"Gerenciar SubDomínios"**
2. Encontre `api.vrdsolution.com.br` (se já existir)
3. Ou clique em **"Adicionar SubDomínio"** e crie `api`

#### 4.2 Configurar diretório

1. Clique em **"Editar"** ou **"Configurar"**
2. Configure:
   - **Subdomínio**: `api`
   - **Diretório**: `/public_html/api`
   - **SSL/HTTPS**: ✅ Ativar (Let's Encrypt gratuito)
3. Salvar

#### 4.3 Aguardar propagação DNS

Pode levar de 10 minutos a 24 horas. Teste com:

```bash
ping api.vrdsolution.com.br
```

---

## 📤 PARTE 4: FAZER UPLOAD DO BACKEND

### Passo 5: Upload via FTP

#### 5.1 Configurar FileZilla

Abra o FileZilla e configure:

- **Host**: `ftp.vrdsolution.com.br`
- **Usuário**: (seu usuário FTP do KingHost)
- **Senha**: (sua senha FTP)
- **Porta**: `21`

Clique em **"Conexão Rápida"**

#### 5.2 Criar estrutura de pastas

No lado direito (servidor):

1. Navegue até: `/public_html/`
2. Crie a pasta `api/` (clique direito > Criar diretório)
3. Entre na pasta `api/`

#### 5.3 Fazer upload dos arquivos

No lado esquerdo (local), navegue até seu projeto `backend/`

Faça upload dos seguintes arquivos/pastas para `/public_html/api/`:

**Arquivos na raiz:**
- ✅ `passenger_wsgi.py`
- ✅ `.htaccess`
- ✅ `.env` (com suas credenciais configuradas!)
- ✅ `requirements-production.txt`
- ✅ `alembic.ini` (se usar Alembic)

**Pastas completas:**
- ✅ `app/` (toda a pasta com código)
- ✅ `alembic/` (se existir)
- ✅ `scripts/` (scripts de setup)

**NÃO fazer upload:**
- ❌ `venv/` ou `env/`
- ❌ `__pycache__/`
- ❌ `.git/`
- ❌ `.pytest_cache/`
- ❌ `*.pyc`

#### 5.4 Verificar permissões

Os arquivos devem ter:
- Arquivos: `644` (rw-r--r--)
- Diretórios: `755` (rwxr-xr-x)
- `.env`: `600` (rw-------)

---

## 🐍 PARTE 5: CONFIGURAR PYTHON VIA SSH

### Passo 6: Conectar via SSH

#### 6.1 Abrir terminal SSH

**Windows (PowerShell ou Command Prompt):**
```powershell
ssh seu_usuario@vrdsolution.com.br
```

**macOS/Linux:**
```bash
ssh seu_usuario@vrdsolution.com.br
```

Digite sua senha quando solicitado.

#### 6.2 Verificar versão do Python

```bash
python3 --version
# Deve mostrar: Python 3.8+ (ex: Python 3.10.x)
```

### Passo 7: Criar Ambiente Virtual

```bash
# Criar ambiente virtual
cd ~
mkdir -p .local/share/virtualenvs
python3 -m venv .local/share/virtualenvs/checklist
```

### Passo 8: Instalar Dependências

```bash
# Ativar ambiente virtual
source ~/.local/share/virtualenvs/checklist/bin/activate

# Atualizar pip
pip install --upgrade pip

# Navegar para diretório da aplicação
cd ~/public_html/api

# Instalar dependências
pip install -r requirements-production.txt
```

⏱️ **Tempo estimado**: 2-5 minutos

#### 8.1 Verificar instalação

```bash
python -c "import fastapi; print('FastAPI OK')"
python -c "import sqlalchemy; print('SQLAlchemy OK')"
python -c "import psycopg2; print('PostgreSQL driver OK')"
```

Se todos imprimirem "OK", está tudo certo!

### Passo 9: Configurar Banco de Dados

#### 9.1 Atualizar `.env` com credenciais do banco

```bash
# Editar .env
nano .env
```

Pressione `Ctrl+X`, depois `Y`, depois `Enter` para salvar.

#### 9.2 Testar conexão com banco

```bash
python3 -c "
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import create_engine, text
import os

db_url = f'postgresql://{os.getenv(\"DB_USER\")}:{os.getenv(\"DB_PASSWORD\")}@{os.getenv(\"DB_HOST\")}:{os.getenv(\"DB_PORT\", \"5432\")}/{os.getenv(\"DB_NAME\")}'
engine = create_engine(db_url)

with engine.connect() as conn:
    result = conn.execute(text('SELECT version();'))
    print('✓ Conexão OK!')
    print(result.fetchone()[0])
"
```

#### 9.3 Criar tabelas do banco

```bash
# Opção 1: Usar Alembic (recomendado)
alembic upgrade head

# Opção 2: Criar tabelas diretamente
python3 -c "
from app.core.database import engine, Base
from app.models import user, client, project, task, checkin
Base.metadata.create_all(bind=engine)
print('✓ Tabelas criadas!')
"
```

#### 9.4 Criar usuário administrador

```bash
python3 << 'EOF'
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

admin = User(
    email="admin@vrdsolution.com.br",
    hashed_password=hash_password("Admin@123"),
    full_name="Administrador",
    is_active=True,
    is_superuser=True
)

db.add(admin)
db.commit()
print("✓ Usuário admin criado!")
print("  Email: admin@vrdsolution.com.br")
print("  Senha: Admin@123")
print("  ⚠ ALTERE APÓS PRIMEIRO LOGIN!")
db.close()
EOF
```

### Passo 10: Criar Diretórios Adicionais

```bash
# Criar diretórios necessários
cd ~/public_html/api
mkdir -p logs uploads tmp

# Definir permissões
chmod 755 logs uploads tmp
```

### Passo 11: Reiniciar Aplicação Passenger

```bash
# Passenger detecta mudanças via restart.txt
mkdir -p tmp
touch tmp/restart.txt
```

---

## ✅ PARTE 6: TESTAR O BACKEND

### Passo 12: Verificar se Backend está Funcionando

#### 12.1 Teste de saúde

Abra o navegador e acesse:

```
https://api.vrdsolution.com.br/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### 12.2 Acessar documentação API

```
https://api.vrdsolution.com.br/docs
```

Você deve ver a interface Swagger UI do FastAPI.

#### 12.3 Testar endpoint raiz

```
https://api.vrdsolution.com.br/
```

**Resposta esperada:**
```json
{
  "message": "Sistema de Check-in/Check-out API",
  "version": "1.0.0",
  "environment": "production",
  "docs_url": "/docs"
}
```

#### 12.4 Testar login

No Swagger UI (https://api.vrdsolution.com.br/docs):

1. Expanda: `POST /api/v1/auth/login`
2. Clique em **"Try it out"**
3. Use as credenciais:
   ```json
   {
     "email": "admin@vrdsolution.com.br",
     "password": "Admin@123"
   }
   ```
4. Clique em **"Execute"**

**Resposta esperada (200 OK):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@vrdsolution.com.br",
    "full_name": "Administrador"
  }
}
```

---

## 🎨 PARTE 7: FAZER DEPLOY DO FRONTEND

### Passo 13: Upload do Frontend via FTP

#### 13.1 Conectar via FTP

Use o FileZilla novamente.

#### 13.2 Navegar para pasta www

No servidor (lado direito):

1. Navegue até: `/public_html/www/`
2. Se a pasta não existir, crie-a

#### 13.3 Fazer upload dos arquivos do build

No local (lado esquerdo):

1. Navegue até: `frontend/dist/`
2. Selecione **TODOS** os arquivos e pastas dentro de `dist/`:
   - `index.html`
   - `.htaccess`
   - `assets/` (pasta completa)
   - Outros arquivos

3. Arraste para `/public_html/www/` no servidor

⚠️ **IMPORTANTE**: 
- Faça upload do **conteúdo** de `dist/`, não a pasta `dist/` em si
- Certifique-se de que `.htaccess` foi enviado (pode estar oculto)

#### 13.4 Verificar estrutura

No servidor, `/public_html/www/` deve conter:

```
www/
├── index.html
├── .htaccess
└── assets/
    ├── index-abc123.js
    ├── index-abc123.css
    └── [outros arquivos]
```

---

## ✅ PARTE 8: TESTAR APLICAÇÃO COMPLETA

### Passo 14: Testar Frontend

#### 14.1 Acessar aplicação

Abra o navegador:

```
https://www.vrdsolution.com.br
```

Você deve ver a tela de login do sistema.

#### 14.2 Testar login

Use as credenciais:
- **Email**: `admin@vrdsolution.com.br`
- **Senha**: `Admin@123`

Se o login funcionar, parabéns! 🎉 Sua aplicação está no ar!

#### 14.3 Verificar console do navegador

Pressione `F12` para abrir DevTools.

**Verificar:**
- ✅ Sem erros de CORS
- ✅ Sem erros 404 ou 500
- ✅ Requisições para `api.vrdsolution.com.br` funcionando

---

## 🔍 TROUBLESHOOTING

### Problema 1: Erro 500 no Backend

**Sintoma**: Página mostra "Internal Server Error"

**Solução**:

```bash
# Via SSH, verificar logs
ssh seu_usuario@vrdsolution.com.br
cd ~/public_html/api
tail -50 passenger.log
```

Procure por erros e corrija no código/configuração.

### Problema 2: Erro de Conexão com Banco

**Sintoma**: "Connection refused" ou "Could not connect to database"

**Solução**:

1. Verificar credenciais no `.env`
2. Verificar se o banco foi criado no painel
3. Testar conexão:

```bash
python3 -c "
from sqlalchemy import create_engine, text
import os
os.environ['DB_USER'] = 'seu_usuario'
os.environ['DB_PASSWORD'] = 'sua_senha'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_NAME'] = 'checklist_db'
os.environ['DB_PORT'] = '5432'

db_url = f'postgresql://{os.environ[\"DB_USER\"]}:{os.environ[\"DB_PASSWORD\"]}@{os.environ[\"DB_HOST\"]}:{os.environ[\"DB_PORT\"]}/{os.environ[\"DB_NAME\"]}'
engine = create_engine(db_url)
with engine.connect() as conn:
    print('Conexão OK!')
"
```

### Problema 3: Erro de CORS

**Sintoma**: No console do navegador: "blocked by CORS policy"

**Solução**:

1. Verificar `.env` do backend:
   ```env
   ALLOWED_ORIGINS=https://www.vrdsolution.com.br,https://vrdsolution.com.br
   ```

2. Reiniciar Passenger:
   ```bash
   touch ~/public_html/api/tmp/restart.txt
   ```

### Problema 4: Frontend Não Carrega (Tela Branca)

**Sintoma**: Página em branco ou erro 404

**Solução**:

1. Verificar se `.htaccess` existe em `/public_html/www/`
2. Verificar se `index.html` existe
3. Limpar cache do navegador (Ctrl + Shift + Delete)
4. Testar em navegação anônima

### Problema 5: Módulo Python Não Encontrado

**Sintoma**: "ModuleNotFoundError: No module named 'fastapi'"

**Solução**:

```bash
# Reinstalar dependências
source ~/.local/share/virtualenvs/checklist/bin/activate
cd ~/public_html/api
pip install -r requirements-production.txt --force-reinstall
```

### Problema 6: Permissões Negadas

**Sintoma**: "403 Forbidden" ou "Permission denied"

**Solução**:

```bash
# Ajustar permissões
cd ~/public_html/api
chmod 644 passenger_wsgi.py .htaccess
chmod 600 .env
chmod 755 app/ logs/ uploads/
find app/ -type f -exec chmod 644 {} \;
find app/ -type d -exec chmod 755 {} \;
```

### Problema 7: Passenger Não Inicia

**Sintoma**: Erro "Application failed to start"

**Solução**:

1. Verificar `passenger_wsgi.py`:
   - Caminho do Python está correto?
   - Paths estão corretos?

2. Verificar logs:
   ```bash
   tail -100 ~/passenger.log
   ```

3. Testar manualmente:
   ```bash
   source ~/.local/share/virtualenvs/checklist/bin/activate
   cd ~/public_html/api
   python passenger_wsgi.py
   ```

---

## 📊 COMANDOS ÚTEIS

### Verificar Status

```bash
# Verificar logs em tempo real
tail -f ~/public_html/api/passenger.log

# Verificar logs da aplicação
tail -f ~/public_html/api/logs/app.log

# Verificar processos Python rodando
ps aux | grep python
```

### Reiniciar Aplicação

```bash
# Método 1: Via restart.txt (recomendado)
touch ~/public_html/api/tmp/restart.txt

# Método 2: Matar processo (último recurso)
pkill -f passenger_wsgi.py
```

### Atualizar Código

```bash
# 1. Upload novos arquivos via FTP
# 2. SSH no servidor
ssh seu_usuario@vrdsolution.com.br

# 3. Reinstalar dependências (se necessário)
source ~/.local/share/virtualenvs/checklist/bin/activate
cd ~/public_html/api
pip install -r requirements-production.txt

# 4. Aplicar migrações (se houver)
alembic upgrade head

# 5. Reiniciar
touch tmp/restart.txt
```

---

## 🔐 SEGURANÇA PÓS-DEPLOY

### Checklist de Segurança

- [ ] Alterar senha do usuário admin
- [ ] Alterar `SECRET_KEY` no `.env`
- [ ] Verificar permissões do arquivo `.env` (deve ser 600)
- [ ] Configurar backup automático do banco
- [ ] Ativar HTTPS (SSL) em todos os domínios
- [ ] Configurar firewall se disponível
- [ ] Monitorar logs regularmente
- [ ] Configurar alertas de erro (opcional)

### Alterar Senha do Admin

1. Acesse: https://www.vrdsolution.com.br
2. Faça login com credenciais padrão
3. Vá em Configurações > Alterar Senha
4. Use uma senha forte (ex: gerada por gerenciador de senhas)

---

## 📱 PRÓXIMOS PASSOS

### Melhorias Recomendadas

1. **Monitoramento**:
   - Configure Sentry para rastreamento de erros
   - Configure Google Analytics (opcional)

2. **Backup**:
   - Configure backup automático do banco no painel KingHost
   - Faça backup regular dos arquivos

3. **Performance**:
   - Configure cache (Redis)
   - Otimize imagens do frontend
   - Configure CDN (CloudFlare gratuito)

4. **SEO** (se aplicável):
   - Configure meta tags
   - Adicione sitemap.xml
   - Configure robots.txt

---

## 📞 SUPORTE

### Recursos Úteis

- **Documentação KingHost**: https://king.host/wiki/
- **Suporte KingHost**: suporte@kinghost.com.br
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

### Problemas Comuns

Se encontrar problemas não listados aqui:

1. Verifique os logs: `passenger.log` e `logs/app.log`
2. Teste localmente primeiro
3. Verifique configurações de CORS e DNS
4. Entre em contato com suporte técnico do KingHost

---

## ✅ CHECKLIST FINAL

### Backend

- [ ] Banco de dados PostgreSQL criado
- [ ] Credenciais configuradas no `.env`
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Tabelas do banco criadas
- [ ] Usuário admin criado
- [ ] API respondendo em `/health`
- [ ] Documentação acessível em `/docs`
- [ ] Login funcionando

### Frontend

- [ ] Build de produção realizado
- [ ] Arquivos enviados para `/public_html/www/`
- [ ] `.htaccess` configurado
- [ ] `.env.production` com URL correta
- [ ] Aplicação carrega sem erros
- [ ] Login conecta com backend
- [ ] Sem erros de CORS

### Segurança

- [ ] HTTPS ativado em todos os domínios
- [ ] Senha do admin alterada
- [ ] `SECRET_KEY` única e segura
- [ ] Arquivo `.env` com permissões 600
- [ ] Backups configurados

---

## 🎉 PARABÉNS!

Se você completou todos os passos, sua aplicação está no ar e funcionando!

**URLs finais:**
- 🌐 Frontend: https://www.vrdsolution.com.br
- 🔌 Backend API: https://api.vrdsolution.com.br
- 📚 Documentação: https://api.vrdsolution.com.br/docs

---

**Criado em**: Novembro 2025  
**Versão**: 1.0.0  
**Última atualização**: 25/11/2025
