// ============================================================
// STORAGE.JS – LocalStorage wrapper para Lago Rapel
// ============================================================

const StorageManager = {
  PREFIX: "lagorapel_",

  set(key, value) {
    try { localStorage.setItem(this.PREFIX + key, JSON.stringify(value)); }
    catch(e) { console.warn("Storage error:", e); }
  },

  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item !== null ? JSON.parse(item) : fallback;
    } catch(e) { return fallback; }
  },

  remove(key) { localStorage.removeItem(this.PREFIX + key); },

  // ── Solicitudes de reserva (PENDIENTES – no bloquean fechas) ──
  // status: "pending" | "accepted" | "rejected"
  getAllRequests()  { return this.get("requests", []); },
  addRequest(request) {
    const list = this.getAllRequests();
    request.id        = Date.now();
    request.createdAt = new Date().toISOString();
    request.status    = "pending";
    list.push(request);
    this.set("requests", list);
    return request;
  },
  acceptRequest(requestId) {
    const list = this.getAllRequests();
    const req  = list.find(r => r.id === requestId);
    if (!req) return;
    req.status     = "accepted";
    req.acceptedAt = new Date().toISOString();
    this.set("requests", list);
    // Ahora sí bloquear las fechas
    this.addBlockedRange(req.houseId, {
      start:     req.checkIn,
      end:       req.checkOut,
      reason:    `Reserva: ${req.guestName}`,
      requestId: requestId
    });
  },
  rejectRequest(requestId) {
    const list = this.getAllRequests();
    const req  = list.find(r => r.id === requestId);
    if (!req) return;
    req.status     = "rejected";
    req.rejectedAt = new Date().toISOString();
    this.set("requests", list);
    // Las fechas siguen disponibles (no se bloquean)
  },
  deleteRequest(requestId) {
    const list = this.getAllRequests().filter(r => r.id !== requestId);
    this.set("requests", list);
  },

  // ── Reservas confirmadas (historial) ──────────────────────
  // Ya no se usan para bloquear fechas – solo para historial
  getReservations(houseId)   { return this.get(`reservations_${houseId}`, []); },
  addReservation(houseId, reservation) {
    const list = this.getReservations(houseId);
    reservation.id        = Date.now();
    reservation.createdAt = new Date().toISOString();
    list.push(reservation);
    this.set(`reservations_${houseId}`, list);
    return reservation;
  },
  deleteReservation(houseId, reservationId) {
    const list = this.getReservations(houseId).filter(r => r.id !== reservationId);
    this.set(`reservations_${houseId}`, list);
  },

  // ── Fechas bloqueadas (solo se agregan al ACEPTAR solicitud) ──
  getBlockedDates(houseId)   { return this.get(`blocked_${houseId}`, []); },
  addBlockedRange(houseId, range) {
    const list = this.getBlockedDates(houseId);
    range.id = Date.now();
    list.push(range);
    this.set(`blocked_${houseId}`, list);
  },
  deleteBlockedRange(houseId, rangeId) {
    const list = this.getBlockedDates(houseId).filter(r => r.id !== rangeId);
    this.set(`blocked_${houseId}`, list);
  },

  // ── Semana Santa ─────────────────────────────────────────
  getSemanaSanta()     { return this.get("semanaSanta", []); },
  setSemanaSanta(list) { this.set("semanaSanta", list); },

  // ── Season overrides (ajustes manuales de admin) ─────────
  getSeasonOverrides()         { return this.get("seasonOverrides", {}); },
  setSeasonOverride(dateStr, type) {
    const overrides = this.getSeasonOverrides();
    if (!type) { delete overrides[dateStr]; }
    else        { overrides[dateStr] = type; }
    this.set("seasonOverrides", overrides);
  },
  clearAllSeasonOverrides()    { this.set("seasonOverrides", {}); },

  // ── Galería de fotos por casa ─────────────────────────────
  getGallery(houseId)    { return this.get(`gallery_${houseId}`, []); },
  addGalleryImage(houseId, base64) {
    const gallery = this.getGallery(houseId);
    gallery.push({ id: Date.now(), data: base64 });
    this.set(`gallery_${houseId}`, gallery);
  },
  removeGalleryImage(houseId, imageId) {
    const gallery = this.getGallery(houseId).filter(img => img.id !== imageId);
    this.set(`gallery_${houseId}`, gallery);
  },

  // ── Sesión admin ─────────────────────────────────────────
  setAdminSession()   { this.set("adminSession", { ts: Date.now() }); },
  isAdminLoggedIn()   {
    const s = this.get("adminSession");
    if (!s) return false;
    return (Date.now() - s.ts) < 8 * 60 * 60 * 1000; // 8 horas
  },
  clearAdminSession() { this.remove("adminSession"); },

  // ── ¿Está ocupada esta fecha? ────────────────────────────
  // Solo considera fechas BLOQUEADAS (solicitudes aceptadas)
  // Las solicitudes pendientes NO bloquean fechas
  isDateOccupied(houseId, dateStr) {
    const d = new Date(dateStr + "T12:00:00");

    for (const b of this.getBlockedDates(houseId)) {
      const s = new Date(b.start + "T12:00:00");
      const e = new Date(b.end   + "T12:00:00");
      if (d >= s && d < e) return { type: "blocked", label: b.reason || "Reservado" };
    }

    return null;
  }
};
