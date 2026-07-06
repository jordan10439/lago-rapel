// ============================================================
// CONFIG.JS – Configuración central Lago Rapel
// ============================================================

const CONFIG = {

  // ── Datos de las propiedades ─────────────────────────────
  houses: {
    1: {
      id: 1,
      name: "Casa 1",
      displayName: "Santa Eliana 294",
      type: "casa",
      slug: "casa1",
      pageUrl: "casa1.html",
      address: "Santa Eliana 294, Llallauquén, Lago Rapel",
      mapsLink: "https://maps.app.goo.gl/ZRKbMKAkWGutcPvq6",
      img: "assets/img/gallery/casa1/foto1_piscina.jpg",
      description: "Acogedora casa ubicada en Santa Eliana 294, Llallauquén. Casa individual, no compartida, con terreno propio, 2 baños, piscina privada y acceso directo al Lago Rapel. Amplio jardín y espacios para disfrutar en familia.",
      amenities: [
        { icon: "🛏️", text: "Dormitorios cómodos" },
        { icon: "🚿", text: "2 baños" },
        { icon: "🍳", text: "Cocina equipada" },
        { icon: "🏊", text: "Piscina privada" },
        { icon: "🌊", text: "Acceso al lago" },
        { icon: "🔥", text: "Quincho / parrilla" },
        { icon: "📶", text: "WiFi" },
        { icon: "🌿", text: "Jardín amplio" },
        { icon: "🅿️", text: "Estacionamiento" },
        { icon: "🏡", text: "Casa individual, no compartida" }
      ]
    },
    2: {
      id: 2,
      name: "Cabaña 1",
      displayName: "Santa Eliana 353 – Cabaña 1",
      type: "cabana",
      slug: "cabana1",
      pageUrl: "cabana1.html",
      address: "Santa Eliana 353, Llallauquén, Lago Rapel",
      mapsLink: "https://maps.app.goo.gl/AcaYcqvj52dAUehs5",
      img: "assets/img/casa2_exterior.png",
      description: "Cabaña independiente ubicada en Santa Eliana 353, frente al lago. Forma parte de un terreno con dos cabañas independientes. Cada cabaña cuenta con su propio quincho y espacios privados. Solo se comparte la piscina, patios y algunos espacios comunes. Totalmente renovada este año, hecha nuevamente y con todo nuevo.",
      amenities: [
        { icon: "🛏️", text: "Dormitorios cómodos" },
        { icon: "🚿", text: "1 Baño" },
        { icon: "🍳", text: "Cocina equipada" },
        { icon: "🏊", text: "Piscina compartida (terreno)" },
        { icon: "🌊", text: "Lago al frente" },
        { icon: "🔥", text: "Quincho propio privado" },
        { icon: "📶", text: "WiFi" },
        { icon: "🌿", text: "Patios y espacios comunes" },
        { icon: "🅿️", text: "Estacionamiento" },
        { icon: "🏡", text: "Cabaña independiente, totalmente renovada" }
      ]
    },
    3: {
      id: 3,
      name: "Cabaña 2",
      displayName: "Santa Eliana 353 – Cabaña 2",
      type: "cabana",
      slug: "cabana2",
      pageUrl: "cabana2.html",
      address: "Santa Eliana 353, Llallauquén, Lago Rapel",
      mapsLink: "https://maps.app.goo.gl/AcaYcqvj52dAUehs5",
      img: "assets/img/casa2_exterior.png",
      description: "Cabaña independiente ubicada en Santa Eliana 353, frente al lago. Forma parte de un terreno con dos cabañas independientes. Cada cabaña cuenta con su propio quincho y espacios privados. Solo se comparte la piscina, patios y algunos espacios comunes. Totalmente renovada este año, hecha nuevamente y con todo nuevo.",
      amenities: [
        { icon: "🛏️", text: "Dormitorios cómodos" },
        { icon: "🚿", text: "1 Baño" },
        { icon: "🍳", text: "Cocina equipada" },
        { icon: "🏊", text: "Piscina compartida (terreno)" },
        { icon: "🌊", text: "Lago al frente" },
        { icon: "🔥", text: "Quincho propio privado" },
        { icon: "📶", text: "WiFi" },
        { icon: "🌿", text: "Patios y espacios comunes" },
        { icon: "🅿️", text: "Estacionamiento" },
        { icon: "🏡", text: "Cabaña independiente, totalmente renovada" }
      ]
    }
  },

  // ── Precios ──────────────────────────────────────────────
  pricing: {
    highSeason:  { base: 100000, extraPerson: 10000 },
    lowSeason:   { base: 70000,  extraPerson: 5000  },
    maxIncluded: 8
  },

  // ── Temporada Alta (automática) ──────────────────────────
  highSeasonMonths: [12, 1, 2],

  // ── Admin ─────────────────────────────────────────────────
  admin: { user: "admin", pass: "rapel2025" },

  // ── Contacto ─────────────────────────────────────────────
  contact: {
    whatsapp: "56962849942",
    email:    "contacto@lagorapel.cl"
  },

  // ── Horarios ─────────────────────────────────────────────
  checkinHour:  "12:00",
  checkoutHour: "12:00",

  // ── FAQ ──────────────────────────────────────────────────
  faqs: [
    {
      q: "¿Por qué ese precio por noche?",
      a: `El precio refleja los costos reales de mantener la propiedad operativa para cada estadía:
        <ul>
          <li>💡 <strong>Luz:</strong> el consumo eléctrico sube considerablemente con el uso</li>
          <li>💧 <strong>Agua:</strong> duchas, piscina, jardín</li>
          <li>🔥 <strong>Gas:</strong> ducha caliente, cocina</li>
          <li>🏊 <strong>Productos de piscina:</strong> cloro y mantenimiento</li>
          <li>⛽ <strong>Bencina:</strong> cortadora de pasto</li>
          <li>🧹 <strong>Persona que limpia la casa</strong> después de cada estadía</li>
          <li>✂️ <strong>Persona que mantiene el pasto y jardín</strong></li>
          <li>🏊 <strong>Persona que mantiene la piscina</strong></li>
        </ul>
        Queremos ser transparentes: el arriendo cubre estos costos operativos reales.`
    },
    {
      q: "¿Por qué se cobran los niños igual que los adultos?",
      a: `Los niños generan los mismos —o más— costos operativos que los adultos:
        <ul>
          <li>🚿 <strong>Duchas:</strong> consumen gas y agua igual que un adulto</li>
          <li>🏊 <strong>Piscina:</strong> los niños son quienes más usan la piscina, generando mayor consumo de cloro y mantenimiento</li>
          <li>💧 <strong>Agua y gas:</strong> el consumo se calcula por uso, no por edad</li>
        </ul>
        Por eso, adultos y niños se contabilizan por igual.`
    },
    {
      q: "¿La Casa 1 y las Cabañas son el mismo terreno?",
      a: `<strong>No.</strong> Son propiedades <strong>completamente separadas</strong>:<br><br>
        <ul>
          <li>🏠 <strong>Casa 1 – Santa Eliana 294:</strong> casa individual, terreno propio, piscina privada, acceso al lago. No comparte nada con nadie.</li>
          <li>🏡 <strong>Cabaña 1 y Cabaña 2 – Santa Eliana 353:</strong> dos cabañas independientes dentro del mismo terreno, frente al lago. Comparten piscina y patios entre sí, pero cada cabaña tiene quincho propio y espacios privados.</li>
        </ul>`
    },
    {
      q: "¿Cuántas personas puede alojar cada propiedad?",
      a: `Cada propiedad tiene un <strong>máximo de 8 personas</strong> incluidas en el precio base.<br><br>
        Si el grupo supera las 8 personas, se cobra un cargo adicional por cada persona extra:
        <ul>
          <li>🔴 <strong>Temporada Alta:</strong> +$10.000 por persona extra por noche</li>
          <li>🟢 <strong>Temporada Baja:</strong> +$5.000 por persona extra por noche</li>
        </ul>
        Adultos y niños se contabilizan por igual.`
    },
    {
      q: "¿Hay descuentos o precios especiales?",
      a: `<strong>No.</strong> El valor publicado en la página es el precio final. <strong>No se realizan precios especiales ni descuentos personalizados.</strong><br><br>
        El precio se calcula automáticamente según:
        <ul>
          <li>📅 Las fechas seleccionadas (temporada alta o baja)</li>
          <li>🌙 La cantidad de noches</li>
          <li>👥 La cantidad de personas (base hasta 8, extras con cobro adicional)</li>
        </ul>
        Esta política es igual para todos los arrendatarios.`
    },
    {
      q: "¿Cómo funciona la reserva?",
      a: `El proceso es simple:
        <ol>
          <li>Selecciona la propiedad que te interesa</li>
          <li>Elige tus fechas en el calendario (🔴 rojo = temporada alta, 🟢 verde = temporada baja)</li>
          <li>Ingresa nombre, apellido y cantidad de personas</li>
          <li>Revisa el precio total calculado automáticamente</li>
          <li>Presiona <strong>"Confirmar Reserva"</strong> para enviar la solicitud por WhatsApp</li>
          <li>Transfiere el <strong>abono de $100.000</strong> y envía el comprobante por WhatsApp</li>
          <li>La reserva queda confirmada una vez validado el comprobante</li>
        </ol>`
    }
  ]
};

// ── isHighSeason ─────────────────────────────────────────────────────────────

/**
 * Determina si una fecha (objeto Date) es temporada alta.
 * Primero revisa overrides manuales del admin, luego las reglas automáticas.
 */
function isHighSeason(date) {
  const dateStr = toISODate(date);

  // 1. Override manual del admin (tiene prioridad)
  const overrides = StorageManager.getSeasonOverrides();
  if (overrides[dateStr] !== undefined) {
    return overrides[dateStr] === "high";
  }

  const month = date.getMonth() + 1;
  const day   = date.getDate();

  // 2. Verano chileno (dic, ene, feb)
  if (CONFIG.highSeasonMonths.includes(month)) return true;

  // 3. Semana del 18 de Septiembre (14-22 sep)
  if (month === 9 && day >= 14 && day <= 22) return true;

  // 4. Semana Santa configurada por admin
  const santaWeeks = StorageManager.get("semanaSanta") || [];
  for (const sw of santaWeeks) {
    const start = new Date(sw.start + "T00:00:00");
    const end   = new Date(sw.end   + "T23:59:59");
    if (date >= start && date <= end) return true;
  }

  return false;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function formatCLP(n) {
  return "$" + Number(n).toLocaleString("es-CL");
}

function formatDateCL(date) {
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Calcula el precio total para un rango de fechas y cantidad de personas.
 * Retorna null si el rango es inválido.
 */
function calculatePrice(checkIn, checkOut, persons, houseId) {
  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  if (nights <= 0) return null;

  let total = 0;
  const breakdown = [];
  const extraPersons = Math.max(0, persons - CONFIG.pricing.maxIncluded);

  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn.getTime());
    d.setDate(d.getDate() + i);
    const high    = isHighSeason(d);
    const pricing = high ? CONFIG.pricing.highSeason : CONFIG.pricing.lowSeason;
    const base    = pricing.base;
    const extras  = extraPersons * pricing.extraPerson;
    const nightPrice = base + extras;
    breakdown.push({ date: new Date(d), high, base, extras, nightPrice });
    total += nightPrice;
  }

  return { nights, breakdown, total, extraPersons };
}
