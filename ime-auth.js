/* ============================================================
   IME · Sesión compartida entre Notas y Socixs.
   Guarda el token de Supabase Auth en localStorage para que el
   login valga en ambos botones (misma base de datos). Sin SDK.
   Archivo externo (la CSP 'self' bloquea scripts inline).
   ============================================================ */
(function () {
  "use strict";
  var KEY = "ime-session";
  window.IMEAuth = {
    save: function (s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} },
    load: function () {
      try {
        var s = JSON.parse(localStorage.getItem(KEY) || "null");
        if (s && s.token && s.exp && Date.now() < s.exp) return s;
        if (s) localStorage.removeItem(KEY); // expirada
      } catch (e) {}
      return null;
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
