# Informe técnico — The Book of Shaders como referencia del skin generativo IME

**Proyecto:** IME (sitios IME Conecta e IME Planificación Estratégica)
**Tipo:** Informe técnico de referencia
**Estado:** Base para el diseño e implementación del skin generativo.
**Versión:** v01 · 28 de junio de 2026
**Fuente primaria:** https://thebookofshaders.com/
**Relación:** sustenta `IME_L2_InformeTecnico_VisionSkinGenerativoIME` (documento de visión).

---

## 1. Objetivo

Fundamentar técnicamente el **skin generativo propio de IME** en *fragment shaders* (GLSL/WebGL), tomando **The Book of Shaders** como referencia canónica. El skin traduce datos de uso (portadora colectiva, modulación individual y éteres de contexto) en **uniforms** que deforman un campo visual en tiempo real.

---

## 2. Qué es The Book of Shaders

Guía paso a paso del universo de los *fragment shaders*, por **Patricio Gonzalez Vivo** y **Jen Lowe** (2015). Cubre desde fundamentos (qué es un shader, GLSL, uniforms) hasta diseño generativo (random, noise, fBm, fractales) e imagen/simulación/3D. Incluye un **editor en vivo** para experimentar el código en el navegador y traducciones a múltiples idiomas (incluido español).

**Licencia y uso:** © Patricio Gonzalez Vivo, 2015. Se usa aquí como **referencia educativa**: las técnicas (matemáticas/algoritmos) son conocimiento de dominio público; el **código del skin IME es propio** y no reproduce el contenido del libro. Dato relevante para nuestro caso: Gonzalez Vivo describe explícitamente su trabajo explorando el espacio entre *"individual and collective"* — afín a nuestro modelo.

### Estructura (índice del libro)

| Bloque | Capítulos |
|---|---|
| Getting started | What is a shader · Hello world · Uniforms · Running your shader |
| Algorithmic drawing | Shaping functions · Colors · Shapes · Matrices · Patterns |
| Generative designs | Random · Noise · Cellular noise · Fractional Brownian Motion · Fractals |
| Image processing | Textures · Operations · Convolutions · Filters |
| Simulation | Pingpong · Conway · Ripples · Reaction-diffusion |
| 3D graphics | Lights · Normal/Bump maps · Ray marching · Env maps |

---

## 3. Conceptos clave y por qué nos sirven

**Fragment shader.** Programa que se ejecuta en paralelo por cada píxel; recibe coordenadas normalizadas y *uniforms* (variables externas como `u_time`, `u_resolution`, `u_mouse`). → En el skin IME, **los uniforms son los datos**: colectivo, individuo, estación, hora, dispositivo.

**Shaping functions.** Funciones que curvan/mapean valores (p. ej. `smoothstep`, potencias, seno). → Definen las **curvas de los envolventes**: la transición noche↔día y el deslizamiento entre estaciones deben ser suaves, no lineales.

**Colors.** Mezcla de color en `vec3` y manejo de espacios de color. → Soporta la **paleta IME** y las transiciones de paleta por estación.

**Random y Noise (value / Perlin).** Base de toda textura orgánica; el noise tiene amplitud y frecuencia, como una onda. → El sustrato vivo del campo.

**Fractional Brownian Motion (fBm).** Suma de varias *octavas* de noise, incrementando la frecuencia (*lacunarity*) y reduciendo la amplitud (*gain*) en cada paso; produce detalle multiescala y auto-similaridad. Idiom estándar:

```glsl
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}
```
→ Da la **textura de campo** del skin. En móvil conviene limitar las octavas (4–6).

**Variantes de carácter.** *Turbulence* (valor absoluto del noise → valles agudos), *ridge* (crestas) y *multifractales* (escalar/multiplicar términos). → Paletas de "carácter" para diferenciar estados o estaciones.

**Domain warping.** Usar fBm para deformar el espacio de otro fBm — `f(p) = fbm(p + fbm(p + fbm(p)))` (técnica de Iñigo Quílez citada por el libro). → **Es exactamente la modulación del individuo**: doblar el campo de la portadora.

**Puente conceptual decisivo.** El propio libro, en el capítulo de fBm, modula ondas y nombra el resultado como ondas **AM y FM** (amplitud/frecuencia moduladas). Es decir, nuestra metáfora rectora (colectivo = portadora, individuo = modulación FM) **no es analogía libre: es la misma operación** que el libro enseña, llevada a campo visual.

---

## 4. Mapeo a la estética generativa IME

Modelo de tres niveles (ver documento de visión): **emisión** (colectivo, compartida), **condiciones de recepción** (estación/hora/dispositivo, personales) y **voz** (individuo).

| Dato IME | Nivel | Técnica de shader | Uniform |
|---|---|---|---|
| Colectivo | Emisión | escala/brillo/velocidad del fBm (portadora) | `u_collective` |
| Individuo | Voz | intensidad de *domain warping* | `u_modulation` |
| Estación (hemisferio+fecha) | Recepción | paleta + carácter (shaping + color) | `u_season` |
| Hora local | Recepción | envolvente de luminancia/temperatura (noche↔día) | `u_daylight` |
| Dispositivo | Recepción | grano/octavas/movimiento | `u_device` |

Principio de **ortogonalidad**: recepción controla el envolvente lumínico/paleta; emisión y voz controlan estructura y movimiento. Así cada dato es legible en la estética sin enturbiar a los demás.

---

## 5. Rendimiento y buenas prácticas

- **Octavas acotadas** (4–6); el costo crece con cada iteración.
- **Compatibilidad:** apuntar a WebGL1 / GLSL ES 1.00 para máxima cobertura; `precision highp float` con *fallback* a `mediump` en móvil.
- **Sin librerías de runtime** (WebGL nativo); opcional, consultar **LYGIA** (lygia.xyz) como banco de funciones generativas reutilizables.
- **Accesibilidad:** respetar `prefers-reduced-motion` (reducir o congelar animación) y no codificar significado solo en color.
- **Degradación:** *fallback* estático si no hay WebGL.
- **Datos/privacidad:** los éteres requieren solo contexto grueso (hemisferio, hora local, tipo de dispositivo); nunca IP cruda ni ubicación precisa (alineado con la minimización de IME Conecta).

---

## 6. Recursos

- The Book of Shaders — índice y capítulos: https://thebookofshaders.com/
- fBm y domain warping (cap. 13): https://thebookofshaders.com/13/
- Iñigo Quílez — *warping*: https://iquilezles.org/articles/warp/
- Iñigo Quílez — *more noise*: https://iquilezles.org/articles/morenoise/
- LYGIA (funciones GLSL reutilizables): https://lygia.xyz/generative
- Glosario y galería de ejemplos: https://thebookofshaders.com/glossary/ · https://thebookofshaders.com/examples/

---

## 7. Implicancia para el desarrollo

El skin IME se implementa como un *fragment shader* propio (WebGL, sin dependencias), cuyos uniforms se alimentan de los datos del clúster (colectivo/individuo) y del contexto del usuario (estación/hora/dispositivo). The Book of Shaders es la **referencia formativa**; la autoría del shader IME es propia. Los skins de co-dec (constelar/espectro) **no** se reutilizan.

---

*Documento fuente versionado en git. Las exportaciones .docx/.pdf viven en Drive.*
