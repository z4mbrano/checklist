"""
WSGI entry point for Passenger (KingHost deployment)
This file is required for running FastAPI on shared hosting with Passenger.
"""
import sys
import os

# Path to the virtual environment Python interpreter
# Replace 'vrdsolution' with your actual KingHost username
INTERP = os.path.join(os.environ.get('HOME', '/home/vrdsolution'), 
                      '.local', 'share', 'virtualenvs', 'checklist', 'bin', 'python3')

# Only execute if not already using the virtual environment
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Get the current directory (where this file is located)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Add current directory to Python path
sys.path.insert(0, current_dir)
# Se você enviou a pasta 'backend' inteira, descomente a linha abaixo:
# sys.path.insert(0, os.path.join(current_dir, 'backend'))

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = os.path.join(current_dir, '.env')
load_dotenv(env_path)

# Import the FastAPI application
# The 'application' variable name is required by Passenger
from app.main import app as application

# Optional: Add logging for debugging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(current_dir, 'passenger.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info("Passenger WSGI application started")
logger.info(f"Python path: {sys.path}")
logger.info(f"Environment: {os.environ.get('ENVIRONMENT', 'not set')}")

# For running with uvicorn in development
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=8000)

