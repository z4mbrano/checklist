"""
Passenger WSGI entrypoint for FastAPI running on KingHost.
Wraps the ASGI app using ASGItoWSGI so Passenger (WSGI) can serve it.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load environment variables from .env if available
env_path = os.path.join(BASE_DIR, ".env")
if os.path.isfile(env_path):
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
    except Exception:
        # dotenv is optional; continue without it
        pass

# Import FastAPI app and expose WSGI application for Passenger
try:
    # Usa a2wsgi, compatível e já instalada no ambiente
    from a2wsgi import WSGIMiddleware
except ImportError as e:
    raise RuntimeError(
        "Pacote 'a2wsgi' não encontrado. Instale com 'pip install a2wsgi'"
    ) from e

# Troque para minimal_main durante testes iniciais, se necessário
try:
    from app.main import app as asgi_app
except Exception:
    # Fallback para app mínima caso a principal falhe por dependências
    from app.minimal_main import app as asgi_app

# Passenger procura por o objeto WSGI chamado 'application'
application = WSGIMiddleware(asgi_app)