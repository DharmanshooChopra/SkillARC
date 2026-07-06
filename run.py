import subprocess
import os
import sys
import time
import signal

def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_dir, "frontend")
    backend_dir = os.path.join(project_dir, "backend")

    print("🚀 Starting LearnConnect LMS...")

    # Start FastAPI Backend
    print("⏳ Starting FastAPI backend on port 8000...")
    # Use venv python explicitly
    backend_cmd = "venv/bin/python -m uvicorn main:app --reload --port 8000"
    backend_process = subprocess.Popen(
        backend_cmd, 
        cwd=backend_dir, 
        shell=True
    )

    # Start Next.js Frontend
    print("⏳ Starting Next.js frontend on port 3000...")
    frontend_process = subprocess.Popen(
        "npm run dev", 
        cwd=frontend_dir,
        shell=True # Required on some systems to resolve 'npm'
    )

    def shutdown_handler(signum, frame):
        print("\n🛑 Shutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("✅ Servers stopped.")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        # Keep the main process alive to catch signals
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()
