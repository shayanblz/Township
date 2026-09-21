#!/usr/bin/env bash
# اجرای سرور MySQL نسخه پرتابل (ساخته‌شده داخل ساندباکس)
# اگر دیتادایر وجود نداشته باشد، ابتدا آن را مقداردهی اولیه می‌کند.
set -e

MYSQL_DIR="${MYSQL_DIR:-$HOME/.cache/township-mysql}"
SERVER_DIR="$MYSQL_DIR/package/server"
BIN="$SERVER_DIR/mysqld"

if ! [ -x "$BIN" ]; then
  echo "❌ باینری mysqld در $BIN پیدا نشد." >&2
  exit 1
fi

export LD_LIBRARY_PATH="$MYSQL_DIR/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# مقداردهی اولیه دیتادایر در صورت نیاز
if [ ! -d "$MYSQL_DIR/data/mysql" ]; then
  echo "🛠 مقداردهی اولیه دیتابیس..."
  mkdir -p "$MYSQL_DIR/data" "$MYSQL_DIR/tmp" "$MYSQL_DIR/run" "$MYSQL_DIR/files"
  "$BIN" --no-defaults --initialize-insecure \
    --user="$(whoami)" \
    --basedir="$SERVER_DIR" \
    --datadir="$MYSQL_DIR/data" \
    --lc-messages-dir="$SERVER_DIR/share/mysql" \
    --tmpdir="$MYSQL_DIR/tmp" \
    --log-error="$MYSQL_DIR/init.log"
fi

mkdir -p "$MYSQL_DIR/run"

# اگر از قبل در حال اجراست، خارج شو
if mysqladmin --version >/dev/null 2>&1; then :; fi
if pgrep -f "mysqld --defaults-file=$MYSQL_DIR/my.cnf" >/dev/null 2>&1; then
  echo "ℹ️ MySQL از قبل در حال اجراست."
  exit 0
fi

echo "🚀 اجرای MySQL روی 127.0.0.1:3306 ..."
exec "$BIN" --defaults-file="$MYSQL_DIR/my.cnf" --init-file="$MYSQL_DIR/init.sql"
