# 🚀 Guia de Configuração do Banco MySQL

## ⚙️ Passos para Configurar

### 1. Configure o arquivo .env
Edite o arquivo `backend/.env` e ajuste a senha:

```env
DB_HOST=mysql.vrdsolution.com.br
DB_USER=vrdsolution01
DB_PASSWORD=SUA_SENHA_AQUI  # ⚠️ ALTERE AQUI
DB_NAME=vrdsolution01
DB_PORT=3306
```

### 2. Inicialize o Banco de Dados

```bash
cd backend
python init_db.py
```

Este comando irá criar todas as tabelas necessárias:
- ✅ usuarios
- ✅ clientes
- ✅ projetos
- ✅ tarefas
- ✅ checkins
- ✅ tarefas_executadas
- ✅ anexos
- ✅ audit_logs

### 3. Crie o Usuário Administrador

```bash
python create_admin.py
```

Credenciais criadas:
- 📧 Email: `admin@checklist.com`
- 🔐 Senha: `admin123`

### 4. Inicie o Servidor Backend

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Teste a API

Acesse: http://localhost:8000/docs

## 📊 Estrutura do Banco

### Tabela: checkins
Armazena todo o histórico de check-ins com:
- ⏰ Data/hora de início e fim
- 📍 Localização (GPS)
- 👤 Usuário e projeto
- 📝 Observações
- ✅ Status (em andamento/concluído/cancelado)
- ⏱️ Duração calculada automaticamente

### Tabela: tarefas_executadas
Registra cada tarefa realizada durante o check-in

### Tabela: anexos
Armazena fotos e documentos anexados aos check-ins

## 🔧 Troubleshooting

Se houver erro de conexão:
1. Verifique se o host permite conexões externas
2. Confirme usuário e senha
3. Teste conexão: `mysql -h mysql.vrdsolution.com.br -u vrdsolution01 -p`
