"""
Script para criar usuário administrador inicial
"""
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_admin_user():
    """Cria um usuário administrador inicial"""
    db = SessionLocal()
    
    try:
        # Verifica se já existe um usuário admin
        existing_admin = db.query(User).filter(User.email == "admin@checklist.com").first()
        
        if existing_admin:
            print("⚠️  Usuário admin já existe!")
            return
        
        # Cria novo usuário admin
        admin_user = User(
            nome="Administrador",
            email="admin@checklist.com",
            senha_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Usuário administrador criado com sucesso!")
        print(f"   Email: admin@checklist.com")
        print(f"   Senha: admin123")
        print(f"   ID: {admin_user.id}")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
