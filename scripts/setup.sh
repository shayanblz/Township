#!/usr/bin/env bash
# ساخت محیط مجازی پایتون و نصب وابستگی‌ها
set -e
cd "$(dirname "$0")/.."

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r backend/requirements.txt

echo "✅ محیط آماده شد. برای اجرا: ./scripts/run.sh"
