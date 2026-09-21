#!/usr/bin/env bash
# اجرای سرور فرانت + بک‌اند (FastAPI) روی پورت 8000
set -e
cd "$(dirname "$0")/.."

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

exec ./venv/bin/uvicorn backend.app.main:app --host "$HOST" --port "$PORT"
