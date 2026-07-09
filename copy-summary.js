/* Copiar resumen ejecutivo de IME Link 2027 al portapapeles.
   Archivo externo (la CSP 'self' bloquea scripts inline). */
(function () {
  "use strict";
  var summary = [
    "IME Link 2027 — Festival de cultura electrónica",
    "Organizado por IME Chile A.G. (asociación gremial con personalidad jurídica desde 2018). Segunda edición del encuentro de las artes electrónicas independientes de Chile: música en vivo, conversatorios, talleres e instalaciones. Santiago de Chile, 2027.",
    "La asociación está registrada en el Ministerio de Economía y representa a los principales actores de las artes electrónicas independientes y transdisciplinares de Chile: músicxs, DJs, productorxs, artistas sonoros y sonovisuales, colectivos, sellos y gestorxs culturales.",
    "Primera edición (2025): Centro Cultural Matucana 100, 21 y 22 de junio; más de 30 artistas con cartel elegido por votación de socixs; primer festival de música electrónica del país organizado mediante un modelo DAO. Documentado en el Estudio de impacto Festival IME Link 2025.",
    "Modelo DAO: gobernanza horizontal, participativa y transparente; el cartel y las definiciones se eligen en votación del propio gremio.",
    "Ejes 2027: (01) Escena en vivo — cartel intergeneracional y paritario; (02) Conocimiento — conversatorios, masterclasses y talleres; (03) Arte y tecnología — instalaciones sonovisuales e inmersivas; (04) Territorio y redes — vínculo con regiones y con la escena internacional.",
    "Participa: socixs IME (votaciones y DAO), artistas y colectivos (convocatoria abierta) y aliados e instituciones (alianzas y auspicios).",
    "Programación en construcción: line-up, fechas y sede se anunciarán progresivamente en el sitio y los canales de IME.",
    "Contacto: Instagram @ime_chile · imechile.org · ime-link-2027.vercel.app."
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
