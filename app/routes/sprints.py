from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.database import get_db
from app.models.models import Sprint, Task, Status
from app.schemas.schemas import Sprint as SprintSchema, SprintCreate, SprintRename, SprintKPI
from sqlalchemy import desc

router = APIRouter(prefix="/api/sprints", tags=["sprints"])

def do_rollover(db: Session):
    """Close expired active sprints, carry incomplete tasks forward, record counts."""
    expired = db.query(Sprint).filter(
        Sprint.active == True,
        Sprint.end_date < datetime.utcnow()
    ).all()
    for old in expired:
        old.active = False
        new = Sprint(
            name=f"Sprint {datetime.utcnow().strftime('%b %d, %Y')}",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=7),
            active=True,
            rolled_in=0,
            rolled_out=0,
        )
        db.add(new)
        db.flush()
        completed_status = db.query(Status).filter(Status.name == "Completed").first()
        q = db.query(Task).filter(Task.sprint_id == old.id)
        if completed_status:
            q = q.filter(Task.status_id != completed_status.id)
        incomplete_tasks = q.all()
        rolled_count = len(incomplete_tasks)
        for task in incomplete_tasks:
            task.sprint_id = new.id
        old.rolled_out = rolled_count
        new.rolled_in = rolled_count
    if expired:
        db.commit()

# /active and /overview must be registered BEFORE /{sprint_id}
@router.get("/active", response_model=SprintSchema)
def get_active_sprint(db: Session = Depends(get_db)):
    do_rollover(db)
    sprint = db.query(Sprint).filter(Sprint.active == True).first()
    if not sprint:
        start = datetime.utcnow()
        sprint = Sprint(
            name=f"Sprint {start.strftime('%b %d, %Y')}",
            start_date=start,
            end_date=start + timedelta(days=7),
            active=True,
        )
        db.add(sprint)
        db.commit()
        db.refresh(sprint)
    return sprint

@router.get("/overview", response_model=List[SprintKPI])
def get_sprints_overview(db: Session = Depends(get_db)):
    """All sprints newest-first with full KPI data including rollover counts and velocity."""
    do_rollover(db)
    sprints = db.query(Sprint).options(joinedload(Sprint.tasks)).order_by(desc(Sprint.id)).all()
    completed_status = db.query(Status).filter(Status.name == "Completed").first()
    now = datetime.utcnow()

    results = []
    prev_rate: Optional[float] = None

    for s in reversed(sprints):  # oldest first for delta calc
        total = len(s.tasks)
        completed = sum(
            1 for t in s.tasks
            if completed_status and t.status_id == completed_status.id
        )
        overdue = sum(
            1 for t in s.tasks
            if t.deadline and t.deadline < now
            and (not completed_status or t.status_id != completed_status.id)
        )
        rate = round(completed / total, 4) if total > 0 else 0.0
        delta = round(rate - prev_rate, 4) if prev_rate is not None else None
        prev_rate = rate

        results.append(SprintKPI(
            id=s.id,
            name=s.name,
            start_date=s.start_date,
            end_date=s.end_date,
            active=s.active,
            rolled_in=s.rolled_in,
            rolled_out=s.rolled_out,
            total_tasks=total,
            completed_tasks=completed,
            overdue_tasks=overdue,
            completion_rate=rate,
            velocity_delta=delta,
        ))

    results.reverse()  # newest first for display
    return results

@router.get("/", response_model=List[SprintSchema])
def list_sprints(db: Session = Depends(get_db)):
    return db.query(Sprint).order_by(desc(Sprint.id)).all()

@router.post("/", response_model=SprintSchema)
def create_sprint(sprint: SprintCreate, db: Session = Depends(get_db)):
    db.query(Sprint).filter(Sprint.active == True).update({"active": False})
    start = datetime.utcnow()
    db_sprint = Sprint(name=sprint.name, start_date=start, end_date=start + timedelta(days=7), active=True)
    db.add(db_sprint)
    db.commit()
    db.refresh(db_sprint)
    return db_sprint

@router.put("/{sprint_id}/rename", response_model=SprintSchema)
def rename_sprint(sprint_id: int, body: SprintRename, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    sprint.name = body.name
    db.commit()
    db.refresh(sprint)
    return sprint

@router.get("/{sprint_id}", response_model=SprintSchema)
def get_sprint(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint
