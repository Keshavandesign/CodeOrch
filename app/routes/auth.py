from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import User
from app.core.security import (
    verify_password, hash_password, create_access_token, get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

ALLOWED_DOMAIN = "thekasper.ai"


# ── helpers ───────────────────────────────────────────────────────────────────

def _require_domain(email: str):
    if not email.lower().endswith(f"@{ALLOWED_DOMAIN}"):
        raise HTTPException(
            status_code=400,
            detail=f"Only @{ALLOWED_DOMAIN} email addresses are allowed",
        )


def _name_from_email(email: str) -> str:
    """keshav@thekasper.ai → 'Keshav'   |   john.doe@... → 'John Doe'"""
    local = email.split("@")[0]
    return " ".join(p.capitalize() for p in local.replace(".", " ").replace("_", " ").split())


def _token_response(user: User) -> dict:
    token = create_access_token({"user_id": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }


# ── request bodies ────────────────────────────────────────────────────────────

class EmailCheckRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post("/check-email")
def check_email(body: EmailCheckRequest, db: Session = Depends(get_db)):
    """
    Step-1 of login flow.
    Returns whether an account exists and a name pre-fill suggestion.
    """
    _require_domain(body.email)
    user = db.query(User).filter(User.email == body.email.lower()).first()
    return {
        "exists": user is not None and user.password_hash is not None,
        "suggested_name": _name_from_email(body.email),
    }


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    _require_domain(body.email)
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=404, detail="No account found — please register first")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return _token_response(user)


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    _require_domain(body.email)
    existing = db.query(User).filter(User.email == body.email.lower()).first()

    if existing and existing.password_hash:
        raise HTTPException(status_code=409, detail="Account already exists — please sign in")

    if existing:
        # Was manually added as a team member; now claiming the account
        existing.name = body.name
        existing.password_hash = hash_password(body.password)
        db.commit()
        db.refresh(existing)
        return _token_response(existing)

    # Brand-new user
    user = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
