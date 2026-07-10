(function(){
  "use strict";
  var cfg = window.IME_SUPABASE || {};
  var ok = cfg.url && cfg.anonKey && cfg.anonKey.indexOf("PEGAR_") === -1;
  var KEY = "imelink-analytics";
  var choice = null; try { choice = localStorage.getItem(KEY); } catch(e){}

  function info(){
    var ua = navigator.userAgent || "";
    var os = /Windows/.test(ua)?"Windows":/(Mac OS X|Macintosh)/.test(ua)?"macOS":/Android/.test(ua)?"Android":/(iPhone|iPad|iPod)/.test(ua)?"iOS":/Linux/.test(ua)?"Linux":"Otro";
    var br = /Edg\//.test(ua)?"Edge":/OPR\//.test(ua)?"Opera":/Firefox\//.test(ua)?"Firefox":/Chrome\//.test(ua)?"Chrome":/Safari\//.test(ua)?"Safari":"Otro";
    var touch = (navigator.maxTouchPoints||0) > 1;
    var type = touch ? (Math.min(screen.width,screen.height) >= 768 ? "tablet" : "movil") : "escritorio";
    var tz=""; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){}
    var city = tz ? tz.split("/").pop().replace(/_/g," ") : "";
    return { device_type:type, os:os, browser:br, lang:(navigator.language||""), screen:(screen.width+"x"+screen.height), dpr:Math.round((window.devicePixelRatio||1)*100)/100, city:city, tz:tz, referrer:(document.referrer||"") };
  }
  function post(table,row){
    try{ fetch(cfg.url+"/rest/v1/"+table,{method:"POST",keepalive:true,
      headers:{apikey:cfg.anonKey,Authorization:"Bearer "+cfg.anonKey,"Content-Type":"application/json",Prefer:"return=minimal"},
      body:JSON.stringify(row)}); }catch(e){}
  }
  function track(){
    if(!ok) return;
    var sid=null; try{ sid=sessionStorage.getItem("ime-sid"); }catch(e){}
    var fresh=false;
    if(!sid){ sid=Date.now().toString(36)+Math.random().toString(36).slice(2,8); fresh=true; try{ sessionStorage.setItem("ime-sid",sid); }catch(e){} }
    if(fresh){ post("ime_visitas", Object.assign({app_key:cfg.appKey,session_id:sid}, info())); }
    function ev(kind,label){ post("ime_eventos",{app_key:cfg.appKey,session_id:sid,kind:kind,label:String(label||"").slice(0,80)}); }
    ev("view", location.hash || "inicio");
    var seen={};
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(en){ if(en.isIntersecting){ var id=en.target.id; if(id && !seen[id]){ seen[id]=1; ev("section",id); } } });},{threshold:0.5});
      document.querySelectorAll("[data-section]").forEach(function(s){ io.observe(s); });
    }
    document.addEventListener("click",function(e){
      var el=e.target.closest?e.target.closest("a.btn, button.btn, #notes-toggle"):null;
      if(!el) return;
      ev("cta",(el.textContent||el.getAttribute("aria-label")||"").trim());
    },true);
  }
  function banner(){
    var b=document.createElement("div");
    b.setAttribute("role","dialog"); b.setAttribute("aria-label","Aviso de analítica");
    b.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:80;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:680px;margin:0 auto;padding:10px 16px;background:rgba(18,16,26,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(192,132,252,.22);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.45);color:#ece7f6;font-size:13px;";
    b.innerHTML='<span style="flex:1;min-width:200px;">Usamos analítica anónima para entender cómo se navega y mejorar el sitio. Sin datos personales ni ubicación precisa.</span><span style="display:flex;gap:8px;"><button data-a="no" style="background:transparent;color:#ece7f6;border:1px solid rgba(192,132,252,.3);border-radius:999px;padding:7px 14px;cursor:pointer;">No</button><button data-a="yes" style="background:linear-gradient(120deg,#c084fc,#e879f9);color:#2a0a3a;border:none;border-radius:999px;padding:7px 16px;font-weight:600;cursor:pointer;">Aceptar</button></span>';
    b.addEventListener("click",function(e){
      var a=e.target&&e.target.getAttribute?e.target.getAttribute("data-a"):null;
      if(!a) return;
      try{ localStorage.setItem(KEY,a); }catch(_){}
      b.remove(); if(a==="yes") track();
    });
    document.body.appendChild(b);
  }
  if(choice==="yes") track();
  else if(choice!=="no") banner();
})();
