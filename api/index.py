import sys
import os

# Adiciona o diretório 'backend' ao path do Python para que 'app.main' seja encontrado
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

try:
    from app.main import app
except Exception as e:
    import traceback
    print("CRITICAL ERROR DURING STARTUP:")
    traceback.print_exc()
    raise e
