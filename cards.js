(function(){
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = document.querySelectorAll(".card, .cta-card, .factbox");
  cards.forEach(function(card){
    card.style.transition = "transform .18s ease, box-shadow .18s ease";
    card.style.cursor = "pointer";
    // Solo hacer la tarjeta enfocable si no contiene ya un enlace/botón (evita doble tab).
    var focusable = !card.querySelector("a, button");
    if (focusable) card.setAttribute("tabindex", "0");
    if (!reduce) {
      card.addEventListener("pointermove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(720px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateY(-3px)";
        card.style.boxShadow = "0 18px 42px rgba(0,0,0,.35)";
      });
      card.addEventListener("pointerleave", function(){ card.style.transform = ""; card.style.boxShadow = ""; });
    }
    function pulse(cx, cy){
      if (cx == null) { var r = card.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
      if (window.IMESkinAPI && window.IMESkinAPI.pulse) window.IMESkinAPI.pulse(cx, cy);
      card.style.transform = "perspective(720px) scale(.985)";
      setTimeout(function(){ card.style.transform = ""; }, 150);
    }
    card.addEventListener("click", function(e){ pulse(e.clientX, e.clientY); });
    if (focusable) card.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pulse(); } });
  });
})();
