from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Enum, JSON
from sqlalchemy.orm import relationship
import enum
import datetime
from database import Base

class RoleEnum(str, enum.Enum):
    faculty = "faculty"
    student = "student"

class AssignmentTypeEnum(str, enum.Enum):
    assignment = "Assignment"
    quiz = "Quiz"
    coding = "Coding Assignment"
    material = "Material"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    
    enrollments = relationship("Enrollment", back_populates="user")
    classrooms_created = relationship("Classroom", back_populates="faculty")
    submissions = relationship("Submission", back_populates="student")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    section = Column(String, nullable=True)
    subject_code = Column(String, nullable=True)
    class_code = Column(String, unique=True, index=True, nullable=True) # Used as joinCode in frontend
    faculty_id = Column(Integer, ForeignKey("users.id"))
    
    faculty = relationship("User", back_populates="classrooms_created")
    enrollments = relationship("Enrollment", back_populates="classroom")
    announcements = relationship("Announcement", back_populates="classroom")
    assignments = relationship("Assignment", back_populates="classroom")
    calendar_events = relationship("CalendarEvent", back_populates="classroom")
    notifications = relationship("Notification", back_populates="classroom")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    
    user = relationship("User", back_populates="enrollments")
    classroom = relationship("Classroom", back_populates="enrollments")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    author = Column(String, nullable=False) # Store author name directly for simplicity as per frontend
    content = Column(Text, nullable=False)
    attachments = Column(JSON, nullable=True) # Matches frontend attachments array
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="announcements")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    type = Column(Enum(AssignmentTypeEnum), nullable=False)
    status = Column(String, default="Active")
    description = Column(Text, nullable=True)
    max_score = Column(Integer, nullable=True)
    files = Column(JSON, nullable=True) # List of file URLs/names
    
    # Quiz Specific
    questions = Column(JSON, nullable=True)
    
    # Coding Specific
    language = Column(String, nullable=True)
    test_cases = Column(JSON, nullable=True)
    
    deadline = Column(DateTime, nullable=True) # Nullable for materials
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    
    status = Column(String, default="pending") # pending, graded
    files = Column(JSON, nullable=True)
    code_snippet = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)
    
    student = relationship("User", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # 'announcement' | 'assignment_graded' | 'new_assignment'
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="notifications")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True) # null for global events
    title = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False)
    
    classroom = relationship("Classroom", back_populates="calendar_events")

class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    type = Column(String, nullable=True) # e.g., 'National', 'Festival'
