const STORAGE_KEY = "buri_bookings_v1";
const SESSION_KEY = "buri_admin_authed_v1";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function safeParseJSON(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function getBookings() {
  return safeParseJSON(localStorage.getItem(STORAGE_KEY), []);
}

function setBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function formatDate(d) {
  if (!d) return "";
  return String(d);
}

function computeStats(bookings) {
  const total = bookings.length;
  const counts = new Map();
  for (const b of bookings) {
    const key = b?.package || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let topPackage = "—";
  let topCount = 0;
  for (const [k, v] of counts.entries()) {
    if (v > topCount) {
      topPackage = k;
      topCount = v;
    }
  }
  return { total, topPackage, topCount };
}

function renderStats(bookings) {
  const { total, topPackage, topCount } = computeStats(bookings);
  const elTotal = qs("#statTotal");
  const elTop = qs("#statTop");
  const elHint = qs("#statHint");
  if (elTotal) elTotal.textContent = String(total);
  if (elTop) elTop.textContent = topPackage;
  if (elHint) elHint.textContent = topCount ? `${topCount} bookings` : "No bookings yet";
}

function renderTable(bookings, query = "") {
  const tbody = qs("#tbody");
  const empty = qs("#emptyState");
  if (!tbody) return;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? bookings.filter((b) => {
        const hay = `${b?.name || ""} ${b?.email || ""} ${b?.package || ""} ${b?.date || ""}`.toLowerCase();
        return hay.includes(q);
      })
    : bookings;

  tbody.innerHTML = "";

  if (empty) empty.style.display = filtered.length ? "none" : "block";

  for (const b of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="font-weight:800">${escapeHtml(b?.name || "")}</div>
        <div class="muted" style="font-size:12.5px">${escapeHtml(b?.createdAt ? new Date(b.createdAt).toLocaleString() : "")}</div>
      </td>
      <td>${escapeHtml(b?.email || "")}</td>
      <td><span class="chip">${escapeHtml(b?.package || "")}</span></td>
      <td class="nowrap">${escapeHtml(formatDate(b?.date || ""))}</td>
      <td class="nowrap">
        <div class="row-actions">
          <button class="btn btn-danger" data-del="${escapeAttr(b?.id || "")}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) {
  return escapeHtml(s).replaceAll("`", "&#096;");
}

function initDashboard() {
  const bookings = getBookings();
  renderStats(bookings);
  renderTable(bookings);

  const search = qs("#search");
  search?.addEventListener("input", () => {
    renderTable(getBookings(), search.value);
  });

  qs("#tbody")?.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-del]");
    if (!btn) return;
    const id = btn.getAttribute("data-del");
    if (!id) return;
    const next = getBookings().filter((b) => b?.id !== id);
    setBookings(next);
    renderStats(next);
    renderTable(next, search?.value || "");
  });

  qs("#btnClearAll")?.addEventListener("click", () => {
    const ok = confirm("Delete ALL bookings? This cannot be undone.");
    if (!ok) return;
    setBookings([]);
    renderStats([]);
    renderTable([], search?.value || "");
  });

  qs("#btnLogout")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
}

function isAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function setAuthed() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

function initLogin() {
  const form = qs("#loginForm");
  if (!form) return;
  const err = qs("#loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = String(qs("#adminEmail")?.value || "").trim();
    const password = String(qs("#adminPassword")?.value || "").trim();

    if (email === "admin@buritours.co.ke" && password === "buritour200!") {
      setAuthed();
      location.reload();
      return;
    }

    if (err) err.classList.add("show");
  });
}

function boot() {
  const loginView = qs("#loginView");
  const appView = qs("#appView");

  if (!isAuthed()) {
    if (loginView) loginView.style.display = "grid";
    if (appView) appView.style.display = "none";
    initLogin();
    return;
  }

  if (loginView) loginView.style.display = "none";
  if (appView) appView.style.display = "grid";
  initDashboard();
}

document.addEventListener("DOMContentLoaded", boot);

