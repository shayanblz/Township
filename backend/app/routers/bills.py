"""مسیرهای قبوض، شارژ و پرداخت‌ها."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..billing import pay_bill
from ..database import get_db
from ..deps import get_current_user
from ..models import Bill, Payment, User
from ..schemas import BillOut, BillSummary, PaymentOut, PayResult

router = APIRouter(tags=["bills"])


@router.get("/bills", response_model=list[BillOut])
def list_bills(
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Bill).filter(Bill.user_id == current_user.id)
    if status_filter in ("paid", "unpaid"):
        q = q.filter(Bill.status == status_filter)
    return q.order_by(Bill.due_date.asc()).all()


@router.get("/bills/summary", response_model=BillSummary)
def bills_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).all()
    unpaid = [b for b in bills if b.status == "unpaid"]
    paid = [b for b in bills if b.status == "paid"]
    return BillSummary(
        unpaid_count=len(unpaid),
        unpaid_total=sum(b.amount for b in unpaid),
        paid_count=len(paid),
        paid_total=sum(b.amount for b in paid),
    )


@router.post("/bills/{bill_id}/pay", response_model=PayResult)
def pay(bill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.get(Bill, bill_id)
    if bill is None or bill.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="قبض یافت نشد")
    if bill.status == "paid":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="این قبض قبلاً پرداخت شده است")

    payment = pay_bill(db, current_user, bill)
    return PayResult(
        success=True,
        message="پرداخت با موفقیت انجام شد",
        reference=payment.reference,
        amount=payment.amount,
    )


@router.get("/payments", response_model=list[PaymentOut])
def list_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )
