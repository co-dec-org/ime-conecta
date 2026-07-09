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

    vec3 base = u_id;
    vec3 deep = u_id * 0.28;
    vec3 col = mix(deep, base, smoothstep(0.25, 0.95, f));
    col += (0.18 + u_collective*0.22) * pow(f, 3.0);

    col += inf * u_glow * mix(vec3(1.0), u_id, 0.35); // halo del atractor

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

  function context() {
    const now = new Date();
    const month = now.getMonth(), hour = now.getHours();
    const sW = [0.9,0.85,0.6,0.45,0.3,0.15,0.15,0.25,0.5,0.65,0.8,0.9]; const warm = sW[month];
    const day = Math.max(0, Math.min(1, 1 - Math.abs(hour - 13) / 11));
    const coarse = (navigator.maxTouchPoints > 0) ? 1.0 : 0.6;
    return { warm, day: 0.25 + day * 0.75, grain: coarse };
  }

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
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
      maxPointers: 10      // máx. atractores
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
    let running = true, looping = false, raf = 0, lastDraw = 0;
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
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, reduce ? 0 : t);
      gl.uniform3f(u.id, id[0], id[1], id[2]);
      gl.uniform1f(u.collective, sources.collective());
      gl.uniform1f(u.individual, sources.individual());
      var c = context(); // luz en vivo: respira con la hora y la estacion
      gl.uniform1f(u.warm, c.warm);
      gl.uniform1f(u.day, (sources.day ? sources.day() : c.day));
      gl.uniform1f(u.grain, c.grain);
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

    // ---- API pública para el calibrador ----
    const api = {
      sources,
      defaults: () => Object.assign({}, DEFAULTS),
      getParams: () => Object.assign({}, params),
      setParam: (k, v) => { if (k in params) { params[k] = v; ensureLoop(); } },
      setParams: obj => { Object.keys(obj || {}).forEach(k => { if (k in params) params[k] = obj[k]; }); ensureLoop(); },
      reset: () => { Object.assign(params, DEFAULTS); ensureLoop(); },
      refresh: ensureLoop,
      pulse: (x, y) => input.pulse(x, y),
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
