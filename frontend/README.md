# Classroom Frontend

This is the frontend application for **Classroom**, a modern Learning Management System (LMS) built with Next.js and Tailwind CSS. It provides distinct, feature-rich portals for both Faculty and Students.

## Features

### 👨‍🏫 Faculty Portal
- **Dashboard**: Track overall active students, completion rates, and average grades across all classes with live data.
- **Class Management**: Create, edit, and delete classrooms. Generate 6-character Class Codes for students.
- **Classwork**: Assign materials, quizzes, coding exercises, and file-upload assignments.
- **Grades**: View and evaluate student submissions.
- **Calendar**: Global calendar view combined with dynamically synthesized task deadlines.

### 🎓 Student Portal
- **Dashboard**: View enrolled classes and active tasks.
- **Class Enrollment**: Join classrooms instantly using a 6-character Class Code.
- **Tasks & Submissions**: View assignments, coding exercises, and quizzes. Submit work directly through the portal.
- **Calendar**: Stay on top of due dates and global events.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Dates**: [date-fns](https://date-fns.org/)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Integration with Backend
The frontend expects a FastAPI backend to be running on `http://127.0.0.1:8000`. You can start both the frontend and backend simultaneously using the `run.py` script located in the root of the project repository.
