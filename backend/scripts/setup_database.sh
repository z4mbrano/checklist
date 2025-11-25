#!/bin/bash
# Script de Setup do Banco de Dados PostgreSQL
# Execute este script após criar o banco de dados no painel KingHost
# Usage: bash setup_database.sh

set -e  # Exit on error

echo "=========================================="
echo "Setup do Banco de Dados - Check-in System"
echo "=========================================="
echo ""

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Variáveis de ambiente carregadas"
else
    echo "✗ Arquivo .env não encontrado!"
    exit 1
fi

# Verificar conexão com o banco
echo ""
echo "Testando conexão com o banco de dados..."
python3 -c "
from sqlalchemy import create_engine, text
import os

db_url = f'postgresql://{os.getenv(\"DB_USER\")}:{os.getenv(\"DB_PASSWORD\")}@{os.getenv(\"DB_HOST\")}:{os.getenv(\"DB_PORT\")}/{os.getenv(\"DB_NAME\")}'
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT version();'))
        version = result.fetchone()[0]
        print(f'✓ Conexão bem-sucedida!')
        print(f'  PostgreSQL: {version.split(\",\")[0]}')
except Exception as e:
    print(f'✗ Erro ao conectar: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "✗ Falha na conexão com o banco de dados"
    exit 1
fi

# Criar tabelas usando Alembic
echo ""
echo "Criando/Atualizando schema do banco de dados..."
cd "$(dirname "$0")"

# Verificar se Alembic está configurado
if [ ! -d "alembic" ]; then
    echo "✗ Diretório alembic não encontrado!"
    echo "  Execute: alembic init alembic"
    exit 1
fi

# Aplicar migrações
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✓ Schema atualizado com sucesso!"
else
    echo "✗ Erro ao aplicar migrações"
    exit 1
fi

# Criar usuário administrador padrão
echo ""
echo "Criando usuário administrador..."
python3 << 'PYTHON_SCRIPT'
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from sqlalchemy.exc import IntegrityError
import sys

db = SessionLocal()

try:
    # Verificar se já existe usuário admin
    existing_admin = db.query(User).filter(User.email == "admin@vrdsolution.com.br").first()
    
    if existing_admin:
        print("⚠ Usuário admin já existe")
    else:
        # Criar novo usuário admin
        admin = User(
            email="admin@vrdsolution.com.br",
            hashed_password=hash_password("Admin@123"),
            full_name="Administrador",
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        print("✓ Usuário admin criado com sucesso!")
        print("  Email: admin@vrdsolution.com.br")
        print("  Senha: Admin@123")
        print("  ⚠ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!")
except IntegrityError as e:
    db.rollback()
    print(f"⚠ Usuário admin já existe ou erro de integridade")
except Exception as e:
    db.rollback()
    print(f"✗ Erro ao criar usuário admin: {e}")
    sys.exit(1)
finally:
    db.close()
PYTHON_SCRIPT

echo ""
echo "=========================================="
echo "Setup concluído com sucesso!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Acesse https://api.vrdsolution.com.br/docs para testar a API"
echo "2. Faça login com as credenciais do admin"
echo "3. Altere a senha padrão"
echo ""
