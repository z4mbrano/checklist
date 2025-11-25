# ⚡ Guia Rápido de Deploy - KingHost

**Para quem tem pressa!** 🚀

## Backend (5 minutos)

### 1. Criar Banco PostgreSQL
Painel KingHost > Gerenciar bancos PgSQL > Criar novo banco

### 2. Configurar `.env`
```bash
cd backend
cp .env.production .env
# Editar com suas credenciais do banco
```

### 3. Upload via FTP
```
/public_html/api/
├── passenger_wsgi.py
├── .htaccess
├── .env
├── requirements-production.txt
└── app/
```

### 4. Instalar dependências (SSH)
```bash
ssh usuario@vrdsolution.com.br
python3 -m venv ~/.local/share/virtualenvs/checklist
source ~/.local/share/virtualenvs/checklist/bin/activate
cd ~/public_html/api
pip install -r requirements-production.txt
```

### 5. Setup do banco
```bash
alembic upgrade head  # ou criar tabelas manualmente
python3 scripts/setup_database.sh
```

### 6. Reiniciar
```bash
touch tmp/restart.txt
```

### 7. Testar
https://api.vrdsolution.com.br/health

---

## Frontend (3 minutos)

### 1. Build
```bash
cd frontend
npm install
npm run build
```

### 2. Upload
Enviar tudo de `dist/` para `/public_html/www/`:
- index.html
- .htaccess
- assets/

### 3. Testar
https://www.vrdsolution.com.br

---

## Credenciais Padrão

- **Email**: admin@vrdsolution.com.br
- **Senha**: Admin@123

⚠️ **ALTERE APÓS PRIMEIRO LOGIN!**

---

## Problemas?

```bash
# Ver logs
tail -f ~/public_html/api/passenger.log

# Reiniciar
touch ~/public_html/api/tmp/restart.txt
```

**Guia completo**: Ver `DEPLOY_GUIDE.md`
