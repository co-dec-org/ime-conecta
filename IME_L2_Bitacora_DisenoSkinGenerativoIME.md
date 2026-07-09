# Bitácora — Arquitectura y diseño web del skin generativo IME

**Proyecto:** IME (motor de skin compartido por IME Planificación Estratégica, IME Link 2027 e IME Conecta)
**Tipo:** Bitácora de proceso (arquitectura y diseño)
**Estado:** Vivo. Se actualiza por entradas fechadas.
**Versión:** v01 · 28 de junio de 2026
**Relacionados:** `IME_L2_InformeTecnico_VisionSkinGenerativoIME` (visión) · `IME_L2_InformeTecnico_ReferenciaBookOfShaders` (referencia técnica).

---

## 1. Propósito

Registro vivo de las decisiones de **arquitectura y diseño web** del skin generativo y de la plataforma IME. La visión fija el "qué/por qué"; esta bitácora deja la **traza del proceso**: qué se decidió, cuándo y por qué, iteración por iteración.

---

## 2. Arquitectura (resumen)

**Frontend / render.** *Fragment shader* en WebGL (GLSL ES 1.00), sin librerías de runtime. Los datos del sistema son los **uniforms** del shader. Técnicas base (Book of Shaders): value noise, fBm y *domain warping*.

**Modelo de tres niveles.**

- **Emisión (colectivo):** portadora compartida; igual para todos.
- **Recepción (contexto):** estación, hora local, dispositivo; personal pero no es "voz".
- **Voz (individuo):** navegación, permanencia, notas.

**Identidad estable (decisión clave v7).** El *hue* de cada proyecto fija la identidad **todo el año**; estación y hora modulan solo la **luz** (brillo/temperatura) sobre esa identidad. Se separa pigmento (identidad) de luz (contexto) para que título y visual nunca se contradigan.

**Datos.** Supabase compartido: `auth.users` único con anónimos (anonymous sign-in) que ascienden a registrados; `analytics_anonymized` (agregado irreversible) alimenta la portadora; RLS y consentimiento **por `app`**.

**Motor compartido, una piel por proyecto.** Un solo shader; un **preset** (plantilla de datos) por proyecto, repartidos en la rueda 360°/3.

---

## 3. Mapeo preset → proyecto

| Preset | Proyecto | Rueda | Tono base | Estado identidad |
|---|---|---|---|---|
| 1 · Núcleo | IME Planificación Estratégica | 0° | hue 0.00 | base, por afinar |
| 2 · Deriva | IME Link 2027 (nuevo) | 120° | hue 0.33 | base, por afinar |
| 3 · Reposo | IME Conecta | 240° | hue 0.67 | **magenta, aprobado** |

---

## 4. Mapeo dato → parámetro del shader (uniforms)

| Dato | Nivel | Uniform | Efecto |
|---|---|---|---|
| Colectivo | emisión | `u_collective` | escala/brillo/velocidad del campo (portadora) |
| Individuo | voz | `u_modulation` | intensidad de *domain warping* (turbulencia) |
| Estación | recepción | `u_warmth` | temperatura/brillo de la luz (derivado de hemisferio+día) |
| Hora local | recepción | `u_daylight` | ciclo noche↔día (luminancia/temperatura) |
| Dispositivo | recepción | `u_device` | grano/textura |
| Proyecto | identidad | `u_hue` | rotación de tono estable por proyecto |

Principio: **ortogonalidad** — cada dato controla una dimensión perceptual independiente; identidad (hue) y luz (estación/hora) van separadas.

---

## 5. Bitácora de decisiones — 28 jun 2026

- **Concepto.** Web bidireccional, dos umbrales: vitrinear (anónimo) / tener voz (registrado). El uso genera datos que re-pintan la página.
- **Modelo FM.** Colectivo = portadora; individuo = modulación. Confirmado: Book of Shaders enseña modular ondas como AM/FM y *domain warping* — misma operación llevada a campo visual.
- **Skin propio.** Se descartan los skins de co-dec (constelar/espectro); se diseña uno original IME.
- **v0–v1.** Primer shader (fBm + domain warping); se añaden estación (hemisferio+fecha) y ciclo diurno (hora local).
- **v2.** Se amplía el rango dinámico de cada éter (shaping functions) para que los extremos contrasten.
- **v3.** La perilla de mes pasa a **día del año** continuo: transición estacional fluida.
- **v4.** Temperatura por cruce **estación × hora** (noche invierno azul profundo, noche verano azul cálido, día invierno helado, día verano cálido) + rueda de 3 presets a 120°.
- **v5.** Ajuste de paleta aprobado: **fuera el verde**; contraste del verano con **cyan**; verano menos intenso. Se fija el look de IME Conecta (magenta).
- **v6.** Asignación de presets a proyectos (Planificación / Link 2027 / Conecta).
- **v7 (decisión clave).** Se detecta que en invierno la identidad se perdía (la estación volteaba toda la paleta). Se separa **identidad (hue por proyecto, estable)** de **luz (estación/hora)**. Conecta luce magenta todo el año.

---

## 6. Decisiones de diseño web

- **Paleta IME:** fondo `#11100f`, texto `#f7f1e7`, acentos cian `#5fd7df`, coral `#f07262`, oro `#edc85d`, violeta `#a98df0`.
- **Contraste dinámico:** `smoothstep` y curvas cuadráticas en los uniforms para que los extremos "exploten" y el centro quede tranquilo.
- **Accesibilidad:** respetar `prefers-reduced-motion`; no codificar significado solo en color; `<h2 sr-only>` descriptivo.
- **Rendimiento:** fBm 4–6 octavas; WebGL1 para cobertura; *fallback* estático sin WebGL.
- **Privacidad:** los éteres usan contexto **grueso** (hemisferio, hora local, tipo de dispositivo); nunca IP cruda ni ubicación precisa.

---

## 7. Estado y pendientes

1. Afinar las identidades de **Planificación (1)** e **IME Link 2027 (2)** (presets base).
2. **Persistir** el motor (shader como módulo) + 3 presets como JSON versionados, con su informe técnico.
3. **IME Link 2027:** crear repo y carpeta de Drive según la convención (proyecto nuevo).
4. **Sonido (Web Audio):** decidir si el skin sonifica o queda solo visual.
5. **Legal:** consentimiento/aviso por `app` antes de capturar trazas reales.
6. Definir si el skin es fondo ambiental de toda la página o sección "laboratorio".

---

## 8. Convención

`.md` fuente versionado en git; exportaciones `.docx`/`.pdf` en Drive; nombres `IME_L<n>_<Tipo>_<Tema>_<YYYYMMDD>_v<NN>`. Nuevas entradas de bitácora se agregan fechadas en la sección 5.

---

*Documento fuente versionado en git.*
