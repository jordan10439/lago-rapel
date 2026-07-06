// ============================================================
// PROPERTY.JS – Lógica compartida de casa1.html y casa2.html
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const houseId = parseInt(document.body.dataset.house);
  const house   = CONFIG.houses[houseId];
  if (!house) return;

  // ── Navbar ──────────────────────────────────────────────
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 10);
  });
  document.getElementById("navToggle")?.addEventListener("click", () => {
    document.querySelector(".nav-links")?.classList.toggle("open");
  });

  // ── Cargar contenido personalizado (del admin) ───────────
  const customImg  = StorageManager.get(`custom_img_${houseId}`);
  const customDesc = StorageManager.get(`custom_desc_${houseId}`);
  const customAddr = StorageManager.get(`custom_addr_${houseId}`);

  // ── Hero ─────────────────────────────────────────────────
  const heroImg = document.getElementById("heroImg");
  if (heroImg) {
    heroImg.src = customImg || house.img;
    heroImg.alt = `Casa ${house.name}`;
  }
  const titleEl = document.getElementById("propertyTitle");
  if (titleEl) titleEl.textContent = house.name;
  const addrEl = document.getElementById("propertyAddress");
  if (addrEl) addrEl.textContent = customAddr || house.address;

  // ── Descripción ──────────────────────────────────────────
  const descEl = document.getElementById("propertyDesc");
  if (descEl) descEl.textContent = customDesc || house.description;

  // ── Amenidades ───────────────────────────────────────────
  const amenGrid = document.getElementById("amenitiesGrid");
  if (amenGrid) {
    house.amenities.forEach(am => {
      const div = document.createElement("div");
      div.className = "amenity-item";
      div.innerHTML = `<span>${am.icon}</span><span>${am.text}</span>`;
      amenGrid.appendChild(div);
    });
  }

  // ── Galería de fotos ─────────────────────────────────────
  const galleryEl = document.getElementById("photoGallery");

  // Fotos estáticas por casa (archivos en el servidor)
  const STATIC_GALLERY = {
    1: [
      "assets/img/gallery/casa1/foto1_piscina.jpg",
      "assets/img/gallery/casa1/foto2_exterior.jpg",
      "assets/img/gallery/casa1/foto3_quincho.jpg",
      "assets/img/gallery/casa1/foto4_lago.jpg",
      "assets/img/gallery/casa1/foto5_interior.jpg"
    ],
    2: [] // Casa 2 aún sin fotos reales – se agregan desde Admin
  };

  if (galleryEl) loadGallery();

  function loadGallery() {
    // Fotos estáticas del servidor
    const staticPhotos = (STATIC_GALLERY[houseId] || []).map(src => ({ data: src, static: true }));
    // Fotos subidas por admin (base64 en localStorage)
    const adminPhotos  = StorageManager.getGallery(houseId);
    const allPhotos    = [...staticPhotos, ...adminPhotos];

    if (!allPhotos.length) { galleryEl.style.display = "none"; return; }
    galleryEl.style.display = "grid";
    galleryEl.innerHTML = allPhotos.map(img => `
      <img src="${img.data}" class="gallery-thumb"
           data-full="${img.data}"
           alt="Foto ${house.name}" loading="lazy">
    `).join("");
    galleryEl.querySelectorAll(".gallery-thumb").forEach(thumb => {
      thumb.addEventListener("click", () => openLightbox(thumb.dataset.full));
    });
  }

  function openLightbox(src) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<img src="${src}" alt="Foto ampliada">
      <button class="lightbox-close">✕</button>`;
    lb.querySelector(".lightbox-close").addEventListener("click", () => lb.remove());
    lb.addEventListener("click", e => { if (e.target === lb) lb.remove(); });
    document.body.appendChild(lb);
  }

  // ── Mapa ─────────────────────────────────────────────────
  const mapAddrEl = document.getElementById("mapAddress");
  if (mapAddrEl) mapAddrEl.textContent = customAddr || house.address;

  // ── Calendar ─────────────────────────────────────────────
  const cal = new Calendar("calendarContainer", houseId, {
    onSelect: (checkIn, checkOut) => {
      // Validar mínimo 2 noches en temporada alta
      const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      // Verificar si alguna noche cae en T.Alta
      const firstNightHigh = isHighSeason(checkIn);
      if (firstNightHigh && nights < 2) {
        showToast("En temporada alta, la estadía mínima es de 2 noches. No se realizan reservas por solo 1 noche.", "error");
        cal.reset();
        return;
      }
      updatePriceSummary(checkIn, checkOut);
    }
  });

  // ── Personas ─────────────────────────────────────────────
  const adultInput = document.getElementById("adultCount");
  const childInput = document.getElementById("childCount");
  const totalEl    = document.getElementById("totalPersons");

  function getAdults()   { return Math.max(0, parseInt(adultInput?.value) || 0); }
  function getChildren() { return Math.max(0, parseInt(childInput?.value) || 0); }
  function getTotalPersons() { return getAdults() + getChildren(); }

  function onPersonsChange() {
    if (totalEl) totalEl.textContent = getTotalPersons();
    if (cal?.checkIn && cal?.checkOut) updatePriceSummary(cal.checkIn, cal.checkOut);
  }
  adultInput?.addEventListener("input",  onPersonsChange);
  adultInput?.addEventListener("change", onPersonsChange);
  childInput?.addEventListener("input",  onPersonsChange);
  childInput?.addEventListener("change", onPersonsChange);

  // ── Price Summary ─────────────────────────────────────────
  const pricePlaceholder = document.getElementById("pricePlaceholder");
  const priceSummary     = document.getElementById("priceSummary");

  function updatePriceSummary(checkIn, checkOut) {
    const adults   = getAdults();
    const children = getChildren();
    const persons  = adults + children;
    if (persons === 0) { showToast("Ingresa al menos 1 persona", "warning"); return; }

    const result = calculatePrice(checkIn, checkOut, persons, houseId);
    if (!result || result.nights <= 0) return;

    if (pricePlaceholder) pricePlaceholder.style.display = "none";
    if (!priceSummary) return;
    priceSummary.style.display = "block";

    let highNights = 0, lowNights = 0;
    result.breakdown.forEach(n => n.high ? highNights++ : lowNights++);
    const extraP = result.extraPersons;

    let html = "";

    // Low season rows
    if (lowNights > 0) {
      const baseTotal  = CONFIG.pricing.lowSeason.base * lowNights;
      const extraTotal = extraP * CONFIG.pricing.lowSeason.extraPerson * lowNights;
      html += `<div class="price-summary-row">
        <span>🟢 Valor base (hasta 8 personas)</span>
        <span>${formatCLP(CONFIG.pricing.lowSeason.base)} &times; ${lowNights} noche(s)</span>
      </div>
      <div class="price-summary-row ps-sub">
        <span></span>
        <span>${formatCLP(baseTotal)}</span>
      </div>`;
      if (extraP > 0) {
        html += `<div class="price-summary-row ps-extra">
          <span>&nbsp;+ ${extraP} persona(s) adicional(es) &times; ${formatCLP(CONFIG.pricing.lowSeason.extraPerson)} &times; ${lowNights} noche(s)</span>
          <span>${formatCLP(extraTotal)}</span>
        </div>`;
      }
    }

    // High season rows
    if (highNights > 0) {
      if (lowNights > 0) html += `<div class="price-summary-sep"></div>`;
      const baseTotal  = CONFIG.pricing.highSeason.base * highNights;
      const extraTotal = extraP * CONFIG.pricing.highSeason.extraPerson * highNights;
      html += `<div class="price-summary-row">
        <span>🔴 Valor base (hasta 8 personas)</span>
        <span>${formatCLP(CONFIG.pricing.highSeason.base)} &times; ${highNights} noche(s)</span>
      </div>
      <div class="price-summary-row ps-sub">
        <span></span>
        <span>${formatCLP(baseTotal)}</span>
      </div>`;
      if (extraP > 0) {
        html += `<div class="price-summary-row ps-extra">
          <span>&nbsp;+ ${extraP} persona(s) adicional(es) &times; ${formatCLP(CONFIG.pricing.highSeason.extraPerson)} &times; ${highNights} noche(s)</span>
          <span>${formatCLP(extraTotal)}</span>
        </div>`;
      }
    }

    html += `<div class="price-summary-total">
      <span>💰 TOTAL (${result.nights} noches · ${persons} personas)</span>
      <span>${formatCLP(result.total)}</span>
    </div>`;

    priceSummary.innerHTML = html;

    // Update hidden fields
    const ciEl = document.getElementById("formCheckIn");
    const coEl = document.getElementById("formCheckOut");
    if (ciEl) ciEl.value = toISODate(checkIn);
    if (coEl) coEl.value = toISODate(checkOut);
    if (totalEl) totalEl.textContent = persons;
  }

  // ── Booking Form ─────────────────────────────────────────
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", e => {
      e.preventDefault();

      const checkIn  = cal?.checkIn;
      const checkOut = cal?.checkOut;
      if (!checkIn || !checkOut) {
        showToast("Por favor selecciona las fechas en el calendario", "error");
        return;
      }

      const adults   = getAdults();
      const children = getChildren();
      const persons  = adults + children;
      if (persons === 0) {
        showToast("Ingresa al menos 1 persona", "error");
        return;
      }

      const firstName = document.getElementById("guestFirstName")?.value?.trim();
      const lastName  = document.getElementById("guestLastName")?.value?.trim();
      if (!firstName || !lastName) {
        showToast("Ingresa tu nombre y apellido", "error");
        return;
      }

      const result = calculatePrice(checkIn, checkOut, persons, houseId);

      // Validar mínimo 2 noches en temporada alta (doble check antes de enviar)
      const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (isHighSeason(checkIn) && nights < 2) {
        showToast("En temporada alta, la estadía mínima es de 2 noches.", "error");
        return;
      }

      // Guardar como SOLICITUD (no bloquea fechas hasta que admin acepte)
      const request = {
        houseId,
        houseName:    house.name,
        houseAddress: house.address,
        guestName:    `${firstName} ${lastName}`,
        firstName, lastName,
        checkIn:      toISODate(checkIn),
        checkOut:     toISODate(checkOut),
        nights,
        adults, children, persons,
        totalPrice:   result?.total || 0
      };
      StorageManager.addRequest(request);

      // Construir mensaje WhatsApp
      const adultsLabel   = `${adults} adulto${adults !== 1 ? "s" : ""}`;
      const childrenLabel = children > 0 ? `, ${children} niño${children !== 1 ? "s" : ""}` : "";
      const msg = encodeURIComponent(
        `Hola, quiero solicitar una reserva.\n` +
        `Casa: ${house.address}\n` +
        `Nombre: ${firstName} ${lastName}\n` +
        `Cantidad de personas: ${persons} (${adultsLabel}${childrenLabel})\n` +
        `Fecha de ingreso: ${formatDateCL(checkIn)}\n` +
        `Fecha de salida: ${formatDateCL(checkOut)}\n` +
        `Total estimado: ${formatCLP(result?.total || 0)}\n\n` +
        `Entiendo que la reserva se confirma una vez enviado y validado el comprobante de pago del abono de $100.000.`
      );

      showToast("✅ Solicitud guardada. Abriendo WhatsApp...", "success");

      // Reset
      bookingForm.reset();
      cal.reset();
      if (priceSummary)     priceSummary.style.display = "none";
      if (pricePlaceholder) pricePlaceholder.style.display = "block";
      if (totalEl) totalEl.textContent = "0";

      setTimeout(() => {
        window.open(`https://wa.me/${CONFIG.contact.whatsapp}?text=${msg}`, "_blank");
      }, 700);
    });
  }

  // ── FAQ ──────────────────────────────────────────────────
  const faqList = document.getElementById("faqList");
  if (faqList) {
    CONFIG.faqs.forEach(faq => {
      const item = document.createElement("div");
      item.className = "faq-item";
      item.innerHTML = `
        <div class="faq-question">
          <span class="faq-question-text">${faq.q}</span>
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-inner">${faq.a}</div>
        </div>`;
      item.querySelector(".faq-question").addEventListener("click", () => {
        const open = item.classList.contains("open");
        faqList.querySelectorAll(".faq-item.open").forEach(el => el.classList.remove("open"));
        if (!open) item.classList.add("open");
      });
      faqList.appendChild(item);
    });
  }
});
