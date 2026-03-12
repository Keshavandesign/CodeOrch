from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.models.database import get_db
from app.models.models import Comment, Task, User
from app.schemas.schemas import CommentCreate, CommentOut
from app.core.security import get_current_user
from app.core import slack

router = APIRouter(tags=["comments"])


@router.get("/api/tasks/{task_id}/comments", response_model=List[CommentOut])
def get_comments(task_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return comments


@router.post("/api/tasks/{task_id}/comments", response_model=CommentOut)
def add_comment(task_id: int, body: CommentCreate,
                db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    task = (
        db.query(Task)
        .options(joinedload(Task.sprint), joinedload(Task.assigned_user))
        .filter(Task.id == task_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    comment = Comment(task_id=task_id, user_id=current_user.id, content=body.content.strip())
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Slack notification (fire-and-forget; errors are logged, not raised)
    try:
        sprint_name = task.sprint.name if task.sprint else "Unknown sprint"
        slack.notify_comment(task, task.assigned_user, current_user, body.content, sprint_name)
    except Exception:
        pass

    # Re-fetch with author relationship loaded
    comment = db.query(Comment).options(joinedload(Comment.author)).filter(Comment.id == comment.id).first()
    return comment


@router.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    db.delete(comment)
    db.commit()
