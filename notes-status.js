/* Refuerzo visual de la confirmación en Notas: ícono (✓/✕) + destello,
   y color también en los mensajes de login. Archivo externo (CSP 'self').
   No toca la lógica de app.js: observa los mensajes ya existentes. */
(function () {
  "use strict";
  var ERR_WORDS = /(no se pudo|inválid|no está habilitad|error|supera el máximo|no permite|no tienes|a[uú]n no está|cancelad)/i;
  var OK_WORDS = /(enviada|deshecha|actualizada|guardada|¡listo!|definida)/i;
  function state(el) {
    var c = el.style.color || "";
    if (/accent-2/.test(c)) return "ok";
    if (/coral/.test(c)) return "err";
    var t = (el.textContent || "").toLowerCase();
    if (ERR_WORDS.test(t)) return "err";
    if (OK_WORDS.test(t)) return "ok";
    return "info";
  }
  ["notes-status", "notes-status2", "notes-status3"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var mo = new MutationObserver(function () {
      var txt = (el.textContent || "").trim();
      if (!txt) { el.removeAttribute("data-state"); return; }
      el.setAttribute("data-state", state(el));
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
    });
    mo.observe(el, { childList: true, characterData: true, subtree: true });
  });
})();
