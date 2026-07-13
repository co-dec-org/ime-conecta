/* ============================================================
   IME Conecta — Calibrador de entrada
   Panel para ajustar en vivo los parámetros del input
   (mouse · touch · multitouch) del motor de gráfica viva.
   Diagnóstico del dispositivo · sets por clase (Phone · Tablet ·
   Desktop) publicables en Supabase · export/import.
   Depende de window.IMESkinAPI (ver ime-skin.js).
   ============================================================ */
(function () {
  "use strict";
  const api = window.IMESkinAPI;
  if (!api) return; // sin WebGL no hay nada que calibrar

  const LS_PARAMS = "imelink-input-params";
  const LS_PRESETS = "imelink-input-presets";

  // Rangos físicos ampliados de cada variable. Los sliders trabajan en
  // porcentaje (0–100 %, paso 1 %) y aquí se mapean a estos rangos; los
  // valores se guardan y publican siempre en unidades físicas.
  // maxPointers tiene tope 10: es el límite físico del shader (MAXP).
  const FIELDS = [
    { key: "radius",        label: "Radio de influencia",         min: 0.02, max: 0.90, head: "Entrada (mouse · touch)" },
    { key: "warpGain",      label: "Intensidad (agitación)",      min: 0,    max: 6    },
    { key: "glow",          label: "Brillo del halo",             min: 0,    max: 1.5  },
    { key: "smoothing",     label: "Suavizado",                   min: 0.01, max: 0.60 },
    { key: "pressedMul",    label: "Fuerza al presionar (mouse)", min: 1,    max: 5    },
    { key: "touchStrength", label: "Fuerza de toque",             min: 0.2,  max: 4    },
    { key: "maxPointers",   label: "Máx. atractores",             min: 1,    max: 10   },
    { key: "wheel",         label: "Identidad bicolor",           type: "wheel", head: "Apariencia del campo" },
    { key: "dualMix",       label: "Mezcla bicolor",              min: 0,    max: 1    },
    { key: "collective",    label: "Energía colectiva (base)",    min: 0,    max: 1.5  },
    { key: "colAmp",        label: "Mutación por actividad",      min: 0,    max: 1    },
    { key: "individual",    label: "Energía individual",          min: 0,    max: 1.5  },
    { key: "timeSpeed",     label: "Velocidad del tiempo",        min: 0,    max: 3    },
    { key: "grainMul",      label: "Grano fílmico",               min: 0,    max: 2    },
    { key: "veil",          label: "Velo de legibilidad",         min: 0,    max: 1    }
  ];

  const fmt = (k, v) => (k === "maxPointers" ? String(v) : (+v).toFixed(2));
  const rgbToHex = rgb => "#" + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
  // Conversión hex ↔ HSL para la rueda de color
  function hexToHsl(hex) {
    const m = /^#([0-9a-fA-F]{6})$/.exec(hex || "");
    if (!m) return null;
    const n = parseInt(m[1], 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    }
    return { h, s, l: l * 100 };
  }
  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(c * 255).toString(16).padStart(2, "0");
    };
    return "#" + f(0) + f(8) + f(4);
  }
  // Conversión porcentaje ↔ valor físico
  const pctOf = (f, v) => Math.round(((v - f.min) / (f.max - f.min)) * 100);
  const valOf = (f, pct) => {
    const v = f.min + (Math.max(0, Math.min(100, pct)) / 100) * (f.max - f.min);
    return f.key === "maxPointers" ? Math.round(v) : v;
  };
  const label = (f, v) => pctOf(f, v) + "%";
  const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) || fb; } catch (e) { return fb; } };
  const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} };

  // Restaurar parámetros guardados
  const saved = load(LS_PARAMS, null);
  if (saved) api.setParams(saved);

  // ---------- UI ----------
  const sliders = {}; // key -> {input, val}

  const toggle = document.createElement("button");
  toggle.id = "calib-toggle";
  toggle.className = "calib-toggle";
  toggle.setAttribute("aria-controls", "calib-panel");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "⚙"; toggle.setAttribute("aria-label", "Calibración");

  const panel = document.createElement("section");
  panel.id = "calib-panel";
  panel.className = "calib-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Calibración de entrada");

  const info = api.info();
  const KLASS_NAMES = { phone: "Phone", tablet: "Tablet", desktop: "Desktop" };
  const klass = api.deviceClass ? api.deviceClass() : (info.touch ? "tablet" : "desktop");
  const diag = `Dispositivo: ${info.touch ? "Táctil" : "Escritorio"} · ` +
    `Multitouch: ${info.maxTouch || 0} · Núcleos: ${info.cores ?? "?"} · ` +
    `Memoria: ${info.memory ? info.memory + " GB" : "?"} · DPR: ${info.dpr} · ` +
    `Clase: ${KLASS_NAMES[klass]}`;

  panel.innerHTML = `
    <header class="calib-head">
      <strong>Calibración de entrada</strong>
      <button id="calib-close" aria-label="Cerrar">✕</button>
    </header>
    <p class="calib-diag">${diag}</p>
    <div class="calib-fields"></div>
    <div class="calib-row">
      <button id="calib-reset" class="btn btn-ghost btn-sm">Restablecer</button>
      <button id="calib-export" class="btn btn-ghost btn-sm">Exportar</button>
      <button id="calib-import" class="btn btn-ghost btn-sm">Importar</button>
      <input id="calib-file" type="file" accept="application/json,.json" hidden />
    </div>
    <div class="calib-presets">
      <span>Sets por dispositivo · <em>cargar</em> aplica aquí · <em>guardar</em> es local · <em>publicar</em> lo vuelve estándar del sitio · <em>×3 sitios</em> lo comparte a la trilogía:</span>
      <div data-slot="phone"><b>Phone</b><button class="linkbtn" data-act="load" data-slot="phone">cargar</button><button class="linkbtn" data-act="save" data-slot="phone">guardar</button><button class="linkbtn" data-act="publish" data-slot="phone">publicar</button><button class="linkbtn" data-act="publish3" data-slot="phone" title="Publicar este set en los tres sitios IME">×3 sitios</button></div>
      <div data-slot="tablet"><b>Tablet</b><button class="linkbtn" data-act="load" data-slot="tablet">cargar</button><button class="linkbtn" data-act="save" data-slot="tablet">guardar</button><button class="linkbtn" data-act="publish" data-slot="tablet">publicar</button><button class="linkbtn" data-act="publish3" data-slot="tablet" title="Publicar este set en los tres sitios IME">×3 sitios</button></div>
      <div data-slot="desktop"><b>Desktop</b><button class="linkbtn" data-act="load" data-slot="desktop">cargar</button><button class="linkbtn" data-act="save" data-slot="desktop">guardar</button><button class="linkbtn" data-act="publish" data-slot="desktop">publicar</button><button class="linkbtn" data-act="publish3" data-slot="desktop" title="Publicar este set en los tres sitios IME">×3 sitios</button></div>
    </div>
    <p class="calib-status" id="calib-status" aria-live="polite"></p>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);
  if (window.IMEDrag) window.IMEDrag(toggle, "imelink-pos-calib");

  // Arrastrar el panel por su cabecera (posición persistente), igual que las Notas.
  (function () {
    const head = panel.querySelector(".calib-head");
    let sx, sy, ox, oy, dragging = false;
    try {
      const s = JSON.parse(localStorage.getItem("imelink-pos-calib-panel") || "null");
      if (s) { panel.style.left = s.x + "px"; panel.style.top = s.y + "px"; panel.style.right = "auto"; panel.style.bottom = "auto"; }
    } catch (e) {}
    head.style.cursor = "move";
    head.addEventListener("pointerdown", e => {
      if (e.target.closest("button")) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      const r = panel.getBoundingClientRect(); ox = r.left; oy = r.top;
      head.setPointerCapture(e.pointerId);
    });
    head.addEventListener("pointermove", e => {
      if (!dragging) return;
      const nx = Math.max(4, Math.min(innerWidth - panel.offsetWidth - 4, ox + e.clientX - sx));
      const ny = Math.max(4, Math.min(innerHeight - 40, oy + e.clientY - sy));
      panel.style.left = nx + "px"; panel.style.top = ny + "px"; panel.style.right = "auto"; panel.style.bottom = "auto";
    });
    head.addEventListener("pointerup", () => {
      if (!dragging) return; dragging = false;
      try { localStorage.setItem("imelink-pos-calib-panel", JSON.stringify({ x: parseInt(panel.style.left), y: parseInt(panel.style.top) })); } catch (e) {}
    });
  })();

  // Marcar la clase del dispositivo actual en la lista de sets
  const currentRow = panel.querySelector(`.calib-presets div[data-slot="${klass}"]`);
  if (currentRow) currentRow.setAttribute("data-current", "1");

  // Visibilidad restringida: el calibrador solo aparece para el director co.dec.org.
  // La sesión (token) se usa para publicar sets en Supabase.
  const auth = { token: null, userId: null };
  toggle.style.display = "none";
  window.addEventListener("ime:auth", e => {
    const d = (e && e.detail) || {};
    const allowed = d.email === "co.dec.org@gmail.com";
    auth.token = (allowed && d.token) || null;
    auth.userId = (allowed && d.userId) || null;
    toggle.style.display = allowed ? "" : "none";
    if (!allowed) open(false);
  });

  // Construir sliders
  const fieldsBox = panel.querySelector(".calib-fields");
  const cur = api.getParams();
  FIELDS.forEach(f => {
    if (f.head) {
      const h = document.createElement("div");
      h.className = "calib-group"; h.textContent = f.head;
      fieldsBox.appendChild(h);
    }
    const wrap = document.createElement("label");
    wrap.className = "calib-field";
    const input = document.createElement("input");

    if (f.type === "wheel") {
      // Rueda de color con arrastre directo: manija A (energía colectiva)
      // y manija B (energía individual) sobre el mismo disco. La
      // luminosidad ajusta la última manija tocada.
      const box = document.createElement("div");
      box.className = "calib-wheel";
      box.innerHTML = `
        <div class="calib-wheel-disc">
          <div class="calib-wheel-sat"></div>
          <div class="calib-wheel-h" data-h="A">A</div>
          <div class="calib-wheel-h" data-h="B">B</div>
        </div>
        <div class="calib-wheel-legend">
          <span><i data-sw="A"></i>A · colectiva <em data-hex="A"></em></span>
          <span><i data-sw="B"></i>B · individual <em data-hex="B"></em></span>
        </div>`;
      fieldsBox.appendChild(box);

      const lumWrap = document.createElement("label");
      lumWrap.className = "calib-field";
      lumWrap.innerHTML = `<span>Luminosidad · <b data-lt>A</b><em data-val="lum">—</em></span>`;
      const lumIn = document.createElement("input");
      lumIn.type = "range"; lumIn.min = 0; lumIn.max = 100; lumIn.step = 1;
      lumWrap.appendChild(lumIn);
      fieldsBox.appendChild(lumWrap);

      const disc = box.querySelector(".calib-wheel-disc");
      const KEYS = { A: "idColor", B: "idColor2" };
      const fallback = k => rgbToHex(k === "A"
        ? (api.identity ? api.identity() : [1, 1, 1])
        : (api.identity2 ? api.identity2() : [1, 1, 1]));
      const state = {}; let sel = "A", dragging = null;
      const R = 85, RM = R * 0.94;

      function readState() {
        const p = api.getParams();
        ["A", "B"].forEach(k => {
          state[k] = hexToHsl(p[KEYS[k]] || fallback(k)) || { h: 0, s: 0.5, l: 50 };
        });
      }
      function posOf(c) {
        const a = (c.h - 90) * Math.PI / 180;
        return { x: R + Math.cos(a) * c.s * RM, y: R + Math.sin(a) * c.s * RM };
      }
      function paintWheel() {
        ["A", "B"].forEach(k => {
          const c = state[k], hex = hslToHex(c.h, c.s, c.l), p = posOf(c);
          const hEl = box.querySelector(`.calib-wheel-h[data-h="${k}"]`);
          hEl.style.left = p.x + "px"; hEl.style.top = p.y + "px";
          hEl.style.background = hex; hEl.style.zIndex = sel === k ? 2 : 1;
          box.querySelector(`[data-sw="${k}"]`).style.background = hex;
          box.querySelector(`[data-hex="${k}"]`).textContent = hex;
        });
        lumWrap.querySelector("[data-lt]").textContent = sel;
        const pct = Math.round((state[sel].l - 10) / 80 * 100);
        lumIn.value = Math.max(0, Math.min(100, pct));
        lumWrap.querySelector("[data-val]").textContent = lumIn.value + "%";
      }
      function commit(k) {
        api.setParam(KEYS[k], hslToHex(state[k].h, state[k].s, state[k].l));
        save(LS_PARAMS, api.getParams());
        api.refresh();
      }
      function moveTo(k, e) {
        const r = disc.getBoundingClientRect();
        const dx = e.clientX - r.left - R, dy = e.clientY - r.top - R;
        state[k].s = Math.min(1, Math.hypot(dx, dy) / RM);
        state[k].h = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
        sel = k; paintWheel(); commit(k);
      }
      disc.addEventListener("pointerdown", e => {
        const r = disc.getBoundingClientRect();
        const px = e.clientX - r.left, py = e.clientY - r.top;
        const pa = posOf(state.A), pb = posOf(state.B);
        dragging = Math.hypot(px - pa.x, py - pa.y) <= Math.hypot(px - pb.x, py - pb.y) ? "A" : "B";
        disc.setPointerCapture(e.pointerId);
        moveTo(dragging, e);
      });
      disc.addEventListener("pointermove", e => { if (dragging) moveTo(dragging, e); });
      disc.addEventListener("pointerup", () => { dragging = null; });
      lumIn.addEventListener("input", () => {
        state[sel].l = 10 + (parseInt(lumIn.value, 10) / 100) * 80;
        paintWheel(); commit(sel);
      });

      readState(); paintWheel();
      sliders[f.key] = { wheel: true, sync: () => { readState(); paintWheel(); } };
      return;
    }

    wrap.innerHTML = `<span>${f.label}<em data-val="${f.key}">${label(f, cur[f.key])}</em></span>`;
    input.type = "range"; input.min = 0; input.max = 100; input.step = 1;
    input.value = pctOf(f, cur[f.key]);
    input.addEventListener("input", () => {
      const v = valOf(f, parseInt(input.value, 10));
      api.setParam(f.key, v);
      wrap.querySelector("[data-val]").textContent = label(f, v);
      save(LS_PARAMS, api.getParams());
      api.refresh();
    });
    wrap.appendChild(input);
    fieldsBox.appendChild(wrap);
    sliders[f.key] = { input, val: wrap.querySelector("[data-val]") };
  });

  function syncSliders() {
    const p = api.getParams();
    FIELDS.forEach(f => {
      const s = sliders[f.key];
      if (!s) return;
      if (s.wheel) { s.sync(); return; }
      s.input.value = pctOf(f, p[f.key]);
      s.val.textContent = label(f, p[f.key]);
    });
  }

  const status = panel.querySelector("#calib-status");
  const flash = msg => { status.textContent = msg; setTimeout(() => { if (status.textContent === msg) status.textContent = ""; }, 2000); };

  // Abrir / cerrar
  function open(o) { panel.hidden = !o; toggle.setAttribute("aria-expanded", String(o)); }
  toggle.addEventListener("click", () => open(panel.hidden));
  panel.querySelector("#calib-close").addEventListener("click", () => open(false));

  // Restablecer
  panel.querySelector("#calib-reset").addEventListener("click", () => {
    api.reset(); syncSliders(); save(LS_PARAMS, api.getParams()); flash("Valores por defecto restaurados.");
  });

  // Exportar
  panel.querySelector("#calib-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(api.getParams(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ime-conecta-input-calibracion.json";
    a.click(); URL.revokeObjectURL(a.href);
  });

  // Importar
  const fileInput = panel.querySelector("#calib-file");
  panel.querySelector("#calib-import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        api.setParams(JSON.parse(reader.result));
        syncSliders(); save(LS_PARAMS, api.getParams()); flash("Calibración importada.");
      } catch (e) { flash("Archivo inválido."); }
      fileInput.value = "";
    };
    reader.readAsText(file);
  });

  // ---- Sets por clase de dispositivo (Phone · Tablet · Desktop) ----
  // guardar → slot local (localStorage). cargar → slot local o, si está
  // vacío, el set publicado en Supabase. publicar → upsert en la tabla
  // ime_skin_calibracion: pasa a ser el estándar del sitio para esa clase.
  // ×3 sitios → mismo upsert pero con una fila por cada sitio de la
  // trilogía (la tabla es común, así que basta una sola petición).
  const SB = window.IME_SUPABASE || {};
  const TABLE = "/rest/v1/ime_skin_calibracion";
  const APP_KEYS = ["ime-link", "ime-conecta", "ime-planificacion"];

  async function fetchPublished(slot) {
    if (!SB.url || !SB.anonKey) return null;
    try {
      const res = await fetch(SB.url + TABLE +
        "?app_key=eq." + encodeURIComponent(SB.appKey || "") +
        "&device_class=eq." + slot + "&select=params",
        { headers: { apikey: SB.anonKey, Authorization: "Bearer " + SB.anonKey } });
      if (!res.ok) return null;
      const rows = await res.json();
      return (rows && rows[0] && rows[0].params) || null;
    } catch (e) { return null; }
  }

  async function publishSet(appKeys, slot, name) {
    if (!SB.url || !SB.anonKey) { flash("Supabase no está configurado."); return; }
    if (!auth.token) { flash("Inicia sesión (cuenta directora) para publicar."); return; }
    const current = api.getParams();
    const rows = appKeys.map(k => {
      const r = { app_key: k, device_class: slot, params: current };
      if (auth.userId) r.updated_by = auth.userId;
      return r;
    });
    try {
      const res = await fetch(SB.url + TABLE + "?on_conflict=app_key,device_class", {
        method: "POST",
        headers: {
          apikey: SB.anonKey, Authorization: "Bearer " + auth.token,
          "Content-Type": "application/json", Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(rows)
      });
      if (!res.ok) { flash("No se pudo publicar (" + res.status + ")."); return; }
      const presets = load(LS_PRESETS, {});
      presets[slot] = current; save(LS_PRESETS, presets);
      try { localStorage.setItem("ime-skin-set-" + (SB.appKey || "") + "-" + slot, JSON.stringify(current)); } catch (e) {}
      flash(appKeys.length > 1
        ? "Set " + name + " publicado en los 3 sitios."
        : "Set " + name + " publicado para todo el sitio.");
    } catch (e) { flash("Sin conexión: no se pudo publicar."); }
  }

  panel.querySelectorAll(".calib-presets button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const slot = btn.dataset.slot, act = btn.dataset.act;
      const name = KLASS_NAMES[slot] || slot;

      if (act === "save") {
        const presets = load(LS_PRESETS, {});
        presets[slot] = api.getParams(); save(LS_PRESETS, presets);
        flash("Set " + name + " guardado (local).");

      } else if (act === "load") {
        const presets = load(LS_PRESETS, {});
        let p = presets[slot];
        if (!p) { flash("Buscando set publicado…"); p = await fetchPublished(slot); }
        if (!p) { flash("Set " + name + " vacío."); return; }
        if (api.sanitize) p = api.sanitize(p);
        api.setParams(p); syncSliders(); save(LS_PARAMS, api.getParams());
        flash("Set " + name + " cargado.");

      } else if (act === "publish") {
        publishSet([SB.appKey], slot, name);

      } else if (act === "publish3") {
        if (!confirm("¿Publicar el set " + name + " en los TRES sitios IME?")) return;
        publishSet(APP_KEYS, slot, name);
      }
    });
  });

  // ---- Simulador de luz (solo Desktop) ----
  // Fuerza hora y mes para previsualizar la luz diurna y la calidez
  // estacional del campo. Es un lente local de este navegador: no
  // altera lo que ven los visitantes ni el tema del sitio (que sigue
  // el sol real). Ciclo 24 h y Ciclo anual animan un time-lapse.
  if (klass === "desktop" && api.simulate) {
    const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const simBox = document.createElement("div");
    simBox.className = "calib-sim";
    simBox.innerHTML = `
      <div class="calib-sim-head"><strong>Simulador de luz</strong><span>solo Desktop · vista local</span></div>
      <div class="calib-field"><span>Hora<em id="sim-hora-val">—</em></span><input id="sim-hora" type="range" min="0" max="95" step="1"></div>
      <div class="calib-field"><span>Mes<em id="sim-mes-val">—</em></span><input id="sim-mes" type="range" min="0" max="11" step="1"></div>
      <div class="calib-sim-btns">
        <button id="sim-real" class="btn btn-ghost btn-sm">Tiempo real</button>
        <button id="sim-dia" class="btn btn-ghost btn-sm">Ciclo 24 h</button>
        <button id="sim-anno" class="btn btn-ghost btn-sm">Ciclo anual</button>
      </div>
      <p class="calib-status" id="sim-status" aria-live="polite"></p>`;
    panel.insertBefore(simBox, status);

    const hEl = simBox.querySelector("#sim-hora"), mEl = simBox.querySelector("#sim-mes");
    const hVal = simBox.querySelector("#sim-hora-val"), mVal = simBox.querySelector("#sim-mes-val");
    const stEl = simBox.querySelector("#sim-status");
    const dayBtn = simBox.querySelector("#sim-dia"), yearBtn = simBox.querySelector("#sim-anno");
    const fmtH = h => {
      const hh = Math.floor(h) % 24, mm = Math.floor((h - Math.floor(h)) * 60);
      return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
    };
    const now = new Date();
    const sim = { hour: now.getHours() + now.getMinutes() / 60, month: now.getMonth() };
    let timer = null;

    function paint() {
      hEl.value = Math.round(sim.hour * 4) % 96;
      mEl.value = Math.min(11, Math.floor(sim.month));
      hVal.textContent = fmtH(sim.hour);
      mVal.textContent = MESES[Math.floor(sim.month) % 12];
    }
    function applySim() {
      api.simulate({ hour: sim.hour, month: sim.month });
      paint();
      stEl.textContent = "Simulando: " + fmtH(sim.hour) + " · " + MESES[Math.floor(sim.month) % 12];
    }
    function stopCycle() {
      if (timer) { clearInterval(timer); timer = null; }
      dayBtn.textContent = "Ciclo 24 h"; yearBtn.textContent = "Ciclo anual";
    }

    hEl.addEventListener("input", () => { stopCycle(); sim.hour = hEl.value / 4; applySim(); });
    mEl.addEventListener("input", () => { stopCycle(); sim.month = +mEl.value; applySim(); });

    simBox.querySelector("#sim-real").addEventListener("click", () => {
      stopCycle(); api.simulate(null);
      const n = new Date();
      sim.hour = n.getHours() + n.getMinutes() / 60; sim.month = n.getMonth();
      paint(); stEl.textContent = "Tiempo real.";
    });
    dayBtn.addEventListener("click", () => {
      const running = dayBtn.textContent === "Pausar";
      stopCycle(); if (running) return;
      dayBtn.textContent = "Pausar";
      timer = setInterval(() => { sim.hour = (sim.hour + 0.25) % 24; applySim(); }, 200);
    });
    yearBtn.addEventListener("click", () => {
      const running = yearBtn.textContent === "Pausar";
      stopCycle(); if (running) return;
      yearBtn.textContent = "Pausar";
      timer = setInterval(() => { sim.month = (sim.month + 0.06) % 12; applySim(); }, 100);
    });

    paint(); stEl.textContent = "Tiempo real.";
  }
})();
