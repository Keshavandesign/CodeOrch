from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.models.database import get_db
from app.models.models import Sprint, Task
from app.schemas.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    tasks = db.query(Task).options(joinedload(Task.status_obj)).filter(
        Task.sprint_id == sprint_id
    ).all()

    now = datetime.utcnow()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status_obj and t.status_obj.name == "Completed")
    overdue = sum(
        1 for t in tasks
        if t.deadline and t.deadline < now
        and t.status_obj and t.status_obj.name != "Completed"
    )
    return DashboardStats(total_tasks=total, completed_tasks=completed, overdue_tasks=overdue)
