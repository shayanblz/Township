"""ایجاد کاربر نمونه برای تست سریع."""
from sqlalchemy.orm import Session

from .billing import generate_sample_bills
from .models import User
from .security import hash_password

DEMO_EMAIL = "demo@shahrak.ir"
DEMO_PASSWORD = "demo1234"


def seed_demo_user(db: Session) -> None:
    if db.query(User).filter(User.email == DEMO_EMAIL).first():
        return
    user = User(
        full_name="سارا محمدی",
        email=DEMO_EMAIL,
        phone="09121234567",
        password_hash=hash_password(DEMO_PASSWORD),
        block="A",
        unit="12",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    generate_sample_bills(db, user)
