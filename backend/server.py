import http.server
import socketserver
import sys
import os

# --- Configuration ---
PORT = 8000
# Define the default directory to serve files from.
# This will be overridden by a command-line argument if provided.
DEFAULT_DIRECTORY = "rawData"

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP request handler that includes CORS headers and serves
    from a specified directory path.
    """

    def __init__(self, *args, **kwargs):
        # We override the SimpleHTTPRequestHandler's default directory
        # using the global path set in the main script block.
        super().__init__(*args, directory=CORSHTTPRequestHandler.directory_to_serve, **kwargs)

    def end_headers(self):
        """Sends the standard headers plus the necessary CORS headers."""
        # Allow requests from *any* origin (including localhost:5173 for your React app)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        """Handles preflight requests required by the browser for CORS."""
        self.send_response(200)
        self.end_headers()

# --- Main Execution Block ---

# Check if a directory path was passed as an argument
if len(sys.argv) > 1:
    # Use the first argument as the directory path
    target_directory = sys.argv[1]
else:
    # Use the default directory if no argument is provided
    target_directory = DEFAULT_DIRECTORY

# Ensure the path is absolute and exists
CORSHTTPRequestHandler.directory_to_serve = os.path.abspath(target_directory)

if not os.path.isdir(CORSHTTPRequestHandler.directory_to_serve):
    print(f"Error: Directory not found at {CORSHTTPRequestHandler.directory_to_serve}")
    print(f"Please create the '{target_directory}' directory and ensure it contains your CSV files.")
    sys.exit(1)

print(f"Serving data with CORS enabled on port {PORT}")
print(f"Serving files from: {CORSHTTPRequestHandler.directory_to_serve}")

# Start the server
try:
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped manually.")
except Exception as e:
    print(f"An error occurred: {e}")