#!/usr/bin/env python3
"""
Script para testar conexão com MySQL do KingHost
"""
import pymysql
import sys

# Credenciais do KingHost - ATUALIZADAS
DB_HOST = "mysql.vrdsolution.com.br"
DB_USER = "vrdsolut01_add2"
DB_PASSWORD = "vrd2025"
DB_NAME = "vrdsolution01"
DB_PORT = 3306

print("=" * 60)
print("TESTE DE CONEXÃO MYSQL - KINGHOST")
print("=" * 60)
print(f"Host: {DB_HOST}")
print(f"User: {DB_USER}")
print(f"Database: {DB_NAME}")
print(f"Port: {DB_PORT}")
print("=" * 60)

try:
    print("\n🔄 Tentando conectar...")
    
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        connect_timeout=10,
        charset='utf8mb4'
    )
    
    print("✅ CONEXÃO BEM-SUCEDIDA!")
    print("\n📊 Testando query básica...")
    
    cursor = conn.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"✅ MySQL Version: {version[0]}")
    
    cursor.execute("SELECT DATABASE()")
    database = cursor.fetchone()
    print(f"✅ Current Database: {database[0]}")
    
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"\n📋 Tabelas no banco ({len(tables)}):")
    for table in tables:
        print(f"   - {table[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 60)
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    print("\n💡 A conexão está funcionando!")
    print("   Configure estas credenciais na Vercel:")
    print(f"   DB_HOST={DB_HOST}")
    print(f"   DB_USER={DB_USER}")
    print(f"   DB_PASSWORD={DB_PASSWORD}")
    print(f"   DB_NAME={DB_NAME}")
    print(f"   DB_PORT={DB_PORT}")
    
    sys.exit(0)
    
except pymysql.err.OperationalError as e:
    print(f"\n❌ ERRO DE CONEXÃO: {e}")
    print("\n🔍 Possíveis causas:")
    print("   1. Host incorreto ou inacessível")
    print("   2. Acesso remoto não habilitado no KingHost")
    print("   3. Firewall bloqueando a conexão")
    print("   4. Credenciais incorretas")
    print("\n📝 Ações recomendadas:")
    print("   1. Verifique no painel KingHost se o acesso remoto está habilitado")
    print("   2. Adicione 0.0.0.0/0 nos hosts remotos permitidos")
    print("   3. Confirme as credenciais no painel do KingHost")
    sys.exit(1)
    
except pymysql.err.InternalError as e:
    print(f"\n❌ ERRO INTERNO: {e}")
    print("\n🔍 Possível causa:")
    print("   - Banco de dados não existe ou usuário sem permissão")
    print("\n📝 Ação recomendada:")
    print("   - Verifique o nome do banco de dados no painel KingHost")
    sys.exit(1)
    
except Exception as e:
    print(f"\n❌ ERRO INESPERADO: {type(e).__name__}")
    print(f"   Detalhes: {e}")
    sys.exit(1)
