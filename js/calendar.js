// ============================================================
// CALENDAR.JS – Componente de Calendario Interactivo
// ============================================================

class Calendar {
  constructor(containerId, houseId, options = {}) {
    this.container = document.getElementById(containerId);
    this.houseId   = houseId;
    this.options   = options; // { onSelect, adminMode }
    this.today     = new Date();
    this.today.setHours(0,0,0,0);

    // Estado de vista
    this.viewYear  = this.today.getFullYear();
    this.viewMonth = this.today.getMonth(); // 0-indexed

    // Selección del usuario
    this.checkIn  = null;
    this.checkOut = null;
    this.selecting = false; // true = esperando check-out

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="calendar-legend">
        <div class="legend-item"><div class="legend-dot high"></div> Temporada Alta</div>
        <div class="legend-item"><div class="legend-dot low"></div> Temporada Baja</div>
        <div class="legend-item"><div class="legend-dot blocked"></div> No disponible</div>
        <div class="legend-item"><div class="legend-dot selected"></div> Seleccionado</div>
      </div>
      <div class="calendar-wrap" id="${this.container.id}_wrap"></div>
    `;
    this.renderMonth();
  }

  renderMonth() {
    const wrap = document.getElementById(`${this.container.id}_wrap`);
    const DAYS = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
    const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const lastDay  = new Date(this.viewYear, this.viewMonth + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sunday
    const totalDays = lastDay.getDate();

    let html = `
      <div class="calendar-nav">
        <button class="cal-nav-btn" id="calPrev">‹</button>
        <span class="cal-month-title">${MONTHS[this.viewMonth]} ${this.viewYear}</span>
        <button class="cal-nav-btn" id="calNext">›</button>
      </div>
      <div class="cal-grid">
        ${DAYS.map(d => `<div class="cal-day-header">${d}</div>`).join("")}
    `;

    // Celdas vacías antes del primer día
    for (let i = 0; i < startDow; i++) {
      html += `<div class="cal-day empty"></div>`;
    }

    // Días del mes
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(this.viewYear, this.viewMonth, day);
      d.setHours(12,0,0,0);
      const classes = this.getDayClasses(d);
      const dateStr = this.toDateStr(d);
      html += `<div class="cal-day ${classes}" data-date="${dateStr}">${day}</div>`;
    }

    html += `</div>`;
    wrap.innerHTML = html;

    // Eventos
    document.getElementById("calPrev").addEventListener("click", () => this.prevMonth());
    document.getElementById("calNext").addEventListener("click", () => this.nextMonth());
    wrap.querySelectorAll(".cal-day[data-date]").forEach(el => {
      el.addEventListener("click", () => this.handleDayClick(el));
      el.addEventListener("mouseover", () => this.handleDayHover(el));
    });
  }

  getDayClasses(date) {
    const classes = [];

    if (date < this.today) { classes.push("past"); return classes.join(" "); }

    // Hoy
    if (this.toDateStr(date) === this.toDateStr(this.today)) classes.push("today");

    // Temporada
    if (isHighSeason(date)) {
      classes.push("high-season-day");
    } else {
      classes.push("low-season-day");
    }

    // Ocupado / Bloqueado
    const occ = StorageManager.isDateOccupied(this.houseId, this.toDateStr(date));
    if (occ) {
      classes.push(occ.type === "blocked" ? "blocked-day" : "occupied");
    }

    // Selección
    if (this.checkIn && this.toDateStr(date) === this.toDateStr(this.checkIn)) {
      classes.push("selected-start");
    }
    if (this.checkOut && this.toDateStr(date) === this.toDateStr(this.checkOut)) {
      classes.push("selected-end");
    }
    if (this.checkIn && this.checkOut && date > this.checkIn && date < this.checkOut) {
      classes.push("in-range");
    }

    return classes.join(" ");
  }

  handleDayClick(el) {
    const dateStr = el.dataset.date;
    const date = new Date(dateStr + "T12:00:00");

    if (el.classList.contains("past") || el.classList.contains("occupied") || el.classList.contains("blocked-day")) return;

    if (!this.selecting) {
      // Primera selección: check-in
      this.checkIn  = date;
      this.checkOut = null;
      this.selecting = true;
    } else {
      // Segunda selección: check-out
      if (date <= this.checkIn) {
        // Reinicia si seleccionó antes del check-in
        this.checkIn  = date;
        this.checkOut = null;
      } else {
        // Verificar que no haya días ocupados en el rango
        if (this.hasOccupiedInRange(this.checkIn, date)) {
          showToast("No puedes seleccionar un rango con fechas ocupadas", "error");
          return;
        }
        this.checkOut  = date;
        this.selecting = false;
        if (this.options.onSelect) {
          this.options.onSelect(this.checkIn, this.checkOut);
        }
      }
    }

    this.renderMonth();
  }

  handleDayHover(el) {
    if (!this.selecting || !this.checkIn) return;
    const dateStr = el.dataset.date;
    const hoverDate = new Date(dateStr + "T12:00:00");
    if (hoverDate <= this.checkIn) return;

    // Highlight rango provisional
    const wrap = document.getElementById(`${this.container.id}_wrap`);
    wrap.querySelectorAll(".cal-day[data-date]").forEach(dayEl => {
      const d = new Date(dayEl.dataset.date + "T12:00:00");
      dayEl.classList.remove("in-range", "selected-end");
      if (d > this.checkIn && d < hoverDate) dayEl.classList.add("in-range");
      if (this.toDateStr(d) === this.toDateStr(hoverDate)) dayEl.classList.add("selected-end");
    });
  }

  hasOccupiedInRange(start, end) {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    while (d < end) {
      if (StorageManager.isDateOccupied(this.houseId, this.toDateStr(d))) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }

  prevMonth() {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; }
    else this.viewMonth--;
    this.renderMonth();
  }

  nextMonth() {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; }
    else this.viewMonth++;
    this.renderMonth();
  }

  reset() {
    this.checkIn  = null;
    this.checkOut = null;
    this.selecting = false;
    this.renderMonth();
  }

  toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
}
