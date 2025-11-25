#!/bin/bash
# Script de Verificação de Configuração
# Verifica se todos os componentes necessários estão configurados corretamente
# Usage: bash verify_setup.sh

echo "=========================================="
echo "Verificação de Configuração - Check-in System"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Função para imprimir resultado
check_result() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $2"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        if [ -n "$3" ]; then
            echo -e "  ${YELLOW}→${NC} $3"
        fi
    fi
}

# 1. Verificar Python
echo "=== Verificando Python ==="
python3 --version > /dev/null 2>&1
check_result $? "Python 3 instalado" "Instale Python 3.8+"

# 2. Verificar pip
pip3 --version > /dev/null 2>&1
check_result $? "pip instalado"

# 3. Verificar ambiente virtual
if [ -d "$HOME/.local/share/virtualenvs/checklist" ]; then
    check_result 0 "Ambiente virtual criado"
else
    check_result 1 "Ambiente virtual criado" "Execute: python3 -m venv ~/.local/share/virtualenvs/checklist"
fi

# 4. Verificar arquivo .env
echo ""
echo "=== Verificando Configuração ==="
if [ -f ".env" ]; then
    check_result 0 "Arquivo .env existe"
    
    # Verificar variáveis essenciais
    source .env
    
    [ -n "$DB_HOST" ]
    check_result $? "DB_HOST definido"
    
    [ -n "$DB_USER" ]
    check_result $? "DB_USER definido"
    
    [ -n "$DB_PASSWORD" ]
    check_result $? "DB_PASSWORD definido"
    
    [ -n "$DB_NAME" ]
    check_result $? "DB_NAME definido"
    
    [ -n "$SECRET_KEY" ]
    check_result $? "SECRET_KEY definido"
    
    [ "$ENVIRONMENT" = "production" ]
    check_result $? "ENVIRONMENT=production"
    
    [ "$DEBUG" = "False" ]
    check_result $? "DEBUG=False"
else
    check_result 1 "Arquivo .env existe" "Copie .env.production para .env e configure"
fi

# 5. Verificar arquivos necessários
echo ""
echo "=== Verificando Arquivos ==="
[ -f "passenger_wsgi.py" ]
check_result $? "passenger_wsgi.py existe"

[ -f ".htaccess" ]
check_result $? ".htaccess existe"

[ -f "requirements-production.txt" ]
check_result $? "requirements-production.txt existe"

# 6. Verificar dependências Python
echo ""
echo "=== Verificando Dependências Python ==="

if [ -d "$HOME/.local/share/virtualenvs/checklist" ]; then
    source "$HOME/.local/share/virtualenvs/checklist/bin/activate"
    
    python3 -c "import fastapi" 2>/dev/null
    check_result $? "FastAPI instalado"
    
    python3 -c "import sqlalchemy" 2>/dev/null
    check_result $? "SQLAlchemy instalado"
    
    python3 -c "import psycopg2" 2>/dev/null
    check_result $? "psycopg2 instalado"
    
    python3 -c "import jose" 2>/dev/null
    check_result $? "python-jose instalado"
    
    python3 -c "import passlib" 2>/dev/null
    check_result $? "passlib instalado"
    
    deactivate
fi

# 7. Verificar conexão com banco de dados
echo ""
echo "=== Verificando Banco de Dados ==="

if [ -f ".env" ]; then
    python3 << 'PYTHON_SCRIPT'
from sqlalchemy import create_engine, text
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
    
    db_url = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME')}"
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        sys.exit(0)
except Exception as e:
    print(f"Erro: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT
    
    check_result $? "Conexão com PostgreSQL" "Verifique as credenciais no .env"
fi

# 8. Verificar estrutura de diretórios
echo ""
echo "=== Verificando Estrutura ==="
[ -d "app" ]
check_result $? "Diretório app/ existe"

[ -d "app/api" ]
check_result $? "Diretório app/api/ existe"

[ -d "app/models" ]
check_result $? "Diretório app/models/ existe"

[ -d "app/core" ]
check_result $? "Diretório app/core/ existe"

# 9. Verificar permissões
echo ""
echo "=== Verificando Permissões ==="
[ -r "passenger_wsgi.py" ]
check_result $? "passenger_wsgi.py é legível"

[ -r ".env" ]
check_result $? ".env é legível"

# 10. Verificar logs
echo ""
echo "=== Verificando Logs ==="
if [ -f "passenger.log" ]; then
    check_result 0 "passenger.log existe"
    
    # Verificar erros recentes
    if grep -i "error" passenger.log | tail -5 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Erros encontrados no log (últimas 5 linhas):"
        grep -i "error" passenger.log | tail -5
    fi
else
    check_result 1 "passenger.log existe" "Será criado após primeiro acesso"
fi

# Resumo
echo ""
echo "=========================================="
echo "RESUMO"
echo "=========================================="
echo -e "Total de verificações: ${TOTAL_CHECKS}"
echo -e "${GREEN}Passou: ${PASSED_CHECKS}${NC}"
echo -e "${RED}Falhou: ${FAILED_CHECKS}${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os checks passaram! Sistema pronto para deploy.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Algumas verificações falharam. Corrija os problemas acima.${NC}"
    exit 1
fi
