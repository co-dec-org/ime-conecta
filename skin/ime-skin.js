/*
 * IME Skin — motor de skin generativo (fragment shader WebGL, sin dependencias).
 * Un solo motor, una piel por proyecto (preset). La estación (hemisferio+fecha) y la
 * hora local modulan la LUZ; la identidad (hue) de cada proyecto es estable todo el año.
 * Datos: colectivo -> portadora; individuo -> domain warping. Ref.: thebookofshaders.com
 *
 * Uso:
 *   IMESkin.mount(canvas, { preset:'conecta', hemisphere:'S',
 *                           intensity:0.6, scrim:true,
 *                           getCollective:()=>0..1, getModulation:()=>0..1 });
 */
(function (global) {
  'use strict';

  var PRESETS = {
    planificacion: { name: 'IME Planificación', hue: 0.00,   collective: 0.50, modulation: 0.35 },
    link2027:      { name: 'IME Link 2027',     hue: 0.45,   collective: 0.72, modulation: 0.55 },
    conecta:       { name: 'IME Conecta',       hue: 0.6667, collective: 0.30, modulation: 0.20 }
  };

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_time;uniform float u_col;uniform float u_mod;uniform float u_warmth;uniform float u_day;uniform float u_dev;uniform float u_hue;uniform float u_intensity;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i);float b=hash(i+vec2(1.,0.));float c=hash(i+vec2(0.,1.));float d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}',
    'float fbm(vec2 p){float v=0.,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}',
    'vec3 sat(vec3 c,float s){float l=dot(c,vec3(0.299,0.587,0.114));return mix(vec3(l),c,s);}',
    'vec3 hueShift(vec3 c,float h){vec3 k=vec3(0.57735);float ca=cos(h*6.2831);return c*ca+cross(k,c)*sin(h*6.2831)+k*dot(k,c)*(1.-ca);}',
    'void main(){',
    ' vec2 st=gl_FragCoord.xy/u_res.xy;st.x*=u_res.x/u_res.y;',
    ' float eCol=smoothstep(0.0,1.0,u_col);float eMod=u_mod*u_mod;float eDay=smoothstep(0.0,1.0,u_day);float eW=smoothstep(0.05,0.95,u_warmth);',
    ' float t=u_time*(0.03+0.10*eCol);float scale=mix(1.1,6.0,eCol);',
    ' vec2 q=vec2(fbm(st*scale+t),fbm(st*scale+vec2(5.2,1.3)-t));',
    ' float warp=1.0+7.0*eMod;',
    ' vec2 r=vec2(fbm(st*scale+q*warp+vec2(1.7,9.2)+t),fbm(st*scale+q*warp+vec2(8.3,2.8)-t));',
    ' float f=fbm(st*scale+r*warp);f=mix(f,abs(f-0.5)*2.0,eMod*0.6);',
    ' vec3 bg=vec3(0.067,0.063,0.059);vec3 cyan=vec3(0.373,0.843,0.875),coral=vec3(0.941,0.447,0.384),gold=vec3(0.929,0.784,0.365);',
    ' vec3 field=bg;field=mix(field,coral,clamp(f*f*1.6,0.,1.));field=mix(field,gold,clamp(length(q)*0.6,0.,1.));field=mix(field,cyan,clamp(pow(f,4.0)*1.7,0.,1.));',
    ' field=hueShift(field,u_hue);field=sat(field,mix(0.95,1.2,eW));',
    ' vec3 tint=mix(mix(vec3(0.42,0.30,0.52),vec3(0.66,0.46,0.74),eW),mix(vec3(0.92,0.96,1.08),vec3(1.16,1.04,0.86),eW),eDay);',
    ' field*=tint;field*=mix(0.80,1.25,eCol);field=(field-0.5)*1.08+0.5;',
    ' float g=hash(gl_FragCoord.xy+u_time);field+=(g-0.5)*0.10*(1.0-u_dev*0.85);',
    ' vec2 v=st-vec2(0.5*u_res.x/u_res.y,0.5);field*=1.0-0.55*dot(v,v);',
    ' field=mix(bg,field,clamp(u_intensity,0.0,1.0));',           // intensidad: empuja el skin al fondo
    ' gl_FragColor=vec4(clamp(field,0.0,1.0),1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error('IMESkin shader:', gl.getShaderInfoLog(s));
    return s;
  }
  function dayOfYear(d) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); }
  function seasonWarmth(date, hemisphere) {
    var peak = hemisphere === 'N' ? 172 : 355;
    return 0.5 + 0.5 * Math.cos(2 * Math.PI * (dayOfYear(date) - peak) / 365);
  }
  function daylight(date, warmth) {
    var h = date.getHours() + date.getMinutes() / 60;
    var len = 9 + 6 * warmth, sr = 13 - len / 2, ss = 13 + len / 2;
    var up = Math.min(Math.max((h - (sr - 1)) / 2, 0), 1);
    var dn = Math.min(Math.max((h - (ss - 1)) / 2, 0), 1);
    return Math.max(0, up - dn);
  }
  function mq(q) { return typeof matchMedia === 'function' && matchMedia(q).matches; }

  function mount(canvas, options) {
    options = options || {};
    var preset = typeof options.preset === 'string' ? PRESETS[options.preset] : options.preset;
    if (!preset) preset = PRESETS.conecta;

    var hemisphere = options.hemisphere || 'S';
    var intensity = options.intensity != null ? options.intensity : 1.0;
    var getCollective = options.getCollective || function () { return preset.collective; };
    var getModulation = options.getModulation || function () { return preset.modulation; };
    var device = options.device != null ? options.device : (mq('(pointer:coarse)') ? 0 : 1);
    var reduced = (options.respectReducedMotion !== false) && mq('(prefers-reduced-motion: reduce)');

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { destroy: function () {}, setPreset: function () {}, setIntensity: function () {} };

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['u_res','u_time','u_col','u_mod','u_warmth','u_day','u_dev','u_hue','u_intensity'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    // --- scrim opcional (garantía de contraste para texto encima) ---
    var scrimEl = null;
    if (options.scrim) {
      var parent = canvas.parentNode;
      if (parent) {
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
        scrimEl = document.createElement('div');
        var bgcss = options.scrim === true
          ? 'linear-gradient(180deg, rgba(17,16,15,.25), rgba(17,16,15,.55))'
          : (typeof options.scrim === 'string' ? options.scrim
             : 'rgba(' + (options.scrim.color || '17,16,15') + ',' + (options.scrim.opacity != null ? options.scrim.opacity : 0.45) + ')');
        scrimEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:' + bgcss + ';';
        if (canvas.nextSibling) parent.insertBefore(scrimEl, canvas.nextSibling); else parent.appendChild(scrimEl);
      }
    }

    // --- tamaño: solo cuando cambia ---
    var dpr = Math.min(global.devicePixelRatio || 1, 2), lastW = 0, lastH = 0;
    function resize() {
      var w = Math.round((canvas.clientWidth || canvas.width) * dpr);
      var h = Math.round((canvas.clientHeight || canvas.height) * dpr);
      if (w === lastW && h === lastH) return;
      lastW = w; lastH = h; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }

    function draw(timeSec) {
      var date = new Date(), warmth = seasonWarmth(date, hemisphere);
      resize();
      gl.uniform2f(U.u_res, canvas.width, canvas.height);
      gl.uniform1f(U.u_time, timeSec);
      gl.uniform1f(U.u_col, getCollective());
      gl.uniform1f(U.u_mod, getModulation());
      gl.uniform1f(U.u_warmth, warmth);
      gl.uniform1f(U.u_day, daylight(date, warmth));
      gl.uniform1f(U.u_dev, device);
      gl.uniform1f(U.u_hue, preset.hue);
      gl.uniform1f(U.u_intensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // --- ciclo con pausa por visibilidad ---
    var raf = null, elapsed = 0, lastNow = 0, visible = true, pageVisible = !(typeof document !== 'undefined' && document.hidden);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      elapsed += Math.min((now - lastNow) / 1000, 0.1); lastNow = now;
      draw(elapsed);
    }
    function start() { if (raf == null && !reduced) { lastNow = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { if (raf != null) { cancelAnimationFrame(raf); raf = null; } }
    function active() { return visible && pageVisible; }
    function update() {
      if (reduced) { if (active()) draw(0); return; }      // estático: 1 frame
      if (active()) start(); else stop();
    }

    var io = null;
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; update(); });
      io.observe(canvas);
    }
    function onVis() { pageVisible = !document.hidden; update(); }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    function onResize() { resize(); if (reduced && active()) draw(0); }
    global.addEventListener('resize', onResize);

    update(); if (reduced) draw(0);

    return {
      destroy: function () {
        stop();
        if (io) io.disconnect();
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
        global.removeEventListener('resize', onResize);
        if (scrimEl && scrimEl.parentNode) scrimEl.parentNode.removeChild(scrimEl);
      },
      setPreset: function (p) { preset = (typeof p === 'string' ? PRESETS[p] : p) || preset; if (reduced && active()) draw(0); },
      setIntensity: function (v) { intensity = v; if (reduced && active()) draw(0); }
    };
  }

  global.IMESkin = { mount: mount, PRESETS: PRESETS, seasonWarmth: seasonWarmth, daylight: daylight };
})(typeof window !== 'undefined' ? window : this);
