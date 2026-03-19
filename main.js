const STORAGE_KEY = "buri_bookings_v1";

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
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

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function formatKES(n) {
  try {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `KES ${n}`;
  }
}

function initReveal() {
  const els = qsa(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!prefersReduced) {
            const idx = Number(e.target.getAttribute("data-reveal-idx") || "0");
            e.target.style.transitionDelay = `${Math.min(240, idx * 55)}ms`;
          }
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { root: null, threshold: 0.12 }
  );
  els.forEach((el, i) => {
    el.setAttribute("data-reveal-idx", String(i));
    io.observe(el);
  });
}

function initSmoothAnchors() {
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeDrawer();
    });
  });
}

function openDrawer() {
  qs("#drawerBackdrop")?.classList.add("open");
  qs("#drawer")?.classList.add("open");
}
function closeDrawer() {
  qs("#drawerBackdrop")?.classList.remove("open");
  qs("#drawer")?.classList.remove("open");
}

function initDrawer() {
  const btn = qs("#menuBtn");
  const backdrop = qs("#drawerBackdrop");
  btn?.addEventListener("click", () => {
    const isOpen = qs("#drawer")?.classList.contains("open");
    if (isOpen) closeDrawer();
    else openDrawer();
  });
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

function initHeroParallax() {
  const bg = qs(".hero-bg");
  if (!bg) return;
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return;

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY || 0;
      const amt = Math.min(24, y * 0.04);
      bg.style.transform = `translate3d(0, ${amt}px, 0) scale(1.04)`;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initPackageButtons() {
  qsa("[data-select-package]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pack = btn.getAttribute("data-select-package");
      const sel = qs("#package");
      if (sel && pack) sel.value = pack;
      qs("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function showToast(kind, msg) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.classList.add("show");
  toast.style.borderColor = kind === "success" ? "rgba(27,184,74,.35)" : "rgba(220,38,38,.28)";
  toast.innerHTML = msg;
}

async function sendToFormSubmit(form) {
  const action = form.getAttribute("action") || "";
  if (!action.includes("formsubmit.co/")) return { ok: false, skipped: true };

  const fd = new FormData(form);
  const res = await fetch(action, {
    method: "POST",
    body: fd,
    headers: { Accept: "application/json" },
  });
  const ok = res.ok;
  return { ok, status: res.status };
}

function initBookingForm() {
  const form = qs("#bookingForm");
  if (!form) return;

  const packageSelect = qs("#package", form);
  const dateInput = qs("#date", form);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  if (dateInput) dateInput.min = `${yyyy}-${mm}-${dd}`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = String(qs("#name", form)?.value || "").trim();
    const email = String(qs("#email", form)?.value || "").trim();
    const packageName = String(packageSelect?.value || "").trim();
    const date = String(qs("#date", form)?.value || "").trim();

    if (!name || !email || !packageName || !date) {
      showToast("error", "Please fill in all booking details.");
      return;
    }

    const booking = {
      id: crypto?.randomUUID?.() || `b_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name,
      email,
      package: packageName,
      date,
      createdAt: new Date().toISOString(),
    };

    saveBooking(booking);

    let submitted = false;
    try {
      const res = await sendToFormSubmit(form);
      submitted = !!res.ok;
    } catch {
      submitted = false;
    }

    showToast(
      submitted ? "success" : "success",
      submitted
        ? `<strong>Booking received.</strong> Thank you for booking with Buri Tours! We will contact you shortly.`
        : `<strong>Saved locally.</strong> Thank you for booking with Buri Tours! We will contact you shortly. <span style="color:rgba(11,18,32,.62)">Tip: update the FormSubmit email in the form action.</span>`
    );

    form.reset();
    if (packageSelect) packageSelect.value = packageName;
  });
}

function initPriceBadges() {
  qsa("[data-price]").forEach((el) => {
    const raw = Number(el.getAttribute("data-price"));
    if (!Number.isFinite(raw)) return;
    el.textContent = formatKES(raw);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initSmoothAnchors();
  initDrawer();
  initHeroParallax();
  initPackageButtons();
  initBookingForm();
  initPriceBadges();
});

