/* ============================================================
   IME Link 2027 — Interacción del sitio
   Navegación, índice, progreso, búsqueda, tema, modo presentación
   y caja flotante de Notas (Supabase Auth + PostgREST, sin SDK).
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sections = $$("[data-section]");

  /* ---------- Gráfica viva ---------- */
  if (window.IMESkin) {
    IMESkin.mount({ canvas: "#ime-skin", appKey: (window.IME_SUPABASE || {}).appKey || "ime-link", sources: { day: function(){ try { return daylight(new Date(), loc.lat, loc.lon); } catch(e){ return 1; } } } });
  }

  /* ---------- Índice lateral ---------- */
  const navList = $("#sidenav-list");
  sections.forEach(sec => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + sec.id;
    a.textContent = sec.dataset.nav || sec.id;
    a.dataset.target = sec.id;
    li.appendChild(a);
    navList.appendChild(li);
  });
  const navLinks = $$("#sidenav-list a");

  /* ---------- Sección activa + progreso ---------- */
  const progressBar = $("#progress-bar");
  // Cache de posiciones: evita leer offsetTop en cada scroll (sin reflows).
  let sectionTops = [];
  function measureSections() { sectionTops = sections.map(s => s.offsetTop); }
  function currentIndex() {
    const mid = document.documentElement.scrollTop + window.innerHeight * 0.35;
    let ci = 0;
    for (let i = 0; i < sectionTops.length; i++) { if (sectionTops[i] <= mid) ci = i; }
    return ci;
  }
  let scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return; // agrupa eventos de scroll en un solo frame
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      progressBar.style.width = (scrolled * 100).toFixed(1) + "%";
      const cur = sections[currentIndex()];
      navLinks.forEach(a => a.classList.toggle("active", a.dataset.target === cur.id));
    });
  }
  measureSections();
  addEventListener("resize", measureSections, { passive: true });
  addEventListener("load", measureSections);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Tema día/noche automático (hora local + ubicación) + override manual ----------
     El tema sigue el amanecer/atardecer reales del visitante: la fecha (que varía con
     solsticios y equinoccios) y la ubicación aproximada (derivada de la zona horaria, sin
     geolocalización ni ubicación precisa). Hace un crossfade suave en torno al alba y el ocaso.
     El botón "Tema" es un override manual opcional que se recuerda. */
  const themeBtn = $("#btn-theme");
  const root = document.documentElement;
  const VARS = ["bg", "surface", "surface-2", "text", "text-dim", "line", "accent", "accent-2"];
  const DARK = { bg:[11,20,19], surface:[20,33,31], "surface-2":[27,43,40], text:[234,246,243],
    "text-dim":[159,184,178], line:[95,215,223,0.18], accent:[95,215,223], "accent-2":[52,216,167] };
  const LIGHT = { bg:[246,244,239], surface:[255,255,255], "surface-2":[238,241,238], text:[22,32,30],
    "text-dim":[76,96,91], line:[20,120,120,0.18], accent:[15,154,163], "accent-2":[20,156,121] };
  // Coordenadas aproximadas por zona horaria (contexto grueso, sin ubicación precisa).
  const TZ = {
    "America/Santiago":[-33.45,-70.67],"Pacific/Easter":[-27.15,-109.43],"America/Punta_Arenas":[-53.16,-70.92],
    "America/Argentina/Buenos_Aires":[-34.6,-58.38],"America/Sao_Paulo":[-23.55,-46.63],"America/Lima":[-12.05,-77.04],
    "America/Bogota":[4.71,-74.07],"America/La_Paz":[-16.5,-68.15],"America/Asuncion":[-25.3,-57.63],
    "America/Montevideo":[-34.9,-56.16],"America/Guayaquil":[-2.17,-79.92],"America/Caracas":[10.48,-66.9],
    "America/Mexico_City":[19.43,-99.13],"America/Panama":[8.98,-79.52],"America/Costa_Rica":[9.93,-84.08],
    "America/New_York":[40.71,-74.0],"America/Chicago":[41.88,-87.63],"America/Denver":[39.74,-104.99],
    "America/Los_Angeles":[34.05,-118.24],"America/Toronto":[43.65,-79.38],
    "Europe/Madrid":[40.42,-3.7],"Europe/Lisbon":[38.72,-9.14],"Europe/London":[51.51,-0.13],
    "Europe/Paris":[48.85,2.35],"Europe/Berlin":[52.52,13.4],"Europe/Rome":[41.9,12.5],"Europe/Amsterdam":[52.37,4.9],
    "Africa/Johannesburg":[-26.2,28.04],"Asia/Dubai":[25.2,55.27],"Asia/Kolkata":[28.61,77.21],
    "Asia/Shanghai":[31.23,121.47],"Asia/Tokyo":[35.68,139.69],"Australia/Sydney":[-33.87,151.21],
    "Pacific/Auckland":[-36.85,174.76]
  };
  function locate() {
    let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    if (TZ[tz]) return { lat: TZ[tz][0], lon: TZ[tz][1] };
    return { lat: 0, lon: -(new Date().getTimezoneOffset()) / 4 };
  }
  const smoothstep = (a, b, x) => { if (a === b) return x < a ? 0 : 1; const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function sunCalc(date, lat, lon) {
    const rad = Math.PI / 180;
    const startY = new Date(date.getFullYear(), 0, 0);
    const N = Math.floor((date - startY) / 86400000);
    const decl = -23.44 * Math.cos(rad * (360 / 365) * (N + 10)); // declinación (estación)
    const cosH = -Math.tan(lat * rad) * Math.tan(decl * rad);
    const noon = 12 - lon / 15 + (-date.getTimezoneOffset() / 60);
    let sr = null, ss = null;
    if (cosH > -1 && cosH < 1) { const T = Math.acos(cosH) / rad / 15; sr = noon - T; ss = noon + T; }
    return { cosH, noon, sr, ss };
  }
  function daylight(date, lat, lon) {
    const s = sunCalc(date, lat, lon);
    if (s.cosH <= -1) return 1;  // día polar
    if (s.cosH >= 1) return 0;   // noche polar
    const t = date.getHours() + date.getMinutes() / 60, w = 0.8; // ventana de crepúsculo (~48 min)
    return Math.max(0, Math.min(1, Math.min(smoothstep(s.sr - w, s.sr + w, t), 1 - smoothstep(s.ss - w, s.ss + w, t))));
  }
  const mix = (a, b, t) => {
    const c = i => Math.round((a[i] || 0) + ((b[i] || 0) - (a[i] || 0)) * t);
    const al = (a[3] == null ? 1 : a[3]) + ((b[3] == null ? 1 : b[3]) - (a[3] == null ? 1 : a[3])) * t;
    return `rgba(${c(0)},${c(1)},${c(2)},${+al.toFixed(3)})`;
  };
  const loc = locate();
  let autoTimer = null;
  function applyAuto() {
    const d = daylight(new Date(), loc.lat, loc.lon);
    VARS.forEach(k => root.style.setProperty("--" + k, mix(DARK[k], LIGHT[k], d)));
    root.setAttribute("data-theme", d >= 0.5 ? "light" : "dark");
    themeBtn.setAttribute("aria-pressed", String(d >= 0.5));
  }
  function startAuto() { applyAuto(); autoTimer = setInterval(applyAuto, 5 * 60 * 1000); }
  function setManual(t) {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    VARS.forEach(k => root.style.removeProperty("--" + k)); // vuelve a la paleta CSS estática
    root.setAttribute("data-theme", t);
    themeBtn.setAttribute("aria-pressed", String(t === "light"));
  }
  function ensureAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } startAuto(); }
  function applyMode(m) {
    if (m === "light" || m === "dark") setManual(m); else ensureAuto();
    themeBtn.title = m === "light" ? "Tema diurno" : (m === "dark" ? "Tema nocturno" : "Tema local (hora y lugar)");
  }
  // Siempre arranca en AUTO (geoestacionario). El cambio manual dura solo la sesión
  // actual y NO se guarda: al volver o recargar, vuelve a auto.
  try { localStorage.removeItem("imelink-theme"); } catch (e) {} // limpia preferencias antiguas
  let currentMode = "auto";
  applyMode("auto");
  themeBtn.addEventListener("click", () => {
    currentMode = currentMode === "auto" ? "light" : (currentMode === "light" ? "dark" : "auto");
    applyMode(currentMode);
  });

  // Diagnóstico del tema geoestacionario. En consola:  IMETheme.info()
  function hhmm(x) {
    if (x == null) return "—";
    x = ((x % 24) + 24) % 24;
    let hh = Math.floor(x), mm = Math.round((x - hh) * 60);
    if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }
  window.IMETheme = {
    info: function () {
      const now = new Date();
      const s = sunCalc(now, loc.lat, loc.lon);
      let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
      return {
        modo: currentMode,                            // 'auto' | 'light' | 'dark' (solo esta sesión)
        automatico: !!autoTimer,                       // true = el tema geoestacionario está activo
        tema: root.getAttribute("data-theme"),         // 'light' | 'dark' calculado ahora
        luzDia: +daylight(now, loc.lat, loc.lon).toFixed(3), // 0 = noche, 1 = día
        amanecer: hhmm(s.sr),
        atardecer: hhmm(s.ss),
        zonaHoraria: tz,
        lat: loc.lat, lon: loc.lon
      };
    }
  };

  /* ---------- Búsqueda ---------- */
  const searchBtn = $("#btn-search");
  const searchPanel = $("#search-panel");
  const searchInput = $("#search-input");
  const searchResults = $("#search-results");
  const index = sections.map(sec => ({
    id: sec.id,
    title: sec.dataset.nav || sec.id,
    text: (sec.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(),
    tags: (sec.dataset.tags || "").toLowerCase()
  }));
  function toggleSearch(open) {
    searchPanel.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) { searchInput.value = ""; searchResults.innerHTML = ""; searchInput.focus(); }
  }
  searchBtn.addEventListener("click", () => toggleSearch(searchPanel.hidden));
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (q.length < 2) return;
    index.filter(s => s.title.toLowerCase().includes(q) || s.text.includes(q) || s.tags.includes(q))
      .slice(0, 8).forEach(s => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + s.id; a.innerHTML = s.title + "<small>Ir a la sección</small>";
        a.addEventListener("click", () => toggleSearch(false));
        li.appendChild(a); searchResults.appendChild(li);
      });
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") toggleSearch(false); });

  /* ---------- Modo presentación ---------- */
  const presentBtn = $("#btn-present");
  const pControls = $("#present-controls");
  const pProgress = $("#present-progress");
  let presenting = false, pIndex = 0;
  function showSlide(i) {
    pIndex = Math.max(0, Math.min(sections.length - 1, i));
    sections.forEach((s, k) => s.classList.toggle("present-active", k === pIndex));
    pProgress.textContent = (pIndex + 1) + " / " + sections.length;
  }
  function setPresenting(on) {
    presenting = on;
    document.body.classList.toggle("presenting", on);
    pControls.hidden = !on;
    presentBtn.setAttribute("aria-pressed", String(on));
    if (on) showSlide(0);
    else sections.forEach(s => s.classList.remove("present-active"));
  }
  presentBtn.addEventListener("click", () => setPresenting(!presenting));
  $("#present-prev").addEventListener("click", () => showSlide(pIndex - 1));
  $("#present-next").addEventListener("click", () => showSlide(pIndex + 1));
  $("#present-exit").addEventListener("click", () => setPresenting(false));
  document.addEventListener("keydown", e => {
    if (!presenting) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") showSlide(pIndex + 1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") showSlide(pIndex - 1);
    if (e.key === "Escape") setPresenting(false);
  });

  /* ---------- Caja flotante de Notas (Supabase) ---------- */
  const cfg = window.IME_SUPABASE || {};
  const configured = cfg.url && cfg.anonKey && cfg.anonKey.indexOf("PEGAR_") === -1;
  const toggle = $("#notes-toggle");
  const panel = $("#notes-panel");
  const loginBox = $("#notes-login");
  const editorBox = $("#notes-editor");
  const status = $("#notes-status");
  const status2 = $("#notes-status2");
  const sectionLabel = $("#notes-section-label");
  let session = null; // { token, userId, name }

  // La nota se asocia a la sección activa actual (usa el cache de posiciones).
  function activeSectionId() {
    return sections[currentIndex()].id;
  }
  function refreshLabel() {
    const id = activeSectionId();
    const sec = sections.find(s => s.id === id);
    sectionLabel.textContent = sec ? (sec.dataset.nav || id) : id;
  }

  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) { refreshLabel(); }
  }
  toggle.addEventListener("click", () => openPanel(panel.hidden));
  $("#notes-close").addEventListener("click", () => openPanel(false));
  addEventListener("scroll", () => { if (!panel.hidden) { refreshLabel(); updateNoteContext(); } }, { passive: true });

  // Arrastrar el panel por su cabecera (posición persistente).
  (function drag() {
    const head = $("#notes-head"); let sx, sy, ox, oy, dragging = false;
    try {
      const saved = JSON.parse(localStorage.getItem("imelink-notes-pos") || "null");
      if (saved) { panel.style.left = saved.x + "px"; panel.style.top = saved.y + "px"; panel.style.right = "auto"; panel.style.bottom = "auto"; }
    } catch (e) {}
    head.addEventListener("pointerdown", e => {
      if (e.target.closest("button")) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      const r = panel.getBoundingClientRect(); ox = r.left; oy = r.top;
      head.setPointerCapture(e.pointerId);
    });
    head.addEventListener("pointermove", e => {
      if (!dragging) return;
      let nx = Math.max(4, Math.min(innerWidth - panel.offsetWidth - 4, ox + e.clientX - sx));
      let ny = Math.max(4, Math.min(innerHeight - 40, oy + e.clientY - sy));
      panel.style.left = nx + "px"; panel.style.top = ny + "px"; panel.style.right = "auto"; panel.style.bottom = "auto";
    });
    head.addEventListener("pointerup", () => {
      if (!dragging) return; dragging = false;
      try { localStorage.setItem("imelink-notes-pos", JSON.stringify({ x: parseInt(panel.style.left), y: parseInt(panel.style.top) })); } catch (e) {}
    });
  })();

  function rest(path, opts) {
    return fetch(cfg.url + path, Object.assign({ headers: {
      apikey: cfg.anonKey,
      Authorization: "Bearer " + (session ? session.token : cfg.anonKey),
      "Content-Type": "application/json"
    } }, opts));
  }

  // Iniciar sesión: alias -> correo -> token Supabase Auth.
  $("#notes-signin").addEventListener("click", async () => {
    setStatus(status, "", "");
    if (!configured) { setStatus(status, "Supabase aún no está configurado (ver README).", "err"); return; }
    const email = $("#notes-user").value.trim().toLowerCase();
    const password = $("#notes-pass").value;
    if (!email.includes("@") || !password) { setStatus(status, "Correo o contraseña inválidos.", "err"); return; }
    try {
      const res = await fetch(cfg.url + "/auth/v1/token?grant_type=password", {
        method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setStatus(status, "No se pudo iniciar sesión.", "err"); return; }
      session = { token: data.access_token, userId: data.user.id, name: email };
      session.mustChange = !!(data.user && data.user.user_metadata && data.user.user_metadata.must_change_password);
      // Validar perfil de director activo.
      const prof = await rest(`/rest/v1/ime_socios?id=eq.${session.userId}&active=eq.true&select=full_name`, {});
      const rows = await prof.json();
      if (!rows.length) { session = null; setStatus(status, "Tu cuenta no está habilitada como socix.", "err"); return; }
      session.name = rows[0].full_name || email;
      session.email = email;
      window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email } }));
      enterEditor();
    } catch (e) { setStatus(status, "Error de conexión con Supabase.", "err"); }
  });

  function enterEditor() {
    $("#notes-session-name").textContent = session.name;
    const back = $("#notes-clave-back");
    if (session.mustChange) {
      // Primer ingreso con clave común: obligar a definir una propia.
      showScene("clave");
      if (back) back.style.display = "none"; // sin escape hasta que la cambie
      const s3 = $("#notes-status3");
      s3.style.color = "var(--coral)";
      s3.textContent = "Primer ingreso: define tu propia contraseña para continuar.";
      $("#notes-newpass").focus();
      return;
    }
    if (back) back.style.display = "";
    showScene("editor");
    updateNoteContext();
    // La caja se abre siempre vacía, lista para una nota nueva.
    $("#notes-text").value = ""; clearImages(); setStatus(status2, "", "");
  }
  $("#notes-signout").addEventListener("click", () => {
    session = null; editorBox.hidden = true; loginBox.hidden = false; var _c = $("#notes-clave"); if (_c) _c.hidden = true;
    $("#notes-pass").value = ""; setStatus(status, "", ""); clearImages();
    window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: null } }));
  });

  // ---- Imágenes de nota (Supabase Storage) ----
  const BUCKET = "notas";
  const imgUrl = path => `${cfg.url}/storage/v1/object/public/${BUCKET}/${path}`;
  // Dos slots de imagen: "attach" -> image_path, "capture" -> image_path2
  const COL = { attach: "image_path", capture: "image_path2" };
  const tileEl = slot => $(slot === "attach" ? "#tile-adjuntar" : "#tile-capturar");
  function showTile(slot, path) {
    const tile = tileEl(slot);
    const view = tile.querySelector(".notes-tile-view");
    const img = view.querySelector("img");
    const x = tile.querySelector(".notes-tile-x");
    if (path) {
      img.src = imgUrl(path); view.href = imgUrl(path);
      view.hidden = false; x.hidden = false; tile.classList.add("has-image");
    } else {
      view.hidden = true; x.hidden = true; img.removeAttribute("src"); tile.classList.remove("has-image");
    }
  }
  function clearImages() { showTile("attach", null); showTile("capture", null); }

  // Mensaje de estado con color e ícono según resultado: "ok" | "err" | "info".
  function setStatus(el, msg, state) {
    if (!el) return;
    if (el._t) { clearTimeout(el._t); el._t = 0; }
    el.textContent = msg || "";
    if (state === "ok" || state === "err") { el.setAttribute("data-state", state); el.style.color = ""; }
    else { el.removeAttribute("data-state"); el.style.color = "var(--text-dim)"; }
    el.classList.remove("flash");
    if (msg) { void el.offsetWidth; el.classList.add("flash"); } // reinicia el destello
    // Los éxitos se desvanecen solos; errores e info permanecen hasta el siguiente mensaje.
    if (state === "ok") el._t = setTimeout(() => { el.textContent = ""; el.removeAttribute("data-state"); el.classList.remove("flash"); }, 2600);
  }

  async function saveImage(blob, slot) {
    if (!session || !blob) return;
    const sid = activeSectionId();
    setStatus(status2, "Subiendo imagen…", "info");
    try {
      const ext = blob.type === "image/png" ? "png" : (blob.type === "image/jpeg" ? "jpg" : "img");
      const path = `${cfg.appKey}/${sid}/${session.userId}/${slot}-${Date.now()}.${ext}`;
      const up = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": blob.type || "image/png", "x-upsert": "true" },
        body: blob
      });
      if (!up.ok) { setStatus(status2, "No se pudo subir (¿Storage configurado?).", "err"); return; }
      const row = { app_key: cfg.appKey, section_id: sid, user_id: session.userId };
      row[COL[slot]] = path;
      const res = await rest(`/rest/v1/${cfg.tables.notes}?on_conflict=app_key,section_id,user_id`, {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify([row])
      });
      if (res.ok) { showTile(slot, path); setStatus(status2, "Imagen guardada.", "ok"); }
      else { setStatus(status2, "Imagen subida, pero no se guardó la referencia.", "err"); }
    } catch (e) { setStatus(status2, "Error con la imagen.", "err"); }
  }

  async function removeImage(slot) {
    showTile(slot, null);
    if (!session) return;
    const sid = activeSectionId();
    const patch = {}; patch[COL[slot]] = null;
    try {
      await rest(`/rest/v1/${cfg.tables.notes}?app_key=eq.${cfg.appKey}&section_id=eq.${sid}&user_id=eq.${session.userId}`, {
        method: "PATCH",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  }

  async function capturePage() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setStatus(status2, "Tu navegador no permite capturar la página.", "err"); return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true });
      const track = stream.getVideoTracks()[0];
      const video = document.createElement("video");
      video.srcObject = stream; await video.play();
      await new Promise(r => setTimeout(r, 250));
      const c = document.createElement("canvas");
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext("2d").drawImage(video, 0, 0);
      track.stop();
      const blob = await new Promise(res => c.toBlob(res, "image/png"));
      await saveImage(blob, "capture");
    } catch (e) { setStatus(status2, "Captura cancelada.", "info"); }
  }

  const MAX_MB = 5;
  const TIPOS_OK = ["image/jpeg", "image/png", "image/webp"];
  $("#notes-attach").addEventListener("click", () => $("#notes-file").click());
  $("#notes-file").addEventListener("change", () => {
    const f = $("#notes-file").files[0];
    $("#notes-file").value = "";
    if (!f) return;
    if (!TIPOS_OK.includes(f.type)) {
      setStatus(status2, "Solo se permiten imágenes JPG, PNG o WEBP.", "err");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setStatus(status2, `La imagen supera el máximo de ${MAX_MB} MB.`, "err");
      return;
    }
    saveImage(f, "attach");
  });
  $("#notes-capture").addEventListener("click", capturePage);
  tileEl("attach").querySelector(".notes-tile-x").addEventListener("click", () => removeImage("attach"));
  tileEl("capture").querySelector(".notes-tile-x").addEventListener("click", () => removeImage("capture"));
  $("#notes-clear").addEventListener("click", () => { $("#notes-text").value = ""; clearImages(); setStatus(status2, "", ""); });
  function showScene(w) {
    $("#notes-login").hidden = w !== "login";
    $("#notes-editor").hidden = w !== "editor";
    $("#notes-clave").hidden = w !== "clave";
  }
  $("#notes-pass-toggle").addEventListener("click", () => showScene("clave"));
  $("#notes-clave-back").addEventListener("click", () => showScene("editor"));
  $("#notes-signout2").addEventListener("click", () => $("#notes-signout").click());
  $("#notes-pass-save").addEventListener("click", async () => {
    if (!session) return;
    const s3 = $("#notes-status3");
    const np = $("#notes-newpass").value;
    if (!np || np.length < 6) { setStatus(s3, "La contraseña debe tener al menos 6 caracteres.", "err"); return; }
    const reqBody = { password: np };
    if (session.mustChange) reqBody.data = { must_change_password: false };
    try {
      const res = await fetch(cfg.url + "/auth/v1/user", { method: "PUT", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" }, body: JSON.stringify(reqBody) });
      if (res.ok) {
        $("#notes-newpass").value = "";
        if (session.mustChange) {
          session.mustChange = false;
          setStatus(s3, "¡Listo! Contraseña definida.", "ok");
          enterEditor(); // ahora sí pasa al editor
        } else {
          setStatus(s3, "Contraseña actualizada.", "ok");
        }
      }
      else { setStatus(s3, "No se pudo actualizar la contraseña.", "err"); }
    } catch (e) { setStatus(s3, "Error al actualizar.", "err"); }
  });

  $("#notes-save").addEventListener("click", async () => {
    if (!session) return;
    if (!confirm("Vas a guardar tu nota en esta sección. Podrás editarla o borrarla cuando quieras. ¿Enviar ahora?")) return;
    const sid = activeSectionId();
    const body = [{ app_key: cfg.appKey, section_id: sid, user_id: session.userId, note_text: $("#notes-text").value }];
    try {
      const res = await rest(`/rest/v1/${cfg.tables.notes}?on_conflict=app_key,section_id,user_id`, {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify(body)
      });
      if (res.ok) { $("#notes-text").value = ""; clearImages(); setStatus(status2, "Nota enviada.", "ok"); }
      else { setStatus(status2, "No se pudo guardar.", "err"); }
    } catch (e) { setStatus(status2, "Error al guardar.", "err"); }
  });

  function sectionName(id) {
    const sec = sections.find(s => s.id === id);
    return sec ? (sec.dataset.nav || id) : id;
  }
  // Ayuda contextual: indica que la nota es privada y a qué sección queda asociada.
  function updateNoteContext() {
    const el = $("#notes-context");
    if (el) el.innerHTML = "Nota privada · sección: <b>" + sectionName(activeSectionId()) + "</b>";
  }
  // Deshacer: elimina únicamente la última nota guardada (arrepentimiento).
  $("#notes-delete").addEventListener("click", async () => {
    if (!session) return;
    setStatus(status2, "Buscando tu última nota…", "info");
    let last;
    try {
      const res = await rest(`/rest/v1/${cfg.tables.notes}?app_key=eq.${cfg.appKey}&user_id=eq.${session.userId}&select=section_id,updated_at&order=updated_at.desc&limit=1`, {});
      const rows = await res.json();
      last = Array.isArray(rows) ? rows[0] : null;
    } catch (e) { setStatus(status2, "No se pudo consultar tus notas.", "err"); return; }
    if (!last) { setStatus(status2, "No tienes ninguna nota para deshacer.", "info"); return; }
    if (!confirm(`Vas a deshacer tu última nota guardada (sección: ${sectionName(last.section_id)}), junto con sus imágenes. Esta acción no se puede deshacer. ¿Continuar?`)) { setStatus(status2, "", ""); return; }
    try {
      const res = await rest(`/rest/v1/${cfg.tables.notes}?app_key=eq.${cfg.appKey}&section_id=eq.${last.section_id}&user_id=eq.${session.userId}`, { method: "DELETE" });
      if (res.ok) {
        if (last.section_id === activeSectionId()) { $("#notes-text").value = ""; clearImages(); }
        setStatus(status2, "Última nota deshecha.", "ok");
      } else { setStatus(status2, "No se pudo deshacer.", "err"); }
    } catch (e) { setStatus(status2, "Error al deshacer.", "err"); }
  });

  /* ---------- Controles flotantes arrastrables (presentación y Notas) ---------- */
  function makeDraggable(el, key) {
    if (!el) return;
    try {
      const p = JSON.parse(localStorage.getItem(key) || "null");
      if (p) { el.style.left = p.x + "px"; el.style.top = p.y + "px"; el.style.right = "auto"; el.style.bottom = "auto"; el.style.transform = "none"; }
    } catch (e) {}
    let down = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    el.style.touchAction = "none";
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", e => {
      down = true; moved = false; sx = e.clientX; sy = e.clientY;
      const r = el.getBoundingClientRect(); ox = r.left; oy = r.top;
      el.style.cursor = "grabbing";
    });
    window.addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      const nx = Math.max(4, Math.min(innerWidth - el.offsetWidth - 4, ox + dx));
      const ny = Math.max(4, Math.min(innerHeight - el.offsetHeight - 4, oy + dy));
      el.style.transform = "none"; el.style.right = "auto"; el.style.bottom = "auto";
      el.style.left = nx + "px"; el.style.top = ny + "px";
    });
    window.addEventListener("pointerup", () => {
      if (down) { el.style.cursor = "grab"; if (moved) { try { localStorage.setItem(key, JSON.stringify({ x: parseInt(el.style.left), y: parseInt(el.style.top) })); } catch (e) {} } }
      down = false;
    });
    el.addEventListener("click", e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }
  makeDraggable($("#present-controls"), "imelink-pos-present");
  makeDraggable($("#notes-toggle"), "imelink-pos-notes-toggle");
  window.IMEDrag = makeDraggable;
  (function(){ var m = $("#ime-mail"); if(m){ var u="imechileimechile"; m.textContent = u+"@gmail.com"; m.href = "mailto:"+u+"@gmail.com"; } })();
})();
