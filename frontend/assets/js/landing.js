/* منطق لندینگ پیج */
document.getElementById("year").textContent = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

/* اگر کاربر وارد شده باشد، نوار بالا لینک داشبورد را نشان می‌دهد */
(function () {
  const actions = document.getElementById("nav-actions");
  if (getToken() && actions) {
    actions.innerHTML = '<a href="/dashboard.html" class="btn btn-primary btn-sm">پنل ساکنین</a>';
  }
})();

/* فرم تماس — نمایش پیام موفقیت (دمو) */
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  showAlert("contact-alert", "پیام شما ثبت شد؛ کارشناسان ما به‌زودی با شما تماس می‌گیرند. ✅", "success");
  e.target.reset();
});
