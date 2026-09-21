# 🌇 شهرک مسکونی آفتاب — وب‌سایت و پنل ساکنین

وب‌سایت کامل یک شهرک مسکونی شامل **لندینگ پیج** (معرفی، امکانات، گالری، تماس)، **سیستم ورود/عضویت** ساکنین و **پنل کاربری** با امکانات پروفایل و پرداخت شارژ/قبوض.

## 🧰 تکنولوژی‌ها

| بخش | تکنولوژی |
| --- | --- |
| بک‌اند | **Python + FastAPI** |
| دیتابیس | **MySQL 5.7** (با SQLAlchemy 2 و PyMySQL) |
| فرانت‌اند | HTML/CSS/JS خالص — راست‌به‌چپ با فونت **وزیرمتن** |
| احراز هویت | توکن **JWT** + هش رمز عبور با PBKDF2-SHA256 |

## ✨ امکانات

**لندینگ پیج (`/`)**
- معرفی شهرک، آمار و فراخوان عضویت
- معرفی ۸ امکانات رفاهی شهرک
- گالری تصاویر
- اطلاعات تماس + فرم پیام

**احراز هویت (`/login` ، `/register`)**
- عضویت با نام، موبایل، ایمیل، رمز عبور، بلوک و واحد
- ورود با ایمیل/رمز و دریافت توکن
- اعتبارسنجی فارسی سمت سرور و کلاینت

**پنل ساکنین (`/dashboard`)**
- پیش‌خوان: مبلغ بدهی، تعداد قبوض، مجموع پرداخت‌ها
- فهرست شارژ ماهانه و قبوض با فیلتر وضعیت و دکمه پرداخت
- درگاه پرداخت **شبیه‌سازی‌شده** با صدور کد پیگیری
- تاریخچه کامل پرداخت‌ها
- پروفایل: ویرایش اطلاعات + تغییر رمز عبور

> برای هر ساکن جدید، چند قبض/شارژ نمونه ساخته می‌شود تا پنل بلافاصله قابل استفاده باشد.

## 🚀 اجرای پروژه

### ۱) دیتابیس (MySQL)

یک دیتابیس و کاربر بسازید:

```sql
CREATE DATABASE township CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'township'@'localhost' IDENTIFIED BY 'township_pass_2026';
GRANT ALL PRIVILEGES ON township.* TO 'township'@'localhost';
```

> در این ساندباکس، سرور MySQL پرتابل به‌صورت خودکار با `scripts/start_db.sh` اجرا می‌شود
> (جداول و کاربر نمونه هنگام استارت بک‌اند ساخته می‌شوند).

### ۲) بک‌اند + فرانت‌اند

```bash
./scripts/setup.sh     # ساخت venv و نصب وابستگی‌ها
./scripts/run.sh       # اجرا روی 0.0.0.0:8000
```

سپس در مرورگر باز کنید:

| صفحه | آدرس |
| --- | --- |
| لندینگ پیج | `http://localhost:8000/` |
| ورود | `http://localhost:8000/login.html` |
| عضویت | `http://localhost:8000/register.html` |
| پنل ساکنین | `http://localhost:8000/dashboard.html` |
| مستندات API (Swagger) | `http://localhost:8000/docs` |

### 🔑 حساب آزمایشی

```
ایمیل:  demo@shahrak.ir
رمز:    demo1234
```

### ⚙️ متغیرهای محیطی

| متغیر | مقدار پیش‌فرض |
| --- | --- |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3306` |
| `DB_USER` / `DB_PASSWORD` | `township` / `township_pass_2026` |
| `DB_NAME` | `township` |
| `JWT_SECRET` | (حتماً در پروداکشن تغییر کند) |
| `TOKEN_EXPIRE_MINUTES` | `1440` |

## 📁 ساختار پروژه

```
Township/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # نقطه ورود + سرو کردن فرانت‌اند
│       ├── config.py        # پیکربندی
│       ├── database.py      # اتصال SQLAlchemy
│       ├── models.py        # User / Bill / Payment
│       ├── schemas.py       # مدل‌های Pydantic
│       ├── security.py      # هش رمز + JWT
│       ├── deps.py          # احراز هویت مسیرها
│       ├── billing.py       # منطق قبوض و پرداخت
│       ├── seed.py          # کاربر نمونه
│       └── routers/         # auth / users / bills
├── frontend/
│   ├── index.html           # لندینگ پیج
│   ├── login.html           # ورود
│   ├── register.html        # عضویت
│   ├── dashboard.html       # پنل ساکنین
│   └── assets/              # CSS / JS / تصاویر گالری
└── scripts/                 # setup / run / start_db
```

## 🔌 خلاصه API

| متد | مسیر | توضیح |
| --- | --- | --- |
| `POST` | `/api/auth/register` | عضویت ساکن جدید |
| `POST` | `/api/auth/login` | ورود و دریافت توکن |
| `GET` | `/api/auth/me` / `/api/users/me` | اطلاعات کاربر جاری |
| `PUT` | `/api/users/me` | ویرایش پروفایل |
| `PUT` | `/api/users/me/password` | تغییر رمز عبور |
| `GET` | `/api/bills` | فهرست قبوض (فیلتر `?status=`) |
| `GET` | `/api/bills/summary` | خلاصه بدهی/پرداخت‌ها |
| `POST` | `/api/bills/{id}/pay` | پرداخت قبض (شبیه‌سازی) |
| `GET` | `/api/payments` | تاریخچه پرداخت‌ها |
| `GET` | `/api/health` | وضعیت سرویس |

## 📝 یادداشت‌ها

- درگاه پرداخت **شبیه‌سازی** شده است؛ برای اتصال واقعی، تابع `pay_bill` در `backend/app/billing.py` را به درگاه بانکی متصل کنید.
- فرانت‌اند بدون فریم‌ورک است و توسط خود FastAPI سرو می‌شود (بدون نیاز به سرور جدا).
