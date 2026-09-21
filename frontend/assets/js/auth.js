/* منطق صفحات ورود و عضویت */

/* اگر قبلاً وارد شده، مستقیم به داشبورد برو */
if (getToken() && !window.location.pathname.includes("dashboard")) {
  window.location.href = "/dashboard.html";
}

function initAuthPage(mode) {
  const form = document.getElementById(mode === "login" ? "login-form" : "register-form");
  const btn = document.getElementById("submit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert("form-alert");

    const payload = {};
    for (const el of form.querySelectorAll("input")) {
      payload[el.id] = el.value.trim();
    }

    /* اعتبارسنجی ساده سمت کلاینت */
    if (mode === "register") {
      if (payload.full_name.length < 3) return showAlert("form-alert", "نام و نام خانوادگی را کامل وارد کنید");
      const digits = (payload.phone || "").replace(/\D/g, "");
      if (!/^09\d{9}$/.test(digits)) return showAlert("form-alert", "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)");
      if ((payload.password || "").length < 6) return showAlert("form-alert", "رمز عبور باید حداقل ۶ کاراکتر باشد");
    }
    if (!payload.email || !payload.password) return showAlert("form-alert", "ایمیل و رمز عبور را وارد کنید");

    btn.disabled = true;
    btn.textContent = "لطفاً صبر کنید…";
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await apiFetch(endpoint, { method: "POST", body: payload, auth: false });
      setToken(data.access_token);
      window.location.href = "/dashboard.html";
    } catch (err) {
      showAlert("form-alert", err.message);
      btn.disabled = false;
      btn.textContent = mode === "login" ? "ورود به پنل" : "ایجاد حساب و ورود";
    }
  });
}
