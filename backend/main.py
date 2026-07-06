from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import socketio
import os
import shutil
import uuid
import random
import string

def generate_class_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

import models
import schemas
from database import engine, get_db, Base

app = FastAPI(title="LearnConnect LMS API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Socket.IO setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)
app.mount("/ws", socket_app)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

# Example REST APIs
@app.post("/users/", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = models.User(email=user.email, name=user.name, role=user.role)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.post("/classrooms/", response_model=schemas.ClassroomResponse)
async def create_classroom(classroom: schemas.ClassroomCreate, db: AsyncSession = Depends(get_db)):
    code = generate_class_code()
    db_classroom = models.Classroom(**classroom.model_dump(), class_code=code)
    db.add(db_classroom)
    await db.commit()
    await db.refresh(db_classroom)
    return db_classroom

@app.put("/classrooms/{classroom_id}", response_model=schemas.ClassroomResponse)
async def update_classroom(classroom_id: int, classroom_update: schemas.ClassroomCreate, db: AsyncSession = Depends(get_db)):
    db_classroom = await db.get(models.Classroom, classroom_id)
    if not db_classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    db_classroom.name = classroom_update.name
    db_classroom.section = classroom_update.section
    await db.commit()
    await db.refresh(db_classroom)
    return db_classroom

@app.delete("/classrooms/{classroom_id}")
async def delete_classroom(classroom_id: int, db: AsyncSession = Depends(get_db)):
    db_classroom = await db.get(models.Classroom, classroom_id)
    if not db_classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    await db.delete(db_classroom)
    await db.commit()
    return {"message": "Classroom deleted"}

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".zip", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not permitted.")
        
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    return {"file_url": f"http://127.0.0.1:8000/static/{unique_filename}"}

@app.get("/classrooms/", response_model=list[schemas.ClassroomResponse])
async def get_classrooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Classroom))
    classrooms = result.scalars().all()
    
    enrollments_q = await db.execute(select(models.Enrollment))
    enrollments = enrollments_q.scalars().all()
    
    assignments_q = await db.execute(select(models.Assignment))
    assignments = assignments_q.scalars().all()
    
    response = []
    for cls in classrooms:
        student_count = sum(1 for e in enrollments if e.classroom_id == cls.id)
        active_tasks = sum(1 for a in assignments if a.classroom_id == cls.id)
        
        cls_dict = {
            "id": cls.id,
            "name": cls.name,
            "section": cls.section,
            "faculty_id": cls.faculty_id,
            "class_code": cls.class_code,
            "student_count": student_count,
            "active_tasks": active_tasks
        }
        response.append(cls_dict)
        
    return response

@app.post("/classrooms/join", response_model=schemas.EnrollmentResponse)
async def join_classroom(payload: dict, db: AsyncSession = Depends(get_db)):
    student_id = payload.get("student_id")
    class_code = payload.get("class_code")
    
    # Find classroom by code
    result = await db.execute(select(models.Classroom).where(models.Classroom.class_code == class_code))
    classroom = result.scalars().first()
    
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid class code")
        
    enrollment = models.Enrollment(user_id=student_id, classroom_id=classroom.id)
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment

@app.get("/users/{user_id}/classrooms", response_model=list[schemas.ClassroomResponse])
async def get_student_classrooms(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Classroom)
        .join(models.Enrollment)
        .where(models.Enrollment.user_id == user_id)
    )
    classrooms = result.scalars().all()
    
    # Get active tasks (assignments) for these classrooms
    classroom_ids = [c.id for c in classrooms]
    assignments_q = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id.in_(classroom_ids)))
    assignments = assignments_q.scalars().all()
    
    # Get submissions to only count unsubmitted tasks
    submissions_q = await db.execute(select(models.Submission).where(models.Submission.student_id == user_id))
    submissions = submissions_q.scalars().all()
    sub_assignment_ids = {s.assignment_id for s in submissions}
    
    response = []
    for cls in classrooms:
        active_tasks = sum(1 for a in assignments if a.classroom_id == cls.id and a.id not in sub_assignment_ids)
        
        cls_dict = {
            "id": cls.id,
            "name": cls.name,
            "section": cls.section,
            "faculty_id": cls.faculty_id,
            "class_code": cls.class_code,
            "student_count": 0, # Not strictly needed for student dashboard, but we satisfy schema
            "active_tasks": active_tasks
        }
        response.append(cls_dict)
        
    return response

@app.get("/classrooms/{classroom_id}/announcements", response_model=list[schemas.AnnouncementResponse])
async def get_announcements(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Announcement)
        .where(models.Announcement.classroom_id == classroom_id)
        .order_by(models.Announcement.created_at.desc())
    )
    return result.scalars().all()

@app.post("/classrooms/{classroom_id}/announcements", response_model=schemas.AnnouncementResponse)
async def create_announcement(classroom_id: int, announcement: schemas.AnnouncementCreate, db: AsyncSession = Depends(get_db)):
    db_announcement = models.Announcement(classroom_id=classroom_id, content=announcement.content)
    db.add(db_announcement)
    await db.commit()
    await db.refresh(db_announcement)
    return db_announcement

@app.get("/classrooms/{classroom_id}/materials", response_model=list[schemas.MaterialResponse])
async def get_materials(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Material).where(models.Material.classroom_id == classroom_id).order_by(models.Material.created_at.desc()))
    return result.scalars().all()

@app.post("/classrooms/{classroom_id}/materials", response_model=schemas.MaterialResponse)
async def create_material(classroom_id: int, material: schemas.MaterialCreate, db: AsyncSession = Depends(get_db)):
    db_mat = models.Material(classroom_id=classroom_id, **material.model_dump())
    db.add(db_mat)
    await db.commit()
    await db.refresh(db_mat)
    return db_mat

@app.get("/classrooms/{classroom_id}/assignments", response_model=list[schemas.AssignmentResponse])
async def get_assignments(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id == classroom_id).order_by(models.Assignment.deadline.asc()))
    return result.scalars().all()

@app.post("/classrooms/{classroom_id}/assignments", response_model=schemas.AssignmentResponse)
async def create_assignment(classroom_id: int, assignment: schemas.AssignmentCreate, db: AsyncSession = Depends(get_db)):
    db_assn = models.Assignment(classroom_id=classroom_id, **assignment.model_dump())
    db.add(db_assn)
    await db.commit()
    await db.refresh(db_assn)
    return db_assn

@app.get("/users/{user_id}/tasks", response_model=list[schemas.TaskResponse])
async def get_user_tasks(user_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get classrooms the user is enrolled in
    enrollments_q = await db.execute(select(models.Enrollment).where(models.Enrollment.user_id == user_id))
    classroom_ids = [e.classroom_id for e in enrollments_q.scalars().all()]
    if not classroom_ids:
        return []

    classrooms_q = await db.execute(select(models.Classroom).where(models.Classroom.id.in_(classroom_ids)))
    classrooms = {c.id: c.name for c in classrooms_q.scalars().all()}

    tasks = []
    
    # Get Submissions to check what's completed
    submissions_q = await db.execute(select(models.Submission).where(models.Submission.student_id == user_id))
    submissions = submissions_q.scalars().all()
    sub_assignments = {s.assignment_id for s in submissions if s.assignment_id}
    sub_quizzes = {s.quiz_id for s in submissions if s.quiz_id}
    sub_codings = {s.coding_id for s in submissions if s.coding_id}

    # Get Assignments
    assignments_q = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id.in_(classroom_ids)))
    for a in assignments_q.scalars().all():
        tasks.append({
            "id": a.id, "title": a.title, "description": a.description, "deadline": a.deadline,
            "task_type": "assignment", "classroom_id": a.classroom_id, "classroom_name": classrooms.get(a.classroom_id, ""),
            "is_submitted": a.id in sub_assignments
        })

    # Get Quizzes
    quizzes_q = await db.execute(select(models.Quiz).where(models.Quiz.classroom_id.in_(classroom_ids)))
    for q in quizzes_q.scalars().all():
        tasks.append({
            "id": q.id, "title": q.title, "description": q.description, "deadline": q.deadline,
            "task_type": "quiz", "classroom_id": q.classroom_id, "classroom_name": classrooms.get(q.classroom_id, ""),
            "is_submitted": q.id in sub_quizzes
        })

    # Get Codings
    codings_q = await db.execute(select(models.Coding).where(models.Coding.classroom_id.in_(classroom_ids)))
    for c in codings_q.scalars().all():
        tasks.append({
            "id": c.id, "title": c.title, "description": c.problem_statement, "deadline": c.deadline,
            "task_type": "coding", "classroom_id": c.classroom_id, "classroom_name": classrooms.get(c.classroom_id, ""),
            "is_submitted": c.id in sub_codings
        })

    # Sort by deadline ascending
    tasks.sort(key=lambda x: x["deadline"])
    return tasks

@app.get("/users/{user_id}/calendar", response_model=list[schemas.CalendarEventResponse])
async def get_user_calendar(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    classroom_ids = []
    if user.role == "faculty":
        classrooms_q = await db.execute(select(models.Classroom).where(models.Classroom.faculty_id == user_id))
        classroom_ids = [c.id for c in classrooms_q.scalars().all()]
    else:
        enrollments_q = await db.execute(select(models.Enrollment).where(models.Enrollment.user_id == user_id))
        classroom_ids = [e.classroom_id for e in enrollments_q.scalars().all()]

    events = []

    # Get global events AND classroom-specific events
    if classroom_ids:
        calendar_q = await db.execute(
            select(models.CalendarEvent).where(
                (models.CalendarEvent.classroom_id == None) | 
                (models.CalendarEvent.classroom_id.in_(classroom_ids))
            )
        )
    else:
        calendar_q = await db.execute(select(models.CalendarEvent).where(models.CalendarEvent.classroom_id == None))
        
    for evt in calendar_q.scalars().all():
        events.append(evt)

    # Synthesize tasks into events
    if classroom_ids:
        assignments_q = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id.in_(classroom_ids)))
        for a in assignments_q.scalars().all():
            events.append({
                "id": a.id + 100000, 
                "title": f"Due: {a.title}",
                "event_type": "deadline",
                "date": a.deadline,
                "is_default": False,
                "classroom_id": a.classroom_id
            })
            
        quizzes_q = await db.execute(select(models.Quiz).where(models.Quiz.classroom_id.in_(classroom_ids)))
        for q in quizzes_q.scalars().all():
            events.append({
                "id": q.id + 200000,
                "title": f"Quiz: {q.title}",
                "event_type": "deadline",
                "date": q.deadline,
                "is_default": False,
                "classroom_id": q.classroom_id
            })

        codings_q = await db.execute(select(models.Coding).where(models.Coding.classroom_id.in_(classroom_ids)))
        for c in codings_q.scalars().all():
            events.append({
                "id": c.id + 300000,
                "title": f"Coding: {c.title}",
                "event_type": "deadline",
                "date": c.deadline,
                "is_default": False,
                "classroom_id": c.classroom_id
            })
            
    return events

@app.post("/assignments/{assignment_id}/submit", response_model=schemas.SubmissionResponse)
async def submit_assignment(assignment_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    sub = models.Submission(
        student_id=payload.get("student_id"),
        assignment_id=assignment_id,
        content=payload.get("content")
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

@app.get("/assignments/{assignment_id}/submissions", response_model=list[schemas.SubmissionWithStudentResponse])
async def get_assignment_submissions(assignment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Submission)
        .options(selectinload(models.Submission.student))
        .where(models.Submission.assignment_id == assignment_id)
    )
    return result.scalars().all()

@app.post("/submissions/{submission_id}/grade", response_model=schemas.SubmissionResponse)
async def grade_submission(submission_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Submission).where(models.Submission.id == submission_id))
    sub = result.scalars().first()
    if sub:
        sub.marks_assigned = payload.get("marks_assigned")
        sub.feedback = payload.get("feedback")
        await db.commit()
        await db.refresh(sub)
    return sub

@app.get("/classrooms/{classroom_id}/quizzes", response_model=list[schemas.QuizResponse])
async def get_quizzes(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Quiz).where(models.Quiz.classroom_id == classroom_id).order_by(models.Quiz.deadline.asc()))
    return result.scalars().all()

@app.get("/classrooms/{classroom_id}/students", response_model=list[schemas.UserResponse])
async def get_classroom_students(classroom_id: int, db: AsyncSession = Depends(get_db)):
    enrollments_q = await db.execute(
        select(models.User)
        .join(models.Enrollment, models.User.id == models.Enrollment.user_id)
        .where(models.Enrollment.classroom_id == classroom_id)
    )
    return enrollments_q.scalars().all()

@app.get("/classrooms/{classroom_id}/gradebook")
async def get_gradebook(classroom_id: int, db: AsyncSession = Depends(get_db)):
    enrollments_q = await db.execute(
        select(models.User)
        .join(models.Enrollment, models.User.id == models.Enrollment.user_id)
        .where(models.Enrollment.classroom_id == classroom_id)
    )
    students = enrollments_q.scalars().all()

    assignments_q = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id == classroom_id))
    assignments = assignments_q.scalars().all()

    assignment_ids = [a.id for a in assignments]
    submissions = []
    if assignment_ids:
        submissions_q = await db.execute(select(models.Submission).where(models.Submission.assignment_id.in_(assignment_ids)))
        submissions = submissions_q.scalars().all()

    return {
        "students": [{"id": s.id, "name": s.name} for s in students],
        "assignments": [{"id": a.id, "title": a.title} for a in assignments],
        "submissions": [{"student_id": s.student_id, "assignment_id": s.assignment_id, "marks_assigned": s.marks_assigned} for s in submissions]
    }

@app.post("/classrooms/{classroom_id}/quizzes", response_model=schemas.QuizResponse)
async def create_quiz(classroom_id: int, quiz: schemas.QuizCreate, db: AsyncSession = Depends(get_db)):
    db_quiz = models.Quiz(classroom_id=classroom_id, **quiz.model_dump())
    db.add(db_quiz)
    await db.commit()
    await db.refresh(db_quiz)
    return db_quiz

@app.post("/quizzes/{quiz_id}/submit", response_model=schemas.SubmissionResponse)
async def submit_quiz(quiz_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    sub = models.Submission(
        student_id=payload.get("student_id"),
        quiz_id=quiz_id,
        content=payload.get("content", "Completed")
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

@app.get("/classrooms/{classroom_id}/codings", response_model=list[schemas.CodingResponse])
async def get_codings(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Coding).where(models.Coding.classroom_id == classroom_id).order_by(models.Coding.deadline.asc()))
    return result.scalars().all()

@app.post("/classrooms/{classroom_id}/codings", response_model=schemas.CodingResponse)
async def create_coding(classroom_id: int, coding: schemas.CodingCreate, db: AsyncSession = Depends(get_db)):
    db_coding = models.Coding(classroom_id=classroom_id, **coding.model_dump())
    db.add(db_coding)
    await db.commit()
    await db.refresh(db_coding)
    return db_coding

@app.post("/codings/{coding_id}/submit", response_model=schemas.SubmissionResponse)
async def submit_coding(coding_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    sub = models.Submission(
        student_id=payload.get("student_id"),
        coding_id=coding_id,
        content=payload.get("content")
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

@app.get("/api/events", response_model=list[schemas.CalendarEventResponse])
async def get_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CalendarEvent))
    return result.scalars().all()

@app.post("/api/events", response_model=schemas.CalendarEventResponse)
async def create_event(event: schemas.CalendarEventCreate, db: AsyncSession = Depends(get_db)):
    db_event = models.CalendarEvent(**event.model_dump())
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

@app.get("/faculty/{faculty_id}/analytics")
async def get_faculty_analytics(faculty_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get classrooms
    classrooms_q = await db.execute(select(models.Classroom).where(models.Classroom.faculty_id == faculty_id))
    classrooms = classrooms_q.scalars().all()
    classroom_ids = [c.id for c in classrooms]
    class_map = {c.id: c.name for c in classrooms}

    if not classroom_ids:
        return {
            "active_students": 0, "avg_grade": 0, "completion_rate": 0, 
            "total_submissions": 0, "needs_attention_count": 0,
            "performance_trends": [0,0,0,0,0,0,0], "recent_activity": []
        }

    # 2. Active Students
    enrollments_q = await db.execute(select(models.Enrollment).where(models.Enrollment.classroom_id.in_(classroom_ids)))
    enrollments = enrollments_q.scalars().all()
    student_ids = set([e.user_id for e in enrollments])
    
    # 3. Assignments & Grades
    assignments_q = await db.execute(select(models.Assignment).where(models.Assignment.classroom_id.in_(classroom_ids)))
    assignments = assignments_q.scalars().all()
    assignment_ids = [a.id for a in assignments]
    
    avg_grade = 0
    completion = 0
    total_submissions = 0
    needs_attention_count = 0
    recent_activity = []
    trends = [0, 0, 0, 0, 0, 0, 0] # 7 mock-like points but filled with real data if possible

    if assignment_ids:
        # Get all submissions for these assignments
        submissions_q = await db.execute(
            select(models.Submission).where(models.Submission.assignment_id.in_(assignment_ids)).order_by(models.Submission.id.desc())
        )
        all_subs = submissions_q.scalars().all()
        total_submissions = len(all_subs)
        
        # Calculate avg grade
        graded_subs = [s for s in all_subs if s.marks_assigned is not None]
        if graded_subs:
            avg_grade = sum(s.marks_assigned for s in graded_subs) / len(graded_subs)
        
        # Completion Rate
        total_possible = len(assignment_ids) * len(student_ids)
        if total_possible > 0:
            completion = (total_submissions / total_possible) * 100
            
        # At Risk Students (0 submissions)
        sub_student_ids = set([s.student_id for s in all_subs])
        needs_attention_count = len(student_ids) - len(sub_student_ids)
        
        # Recent Activity (last 3 submissions)
        for sub in all_subs[:3]:
            # find which classroom this assignment belongs to
            assn = next((a for a in assignments if a.id == sub.assignment_id), None)
            c_name = class_map.get(assn.classroom_id, "Class") if assn else "Class"
            recent_activity.append({
                "class": c_name,
                "action": f"Student {sub.student_id} submitted assignment",
                "time": "Recently"
            })
            
        # Performance Trends (Average grade of last 7 assignments)
        # Group submissions by assignment
        assn_grades = {}
        for s in graded_subs:
            if s.assignment_id not in assn_grades:
                assn_grades[s.assignment_id] = []
            assn_grades[s.assignment_id].append(s.marks_assigned)
            
        assn_averages = []
        for a_id in assignment_ids:
            if a_id in assn_grades:
                assn_averages.append(sum(assn_grades[a_id]) / len(assn_grades[a_id]))
            else:
                assn_averages.append(0)
                
        # Fill trends from right to left
        idx = 6
        for avg in reversed(assn_averages):
            if idx < 0: break
            trends[idx] = avg
            idx -= 1
            
    if not recent_activity:
        recent_activity.append({"class": "System", "action": "No recent activity", "time": "Just now"})

    return {
        "active_students": len(student_ids),
        "avg_grade": round(avg_grade, 1),
        "completion_rate": round(completion, 1),
        "total_submissions": total_submissions,
        "needs_attention_count": needs_attention_count,
        "recent_activity": recent_activity,
        "performance_trends": trends
    }

# Socket.io Events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_class(sid, data):
    classroom_id = data.get("classroom_id")
    sio.enter_room(sid, f"classroom_{classroom_id}")
    await sio.emit("message", {"msg": f"Joined classroom {classroom_id}"}, room=f"classroom_{classroom_id}")

