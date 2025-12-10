# Guia de Solução - Erro de Conexão MySQL 500

## Problema Atual
A API está retornando erro 500 ao tentar acessar `/api/v1/checkins/active`, indicando falha na conexão com o MySQL.

## Checklist de Verificação

### 1. Variáveis de Ambiente no Vercel

No painel da Vercel (https://vercel.com), você precisa configurar as seguintes variáveis de ambiente:

**Acesse:** Seu Projeto → Settings → Environment Variables

```bash
# Database Configuration
DB_HOST=seu-host.kinghost.net
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
DB_PORT=3306

# Security (OBRIGATÓRIO)
SECRET_KEY=gere-com-openssl-rand-base64-32

# Redis (Opcional - desabilite se não tiver)
REDIS_CACHE_ENABLED=false

# Environment
ENVIRONMENT=production
DEBUG=false
```

**IMPORTANTE:** Após adicionar as variáveis, você precisa fazer um **Redeploy** do projeto!

### 2. Configurações do KingHost MySQL

#### 2.1. Verificar Acesso Remoto
1. Acesse o painel do KingHost
2. Vá em **MySQL** → **Gerenciar**
3. Clique em **Hosts Remotos** ou **Acesso Remoto**
4. Adicione o IP: **0.0.0.0/0** (permite todos os IPs)
   - Ou especificamente os IPs da Vercel (mais seguro)

#### 2.2. Verificar Credenciais
Confirme no painel KingHost:
- Host/Servidor (ex: mysql123.kinghost.net)
- Nome do usuário
- Nome do banco de dados
- Porta (geralmente 3306)

#### 2.3. Testar Conexão Manualmente
Teste a conexão usando um cliente MySQL (MySQL Workbench, DBeaver, ou linha de comando):

```bash
mysql -h seu-host.kinghost.net -u seu_usuario -p nome_do_banco
```

Se não conectar, o problema está nas configurações do KingHost.

### 3. Verificações no Código

#### 3.1. String de Conexão
O código está usando PyMySQL, que é compatível com MySQL. A string de conexão está em `backend/app/core/config.py`:

```python
f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
```

#### 3.2. Pool de Conexões
Para MySQL em produção, verifique se o pool de conexões está configurado adequadamente.

**Adicione em `backend/app/core/database.py`:**

```python
# MySQL configuration
engine_kwargs.update({
    "pool_pre_ping": True,        # Verifica conexão antes de usar
    "pool_recycle": 3600,          # Recicla conexões a cada 1h
    "pool_size": 5,                # Máximo de 5 conexões simultâneas
    "max_overflow": 10,            # Permite até 10 conexões extras
    "connect_args": {
        "connect_timeout": 10,     # Timeout de 10 segundos
        "charset": "utf8mb4"       # Suporte a emojis e caracteres especiais
    }
})
```

### 4. Problemas Comuns e Soluções

#### Erro: "Can't connect to MySQL server"
**Causa:** Host incorreto ou firewall bloqueando
**Solução:** 
- Verifique se o host está correto
- Confirme que acesso remoto está habilitado no KingHost
- Teste conexão fora da Vercel

#### Erro: "Access denied for user"
**Causa:** Usuário/senha incorretos ou sem permissões
**Solução:**
- Verifique as credenciais no painel KingHost
- Confirme que o usuário tem permissões no banco

#### Erro: "Unknown database"
**Causa:** Nome do banco de dados incorreto
**Solução:**
- Confirme o nome exato do banco no painel KingHost

#### Erro: "Too many connections"
**Causa:** Muitas conexões abertas simultaneamente
**Solução:**
- Reduza `pool_size` e `max_overflow`
- Verifique se conexões estão sendo fechadas corretamente

### 5. Dependências Python

Verifique se `pymysql` está no `requirements.txt`:

```txt
pymysql>=1.1.0
cryptography>=41.0.0  # Necessário para PyMySQL
```

### 6. Logs de Debugging

Para verificar o erro exato, você pode:

1. **No Vercel:**
   - Acesse: Deployments → Selecione o deploy → Functions → Logs
   - Procure por erros relacionados ao banco de dados

2. **Adicionar endpoint de debug** (já existe em `main.py`):
   ```
   GET /api/debug-db
   ```
   Acesse: `https://seu-app.vercel.app/api/debug-db`

### 7. Passos para Resolução Imediata

1. **Configure as variáveis de ambiente na Vercel**
2. **Faça Redeploy do projeto**
3. **Teste a conexão acessando `/api/debug-db`**
4. **Verifique os logs no Vercel se ainda houver erro**

### 8. Configuração Alternativa: SSL/TLS

Alguns provedores MySQL exigem conexão SSL. Se o KingHost exigir, adicione:

```python
"connect_args": {
    "ssl": {"ssl_mode": "REQUIRED"},
    "charset": "utf8mb4"
}
```

## Comandos Úteis

### Gerar SECRET_KEY
```bash
openssl rand -base64 32
```

### Testar conexão Python local
```python
import pymysql

try:
    conn = pymysql.connect(
        host='seu-host.kinghost.net',
        user='seu_usuario',
        password='sua_senha',
        database='nome_do_banco',
        port=3306
    )
    print("✅ Conexão bem-sucedida!")
    conn.close()
except Exception as e:
    print(f"❌ Erro: {e}")
```

## Próximos Passos

1. ✅ Configure as variáveis de ambiente
2. ✅ Verifique acesso remoto no KingHost
3. ✅ Teste a conexão manualmente
4. ✅ Faça redeploy na Vercel
5. ✅ Acesse `/api/debug-db` para confirmar
6. ✅ Verifique os logs se ainda houver problemas
