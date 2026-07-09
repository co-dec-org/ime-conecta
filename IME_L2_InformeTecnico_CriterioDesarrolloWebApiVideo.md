# Informe técnico y de diseño — Criterio de desarrollo de las tres webs IME y su relación con la web-api-video

**Proyecto:** IME (Conecta, Planificación Estratégica, Link 2027)
**Tipo:** Informe técnico y de diseño
**Estado:** Propuesta de criterio para el desarrollo.
**Versión:** v01 · 28 de junio de 2026
**Relacionados:** Desarrollo estético de la gráfica viva; Modelo de datos unificado; Protocolo de desarrollo web.

---

## 1. Objetivo

Explicitar el **criterio** que guía el desarrollo de las tres webs IME y su relación con la **web-api-video** (las APIs web de imagen/video en tiempo real). Es decir: qué queremos lograr, y con qué tecnología del navegador lo hacemos, de forma coherente entre los tres sitios.

---

## 2. El criterio propuesto

El desarrollo de las tres webs se rige por cinco criterios:

1. **Un motor, tres identidades (gráfica viva).** Un único motor gráfico compartido produce una imagen generativa de fondo; cada proyecto tiene su identidad de color estable (Conecta violeta–magenta, Planificación ámbar–naranja, Link cian–esmeralda).
2. **Estética modulada por el uso.** La imagen no es decorativa fija: se modula con la actividad de la comunidad y el contexto del visitante (modelo FM: colectivo = portadora, individuo = modulación; estación, hora y dispositivo como éteres).
3. **Identidad de usuarios compartida.** Una sola base de identidad para los tres sitios (anónimo→registrado), con dominio y gobernanza separados por `app`.
4. **Tecnología nativa del navegador, sin dependencias.** Todo corre en el navegador, sin plugins ni librerías de terceros para el render, priorizando rendimiento, accesibilidad y longevidad.
5. **Protocolo común.** Mismas convenciones de carpetas, nombres, entregables y respaldo para los tres proyectos.

---

## 3. Qué es la web-api-video

Con "web-api-video" nos referimos a la familia de **APIs nativas del navegador para producir imagen y video en tiempo real**, sin plugins:

| Capa | API | Rol en IME |
|---|---|---|
| Gráfica programable | **WebGL / GLSL** (fragment shaders) | **Núcleo**: genera el campo generativo por píxel en la GPU |
| Dibujo 2D | Canvas 2D | Apoyo/*fallback* y composición |
| Sonido | Web Audio | Extensión futura: sonificación del mismo dato |
| Video propiamente tal | HTMLVideoElement, texturas de video, WebCodecs | Extensión: incorporar/mezclar video real como textura |

En este proyecto el **núcleo es WebGL con fragment shaders**, en la línea de *The Book of Shaders*: ruido, fBm y *domain warping*. La "imagen" es, en la práctica, **video generativo en tiempo real** calculado en el navegador.

---

## 4. Relación entre el criterio y la web-api-video

El criterio es el **qué** (una gráfica viva, modulada por datos, con identidad por proyecto); la web-api-video es el **cómo**. Cada exigencia del criterio encuentra respuesta directa en estas APIs:

| Exigencia del criterio | Cómo la resuelve la web-api-video |
|---|---|
| Imagen que cambia en tiempo real | El fragment shader se redibuja cada frame en la GPU (WebGL) |
| Estética modulada por datos | Los datos entran al shader como *uniforms* (colectivo, individuo, estación, hora) |
| Identidad estable por proyecto | Rotación de color (hue) por preset, separada de la luz contextual |
| Sin plugins, en cualquier dispositivo | WebGL es estándar y nativo; degrada de forma silenciosa si no está disponible |
| Liviano y mantenible | Un solo módulo sin dependencias; el "video" se calcula, no se descarga |

La consecuencia de diseño es potente: en lugar de **reproducir** un video pregrabado, cada web **genera su propio video** en función de quién la usa y cuándo. La herramienta (web-api-video) no es un accesorio: es el medio que hace posible el criterio.

---

## 5. Por qué esta vía y no otras

| Enfoque | Peso | Se adapta a datos | Identidad por proyecto | Mantenimiento |
|---|---|---|---|---|
| **WebGL generativo (elegido)** | Muy bajo (código) | Sí, en vivo | Sí (preset) | Un motor para los 3 |
| Video pregrabado (mp4) | Alto (archivos) | No | Un archivo por sitio | Re-render manual |
| CSS/SVG animado | Bajo | Limitado | Manual | Medio |
| Imagen estática | Bajo | No | Manual | Bajo pero muerto |

El criterio (gráfica viva, modulada, con identidad) solo lo satisface plenamente la vía **generativa con WebGL**.

---

## 6. Aplicación a cada web

El mismo motor se instancia con el preset de cada proyecto: Conecta (violeta–magenta), Planificación (ámbar–naranja) y Link 2027 (cian–esmeralda). El "video" de fondo es contextual —cambia con la estación, la hora y el uso— pero reconocible como el de su proyecto todo el año. Va como fondo detrás del contenido, con velo e intensidad que garantizan la legibilidad.

---

## 7. Extensiones futuras de la web-api-video

- **Web Audio:** sonificar el mismo dato que pinta la imagen (capa sonora coherente).
- **WebGL2 / WebGPU:** más resolución y efectos, si se requiere.
- **Texturas de video real / WebCodecs:** mezclar registro audiovisual de IME dentro del campo generativo.
- **Captura/exportación:** generar clips (gif/mp4) del skin para difusión.

---

## 8. Riesgos y mitigaciones

- **Rendimiento:** octavas acotadas y pausa cuando el fondo no se ve o la pestaña está oculta.
- **Compatibilidad:** WebGL1 / GLSL ES 1.00 por cobertura, con *fallback* silencioso.
- **Accesibilidad:** respeta `prefers-reduced-motion`; el significado no depende solo del color.
- **Legibilidad:** velo y control de intensidad sobre el contenido.

---

## 9. Criterio recomendado

Adoptar la **gráfica viva sobre web-api-video (WebGL/fragment shaders)** como criterio común de desarrollo de las tres webs IME: un motor compartido, una identidad por proyecto, imagen modulada por el uso y el contexto, tecnología nativa del navegador, y protocolo común de proyecto.

---

## 10. Referencias

González Vivo, P., & Lowe, J. (2015). *The Book of Shaders*. https://thebookofshaders.com/

Mozilla Developer Network. (s. f.). *WebGL API*. https://developer.mozilla.org/es/docs/Web/API/WebGL_API

Mozilla Developer Network. (s. f.). *Canvas API*. https://developer.mozilla.org/es/docs/Web/API/Canvas_API

Quílez, I. (2002). *Domain warping*. https://iquilezles.org/articles/warp/

---

*Documento fuente versionado en git. Exportaciones .docx/.pdf en Drive.*
