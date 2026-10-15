"""
Double-click this file to start the Movie Recommender app.
It launches the FastAPI server and opens the site in your browser.
"""
import subprocess
import sys
import time
import webbrowser
import os

HOST = "127.0.0.1"
PORT = 8000
URL = f"http://{HOST}:{PORT}"

# Ensure we run from the project root directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(PROJECT_ROOT)

print("=" * 50)
print("  🍿 Starting PopcornStats Server...")
print("=" * 50)
print()
print(f"  Server will be available at: {URL}")
print(f"  Press Ctrl+C to stop the server.")
print()

# Open the browser after a short delay (in background)
def open_browser():
    time.sleep(2)
    webbrowser.open(URL)

import threading
threading.Thread(target=open_browser, daemon=True).start()

# Start uvicorn (this blocks until you press Ctrl+C)
try:
    subprocess.run(
        [sys.executable, "-m", "uvicorn", "backend.main:app",
         "--host", HOST, "--port", str(PORT), "--reload"],
        cwd=PROJECT_ROOT,
    )
except KeyboardInterrupt:
    print("\n  Server stopped. Goodbye! 👋")
