import sys
import os

# Adiciona o diretório atual ao path para que o Python encontre o módulo 'app'
sys.path.insert(0, os.path.dirname(__file__))

# Importa a aplicação FastAPI
from app.main import app as application_asgi

# Importa o adaptador a2wsgi
from a2wsgi import ASGIMiddleware

# Cria a aplicação WSGI compatível com Passenger
application = ASGIMiddleware(application_asgi)
