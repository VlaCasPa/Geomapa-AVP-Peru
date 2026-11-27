# Geoportal Ejecutivo WebGIS: Anillo Vial Periférico de Lima y Callao (AVP)
Desarrollado por Ing. CIP Vladimir Casas Palomino

Plataforma interactiva de inteligencia territorial y analítica geoespacial para el monitoreo estratégico del **Proyecto Anillo Vial Periférico (34.8 km)**, autopista urbana concesionada bajo modalidad APP que articula **11 distritos de Lima Metropolitana y 1 del Callao** con una inversión estimada de **US$ 3,400 millones**.

---

## Motivo y Propósito del Portal

Los megaproyectos de infraestructura vial urbana involucran miles de datos dispersos entre resoluciones ministeriales, cuadros de coordenadas UTM, planos de planta, cronogramas de inversión y estudios socioambientales. 

Este geoportal nace con el objetivo de **sintetizar y estructurar esa complejidad técnica en una herramienta visual de soporte a la toma de decisiones**, demostrando cómo la integración de **Ingeniería Civil + Gestión de Proyectos (PMBOK / Design Thinking) + Analítica Geoespacial (ConTech / WebGIS)** permite monitorear obras de gran escala con claridad gerencial.

---

## Beneficios Clave de Contar con este Geoportal

1. **Visión Integral y Multicapa del Corredor (34.8 km):** Permite inspeccionar simultáneamente los ejes troncales de los **Tramos I, II y III**, el polígono oficial del Derecho de Vía (**2,798 vértices** según **R.M. N.° 869-2025-MTC/01.02**) y las **46 obras singulares** (12 Intercambios Viales, 24 Pasos a Desnivel, 2 Túneles de 4.22 km, Viaducto Av. El Sol de 1.41 km, 5 Peajes y cruces especiales).
2. **Soporte Financiero y Contractual a Nivel Gerencial:** Consolida indicadores macroeconómicos (**US$ 3,400 millones** de inversión, impacto de **2.5 % en el PBI de Lima**, **4.5 millones de beneficiarios**), la curva de desembolsos **CAPEX 2025–2029** y los plazos clave por tramo.
3. **Lectura Territorial por Jurisdicción (12 Distritos):** Al seleccionar cualquier distrito atravesado por el proyecto (*Callao, San Martín de Porres, Los Olivos, Independencia, Comas, San Juan de Lurigancho, Lurigancho-Chosica, El Agustino, Santa Anita, Ate, La Molina y San Luis*), se despliega el análisis específico de conectividad multimodal, logística urbana y revalorización que aporta la obra.
4. **Módulo de Lectura de Sustento Técnico Integrado:** Incluye un visor documental interactivo dentro de la misma aplicación web con tablas comparativas, gráficos financieros y trazabilidad normativa oficial.
5. **Modelamiento de Gestión Predial e Interferencias:** Incorpora un simulador referencial de flujos y plazos basado en el **TUO del D. Leg. N.° 1192** y los estándares socioambientales del **BID y Banco Mundial**, replicable a cualquier proyecto de infraestructura lineal.

---

## Estructura del Repositorio

```text
Geomapa-Anillo-Vial/
├── index.html          # Estructura del visor WebGIS, dashboard gerencial y módulo de sustento técnico
├── styles.css          # Hoja de estilos corporativa, diseño editorial y responsivo
├── app.js              # Lógica geoespacial (Leaflet), simulador PMBOK y conexión Firebase
├── README.md           # Documentación general del repositorio
└── data/               # Capas vectoriales depuradas en WGS84 (EPSG:4326)
    ├── DERECHO DE VIA.geojson
    ├── TRAZO TRAMO I.geojson
    ├── TRAZO TRAMO II.geojson
    ├── TRAZO TRAMO III.geojson
    ├── INTERCAMBIOS VIALES.geojson
    ├── PASO DESNIVEL.geojson
    ├── TUNELES_Points.geojson
    ├── VIADUCTO.geojson
    ├── PEAJES.geojson
    ├── CRUCES.geojson
    └── DISTRITOS DE LIMA Y CALLAO.geojson
