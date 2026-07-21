/* ============================================================
   IME · Caja de Notas compartida (Conecta / Socixs / Panel)
   Inyecta el markup y la lógica idénticos en cualquier página.
   Sesión compartida vía IMEAuth; padrón ime_socios; notas en
   ime_section_notes separadas por app_key + section_id.

   Uso:  IMENotes.mount({
           getSectionId:   function(){ return "socixs"; },
           getSectionName: function(id){ return "Área de socixs"; }
         });
   ============================================================ */
(function () {
  "use strict";
  var cfg = window.IME_SUPABASE || {};
  var configured = cfg.url && cfg.anonKey && cfg.anonKey.indexOf("PEGAR_") === -1;
  var session = null, opts = {};
  var BUCKET = "notas";
  var COL = { attach: "image_path", capture: "image_path2" };
  var MAX_MB = 5, TIPOS_OK = ["image/jpeg", "image/png", "image/webp"];

  function $(s) { return document.querySelector(s); }
  function sid() { try { return opts.getSectionId ? opts.getSectionId() : "general"; } catch (e) { return "general"; } }
  function sname(id) { try { return opts.getSectionName ? opts.getSectionName(id) : id; } catch (e) { return id; } }

  // ---------- markup (idéntico al de Conecta) ----------
  var MARKUP =
    '<button id="notes-toggle" class="notes-toggle" aria-controls="notes-panel" aria-expanded="false" aria-label="Notas">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.4-4.2A8.5 8.5 0 1 1 21 11.5z"/></svg>' +
    '</button>' +
    '<section id="notes-panel" class="notes-panel" aria-label="Notas" hidden>' +
      '<header class="notes-head" id="notes-head">' +
        '<span class="notes-section" id="notes-section-label">Sección</span>' +
        '<div class="notes-head-btns"><button id="notes-move" title="Mover" aria-label="Mover">⠿</button><button id="notes-close" title="Cerrar" aria-label="Cerrar">✕</button></div>' +
      '</header>' +
      '<div id="notes-login">' +
        '<p class="notes-intro">Notas para socixs registradxs en IME Chile.<br>Son privadas: inicia sesión para dejar la tuya.</p>' +
        '<label>Correo<input type="email" id="notes-user" autocomplete="email" placeholder="nombre@correo.com" /></label>' +
        '<label>Contraseña<input type="password" id="notes-pass" autocomplete="current-password" /></label>' +
        '<button id="notes-signin" class="btn btn-primary btn-sm">Ingresar</button>' +
        '<p class="notes-status" id="notes-status" aria-live="polite"></p>' +
      '</div>' +
      '<div id="notes-editor" hidden>' +
        '<div class="notes-box notes-session-bar"><span id="notes-session-name"></span><span class="notes-links"><button id="notes-pass-toggle" class="linkbtn" type="button">Clave</button><button id="notes-signout" class="linkbtn">Salir</button></span></div>' +
        '<p class="notes-intro" style="margin:2px 0 10px;font-size:11px;opacity:.85;">Tu nota es privada y queda asociada a la sección que estás leyendo. Hay una nota por sección.</p>' +
        '<div class="notes-box notes-content">' +
          '<p class="notes-context" id="notes-context"></p>' +
          '<label class="notes-comment-label" for="notes-text">Escribe tu comentario</label>' +
          '<textarea id="notes-text" placeholder="Escribe tu comentario…"></textarea>' +
          '<div class="notes-tiles">' +
            '<div class="notes-tile" id="tile-adjuntar">' +
              '<button id="notes-attach" class="notes-tile-btn" type="button" title="Adjunta una imagen (JPG/PNG/WEBP, máx. 5 MB)"><span class="notes-tile-label">Adjuntar imagen</span><span class="notes-tile-hint">JPG o PNG · máx. 5 MB</span></button>' +
              '<a class="notes-tile-view" href="#" target="_blank" rel="noopener" hidden><img alt="Imagen adjunta" /></a>' +
              '<button class="notes-tile-x" type="button" aria-label="Quitar imagen" hidden>✕</button>' +
              '<input id="notes-file" type="file" accept="image/jpeg,image/png,image/webp" hidden />' +
            '</div>' +
            '<div class="notes-tile" id="tile-capturar">' +
              '<button id="notes-capture" class="notes-tile-btn" type="button" title="Toma una captura de la página actual"><span class="notes-tile-label">Capturar pantalla</span><span class="notes-tile-hint">Toma una captura de la página</span></button>' +
              '<a class="notes-tile-view" href="#" target="_blank" rel="noopener" hidden><img alt="Captura de página" /></a>' +
              '<button class="notes-tile-x" type="button" aria-label="Quitar imagen" hidden>✕</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="notes-box notes-actions">' +
          '<button id="notes-save" class="btn btn-primary btn-sm" title="Guarda o actualiza tu nota en esta sección">Enviar</button>' +
          '<button id="notes-delete" class="btn btn-ghost btn-sm" title="Elimina tu última nota guardada">Deshacer</button>' +
          '<button id="notes-clear" class="btn btn-ghost btn-sm" type="button" title="Vacía la caja sin borrar lo guardado">Limpiar</button>' +
        '</div>' +
        '<p class="notes-status" id="notes-status2" aria-live="polite"></p>' +
      '</div>' +
      '<div id="notes-clave" hidden>' +
        '<div class="notes-session-bar"><button id="notes-clave-back" class="linkbtn" type="button">‹ Volver</button><button id="notes-signout2" class="linkbtn">Salir</button></div>' +
        '<label class="notes-comment-label" for="notes-newpass">Nueva contraseña</label>' +
        '<input type="password" id="notes-newpass" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />' +
        '<button id="notes-pass-save" class="btn btn-primary btn-sm">Guardar contraseña</button>' +
        '<p class="notes-status" id="notes-status3" aria-live="polite"></p>' +
      '</div>' +
    '</section>';

  // ---------- utilidades ----------
  function setStatus(el, msg, state) {
    if (!el) return;
    if (el._t) { clearTimeout(el._t); el._t = 0; }
    el.textContent = msg || "";
    if (state === "ok" || state === "err") { el.setAttribute("data-state", state); el.style.color = ""; }
    else { el.removeAttribute("data-state"); el.style.color = "var(--text-dim)"; }
    el.classList.remove("flash");
    if (msg) { void el.offsetWidth; el.classList.add("flash"); }
    if (state === "ok") el._t = setTimeout(function () { el.textContent = ""; el.removeAttribute("data-state"); el.classList.remove("flash"); }, 2600);
  }
  function rest(path, o) {
    return fetch(cfg.url + path, Object.assign({ headers: {
      apikey: cfg.anonKey, Authorization: "Bearer " + (session ? session.token : cfg.anonKey), "Content-Type": "application/json"
    } }, o));
  }
  var imgUrl = function (p) { return cfg.url + "/storage/v1/object/public/" + BUCKET + "/" + p; };
  function tileEl(slot) { return $(slot === "attach" ? "#tile-adjuntar" : "#tile-capturar"); }
  function showTile(slot, path) {
    var tile = tileEl(slot); if (!tile) return;
    var view = tile.querySelector(".notes-tile-view"), img = view.querySelector("img"), x = tile.querySelector(".notes-tile-x");
    if (path) { img.src = imgUrl(path); view.href = imgUrl(path); view.hidden = false; x.hidden = false; tile.classList.add("has-image"); }
    else { view.hidden = true; x.hidden = true; img.removeAttribute("src"); tile.classList.remove("has-image"); }
  }
  function clearImages() { showTile("attach", null); showTile("capture", null); }
  function showScene(w) { $("#notes-login").hidden = w !== "login"; $("#notes-editor").hidden = w !== "editor"; $("#notes-clave").hidden = w !== "clave"; }
  function refreshLabel() { var el = $("#notes-section-label"); if (el) el.textContent = sname(sid()); }
  function updateNoteContext() { var el = $("#notes-context"); if (el) el.innerHTML = "Nota privada · sección: <b>" + sname(sid()) + "</b>"; }

  function openPanel(open) {
    var p = $("#notes-panel"), t = $("#notes-toggle");
    p.hidden = !open; t.setAttribute("aria-expanded", String(open));
    if (open) { refreshLabel(); if (session) { showScene("editor"); updateNoteContext(); } else { showScene("login"); } }
  }

  // ---------- sesión ----------
  function enterEditor() {
    $("#notes-session-name").textContent = session.name;
    var back = $("#notes-clave-back");
    if (session.mustChange) {
      showScene("clave"); if (back) back.style.display = "none";
      var s3 = $("#notes-status3"); s3.style.color = "var(--coral)";
      s3.textContent = "Primer ingreso: define tu propia contraseña para continuar.";
      $("#notes-newpass").focus(); return;
    }
    if (back) back.style.display = "";
    showScene("editor"); updateNoteContext();
    $("#notes-text").value = ""; clearImages(); setStatus($("#notes-status2"), "", "");
  }

  async function doLogin() {
    var status = $("#notes-status");
    setStatus(status, "", "");
    if (!configured) { setStatus(status, "Supabase aún no está configurado.", "err"); return; }
    var email = $("#notes-user").value.trim().toLowerCase(), password = $("#notes-pass").value;
    if (!email.includes("@") || !password) { setStatus(status, "Correo o contraseña inválidos.", "err"); return; }
    try {
      var res = await fetch(cfg.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: password }) });
      var data = await res.json();
      if (!res.ok) { setStatus(status, "No se pudo iniciar sesión.", "err"); return; }
      session = { token: data.access_token, userId: data.user.id, email: email, name: email };
      session.mustChange = !!(data.user && data.user.user_metadata && data.user.user_metadata.must_change_password);
      var prof = await rest("/rest/v1/ime_socios?id=eq." + session.userId + "&active=eq.true&select=full_name");
      var rows = await prof.json();
      if (!Array.isArray(rows) || !rows.length) { session = null; setStatus(status, "Tu cuenta no está habilitada en el padrón de IME.", "err"); return; }
      session.name = rows[0].full_name || email;
      var role = null;
      try { var dr = await rest("/rest/v1/ime_directors?id=eq." + session.userId + "&active=eq.true&select=role"); var dro = await dr.json(); role = (Array.isArray(dro) && dro[0] && dro[0].role) || null; } catch (e) {}
      session.role = role;
      if (window.IMEAuth) IMEAuth.save({ token: session.token, userId: session.userId, email: email, name: session.name, role: role, mustChange: session.mustChange, exp: Date.now() + ((data.expires_in || 3600) * 1000) });
      window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: email, role: role, token: session.token, userId: session.userId } }));
      enterEditor();
    } catch (e) { setStatus(status, "Error de conexión con Supabase.", "err"); }
  }

  function doSignout() {
    session = null; if (window.IMEAuth) IMEAuth.clear();
    showScene("login"); $("#notes-pass").value = ""; setStatus($("#notes-status"), "", ""); clearImages();
    window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: null } }));
  }

  // ---------- imágenes ----------
  async function saveImage(blob, slot) {
    if (!session || !blob) return;
    var s2 = $("#notes-status2"), id = sid();
    setStatus(s2, "Subiendo imagen…", "info");
    try {
      var ext = blob.type === "image/png" ? "png" : (blob.type === "image/jpeg" ? "jpg" : "img");
      var path = cfg.appKey + "/" + id + "/" + session.userId + "/" + slot + "-" + Date.now() + "." + ext;
      var up = await fetch(cfg.url + "/storage/v1/object/" + BUCKET + "/" + path, { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": blob.type || "image/png", "x-upsert": "true" }, body: blob });
      if (!up.ok) { setStatus(s2, "No se pudo subir (¿Storage configurado?).", "err"); return; }
      var row = { app_key: cfg.appKey, section_id: id, user_id: session.userId }; row[COL[slot]] = path;
      var res = await rest("/rest/v1/" + (cfg.tables && cfg.tables.notes ? cfg.tables.notes : "ime_section_notes") + "?on_conflict=app_key,section_id,user_id", { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }, body: JSON.stringify([row]) });
      if (res.ok) { showTile(slot, path); setStatus(s2, "Imagen guardada.", "ok"); }
      else setStatus(s2, "Imagen subida, pero no se guardó la referencia.", "err");
    } catch (e) { setStatus($("#notes-status2"), "Error con la imagen.", "err"); }
  }
  async function removeImage(slot) {
    showTile(slot, null); if (!session) return;
    var id = sid(), patch = {}; patch[COL[slot]] = null;
    try { await rest("/rest/v1/" + (cfg.tables && cfg.tables.notes ? cfg.tables.notes : "ime_section_notes") + "?app_key=eq." + cfg.appKey + "&section_id=eq." + id + "&user_id=eq." + session.userId, { method: "PATCH", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" }, body: JSON.stringify(patch) }); } catch (e) {}
  }
  async function capturePage() {
    var s2 = $("#notes-status2");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) { setStatus(s2, "Tu navegador no permite capturar la página.", "err"); return; }
    try {
      var stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true });
      var track = stream.getVideoTracks()[0], video = document.createElement("video");
      video.srcObject = stream; await video.play();
      await new Promise(function (r) { setTimeout(r, 250); });
      var c = document.createElement("canvas"); c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext("2d").drawImage(video, 0, 0); track.stop();
      var blob = await new Promise(function (res) { c.toBlob(res, "image/png"); });
      await saveImage(blob, "capture");
    } catch (e) { setStatus(s2, "Captura cancelada.", "info"); }
  }

  // ---------- guardar / deshacer ----------
  async function saveNote() {
    if (!session) return;
    if (!confirm("Vas a guardar tu nota en esta sección. Podrás editarla o borrarla cuando quieras. ¿Enviar ahora?")) return;
    var s2 = $("#notes-status2"), id = sid();
    var body = [{ app_key: cfg.appKey, section_id: id, user_id: session.userId, note_text: $("#notes-text").value, author_email: session.email, author_name: session.name, updated_at: new Date().toISOString() }];
    try {
      var res = await rest("/rest/v1/" + (cfg.tables && cfg.tables.notes ? cfg.tables.notes : "ime_section_notes") + "?on_conflict=app_key,section_id,user_id", { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(body) });
      if (res.ok) { $("#notes-text").value = ""; clearImages(); setStatus(s2, "Nota enviada.", "ok"); }
      else setStatus(s2, "No se pudo guardar.", "err");
    } catch (e) { setStatus($("#notes-status2"), "Error al guardar.", "err"); }
  }
  async function undoNote() {
    if (!session) return;
    var s2 = $("#notes-status2"), tbl = (cfg.tables && cfg.tables.notes ? cfg.tables.notes : "ime_section_notes");
    setStatus(s2, "Buscando tu última nota…", "info");
    var last;
    try {
      var res = await rest("/rest/v1/" + tbl + "?app_key=eq." + cfg.appKey + "&user_id=eq." + session.userId + "&select=section_id,updated_at&order=updated_at.desc&limit=1");
      var rows = await res.json(); last = Array.isArray(rows) ? rows[0] : null;
    } catch (e) { setStatus(s2, "No se pudo consultar tus notas.", "err"); return; }
    if (!last) { setStatus(s2, "No tienes ninguna nota para deshacer.", "info"); return; }
    if (!confirm("Vas a deshacer tu última nota guardada (sección: " + sname(last.section_id) + "), junto con sus imágenes. Esta acción no se puede deshacer. ¿Continuar?")) { setStatus(s2, "", ""); return; }
    try {
      var r2 = await rest("/rest/v1/" + tbl + "?app_key=eq." + cfg.appKey + "&section_id=eq." + last.section_id + "&user_id=eq." + session.userId, { method: "DELETE" });
      if (r2.ok) { if (last.section_id === sid()) { $("#notes-text").value = ""; clearImages(); } setStatus(s2, "Última nota deshecha.", "ok"); }
      else setStatus(s2, "No se pudo deshacer.", "err");
    } catch (e) { setStatus(s2, "Error al deshacer.", "err"); }
  }

  // ---------- arrastre ----------
  function makeDraggable() {
    var panel = $("#notes-panel"), head = $("#notes-head"); if (!panel || !head) return;
    var sx, sy, ox, oy, dragging = false;
    try { var saved = JSON.parse(localStorage.getItem("ime-notes-pos") || "null"); if (saved) { panel.style.left = saved.x + "px"; panel.style.top = saved.y + "px"; panel.style.right = "auto"; panel.style.bottom = "auto"; } } catch (e) {}
    head.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      var r = panel.getBoundingClientRect(); ox = r.left; oy = r.top; head.setPointerCapture(e.pointerId);
    });
    head.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var nx = Math.max(4, Math.min(innerWidth - panel.offsetWidth - 4, ox + e.clientX - sx));
      var ny = Math.max(4, Math.min(innerHeight - 40, oy + e.clientY - sy));
      panel.style.left = nx + "px"; panel.style.top = ny + "px"; panel.style.right = "auto"; panel.style.bottom = "auto";
    });
    head.addEventListener("pointerup", function () {
      if (!dragging) return; dragging = false;
      try { localStorage.setItem("ime-notes-pos", JSON.stringify({ x: parseInt(panel.style.left), y: parseInt(panel.style.top) })); } catch (e) {}
    });
  }

  // ---------- montaje ----------
  function mount(o) {
    opts = o || {};
    if (!$("#notes-panel")) {
      var host = document.createElement("div");
      host.innerHTML = MARKUP;
      while (host.firstChild) document.body.appendChild(host.firstChild);
    }
    $("#notes-toggle").addEventListener("click", function () { openPanel($("#notes-panel").hidden); });
    $("#notes-close").addEventListener("click", function () { openPanel(false); });
    $("#notes-signin").addEventListener("click", doLogin);
    $("#notes-signout").addEventListener("click", doSignout);
    $("#notes-signout2").addEventListener("click", doSignout);
    $("#notes-pass-toggle").addEventListener("click", function () { showScene("clave"); });
    $("#notes-clave-back").addEventListener("click", function () { showScene("editor"); });
    $("#notes-save").addEventListener("click", saveNote);
    $("#notes-delete").addEventListener("click", undoNote);
    $("#notes-clear").addEventListener("click", function () { $("#notes-text").value = ""; clearImages(); setStatus($("#notes-status2"), "", ""); });
    $("#notes-attach").addEventListener("click", function () { $("#notes-file").click(); });
    $("#notes-file").addEventListener("change", function () {
      var f = $("#notes-file").files[0]; $("#notes-file").value = "";
      if (!f) return;
      if (TIPOS_OK.indexOf(f.type) === -1) { setStatus($("#notes-status2"), "Solo se permiten imágenes JPG, PNG o WEBP.", "err"); return; }
      if (f.size > MAX_MB * 1024 * 1024) { setStatus($("#notes-status2"), "La imagen supera el máximo de " + MAX_MB + " MB.", "err"); return; }
      saveImage(f, "attach");
    });
    $("#notes-capture").addEventListener("click", capturePage);
    tileEl("attach").querySelector(".notes-tile-x").addEventListener("click", function () { removeImage("attach"); });
    tileEl("capture").querySelector(".notes-tile-x").addEventListener("click", function () { removeImage("capture"); });
    $("#notes-pass-save").addEventListener("click", async function () {
      if (!session) return;
      var s3 = $("#notes-status3"), np = $("#notes-newpass").value;
      if (!np || np.length < 6) { setStatus(s3, "La contraseña debe tener al menos 6 caracteres.", "err"); return; }
      var reqBody = { password: np };
      if (session.mustChange) reqBody.data = { must_change_password: false };
      try {
        var res = await fetch(cfg.url + "/auth/v1/user", { method: "PUT", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" }, body: JSON.stringify(reqBody) });
        if (res.ok) {
          $("#notes-newpass").value = "";
          if (session.mustChange) { session.mustChange = false; setStatus(s3, "¡Listo! Contraseña definida.", "ok"); enterEditor(); }
          else setStatus(s3, "Contraseña actualizada.", "ok");
        } else setStatus(s3, "No se pudo actualizar la contraseña.", "err");
      } catch (e) { setStatus(s3, "Error al actualizar.", "err"); }
    });
    makeDraggable();
    addEventListener("scroll", function () { var p = $("#notes-panel"); if (p && !p.hidden) { refreshLabel(); updateNoteContext(); } }, { passive: true });

    // Sesión compartida
    var s = window.IMEAuth && IMEAuth.load();
    if (s) {
      session = { token: s.token, userId: s.userId, email: s.email, name: s.name || s.email, role: s.role || null, mustChange: !!s.mustChange };
      var _s = session;
      setTimeout(function () { window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: _s.email, role: _s.role, token: _s.token, userId: _s.userId } })); }, 0);
    }
    // Sincroniza con logins/logouts hechos fuera del módulo (página socixs / panel).
    window.addEventListener("ime:auth", function (e) {
      var d = (e && e.detail) || {};
      if (!d.email) { session = null; clearImages(); showScene("login"); return; }
      var st = window.IMEAuth && IMEAuth.load();
      if (!st) return;
      session = { token: st.token, userId: st.userId, email: st.email, name: st.name || st.email, role: st.role || null, mustChange: !!st.mustChange };
      $("#notes-session-name").textContent = session.name;
      var p = $("#notes-panel"); if (p && !p.hidden) { showScene("editor"); updateNoteContext(); }
    });

    showScene(session ? "editor" : "login");
    if (session) { $("#notes-session-name").textContent = session.name; updateNoteContext(); }
    if (/[?&]notas=1(&|$)/.test(location.search)) setTimeout(function () { openPanel(true); }, 80);
  }

  window.IMENotes = { mount: mount, isLogged: function () { return !!session; }, signout: doSignout };
})();
