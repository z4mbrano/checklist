# ⚠️ CONFIGURAÇÃO CORRETA DAS VARIÁVEIS DE AMBIENTE NA VERCEL

## ❌ NÃO FAÇA ASSIM:
Não copie o arquivo `.env.example` inteiro como uma única variável!

## ✅ FAÇA ASSIM:

Configure **CADA VARIÁVEL SEPARADAMENTE** na Vercel:

### Passo a Passo:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. **Delete qualquer variável existente que esteja errada**
5. Adicione uma por uma:

---

### Variáveis OBRIGATÓRIAS (copie e cole individualmente):

**Nome da variável:** `DB_HOST`  
**Valor:** `mysql.vrdsolution.com.br`

**Nome da variável:** `DB_USER`  
**Valor:** `vrdsolut01_add2`

**Nome da variável:** `DB_PASSWORD`  
**Valor:** `vrd2025`

**Nome da variável:** `DB_NAME`  
**Valor:** `vrdsolution01`

**Nome da variável:** `DB_PORT`  
**Valor:** `3306`

**Nome da variável:** `SECRET_KEY`  
**Valor:** `T8Cd8oDH1/DQp+lbFUUFRNOVaGW5/0eT0yk2QzEC9qM=`

**Nome da variável:** `REDIS_CACHE_ENABLED`  
**Valor:** `false`

**Nome da variável:** `ENVIRONMENT`  
**Valor:** `production`

**Nome da variável:** `DEBUG`  
**Valor:** `false`

---

### ⚠️ ATENÇÃO AOS ERROS COMUNS:

1. **NÃO** adicione aspas nos valores (a Vercel já trata isso)
2. **NÃO** adicione espaços antes ou depois do `=`
3. **NÃO** use valores com `DB_HOST = "valor"` - use apenas `mysql.vrdsolution.com.br`

### Exemplo de como deve ficar na Vercel:

```
Nome: DB_HOST          | Valor: mysql.vrdsolution.com.br
Nome: DB_USER          | Valor: vrdsolut01_add2
Nome: DB_PASSWORD      | Valor: vrd2025
Nome: DB_NAME          | Valor: vrdsolution01
Nome: DB_PORT          | Valor: 3306
Nome: SECRET_KEY       | Valor: T8Cd8oDH1/DQp+lbFUUFRNOVaGW5/0eT0yk2QzEC9qM=
Nome: REDIS_CACHE_ENABLED | Valor: false
Nome: ENVIRONMENT      | Valor: production
Nome: DEBUG            | Valor: false
```

---

### Após adicionar TODAS as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontos (...)** do último deploy
3. Clique em **Redeploy**
4. ✅ Aguarde o build completar

---

### Para verificar se funcionou:

Acesse: `https://checklist-nine-umber.vercel.app/api/debug-db`

Se retornar sucesso, está funcionando! ✅

---

## 🔍 Verificando os logs se continuar com erro:

1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Clique em **Functions**
4. Veja os logs de erro
5. Procure por mensagens relacionadas ao banco de dados

---

## ⚡ Dica Rápida:

Se preferir, você pode usar a CLI da Vercel para adicionar as variáveis:

```bash
vercel env add DB_HOST
# Cole o valor: mysql.vrdsolution.com.br

vercel env add DB_USER
# Cole o valor: vrdsolut01_add2

# ... e assim por diante
```
