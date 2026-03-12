from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SubtaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class SubtaskCreate(SubtaskBase):
    pass

class Subtask(SubtaskBase):
    id: int
    task_id: int
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    slack_member_id: Optional[str] = None

class User(UserBase):
    id: int
    slack_member_id: Optional[str] = None

    class Config:
        from_attributes = True

# ── Comment schemas ────────────────────────────────────────────────────────────
class CommentAuthor(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    task_id: int
    content: str
    created_at: datetime
    author: CommentAuthor
    class Config:
        from_attributes = True

class StatusBase(BaseModel):
    name: str
    color: str = "#808080"

class StatusCreate(StatusBase):
    pass

class Status(StatusBase):
    id: int
    
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    deadline: Optional[datetime] = None
    assigned_user_id: int
    status_id: int

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assigned_user_id: Optional[int] = None
    status_id: Optional[int] = None

class Task(TaskBase):
    id: int
    sprint_id: int
    created_at: datetime
    subtasks: List[Subtask] = []
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True

class SprintBase(BaseModel):
    name: str

class SprintCreate(SprintBase):
    pass

class SprintRename(BaseModel):
    name: str

class Sprint(SprintBase):
    id: int
    start_date: datetime
    end_date: datetime
    active: bool
    rolled_in: int = 0
    rolled_out: int = 0
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class SprintKPI(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    active: bool
    rolled_in: int
    rolled_out: int
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    completion_rate: float
    velocity_delta: Optional[float]

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
