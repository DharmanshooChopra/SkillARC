from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    faculty = "faculty"
    student = "student"

class AssignmentTypeEnum(str, enum.Enum):
    assignment = "Assignment"
    quiz = "Quiz"
    coding = "Coding Assignment"
    material = "Material"

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: RoleEnum

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Classroom Schemas ---
class ClassroomBase(BaseModel):
    name: str
    section: Optional[str] = None
    subject_code: Optional[str] = None

class ClassroomCreate(ClassroomBase):
    faculty_id: int

class ClassroomResponse(ClassroomBase):
    id: int
    class_code: Optional[str] = None # Maps to joinCode in frontend
    faculty_id: int
    class Config:
        from_attributes = True

# --- Announcement Schemas ---
class AnnouncementBase(BaseModel):
    author: str
    content: str
    attachments: Optional[List[Dict[str, Any]]] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Assignment Schemas (Polymorphic) ---
class AssignmentBase(BaseModel):
    title: str
    type: AssignmentTypeEnum
    status: Optional[str] = "Active"
    description: Optional[str] = None
    max_score: Optional[int] = None
    files: Optional[List[str]] = None
    
    questions: Optional[List[Dict[str, Any]]] = None # For Quizzes
    language: Optional[str] = None # For Coding
    test_cases: Optional[List[Dict[str, Any]]] = None # For Coding
    
    deadline: Optional[datetime] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Submission Schemas ---
class SubmissionBase(BaseModel):
    status: Optional[str] = "pending"
    files: Optional[List[str]] = None
    code_snippet: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    student_id: int
    assignment_id: int

class SubmissionResponse(SubmissionBase):
    id: int
    student_id: int
    assignment_id: int
    submitted_at: datetime
    graded_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    read: Optional[bool] = False
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    classroom_id: int

class NotificationResponse(NotificationBase):
    id: int
    classroom_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Calendar Event Schemas ---
class CalendarEventBase(BaseModel):
    title: str
    note: Optional[str] = None
    event_date: datetime

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventResponse(CalendarEventBase):
    id: int
    classroom_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- Holiday Schemas ---
class HolidayResponse(BaseModel):
    id: int
    name: str
    date: datetime
    type: Optional[str] = None
    class Config:
        from_attributes = True
