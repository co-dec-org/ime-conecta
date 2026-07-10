/* Copiar resumen ejecutivo de IME Conecta al portapapeles.
   Archivo externo (la CSP 'self' bloquea scripts inline). */
(function () {
  "use strict";
  var summary = [
    "IME Conecta — Gobernanza operacional para IME Chile A.G.",
    "Gobernanza operacional para una nueva escala gremial propone que IME Chile ordene su gestión interna para sostener una etapa de mayor envergadura institucional.",
    "IME Conecta se plantea como infraestructura interna, no solo como software: debe registrar socios/as, comités, acuerdos, documentos, proyectos, responsables, plazos, datos personales, activos digitales y avances.",
    "La propuesta incorpora capacidades web locales, como una Capa Web-Video API, para capturar avatar, boletas o evidencias operativas sin enviar datos a terceros.",
    "La oportunidad táctica inmediata es Sercotec Fortalecimiento Gremial 2026 - Región Metropolitana, con foco de postulación en IME Conecta.",
    "IME Link 2027 se propone como sujeto de prueba estratégico para validar la infraestructura en un caso real de planificación, alianzas, comités, trazabilidad y proyección pública.",
    "El modelo separa dirección estratégica, carteras directivas, comités ejecutivos y operación valorizable, incorporando gobernanza de datos y criterios de la Ley 21.719.",
    "Contacto: Instagram @ime_chile · imechile.org · ime-conecta.vercel.app."
  ].join("\n\n");

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta); return ok;
  }

  var b = document.getElementById("btn-copy");
  if (!b) return;
  b.addEventListener("click", function () {
    var done = function (ok) { b.textContent = ok ? "Copiado" : "No se pudo copiar"; setTimeout(function () { b.textContent = "Copiar resumen"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(function () { done(true); }, function () { done(fallbackCopy(summary)); });
    } else { done(fallbackCopy(summary)); }
  });
})();
