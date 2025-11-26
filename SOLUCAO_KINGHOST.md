# 🔧 Solução Definitiva - Deploy KingHost

## Problema Atual
- **Backend**: 403 Forbidden (Passenger não está sendo acionado)
- **Frontend**: 500 Internal Server Error
- Arquivo `startup_error.txt` não aparece = Passenger nunca foi executado

## Diagnóstico: Por que o Passenger não roda?

O Passenger da KingHost só funciona quando:
1. O subdomínio aponta para uma pasta dentro de `/www`
2. Existe um `.htaccess` válido nessa pasta
3. As permissões estão corretas

**Seu problema**: O subdomínio aponta para `/apps_wsgi/checklist/`, mas a KingHost obriga que subdomínios fiquem em `/www`.

## ✅ SOLUÇÃO CORRETA

### Passo 1: Reorganizar estrutura no servidor

Via SSH, execute estes comandos:

```bash
# 1) Criar pasta definitiva dentro de /www
mkdir -p ~/www/checklist-backend

# 2) Mover TODO o conteúdo de /apps_wsgi/checklist para /www/checklist-backend
cp -r ~/apps_wsgi/checklist/* ~/www/checklist-backend/

# 3) Verificar que copiou tudo
ls -la ~/www/checklist-backend/
# Deve mostrar: app/, alembic/, .env, .htaccess, passenger_wsgi.py, requirements-production.txt, tmp/
```

### Passo 2: Atualizar subdomínio no painel

1. Vá em **Gerenciar Subdomínios**
2. Edite `checklist.vrdsolution.com.br`
3. Mude o diretório para: `/www/checklist-backend/` (COM a barra no final)
4. Salve

### Passo 3: Ajustar .htaccess no servidor

Via SSH ou FTP, edite `/www/checklist-backend/.htaccess` para:

```apache
PassengerEnabled On
PassengerAppType wsgi
PassengerStartupFile passenger_wsgi.py
PassengerPython /home/vrdsolution/.local/share/virtualenvs/checklist/bin/python3
PassengerAppRoot /home/vrdsolution/www/checklist-backend

Options -Indexes
```

**Importante**: `PassengerAppRoot` agora aponta para `/home/vrdsolution/www/checklist-backend`

### Passo 4: Ajustar permissões e reiniciar

Via SSH:

```bash
cd ~/www/checklist-backend

# Permissões
chmod 644 .htaccess passenger_wsgi.py
chmod 600 .env
find app -type f -exec chmod 644 {} \;
find app -type d -exec chmod 755 {} \;
chmod 755 alembic tmp

# Reiniciar Passenger
mkdir -p tmp
touch tmp/restart.txt

# Aguardar 5 segundos
sleep 5
```

### Passo 5: Testar

Acesse: https://checklist.vrdsolution.com.br/

**Resultado esperado**:
- ✅ "Hello World from Python on KingHost!" = Funcionou!
- ❌ 403/500 = Verifique se apareceu `startup_error.txt`

Se aparecer `startup_error.txt`, baixe via FTP e me envie o conteúdo.

---

## 🎨 FRONTEND - Corrigir Erro 500

### Diagnóstico

O erro 500 em `https://vrdsolution.com.br/checklist/` pode ser:
1. Conflito com `.htaccess` da raiz `/www`
2. Regras de rewrite em loop

### Teste 1: Acesso direto

Teste: https://vrdsolution.com.br/checklist/index.html

- **Se abrir**: O problema é o `.htaccess` reescrevendo errado
- **Se der 500**: Há um `.htaccess` pai bloqueando

### Solução A: Isolar a pasta checklist

Via SSH ou FTP, verifique se existe `/www/.htaccess`.

Se existir, adicione esta linha **NO TOPO** do arquivo `/www/.htaccess`:

```apache
# Ignorar rewrite para a subpasta checklist
RewriteRule ^checklist/ - [L]
```

Depois disso, o resto do `.htaccess` da raiz não vai afetar `/checklist/`.

### Solução B: .htaccess da subpasta

Confirme que `/www/checklist/.htaccess` está exatamente assim:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /checklist/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /checklist/index.html [L]
</IfModule>
```

### Solução C: Rebuild sem base

Se nada funcionar, teste sem o `base: '/checklist/'`:

1. No seu PC, edite `frontend/vite.config.ts`:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     // base: '/checklist/',  // COMENTAR esta linha
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
     // ...resto
   })
   ```

2. Rebuild:
   ```powershell
   npm run build
   ```

3. Crie um novo subdomínio: `app.vrdsolution.com.br` → `/www/checklist`

4. Teste: https://app.vrdsolution.com.br/

Isso isola o frontend completamente da raiz.

---

## 📋 Checklist Rápido

### Backend
- [ ] Pasta movida/copiada para `/www/checklist-backend/`
- [ ] Subdomínio aponta para `/www/checklist-backend/`
- [ ] `.htaccess` atualizado com caminho correto
- [ ] Permissões ajustadas (644, 600, 755)
- [ ] `touch tmp/restart.txt` executado
- [ ] Aguardou 10 segundos antes de testar
- [ ] Testou `https://checklist.vrdsolution.com.br/`

### Frontend
- [ ] `/www/checklist/` tem: assets/, index.html, .htaccess, vite.svg
- [ ] Testou `/checklist/index.html` diretamente
- [ ] Verificou/ajustou `.htaccess` da raiz `/www`
- [ ] Testou `https://vrdsolution.com.br/checklist/`

---

## 🆘 Se AINDA não funcionar

Me envie:

1. **Saída deste comando SSH**:
   ```bash
   ls -laR ~/www/checklist-backend/ | head -50
   cat ~/www/checklist-backend/.htaccess
   ```

2. **Print/texto** do painel de subdomínios mostrando:
   - Subdomínio: `checklist.vrdsolution.com.br`
   - Diretório mapeado

3. **Se aparecer**, conteúdo de:
   - `~/www/checklist-backend/startup_error.txt`
   - Logs de erro do Apache (se tiver acesso no painel)

4. **Para o frontend**: resultado do teste de `/checklist/index.html`

---

## 💡 Explicação Técnica

**Por que mover de `/apps_wsgi` para `/www`?**

A KingHost usa Apache + Passenger. Quando você cria um subdomínio, o Apache:
1. Mapeia o domínio para uma pasta dentro de `/www`
2. Lê o `.htaccess` dessa pasta
3. Se encontrar `PassengerEnabled On`, passa o controle para o Passenger
4. O Passenger executa o `passenger_wsgi.py`

Se a pasta está fora de `/www`, o Apache não consegue mapear corretamente e retorna 403 (proibido) porque pensa que você está tentando acessar uma área restrita.

**E o virtualenv?**

Não precisa mexer! O `.htaccess` aponta para:
```
PassengerPython /home/vrdsolution/.local/share/virtualenvs/checklist/bin/python3
```

Esse caminho continua válido não importa onde esteja o código da aplicação.
