# Visión — Web IME como plataforma generativa (estética modulada por uso)

**Proyecto:** IME (sitios IME Conecta e IME Planificación Estratégica)
**Estado:** Visión / diseño. Norte conceptual previo a la implementación.
**Versión:** 0.3 · 28 de junio de 2026
**Referencia técnica:** `IME_L2_InformeTecnico_ReferenciaBookOfShaders`.
**Principio de secuencia:** se escribe y diseña **antes de tocar código**. Este documento es el norte; las migraciones de datos y el skin se construyen después, sobre esta base.

---

## 0. Por qué este documento

Las dos webs IME dejan de ser "presentación navegable" para convertirse en **plataforma generativa/viva**: la propia estética del sitio se modula con el uso. Es un norte más ambicioso, y por eso se fija por escrito antes de programar.

> Apunte de cumplimiento (recuperado, no perderlo): aunque el visitante sea anónimo, **capturar trazas sigue necesitando el marco de consentimiento/aviso** que IME Conecta ya redactó. Por eso el **agregado anonimizado** (`analytics_anonymized`) es la vía "segura": deja de ser dato personal y puede alimentar la estética sin riesgo legal.

---

## 1. Concepto: web bidireccional en dos umbrales

Ambas páginas IME son **públicas**. El contenido es para anónimos.

- **Vitrinear (anónimo):** entrar, mirar, sin fricción, sin login. Está perfecto quedarse aquí.
- **Tener voz (registrado):** si el usuario quiere comentar / tomar notas, se registra. El registro es la puerta de la **contribución identificable**.

Y el bucle bidireccional: lo que la gente hace genera datos, y esos datos **re-pintan/sonifican la página**.

---

## 2. La decisión de diseño: modelo FM (radio por frecuencia modulada)

La metáfora rectora es la **transmisión radial FM**:

- **El colectivo es la PORTADORA.** La suma agregada y anónima de toda la actividad es la "estación" que siempre está al aire: una frecuencia y amplitud base, estable, comunitaria.
- **La persona es quien MODULA la estética.** El visitante (y más aún el registrado) desvía la portadora: su navegación, su contexto y su mensaje inducen la modulación.

La estética resultante = portadora colectiva **modulada** por la señal individual. Ni puro colectivo (sería estático) ni puro individuo (sería solipsista): la persona modula una onda que la comunidad sostiene.

> No es una analogía libre: The Book of Shaders enseña a modular ondas como **AM/FM** y a deformar campos con *domain warping* — la misma operación, llevada a campo visual (ver informe de referencia).

### 2.1 Tres niveles: emisión, recepción y voz

La modulación se ordena en tres niveles, lo que resuelve la tensión "si todo se adapta a mí, ¿qué queda de colectivo?":

| Nivel | Qué es | Naturaleza | De qué datos |
|---|---|---|---|
| **Emisión** | La portadora compartida, igual para todos | Colectivo | Actividad agregada anonimizada |
| **Condiciones de recepción** | Cómo recibes esa emisión: dónde, cuándo, con qué | Personal (no es tu "voz") | Estación, hora local, dispositivo |
| **Voz** | Lo que tú sí emites | Individuo | Navegación, permanencia, notas |

La imagen: **la misma transmisión IME, recibida distinto** según dónde estés, a qué hora y con qué equipo — como sintonizar una estación desde otra ciudad. La emisión es común; la recepción es personal; la voz es tuya.

### 2.2 Los éteres (condiciones de recepción)

Los "éteres" son el contexto ambiental que define la recepción. Se derivan de datos **gruesos** (sin ubicación precisa ni IP cruda):

| Éter | Se deriva de | Modula | Detalle |
|---|---|---|---|
| **Estación del año** | hemisferio (latitud gruesa) + fecha | paleta + calidad lumínica | El *mismo día* se ve opuesto por hemisferio: hoy, invierno en Santiago / verano en Berlín |
| **Ciclo diurno** | hora local del navegador | luminancia y temperatura | De visión nocturna a plena diurna; duración del día según estación/latitud |
| **Dispositivo / tecnologías** | capacidades del equipo | textura, densidad, movimiento | Respeta `prefers-reduced-motion` |

Borrador de paleta por estación (dentro de los colores IME): invierno → cian/violeta, luz baja; primavera → verde/cian, luz creciente; verano → oro/coral, alta saturación; otoño → ámbar/coral apagado, luz dorada baja.

> La "capa del mensaje" (notas) se modula a sí misma cabalgando sobre estos éteres: tus acentos personales (sidebands) se tiñen por tu estación y tu hora.

---

## 3. Umbrales de participación y qué genera cada uno

| | Anónimo (vitrinear) | Registrado (con voz) |
|---|---|---|
| Acceso | Inmediato, sin login | Tras registro |
| Alimenta | La **portadora** (agregado anonimizado) | Portadora + **capa personal** de modulación |
| Genera | Trazas anónimas agregadas (consentidas) | Notas/comentarios identificables + trazas propias |
| Estética | Ve el latido colectivo, recibido según su contexto | Su huella modula su propia vista (sidebands) |

---

## 4. Skin propio de IME (no co-dec)

**Propiedad:** los skins `constelar` y `espectro` son de **co-dec**; **no se reutilizan** en las webs IME. Se diseña un **skin original IME**, compartido por las dos páginas.

**Dirección creativa (decidida):** *fragment shader* en GLSL/WebGL, en la línea de **The Book of Shaders** (campos generativos con noise, fBm y *domain warping*), no osciloscopio ni mapa de estrellas. Los datos IME son los **uniforms** del shader.

- **Paleta IME:** fondo cálido casi negro (`#11100f`), texto `#f7f1e7`, acentos cian `#5fd7df`, coral `#f07262`, oro `#edc85d`, violeta `#a98df0`, verde `#94d07b`.
- **Mapeo:** colectivo → escala/brillo/velocidad del campo (portadora); individuo → intensidad de *domain warping* (modulación); estación → paleta/carácter; hora → luminancia (día-noche); dispositivo → grano/octavas.
- **Ortogonalidad:** recepción controla el envolvente lumínico/paleta; emisión y voz controlan estructura y movimiento.
- **Nombre de trabajo:** "IME · FM" / "Portadora" (por decidir).

Detalle técnico (técnicas, rendimiento, recursos) en `IME_L2_InformeTecnico_ReferenciaBookOfShaders`.

### 4.1 Un motor, una piel por proyecto

Decisión: **un único motor de shader compartido**, con **un preset por proyecto**, repartidos en la rueda de 360°/3 (120° cada uno). Cada preset fija un tono base (hue) y valores base de portadora/modulación; el resto (estación, hora, dispositivo, colectivo, individuo) sigue siendo dinámico.

| Preset | Proyecto | Posición rueda | Tono base | Identidad |
|---|---|---|---|---|
| 1 · Núcleo | IME Planificación Estratégica | 0° | hue 0.00 | cian/violeta |
| 2 · Deriva | IME Link 2027 (nuevo) | 120° | hue 0.33 | por afinar |
| 3 · Reposo | IME Conecta | 240° | hue 0.67 | violeta-magenta (aprobado) |

Ajuste de paleta aprobado: verano sin verde, con contraste de cyan en los altos y menor intensidad. Los presets 1 y 2 quedan como base, sujetos a afinar por proyecto. **IME Link 2027** es un proyecto nuevo: requiere su repo y carpeta de Drive según la convención.

---

## 5. Arquitectura de datos (enlace)

- **Un Supabase compartido** por ambas webs: identidad única (`auth.users`) con anónimos (anonymous sign-in) que **ascienden** a registrados conservando su `id` y su huella.
- Dominio separado por `app`; consentimiento por `app`.
- `nav_events` → job de anonimización → **`analytics_anonymized`** → alimenta la **portadora** del skin.
- Detalle en el (futuro) documento de modelo de datos unificado.

---

## 6. Cumplimiento por diseño

- Capturar trazas, aun anónimas, requiere **consentimiento + aviso de privacidad** (ya redactados para IME Conecta).
- La estética generativa se nutre del **agregado anonimizado irreversible** (no dato personal): vía segura.
- **Estación/ciudad:** solo a nivel hemisferio/ciudad, derivada — nunca IP cruda ni user-agent completo (minimización ya definida).
- No capturar datos personales identificados antes de la validación legal.

---

## 7. Decisiones abiertas

1. ¿Sonificación (Web Audio) como parte del skin, o solo visual?
2. Nombre del skin.
3. Modulación: ¿el skin como fondo ambiental de toda la página, o como "laboratorio" en una sección dedicada?
4. Fuente de la estación/ubicación: hora local del navegador (sin permiso) + hemisferio por zona horaria vs. geolocalización por IP (server-side) — y su consentimiento.

---

*Documento fuente versionado en git. Actualizar aquí cualquier cambio de visión.*
