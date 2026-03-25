"""
Connect Four AI – Launcher
Run this file to start a local server and open the game in your browser.
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys

PORT = 8765
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class SilentHandler(http.server.SimpleHTTPRequestHandler):
    """Serves files from the project directory, suppresses request logs."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        pass  # keep the terminal clean


def start_server(httpd):
    httpd.serve_forever()


if __name__ == "__main__":
    # Allow reusing address immediately after restart
    socketserver.TCPServer.allow_reuse_address = True

    try:
        httpd = socketserver.TCPServer(("", PORT), SilentHandler)
    except OSError:
        print(f"[!] Port {PORT} is already in use. Try closing other instances.")
        sys.exit(1)

    server_thread = threading.Thread(target=start_server, args=(httpd,), daemon=True)
    server_thread.start()

    url = f"http://localhost:{PORT}/index.html"
    print("=" * 50)
    print("  Connect Four AI")
    print("=" * 50)
    print(f"  Server running at : http://localhost:{PORT}")
    print(f"  Opening           : {url}")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 50)

    # Small delay so server is ready before browser opens
    time.sleep(0.3)
    webbrowser.open(url)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[✓] Server stopped. Goodbye!")
        httpd.shutdown()
