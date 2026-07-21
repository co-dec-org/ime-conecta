/* ============================================================
   IME Conecta — Panel del directorio (módulo 3)
   Solo directorxs (ime_directors activo). Estado de socixs,
   cuotas y verificación de comprobantes. Vanilla + Supabase.
   ============================================================ */
(function () {
  "use strict";
  var cfg = window.IME_SUPABASE || {};
  var $ = function (s) { return document.querySelector(s); };
  var session = null;               // { token, userId, email, name, role }
  var SOCIXS = [], CUOTAS = [], COMPS = [], byId = {};

  try { if (window.IMESkin && $("#ime-skin")) window.IMESkin.mount({ canvas: "#ime-skin", appKey: (cfg.appKey || "ime-conecta") }); } catch (e) {}

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function CLP(n) { return "$" + Number(n || 0).toLocaleString("es-CL"); }
  function setStatus(el, msg, state) {
    if (!el) return;
    if (el._t) { clearTimeout(el._t); el._t = 0; }
    el.textContent = msg || "";
    el.style.color = state === "ok" ? "var(--accent-2, #e879f9)" : state === "err" ? "#f6788a" : "var(--text-dim)";
    if (state === "ok") el._t = setTimeout(function () { el.textContent = ""; }, 2600);
  }
  function rest(path, opts) {
    return fetch(cfg.url + path, Object.assign({ headers: {
      apikey: cfg.anonKey, Authorization: "Bearer " + (session ? session.token : cfg.anonKey), "Content-Type": "application/json"
    } }, opts));
  }
  async function signedUrl(bucket, p) {
    try {
      var r = await fetch(cfg.url + "/storage/v1/object/sign/" + bucket + "/" + p, { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) });
      if (!r.ok) return null; var d = await r.json(); return cfg.url + "/storage/v1" + d.signedURL;
    } catch (e) { return null; }
  }

  // ---------- acceso ----------
  async function checkDirector() {
    var r = await rest("/rest/v1/ime_directors?id=eq." + session.userId + "&active=eq.true&select=role,full_name");
    var rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) return null;
    return rows[0];
  }
  async function gate() {
    var d = await checkDirector();
    if (!d) { $("#pn-login").hidden = true; $("#pn-deny").hidden = false; $("#pn-app").hidden = true; return; }
    session.role = d.role || "director";
    session.name = session.name || d.full_name || session.email;
    $("#pn-login").hidden = true; $("#pn-deny").hidden = true; $("#pn-app").hidden = false;
    $("#pn-signout").hidden = false;
    $("#pn-who").textContent = session.name + (session.role ? " · " + session.role : "");
    loadData();
  }

  $("#pn-signin").addEventListener("click", async function () {
    setStatus($("#pn-login-status"), "", "");
    var email = $("#pn-email").value.trim().toLowerCase(), pass = $("#pn-pass").value;
    if (!email.includes("@") || !pass) { setStatus($("#pn-login-status"), "Correo o contraseña inválidos.", "err"); return; }
    setStatus($("#pn-login-status"), "Ingresando…", "info");
    try {
      var res = await fetch(cfg.url + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: cfg.anonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) });
      var data = await res.json();
      if (!res.ok) { setStatus($("#pn-login-status"), "No se pudo iniciar sesión.", "err"); return; }
      session = { token: data.access_token, userId: data.user.id, email: email };
      if (window.IMEAuth) IMEAuth.save({ token: session.token, userId: session.userId, email: session.email, name: session.name, exp: Date.now() + ((data.expires_in || 3600) * 1000) });
      window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: session.email, token: session.token, userId: session.userId } }));
      gate();
    } catch (e) { setStatus($("#pn-login-status"), "Error de conexión.", "err"); }
  });

  $("#pn-signout").addEventListener("click", function () {
    session = null; if (window.IMEAuth) IMEAuth.clear();
    window.dispatchEvent(new CustomEvent("ime:auth", { detail: { email: null } }));
    $("#pn-app").hidden = true; $("#pn-deny").hidden = true; $("#pn-login").hidden = false; $("#pn-signout").hidden = true; $("#pn-pass").value = "";
  });

  // ---------- datos ----------
  async function loadData() {
    try {
      var rs = await Promise.all([
        rest("/rest/v1/ime_socios?select=id,email,full_name,active&order=full_name.asc"),
        rest("/rest/v1/ime_cuotas?select=*"),
        rest("/rest/v1/ime_comprobantes?select=*&order=created_at.desc")
      ]);
      SOCIXS = await rs[0].json(); CUOTAS = await rs[1].json(); COMPS = await rs[2].json();
      if (!Array.isArray(SOCIXS)) SOCIXS = []; if (!Array.isArray(CUOTAS)) CUOTAS = []; if (!Array.isArray(COMPS)) COMPS = [];
      byId = {}; SOCIXS.forEach(function (s) { byId[s.id] = s; });
      renderKpis(); renderSocixs(); renderComps(); fillSocioSelect();
    } catch (e) { /* silencioso */ }
  }

  function deudaDe(id) { return CUOTAS.filter(function (c) { return c.socio_id === id && c.estado === "pendiente"; }).reduce(function (a, c) { return a + (c.monto || 0); }, 0); }

  function renderKpis() {
    var activxs = SOCIXS.filter(function (s) { return s.active; }).length;
    var conDeuda = SOCIXS.filter(function (s) { return deudaDe(s.id) > 0; }).length;
    var pendiente = CUOTAS.filter(function (c) { return c.estado === "pendiente"; }).reduce(function (a, c) { return a + (c.monto || 0); }, 0);
    var recaudado = COMPS.filter(function (c) { return c.estado === "verificado"; }).reduce(function (a, c) { return a + (c.monto || 0); }, 0);
    var porVerificar = COMPS.filter(function (c) { return c.estado === "enviado"; }).length;
    var k = [
      ["Socixs", SOCIXS.length], ["Activxs", activxs], ["Con deuda", conDeuda],
      ["Pendiente", CLP(pendiente)], ["Recaudado", CLP(recaudado)], ["Comprob. por verificar", porVerificar]
    ];
    $("#pn-kpis").innerHTML = k.map(function (x) { return '<div class="pn-kpi"><b>' + esc(x[1]) + "</b><span>" + esc(x[0]) + "</span></div>"; }).join("");
  }

  function renderSocixs() {
    var tb = $("#pn-socixs").querySelector("tbody");
    if (!SOCIXS.length) { tb.innerHTML = '<tr><td colspan="4" class="pn-muted">Sin socixs en el padrón.</td></tr>'; return; }
    tb.innerHTML = SOCIXS.map(function (s) {
      var d = deudaDe(s.id);
      var badge = d > 0 ? '<span class="pn-badge pn-debe">Debe</span>' : '<span class="pn-badge pn-al-dia">Al día</span>';
      return "<tr><td>" + esc(s.full_name || "—") + (s.active ? "" : ' <span class="pn-badge">inactivx</span>') + "</td><td>" + esc(s.email || "") + "</td><td>" + badge + "</td><td>" + (d > 0 ? CLP(d) : "—") + "</td></tr>";
    }).join("");
  }

  function renderComps() {
    var box = $("#pn-comps");
    var pend = COMPS.filter(function (c) { return c.estado === "enviado"; });
    if (!pend.length) { box.innerHTML = '<p class="pn-muted">No hay comprobantes por verificar.</p>'; return; }
    box.innerHTML = "";
    pend.forEach(function (c) {
      var s = byId[c.socio_id] || {};
      var row = document.createElement("div");
      row.className = "pn-row";
      row.style.cssText = "border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:0 0 8px";
      row.innerHTML = '<span style="flex:1;min-width:160px">' + esc(s.full_name || c.socio_id) + " · " + (c.fecha ? esc(c.fecha) + " · " : "") + CLP(c.monto) + "</span>" +
        '<button class="pn-comp-open">Ver</button><button class="pn-btn ok pn-v">Verificar</button><button class="pn-btn no pn-r">Rechazar</button>';
      row.querySelector(".pn-comp-open").addEventListener("click", async function () { var u = await signedUrl("socios-comprobantes", c.file_path); if (u) window.open(u, "_blank", "noopener"); });
      row.querySelector(".pn-v").addEventListener("click", function () { setCompEstado(c, "verificado", row); });
      row.querySelector(".pn-r").addEventListener("click", function () { setCompEstado(c, "rechazado", row); });
      box.appendChild(row);
    });
  }

  async function setCompEstado(c, estado, row) {
    try {
      var res = await rest("/rest/v1/ime_comprobantes?id=eq." + c.id, { method: "PATCH", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ estado: estado }) });
      if (!res.ok) return;
      c.estado = estado;
      // Al verificar, marca la cuota vinculada como verificada
      if (estado === "verificado" && c.cuota_id) {
        await rest("/rest/v1/ime_cuotas?id=eq." + c.cuota_id, { method: "PATCH", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ estado: "verificada" }) });
        var cu = CUOTAS.filter(function (x) { return x.id === c.cuota_id; })[0]; if (cu) cu.estado = "verificada";
      }
      if (row) row.remove();
      renderKpis(); renderSocixs();
    } catch (e) {}
  }

  function fillSocioSelect() {
    var sel = $("#pn-cuota-socio"); if (!sel) return;
    while (sel.length > 2) sel.remove(2);
    SOCIXS.filter(function (s) { return s.active; }).forEach(function (s) { var o = document.createElement("option"); o.value = s.id; o.textContent = s.full_name || s.email; sel.appendChild(o); });
  }

  $("#pn-cuota-crear").addEventListener("click", async function () {
    var socio = $("#pn-cuota-socio").value, periodo = $("#pn-cuota-periodo").value.trim();
    if (!socio || !periodo) { setStatus($("#pn-cuota-status"), "Elige socix y período.", "err"); return; }
    var base = { periodo: periodo, concepto: $("#pn-cuota-concepto").value.trim() || null, monto: Number($("#pn-cuota-monto").value) || 0, estado: "pendiente", vence: $("#pn-cuota-vence").value || null, link_pago: $("#pn-cuota-link").value.trim() || null };
    var rows;
    if (socio === "__all__") rows = SOCIXS.filter(function (s) { return s.active; }).map(function (s) { return Object.assign({ socio_id: s.id }, base); });
    else rows = [Object.assign({ socio_id: socio }, base)];
    setStatus($("#pn-cuota-status"), "Creando…", "info");
    try {
      var res = await rest("/rest/v1/ime_cuotas", { method: "POST", headers: { apikey: cfg.anonKey, Authorization: "Bearer " + session.token, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(rows) });
      if (!res.ok) { setStatus($("#pn-cuota-status"), "No se pudo crear.", "err"); return; }
      setStatus($("#pn-cuota-status"), "Cuota creada (" + rows.length + ").", "ok");
      loadData();
    } catch (e) { setStatus($("#pn-cuota-status"), "Error al crear.", "err"); }
  });

  // ---------- Notas: módulo compartido, idéntico al de Conecta ----------
  if (window.IMENotes) IMENotes.mount({
    getSectionId: function () { return "panel"; },
    getSectionName: function () { return "Panel directorio"; }
  });

  // ---------- restaurar sesión ----------
  (function init() {
    var s = window.IMEAuth && IMEAuth.load();
    if (s) { session = { token: s.token, userId: s.userId, email: s.email, name: s.name, role: s.role || null }; gate(); }
  })();
})();
