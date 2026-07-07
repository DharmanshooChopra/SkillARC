# Classroom - Learning Management System
## Project Architecture & Technical Report

---

## 1. Executive Summary
SkillARC is a modern, full-stack Learning Management System (LMS) designed to bridge the gap between educators (Faculty) and learners (Students). The platform offers a premium, highly responsive user interface coupled with a robust, asynchronous backend. It facilitates classroom management, diverse coursework assignment (including quizzes and coding tasks), grading, and real-time communication.

## 2. System Architecture
The project follows a standard **Client-Server Architecture** utilizing a decoupled frontend and backend, communicating primarily via RESTful APIs, with provisions for real-time WebSocket communication.

### High-Level Flow:
1. **Client (Frontend)**: A Next.js application that renders the user interface, manages client-side routing, and handles user interactions.
2. **API (Backend)**: A FastAPI application that processes business logic, validates data, and securely interacts with the database.
3. **Database**: A relational SQLite database managed via SQLAlchemy, structuring all persistent application data.

---

## 3. Technology Stack & Component Breakdown

### 3.1. Frontend Technologies
*   **Next.js (App Router)**
    *   *Why*: Provides robust file-system based routing, Server-Side Rendering (SSR) for performance, and excellent developer ergonomics. It allows us to cleanly separate the `/faculty` and `/student` experiences.
*   **React & TypeScript**
    *   *Why*: React provides component-based UI development. TypeScript ensures type safety, drastically reducing runtime errors and improving developer experience and code maintainability.
*   **TailwindCSS**
    *   *Why*: A utility-first CSS framework that allows for rapid styling directly within components. It is crucial for implementing our "glassmorphic" and highly premium design aesthetic without bloated CSS files.
*   **Framer Motion**
    *   *Why*: Used for complex animations, page transitions, and micro-interactions. It makes the UI feel dynamic, fluid, and responsive, significantly enhancing user engagement.
*   **Lucide React**
    *   *Why*: A clean, consistent, and lightweight SVG icon library that perfectly complements the modern UI design.

### 3.2. Backend Technologies
*   **FastAPI**
    *   *Why*: A modern, fast web framework for building APIs with Python. It is inherently asynchronous, provides automatic interactive API documentation (Swagger UI), and is incredibly performant.
*   **SQLAlchemy & SQLite**
    *   *Why*: SQLAlchemy is the industry-standard Object-Relational Mapper (ORM) for Python, allowing us to interact with the database using Python objects rather than raw SQL. SQLite is used for development for its zero-configuration setup, but the ORM allows for a seamless transition to PostgreSQL in production.
*   **Pydantic**
    *   *Why*: Used for data parsing and validation. It guarantees that the data received by the API matches exactly what is expected (schemas), preventing malformed data from entering the system.
*   **Python-Socket.io**
    *   *Why*: Enables bidirectional, event-based communication between the server and the frontend. Essential for features like live notifications and real-time chat.

---

## 4. Database Schema (Models)
The database is highly normalized to ensure data integrity and efficient querying.

*   **Users**: Stores all users with a `role` enum (`faculty` or `student`).
*   **Classrooms**: Represents a course instance. Includes a unique `class_code` for enrollment.
*   **Enrollments**: A mapping table linking Students to their enrolled Classrooms.
*   **Announcements**: Class-wide broadcast messages.
*   **Assignments (Polymorphic)**: A unified model handling standard assignments, quizzes, coding tasks, and reading materials using a `type` discriminator.
*   **Submissions**: Tracks student responses to assignments, including file uploads, code snippets, scores, and faculty feedback.
*   **Notifications**: In-app alerts targeted at specific users or classrooms.
*   **CalendarEvents**: System-wide holidays or classroom-specific deadlines.

---

## 5. Key Features

### Faculty Experience
*   **Dashboard & Analytics**: A comprehensive overview of active classrooms, student engagement metrics, average grades, and at-risk students.
*   **Course Management**: Create new classrooms and distribute unique join codes or invite links.
*   **Assignment Creation**: Deploy a variety of coursework types (Quizzes, Coding environments, standard file uploads) with strict deadlines.
*   **Gradebook**: A unified interface to review student submissions, assign scores, and provide detailed feedback.

### Student Experience
*   **Enrolled Dashboard**: A clean view of all joined classrooms and a summary of pending vs. completed tasks.
*   **Classroom Hub**: A centralized feed for a specific class, showing announcements, upcoming deadlines, and study materials.
*   **Submission Portal**: Interfaces to upload files, answer quiz questions, or write code directly in the browser for assignments.

### Global Features
*   **Real-time Notifications**: Instant alerts for new assignments, graded work, or urgent announcements.
*   **Premium Glassmorphic UI**: A visually stunning interface utilizing blurred backgrounds, subtle gradients, and smooth animations to provide a top-tier user experience.
*   **Responsive Design**: fully functional and aesthetically pleasing on both desktop monitors and mobile devices.

---

## 6. Conclusion
The SkillARC platform leverages the best of modern web development (Next.js & FastAPI) to deliver an LMS that is not only highly functional and scalable but also provides an exceptional, premium user experience. The architecture is modular, allowing for easy expansion of features in the future.
