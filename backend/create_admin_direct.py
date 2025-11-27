"""
Script para criar usuário admin diretamente no banco MySQL
"""
import pymysql
from app.core.config import settings
import bcrypt

def create_admin_direct():
    """Cria usuário admin diretamente no MySQL"""
    
    # Gera hash da senha usando bcrypt diretamente
    password = "admin123"
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    try:
        connection = pymysql.connect(
            host=settings.db_host,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name,
            port=settings.db_port
        )
        
        with connection.cursor() as cursor:
            # Verifica se já existe
            cursor.execute("SELECT id FROM usuarios WHERE email = 'admin@vrdsolution.com.br'")
            existing_user = cursor.fetchone()
            
            if existing_user:
                print("⚠️  Usuário admin já existe! Atualizando senha...")
                update_sql = "UPDATE usuarios SET hashed_password = %s WHERE email = 'admin@vrdsolution.com.br'"
                cursor.execute(update_sql, (password_hash,))
                connection.commit()
                print("✅ Senha atualizada para: admin123")
                return
            
            # Insere novo usuário
            sql = """
                INSERT INTO usuarios (name, email, hashed_password, role, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, ('Administrador', 'admin@vrdsolution.com.br', password_hash, 'ADMIN', 1))
            connection.commit()
            
            print("✅ Usuário administrador criado com sucesso!")
            print(f"   Email: admin@vrdsolution.com.br")
            print(f"   Senha: admin123")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        raise
    finally:
        connection.close()

if __name__ == "__main__":
    create_admin_direct()
