from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    faculty = "faculty"
    student = "student"

class UserBase(BaseModel):
    email: str
    name: str
    role: RoleEnum

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class ClassroomBase(BaseModel):
    name: str
    section: Optional[str] = None

class ClassroomCreate(ClassroomBase):
    faculty_id: int

class ClassroomResponse(ClassroomBase):
    id: int
    faculty_id: int
    class_code: str
    student_count: int = 0
    active_tasks: int = 0
    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    content: str

class AnnouncementResponse(BaseModel):
    id: int
    classroom_id: int
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class MaterialCreate(BaseModel):
    title: str
    content: str
    file_url: Optional[str] = None

class MaterialResponse(MaterialCreate):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    deadline: datetime

class AssignmentResponse(AssignmentCreate):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    quiz_link: Optional[str] = None
    deadline: datetime
    timer_minutes: int

class QuizResponse(QuizCreate):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CodingCreate(BaseModel):
    title: str
    problem_statement: str
    deadline: datetime
    timer_minutes: int

class CodingResponse(CodingCreate):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    content: str

class SubmissionResponse(BaseModel):
    id: int
    student_id: int
    assignment_id: Optional[int] = None
    quiz_id: Optional[int] = None
    coding_id: Optional[int] = None
    content: str
    submitted_at: datetime
    marks_assigned: Optional[int] = None
    marks_hidden: bool
    feedback: Optional[str] = None
    
    class Config:
        from_attributes = True

class SubmissionWithStudentResponse(SubmissionResponse):
    student: UserResponse
    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    classroom_id: int

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    classroom_id: int
    class Config:
        from_attributes = True

class GradingCreate(BaseModel):
    final_score: int
    comments: Optional[str] = None
    marks_hidden: bool = True

class CalendarEventType(str, Enum):
    holiday = "holiday"
    deadline = "deadline"
    lecture = "lecture"

class CalendarEventBase(BaseModel):
    title: str
    event_type: CalendarEventType
    date: datetime
    is_default: bool = False
    classroom_id: Optional[int] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventResponse(CalendarEventBase):
    id: int
    class Config:
        from_attributes = True

class TaskType(str, Enum):
    assignment = "assignment"
    quiz = "quiz"
    coding = "coding"

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    deadline: datetime
    task_type: TaskType
    classroom_id: int
    classroom_name: str
    is_submitted: bool
    
    class Config:
        from_attributes = True
