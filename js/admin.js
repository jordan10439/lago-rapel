// ============================================================
// ADMIN.JS – Panel de Administración
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Login ──────────────────────────────────────────────
  const loginSection  = document.getElementById("loginSection");
  const adminApp      = document.getElementById("adminApp");

  function checkAuth() {
    if (StorageManager.isAdminLoggedIn()) {
      showApp();
    } else {
      loginSection.style.display = "flex";
      adminApp.style.display = "none";
    }
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("loginUser").value;
      const pass = document.getElementById("loginPass").value;
      const errEl = document.getElementById("loginError");

      if (user === CONFIG.admin.user && pass === CONFIG.admin.pass) {
        StorageManager.setAdminSession();
        errEl.classList.remove("show");
        showApp();
      } else {
        errEl.textContent = "Usuario o contraseña incorrectos";
        errEl.classList.add("show");
      }
    });
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    StorageManager.clearAdminSession();
    loginSection.style.display = "flex";
    adminApp.style.display = "none";
  });

  function showApp() {
    loginSection.style.display = "none";
    adminApp.style.display = "grid";
    loadDashboard();
    loadSolicitudesPanel();
    loadReservationsPanel();
    loadBlockDatesPanel();
    loadSeasonPanel();
    initContentEditor();
  }

  // ── Navigation ─────────────────────────────────────────
  document.querySelectorAll(".admin-nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const panel = item.dataset.panel;
      document.querySelectorAll(".admin-nav-item").forEach(i => i.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(panel)?.classList.add("active");
    });
  });

  // ══════════════════════════════════════════════════════
  // PANEL 1: DASHBOARD
  // ══════════════════════════════════════════════════════
  function loadDashboard() {
    const res1 = StorageManager.getReservations(1);
    const res2 = StorageManager.getReservations(2);
    const all  = [...res1, ...res2];

    const today = new Date().toISOString().split("T")[0];
    const active = all.filter(r => r.checkOut >= today);
    const totalRevenue = all.reduce((s, r) => s + (r.totalPrice || 0), 0);

    setEl("stat-total",   all.length);
    setEl("stat-active",  active.length);
    setEl("stat-casa1",   res1.length);
    setEl("stat-casa2",   res2.length);
    setEl("stat-revenue", formatCLP(totalRevenue));

    // Próximas reservas
    const upcoming = all
      .filter(r => r.checkIn >= today)
      .sort((a,b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 5);

    const tbody = document.getElementById("upcomingBody");
    if (tbody) {
      tbody.innerHTML = upcoming.length === 0
        ? `<tr><td colspan="5" class="empty-state">No hay próximas reservas</td></tr>`
        : upcoming.map(r => `
          <tr>
            <td><span class="res-badge house${r.houseId}">${r.houseName}</span></td>
            <td>${r.guestName}</td>
            <td>${r.checkIn} → ${r.checkOut}</td>
            <td>${r.persons} personas</td>
            <td>${formatCLP(r.totalPrice || 0)}</td>
          </tr>
        `).join("");
    }
  }

  // ══════════════════════════════════════════════════════
  // PANEL 2: RESERVAS
  // ══════════════════════════════════════════════════════
  function loadReservationsPanel() {
    renderReservationTable(1);
    renderReservationTable(2);

    // Filtros
    document.getElementById("resFilter")?.addEventListener("change", (e) => {
      const val = e.target.value;
      document.getElementById("resTable1Wrap").style.display = (val === "all" || val === "1") ? "block" : "none";
      document.getElementById("resTable2Wrap").style.display = (val === "all" || val === "2") ? "block" : "none";
    });
  }

  function renderReservationTable(houseId) {
    const tbody = document.getElementById(`resBody${houseId}`);
    if (!tbody) return;
    const list = StorageManager.getReservations(houseId);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Sin reservas para esta casa</td></tr>`;
      return;
    }

    tbody.innerHTML = list.sort((a,b) => b.checkIn.localeCompare(a.checkIn)).map(r => {
      const high = isHighSeason(new Date(r.checkIn + "T12:00:00"));
      return `<tr>
        <td>${r.guestName}</td>
        <td>${r.guestPhone}</td>
        <td>${r.checkIn}</td>
        <td>${r.checkOut}</td>
        <td>${r.adults || 0}A + ${r.children || 0}N = ${r.persons}p</td>
        <td><span class="res-badge ${high ? "high" : "low"}">${high ? "🔴 Alta" : "🟢 Baja"}</span></td>
        <td>${formatCLP(r.totalPrice || 0)}</td>
        <td><button class="del-btn" onclick="deleteReservation(${houseId}, ${r.id})">🗑 Eliminar</button></td>
      </tr>`;
    }).join("");
  }

  window.deleteReservation = function(houseId, id) {
    if (!confirm("¿Eliminar esta reserva?")) return;
    StorageManager.deleteReservation(houseId, id);
    renderReservationTable(houseId);
    loadDashboard();
    showAdminToast("Reserva eliminada", "success");
  };

  // ══════════════════════════════════════════════════════
  // PANEL 3: BLOQUEAR FECHAS
  // ══════════════════════════════════════════════════════
  function loadBlockDatesPanel() {
    renderBlockedList(1);
    renderBlockedList(2);

    const blockForm = document.getElementById("blockForm");
    if (blockForm) {
      blockForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const houseId = parseInt(document.getElementById("blockHouse").value);
        const start   = document.getElementById("blockStart").value;
        const end     = document.getElementById("blockEnd").value;
        const reason  = document.getElementById("blockReason").value;

        if (!start || !end || start > end) {
          showAdminToast("Fechas inválidas", "error");
          return;
        }

        StorageManager.addBlockedRange(houseId, { start, end, reason });
        renderBlockedList(houseId);
        blockForm.reset();
        showAdminToast(`Fechas bloqueadas en ${CONFIG.houses[houseId].name}`, "success");
      });
    }
  }

  function renderBlockedList(houseId) {
    const list = StorageManager.getBlockedDates(houseId);
    const el   = document.getElementById(`blockedList${houseId}`);
    if (!el) return;

    if (list.length === 0) {
      el.innerHTML = `<div class="empty-state">Sin fechas bloqueadas</div>`;
      return;
    }

    el.innerHTML = list.map(b => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:8px;">
        <div>
          <span style="color:#fff;font-size:0.88rem;">📅 ${b.start} → ${b.end}</span>
          ${b.reason ? `<span style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-left:8px;">${b.reason}</span>` : ""}
        </div>
        <button class="del-btn" onclick="deleteBlock(${houseId}, ${b.id})">Eliminar</button>
      </div>
    `).join("");
  }

  window.deleteBlock = function(houseId, id) {
    StorageManager.deleteBlockedRange(houseId, id);
    renderBlockedList(houseId);
    showAdminToast("Bloqueo eliminado", "success");
  };

  // ══════════════════════════════════════════════════════
  // PANEL 4: TEMPORADAS (Semana Santa + Calendario Visual)
  // ══════════════════════════════════════════════════════
  function loadSeasonPanel() {
    renderSemanaSantaList();
    initAdminSeasonCalendar();

    const santaForm = document.getElementById("santaForm");
    if (santaForm) {
      santaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const year  = document.getElementById("santaYear").value;
        const start = document.getElementById("santaStart").value;
        const end   = document.getElementById("santaEnd").value;

        if (!year || !start || !end || start > end) {
          showAdminToast("Fechas inválidas", "error");
          return;
        }

        const list = StorageManager.getSemanaSanta();
        const exists = list.find(s => s.year === parseInt(year));
        if (exists) { exists.start = start; exists.end = end; }
        else { list.push({ year: parseInt(year), start, end }); }
        StorageManager.setSemanaSanta(list);
        renderSemanaSantaList();
        santaForm.reset();
        showAdminToast(`Semana Santa ${year} guardada`, "success");
      });
    }

    document.getElementById("clearOverridesBtn")?.addEventListener("click", () => {
      if (!confirm("¿Eliminar todos los ajustes manuales de fechas?")) return;
      StorageManager.clearAllSeasonOverrides();
      showAdminToast("Ajustes manuales eliminados", "success");
      if (window._adminSeasonCal) window._adminSeasonCal.renderMonth();
    });
  }

  // ── Admin Visual Season Calendar ───────────────────────
  function initAdminSeasonCalendar() {
    const container = document.getElementById("adminSeasonCalContainer");
    if (!container) return;
    window._adminSeasonCal = new AdminSeasonCal(container);
  }

  class AdminSeasonCal {
    constructor(container) {
      this.container = container;
      const now = new Date();
      this.year  = now.getFullYear();
      this.month = now.getMonth();
      this.MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                     "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      this.DAYS   = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
      this.render();
    }

    toISO(d) {
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }

    handleClick(dateStr) {
      const ov = StorageManager.getSeasonOverrides();
      if (!ov[dateStr])              StorageManager.setSeasonOverride(dateStr, "high");
      else if (ov[dateStr]==="high") StorageManager.setSeasonOverride(dateStr, "low");
      else                           StorageManager.setSeasonOverride(dateStr, null);
      this.renderMonth();
    }

    render() {
      this.container.innerHTML = `
        <div class="admin-season-cal-nav">
          <button id="ascPrev">‹</button>
          <span id="ascTitle"></span>
          <button id="ascNext">›</button>
        </div>
        <div id="ascGrid"></div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;font-size:0.78rem;">
          <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:13px;height:13px;background:#fee2e2;border:1px solid #dc2626;border-radius:3px"></span>T.Alta (automático)</span>
          <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:13px;height:13px;background:#fca5a5;border:2px solid #dc2626;border-radius:3px"></span>T.Alta (ajuste manual)</span>
          <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:13px;height:13px;background:#dcfce7;border:1px solid #16a34a;border-radius:3px"></span>T.Baja (automático)</span>
          <span style="display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:13px;height:13px;background:#86efac;border:2px solid #16a34a;border-radius:3px"></span>T.Baja (ajuste manual)</span>
        </div>
        <div style="margin-top:10px;font-size:0.78rem;color:rgba(255,255,255,0.4);line-height:1.5">
          <strong style="color:rgba(255,255,255,0.6)">Cómo usar:</strong> Haz clic en un día para alternarlo entre T.Alta manual → T.Baja manual → sin ajuste (vuelve a la regla automática).
        </div>`;
      document.getElementById("ascPrev").addEventListener("click", () => {
        this.month === 0 ? (this.month = 11, this.year--) : this.month--;
        this.renderMonth();
      });
      document.getElementById("ascNext").addEventListener("click", () => {
        this.month === 11 ? (this.month = 0, this.year++) : this.month++;
        this.renderMonth();
      });
      this.renderMonth();
    }

    renderMonth() {
      document.getElementById("ascTitle").textContent = `${this.MONTHS[this.month]} ${this.year}`;
      const grid     = document.getElementById("ascGrid");
      const firstDOW = new Date(this.year, this.month, 1).getDay();
      const lastDay  = new Date(this.year, this.month + 1, 0).getDate();
      const overrides= StorageManager.getSeasonOverrides();

      let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-top:10px">`;
      this.DAYS.forEach(d => {
        html += `<div style="text-align:center;font-size:0.62rem;font-weight:700;color:rgba(255,255,255,0.35);padding:5px 0;">${d}</div>`;
      });
      for (let i = 0; i < firstDOW; i++) html += `<div></div>`;

      for (let day = 1; day <= lastDay; day++) {
        const d   = new Date(this.year, this.month, day);
        const str = this.toISO(d);
        const ov  = overrides[str];
        const auto= isHighSeason(d);

        let bg, brd, col;
        if (ov === "high")       { bg="#fca5a5"; brd="2px solid #dc2626"; col="#7f1d1d"; }
        else if (ov === "low")   { bg="#86efac"; brd="2px solid #16a34a"; col="#14532d"; }
        else if (auto)           { bg="#fee2e2"; brd="1px solid #dc2626"; col="#dc2626"; }
        else                     { bg="#dcfce7"; brd="1px solid #16a34a"; col="#16a34a"; }

        html += `<div data-date="${str}" title="${str}${ov ? ' (ajuste manual: '+ov+'): clic para cambiar':''}"
          style="text-align:center;padding:6px 2px;font-size:0.78rem;font-weight:600;border-radius:6px;cursor:pointer;background:${bg};border:${brd};color:${col};">${day}</div>`;
      }
      html += `</div>`;
      grid.innerHTML = html;
      grid.querySelectorAll("[data-date]").forEach(el => {
        el.addEventListener("click", () => this.handleClick(el.dataset.date));
      });
    }
  }

  function renderSemanaSantaList() {
    const list = StorageManager.getSemanaSanta();
    const el   = document.getElementById("santaList");
    if (!el) return;

    if (list.length === 0) {
      el.innerHTML = `<div class="empty-state">No hay Semanas Santas configuradas</div>`;
      return;
    }

    el.innerHTML = list.sort((a,b) => a.year - b.year).map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:8px;">
        <span style="color:#fff;font-size:0.88rem;">✝️ Semana Santa ${s.year}: ${s.start} → ${s.end}</span>
        <button class="del-btn" onclick="deleteSanta(${s.year})">Eliminar</button>
      </div>
    `).join("");
  }

  window.deleteSanta = function(year) {
    const list = StorageManager.getSemanaSanta().filter(s => s.year !== year);
    StorageManager.setSemanaSanta(list);
    renderSemanaSantaList();
    showAdminToast("Semana Santa eliminada", "success");
  };

  // ── Admin Toast ────────────────────────────────────────
  function showAdminToast(msg, type = "info") {
    const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add("toast-exit"); setTimeout(() => toast.remove(), 350); }, 3000);
  }

  // ── Utils ──────────────────────────────────────────────
  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ══════════════════════════════════════════════════════
  // PANEL 5: EDITAR CASAS (imágenes, desc, dirección)
  // ══════════════════════════════════════════════════════
  function initContentEditor() {
    [1, 2].forEach(id => {
      const house      = CONFIG.houses[id];
      const previewImg = document.getElementById(`previewImg${id}`);
      const imgInput   = document.getElementById(`imgInput${id}`);
      const descInput  = document.getElementById(`descInput${id}`);
      const addrInput  = document.getElementById(`addrInput${id}`);
      const saveBtn    = document.getElementById(`saveEdit${id}`);
      const resetBtn   = document.getElementById(`resetEdit${id}`);

      // Load saved values
      const savedImg  = StorageManager.get(`custom_img_${id}`);
      const savedDesc = StorageManager.get(`custom_desc_${id}`);
      const savedAddr = StorageManager.get(`custom_addr_${id}`);

      if (savedImg  && previewImg) previewImg.src = savedImg;
      if (savedDesc && descInput)  descInput.value = savedDesc;
      if (savedAddr && addrInput)  addrInput.value = savedAddr;
      if (!savedDesc && descInput) descInput.value = house.description;
      if (!savedAddr && addrInput) addrInput.value = house.address;

      // Hero image upload
      imgInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showAdminToast("Imagen muy grande (máx 5MB)", "error"); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          StorageManager.set(`custom_img_${id}`, ev.target.result);
          if (previewImg) previewImg.src = ev.target.result;
          showAdminToast(`✅ Imagen principal de ${house.name} actualizada`, "success");
        };
        reader.readAsDataURL(file);
      });

      // Save
      saveBtn?.addEventListener("click", () => {
        const desc = descInput?.value?.trim();
        const addr = addrInput?.value?.trim();
        if (desc) StorageManager.set(`custom_desc_${id}`, desc);
        if (addr) StorageManager.set(`custom_addr_${id}`, addr);
        showAdminToast(`✅ ${house.name} guardada`, "success");
      });

      // Reset
      resetBtn?.addEventListener("click", () => {
        if (!confirm(`¿Restaurar ${house.name} a valores originales?`)) return;
        StorageManager.remove(`custom_img_${id}`);
        StorageManager.remove(`custom_desc_${id}`);
        StorageManager.remove(`custom_addr_${id}`);
        if (previewImg) previewImg.src = `assets/img/casa${id}_exterior.png`;
        if (descInput)  descInput.value = house.description;
        if (addrInput)  addrInput.value = house.address;
        showAdminToast(`↺ ${house.name} restaurada`, "info");
      });

      // ── Gallery upload ───────────────────────────
      const galleryInput = document.getElementById(`galleryInput${id}`);
      galleryInput?.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        let processed = 0;
        files.forEach(file => {
          if (file.size > 8 * 1024 * 1024) {
            showAdminToast(`"${file.name}" muy grande (máx 8MB)`, "error");
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            StorageManager.addGalleryImage(id, ev.target.result);
            processed++;
            if (processed === files.length) {
              showAdminToast(`✅ ${processed} foto(s) agregada(s) a ${house.name}`, "success");
              renderGalleryAdmin(id);
            }
          };
          reader.readAsDataURL(file);
        });
        e.target.value = "";
      });

      renderGalleryAdmin(id);
    });
  }

  function renderGalleryAdmin(houseId) {
    const container = document.getElementById(`galleryPreview${houseId}`);
    if (!container) return;
    const photos = StorageManager.getGallery(houseId);
    if (!photos.length) {
      container.innerHTML = `<div style="font-size:0.8rem;color:rgba(255,255,255,0.3);padding:8px 0;">Sin fotos en galería</div>`;
      return;
    }
    container.innerHTML = photos.map(img => `
      <div class="admin-gallery-thumb-wrap">
        <img src="${img.data}" class="admin-gallery-thumb" alt="Foto galería">
        <button class="admin-gallery-del" onclick="deleteGalleryImg(${houseId},${img.id})" title="Eliminar foto">✕</button>
      </div>
    `).join("");
  }

  window.deleteGalleryImg = function(houseId, imgId) {
    StorageManager.removeGalleryImage(houseId, imgId);
    renderGalleryAdmin(houseId);
    showAdminToast("Foto eliminada", "success");
  };

  // ── Solicitudes de Reserva ─────────────────────────────
  let currentFilter = "all";

  function loadSolicitudesPanel() {
    renderSolicitudes();
    updateSolicitudesBadge();
  }

  function updateSolicitudesBadge() {
    const pending = StorageManager.getAllRequests().filter(r => r.status === "pending");
    const badge   = document.getElementById("solicitudesBadge");
    if (!badge) return;
    if (pending.length > 0) {
      badge.textContent = pending.length;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  window.filterSolicitudes = function(status) {
    currentFilter = status;
    renderSolicitudes();
  };

  function renderSolicitudes() {
    const container = document.getElementById("solicitudesList");
    if (!container) return;

    let list = StorageManager.getAllRequests();
    if (currentFilter !== "all") {
      list = list.filter(r => r.status === currentFilter);
    }
    // Más recientes primero
    list = list.slice().reverse();

    if (!list.length) {
      const labels = { all: "No hay solicitudes aún.", pending: "No hay solicitudes pendientes.", accepted: "No hay solicitudes aceptadas.", rejected: "No hay solicitudes rechazadas." };
      container.innerHTML = `<div style="color:rgba(255,255,255,0.5);text-align:center;padding:40px;">${labels[currentFilter] || "Sin resultados."}</div>`;
      return;
    }

    const HOUSE_NAMES = { 1: "Santa Eliana 294", 2: "Santa Eliana 353" };
    const STATUS_LABELS = {
      pending:  { label: "⏳ Pendiente",  color: "#fde047", bg: "rgba(234,179,8,0.15)"  },
      accepted: { label: "✅ Aceptada",   color: "#86efac", bg: "rgba(22,163,74,0.15)"  },
      rejected: { label: "❌ Rechazada",  color: "#fca5a5", bg: "rgba(220,38,38,0.12)"  }
    };

    container.innerHTML = list.map(req => {
      const st  = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
      const dt  = new Date(req.createdAt);
      const dtStr = `${dt.toLocaleDateString("es-CL")} ${dt.toLocaleTimeString("es-CL", {hour:"2-digit",minute:"2-digit"})}`;
      const nights = req.nights || Math.round((new Date(req.checkOut) - new Date(req.checkIn)) / 86400000);
      const total  = (req.totalPrice || 0).toLocaleString("es-CL");

      const actionBtns = req.status === "pending" ? `
        <div style="display:flex;gap:10px;margin-top:16px;">
          <button onclick="acceptSolicitud(${req.id})"
            style="flex:1;background:#16a34a;color:#fff;border:none;border-radius:8px;padding:10px 0;font-weight:700;cursor:pointer;font-size:0.9rem;">
            ✅ Aceptar – Bloquear Fechas
          </button>
          <button onclick="rejectSolicitud(${req.id})"
            style="flex:1;background:#dc2626;color:#fff;border:none;border-radius:8px;padding:10px 0;font-weight:700;cursor:pointer;font-size:0.9rem;">
            ❌ Rechazar
          </button>
        </div>` : `
        <div style="margin-top:12px;display:flex;justify-content:flex-end;">
          <button onclick="deleteSolicitud(${req.id})"
            style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:0.78rem;">
            🗑 Eliminar del historial
          </button>
        </div>`;

      return `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:16px;">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            <div>
              <div style="font-weight:700;font-size:1rem;color:#fff;">🏡 ${HOUSE_NAMES[req.houseId] || req.houseName}</div>
              <div style="font-size:0.78rem;color:rgba(255,255,255,0.45);margin-top:2px;">Solicitud recibida: ${dtStr}</div>
            </div>
            <span style="background:${st.bg};color:${st.color};border-radius:999px;padding:4px 12px;font-size:0.78rem;font-weight:700;white-space:nowrap;">${st.label}</span>
          </div>
          <!-- Data -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;font-size:0.85rem;">
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">NOMBRE</span><strong style="color:#fff;">${req.firstName || ""} ${req.lastName || ""}</strong></div>
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">PERSONAS</span><strong style="color:#fff;">${req.persons} (${req.adults} adultos, ${req.children} niños)</strong></div>
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">CHECK-IN</span><strong style="color:#fff;">${req.checkIn}</strong></div>
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">CHECK-OUT</span><strong style="color:#fff;">${req.checkOut}</strong></div>
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">NOCHES</span><strong style="color:#fff;">${nights}</strong></div>
            <div><span style="color:rgba(255,255,255,0.45);display:block;font-size:0.72rem;margin-bottom:2px;">TOTAL ESTIMADO</span><strong style="color:#a3e635;font-size:1rem;">$${total}</strong></div>
          </div>
          ${actionBtns}
        </div>`;
    }).join("");
  }

  window.acceptSolicitud = function(requestId) {
    if (!confirm("¿Aceptar esta solicitud? Las fechas quedarán bloqueadas en el calendario.")) return;
    StorageManager.acceptRequest(requestId);
    renderSolicitudes();
    updateSolicitudesBadge();
    showAdminToast("✅ Solicitud aceptada. Fechas bloqueadas.", "success");
  };

  window.rejectSolicitud = function(requestId) {
    if (!confirm("¿Rechazar esta solicitud? Las fechas seguirán disponibles.")) return;
    StorageManager.rejectRequest(requestId);
    renderSolicitudes();
    updateSolicitudesBadge();
    showAdminToast("❌ Solicitud rechazada.", "error");
  };

  window.deleteSolicitud = function(requestId) {
    StorageManager.deleteRequest(requestId);
    renderSolicitudes();
    updateSolicitudesBadge();
    showAdminToast("Solicitud eliminada del historial.", "info");
  };

  // ── Init ───────────────────────────────────────────────
  checkAuth();
});
