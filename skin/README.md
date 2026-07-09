# IME Skin — motor generativo

Fragment shader WebGL (sin dependencias) compartido por las webs IME. Un motor, una piel por
proyecto vía *preset*. La identidad (hue) de cada proyecto es estable todo el año; estación y hora
modulan la luz. Referencia técnica: thebookofshaders.com (noise, fBm, domain warping).

## Archivos
- `ime-skin.js` — motor. Expone `window.IMESkin.mount(canvas, options)`.
- `presets/*.json` — datos por proyecto (hue, colectivo, modulación, app_key).
- `demo.html` — demo a pantalla completa con selector de preset.

## Uso

```html
<canvas id="bg"></canvas>
<script src="ime-skin.js"></script>
<script>
  IMESkin.mount(document.getElementById('bg'), {
    preset: 'planificacion',        // o 'conecta' / 'link2027' / objeto propio
    hemisphere: 'S',                // 'S' (sur) o 'N' (norte)
    getCollective: () => 0.5,       // 0..1 desde analytics_anonymized (portadora)
    getModulation: () => 0.3        // 0..1 desde navegación/notas del usuario (voz)
  });
</script>
```

## Opciones
- `preset`: nombre (`conecta`|`planificacion`|`link2027`) u objeto `{hue,collective,modulation}`.
- `hemisphere`: `'S'`|`'N'` (define la estación a partir de la fecha).
- `getCollective()` / `getModulation()`: funciones que devuelven 0..1 (datos en vivo).
- `device`: `0` móvil / `1` escritorio (por defecto se detecta).
- `respectReducedMotion`: respeta `prefers-reduced-motion` (por defecto `true`).

`mount()` devuelve `{ destroy(), setPreset(p) }`.

## Opciones nuevas (legibilidad y rendimiento)
- `intensity` (0..1, def. 1): empuja el skin al fondo. Como fondo de un sitio, usar ~0.6.
- `scrim`: `true` (degradado oscuro), un color CSS, u objeto `{color:'17,16,15', opacity:0.45}`.
  Inserta un velo sobre el canvas para garantizar contraste del texto encima.
- **Auto-pausa:** el motor se detiene cuando el canvas sale de pantalla (IntersectionObserver)
  o la pestaña queda oculta, y reanuda al volver. El `resize` solo recalcula al cambiar el tamaño.
- `setIntensity(v)` y `setPreset(p)` disponibles en el controlador devuelto por `mount()`.

## Notas
- Hoy `getCollective/getModulation` usan los valores base del preset; al conectar Supabase
  se alimentan del agregado anonimizado (colectivo) y de la sesión (individuo).
- WebGL1 / GLSL ES 1.00 por compatibilidad; *fallback* silencioso si no hay WebGL.
