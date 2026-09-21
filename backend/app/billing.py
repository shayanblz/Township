"""منطق تولید قبوض/شارژ نمونه و پرداخت شبیه‌سازی‌شده."""
import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .models import Bill, Payment, User


def generate_sample_bills(db: Session, user: User) -> None:
    """برای ساکن جدید چند قبض/شارژ نمونه می‌سازد تا پنل بلافاصله داده داشته باشد."""
    today = datetime.now()
    sample = [
        # (عنوان، دسته، مبلغ تومان، سررسید، وضعیت)
        ("شارژ ماهانه ساختمان — ۳ ماه پیش", "charge", 850_000, today - timedelta(days=92), "paid"),
        ("شارژ ماهانه ساختمان — ۲ ماه پیش", "charge", 850_000, today - timedelta(days=61), "paid"),
        ("شارژ ماهانه ساختمان — ماه گذشته", "charge", 900_000, today - timedelta(days=30), "unpaid"),
        ("شارژ ماهانه ساختمان — ماه جاری", "charge", 900_000, today + timedelta(days=12), "unpaid"),
        ("قبض آب — دوره اخیر", "utility", 320_000, today - timedelta(days=14), "unpaid"),
        ("قبض برق — دوره اخیر", "utility", 540_000, today - timedelta(days=7), "unpaid"),
        ("هزینه پارکینگ مهمان", "other", 150_000, today + timedelta(days=20), "unpaid"),
    ]
    for title, category, amount, due, status_ in sample:
        bill = Bill(
            user_id=user.id,
            title=title,
            category=category,
            amount=amount,
            status=status_,
            due_date=due,
            paid_at=due - timedelta(days=2) if status_ == "paid" else None,
        )
        db.add(bill)
    db.commit()


def make_reference() -> str:
    return "AFT-" + secrets.token_hex(6).upper()


def pay_bill(db: Session, user: User, bill: Bill) -> Payment:
    """پرداخت شبیه‌سازی‌شده: قبض را پرداخت‌شده کرده و رکورد پرداخت می‌سازد."""
    now = datetime.now()
    bill.status = "paid"
    bill.paid_at = now
    payment = Payment(
        user_id=user.id,
        bill_id=bill.id,
        bill_title=bill.title,
        amount=bill.amount,
        reference=make_reference(),
        created_at=now,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
