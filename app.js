import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. CONFIGURACIÓN DE FIREBASE (geomapa-anillo-vial-peru)
const firebaseConfig = {
  apiKey: "AIzaSyBMQkYlsGnUFRUW525jjHGCkO1YjFn-_b4",
  authDomain: "geomapa-anillo-vial-peru.firebaseapp.com",
  projectId: "geomapa-anillo-vial-peru",
  storageBucket: "geomapa-anillo-vial-peru.firebasestorage.app",
  messagingSenderId: "531559068142",
  appId: "1:531559068142:web:f984204182111da1c15eff",
  measurementId: "G-X0FSRK7RBJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 2. BENEFICIOS OPERATIVOS POR DISTRITO (CON COLORES PASTEL DE TRAMO E ÍCONOS)
const BENEFICIOS_DISTRITOS = {
  "CALLAO": {
    titulo: "Provincia Constitucional del Callao",
    tramo: "Tramo I • Óvalo 200 Millas / Av. Néstor Gambetta",
    bgPastel: "#fef3c7",
    resumen: "Consolidación como puerta logística internacional del Perú con conectividad expresa sin semáforos hacia el Puerto del Callao y el nuevo Aeropuerto Jorge Chávez.",
    tarjetas: [
      { ico: "🛫", texto: "Intercambios Viales de alta capacidad en Néstor Gambetta (km 0+550) y Elmer Faucett (km 1+555)." },
      { ico: "🚛", texto: "Separación ordenada del transporte de carga logística respecto al tránsito vecinal de Oquendo y Bocanegra." },
      { ico: "🛣️", texto: "Vías laterales libres de peaje renovadas para la movilidad local y pasos peatonales cada 500 metros." }
    ]
  },
  "SAN MARTIN DE PORRES": {
    titulo: "San Martín de Porres",
    tramo: "Tramo I • Eje Av. Canta Callao",
    bgPastel: "#fef3c7",
    resumen: "Permeabilidad vial transversal y reducción sustancial de tiempos de viaje entre Lima Norte, el Callao y Lima Este.",
    tarjetas: [
      { ico: "🌉", texto: "Intercambio Vial Canta Callao (km 5+800) y pasos a desnivel en Bertello (km 2+100), Carlos Izaguirre (km 3+200) y Los Alisos (km 4+500)." },
      { ico: "⚡", texto: "Conexión rápida para zonas residenciales e industriales livianas sin cruzar el centro congestionado." },
      { ico: "🛡️", texto: "Vías auxiliares gratuitas y gestión de tráfico inteligente (ITS) con monitoreo permanente." }
    ]
  },
  "LOS OLIVOS": {
    titulo: "Los Olivos",
    tramo: "Tramo I • Eje Av. Naranjal / Universitaria",
    bgPastel: "#fef3c7",
    resumen: "Potenciación como centro comercial, universitario y de servicios de Lima Norte con acceso directo a toda la red metropolitana.",
    tarjetas: [
      { ico: "🎓", texto: "Intercambios Viales en Av. Universitaria (km 7+050) y Panamericana Norte (km 8+250)." },
      { ico: "🚗", texto: "Pasos a desnivel en Próceres de Huandoy (km 6+300) y Las Palmeras (km 7+500) que ordenan el flujo local." },
      { ico: "⏱️", texto: "Conexión directa de estudiantes y comercios hacia San Juan de Lurigancho y Lima Este en menos de 20 minutos." }
    ]
  },
  "INDEPENDENCIA": {
    titulo: "Independencia",
    tramo: "Articulación Tramo I y Tramo II",
    bgPastel: "#ffedd5",
    resumen: "Nodo estratégico de integración multimodal entre el sistema troncal del Metropolitano y la nueva autopista periférica.",
    tarjetas: [
      { ico: "🚌", texto: "Articulación directa en Panamericana Norte y paso a desnivel en Av. Túpac Amaru (km 8+900)." },
      { ico: "🏢", texto: "Descompresión del eje comercial e institucional mediante vías expresas y calzadas laterales gratuitas." },
      { ico: "🌐", texto: "Acceso rápido hacia el Aeropuerto Jorge Chávez y los polos industriales de Lima Este." }
    ]
  },
  "COMAS": {
    titulo: "Comas",
    tramo: "Tramo II • Conexión Portal Túnel 1",
    bgPastel: "#ffedd5",
    resumen: "Ruptura de la barrera geográfica histórica entre Lima Norte y San Juan de Lurigancho mediante ingeniería subterránea.",
    tarjetas: [
      { ico: "🚇", texto: "Acceso directo al Túnel 1 (2,285 m de longitud), conectando Comas con San Juan de Lurigancho en minutos." },
      { ico: "🛣️", texto: "Pasos a desnivel en Huamachuco (km 9+900) y José G. Condorcanqui (km 11+100)." },
      { ico: "📈", texto: "Revalorización urbana y dinamización comercial de los ejes articulados al corredor." }
    ]
  },
  "SAN JUAN DE LURIGANCHO": {
    titulo: "San Juan de Lurigancho",
    tramo: "Tramo II • Corredor Central y Túneles 1 y 2",
    bgPastel: "#ffedd5",
    resumen: "El mayor salto en conectividad urbana de Lima: apertura de dos salidas expresas de alta capacidad hacia Lima Norte y Lima Este.",
    tarjetas: [
      { ico: "🚇", texto: "Túnel 1 (2,285 m) hacia Comas/Panamericana Norte y Túnel 2 (1,935 m) hacia Ramiro Prialé." },
      { ico: "🌉", texto: "Viaducto Av. El Sol (1,412 m), IVD Próceres de la Independencia (km 15+050, conexión Línea 1) y 8 pasos a desnivel." },
      { ico: "🚶", texto: "Vías laterales libres de peaje y puentes peatonales que integran Canto Grande, San Carlos y Campoy." }
    ]
  },
  "LURIGANCHO": {
    titulo: "Lurigancho - Chosica (Huachipa / Nievería)",
    tramo: "Articulación Tramo II y Tramo III",
    bgPastel: "#ffedd5",
    resumen: "Impulso al polo agroindustrial y logístico de Lima Este junto con una intervención emblemática de recuperación ambiental.",
    tarjetas: [
      { ico: "🌱", texto: "Remediación ambiental definitiva y recuperación del ex vertedero La Vizcachera, eliminando un pasivo histórico." },
      { ico: "🏭", texto: "Conexión directa con Autopista Ramiro Prialé (IVD km 23+900) y el Puerto del Callao para transporte productivo." },
      { ico: "🏗️", texto: "Infraestructura vial moderna ejecutada bajo estándares ambientales y sociales internacionales." }
    ]
  },
  "EL AGUSTINO": {
    titulo: "El Agustino",
    tramo: "Tramo III • Eje Río Rímac / Vía de Evitamiento",
    bgPastel: "#e0f2fe",
    resumen: "Integración vial moderna en la ribera del Rímac y ordenamiento del tránsito de paso mediante estructuras a desnivel.",
    tarjetas: [
      { ico: "🌊", texto: "Cruce moderno sobre el Río Rímac (km 23+950 al 24+150) y enlace con IVD Ramiro Prialé y Evitamiento." },
      { ico: "🚦", texto: "Pasos a desnivel que separan el tránsito metropolitano de largo recorrido de las calles vecinales." },
      { ico: "💡", texto: "Mejora integral en seguridad vial, iluminación LED y accesibilidad peatonal." }
    ]
  },
  "SANTA ANITA": {
    titulo: "Santa Anita",
    tramo: "Tramo III • Nodo Logístico Carretera Central",
    bgPastel: "#e0f2fe",
    resumen: "Consolidación como principal centro de abastecimiento y logística de Lima con conexión directa al puerto y aeropuerto.",
    tarjetas: [
      { ico: "🚆", texto: "Sinergia multimodal con la Línea 2 del Metro de Lima, IVD Carretera Central (km 27+150) y Cruce FFCC Central (km 25+200)." },
      { ico: "📦", texto: "Acceso logístico directo para el Gran Mercado Mayorista sin saturar las avenidas locales." },
      { ico: "🌉", texto: "Pasos a desnivel en San Pablo (km 24+700), Av. San Juan (km 25+200) y Metropolitana (km 25+900)." }
    ]
  },
  "ATE": {
    titulo: "Ate",
    tramo: "Tramo III • Eje Separadora Industrial",
    bgPastel: "#e0f2fe",
    resumen: "Revalorización urbana, modernización industrial y creación de nuevos espacios públicos verdes para los vecinos.",
    tarjetas: [
      { ico: "🌳", texto: "Creación del Parque Lineal de Separadora Industrial: paisajismo, áreas verdes y zonas recreativas." },
      { ico: "🏭", texto: "Intercambio Vial Huarochirí (km 28+800) y pasos a desnivel en Asturias (km 28+300) y Santa Rosa (km 32+100)." },
      { ico: "🛣️", texto: "Vías auxiliares gratuitas que ordenan el transporte local y potencian el corredor empresarial." }
    ]
  },
  "LA MOLINA": {
    titulo: "La Molina",
    tramo: "Tramo III • Eje Av. La Molina / Los Frutales",
    bgPastel: "#e0f2fe",
    resumen: "Solución estructural de conectividad rápida hacia Lima Norte, el Aeropuerto Jorge Chávez y el eje centro-sur.",
    tarjetas: [
      { ico: "⚡", texto: "Intercambio Vial Av. La Molina (km 30+050) y pasos a desnivel en Los Ingenieros (km 29+700) y Los Frutales (km 31+200)." },
      { ico: "🏫", texto: "Alternativa vial expresa de alta velocidad para residentes, universidades y centros empresariales." },
      { ico: "⏱️", texto: "Reducción significativa de tiempos de desplazamiento hacia el norte y oeste de la capital." }
    ]
  },
  "SAN LUIS": {
    titulo: "San Luis",
    tramo: "Tramo III • Cierre en Av. Circunvalación",
    bgPastel: "#e0f2fe",
    resumen: "Punto estratégico de cierre del anillo en su empalme con la Av. Circunvalación y la red vial del centro-sur de Lima.",
    tarjetas: [
      { ico: "🔄", texto: "Intercambio Vial Circunvalación (km 34+400) y paso a desnivel en Av. Las Torres (km 33+900)." },
      { ico: "🚗", texto: "Ordenamiento del tránsito comercial y conexión fluida con Vía de Evitamiento." },
      { ico: "🗺️", texto: "Integración directa del distrito con toda la red periférica metropolitana de 34.8 km." }
    ]
  }
};

// 3. ESCENARIOS DE GESTIÓN PREDIAL E INTERFERENCIAS (LÍNEA DE TIEMPO GRÁFICA)
const ESCENARIOS_GESTION = {
  trato_directo: {
    plazo: "Plazo Referencial: 4 a 6 meses (Meta Tramo I: Mes 24 | Tramo III: Mes 28)",
    pasos: [
      "Diagnóstico Técnico-Legal (DTL-S) y Expediente Técnico-Legal (ETL)",
      "Tasación comercial oficial (DGPRVU) + Incentivo legal del 20%",
      "Notificación de oferta formal, aceptación y suscripción de escritura",
      "Pago directo e inscripción registral / Entrega de área libre a obra"
    ]
  },
  expropiacion: {
    plazo: "Plazo Referencial: 8 a 14 meses (96% concentrado en Tramo II)",
    pasos: [
      "Emisión de Resolución Ministerial aprobando tasación y sujeto pasivo",
      "Consignación del valor de tasación en el Banco de la Nación",
      "Inscripción preventiva/definitiva a favor del MTC en SUNARP",
      "Ejecución coactiva y aplicación de programas sociales BID/BM"
    ]
  },
  telecom: {
    plazo: "Plazo Referencial: 6 a 13 meses (Convenios Tramo I vigentes a 13m)",
    pasos: [
      "Catastro en campo y verificación de redes aéreas/subterráneas",
      "Suscripción de Convenio Específico entre Concedente y Operadora",
      "Aprobación de ingeniería de traslado y canalización subterránea",
      "Migración de fibra óptica en ventana de corte y liberación de frente"
    ]
  },
  saneamiento: {
    plazo: "Plazo Referencial: 10 a 18 meses (SEDAPAL, Pluz Energía, Luz del Sur)",
    pasos: [
      "Factibilidad técnica y aprobación de proyecto de reubicación de redes",
      "Aprobación de presupuesto y transferencia financiera al prestador",
      "Ejecución de obra civil de variante/desvío de matriz o línea AT/MT",
      "Empalme programado, pruebas hidráulicas/eléctricas y puesta en servicio"
    ]
  }
};

// 4. INICIALIZACIÓN DE MAPA (GOOGLE MAPS GRIS + SOLO TRAMOS ACTIVOS AL INICIO)
let map;
const layerGroups = {};
const DISTRITOS_OBJETIVO = new Set(Object.keys(BENEFICIOS_DISTRITOS));

function normalizarDistrito(nombre) {
  if (!nombre) return "";
  return nombre.toString().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace("LURIGANCHO-CHOSICA", "LURIGANCHO")
    .trim();
}

function crearIconoSVG(texto, bg, color, size = 24) {
  return L.divIcon({
    className: "",
    html: `<div class="struct-badge-icon" style="width:${size}px;height:${size}px;background:${bg};color:${color};">${texto}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([-12.015, -77.025], 11);

  // Mapa base Google Maps en escala de grises limpia (sin marcas de agua)
  L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    attribution: "&copy; Google Maps | Geoportal AVP - Ing. Vladimir Casas",
    maxZoom: 20,
    className: "google-gray-tiles"
  }).addTo(map);

  // Cargar SOLO los 3 ejes troncales activos al iniciar + etiquetas de tramo
  cargarLinea("tramo1", "data/TRAZO TRAMO I.geojson", "#f59e0b", "Tramo I (8.7 km) — Callao a Panamericana Norte", "Tramo 1 • 8.7 km", "lbl-t1", true);
  cargarLinea("tramo2", "data/TRAZO TRAMO II.geojson", "#ea580c", "Tramo II (15.1 km) — Panamericana Norte a Ramiro Prialé", "Tramo 2 • 15.1 km", "lbl-t2", true);
  cargarLinea("tramo3", "data/TRAZO TRAMO III.geojson", "#0284c7", "Tramo III (11.0 km) — Ramiro Prialé a Circunvalación", "Tramo 3 • 11.0 km", "lbl-t3", true);

  // Precargar capas secundarias APAGADAS por defecto (se encienden al marcar su checkbox)
  cargarDistritos(false);
  cargarPoligono("derechoVia", "data/DERECHO DE VIA.geojson", { color: "#7c3aed", weight: 1.5, fillColor: "#8b5cf6", fillOpacity: 0.35 }, "Derecho de Vía Oficial (R.M. N.° 869-2025-MTC/01.02)", false);
  cargarPuntos("ivd", "data/INTERCAMBIOS VIALES.geojson", "IV", "#facc15", "#713f12", "Intercambio Vial (IVD)", false);
  cargarPuntos("bypass", "data/PASO DESNIVEL.geojson", "BP", "#ef4444", "#ffffff", "Paso a Desnivel (Bypass)", false);
  cargarTuneles("tuneles", "data/TUNELES_Points.geojson", false);
  cargarPuntos("viaducto", "data/VIADUCTO.geojson", "VD", "#ec4899", "#ffffff", "Viaducto Av. El Sol (1,412 m)", false);
  cargarPuntos("peajes", "data/PEAJES.geojson", "PJ", "#0284c7", "#ffffff", "Estación de Peaje", false);
  cargarPuntos("cruces", "data/CRUCES.geojson", "CR", "#0d9488", "#ffffff", "Cruce Especial (Río / FFCC)", false);
}

async function cargarLinea(key, url, color, titulo, etiquetaCorta, claseLabel, visibleInicial) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: { color, weight: 5.5, opacity: 0.95 },
      onEachFeature: (f, lyr) => {
        lyr.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12.5px;">
            <strong style="color:#0f172a;font-size:13.5px;">${titulo}</strong><br/>
            <span>Autopista urbana expresa de 3 carriles por sentido + vías laterales libres de peaje.</span>
          </div>
        `);
      }
    });

    // Agregar etiqueta permanente del Tramo en el centro del trazo
    const center = layer.getBounds().getCenter();
    const labelMarker = L.marker(center, {
      interactive: false,
      icon: L.divIcon({
        className: "",
        html: `<div class="tramo-map-label ${claseLabel}">${etiquetaCorta}</div>`,
        iconAnchor: [45, 12]
      })
    });

    const group = L.layerGroup([layer, labelMarker]);
    group.getBounds = () => layer.getBounds();
    if (visibleInicial) group.addTo(map);
    layerGroups[key] = group;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

async function cargarPoligono(key, url, styleObj, titulo, visibleInicial) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: styleObj,
      onEachFeature: (f, lyr) => {
        lyr.bindPopup(`<strong>${titulo}</strong><br/>Franja oficial de dominio vial (2,798 vértices WGS84).`);
      }
    });
    if (visibleInicial) layer.addTo(map);
    layerGroups[key] = layer;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

async function cargarPuntos(key, url, sigla, bg, color, categoria, visibleInicial) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.marker(latlng, {
        icon: crearIconoSVG(sigla, bg, color, 24)
      }),
      onEachFeature: (feature, lyr) => {
        const p = feature.properties || {};
        const nombre = p["INTERCAMBIO VIAL (IVD)"] || p["PASO A DESNIVEL"] || p["PEAJE"] || p["VIA DUCTO"] || p["CRUCE"] || p["NOMBRE"] || categoria;
        const tramo = p["TRAMO"] || "";
        const pk = p["KILOMETRAJE (PK)"] || (p["PK INICIO"] ? `${p["PK INICIO"]} al ${p["PK FIN"]}` : "");
        const longM = p["LONGITUD (m)"] ? `<br/><strong>Longitud:</strong> ${p["LONGITUD (m)"]} m` : "";
        lyr.bindTooltip(`${nombre} ${pk ? `(km ${pk})` : ""}`, { direction: "top", offset: [0, -10] });
        lyr.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12.5px;">
            <span style="font-size:10px;font-weight:800;color:#0284c7;text-transform:uppercase;">${categoria}</span><br/>
            <strong style="font-size:13.5px;color:#0f172a;">${nombre}</strong>
            ${tramo ? `<br/><strong>Tramo:</strong> Tramo ${tramo}` : ""}
            ${pk ? `<br/><strong>Progresiva (PK):</strong> km ${pk}` : ""}
            ${longM}
          </div>
        `);
      }
    });
    if (visibleInicial) layer.addTo(map);
    layerGroups[key] = layer;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

// Capa especial para Túneles (muestra portales de inicio/fin + línea de trazado subterráneo)
async function cargarTuneles(key, url, visibleInicial) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const ptsLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.marker(latlng, {
        icon: crearIconoSVG("🚇", "#0f172a", "#ffffff", 26)
      }),
      onEachFeature: (feature, lyr) => {
        const p = feature.properties || {};
        const nombre = p["TUNEL"] || p["NOMBRE"] || "Portal de Túnel (Tramo II)";
        const pk = p["KILOMETRAJE (PK)"] || "";
        const longM = p["LONGITUD (m)"] || "";
        lyr.bindTooltip(`${nombre} (${longM ? longM + " m" : "Túnel"})`, { direction: "top", offset: [0, -12] });
        lyr.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12.5px;">
            <span style="font-size:10px;font-weight:800;color:#ea580c;">OBRA SUBTERRÁNEA &bull; TRAMO II</span><br/>
            <strong style="font-size:13.5px;color:#0f172a;">${nombre}</strong><br/>
            ${pk ? `<strong>Progresiva:</strong> km ${pk}<br/>` : ""}
            ${longM ? `<strong>Longitud total:</strong> ${longM} metros<br/>` : ""}
            <span>Equipado con ventilación longitudinal, iluminación adaptativa, postes SOS y detección automática de incidentes.</span>
          </div>
        `);
      }
    });

    // Trazos esquemáticos entre portal inicio y fin (según TUNELES.xlsx)
    const tunel1Line = L.polyline([[-11.974414, -77.039031], [-11.978363, -77.021086]], {
      color: "#0f172a", weight: 7, dashArray: "8, 6", opacity: 0.9
    }).bindPopup("<strong>Túnel 1 (L: 2,285 m)</strong><br/>km 11+195 al km 13+480 (Comas &ndash; San Juan de Lurigancho)");

    const tunel2Line = L.polyline([[-11.989201, -76.973580], [-12.000910, -76.964178]], {
      color: "#0f172a", weight: 7, dashArray: "8, 6", opacity: 0.9
    }).bindPopup("<strong>Túnel 2 (L: 1,935 m)</strong><br/>km 19+202 al km 21+138 (San Juan de Lurigancho &ndash; Lurigancho/Ramiro Prialé)");

    const group = L.layerGroup([tunel1Line, tunel2Line, ptsLayer]);
    if (visibleInicial) group.addTo(map);
    layerGroups[key] = group;
  } catch (e) {
    console.warn("Error cargando túneles:", e);
  }
}

async function cargarDistritos(visibleInicial) {
  try {
    const res = await fetch("data/DISTRITOS DE LIMA Y CALLAO (2).geojson");
    const data = await res.json();
    const layer = L.geoJSON(data, {
      filter: (feature) => {
        const nom = normalizarDistrito(feature.properties?.NOMBDIST);
        return DISTRITOS_OBJETIVO.has(nom);
      },
      style: {
        color: "#475569",
        weight: 1.5,
        dashArray: "4,4",
        fillColor: "#38bdf8",
        fillOpacity: 0.1
      },
      onEachFeature: (feature, lyr) => {
        const rawName = feature.properties?.NOMBDIST || "Distrito";
        const key = normalizarDistrito(rawName);
        lyr.bindTooltip(`<strong>${rawName}</strong><br/><small>Clic para ver beneficios del AVP</small>`, { sticky: true });
        lyr.on("mouseover", () => lyr.setStyle({ fillOpacity: 0.28, weight: 2.5, color: "#0284c7" }));
        lyr.on("mouseout", () => lyr.setStyle({ fillOpacity: 0.1, weight: 1.5, color: "#475569" }));
        lyr.on("click", () => {
          mostrarBeneficioDistrito(key);
          activarTab("distrito");
          registrarEvento("consulta_distrito", { distrito: key });
        });
      }
    });
    if (visibleInicial) layer.addTo(map);
    layerGroups.distritos = layer;
  } catch (e) {
    console.warn("Error cargando distritos:", e);
  }
}

// 5. INTERACTIVIDAD DE UI, TABS, DISTRITOS Y MODALES GRÁFICOS
function activarTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `tab-${tabId}`));
}

function mostrarBeneficioDistrito(key) {
  const info = BENEFICIOS_DISTRITOS[key] || BENEFICIOS_DISTRITOS["CALLAO"];
  const select = document.getElementById("district-select");
  if (select && BENEFICIOS_DISTRITOS[key]) select.value = key;

  const container = document.getElementById("district-benefit-panel");
  container.innerHTML = `
    <div class="dist-hero" style="background:${info.bgPastel};">
      <span class="dist-tramo-pill">${info.tramo}</span>
      <h4>${info.titulo}</h4>
      <p>${info.resumen}</p>
    </div>
    <div class="dist-cards-list">
      ${info.tarjetas.map(t => `
        <div class="dist-benefit-card">
          <span class="dist-benefit-ico">${t.ico}</span>
          <div>${t.texto}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function actualizarSimulador() {
  const tipo = document.getElementById("sim-tipo").value;
  const data = ESCENARIOS_GESTION[tipo];
  document.getElementById("sim-visual-timeline").innerHTML = `
    <div class="tl-badge">${data.plazo}</div>
    ${data.pasos.map((p, idx) => `
      <div class="tl-step">
        <div class="tl-num">${idx + 1}</div>
        <div>${p}</div>
      </div>
    `).join("")}
  `;
}

function abrirEsquemaModal(tipo) {
  const modal = document.getElementById("schema-modal");
  const title = document.getElementById("schema-modal-title");
  const body = document.getElementById("schema-modal-body");

  if (tipo === "cronograma") {
    title.textContent = "Cronograma Maestro Contractual por Tramo (Plan de Negocios)";
    body.innerHTML = `
      <p class="small-muted">Comparativa de duraciones referenciales de Ingeniería (EDI/IGA), Liberación de Áreas y Ejecución de Obra:</p>
      <div class="table-wrapper">
        <table class="doc-table">
          <thead>
            <tr><th>Hito Contractual</th><th style="background:#b45309;">Tramo I (8.7 km)</th><th style="background:#c2410c;">Tramo II (15.1 km)</th><th style="background:#0369a1;">Tramo III (11.0 km)</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Redacción / Aprobación EDI</strong></td><td>13m / 12m</td><td>35m / 28m</td><td>17m / 13m</td></tr>
            <tr><td><strong>Redacción / Aprobación IGA</strong></td><td>13m / 13m</td><td>35m / 33m</td><td>17m / 20m</td></tr>
            <tr><td><strong>Meta Liberación 100% Predios</strong></td><td><strong>Mes 24</strong></td><td><strong>Mes 46/66</strong> (Vizcachera Mes 78)</td><td><strong>Mes 28</strong></td></tr>
            <tr><td><strong>Remoción de Interferencias</strong></td><td>24 / 38 meses</td><td>48 / 66 meses</td><td>28 / 43 meses</td></tr>
            <tr><td><strong>Ejecución de Obras Civiles</strong></td><td><strong>38 meses</strong></td><td><strong>60m Túneles</strong> / 48m Resto</td><td><strong>42 meses</strong></td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else {
    title.textContent = "Estrategia Integral Socio-Predial (Cláusula 6.29 - PAP)";
    body.innerHTML = `
      <p class="small-muted">Articulación entre el marco legal nacional (TUO D. Leg. N.° 1192) y estándares del BID y Banco Mundial:</p>
      <div class="process-steps" style="margin-top:12px;">
        <div class="p-step"><span>1</span><strong>Censo Social</strong><small>Diagnóstico socioeconómico</small></div>
        <div class="p-arrow">&rarr;</div>
        <div class="p-step"><span>2</span><strong>DTL-S / ETL</strong><small>Levantamiento físico-legal</small></div>
        <div class="p-arrow">&rarr;</div>
        <div class="p-step"><span>3</span><strong>Tasación</strong><small>Valuación + 20% trato directo</small></div>
        <div class="p-arrow">&rarr;</div>
        <div class="p-step"><span>4</span><strong>Adquisición</strong><small>Pago, expropiación o transferencia</small></div>
        <div class="p-arrow">&rarr;</div>
        <div class="p-step"><span>5</span><strong>Inscripción</strong><small>Registro MTC y programas PAP</small></div>
      </div>
    `;
  }
  modal.classList.remove("hidden");
}

// 6. FIREBASE AUTH, CONTADOR DE VISITAS Y FEEDBACK
async function registrarAccesoUsuario(user) {
  const perfil = document.getElementById("visitor-role")?.value || "No especificado";
  const userRef = doc(db, "usuarios", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      nombre: user.displayName,
      email: user.email,
      perfil_profesional: perfil,
      primer_acceso: serverTimestamp(),
      ultimo_acceso: serverTimestamp(),
      visitas: 1
    });
  } else {
    await updateDoc(userRef, {
      ultimo_acceso: serverTimestamp(),
      visitas: increment(1)
    });
  }

  const metricRef = doc(db, "metricas", "global");
  const metricSnap = await getDoc(metricRef);
  if (!metricSnap.exists()) {
    await setDoc(metricRef, { total_visitas: 1 });
    document.getElementById("visit-counter").textContent = "1";
  } else {
    await updateDoc(metricRef, { total_visitas: increment(1) });
    const updated = await getDoc(metricRef);
    document.getElementById("visit-counter").textContent = updated.data().total_visitas;
  }
}

function registrarEvento(nombreEvento, params) {
  try { logEvent(analytics, nombreEvento, params); } catch (_) {}
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarBeneficioDistrito("CALLAO");
  actualizarSimulador();

  document.getElementById("btn-google-login").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const errBox = document.getElementById("auth-error");
      errBox.textContent = "No se pudo completar el acceso con Google. Verifica que el dominio esté autorizado.";
      errBox.classList.remove("hidden");
    }
  });

  document.getElementById("btn-logout").addEventListener("click", () => signOut(auth));

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById("auth-modal").classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
      document.getElementById("user-name").textContent = user.displayName?.split(" ")[0] || "Profesional";
      document.getElementById("user-photo").src = user.photoURL || "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

      if (!map) initMap();
      setTimeout(() => map.invalidateSize(), 200);
      await registrarAccesoUsuario(user);
    } else {
      document.getElementById("auth-modal").classList.remove("hidden");
      document.getElementById("app-shell").classList.add("hidden");
    }
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => activarTab(btn.dataset.tab));
  });

  document.querySelectorAll(".tramo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tramo-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const t = btn.dataset.tramo;
      if (t === "ALL") {
        map.setView([-12.015, -77.025], 11);
      } else if (t === "I" && layerGroups.tramo1) {
        map.fitBounds(layerGroups.tramo1.getBounds(), { padding: [35, 35] });
        activarTab("tramos");
      } else if (t === "II" && layerGroups.tramo2) {
        map.fitBounds(layerGroups.tramo2.getBounds(), { padding: [35, 35] });
        activarTab("tramos");
      } else if (t === "III" && layerGroups.tramo3) {
        map.fitBounds(layerGroups.tramo3.getBounds(), { padding: [35, 35] });
        activarTab("tramos");
      }
    });
  });

  document.querySelectorAll("#layers-body input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      const lyr = layerGroups[chk.dataset.layer];
      if (!lyr) return;
      if (chk.checked) map.addLayer(lyr);
      else map.removeLayer(lyr);
    });
  });

  document.getElementById("toggle-layers").addEventListener("click", (e) => {
    const body = document.getElementById("layers-body");
    const isHidden = body.classList.toggle("hidden");
    e.target.textContent = isHidden ? "+" : "−";
  });

  document.getElementById("district-select").addEventListener("change", (e) => mostrarBeneficioDistrito(e.target.value));
  document.getElementById("sim-tipo").addEventListener("change", actualizarSimulador);

  // Modales de Esquemas Gerenciales
  document.getElementById("btn-chart-cronograma").addEventListener("click", () => abrirEsquemaModal("cronograma"));
  document.getElementById("btn-chart-predial").addEventListener("click", () => abrirEsquemaModal("predial"));
  document.getElementById("close-schema").addEventListener("click", () => document.getElementById("schema-modal").classList.add("hidden"));

  // Modal Buzón Ejecutivo (desde barra superior)
  const buzonModal = document.getElementById("buzon-modal");
  document.getElementById("btn-open-buzon").addEventListener("click", () => buzonModal.classList.remove("hidden"));
  document.getElementById("close-buzon").addEventListener("click", () => buzonModal.classList.add("hidden"));

  // Módulo de Lectura: Sustento Técnico
  const sustentoModal = document.getElementById("sustento-modal");
  document.getElementById("btn-sustento").addEventListener("click", () => {
    sustentoModal.classList.remove("hidden");
    registrarEvento("abrir_sustento_tecnico", {});
  });
  document.getElementById("btn-close-sustento").addEventListener("click", () => sustentoModal.classList.add("hidden"));
  document.getElementById("btn-print-sustento").addEventListener("click", () => window.print());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      sustentoModal.classList.add("hidden");
      buzonModal.classList.add("hidden");
      document.getElementById("schema-modal").classList.add("hidden");
    }
  });

  document.getElementById("btn-send-feedback").addEventListener("click", async () => {
    const txt = document.getElementById("feedback-text").value.trim();
    const status = document.getElementById("feedback-status");
    if (!txt) return;
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "comentarios"), {
        uid: user?.uid || "anon",
        nombre: user?.displayName || "Invitado",
        email: user?.email || "",
        mensaje: txt,
        fecha: serverTimestamp()
      });
      document.getElementById("feedback-text").value = "";
      status.textContent = "Mensaje enviado con éxito. ¡Gracias por tu aporte!";
    } catch (e) {
      status.textContent = "No se pudo enviar el mensaje en este momento.";
    }
  });
});
