"""اسکیمای Pydantic برای ورودی/خروجی API."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=6, max_length=100)
    block: str = Field(default="-", max_length=20)
    unit: str = Field(default="-", max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if not (digits.startswith("09") and len(digits) == 11):
            raise ValueError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد")
        return digits


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- User ----------
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone: str
    block: str
    unit: str
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=3, max_length=120)
    phone: str | None = Field(default=None, min_length=10, max_length=20)
    block: str | None = Field(default=None, max_length=20)
    unit: str | None = Field(default=None, max_length=20)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        digits = "".join(ch for ch in v if ch.isdigit())
        if not (digits.startswith("09") and len(digits) == 11):
            raise ValueError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد")
        return digits


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=100)


# ---------- Bills & Payments ----------
class BillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    amount: int
    status: str
    due_date: datetime
    paid_at: datetime | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bill_title: str
    amount: int
    reference: str
    created_at: datetime


class PayResult(BaseModel):
    success: bool
    message: str
    reference: str | None = None
    amount: int | None = None


class BillSummary(BaseModel):
    unpaid_count: int
    unpaid_total: int
    paid_count: int
    paid_total: int
