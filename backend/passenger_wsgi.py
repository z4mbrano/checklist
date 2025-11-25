"""
WSGI entry point for Passenger (KingHost deployment)
This file is required for running FastAPI on shared hosting with Passenger.
"""
import sys
import os

# SIMPLE DEBUGGER - ASCII ONLY
# No special characters, no complex logic.

def application(environ, start_response):
    status = '200 OK'
    output = b"Hello World from Python!\n"
    
    try:
        version = sys.version.encode('ascii', 'replace')
        output += b"Python Version: " + version + b"\n"
        output += b"Path: " + str(sys.path).encode('ascii', 'replace') + b"\n"
    except Exception as e:
        output += b"Error getting info: " + str(e).encode('ascii', 'replace')

    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)
    return [output]





