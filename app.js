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

// 2. BASE DE BENEFICIOS OPERATIVOS POR DISTRITO (100% POSITIVO E INFORMATIVO)
const BENEFICIOS_DISTRITOS = {
  "CALLAO": {
    titulo: "Provincia Constitucional del Callao",
    tramo: "Tramo I (Inicio: Óvalo 200 Millas / Av. Néstor Gambetta)",
    resumen: "Consolidación como puerta logística internacional del Perú con conectividad expresa sin semáforos hacia el Puerto del Callao y el nuevo Aeropuerto Jorge Chávez.",
    puntos: [
      "Intercambios Viales de alta capacidad en Néstor Gambetta (km 0+550) y Elmer Faucett (km 1+555).",
      "Separación ordenada del transporte de carga logística respecto al tránsito vecinal de Oquendo y Bocanegra.",
      "Vías laterales libres de peaje renovadas para la movilidad local y pasos peatonales cada 500 metros."
    ]
  },
  "SAN MARTIN DE PORRES": {
    titulo: "San Martín de Porres",
    tramo: "Tramo I (Eje Av. Canta Callao)",
    resumen: "Permeabilidad vial transversal y reducción sustancial de tiempos de viaje entre Lima Norte, el Callao y Lima Este.",
    puntos: [
      "Intercambio Vial Canta Callao (km 5+800) y pasos a desnivel en Bertello (km 2+100), Carlos Izaguirre (km 3+200) y Los Alisos (km 4+500).",
      "Conexión rápida para zonas residenciales e industriales livianas sin necesidad de cruzar el centro de Lima.",
      "Mejoramiento integral de vías auxiliares gratuitas y seguridad vial con sistemas inteligentes ITS."
    ]
  },
  "LOS OLIVOS": {
    titulo: "Los Olivos",
    tramo: "Tramo I (Eje Av. Naranjal / Universitaria)",
    resumen: "Potenciación como centro comercial, universitario y de servicios de Lima Norte con acceso directo a toda la red metropolitana.",
    puntos: [
      "Intercambios Viales en Av. Universitaria (km 7+050) y Panamericana Norte (km 8+250).",
      "Pasos a desnivel en Próceres de Huandoy (km 6+300) y Las Palmeras (km 7+500) que agilizan el flujo local.",
      "Conexión directa de estudiantes, comercios y familias hacia San Juan de Lurigancho y Lima Este en menos de 20 minutos."
    ]
  },
  "INDEPENDENCIA": {
    titulo: "Independencia",
    tramo: "Articulación Tramo I y Tramo II",
    resumen: "Nodo estratégico de integración multimodal entre el sistema troncal del Metropolitano y la nueva autopista periférica.",
    puntos: [
      "Articulación directa en el eje Panamericana Norte y paso a desnivel en Av. Túpac Amaru (km 8+900).",
      "Descompresión del eje comercial e institucional de Lima Norte mediante vías expresas y laterales gratuitas.",
      "Acceso rápido hacia el Aeropuerto Jorge Chávez y los polos industriales de Lima Este."
    ]
  },
  "COMAS": {
    titulo: "Comas",
    tramo: "Tramo II (Conexión Portal Túnel 1)",
    resumen: "Ruptura de la barrera geográfica histórica entre Lima Norte y San Juan de Lurigancho mediante ingeniería subterránea de vanguardia.",
    puntos: [
      "Pasos a desnivel en Huamachuco (km 9+900) y José G. Condorcanqui (km 11+100) que ordenan el tránsito distrital.",
      "Acceso directo al Túnel 1 (2,285 m de longitud), conectando Comas con San Juan de Lurigancho en pocos minutos.",
      "Revalorización urbana y comercial de los ejes articulados al corredor."
    ]
  },
  "SAN JUAN DE LURIGANCHO": {
    titulo: "San Juan de Lurigancho",
    tramo: "Tramo II (Corredor Central y Túneles 1 y 2)",
    resumen: "El mayor salto en conectividad urbana de Lima: apertura de dos salidas expresas de alta capacidad hacia Lima Norte y Lima Este.",
    puntos: [
      "Conexión expresa hacia Comas/Panamericana Norte (Túnel 1: 2,285 m) y hacia Ramiro Prialé/Carretera Central (Túnel 2: 1,935 m).",
      "Construcción del Viaducto Av. El Sol (1,412 m), Intercambio Vial Próceres de la Independencia (km 15+050, articulado con la Línea 1) y 8 pasos a desnivel.",
      "Vías laterales libres de peaje y puentes peatonales que integran Canto Grande, San Carlos y Campoy."
    ]
  },
  "LURIGANCHO": {
    titulo: "Lurigancho - Chosica (Sector Huachipa / Nievería)",
    tramo: "Articulación Tramo II y Tramo III",
    resumen: "Impulso al polo agroindustrial y logístico de Lima Este junto con una intervención emblemática de recuperación ambiental.",
    puntos: [
      "Remediación ambiental definitiva y recuperación del ex vertedero La Vizcachera, eliminando un pasivo histórico.",
      "Conexión directa con la Autopista Ramiro Prialé (IVD km 23+900) y el Puerto del Callao para transporte productivo.",
      "Desarrollo de infraestructura vial moderna con estándares ambientales y sociales internacionales."
    ]
  },
  "EL AGUSTINO": {
    titulo: "El Agustino",
    tramo: "Tramo III (Eje Río Rímac / Vía de Evitamiento)",
    resumen: "Integración vial moderna en la ribera del Rímac y ordenamiento del tránsito de paso mediante estructuras a desnivel.",
    puntos: [
      "Cruce moderno sobre el Río Rímac (km 23+950 al 24+150) y articulación con los intercambios de Ramiro Prialé y Evitamiento.",
      "Pasos a desnivel que separan el tránsito metropolitano de largo recorrido de las calles vecinales.",
      "Mejora en seguridad vial, iluminación LED y accesibilidad peatonal."
    ]
  },
  "SANTA ANITA": {
    titulo: "Santa Anita",
    tramo: "Tramo III (Nodo Logístico Carretera Central)",
    resumen: "Consolidación como principal centro de abastecimiento y logística de Lima con conexión directa al puerto y aeropuerto.",
    puntos: [
      "Intercambio Vial Carretera Central (km 27+150) y pasos a desnivel en San Pablo, Av. San Juan y Metropolitana.",
      "Sinergia multimodal con la Línea 2 del Metro de Lima y el Cruce del Ferrocarril Central (km 25+200).",
      "Flujo logístico directo para el Gran Mercado Mayorista de Lima sin saturar las avenidas locales."
    ]
  },
  "ATE": {
    titulo: "Ate",
    tramo: "Tramo III (Eje Separadora Industrial)",
    resumen: "Revalorización urbana, modernización industrial y creación de nuevos espacios públicos verdes para los vecinos.",
    puntos: [
      "Intercambio Vial Huarochirí (km 28+800) y pasos a desnivel en Asturias (km 28+300) y Santa Rosa (km 32+100).",
      "Implementación del Parque Lineal de Separadora Industrial: paisajismo, áreas verdes y zonas recreativas de calidad.",
      "Vías auxiliares gratuitas que ordenan el transporte local y potencian el corredor empresarial e industrial."
    ]
  },
  "LA MOLINA": {
    titulo: "La Molina",
    tramo: "Tramo III (Eje Av. La Molina / Los Frutales)",
    resumen: "Solución estructural de conectividad rápida hacia Lima Norte, el Aeropuerto Jorge Chávez y el eje centro-sur.",
    puntos: [
      "Intercambio Vial Av. La Molina (km 30+050) y pasos a desnivel en Los Ingenieros (km 29+700) y Los Frutales (km 31+200).",
      "Alternativa vial expresa de alta velocidad para residentes, universidades y centros empresariales.",
      "Reducción significativa de tiempos de desplazamiento hacia el norte y oeste de la capital."
    ]
  },
  "SAN LUIS": {
    titulo: "San Luis",
    tramo: "Tramo III (Cierre en Av. Circunvalación)",
    resumen: "Punto estratégico de cierre del anillo en su empalme con la Av. Circunvalación y la red vial del centro-sur de Lima.",
    puntos: [
      "Intercambio Vial Circunvalación (km 34+400) y paso a desnivel en Av. Las Torres (km 33+900).",
      "Ordenamiento del tránsito comercial y automotriz y conexión fluida con Vía de Evitamiento.",
      "Integración directa del distrito con toda la red periférica metropolitana de 34.8 km."
    ]
  }
};

// 3. SIMULADOR DE GESTIÓN PREDIAL E INTERFERENCIAS (D. LEG. 1192 / PMBOK)
const ESCENARIOS_GESTION = {
  trato_directo: {
    titulo: "Adquisición Predial — Trato Directo (TUO D. Leg. N.° 1192)",
    plazo: "4 a 6 meses referenciales",
    hitos: "1. Diagnóstico Técnico-Legal (DTL-S) y Expediente (ETL) → 2. Tasación comercial (DGPRVU) + incentivo del 20% → 3. Oferta formal y aceptación → 4. Pago directo y suscripción de escritura / entrega de posesión.",
    clave: "Mecanismo prioritario en Tramos I y III (metas contractuales de liberación 100% en Mes 24 y Mes 28)."
  },
  expropiacion: {
    titulo: "Adquisición Predial — Proceso de Expropiación (TUO D. Leg. N.° 1192)",
    plazo: "8 a 14 meses referenciales",
    hitos: "1. Emisión de Resolución Ministerial que aprueba el valor de tasación y sujeto pasivo → 2. Consignación en Banco de la Nación → 3. Inscripción registral a favor del MTC → 4. Ejecución coactiva y programas de reubicación (estándares BID/BM).",
    clave: "Concentrado principalmente en el Tramo II (96% de las expropiaciones del corredor), con acompañamiento social permanente."
  },
  telecom: {
    titulo: "Liberación de Interferencias — Telecomunicaciones y Fibra Óptica",
    plazo: "6 a 13 meses referenciales",
    hitos: "1. Identificación y catastro en campo → 2. Convenio específico Concedente / Operadora (ej. convenios Tramo I a 13 meses) → 3. Ingeniería de traslado y canalización → 4. Migración en ventana de corte y retiro aéreo/subterráneo.",
    clave: "Ruta crítica previa a la ejecución de pasos a desnivel e intercambios viales."
  },
  saneamiento: {
    titulo: "Liberación de Interferencias — Saneamiento (SEDAPAL) y Energía (AT/MT)",
    plazo: "10 a 18 meses referenciales",
    hitos: "1. Factibilidad y aprobación de proyecto de reubicación por empresa prestadora → 2. Aprobación de presupuesto y financiamiento → 3. Obra civil de variante/desvío de matriz o línea → 4. Empalme y puesta en servicio.",
    clave: "Requiere coordinación temprana con SEDAPAL, Pluz Energía, Luz del Sur y Cálidda."
  }
};

// 4. INICIALIZACIÓN DE MAPA Y CAPAS GEOJSON
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

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([-12.015, -77.025], 11);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO | Geoportal AVP - Ing. Vladimir Casas",
    maxZoom: 19
  }).addTo(map);

  cargarDistritos();
  cargarPoligono("derechoVia", "data/DERECHO DE VIA.geojson", { color: "#7c3aed", weight: 1.5, fillColor: "#8b5cf6", fillOpacity: 0.32 }, "Derecho de Vía Oficial (R.M. N.° 869-2025-MTC/01.02)");
  cargarLinea("tramo1", "data/TRAZO TRAMO I.geojson", "#0284c7", "Tramo I (8.7 km) — Callao a Panamericana Norte");
  cargarLinea("tramo2", "data/TRAZO TRAMO II.geojson", "#d97706", "Tramo II (15.1 km) — Panamericana Norte a Ramiro Prialé");
  cargarLinea("tramo3", "data/TRAZO TRAMO III.geojson", "#059669", "Tramo III (11.0 km) — Ramiro Prialé a Circunvalación");

  cargarPuntos("ivd", "data/INTERCAMBIOS VIALES.geojson", "#eab308", 7, "Intercambio Vial (IVD)");
  cargarPuntos("bypass", "data/PASO DESNIVEL.geojson", "#ef4444", 5.5, "Paso a Desnivel (Bypass)");
  cargarPuntos("tuneles", "data/TUNELES_Points.geojson", "#1e293b", 7.5, "Portal de Túnel (Tramo II)");
  cargarPuntos("viaducto", "data/VIADUCTO.geojson", "#ec4899", 7, "Viaducto Av. El Sol (1,412 m)");
  cargarPuntos("peajes", "data/PEAJES.geojson", "#0ea5e9", 6.5, "Estación de Peaje");
  cargarPuntos("cruces", "data/CRUCES.geojson", "#14b8a6", 6.5, "Cruce Especial (Río / Ferrocarril)");
}

async function cargarDistritos() {
  try {
    const res = await fetch("data/DISTRITOS DE LIMA Y CALLAO (2).geojson");
    const data = await res.json();
    const layer = L.geoJSON(data, {
      filter: (feature) => {
        const nom = normalizarDistrito(feature.properties?.NOMBDIST);
        return DISTRITOS_OBJETIVO.has(nom);
      },
      style: {
        color: "#64748b",
        weight: 1.3,
        dashArray: "4,4",
        fillColor: "#38bdf8",
        fillOpacity: 0.08
      },
      onEachFeature: (feature, lyr) => {
        const rawName = feature.properties?.NOMBDIST || "Distrito";
        const key = normalizarDistrito(rawName);
        lyr.bindTooltip(`<strong>${rawName}</strong><br/><small>Clic para ver beneficios del AVP</small>`, { sticky: true });
        lyr.on("mouseover", () => lyr.setStyle({ fillOpacity: 0.24, weight: 2.2, color: "#0284c7" }));
        lyr.on("mouseout", () => lyr.setStyle({ fillOpacity: 0.08, weight: 1.3, color: "#64748b" }));
        lyr.on("click", () => {
          mostrarBeneficioDistrito(key);
          activarTab("distrito");
          registrarEvento("consulta_distrito", { distrito: key });
        });
      }
    }).addTo(map);
    layerGroups.distritos = layer;
  } catch (e) {
    console.warn("Error cargando distritos:", e);
  }
}

async function cargarPoligono(key, url, styleObj, titulo) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: styleObj,
      onEachFeature: (f, lyr) => {
        lyr.bindPopup(`<strong>${titulo}</strong><br/>Franja oficial de dominio vial del Anillo Vial Periférico.`);
      }
    }).addTo(map);
    layerGroups[key] = layer;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

async function cargarLinea(key, url, color, titulo) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: { color, weight: 4.5, opacity: 0.92 },
      onEachFeature: (f, lyr) => {
        lyr.bindPopup(`<strong>${titulo}</strong><br/>Autopista urbana expresa de 3 carriles por sentido + vías laterales libres de peaje.`);
      }
    }).addTo(map);
    layerGroups[key] = layer;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

async function cargarPuntos(key, url, fillColor, radius, categoria) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius,
        fillColor,
        color: "#ffffff",
        weight: 1.6,
        opacity: 1,
        fillOpacity: 0.95
      }),
      onEachFeature: (feature, lyr) => {
        const p = feature.properties || {};
        const nombre = p["INTERCAMBIO VIAL (IVD)"] || p["PASO A DESNIVEL"] || p["PEAJE"] || p["TUNEL"] || p["VIA DUCTO"] || p["CRUCE"] || p["NOMBRE"] || categoria;
        const tramo = p["TRAMO"] || "";
        const pk = p["KILOMETRAJE (PK)"] || (p["PK INICIO"] ? `${p["PK INICIO"]} al ${p["PK FIN"]}` : "");
        const longM = p["LONGITUD (m)"] ? `<br/><strong>Longitud:</strong> ${p["LONGITUD (m)"]} m` : "";
        lyr.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12.5px;">
            <span style="font-size:10px;font-weight:700;color:#0284c7;text-transform:uppercase;">${categoria}</span><br/>
            <strong style="font-size:13.5px;color:#0f172a;">${nombre}</strong>
            ${tramo ? `<br/><strong>Tramo:</strong> ${tramo}` : ""}
            ${pk ? `<br/><strong>Progresiva (PK):</strong> ${pk}` : ""}
            ${longM}
          </div>
        `);
      }
    }).addTo(map);
    layerGroups[key] = layer;
  } catch (e) {
    console.warn(`Error cargando ${url}:`, e);
  }
}

// 5. INTERACTIVIDAD DE UI, TABS, DISTRITOS Y SIMULADOR
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
    <h4>${info.titulo}</h4>
    <span class="district-tag">${info.tramo}</span>
    <p><strong>Impacto Estratégico:</strong> ${info.resumen}</p>
    <ul>
      ${info.puntos.map(pt => `<li>${pt}</li>`).join("")}
    </ul>
  `;
}

function actualizarSimulador() {
  const tipo = document.getElementById("sim-tipo").value;
  const data = ESCENARIOS_GESTION[tipo];
  document.getElementById("sim-result").innerHTML = `
    <strong>${data.titulo}</strong><br/>
    <span style="display:inline-block;margin:4px 0;background:#0284c7;color:#fff;padding:2px 8px;border-radius:6px;font-size:11px;">Plazo estimado: ${data.plazo}</span><br/>
    <strong>Flujo de Hitos:</strong> ${data.hitos}<br/>
    <em style="display:block;margin-top:6px;">${data.clave}</em>
  `;
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

  // Botón Google Sign-In
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

  // Navegación de pestañas
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => activarTab(btn.dataset.tab));
  });

  // Filtro rápido de tramos
  document.querySelectorAll(".tramo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tramo-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const t = btn.dataset.tramo;
      if (t === "ALL") {
        map.setView([-12.015, -77.025], 11);
      } else if (t === "I" && layerGroups.tramo1) {
        map.fitBounds(layerGroups.tramo1.getBounds(), { padding: [30, 30] });
        activarTab("tramos");
      } else if (t === "II" && layerGroups.tramo2) {
        map.fitBounds(layerGroups.tramo2.getBounds(), { padding: [30, 30] });
        activarTab("tramos");
      } else if (t === "III" && layerGroups.tramo3) {
        map.fitBounds(layerGroups.tramo3.getBounds(), { padding: [30, 30] });
        activarTab("tramos");
      }
    });
  });

  // Checkboxes de capas
  document.querySelectorAll("#layers-body input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      const lyr = layerGroups[chk.dataset.layer];
      if (!lyr) return;
      if (chk.checked) map.addLayer(lyr);
      else map.removeLayer(lyr);
    });
  });

  // Minimizar leyenda
  document.getElementById("toggle-layers").addEventListener("click", (e) => {
    const body = document.getElementById("layers-body");
    const isHidden = body.classList.toggle("hidden");
    e.target.textContent = isHidden ? "+" : "−";
  });

  // Selector de distrito y simulador
  document.getElementById("district-select").addEventListener("change", (e) => mostrarBeneficioDistrito(e.target.value));
  document.getElementById("sim-tipo").addEventListener("change", actualizarSimulador);

  // MÓDULO DE LECTURA: SUSTENTO TÉCNICO (ABRIR / CERRAR / IMPRIMIR / ESC)
  const sustentoModal = document.getElementById("sustento-modal");
  document.getElementById("btn-sustento").addEventListener("click", () => {
    sustentoModal.classList.remove("hidden");
    registrarEvento("abrir_sustento_tecnico", {});
  });
  document.getElementById("btn-close-sustento").addEventListener("click", () => {
    sustentoModal.classList.add("hidden");
  });
  document.getElementById("btn-print-sustento").addEventListener("click", () => {
    window.print();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sustentoModal.classList.contains("hidden")) {
      sustentoModal.classList.add("hidden");
    }
  });

  // Buzón de Feedback en Firestore
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
