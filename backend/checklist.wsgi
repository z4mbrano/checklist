"""
WSGI entry point for KingHost (renamed from passenger_wsgi.py)
"""
import sys
import os

# Path to the virtual environment Python interpreter
INTERP = os.path.join(os.environ.get('HOME', '/home/vrdsolution'), 
                      '.local', 'share', 'virtualenvs', 'checklist', 'bin', 'python3')

# Only execute if not already using the virtual environment
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Add current directory to Python path
sys.path.insert(0, current_dir)

# Load environment variables
from dotenv import load_dotenv
env_path = os.path.join(current_dir, '.env')
load_dotenv(env_path)

# Import the FastAPI application
from app.main import app as application
