"""نقطه ورود برنامه: شهرک مسکونی آفتاب — FastAPI + MySQL."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import auth, bills, users
from .seed import seed_demo_user

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

app = FastAPI(
    title="API شهرک مسکونی آفتاب",
    description="بک‌اند پنل ساکنین: احراز هویت، پروفایل، شارژ و قبوض",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(bills.router, prefix=settings.API_PREFIX)


@app.get(f"{settings.API_PREFIX}/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.on_event("startup")
def on_startup():
    # ساخت جداول و کاربر نمونه
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()


# سرو کردن فرانت‌اند (لندینگ + پنل) — باید بعد از مسیرهای API مانت شود
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
