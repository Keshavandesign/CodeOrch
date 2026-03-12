from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from app.models.database import get_db
from app.models.models import Task, Subtask, Sprint, Status, User, Priority
from app.schemas.schemas import Task as TaskSchema, TaskCreate, TaskUpdate, Subtask as SubtaskSchema, SubtaskCreate
from app.core.security import get_current_user
from app.core import slack
from sqlalchemy import desc, case

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

PRIORITY_ORDER = lambda: case(
    (Task.priority == Priority.HIGH, 1),
    (Task.priority == Priority.MEDIUM, 2),
    (Task.priority == Priority.LOW, 3),
    else_=4
)


def _get_sprint_name(task: Task) -> str:
    return task.sprint.name if task.sprint else "Unknown sprint"


# Must be before /{task_id} to avoid route conflict
@router.get("/sprint/{sprint_id}", response_model=List[TaskSchema])
def get_sprint_tasks(sprint_id: int, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.sprint_id == sprint_id).order_by(
        PRIORITY_ORDER(), desc(Task.created_at)
    ).all()


@router.post("/", response_model=TaskSchema)
def create_task(sprint_id: int, task: TaskCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    sprint = db.query(Sprint).options(joinedload(Sprint.tasks)).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    db_task = Task(**task.dict(), sprint_id=sprint_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Slack: notify assignee on creation
    try:
        if db_task.assigned_user_id:
            assignee = db.query(User).filter(User.id == db_task.assigned_user_id).first()
            sprint_obj = db.query(Sprint).filter(Sprint.id == sprint_id).first()
            sprint_name = sprint_obj.name if sprint_obj else "Unknown sprint"
            slack.notify_assignment(db_task, assignee, current_user, sprint_name)
    except Exception:
        pass

    return db_task


@router.get("/{task_id}", response_model=TaskSchema)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    task = (
        db.query(Task)
        .options(joinedload(Task.sprint), joinedload(Task.assigned_user))
        .filter(Task.id == task_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Snapshot old values for notification diffing
    old_assignee_id = task.assigned_user_id
    old_status_id   = task.status_id

    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)

    # Slack notifications (all wrapped — a Slack failure never breaks the response)
    try:
        sprint_name = task.sprint.name if task.sprint else "Unknown sprint"

        # Assignment changed?
        new_assignee_id = update_data.get("assigned_user_id")
        if new_assignee_id and new_assignee_id != old_assignee_id:
            new_assignee = db.query(User).filter(User.id == new_assignee_id).first()
            slack.notify_assignment(task, new_assignee, current_user, sprint_name)

        # Status changed?
        new_status_id = update_data.get("status_id")
        if new_status_id and new_status_id != old_status_id:
            old_status = db.query(Status).filter(Status.id == old_status_id).first()
            new_status = db.query(Status).filter(Status.id == new_status_id).first()
            assignee   = db.query(User).filter(User.id == task.assigned_user_id).first()
            if old_status and new_status:
                slack.notify_status_change(
                    task, assignee,
                    old_status.name, new_status.name,
                    sprint_name
                )
    except Exception:
        pass

    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.post("/{task_id}/subtasks", response_model=SubtaskSchema)
def add_subtask(task_id: int, subtask: SubtaskCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_subtask = Subtask(title=subtask.title, completed=subtask.completed, task_id=task_id)
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask


@router.put("/subtask/{subtask_id}", response_model=SubtaskSchema)
def update_subtask(subtask_id: int, subtask: SubtaskCreate, db: Session = Depends(get_db)):
    sub = db.query(Subtask).filter(Subtask.id == subtask_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subtask not found")
    sub.title = subtask.title
    sub.completed = subtask.completed
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/subtask/{subtask_id}")
def delete_subtask(subtask_id: int, db: Session = Depends(get_db)):
    sub = db.query(Subtask).filter(Subtask.id == subtask_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subtask not found")
    db.delete(sub)
    db.commit()
    return {"ok": True}
