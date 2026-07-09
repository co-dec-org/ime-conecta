/* ============================================================
   IME Link 2027 — Calibrador de entrada
   Panel para ajustar en vivo los parámetros del input
   (mouse · touch · multitouch) del motor de gráfica viva.
   Diagnóstico del dispositivo · presets (localStorage) · export/import.
   Depende de window.IMESkinAPI (ver ime-skin.js).
   ============================================================ */
(function () {
  "use strict";
  const api = window.IMESkinAPI;
  if (!api) return; // sin WebGL no hay nada que calibrar

  const LS_PARAMS = "imelink-input-params";
  const LS_PRESETS = "imelink-input-presets";

  const FIELDS = [
    { key: "radius",        label: "Radio de influencia",       min: 0.05, max: 0.50, step: 0.01 },
    { key: "warpGain",      label: "Intensidad (agitación)",    min: 0,    max: 4,    step: 0.1  },
    { key: "glow",          label: "Brillo del halo",           min: 0,    max: 1,    step: 0.05 },
    { key: "smoothing",     label: "Suavizado",                 min: 0.03, max: 0.40, step: 0.01 },
    { key: "pressedMul",    label: "Fuerza al presionar (mouse)", min: 1,  max: 3,    step: 0.1  },
    { key: "touchStrength", label: "Fuerza de toque",           min: 0.5,  max: 2.5,  step: 0.05 },
    { key: "maxPointers",   label: "Máx. atractores",           min: 1,    max: 10,   step: 1    }
  ];

  const fmt = (k, v) => (k === "maxPointers" ? String(v) : (+v).toFixed(2));
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
  const diag = `Dispositivo: ${info.touch ? "Táctil" : "Escritorio"} · ` +
    `Multitouch: ${info.maxTouch || 0} · Núcleos: ${info.cores ?? "?"} · ` +
    `Memoria: ${info.memory ? info.memory + " GB" : "?"} · DPR: ${info.dpr}`;

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
      <span>Presets:</span>
      <div data-slot="1"><b>1</b><button class="linkbtn" data-act="load" data-slot="1">cargar</button><button class="linkbtn" data-act="save" data-slot="1">guardar</button></div>
      <div data-slot="2"><b>2</b><button class="linkbtn" data-act="load" data-slot="2">cargar</button><button class="linkbtn" data-act="save" data-slot="2">guardar</button></div>
      <div data-slot="3"><b>3</b><button class="linkbtn" data-act="load" data-slot="3">cargar</button><button class="linkbtn" data-act="save" data-slot="3">guardar</button></div>
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

  // Visibilidad restringida: el calibrador solo aparece para el director co.dec.org
  toggle.style.display = "none";
  window.addEventListener("ime:auth", e => {
    const allowed = e.detail && e.detail.email === "co.dec.org@gmail.com";
    toggle.style.display = allowed ? "" : "none";
    if (!allowed) open(false);
  });

  // Construir sliders
  const fieldsBox = panel.querySelector(".calib-fields");
  const cur = api.getParams();
  FIELDS.forEach(f => {
    const wrap = document.createElement("label");
    wrap.className = "calib-field";
    wrap.innerHTML = `<span>${f.label}<em data-val="${f.key}">${fmt(f.key, cur[f.key])}</em></span>`;
    const input = document.createElement("input");
    input.type = "range"; input.min = f.min; input.max = f.max; input.step = f.step;
    input.value = cur[f.key];
    input.addEventListener("input", () => {
      const v = f.key === "maxPointers" ? parseInt(input.value, 10) : parseFloat(input.value);
      api.setParam(f.key, v);
      wrap.querySelector("[data-val]").textContent = fmt(f.key, v);
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
      sliders[f.key].input.value = p[f.key];
      sliders[f.key].val.textContent = fmt(f.key, p[f.key]);
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
    a.download = "ime-link-input-calibracion.json";
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

  // Presets
  panel.querySelectorAll(".calib-presets button").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = btn.dataset.slot, act = btn.dataset.act;
      const presets = load(LS_PRESETS, {});
      if (act === "save") {
        presets[slot] = api.getParams(); save(LS_PRESETS, presets); flash("Preset " + slot + " guardado.");
      } else {
        if (!presets[slot]) { flash("Preset " + slot + " vacío."); return; }
        api.setParams(presets[slot]); syncSliders(); save(LS_PARAMS, api.getParams()); flash("Preset " + slot + " cargado.");
      }
    });
  });
})();
