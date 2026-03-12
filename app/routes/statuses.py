from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Status
from app.schemas.schemas import Status as StatusSchema, StatusCreate

router = APIRouter(prefix="/api/statuses", tags=["statuses"])

@router.post("/", response_model=StatusSchema)
def create_status(status: StatusCreate, db: Session = Depends(get_db)):
    db_status = Status(name=status.name, color=status.color)
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status

@router.get("/", response_model=list[StatusSchema])
def list_statuses(db: Session = Depends(get_db)):
    return db.query(Status).all()

@router.get("/{status_id}", response_model=StatusSchema)
def get_status(status_id: int, db: Session = Depends(get_db)):
    status = db.query(Status).filter(Status.id == status_id).first()
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    return status
