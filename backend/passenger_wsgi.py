import sys
import os
import traceback

# Define log file path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(CURRENT_DIR, 'startup_error.txt')

def application(environ, start_response):
    try:
        # Basic info
        status = '200 OK'
        output = b"Hello World from Python on KingHost!\n"
        output += b"----------------------------------------\n"
        output += b"Python Version: " + sys.version.encode('utf-8') + b"\n"
        output += b"Current Directory: " + CURRENT_DIR.encode('utf-8') + b"\n"
        
        # Try to list directory contents
        try:
            files = os.listdir(CURRENT_DIR)
            output += b"Files in directory: " + str(files).encode('utf-8') + b"\n"
        except Exception as e:
            output += b"Could not list directory: " + str(e).encode('utf-8') + b"\n"

        response_headers = [('Content-type', 'text/plain; charset=utf-8'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]

    except Exception:
        # Log the full traceback to a file
        try:
            with open(LOG_FILE, 'a') as f:
                f.write("\n--- ERROR ---\n")
                f.write(traceback.format_exc())
        except:
            pass # If we can't write to file, we can't do much
            
        status = '500 Internal Server Error'
        output = b"Internal Server Error - Check startup_error.txt"
        response_headers = [('Content-type', 'text/plain'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]