"""
Script para inicializar o banco de dados MySQL
"""
from app.core.database import Base, engine
from app.models import user, client, project, task, checkin, attachment, audit_log

def init_db():
    """Cria todas as tabelas no banco de dados"""
    print("🔄 Criando tabelas no banco de dados...")
    
    try:
        # Importa todos os modelos para garantir que estão registrados
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        # Lista as tabelas criadas
        print("\n📋 Tabelas criadas:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
            
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        raise

if __name__ == "__main__":
    init_db()
