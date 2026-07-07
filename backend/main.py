from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import socketio
import os
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)
app.mount("/ws", socket_app)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Users ---
@app.post("/users/", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = models.User(email=user.email, name=user.name, role=user.role)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# --- Classrooms ---
@app.post("/classrooms/", response_model=schemas.ClassroomResponse)
async def create_classroom(classroom: schemas.ClassroomCreate, db: AsyncSession = Depends(get_db)):
    code = generate_class_code()
    db_classroom = models.Classroom(**classroom.model_dump(), class_code=code)
    db.add(db_classroom)
    await db.commit()
    await db.refresh(db_classroom)
    return db_classroom

@app.get("/classrooms/", response_model=list[schemas.ClassroomResponse])
async def get_classrooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Classroom))
    return result.scalars().all()

@app.post("/classrooms/join")
async def join_classroom(payload: dict, db: AsyncSession = Depends(get_db)):
    student_id = payload.get("student_id")
    class_code = payload.get("class_code")
    result = await db.execute(select(models.Classroom).where(models.Classroom.class_code == class_code))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid class code")
    enrollment = models.Enrollment(user_id=student_id, classroom_id=classroom.id)
    db.add(enrollment)
    await db.commit()
    return {"message": "Joined successfully"}

@app.get("/users/{user_id}/classrooms", response_model=list[schemas.ClassroomResponse])
async def get_student_classrooms(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Classroom)
        .join(models.Enrollment)
        .where(models.Enrollment.user_id == user_id)
    )
    return result.scalars().all()

# --- Announcements ---
@app.get("/classrooms/{classroom_id}/announcements", response_model=list[schemas.AnnouncementResponse])
async def get_announcements(classroom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Announcement).where(models.Announcement.classroom_id == classroom_id).order_by(models.Announcement.created_at.desc()))
    return result.scalars().all()

@app.post("/classrooms/{classroom_id}/announcements", response_model=schemas.AnnouncementResponse)
async def create_announcement(classroom_id: int, announcement: schemas.AnnouncementCreate, db: AsyncSession = Depends(get_db)):
    db_ann = models.Announcement(classroom_id=classroom_id, **announcement.model_dump())
    db.add(db_ann)
    await db.commit()
    await db.refresh(db_ann)
    return db_ann

# --- Assignments (Unified Polymorphic Endpoint) ---
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

# --- Submissions ---
@app.post("/assignments/{assignment_id}/submit", response_model=schemas.SubmissionResponse)
async def submit_assignment(assignment_id: int, payload: schemas.SubmissionCreate, db: AsyncSession = Depends(get_db)):
    sub = models.Submission(**payload.model_dump())
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

@app.get("/assignments/{assignment_id}/submissions", response_model=list[schemas.SubmissionResponse])
async def get_assignment_submissions(assignment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Submission).where(models.Submission.assignment_id == assignment_id))
    return result.scalars().all()

@app.post("/submissions/{submission_id}/grade", response_model=schemas.SubmissionResponse)
async def grade_submission(submission_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Submission).where(models.Submission.id == submission_id))
    sub = result.scalars().first()
    if sub:
        sub.score = payload.get("score")
        sub.feedback = payload.get("feedback")
        sub.status = "graded"
        await db.commit()
        await db.refresh(sub)
    return sub

# --- Notifications ---
@app.get("/users/{user_id}/notifications", response_model=list[schemas.NotificationResponse])
async def get_notifications(user_id: int, db: AsyncSession = Depends(get_db)):
    # Simple logic: Fetch notifications for classrooms the user is in
    enrollments_q = await db.execute(select(models.Enrollment).where(models.Enrollment.user_id == user_id))
    classroom_ids = [e.classroom_id for e in enrollments_q.scalars().all()]
    if not classroom_ids:
        return []
    result = await db.execute(select(models.Notification).where(models.Notification.classroom_id.in_(classroom_ids)).order_by(models.Notification.created_at.desc()))
    return result.scalars().all()

@app.post("/notifications/mark-read/{notification_id}")
async def mark_notification_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Notification).where(models.Notification.id == notification_id))
    notif = result.scalars().first()
    if notif:
        notif.read = True
        await db.commit()
    return {"message": "Success"}

# --- Calendar Events ---
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

# --- Uploads ---
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", unique_filename)
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    return {"file_url": f"http://127.0.0.1:8000/static/{unique_filename}"}

# --- Sockets ---
@sio.event
async def connect(sid, environ):
    pass
