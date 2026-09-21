"""پیکربندی برنامه — مقادیر از متغیرهای محیطی خوانده می‌شوند."""
import os


class Settings:
    APP_NAME: str = "شهرک مسکونی آفتاب"
    API_PREFIX: str = "/api"

    # دیتابیس MySQL
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "township")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "township_pass_2026")
    DB_NAME: str = os.getenv("DB_NAME", "township")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    # احراز هویت
    JWT_SECRET: str = os.getenv("JWT_SECRET", "aftab-township-secret-change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "1440"))


settings = Settings()
