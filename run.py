import subprocess
import os
import sys
import time

def run():
    print("Starting Learning Management System Servers...")
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    processes = []

    try:
        # Start FastAPI backend (Port 8000)
        print("Starting FastAPI Backend on port 8000...")
        backend_process = subprocess.Popen(
            ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            cwd=backend_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        processes.append(backend_process)

        # Wait a moment before starting frontend
        time.sleep(2)

        # Start Next.js frontend (Port 3000)
        print("Starting Next.js Frontend on port 3000...")
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        processes.append(frontend_process)

        # Keep the script running
        for p in processes:
            p.wait()

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.wait()
        print("Shutdown complete.")
        sys.exit(0)

if __name__ == "__main__":
    run()
