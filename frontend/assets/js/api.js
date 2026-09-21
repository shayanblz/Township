/* ابزارهای مشترک: ارتباط با API، فرمت اعداد و تاریخ، توست */
const API = "/api";
const TOKEN_KEY = "aftab_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * فراخوانی API. در صورت خطا، متن فارسی خطا را برمی‌گرداند.
 */
async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* بدون بدنه */
  }

  if (!res.ok) {
    if (res.status === 401 && auth && !path.startsWith("/auth/")) {
      clearToken();
      window.location.href = "/login.html";
      throw new Error("نشست شما منقضی شده است");
    }
    let message = "خطایی رخ داد؛ دوباره تلاش کنید";
    if (data) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail) && data.detail[0]) {
        message = translateValidationError(data.detail[0].msg);
      }
    }
    throw new Error(message);
  }
  return data;
}

/* ترجمه پیام‌های اعتبارسنجی رایج به فارسی */
function translateValidationError(msg) {
  if (!msg) return "داده واردشده معتبر نیست";
  const m = String(msg).toLowerCase();
  if (m.includes("email")) return "ایمیل واردشده معتبر نیست";
  if (m.includes("شماره موبایل")) return "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)";
  if (m.includes("password")) return "رمز عبور باید حداقل ۶ کاراکتر باشد";
  if (m.includes("full_name")) return "نام و نام خانوادگی را کامل وارد کنید";
  if (m.includes("too short") || m.includes("at least")) return "مقدار واردشده کوتاه است";
  if (m.includes("required")) return "لطفاً همه فیلدها را پر کنید";
  return msg;
}

/* فرمت مبلغ به تومان با ارقام فارسی */
function fmtMoney(n) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/* تاریخ شمسی از ISO */
function fmtDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(iso));
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

/* توست پایین صفحه */
function toast(message, type = "") {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* اجبار ورود: اگر توکن نبود به صفحه ورود برو */
function requireAuth() {
  if (!getToken()) {
    window.location.href = "/login.html";
  }
}

/* نمایش/مخفی کردن خطا در فرم‌ها */
function showAlert(id, message, kind = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert show alert-${kind}`;
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = "alert";
}
