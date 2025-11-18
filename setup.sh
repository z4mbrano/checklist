#!/bin/bash

echo "🚀 VRD Solution - Sistema de Check-in/Check-out"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não encontrado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    print_success "Docker e Docker Compose encontrados!"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) encontrado!"
}

# Setup backend
setup_backend() {
    print_step "Configurando backend..."
    
    cd backend
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Arquivo .env criado!"
    else
        print_warning "Arquivo .env já existe."
    fi
    
    # Start Docker services
    print_step "Iniciando serviços Docker..."
    docker-compose up -d
    
    # Wait for database to be ready
    print_step "Aguardando banco de dados..."
    sleep 10
    
    # Run migrations
    print_step "Executando migrações..."
    docker-compose exec backend alembic upgrade head
    
    # Seed database
    print_step "Populando banco de dados..."
    docker-compose exec backend python app/scripts/seed.py
    
    print_success "Backend configurado com sucesso!"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_step "Configurando frontend..."
    
    cd frontend
    
    # Copy environment file
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_success "Arquivo .env.local criado!"
    else
        print_warning "Arquivo .env.local já existe."
    fi
    
    # Install dependencies
    print_step "Instalando dependências do frontend..."
    npm install
    
    print_success "Frontend configurado com sucesso!"
    cd ..
}

# Show access information
show_access_info() {
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo "================================"
    echo ""
    echo "📌 Acesse os serviços:"
    echo "  🖥️  Frontend:    http://localhost:3000"
    echo "  🔧 Backend API:  http://localhost:8000"
    echo "  📚 API Docs:     http://localhost:8000/docs"
    echo ""
    echo "👤 Usuários padrão:"
    echo "  Admin:      admin@vrdsolution.com      / Admin@123"
    echo "  Supervisor: supervisor@vrdsolution.com / Supervisor@123"
    echo "  Técnico:    arthur@vrdsolution.com     / Arthur@123"
    echo "  Técnico:    diego@vrdsolution.com      / Diego@123"
    echo "  Técnico:    gui@vrdsolution.com        / Gui@123"
    echo ""
    echo "🚀 Para iniciar o frontend:"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "📋 Para verificar logs do backend:"
    echo "  cd backend && docker-compose logs -f"
    echo ""
}

# Main execution
main() {
    echo "Verificando pré-requisitos..."
    check_docker
    check_node
    
    echo ""
    setup_backend
    setup_frontend
    show_access_info
}

# Run main function
main