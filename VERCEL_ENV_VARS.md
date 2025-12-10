# Variáveis de Ambiente para VERCEL
# Configure estas variáveis em: Vercel Dashboard → Settings → Environment Variables

# ===== OBRIGATÓRIAS =====

# Database - KingHost MySQL
DB_HOST=seu-mysql.kinghost.net
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=nome_do_banco
DB_PORT=3306

# Security - CRÍTICO!
# Gere com: openssl rand -base64 32
SECRET_KEY=gere-uma-chave-aleatoria-segura-aqui

# ===== RECOMENDADAS =====

# Environment
ENVIRONMENT=production
DEBUG=false

# Redis Cache - Desabilite se não tiver Redis configurado
REDIS_CACHE_ENABLED=false

# Token Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

# ===== OPCIONAIS =====

# CORS - Adicione a URL do seu frontend Vercel se necessário
# ALLOWED_ORIGINS=https://seu-app.vercel.app,http://localhost:5173

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=VRD Check-in System
VERSION=1.0.0

# ===== PASSO A PASSO NA VERCEL =====

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Clique em "Settings" no menu superior
4. Clique em "Environment Variables" no menu lateral
5. Para cada variável acima:
   - Clique em "Add New"
   - Cole o nome da variável (ex: DB_HOST)
   - Cole o valor correspondente
   - Selecione: Production, Preview, Development (ou apenas Production)
   - Clique em "Save"

6. IMPORTANTE: Após adicionar todas as variáveis, faça um REDEPLOY:
   - Vá em "Deployments"
   - Clique nos 3 pontos do último deploy
   - Clique em "Redeploy"
   - Aguarde o build completar

# ===== COMO OBTER OS DADOS DO KINGHOST =====

1. Faça login no painel do KingHost
2. Vá em "MySQL" ou "Banco de Dados"
3. Anote:
   - Host/Servidor (ex: mysql123.kinghost.net)
   - Usuário
   - Nome do banco
   - Porta (geralmente 3306)

4. Configure acesso remoto:
   - Clique em "Hosts Remotos" ou "Acesso Remoto"
   - Adicione: 0.0.0.0/0 (permite todos os IPs)
   - Ou adicione IPs específicos da Vercel

# ===== TESTE A CONEXÃO =====

Após configurar tudo:

1. Aguarde o deploy finalizar
2. Acesse: https://seu-app.vercel.app/api/debug-db
3. Se retornar sucesso, está funcionando!
4. Se retornar erro, verifique os logs:
   - Vercel Dashboard → Deployments → Seu deploy → Functions → Logs

# ===== SOLUÇÃO DE PROBLEMAS =====

Se continuar com erro 500:

1. Verifique os logs no Vercel
2. Teste a conexão MySQL localmente:
   
   mysql -h seu-host.kinghost.net -u seu_usuario -p nome_do_banco

3. Certifique-se que:
   - Acesso remoto está habilitado no KingHost
   - Credenciais estão corretas
   - O banco de dados existe
   - SECRET_KEY foi definido na Vercel

4. Acesse /api/debug-db para ver o erro específico
