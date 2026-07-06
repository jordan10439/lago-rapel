// ============================================================
// MAIN.JS – Landing Page (index.html) logic
// ============================================================

// ── Toast Helper ─────────────────────────────────────────────
function showToast(message, type = "info", duration = 3500) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ── Navbar ───────────────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const links  = document.querySelector(".nav-links");

  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
})();

// ── FAQ Accordion ────────────────────────────────────────────
(function initFAQ() {
  // Only run on index page – property pages have their own FAQ init
  if (document.body.dataset.house) return;
  const list = document.getElementById("faqList");
  if (!list) return;

  CONFIG.faqs.forEach((faq, i) => {
    const item = document.createElement("div");
    item.className = "faq-item fade-in";
    item.innerHTML = `
      <div class="faq-question" id="faq-q-${i}">
        <span class="faq-question-text">${faq.q}</span>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-answer" id="faq-a-${i}">
        <div class="faq-answer-inner">${faq.a}</div>
      </div>
    `;

    item.querySelector(".faq-question").addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Cierra todos
      document.querySelectorAll(".faq-item.open").forEach(el => el.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });

    list.appendChild(item);
  });
})();

// ── Scroll Fade-in ───────────────────────────────────────────
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
})();

// ── Smooth scroll for anchor links ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h") || "72");
      window.scrollTo({ top: target.offsetTop - navH, behavior: "smooth" });
      // Cierra menu mobile
      document.querySelector(".nav-links")?.classList.remove("open");
    }
  });
});
