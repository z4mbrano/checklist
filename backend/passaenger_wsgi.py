import sys
import os
from a2wsgi import ASGIMiddleware
from app.main import app  # Certifique-se que seu FastAPI está em app/main.py

# Adiciona a pasta atual ao caminho do Python
sys.path.insert(0, os.path.dirname(__file__))

# Converte o FastAPI (ASGI) para WSGI (padrão da KingHost)
application = ASGIMiddleware(app)