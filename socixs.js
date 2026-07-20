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

  var FOTOS = "socios-fotos", DOCS = "socios-docs";

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

  function enterApp() {
    $("#sx-login").hidden = true;
    $("#sx-app").hidden = false;
    $("#sx-who").textContent = session.name;
    var _rn = $("#sx-reg-name"); if (_rn) _rn.value = session.name || "";
    var _re = $("#sx-reg-email"); if (_re) _re.value = session.email || "";
    $("#sx-panel-link").hidden = !session.isDirector;
    $("#sx-signout").hidden = false;
    if (session.mustChange) setStatus($("#sx-profile-status"), "Por seguridad, cambia tu contraseña temporal en “Cuenta”.", "info");
    loadProfile();
    loadDocs();
  }

  $("#sx-signout").addEventListener("click", function () {
    session = null;
    if (window.IMEAuth) IMEAuth.clear();
    $("#sx-app").hidden = true;
    $("#sx-login").hidden = false;
    $("#sx-signout").hidden = true;
    $("#sx-panel-link").hidden = true;
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

  // Sesión compartida (Notas ↔ Socixs): si ya hay sesión válida, entrar directo.
  (function restoreSession() {
    var s = window.IMEAuth && IMEAuth.load();
    if (!s) return;
    session = { token: s.token, userId: s.userId, email: s.email, name: s.name || s.email, role: s.role || null, isDirector: !!s.role, mustChange: !!s.mustChange };
    enterApp();
  })();
})();
