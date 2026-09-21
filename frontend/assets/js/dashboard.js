/* منطق پنل ساکنین */
requireAuth();

const CATEGORY_LABELS = { charge: "شارژ", utility: "قبض خدماتی", other: "سایر" };
let currentFilter = "";

/* ---------- تب‌ها ---------- */
document.querySelectorAll(".dash-tab[data-panel]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab[data-panel]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-" + btn.dataset.panel).classList.add("active");
  });
});

document.querySelectorAll(".dash-tab[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab[data-filter]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    loadBills();
  });
});

/* ---------- خروج ---------- */
document.getElementById("logout-btn").addEventListener("click", () => {
  clearToken();
  window.location.href = "/login.html";
});

/* ---------- پروفایل ---------- */
async function loadProfile() {
  try {
    const user = await apiFetch("/users/me");
    document.getElementById("user-name").textContent = user.full_name;
    document.getElementById("user-unit").textContent = `بلوک ${user.block} — واحد ${user.unit}`;
    document.getElementById("user-avatar").textContent = (user.full_name || "؟").trim().charAt(0);

    document.getElementById("p-name").value = user.full_name;
    document.getElementById("p-email").value = user.email;
    document.getElementById("p-phone").value = user.phone;
    document.getElementById("p-block").value = user.block === "-" ? "" : user.block;
    document.getElementById("p-unit").value = user.unit === "-" ? "" : user.unit;
  } catch (err) {
    toast(err.message, "error");
  }
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert("profile-alert");
  const payload = {
    full_name: document.getElementById("p-name").value.trim(),
    phone: document.getElementById("p-phone").value.trim(),
    block: document.getElementById("p-block").value.trim() || "-",
    unit: document.getElementById("p-unit").value.trim() || "-",
  };
  try {
    await apiFetch("/users/me", { method: "PUT", body: payload });
    showAlert("profile-alert", "پروفایل با موفقیت به‌روزرسانی شد ✅", "success");
    loadProfile();
  } catch (err) {
    showAlert("profile-alert", err.message);
  }
});

document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert("password-alert");
  const payload = {
    current_password: document.getElementById("pw-current").value,
    new_password: document.getElementById("pw-new").value,
  };
  if (!payload.current_password || !payload.new_password) {
    return showAlert("password-alert", "هر دو فیلد رمز را پر کنید");
  }
  try {
    await apiFetch("/users/me/password", { method: "PUT", body: payload });
    showAlert("password-alert", "رمز عبور با موفقیت تغییر کرد ✅", "success");
    e.target.reset();
  } catch (err) {
    showAlert("password-alert", err.message);
  }
});

/* ---------- قبوض ---------- */
function statusChip(status) {
  return status === "paid"
    ? '<span class="chip chip-paid">✓ پرداخت شده</span>'
    : '<span class="chip chip-unpaid">پرداخت نشده</span>';
}
function categoryChip(cat) {
  const cls = { charge: "chip-charge", utility: "chip-utility", other: "chip-other" }[cat] || "chip-other";
  return `<span class="chip ${cls}">${CATEGORY_LABELS[cat] || cat}</span>`;
}
function payButton(bill) {
  if (bill.status === "paid") return '<span style="color:var(--ink-soft); font-size:12px;">—</span>';
  return `<button class="btn btn-green btn-sm" onclick="openPayModal(${bill.id}, '${bill.title.replace(/'/g, "\\'")}', ${bill.amount})">پرداخت</button>`;
}

async function loadBills() {
  const body = document.getElementById("bills-body");
  body.innerHTML = '<tr><td colspan="6" class="empty">در حال بارگذاری…</td></tr>';
  try {
    const query = currentFilter ? `?status=${currentFilter}` : "";
    const bills = await apiFetch("/bills" + query);
    if (!bills.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">موردی یافت نشد 🎉</td></tr>';
      return;
    }
    body.innerHTML = bills
      .map(
        (b) => `<tr>
          <td>${b.title}</td>
          <td>${categoryChip(b.category)}</td>
          <td><b>${fmtMoney(b.amount)}</b></td>
          <td>${fmtDate(b.due_date)}</td>
          <td>${statusChip(b.status)}</td>
          <td>${payButton(b)}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${err.message}</td></tr>`;
  }
}

async function loadOverview() {
  try {
    const [summary, bills] = await Promise.all([apiFetch("/bills/summary"), apiFetch("/bills?status=unpaid")]);
    document.getElementById("ov-unpaid-total").textContent = fmtMoney(summary.unpaid_total);
    document.getElementById("ov-unpaid-count").textContent = fmtMoney(summary.unpaid_count);
    document.getElementById("ov-paid-total").textContent = fmtMoney(summary.paid_total);
    document.getElementById("ov-paid-count").textContent = fmtMoney(summary.paid_count);

    const body = document.getElementById("ov-bills-body");
    const nearest = bills.slice(0, 5);
    if (!nearest.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">بدهی‌ای ندارید؛ همه‌چیز پرداخت شده است 🎉</td></tr>';
    } else {
      body.innerHTML = nearest
        .map(
          (b) => `<tr>
            <td>${b.title}</td>
            <td>${categoryChip(b.category)}</td>
            <td><b>${fmtMoney(b.amount)}</b></td>
            <td>${fmtDate(b.due_date)}</td>
            <td>${statusChip(b.status)}</td>
            <td>${payButton(b)}</td>
          </tr>`
        )
        .join("");
    }
  } catch (err) {
    toast(err.message, "error");
  }
}

/* ---------- پرداخت‌ها ---------- */
async function loadPayments() {
  const body = document.getElementById("payments-body");
  body.innerHTML = '<tr><td colspan="4" class="empty">در حال بارگذاری…</td></tr>';
  try {
    const payments = await apiFetch("/payments");
    if (!payments.length) {
      body.innerHTML = '<tr><td colspan="4" class="empty">هنوز پرداختی انجام نشده است</td></tr>';
      return;
    }
    body.innerHTML = payments
      .map(
        (p) => `<tr>
          <td>${p.bill_title}</td>
          <td><b>${fmtMoney(p.amount)}</b></td>
          <td style="direction:ltr; text-align:right;">${p.reference}</td>
          <td>${fmtDateTime(p.created_at)}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4" class="empty">${err.message}</td></tr>`;
  }
}

/* ---------- مودال پرداخت (درگاه شبیه‌سازی‌شده) ---------- */
const modal = document.getElementById("pay-modal");
const modalContent = document.getElementById("pay-modal-content");

window.openPayModal = function (billId, title, amount) {
  modalContent.innerHTML = `
    <div class="pay-icon">💳</div>
    <h3>درگاه پرداخت (شبیه‌سازی)</h3>
    <p>${title}</p>
    <div class="amount">${fmtMoney(amount)} <small>تومان</small></div>
    <p style="font-size:12px;">با کلیک روی «پرداخت»، مبلغ به‌صورت آزمایشی از حساب شما کسر می‌شود.</p>
    <div class="modal-actions">
      <button class="btn btn-green" id="confirm-pay">پرداخت</button>
      <button class="btn btn-outline" onclick="closePayModal()">انصراف</button>
    </div>`;
  modal.classList.add("show");

  document.getElementById("confirm-pay").addEventListener("click", async () => {
    const btn = document.getElementById("confirm-pay");
    btn.disabled = true;
    btn.textContent = "در حال پرداخت…";
    try {
      const result = await apiFetch(`/bills/${billId}/pay`, { method: "POST" });
      modalContent.innerHTML = `
        <div class="pay-icon success">✅</div>
        <h3>${result.message}</h3>
        <div class="amount">${fmtMoney(result.amount)} <small>تومان</small></div>
        <div class="ref">کد پیگیری: <b style="direction:ltr; display:inline-block;">${result.reference}</b></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="closePayModal()">بستن</button>
        </div>`;
      refreshAll();
    } catch (err) {
      modalContent.innerHTML = `
        <div class="pay-icon" style="background: var(--red-soft);">⚠️</div>
        <h3>پرداخت ناموفق</h3>
        <p>${err.message}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="closePayModal()">بستن</button>
        </div>`;
    }
  });
};

window.closePayModal = function () {
  modal.classList.remove("show");
};
modal.addEventListener("click", (e) => {
  if (e.target === modal) closePayModal();
});

/* ---------- بارگذاری کلی ---------- */
function refreshAll() {
  loadProfile();
  loadBills();
  loadOverview();
  loadPayments();
}
refreshAll();
