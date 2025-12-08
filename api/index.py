import sys
import os

# Adiciona o diretório 'backend' ao path do Python para que 'app.main' seja encontrado
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app
