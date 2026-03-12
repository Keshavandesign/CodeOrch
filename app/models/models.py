from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from .database import Base

class Priority(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Status(Base):
    __tablename__ = "statuses"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    color = Column(String, default="#808080")
    tasks = relationship("Task", back_populates="status_obj")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String, nullable=True)   # null = manually-added team member, not yet registered
    slack_member_id = Column(String, nullable=True)  # e.g. "U12345ABC" for DM notifications
    tasks = relationship("Task", back_populates="assigned_user")

class Sprint(Base):
    __tablename__ = "sprints"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    active = Column(Boolean, default=True)
    rolled_in = Column(Integer, default=0, server_default="0", nullable=False)
    rolled_out = Column(Integer, default=0, server_default="0", nullable=False)
    tasks = relationship("Task", back_populates="sprint", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"))
    status_id = Column(Integer, ForeignKey("statuses.id"))
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM)
    deadline = Column(DateTime, nullable=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sprint = relationship("Sprint", back_populates="tasks")
    status_obj = relationship("Status", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")
    subtasks  = relationship("Subtask",  back_populates="task", cascade="all, delete-orphan")
    comments  = relationship("Comment",  back_populates="task", cascade="all, delete-orphan",
                             order_by="Comment.created_at")

class Subtask(Base):
    __tablename__ = "subtasks"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    task = relationship("Task", back_populates="subtasks")

class Comment(Base):
    __tablename__ = "comments"
    id         = Column(Integer, primary_key=True, index=True)
    task_id    = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    task   = relationship("Task",   back_populates="comments")
    author = relationship("User")
