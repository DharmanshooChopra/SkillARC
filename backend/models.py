from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from database import Base

class RoleEnum(str, enum.Enum):
    faculty = "faculty"
    student = "student"

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
    class_code = Column(String, unique=True, index=True, nullable=True)
    faculty_id = Column(Integer, ForeignKey("users.id"))
    
    faculty = relationship("User", back_populates="classrooms_created")
    enrollments = relationship("Enrollment", back_populates="classroom")
    announcements = relationship("Announcement", back_populates="classroom")
    materials = relationship("Material", back_populates="classroom")
    assignments = relationship("Assignment", back_populates="classroom")
    quizzes = relationship("Quiz", back_populates="classroom")
    codings = relationship("Coding", back_populates="classroom")
    calendar_events = relationship("CalendarEvent", back_populates="classroom")

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
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="announcements")

class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Store text or link
    file_url = Column(String, nullable=True) # Optional uploaded file URL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="materials")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=True) # Optional uploaded file URL
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    quiz_link = Column(String, nullable=True) # Optional Google Forms link
    deadline = Column(DateTime, nullable=False)
    timer_minutes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="quizzes")
    submissions = relationship("Submission", back_populates="quiz")

class Coding(Base):
    __tablename__ = "codings"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    title = Column(String, nullable=False)
    problem_statement = Column(Text, nullable=False)
    deadline = Column(DateTime, nullable=False)
    timer_minutes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    classroom = relationship("Classroom", back_populates="codings")
    submissions = relationship("Submission", back_populates="coding")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    coding_id = Column(Integer, ForeignKey("codings.id"), nullable=True)
    
    content = Column(Text, nullable=False) # Store answers, code, or file link
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Grading fields
    marks_assigned = Column(Integer, nullable=True)
    marks_hidden = Column(Boolean, default=True) # Hidden until faculty releases
    feedback = Column(Text, nullable=True)
    
    student = relationship("User", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")
    quiz = relationship("Quiz", back_populates="submissions")
    coding = relationship("Coding", back_populates="submissions")
    grading = relationship("Grading", back_populates="submission", uselist=False)

class Grading(Base):
    __tablename__ = "gradings"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    final_score = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    submission = relationship("Submission", back_populates="grading")

class CalendarEventType(str, enum.Enum):
    holiday = "holiday"
    deadline = "deadline"
    lecture = "lecture"

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True) # Null for global holidays
    title = Column(String, nullable=False)
    event_type = Column(Enum(CalendarEventType), nullable=False)
    date = Column(DateTime, nullable=False)
    is_default = Column(Boolean, default=False) # True for default Sundays/Festivals
    
    classroom = relationship("Classroom", back_populates="calendar_events")
