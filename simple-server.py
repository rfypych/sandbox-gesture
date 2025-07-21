#!/usr/bin/env python3
"""
Simple HTTP server for serving the Particle Hand Game
Run with: python simple-server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.ts'):
            return 'application/typescript'
        if path.endswith('.js'):
            return 'application/javascript'
        return mimetype

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🎮 Particle Hand Game Server")
        print(f"🌐 Server running at http://localhost:{PORT}")
        print(f"📱 Make sure to allow camera access!")
        print(f"🛑 Press Ctrl+C to stop")
        
        # Try to open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.exit(0)
