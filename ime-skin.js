/* ============================================================
   IMESkin — Gráfica viva (motor generativo de fondo)
   IME Link 2027 · identidad: campo cian–esmeralda
   ------------------------------------------------------------
   Campo continuo (fragment shader WebGL: fBm + domain warping).
   La identidad (color) se separa de la LUZ (estación + hora).

   Interacción (mouse · touch · multitouch): cada puntero activo
   actúa como un ATRACTOR que agita e ilumina el campo. Sirve para
   las tres experiencias: escritorio (mouse), tablet/teléfono
   (touch) y multitouch real (un atractor por dedo). Sin audio.

   Parámetros de entrada calibrables en vivo vía window.IMESkinAPI
   (ver input-calibrator.js). Degrada sin WebGL y respeta
   prefers-reduced-motion. Privacidad: solo posiciones de sesión.
   ============================================================ */
window.IMESkin = (function () {
  const MAXP = 10; // tope físico de atractores simultáneos
  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

  const FRAG = `
  precision highp float;
  #define MAXP ${MAXP}
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec3 u_id;
  uniform vec3 u_id2;
  uniform float u_dualMix;
  uniform float u_collective;
  uniform float u_individual;
  uniform float u_warm;
  uniform float u_day;
  uniform float u_grain;
  uniform vec3 u_pointers[MAXP]; // (x, y) en uv, z = intensidad
  uniform int u_pointerCount;
  uniform float u_pradius;       // radio de influencia
  uniform float u_warpGain;      // cuánto agita el atractor
  uniform float u_glow;          // brillo del halo del atractor

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v=0.0, a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    float aspect = u_res.x / u_res.y;
    vec2 auv = vec2(uv.x * aspect, uv.y);

    float inf = 0.0;
    for(int i=0;i<MAXP;i++){
      if(i >= u_pointerCount) break;
      vec3 ptr = u_pointers[i];
      vec2 pp = vec2(ptr.x * aspect, ptr.y);
      float d = distance(auv, pp);
      inf += ptr.z * smoothstep(u_pradius, 0.0, d);
    }
    inf = min(inf, 1.5);

    vec2 p = uv * (2.2 + u_collective*1.2);
    p.x *= aspect;
    float t = u_time * (0.02 + u_collective*0.03);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
    float warpAmt = 0.6 + u_individual*1.6 + inf*u_warpGain;
    vec2 r = vec2(fbm(p + warpAmt*q + vec2(1.7,9.2)), fbm(p + warpAmt*q + vec2(8.3,2.8)));
    float f = fbm(p + warpAmt*r);

    // Identidad bicolor: las zonas calmas del campo toman el color A
    // (u_id, energia colectiva) y las turbulencias del warp el color B
    // (u_id2, energia individual). u_dualMix = 0 → monocromo clasico.
    float zone = smoothstep(0.30, 0.85, length(r));
    zone = min(1.0, zone + inf * 0.5); // el toque empuja hacia B
    vec3 ident = mix(u_id, u_id2, zone * u_dualMix);
    vec3 base = ident;
    vec3 deep = ident * 0.28;
    vec3 col = mix(deep, base, smoothstep(0.25, 0.95, f));
    col += (0.18 + u_collective*0.22) * pow(f, 3.0);

    col += inf * u_glow * mix(vec3(1.0), mix(u_id, u_id2, u_dualMix), 0.35); // halo del atractor (color B)

    vec3 warmTint = vec3(1.08, 0.96, 0.82);
    vec3 coolTint = vec3(0.82, 0.95, 1.12);
    col *= mix(coolTint, warmTint, u_warm);
    col *= mix(0.10, 1.0, u_day);

    col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.04 * u_grain;
    gl_FragColor = vec4(col, 1.0);
  }`;

  const IDENTITIES = {
    "ime-link":          [0.37, 0.84, 0.78],
    "ime-conecta":       [0.66, 0.55, 0.94],
    "ime-planificacion": [0.93, 0.62, 0.36]
  };
  // Color secundario de identidad (por defecto del color B en modo bicolor)
  const IDENTITIES2 = {
    "ime-link":          [0.20, 0.85, 0.65],  // esmeralda
    "ime-conecta":       [0.91, 0.47, 0.98],  // magenta
    "ime-planificacion": [0.76, 0.37, 0.16]   // naranja
  };

  // Calidez por mes (enero → diciembre), calibrada para el hemisferio sur.
  const SEASON_WARMTH = [0.9,0.85,0.6,0.45,0.3,0.15,0.15,0.25,0.5,0.65,0.8,0.9];

  function context() {
    const now = new Date();
    const month = now.getMonth(), hour = now.getHours();
    const warm = SEASON_WARMTH[month];
    const day = Math.max(0, Math.min(1, 1 - Math.abs(hour - 13) / 11));
    const coarse = (navigator.maxTouchPoints > 0) ? 1.0 : 0.6;
    return { warm, day: 0.25 + day * 0.75, grain: coarse };
  }

  // Contexto simulado (Simulador de luz del calibrador): hora y mes
  // forzados, con mes fraccionario para animar el ciclo anual suave.
  // La luz replica el modelo de app.js: día más largo en verano y una
  // ventana de crepúsculo de ~48 min alrededor del amanecer/atardecer.
  function simulatedContext(sim) {
    const m = ((sim.month % 12) + 12) % 12;
    const i0 = Math.floor(m), i1 = (i0 + 1) % 12, f = m - i0;
    const warm = SEASON_WARMTH[i0] * (1 - f) + SEASON_WARMTH[i1] * f;
    const len = 9.5 + warm * 5;
    const sr = 13 - len / 2, ss = 13 + len / 2, w = 0.8;
    const sstep = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
    const h = ((sim.hour % 24) + 24) % 24;
    const day = Math.max(0, Math.min(1, Math.min(sstep(sr - w, sr + w, h), 1 - sstep(ss - w, ss + w, h))));
    const coarse = (navigator.maxTouchPoints > 0) ? 1.0 : 0.6;
    return { warm, day, grain: coarse };
  }

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }

  // ---- Sets por clase de dispositivo (phone · tablet · desktop) ----
  // Límites válidos de cada parámetro (mismos rangos que el calibrador).
  // Todo valor que llegue de red o almacenamiento se recorta a estos rangos.
  const PARAM_LIMITS = {
    radius:        [0.02, 0.90],
    warpGain:      [0, 6],
    glow:          [0, 1.5],
    smoothing:     [0.01, 0.60],
    pressedMul:    [1, 5],
    touchStrength: [0.2, 4],
    maxPointers:   [1, 10],  // tope físico del shader (MAXP)
    // Apariencia del campo
    collective:    [0, 1.5],
    individual:    [0, 1.5],
    timeSpeed:     [0, 3],
    grainMul:      [0, 2],
    veil:          [0, 1],
    colAmp:        [0, 1],  // amplitud de mutación por actividad
    dualMix:       [0, 1]   // mezcla bicolor (0 = monocromo)
  };

  function hexToRgb01(hex) {
    const m = /^#([0-9a-fA-F]{6})$/.exec(hex || "");
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function sanitizeParams(p) {
    const out = {};
    if (!p || typeof p !== "object") return out;
    Object.keys(PARAM_LIMITS).forEach(k => {
      let v = +p[k];
      if (!isFinite(v)) return;
      const lo = PARAM_LIMITS[k][0], hi = PARAM_LIMITS[k][1];
      v = Math.min(hi, Math.max(lo, v));
      out[k] = (k === "maxPointers") ? Math.round(v) : v;
    });
    if (typeof p.idColor === "string" && /^#[0-9a-fA-F]{6}$/.test(p.idColor)) out.idColor = p.idColor;
    if (typeof p.idColor2 === "string" && /^#[0-9a-fA-F]{6}$/.test(p.idColor2)) out.idColor2 = p.idColor2;
    return out;
  }

  // Clasificación: sin touch → desktop; con touch, lado menor de pantalla
  // < 600 px → phone, si no → tablet (detecta iPad aunque Safari se
  // presente como escritorio: maxTouchPoints lo delata).
  function deviceClass() {
    const touch = (navigator.maxTouchPoints || 0) > 0 ||
      (typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches);
    if (!touch) return "desktop";
    const side = Math.min(screen.width || 0, screen.height || 0);
    return (side > 0 && side < 600) ? "phone" : "tablet";
  }

  // ---- Gestión de punteros (mouse · touch · multitouch) ----
  function createInput(params) {
    const pointers = new Map();
    const buf = new Float32Array(MAXP * 3);
    let mouseDown = false, onChange = () => {};

    function set(id, clientX, clientY, target) {
      let pt = pointers.get(id);
      if (!pt) { pt = { x: 0.5, y: 0.5, s: 0, target: 0 }; pointers.set(id, pt); }
      if (clientX != null) { pt.x = clientX / innerWidth; pt.y = 1 - clientY / innerHeight; }
      pt.target = target;
      onChange();
    }
    function end(id) { const pt = pointers.get(id); if (pt) pt.target = 0; }

    addEventListener("mousemove", e => set("mouse", e.clientX, e.clientY, mouseDown ? params.pressedMul : 1.0));
    addEventListener("mousedown", e => { mouseDown = true; set("mouse", e.clientX, e.clientY, params.pressedMul); });
    addEventListener("mouseup",   e => { mouseDown = false; set("mouse", e.clientX, e.clientY, 1.0); });
    document.addEventListener("mouseleave", () => end("mouse"));

    function touches(e) {
      const active = new Set();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i], id = "t" + t.identifier;
        active.add(id); set(id, t.clientX, t.clientY, params.touchStrength);
      }
      pointers.forEach((_, id) => { if (id[0] === "t" && !active.has(id)) end(id); });
      onChange();
    }
    ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(ev =>
      addEventListener(ev, touches, { passive: true }));

    function pack() {
      pointers.forEach((pt, id) => {
        pt.s += (pt.target - pt.s) * (pt.d || params.smoothing);
        if (pt.target === 0 && pt.s < 0.01) pointers.delete(id);
      });
      const arr = [...pointers.values()].sort((a, b) => b.s - a.s).slice(0, params.maxPointers);
      for (let i = 0; i < MAXP; i++) {
        const o = i * 3;
        if (i < arr.length) { buf[o] = arr[i].x; buf[o + 1] = arr[i].y; buf[o + 2] = arr[i].s; }
        else { buf[o] = 0; buf[o + 1] = 0; buf[o + 2] = 0; }
      }
      return arr.length;
    }
    return { buf, pack, active: () => pointers.size > 0, setOnChange: fn => { onChange = fn; }, pulse: (cx, cy, s) => { pointers.set("p" + Date.now() + Math.random(), { x: cx / innerWidth, y: 1 - cy / innerHeight, s: s || 3.2, target: 0, d: 0.06 }); onChange(); } };
  }

  function mount(opts) {
    opts = opts || {};
    const canvas = typeof opts.canvas === "string" ? document.querySelector(opts.canvas) : opts.canvas;
    if (!canvas) return null;
    const id = IDENTITIES[opts.appKey] || IDENTITIES["ime-link"];
    const id2base = IDENTITIES2[opts.appKey] || IDENTITIES2["ime-link"];
    // preserveDrawingBuffer evita el desgarro/triángulo negro en Safari iPad al tocar.
    const glOpts = { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "default", failIfMajorPerformanceCaveat: false };
    const gl = canvas.getContext("webgl", glOpts) || canvas.getContext("experimental-webgl", glOpts);

    if (!gl) {
      const [r, g, b] = id.map(v => Math.round(v * 255));
      canvas.style.background = `radial-gradient(120% 120% at 30% 10%, rgba(${r},${g},${b},.5), #0b1413 70%)`;
      return null;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = n => gl.getUniformLocation(prog, n);
    const u = { res: U("u_res"), time: U("u_time"), id: U("u_id"),
      id2: U("u_id2"), dualMix: U("u_dualMix"),
      collective: U("u_collective"), individual: U("u_individual"),
      warm: U("u_warm"), day: U("u_day"), grain: U("u_grain"),
      pointers: U("u_pointers"), pointerCount: U("u_pointerCount"),
      pradius: U("u_pradius"), warpGain: U("u_warpGain"), glow: U("u_glow") };

    // ---- Parámetros de entrada (estándar del sitio, calibración aprobada) ----
    const isTouch = navigator.maxTouchPoints > 0;
    const DEFAULTS = {
      radius: 0.5,         // alcance del atractor
      warpGain: 2,         // intensidad de agitación
      glow: 0.5,           // brillo del halo
      smoothing: 0.3,      // suavizado (lerp 0..1)
      pressedMul: 1.4,     // fuerza al presionar (mouse)
      touchStrength: 2.5,  // fuerza de cada toque
      maxPointers: 10,     // máx. atractores
      // Apariencia del campo
      idColor: null,       // color A hex "#rrggbb"; null = identidad del sitio
      idColor2: null,      // color B hex; null = identidad secundaria del sitio
      dualMix: 0,          // mezcla bicolor (0 = monocromo clásico)
      collective: 0.4,     // energía colectiva BASE (punto de partida)
      colAmp: 0.3,         // amplitud de mutación por actividad de navegación
      individual: 0.25,    // energía individual (warp base)
      timeSpeed: 1,        // multiplicador del tiempo del shader
      grainMul: 1,         // multiplicador del grano fílmico
      veil: 0.86           // opacidad del velo de legibilidad
    };
    const params = Object.assign({}, DEFAULTS);

    const sources = Object.assign({ collective: () => 0.4, individual: () => 0.25 }, opts.sources || {});
    const ctx = context();
    const input = createInput(params);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener("resize", resize);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sim = null; // {hour, month} → Simulador de luz (solo previsualización local)
    let idHexCache = null, idRgbCache = null;   // color A personalizado
    let id2HexCache = null, id2RgbCache = null; // color B personalizado
    let running = true, looping = false, raf = 0, lastDraw = 0;

    // ---- Pulso de navegación (energía colectiva viva) ----
    // La energía colectiva calibrada es el punto de partida; la señal de
    // navegación la hace mutar hacia arriba, con amplitud colAmp.
    // Señal local: scroll/clic del visitante actual, acumulador que
    // decae (~45 s). Nada sale del navegador. Señal global: agregado de
    // eventos de la última hora vía RPC ime_pulso, consultado cada 3 min.
    // Sin RPC, sin consentimiento o sin actividad, todo degrada a la base.
    let navAcc = 0, navLast = performance.now(), pulseGlobal = 0, navSignal = 0;
    function navKick(v) { navAcc = Math.min(1, navAcc + v); ensureLoop(); }
    let navTick = 0;
    addEventListener("scroll", () => {
      const n = performance.now();
      if (n - navTick > 400) { navTick = n; navKick(0.06); }
    }, { passive: true });
    addEventListener("click", () => navKick(0.12), true);
    addEventListener("pointerdown", () => navKick(0.04), { passive: true });
    (function pulse() {
      const sb = window.IME_SUPABASE || {};
      if (!sb.url || !sb.anonKey) return;
      function ask() {
        fetch(sb.url + "/rest/v1/rpc/ime_pulso", {
          method: "POST",
          headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ p_app: opts.appKey || "" })
        }).then(r => (r.ok ? r.json() : 0))
          .then(n => { pulseGlobal = 1 - Math.exp(-(+n || 0) / 40); ensureLoop(); })
          .catch(() => { pulseGlobal = 0; });
      }
      setTimeout(ask, 4000);
      setInterval(ask, 180000);
    })();
    const start = performance.now();
    // Tasa en reposo adaptativa: táctil (phone/tablet) ~15 fps para ahorrar batería,
    // escritorio ~30 fps. Al interactuar siempre va a 60 fps.
    const touchDevice = (typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches) || (navigator.maxTouchPoints || 0) > 0;
    const IDLE_MS = touchDevice ? 66 : 33;

    function ensureLoop() { if (running && !looping) { looping = true; raf = requestAnimationFrame(frame); } }
    input.setOnChange(ensureLoop);

    function frame(now) {
      if (!running) { looping = false; return; }
      const active = input.active();
      // En reposo limita la tasa de frames; al interactuar va a plena fluidez.
      if (now - lastDraw < (active ? 0 : IDLE_MS)) {
        if (!reduce || active) { raf = requestAnimationFrame(frame); } else { looping = false; }
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;
      const count = input.pack();
      var idc = id;
      if (params.idColor) {
        if (params.idColor !== idHexCache) { idHexCache = params.idColor; idRgbCache = hexToRgb01(params.idColor); }
        if (idRgbCache) idc = idRgbCache;
      }
      var idc2 = id2base;
      if (params.idColor2) {
        if (params.idColor2 !== id2HexCache) { id2HexCache = params.idColor2; id2RgbCache = hexToRgb01(params.idColor2); }
        if (id2RgbCache) idc2 = id2RgbCache;
      }
      const ndt = Math.min(0.25, (now - navLast) / 1000); navLast = now;
      navAcc *= Math.exp(-ndt / 45);
      const navTarget = Math.min(1, navAcc * 0.7 + pulseGlobal * 0.6);
      navSignal += (navTarget - navSignal) * 0.02;
      const colBase = params.collective != null ? params.collective : sources.collective();
      const colLive = Math.min(1.5, colBase + (params.colAmp || 0) * navSignal);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, reduce ? 0 : t * (params.timeSpeed != null ? params.timeSpeed : 1));
      gl.uniform3f(u.id, idc[0], idc[1], idc[2]);
      gl.uniform3f(u.id2, idc2[0], idc2[1], idc2[2]);
      gl.uniform1f(u.dualMix, params.dualMix != null ? params.dualMix : 0);
      gl.uniform1f(u.collective, colLive);
      gl.uniform1f(u.individual, params.individual != null ? params.individual : sources.individual());
      var c = sim ? simulatedContext(sim) : context(); // luz en vivo o simulada
      gl.uniform1f(u.warm, c.warm);
      gl.uniform1f(u.day, sim ? c.day : (sources.day ? sources.day() : c.day));
      gl.uniform1f(u.grain, c.grain * (params.grainMul != null ? params.grainMul : 1));
      gl.uniform3fv(u.pointers, input.buf);
      gl.uniform1i(u.pointerCount, count);
      gl.uniform1f(u.pradius, params.radius);
      gl.uniform1f(u.warpGain, params.warpGain);
      gl.uniform1f(u.glow, params.glow);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (running && (!reduce || input.active())) raf = requestAnimationFrame(frame);
      else looping = false;
    }
    ensureLoop();

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) ensureLoop();
    });

    // Efectos fuera del shader: el velo de legibilidad es un elemento CSS.
    // Solo se fija inline cuando difiere del default, para no pisar la
    // variante del tema claro definida en la hoja de estilos.
    const veilEl = document.querySelector(".skin-veil");
    function applyFx() {
      if (!veilEl) return;
      if (params.veil != null && params.veil !== DEFAULTS.veil) veilEl.style.opacity = params.veil;
      else veilEl.style.removeProperty("opacity");
    }

    // ---- Set global por clase de dispositivo (Supabase) ----
    // La calibración aprobada vive en la tabla ime_skin_calibracion
    // (una fila por sitio y clase). Lectura anónima; la publicación se
    // hace desde el calibrador (cuenta directora). localStorage actúa de
    // caché para arrancar sin esperar la red. Si en este navegador existe
    // una copia de trabajo del calibrador (imelink-input-params), esa
    // tiene prioridad y el set global no la pisa.
    const klass = deviceClass();
    (function loadGlobalSet() {
      const sb = window.IME_SUPABASE || {};
      let hasWorkingCopy = false;
      try { hasWorkingCopy = !!localStorage.getItem("imelink-input-params"); } catch (e) {}
      const cacheKey = "ime-skin-set-" + (opts.appKey || "") + "-" + klass;

      if (!hasWorkingCopy) {
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
          if (cached) { Object.assign(params, sanitizeParams(cached)); applyFx(); }
        } catch (e) {}
      }
      if (!sb.url || !sb.anonKey) return;
      fetch(sb.url + "/rest/v1/ime_skin_calibracion?app_key=eq." +
        encodeURIComponent(opts.appKey || "") + "&device_class=eq." + klass + "&select=params",
        { headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey } })
        .then(r => (r.ok ? r.json() : []))
        .then(rows => {
          const p = rows && rows[0] && rows[0].params;
          if (!p) return;
          const clean = sanitizeParams(p);
          try { localStorage.setItem(cacheKey, JSON.stringify(clean)); } catch (e) {}
          if (!hasWorkingCopy) { Object.assign(params, clean); applyFx(); ensureLoop(); }
        })
        .catch(() => {});
    })();

    // ---- API pública para el calibrador ----
    const api = {
      sources,
      defaults: () => Object.assign({}, DEFAULTS),
      getParams: () => Object.assign({}, params),
      setParam: (k, v) => { if (k in params) { params[k] = v; applyFx(); ensureLoop(); } },
      setParams: obj => { Object.keys(obj || {}).forEach(k => { if (k in params) params[k] = obj[k]; }); applyFx(); ensureLoop(); },
      reset: () => { Object.assign(params, DEFAULTS); applyFx(); ensureLoop(); },
      refresh: ensureLoop,
      pulse: (x, y) => input.pulse(x, y),
      identity: () => id.slice(),
      identity2: () => id2base.slice(),
      deviceClass: () => klass,
      sanitize: sanitizeParams,
      appKey: () => (opts.appKey || ""),
      simulate: s => { sim = s ? { hour: +s.hour || 0, month: +s.month || 0 } : null; ensureLoop(); },
      simulating: () => !!sim,
      info: () => ({
        touch: isTouch,
        maxTouch: navigator.maxTouchPoints || 0,
        cores: navigator.hardwareConcurrency || null,
        memory: navigator.deviceMemory || null,
        dpr: +(window.devicePixelRatio || 1).toFixed(2),
        webgl: true
      })
    };
    window.IMESkinAPI = api;
    return api;
  }

  return { mount };
})();
