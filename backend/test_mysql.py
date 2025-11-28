"""
Script para testar conexão com MySQL
"""
import pymysql
from app.core.config import settings

def test_connection():
    """Testa a conexão com o banco MySQL"""
    print("🔄 Testando conexão com MySQL...")
    print(f"   Host: {settings.db_host}")
    print(f"   Usuário: {settings.db_user}")
    print(f"   Banco: {settings.db_name}")
    print(f"   Porta: {settings.db_port}")
    
    try:
        connection = pymysql.connect(
            host=settings.db_host,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name,
            port=settings.db_port,
            connect_timeout=10
        )
        
        print("✅ Conexão estabelecida com sucesso!")
        
        # Testa uma query simples
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"   Versão do MySQL: {version[0]}")
            
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            if tables:
                print(f"\n📋 Tabelas existentes ({len(tables)}):")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("\n⚠️  Nenhuma tabela encontrada. Execute 'python init_db.py' para criar.")
        
        connection.close()
        return True
        
    except pymysql.err.OperationalError as e:
        print(f"\n❌ Erro de conexão: {e}")
        print("\n💡 Verifique:")
        print("   1. Se a senha no arquivo .env está correta")
        print("   2. Se o servidor MySQL permite conexões externas")
        print("   3. Se o usuário tem permissões adequadas")
        return False
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    test_connection()
