"""
Seed script to populate database with initial data
"""
import sys
import os

# Add app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskCategory
from app.db.base import Base
from datetime import date, timedelta


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")


def seed_users(db: Session):
    """Seed initial users."""
    print("Seeding users...")
    
    users_data = [
        # Admin
        {
            "name": "Administrador",
            "email": "admin@vrdsolution.com",
            "password": "Admin@123",
            "role": UserRole.ADMIN
        },
        # Supervisor
        {
            "name": "João Supervisor",
            "email": "supervisor@vrdsolution.com",
            "password": "Supervisor@123",
            "role": UserRole.SUPERVISOR
        },
        # Técnicos
        {
            "name": "Arthur Técnico",
            "email": "arthur@vrdsolution.com",
            "password": "Arthur@123",
            "role": UserRole.TECNICO
        },
        {
            "name": "Diego Técnico",
            "email": "diego@vrdsolution.com",
            "password": "Diego@123",
            "role": UserRole.TECNICO
        },
        {
            "name": "Guilherme Técnico",
            "email": "gui@vrdsolution.com",
            "password": "Gui@123",
            "role": UserRole.TECNICO
        }
    ]

    for user_data in users_data:
        user = db.query(User).filter(User.email == user_data["email"]).first()
        if not user:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
    
    db.commit()
    print("✅ Users seeded successfully!")


def seed_task_categories(db: Session):
    """Seed task categories."""
    print("Seeding task categories...")
    
    categories = [
        {"nome": "Configuração", "descricao": "Configuração de equipamentos e sistemas", "cor": "#3498db"},
        {"nome": "Manutenção", "descricao": "Manutenção preventiva e corretiva", "cor": "#e74c3c"},
        {"nome": "Instalação", "descricao": "Instalação de novos equipamentos", "cor": "#27ae60"},
        {"nome": "Suporte", "descricao": "Suporte técnico e troubleshooting", "cor": "#f39c12"},
        {"nome": "Treinamento", "descricao": "Treinamento de usuários", "cor": "#9b59b6"},
        {"nome": "Documentação", "descricao": "Criação e atualização de documentação", "cor": "#34495e"},
    ]
    
    for cat_data in categories:
        category = db.query(TaskCategory).filter(TaskCategory.nome == cat_data["nome"]).first()
        if not category:
            category = TaskCategory(**cat_data)
            db.add(category)
    
    db.commit()
    print("✅ Task categories seeded successfully!")


def seed_tasks(db: Session):
    """Seed initial tasks."""
    print("Seeding tasks...")
    
    # Get categories
    config_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Configuração").first()
    manut_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Manutenção").first()
    install_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Instalação").first()
    support_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Suporte").first()
    training_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Treinamento").first()
    doc_cat = db.query(TaskCategory).filter(TaskCategory.nome == "Documentação").first()
    
    tasks = [
        # Configuração
        {"nome": "Configuração de rede", "descricao": "Configurar equipamentos de rede", "tempo_estimado": 120, "categoria_id": config_cat.id},
        {"nome": "Configuração de CLP", "descricao": "Programação e configuração de CLP", "tempo_estimado": 180, "categoria_id": config_cat.id},
        {"nome": "Configuração de IHM", "descricao": "Configuração de interface homem-máquina", "tempo_estimado": 90, "categoria_id": config_cat.id},
        {"nome": "Configuração de switch", "descricao": "Configurar switches de rede industrial", "tempo_estimado": 60, "categoria_id": config_cat.id},
        
        # Manutenção
        {"nome": "Manutenção preventiva", "descricao": "Verificação geral dos equipamentos", "tempo_estimado": 90, "categoria_id": manut_cat.id},
        {"nome": "Limpeza de equipamentos", "descricao": "Limpeza física dos equipamentos", "tempo_estimado": 45, "categoria_id": manut_cat.id},
        {"nome": "Verificação de cabos", "descricao": "Inspeção de cabos e conexões", "tempo_estimado": 30, "categoria_id": manut_cat.id},
        {"nome": "Atualização de firmware", "descricao": "Atualizar firmware dos equipamentos", "tempo_estimado": 60, "categoria_id": manut_cat.id},
        
        # Instalação
        {"nome": "Instalação de CLP", "descricao": "Instalação física de controlador", "tempo_estimado": 120, "categoria_id": install_cat.id},
        {"nome": "Instalação de sensores", "descricao": "Instalação e calibração de sensores", "tempo_estimado": 75, "categoria_id": install_cat.id},
        {"nome": "Passagem de cabos", "descricao": "Instalação de cabeamento", "tempo_estimado": 240, "categoria_id": install_cat.id},
        {"nome": "Montagem de painél", "descricao": "Montagem de painéis elétricos", "tempo_estimado": 300, "categoria_id": install_cat.id},
        
        # Suporte
        {"nome": "Diagnóstico de falhas", "descricao": "Identificação de problemas no sistema", "tempo_estimado": 60, "categoria_id": support_cat.id},
        {"nome": "Correção de erros", "descricao": "Correção de falhas identificadas", "tempo_estimado": 90, "categoria_id": support_cat.id},
        {"nome": "Teste de funcionamento", "descricao": "Testes completos do sistema", "tempo_estimado": 45, "categoria_id": support_cat.id},
        {"nome": "Suporte remoto", "descricao": "Atendimento técnico remoto", "tempo_estimado": 30, "categoria_id": support_cat.id},
        
        # Treinamento
        {"nome": "Treinamento operacional", "descricao": "Treinar operadores do sistema", "tempo_estimado": 240, "categoria_id": training_cat.id},
        {"nome": "Treinamento técnico", "descricao": "Treinar técnicos de manutenção", "tempo_estimado": 360, "categoria_id": training_cat.id},
        
        # Documentação
        {"nome": "Documentação técnica", "descricao": "Criação de manuais técnicos", "tempo_estimado": 180, "categoria_id": doc_cat.id},
        {"nome": "Manual do usuário", "descricao": "Criação de manual para usuários finais", "tempo_estimado": 120, "categoria_id": doc_cat.id},
        {"nome": "As-built", "descricao": "Documentação do projeto conforme construído", "tempo_estimado": 240, "categoria_id": doc_cat.id},
    ]
    
    for task_data in tasks:
        task = db.query(Task).filter(Task.nome == task_data["nome"]).first()
        if not task:
            task = Task(**task_data)
            db.add(task)
    
    db.commit()
    print("✅ Tasks seeded successfully!")


def seed_clients(db: Session):
    """Seed sample clients."""
    print("Seeding clients...")
    
    clients = [
        {
            "nome": "TDK Tecnologia",
            "cnpj": "12.345.678/0001-90",
            "telefone": "(11) 3456-7890",
            "email": "contato@tdk.com.br",
            "endereco": "Av. Paulista, 1000",
            "cidade": "São Paulo",
            "estado": "SP",
            "cep": "01310-100"
        },
        {
            "nome": "Parker Hannifin",
            "cnpj": "23.456.789/0001-91",
            "telefone": "(11) 2345-6789",
            "email": "contato@parker.com.br",
            "endereco": "Rua Industrial, 500",
            "cidade": "São Bernardo do Campo",
            "estado": "SP",
            "cep": "09600-000"
        },
        {
            "nome": "WEG Automação",
            "cnpj": "34.567.890/0001-92",
            "telefone": "(47) 3276-4000",
            "email": "contato@weg.net",
            "endereco": "Av. Prefeito Waldemar Grubba, 3300",
            "cidade": "Jaraguá do Sul",
            "estado": "SC",
            "cep": "89256-900"
        },
        {
            "nome": "SHV Automação",
            "cnpj": "45.678.901/0001-93",
            "telefone": "(11) 4567-8901",
            "email": "contato@shv.com.br",
            "endereco": "Rua das Máquinas, 200",
            "cidade": "Guarulhos",
            "estado": "SP",
            "cep": "07111-000"
        }
    ]
    
    for client_data in clients:
        client = db.query(Client).filter(Client.cnpj == client_data["cnpj"]).first()
        if not client:
            client = Client(**client_data)
            db.add(client)
    
    db.commit()
    print("✅ Clients seeded successfully!")


def seed_projects(db: Session):
    """Seed sample projects."""
    print("Seeding projects...")
    
    # Get users and clients
    arthur = db.query(User).filter(User.email == "arthur@vrdsolution.com").first()
    diego = db.query(User).filter(User.email == "diego@vrdsolution.com").first()
    gui = db.query(User).filter(User.email == "gui@vrdsolution.com").first()
    
    tdk = db.query(Client).filter(Client.nome == "TDK Tecnologia").first()
    parker = db.query(Client).filter(Client.nome == "Parker Hannifin").first()
    weg = db.query(Client).filter(Client.nome == "WEG Automação").first()
    shv = db.query(Client).filter(Client.nome == "SHV Automação").first()
    
    today = date.today()
    
    projects = [
        {
            "nome": "Configuração de Rede Industrial - X",
            "descricao": "Setup completo de rede Profinet com 24 pontos I/O",
            "data_inicio": today - timedelta(days=30),
            "data_fim_prevista": today + timedelta(days=15),
            "status": ProjectStatus.EM_ANDAMENTO,
            "cliente_id": tdk.id,
            "responsavel_id": arthur.id,
            "observacoes": "Projeto prioritário do cliente TDK"
        },
        {
            "nome": "Manutenção Preventiva Parker",
            "descricao": "Manutenção preventiva anual dos equipamentos Parker",
            "data_inicio": today + timedelta(days=7),
            "data_fim_prevista": today + timedelta(days=21),
            "status": ProjectStatus.PLANEJAMENTO,
            "cliente_id": parker.id,
            "responsavel_id": diego.id
        },
        {
            "nome": "Instalação Sensores WEG",
            "descricao": "Instalação de novos sensores de temperatura e pressão",
            "data_inicio": today - timedelta(days=10),
            "data_fim_prevista": today + timedelta(days=5),
            "status": ProjectStatus.EM_ANDAMENTO,
            "cliente_id": weg.id,
            "responsavel_id": gui.id
        },
        {
            "nome": "Upgrade Sistema SHV",
            "descricao": "Atualização do sistema de automação industrial",
            "data_inicio": today + timedelta(days=20),
            "data_fim_prevista": today + timedelta(days=45),
            "status": ProjectStatus.PLANEJAMENTO,
            "cliente_id": shv.id,
            "responsavel_id": arthur.id
        }
    ]
    
    for project_data in projects:
        project = db.query(Project).filter(
            Project.nome == project_data["nome"],
            Project.cliente_id == project_data["cliente_id"]
        ).first()
        if not project:
            project = Project(**project_data)
            db.add(project)
    
    db.commit()
    print("✅ Projects seeded successfully!")


def main():
    """Main seeding function."""
    print("🌱 Starting database seeding...")
    
    try:
        # Create tables
        create_tables()
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Seed data in correct order (due to foreign keys)
            seed_users(db)
            seed_task_categories(db)
            seed_tasks(db)
            seed_clients(db)
            seed_projects(db)
            
            print("\n🎉 Database seeding completed successfully!")
            print("\n📋 Default users created:")
            print("  👨‍💼 Admin: admin@vrdsolution.com / Admin@123")
            print("  👨‍💼 Supervisor: supervisor@vrdsolution.com / Supervisor@123")
            print("  🔧 Técnico Arthur: arthur@vrdsolution.com / Arthur@123")
            print("  🔧 Técnico Diego: diego@vrdsolution.com / Diego@123")
            print("  🔧 Técnico Gui: gui@vrdsolution.com / Gui@123")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise


if __name__ == "__main__":
    main()