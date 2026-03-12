from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.models.database import engine, Base, SessionLocal
from app.models.models import Status
from app.routes import sprints, tasks, users, statuses, dashboard, comments
from app.routes import auth as auth_router
from app.routes.sprints import do_rollover
from app.core.security import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        default_statuses = [
            ("To Do", "#6366f1"),
            ("In Progress", "#f59e0b"),
            ("Completed", "#10b981"),
            ("Blocked", "#ef4444"),
        ]
        for name, color in default_statuses:
            if not db.query(Status).filter(Status.name == name).first():
                db.add(Status(name=name, color=color))
        db.commit()
        do_rollover(db)
    finally:
        db.close()
    yield

app = FastAPI(title="Task Management Tool", lifespan=lifespan)

# Auth routes are public (no token required)
app.include_router(auth_router.router)

# All other API routes require a valid JWT
_auth = [Depends(get_current_user)]
app.include_router(sprints.router,   dependencies=_auth)
app.include_router(tasks.router,     dependencies=_auth)
app.include_router(users.router,     dependencies=_auth)
app.include_router(statuses.router,  dependencies=_auth)
app.include_router(dashboard.router, dependencies=_auth)
app.include_router(comments.router,  dependencies=_auth)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    return FileResponse("static/index.html")
