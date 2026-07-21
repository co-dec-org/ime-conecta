/* ============================================================
   IME Conecta — Página de socixs (perfil de artista)
   Vanilla + Supabase (Auth + PostgREST + Storage), sin SDK.
   Login contra ime_socios (padrón general). Rol de directorio
   desde ime_directors. Perfil en ime_socios_perfil y documentos
   en ime_socios_docs. Buckets privados con URL firmada.
   Archivo externo (la CSP 'self' bloquea scripts inline).
   ============================================================ */
(function () {
  "use strict";
  var cfg = window.IME_SUPABASE || {};
  var configured = cfg.url && cfg.anonKey && cfg.anonKey.indexOf("PEGAR_") === -1;
  var $ = function (s) { return document.querySelector(s); };
  var session = null; // { token, userId, email, name, isDirector, mustChange }

  var FOTOS = "socios-fotos", DOCS = "socios-docs", COMP = "socios-comprobantes";

  // Gráfica viva de fondo (misma identidad violeta-magenta que el sitio).
  try {
    if (window.IMESkin && document.querySelector("#ime-skin")) {
      window.IMESkin.mount({ canvas: "#ime-skin", appKey: (cfg.appKey || "ime-conecta") });
    }
  } catch (e) { /* degrada en silencio */ }

  // ---------- utilidades ----------
  function setStatus(el, msg, state) {
    if (!el) return;
    if (el._t) { clearTimeout(el._t); el._t = 0; }
    el.textContent = msg || "";
    el.dataset.state = (state === "ok" || state === "err") ? state : "";
    el.style.color = state === "ok" ? "var(--accent-2, #e879f9)" : state === "err" ? "#f6788a" : "var(--text-dim)";
    if (state === "ok") el._t = setTimeout(function () { el.textContent = ""; el.dataset.state = ""; }, 2600);
  }
  function rest(path, opts) {
    return fetch(cfg.url + path, Object.assign({ headers: {
      apikey: cfg.anonKey,
      Authorization: "Bearer " + (session ? session.token : cfg.anonKey),
      "Content-Type": "application/json"
    } }, opts));
  }
  // URL firmada para leer un objeto de un bucket privado.
  async function signedUrl(bucket, path, secs) {
    try {
      var r = await fetch(cfg.url + "/storage/v1/object/sign/" + bucket + "/" + path, {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: secs || 3600 })
      });
      if (!r.ok) return null;
      var d = await r.json();
      return cfg.url + "/storage/v1" + d.signedURL;
    } catch (e) { return null; }
  }
  async function uploadTo(bucket, path, blob) {
    return fetch(cfg.url + "/storage/v1/object/" + bucket + "/" + path, {
      method: "POST",
      headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": blob.type || "application/octet-stream", "x-upsert": "true" },
      body: blob
    });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // ---------- login ----------
  $("#sx-signin").addEventListener("click", async function () {
    setStatus($("#sx-login-status"), "", "");
    if (!configured) { setStatus($("#sx-login-status"), "Supabase no está configurado.", "err"); return; }
    var email = $("#sx-email").value.trim().toLowerCase();
    var pass = $("#sx-pass").value;
    if (!email.includes("@") || !pass) { setStatus($("#sx-login-status"), "Correo o contraseña inválidos.", "err"); return; }
    setStatus($("#sx-login-status"), "Ingresando…", "info");
    try {
      var res = await fetch(cfg.url + "/auth/v1/token?grant_type=password", {
        method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: pass })
      });
      var data = await res.json();
      if (!res.ok) { setStatus($("#sx-login-status"), "No se pudo iniciar sesión. Revisa tus datos.", "err"); return; }
      session = { token: data.access_token, userId: data.user.id, email: email };
      session.mustChange = !!(data.user && data.user.user_metadata && data.user.user_metadata.must_change_password);
      // Validar que sea socix activo del padrón.
      var prof = await rest("/rest/v1/ime_socios?id=eq." + session.userId + "&active=eq.true&select=full_name");
      var rows = await prof.json();
      if (!Array.isArray(rows) || !rows.length) { session = null; setStatus($("#sx-login-status"), "Tu cuenta no está habilitada como socix activo/a.", "err"); return; }
      session.name = rows[0].full_name || email;
      // ¿es director/a? (para el acceso al panel)
      try {
        var dr = await rest("/rest/v1/ime_directors?id=eq." + session.userId + "&active=eq.true&select=role");
        var drows = await dr.json();
        session.isDirector = Array.isArray(drows) && drows.length > 0;
        session.role = session.isDirector ? (drows[0].role || null) : null;
      } catch (e) { session.isDirector = false; }
      if (window.IMEAuth) IMEAuth.save({ token: session.token, userId: session.userId, email: session.email, name: session.name, role: session.role, mustChange: session.mustChange, exp: Date.now() + ((data.expires_in || 3600) * 1000) });
      enterApp();
    } catch (e) { setStatus($("#sx-login-status"), "Error de conexión con Supabase.", "err"); }
  });

  // Refleja el estado de sesión en toda la UI (evita quedar "aparentemente logueado").
  function setLoggedUI(on) {
    var dir = on && session && session.isDirector, el;
    if ((el = $("#sx-signout"))) el.hidden = !on;
    if ((el = $("#sx-panel-link"))) el.hidden = !dir;
    if ((el = $("#sx-app"))) el.hidden = !on;
    if ((el = $("#sx-login"))) el.hidden = on;
    if (!on) { // cerró sesión: cierra y limpia Notas, pide login
      if ((el = $("#sx-notes"))) el.hidden = true;
      if ((el = $("#sx-notes-toggle"))) el.setAttribute("aria-expanded", "false");
      if ((el = $("#sx-note-text"))) el.value = "";
      setStatus($("#sx-note-status"), "", "");
    }
  }
  function enterApp() {
    setLoggedUI(true);
    $("#sx-who").textContent = session.name;
    var _rn = $("#sx-reg-name"); if (_rn) _rn.value = session.name || "";
    var _re = $("#sx-reg-email"); if (_re) _re.value = session.email || "";
    if (session.mustChange) setStatus($("#sx-profile-status"), "Por seguridad, cambia tu contraseña temporal en “Cuenta”.", "info");
    loadProfile();
    loadDocs();
    loadCuotas();
    loadComprobantes();
    loadPrivado();
  }

  $("#sx-signout").addEventListener("click", function () {
    session = null;
    if (window.IMEAuth) IMEAuth.clear();
    setLoggedUI(false);
    $("#sx-pass").value = "";
  });

  // ---------- perfil ----------
  var links = []; // [{label,url}]

  async function loadProfile() {
    try {
      var r = await rest("/rest/v1/ime_socios_perfil?id=eq." + session.userId + "&select=*");
      var rows = await r.json();
      var p = (Array.isArray(rows) && rows[0]) || {};
      $("#sx-artist").value = p.artist_name || "";
      var _ra = $("#sx-reg-artist"); if (_ra) _ra.value = p.artist_name || "";
      $("#sx-bio").value = p.bio || "";
      links = Array.isArray(p.links) ? p.links : [];
      renderLinks();
      if (p.photo_path) {
        var u = await signedUrl(FOTOS, p.photo_path);
        if (u) { $("#sx-photo").src = u; $("#sx-photo").hidden = false; $("#sx-photo-empty").hidden = true; }
      }
    } catch (e) { setStatus($("#sx-profile-status"), "No se pudo cargar tu perfil.", "err"); }
  }

  function renderLinks() {
    var box = $("#sx-links");
    box.innerHTML = "";
    links.forEach(function (lk, i) {
      var row = document.createElement("div");
      row.className = "sx-link-row";
      row.innerHTML = '<input class="sx-in" data-k="label" placeholder="Nombre (Spotify, Bandcamp…)" value="' + esc(lk.label) + '">' +
                      '<input class="sx-in" data-k="url" placeholder="https://…" value="' + esc(lk.url) + '">' +
                      '<button class="sx-x" title="Quitar">✕</button>';
      row.querySelector('[data-k="label"]').addEventListener("input", function (e) { links[i].label = e.target.value; });
      row.querySelector('[data-k="url"]').addEventListener("input", function (e) { links[i].url = e.target.value; });
      row.querySelector(".sx-x").addEventListener("click", function () { links.splice(i, 1); renderLinks(); });
      box.appendChild(row);
    });
  }
  $("#sx-add-link").addEventListener("click", function () { links.push({ label: "", url: "" }); renderLinks(); });

  $("#sx-save").addEventListener("click", async function () {
    setStatus($("#sx-profile-status"), "Guardando…", "info");
    var clean = links.filter(function (l) { return (l.label || "").trim() || (l.url || "").trim(); });
    var _ra2 = $("#sx-reg-artist"); if (_ra2) _ra2.value = $("#sx-artist").value.trim();
    var body = [{
      id: session.userId,
      artist_name: $("#sx-artist").value.trim() || null,
      bio: $("#sx-bio").value.trim() || null,
      links: clean,
      updated_at: new Date().toISOString()
    }];
    try {
      var res = await rest("/rest/v1/ime_socios_perfil?on_conflict=id", {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify(body)
      });
      setStatus($("#sx-profile-status"), res.ok ? "Perfil guardado." : "No se pudo guardar.", res.ok ? "ok" : "err");
    } catch (e) { setStatus($("#sx-profile-status"), "Error al guardar.", "err"); }
  });

  // ---------- foto ----------
  $("#sx-photo-file").addEventListener("change", async function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { setStatus($("#sx-profile-status"), "La foto debe ser JPG, PNG o WEBP.", "err"); return; }
    if (f.size > 5 * 1024 * 1024) { setStatus($("#sx-profile-status"), "La foto supera 5 MB.", "err"); return; }
    setStatus($("#sx-profile-status"), "Subiendo foto…", "info");
    var ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    var path = session.userId + "/perfil-" + Date.now() + "." + ext;
    try {
      var up = await uploadTo(FOTOS, path, f);
      if (!up.ok) { setStatus($("#sx-profile-status"), "No se pudo subir la foto.", "err"); return; }
      var res = await rest("/rest/v1/ime_socios_perfil?on_conflict=id", {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify([{ id: session.userId, photo_path: path, updated_at: new Date().toISOString() }])
      });
      if (!res.ok) { setStatus($("#sx-profile-status"), "Foto subida pero no se guardó la referencia.", "err"); return; }
      var u = await signedUrl(FOTOS, path);
      if (u) { $("#sx-photo").src = u; $("#sx-photo").hidden = false; $("#sx-photo-empty").hidden = true; }
      setStatus($("#sx-profile-status"), "Foto actualizada.", "ok");
    } catch (err) { setStatus($("#sx-profile-status"), "Error al subir la foto.", "err"); }
  });

  // ---------- documentos ----------
  async function loadDocs() {
    try {
      var r = await rest("/rest/v1/ime_socios_docs?socio_id=eq." + session.userId + "&select=*&order=created_at.desc");
      var rows = await r.json();
      var box = $("#sx-docs");
      box.innerHTML = "";
      if (!Array.isArray(rows) || !rows.length) { box.innerHTML = '<p class="sx-muted">Aún no subes documentos.</p>'; return; }
      rows.forEach(function (d) {
        var row = document.createElement("div");
        row.className = "sx-doc-row";
        row.innerHTML = '<span class="sx-doc-kind">' + esc(d.kind) + '</span><span class="sx-doc-title">' + esc(d.title || "documento") + '</span>' +
                        '<button class="sx-doc-open">Ver</button><button class="sx-x" title="Eliminar">✕</button>';
        row.querySelector(".sx-doc-open").addEventListener("click", async function () {
          var u = await signedUrl(DOCS, d.file_path);
          if (u) window.open(u, "_blank", "noopener");
        });
        row.querySelector(".sx-x").addEventListener("click", function () { deleteDoc(d.id, d.file_path, row); });
        box.appendChild(row);
      });
    } catch (e) { /* silencioso */ }
  }

  $("#sx-doc-file").addEventListener("change", async function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setStatus($("#sx-docs-status"), "El documento debe ser PDF.", "err"); return; }
    if (f.size > 10 * 1024 * 1024) { setStatus($("#sx-docs-status"), "El PDF supera 10 MB.", "err"); return; }
    var kind = $("#sx-doc-kind").value;
    setStatus($("#sx-docs-status"), "Subiendo documento…", "info");
    var path = session.userId + "/" + kind + "-" + Date.now() + ".pdf";
    try {
      var up = await uploadTo(DOCS, path, f);
      if (!up.ok) { setStatus($("#sx-docs-status"), "No se pudo subir el documento.", "err"); return; }
      var res = await rest("/rest/v1/ime_socios_docs", {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify([{ socio_id: session.userId, kind: kind, title: f.name.replace(/\.pdf$/i, ""), file_path: path }])
      });
      if (!res.ok) { setStatus($("#sx-docs-status"), "Documento subido pero no se registró.", "err"); return; }
      setStatus($("#sx-docs-status"), "Documento agregado.", "ok");
      e.target.value = "";
      loadDocs();
    } catch (err) { setStatus($("#sx-docs-status"), "Error al subir el documento.", "err"); }
  });

  async function deleteDoc(id, path, row) {
    try {
      var res = await rest("/rest/v1/ime_socios_docs?id=eq." + id, { method: "DELETE" });
      if (res.ok) {
        fetch(cfg.url + "/storage/v1/object/" + DOCS + "/" + path, { method: "DELETE", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token } });
        if (row) row.remove();
      }
    } catch (e) { /* silencioso */ }
  }

  // ---------- cuotas y comprobantes ----------
  function CLP(n) { return n == null ? "" : "$" + Number(n).toLocaleString("es-CL"); }

  async function loadCuotas() {
    try {
      var r = await rest("/rest/v1/ime_cuotas?socio_id=eq." + session.userId + "&select=*&order=vence.asc");
      var rows = await r.json();
      var box = $("#sx-cuotas"), sel = $("#sx-comp-cuota");
      box.innerHTML = ""; if (sel) sel.length = 1;
      if (!Array.isArray(rows) || !rows.length) {
        $("#sx-cuotas-estado").textContent = "No tienes cuotas registradas.";
        box.innerHTML = '<p class="sx-muted">Sin cuotas por ahora.</p>'; return;
      }
      var deuda = 0, pend = 0;
      rows.forEach(function (c) {
        if (c.estado === "pendiente") { deuda += (c.monto || 0); pend++; }
        var row = document.createElement("div");
        row.className = "sx-cuota-row";
        var pagar = (c.estado === "pendiente" && c.link_pago) ? '<a class="sx-doc-open" href="' + esc(c.link_pago) + '" target="_blank" rel="noopener">Pagar</a>' : "";
        row.innerHTML = '<span class="sx-cuota-per">' + esc(c.periodo) + (c.concepto ? " · " + esc(c.concepto) : "") + "</span>" +
          '<span class="sx-cuota-monto">' + CLP(c.monto) + "</span>" +
          '<span class="sx-cuota-estado sx-est-' + esc(c.estado) + '">' + esc(c.estado) + "</span>" + pagar;
        box.appendChild(row);
        if (sel) { var op = document.createElement("option"); op.value = c.id; op.textContent = c.periodo + (c.concepto ? " · " + c.concepto : "") + " (" + CLP(c.monto) + ")"; sel.appendChild(op); }
      });
      $("#sx-cuotas-estado").innerHTML = pend ? ("Debes <strong>" + CLP(deuda) + "</strong> en " + pend + " cuota(s).") : "Estás al día con tus cuotas. ✓";
    } catch (e) { $("#sx-cuotas-estado").textContent = "No se pudieron cargar tus cuotas."; }
  }

  async function loadComprobantes() {
    try {
      var r = await rest("/rest/v1/ime_comprobantes?socio_id=eq." + session.userId + "&select=*&order=created_at.desc");
      var rows = await r.json();
      var box = $("#sx-comps"); box.innerHTML = "";
      if (!Array.isArray(rows) || !rows.length) { box.innerHTML = '<p class="sx-muted">Aún no subes comprobantes.</p>'; return; }
      rows.forEach(function (d) {
        var row = document.createElement("div"); row.className = "sx-doc-row";
        row.innerHTML = '<span class="sx-cuota-estado sx-est-' + esc(d.estado) + '">' + esc(d.estado) + "</span>" +
          '<span class="sx-doc-title">' + (d.fecha ? esc(d.fecha) + " · " : "") + CLP(d.monto) + "</span><button class=\"sx-doc-open\">Ver</button>";
        row.querySelector(".sx-doc-open").addEventListener("click", async function () { var u = await signedUrl(COMP, d.file_path); if (u) window.open(u, "_blank", "noopener"); });
        box.appendChild(row);
      });
    } catch (e) { /* silencioso */ }
  }

  var _compInput = $("#sx-comp-file");
  if (_compInput) _compInput.addEventListener("change", async function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(f.type)) { setStatus($("#sx-comp-status"), "Debe ser PDF o imagen.", "err"); return; }
    if (f.size > 10 * 1024 * 1024) { setStatus($("#sx-comp-status"), "El archivo supera 10 MB.", "err"); return; }
    setStatus($("#sx-comp-status"), "Subiendo comprobante…", "info");
    var ext = f.type === "application/pdf" ? "pdf" : f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    var path = session.userId + "/" + Date.now() + "." + ext;
    try {
      var up = await uploadTo(COMP, path, f);
      if (!up.ok) { setStatus($("#sx-comp-status"), "No se pudo subir.", "err"); return; }
      var row = { socio_id: session.userId, file_path: path, estado: "enviado" };
      var cid = $("#sx-comp-cuota").value; if (cid) row.cuota_id = Number(cid);
      var monto = $("#sx-comp-monto").value; if (monto) row.monto = Number(monto);
      var fecha = $("#sx-comp-fecha").value; if (fecha) row.fecha = fecha;
      var res = await rest("/rest/v1/ime_comprobantes", { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify([row]) });
      if (!res.ok) { setStatus($("#sx-comp-status"), "Subido pero no se registró.", "err"); return; }
      setStatus($("#sx-comp-status"), "Comprobante enviado. El directorio lo verificará.", "ok");
      e.target.value = ""; $("#sx-comp-monto").value = ""; $("#sx-comp-fecha").value = "";
      loadComprobantes();
    } catch (err) { setStatus($("#sx-comp-status"), "Error al subir el comprobante.", "err"); }
  });

  // ---------- datos privados del socix (RUT, teléfono) ----------
  async function loadPrivado() {
    try {
      var r = await rest("/rest/v1/ime_socios_privado?id=eq." + session.userId + "&select=*");
      var rows = await r.json();
      var p = (Array.isArray(rows) && rows[0]) || {};
      if ($("#sx-rut")) $("#sx-rut").value = p.rut || "";
      if ($("#sx-tel")) $("#sx-tel").value = p.telefono || "";
    } catch (e) { /* silencioso */ }
  }
  if ($("#sx-priv-save")) $("#sx-priv-save").addEventListener("click", async function () {
    if (!session) return;
    setStatus($("#sx-priv-status"), "Guardando…", "info");
    var nombre = $("#sx-reg-name").value.trim(), artista = $("#sx-reg-artist").value.trim(), rut = $("#sx-rut").value.trim(), tel = $("#sx-tel").value.trim();
    var H2 = { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" };
    try {
      // Nombre completo → padrón (ime_socios)
      if (nombre) {
        await rest("/rest/v1/ime_socios?id=eq." + session.userId, { method: "PATCH", headers: Object.assign({ Prefer: "return=minimal" }, H2), body: JSON.stringify({ full_name: nombre }) });
        session.name = nombre; $("#sx-who").textContent = nombre;
        var st = window.IMEAuth && IMEAuth.load(); if (st) { st.name = nombre; IMEAuth.save(st); }
      }
      // Nombre artístico → perfil (ime_socios_perfil)
      await rest("/rest/v1/ime_socios_perfil?on_conflict=id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H2), body: JSON.stringify([{ id: session.userId, artist_name: artista || null, updated_at: new Date().toISOString() }]) });
      if ($("#sx-artist")) $("#sx-artist").value = artista;
      // RUT / teléfono → privado (ime_socios_privado)
      await rest("/rest/v1/ime_socios_privado?on_conflict=id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H2), body: JSON.stringify([{ id: session.userId, rut: rut || null, telefono: tel || null, updated_at: new Date().toISOString() }]) });
      setStatus($("#sx-priv-status"), "Datos guardados.", "ok");
    } catch (e) { setStatus($("#sx-priv-status"), "Error al guardar.", "err"); }
  });

  // ---------- notas del área de socix (panel propio, misma base) ----------
  var noteToggle = $("#sx-notes-toggle"), notePanel = $("#sx-notes");
  var NOTE_SECTION = "socixs";
  function openNotes(open) {
    if (!notePanel) return;
    notePanel.hidden = !open;
    if (noteToggle) noteToggle.setAttribute("aria-expanded", String(open));
    if (open) loadNote();
  }
  if (noteToggle) noteToggle.addEventListener("click", function () { openNotes(notePanel.hidden); });
  if ($("#sx-notes-close")) $("#sx-notes-close").addEventListener("click", function () { openNotes(false); });
  if ($("#sx-note-clear")) $("#sx-note-clear").addEventListener("click", function () { $("#sx-note-text").value = ""; setStatus($("#sx-note-status"), "", ""); });
  async function loadNote() {
    if (!session) { setStatus($("#sx-note-status"), "Inicia sesión para dejar tu nota.", "info"); return; }
    try {
      var r = await rest("/rest/v1/ime_section_notes?app_key=eq." + encodeURIComponent(cfg.appKey) + "&section_id=eq." + NOTE_SECTION + "&user_id=eq." + session.userId + "&select=note_text");
      var rows = await r.json();
      $("#sx-note-text").value = (Array.isArray(rows) && rows[0] && rows[0].note_text) || "";
    } catch (e) { /* silencioso */ }
  }
  if ($("#sx-note-send")) $("#sx-note-send").addEventListener("click", async function () {
    if (!session) { setStatus($("#sx-note-status"), "Inicia sesión para dejar tu nota.", "err"); return; }
    setStatus($("#sx-note-status"), "Enviando…", "info");
    try {
      var body = [{ app_key: cfg.appKey, section_id: NOTE_SECTION, user_id: session.userId, note_text: $("#sx-note-text").value.trim(), author_email: session.email, author_name: session.name, updated_at: new Date().toISOString() }];
      var res = await rest("/rest/v1/ime_section_notes?on_conflict=app_key,section_id,user_id", {
        method: "POST",
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify(body)
      });
      setStatus($("#sx-note-status"), res.ok ? "Nota enviada." : "No se pudo enviar.", res.ok ? "ok" : "err");
    } catch (e) { setStatus($("#sx-note-status"), "Error al enviar.", "err"); }
  });

  // Botones triangulares: expandir una columna a pantalla completa.
  // ▶ del público simula la vista de alguien externo; ◀ del privado, la consulta del socix.
  (function columnToggles() {
    var grid = document.querySelector(".sx-grid");
    var tp = document.querySelector("#sx-toggle-pub");
    var tv = document.querySelector("#sx-toggle-priv");
    if (!grid || !tp || !tv) return;
    var first = true;
    function animate(v) {
      var sel = v === "pub" ? ".sx-col-pub .sx-card" : v === "priv" ? ".sx-col-priv .sx-card" : ".sx-card";
      grid.querySelectorAll(sel).forEach(function (c, i) {
        c.classList.remove("sx-anim"); void c.offsetWidth;
        c.style.animationDelay = (i * 0.09) + "s";
        c.classList.add("sx-anim");
      });
    }
    function setView(v) {
      grid.setAttribute("data-view", v);
      tp.textContent = v === "pub" ? "◀" : "▶";
      tp.title = v === "pub" ? "Volver a dos columnas" : "Ver a pantalla completa (como público)";
      tv.textContent = v === "priv" ? "▶" : "◀";
      tv.title = v === "priv" ? "Volver a dos columnas" : "Ver tu perfil de socix a pantalla completa";
      if (!first) animate(v);
      first = false;
    }
    tp.addEventListener("click", function () { setView(grid.getAttribute("data-view") === "pub" ? "both" : "pub"); });
    tv.addEventListener("click", function () { setView(grid.getAttribute("data-view") === "priv" ? "both" : "priv"); });
    setView("both");
  })();

  // Tema claro/oscuro (persistente).
  (function themeToggle() {
    var btn = $("#sx-theme");
    function apply(light) {
      document.documentElement.classList.toggle("sx-light", light);
      if (btn) btn.setAttribute("aria-pressed", String(light));
      try { localStorage.setItem("sx-theme", light ? "light" : "dark"); } catch (e) {}
    }
    if (btn) btn.addEventListener("click", function () { apply(!document.documentElement.classList.contains("sx-light")); });
    var saved = "dark"; try { saved = localStorage.getItem("sx-theme") || "dark"; } catch (e) {}
    apply(saved === "light");
  })();

  // Sesión compartida (Notas ↔ Socixs): si ya hay sesión válida, entrar directo; si no, estado logout.
  (function restoreSession() {
    var s = window.IMEAuth && IMEAuth.load();
    if (!s) { setLoggedUI(false); return; }
    session = { token: s.token, userId: s.userId, email: s.email, name: s.name || s.email, role: s.role || null, isDirector: !!s.role, mustChange: !!s.mustChange };
    enterApp();
  })();
})();
