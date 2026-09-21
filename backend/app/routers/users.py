"""مسیرهای پروفایل کاربر."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import PasswordChange, UserOut, UserUpdate
from ..security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    for field in ("full_name", "phone", "block", "unit"):
        if field in data:
            value = str(data[field]).strip()
            if not value:
                continue
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(payload: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="رمز عبور فعلی اشتباه است")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "رمز عبور با موفقیت تغییر کرد"}
