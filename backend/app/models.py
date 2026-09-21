"""مدل‌های دیتابیس: کاربر، قبض/شارژ، پرداخت."""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(190), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    block: Mapped[str] = mapped_column(String(20), default="-", nullable=False)   # بلوک
    unit: Mapped[str] = mapped_column(String(20), default="-", nullable=False)    # واحد
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    bills: Mapped[list["Bill"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    payments: Mapped[list["Payment"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Bill(Base):
    """قبض یا شارژ ماهانه ساکن."""
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(30), default="charge", nullable=False)  # charge | utility | other
    amount: Mapped[int] = mapped_column(Integer, nullable=False)  # به تومان
    status: Mapped[str] = mapped_column(String(10), default="unpaid", index=True, nullable=False)  # unpaid | paid
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="bills")
    payment: Mapped["Payment | None"] = relationship(back_populates="bill", uselist=False)


class Payment(Base):
    """رکورد پرداخت موفق."""
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    bill_id: Mapped[int | None] = mapped_column(ForeignKey("bills.id", ondelete="SET NULL"), nullable=True)
    bill_title: Mapped[str] = mapped_column(String(150), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reference: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)  # کد پیگیری
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="payments")
    bill: Mapped["Bill | None"] = relationship(back_populates="payment")
