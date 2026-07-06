# LearnConnect LMS

LearnConnect is a full-stack, modern Learning Management System (LMS) built to bridge the gap between faculty and students with an intuitive, premium interface. 

## Project Structure
- **/frontend**: A Next.js (App Router) React application styled with TailwindCSS.
- **/backend**: A FastAPI application powered by SQLAlchemy and SQLite.

## Core Features
- **Dynamic Dashboards**: Live analytics, active task tracking, and student counts.
- **Class Management**: Create classes and instantly generate 6-character unique Class Codes.
- **Student Enrollment**: Students can instantly join classes using a Class Code.
- **Unified Calendar**: A centralized calendar that dynamically synthesizes class deadlines (assignments, quizzes, coding exercises) alongside global holidays.
- **Task Management**: Upload materials, create coding exercises, construct quizzes, and assign file uploads.

## Quickstart

This project includes a convenient runner script that will start both the FastAPI backend and the Next.js frontend simultaneously in the same terminal.

1. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Run the Application**:
   From the root directory, simply run:
   ```bash
   python3 run.py
   ```

This will spin up the backend on `http://127.0.0.1:8000` and the frontend on `http://localhost:3000`. Navigate to `http://localhost:3000` in your browser to begin!
