#!/bin/bash
# Script de Deploy Automatizado para KingHost
# Este script automatiza o processo de deploy do backend
# Usage: bash deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "Deploy Automatizado - Check-in System"
echo "=========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "passenger_wsgi.py" ]; then
    echo "✗ Erro: Execute este script do diretório backend/"
    exit 1
fi

# 1. Ativar ambiente virtual
echo "1. Ativando ambiente virtual..."
if [ -d "$HOME/.local/share/virtualenvs/checklist" ]; then
    source "$HOME/.local/share/virtualenvs/checklist/bin/activate"
    echo "✓ Ambiente virtual ativado"
else
    echo "✗ Ambiente virtual não encontrado"
    echo "  Criando ambiente virtual..."
    python3 -m venv "$HOME/.local/share/virtualenvs/checklist"
    source "$HOME/.local/share/virtualenvs/checklist/bin/activate"
    echo "✓ Ambiente virtual criado e ativado"
fi

# 2. Atualizar pip
echo ""
echo "2. Atualizando pip..."
pip install --upgrade pip
echo "✓ pip atualizado"

# 3. Instalar dependências
echo ""
echo "3. Instalando dependências..."
if [ -f "requirements-production.txt" ]; then
    pip install -r requirements-production.txt
    echo "✓ Dependências instaladas"
else
    echo "✗ requirements-production.txt não encontrado"
    exit 1
fi

# 4. Verificar arquivo .env
echo ""
echo "4. Verificando configuração..."
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo "⚠ Arquivo .env não encontrado"
        echo "  Copiando .env.production para .env..."
        cp .env.production .env
        echo "⚠ ATENÇÃO: Configure as variáveis no arquivo .env antes de continuar!"
        echo "  Edite: nano .env"
        read -p "Pressione ENTER após configurar o .env..."
    else
        echo "✗ Nem .env nem .env.production encontrados"
        exit 1
    fi
fi
echo "✓ Arquivo .env existe"

# 5. Testar conexão com banco de dados
echo ""
echo "5. Testando conexão com banco de dados..."
python3 -c "
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import create_engine, text
import os

db_url = f'postgresql://{os.getenv(\"DB_USER\")}:{os.getenv(\"DB_PASSWORD\")}@{os.getenv(\"DB_HOST\")}:{os.getenv(\"DB_PORT\", \"5432\")}/{os.getenv(\"DB_NAME\")}'
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('✓ Conexão com banco de dados OK')
except Exception as e:
    print(f'✗ Erro ao conectar ao banco: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "✗ Falha na conexão com banco de dados"
    exit 1
fi

# 6. Executar migrações
echo ""
echo "6. Aplicando migrações do banco de dados..."
if [ -d "alembic" ]; then
    alembic upgrade head
    echo "✓ Migrações aplicadas"
else
    echo "⚠ Diretório alembic não encontrado"
    echo "  Criando tabelas diretamente..."
    python3 -c "
from app.core.database import engine, Base
from app.models import user, client, project, task, checkin, attachment, audit_log
Base.metadata.create_all(bind=engine)
print('✓ Tabelas criadas')
"
fi

# 7. Criar usuário admin (se não existir)
echo ""
echo "7. Verificando usuário administrador..."
python3 << 'PYTHON_SCRIPT'
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from sqlalchemy.exc import IntegrityError

db = SessionLocal()

try:
    existing_admin = db.query(User).filter(User.email == "admin@vrdsolution.com.br").first()
    
    if existing_admin:
        print("✓ Usuário admin já existe")
    else:
        admin = User(
            email="admin@vrdsolution.com.br",
            hashed_password=hash_password("Admin@123"),
            full_name="Administrador",
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        print("✓ Usuário admin criado")
        print("  Email: admin@vrdsolution.com.br")
        print("  Senha: Admin@123 (ALTERE APÓS LOGIN!)")
except Exception as e:
    db.rollback()
    print(f"⚠ Não foi possível criar admin: {e}")
finally:
    db.close()
PYTHON_SCRIPT

# 8. Verificar permissões
echo ""
echo "8. Verificando permissões de arquivos..."
chmod 644 passenger_wsgi.py
chmod 644 .htaccess
chmod 600 .env  # Apenas leitura/escrita para o dono
echo "✓ Permissões configuradas"

# 9. Criar diretório de logs
echo ""
echo "9. Criando diretório de logs..."
mkdir -p logs
chmod 755 logs
echo "✓ Diretório de logs criado"

# 10. Criar diretório de uploads
echo ""
echo "10. Criando diretório de uploads..."
mkdir -p uploads
chmod 755 uploads
echo "✓ Diretório de uploads criado"

# 11. Reiniciar aplicação Passenger
echo ""
echo "11. Reiniciando aplicação..."
# Passenger detecta mudanças quando tocamos no restart.txt
mkdir -p tmp
touch tmp/restart.txt
echo "✓ Aplicação reiniciada"

# Resumo
echo ""
echo "=========================================="
echo "Deploy concluído com sucesso!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Teste o backend: https://api.vrdsolution.com.br/health"
echo "2. Acesse a documentação: https://api.vrdsolution.com.br/docs"
echo "3. Verifique os logs: tail -f logs/app.log"
echo "4. Verifique logs do Passenger: tail -f passenger.log"
echo ""
echo "⚠ IMPORTANTE:"
echo "- Altere a senha do usuário admin após o primeiro login"
echo "- Verifique se o CORS está configurado corretamente"
echo "- Monitore os logs para identificar possíveis erros"
echo ""

deactivate
