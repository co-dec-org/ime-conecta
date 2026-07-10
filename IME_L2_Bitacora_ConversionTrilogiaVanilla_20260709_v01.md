# Bitácora de conversión — IME Conecta a la trilogía vanilla

**Proyecto:** IME Conecta (Industria Musical Electrónica Independiente de Chile A.G.)
**Documento:** IME_L2_Bitacora_ConversionTrilogiaVanilla_20260709_v01
**Fecha:** 9 de julio de 2026
**Rama de trabajo:** `vanilla` (repositorio `co-dec-org/ime-conecta`)
**Autor de la sesión:** ime.conecta@gmail.com

---

## 1. Objetivo

Integrar IME Conecta como la tercera pieza de la trilogía IME —junto a IME Link 2027 e IME Planificación Estratégica— convirtiendo el sitio desde su base React/Vite/TypeScript a un sitio estático **vanilla** (HTML/CSS/JS, sin build), compartiendo el motor de gráfica viva, el lenguaje de diseño, la base de datos común (Supabase) y el protocolo de documentación, sin perder el propósito propio de Conecta: registro de socixs y cumplimiento legal (Ley 21.719).

La conversión se ejecutó por etapas verificables sobre la rama `vanilla`, dejando intacta la versión React en `main`.

---

## 2. Etapas ejecutadas

### Etapa 1–2 — Identidad, motor, diseño y contenido

Se tomó IME Link 2027 como plantilla y se adaptó a la identidad **violeta-magenta** de Conecta (`app_key = "ime-conecta"`):

- Motor de gráfica viva compartido (`ime-skin.js`) montado con la identidad violeta-magenta, sin duplicar lógica.
- Tokens de color, tipografías (Archivo, Playfair Display, Poppins) y temas claro/oscuro geoestacionarios alineados con la trilogía.
- Portada con título fijo "IME Conecta" y las 19 secciones de contenido portadas desde el origen React.

### Etapa 3 — Diseño de contenido

Se añadió a `styles.css` el CSS que faltaba para los elementos de contenido, que antes se renderizaban sin estilo:

- Tablas (encabezado tintado violeta, filas alternas, bordes), tarjetas, líneas de tiempo con etiquetas violeta, citas con borde de acento, destacados tipo callout, listas numeradas de flujo y definiciones.
- Corrección de tildes en los rótulos de navegación (Separación, Discusión) y en el contenido (formulación, priorización, documentación, versión, entre otras).

Verificado visualmente: tablas, líneas de tiempo y destacados con la identidad violeta-magenta.

### Etapa 5 — Seguridad y SEO

- `vercel.json` con Content-Security-Policy endurecida: scripts propios más el hash SHA-256 del JSON-LD embebido (recalculado y verificado), fuentes de Google permitidas y conexiones limitadas al proyecto Supabase compartido.
- `robots.txt` y `sitemap.xml` con el dominio propio.
- Imagen Open Graph 1200×630 propia (violeta-magenta) verificada.
- Configuración estática (`framework: null`, sin build) para que Vercel sirva el `index.html` vanilla.

### LEAN — Eliminación de React

Se retiró toda la capa React/Vite del repositorio (`src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`): 43 archivos, 8.593 líneas. El sitio vanilla es ahora la fuente única (`index.html`). El sitio se verificó intacto tras el borrado.

### Deploy acotado — `.vercelignore`

Se agregó `.vercelignore` para que el sitio público sirva **solo** el sitio vanilla (`index.html`, `styles.css`, los módulos `.js`, `assets/`, `robots`, `sitemap`), manteniendo en git —pero fuera de la publicación— la documentación interna, las fuentes y el material de trabajo. Nada se elimina; todo queda versionado.

### Etapa 4 — Notas y capa registro/legal

- El módulo de **Notas** (login por correo y contraseña vía Supabase Auth, CRUD por sección con PostgREST y adjuntos en Supabase Storage) quedó operativo sobre el modelo compartido, sin SDK externo (compatible con la CSP).
- Se corrigió la referencia al padrón para que salga de la configuración (`ime_directors`) en lugar del nombre heredado de Link.
- La analítica anónima opt-in usa las tablas compartidas `ime_visitas` e `ime_eventos`.
- Namespacing por `app_key = "ime-conecta"` en todas las escrituras propias.

---

## 3. Hallazgos de arquitectura

- **Modelo de datos unificado:** el sitio vanilla ya adopta el modelo compartido de la trilogía (`ime_section_notes`, `ime_directors`, `ime_visitas`, `ime_eventos`). La migración React previa (`profiles`, `consents`, `sessions`, `nav_events`, `analytics_anonymized`) queda como legado sin uso en el sitio vanilla.
- **Base común y RLS:** una sonda de solo lectura con la clave pública (anon) confirmó que las cuatro tablas compartidas existen y responden. Los conteos vacíos desde una sesión anónima corresponden a la Row Level Security funcionando correctamente: sin sesión iniciada no se ve el padrón ni las notas ajenas.
- **Clave pública (anon):** válida y funcional. Es pública por diseño (protegida por RLS) y compartida con los sitios en vivo; no debe rotarse a la ligera.
- **Sign-in anónimo:** actualmente desactivado en el proyecto Supabase; afecta únicamente a la analítica anónima opt-in, no a las Notas.

---

## 4. Estado y pendientes

**Avance global de la conversión: ~92%.**

Pendientes, todos del lado de la cuenta (no de código):

1. **Deploy en producción:** conectar el proyecto de Vercel a la rama `vanilla` (y, según el plan de gobernanza, moverlo a la cuenta `ime.conecta`). La configuración estática ya está lista en `vercel.json`.
2. **Verificación end-to-end de Notas:** iniciar sesión como director/a en la caja de Notas del sitio y comprobar guardado y relectura de una nota (confirma RLS + CRUD en vivo). Solo puede hacerlo una persona con credenciales; con la clave anónima no es posible por diseño.
3. **Gobernanza de cuentas (seguimiento):** transferencia del repositorio a `co-dec-242`, alta de `co-dec-org` como colaborador, y traslado del proyecto Vercel a la cuenta institucional.

Nota operativa: si al iniciar sesión un director ve "no está habilitada en el padrón", su cuenta de autenticación existe pero le falta la fila en `ime_directors` (o tiene `active = false`); se corrige con un `insert`/`update` puntual en el SQL Editor.

---

## 5. Registro de commits (rama `vanilla`)

- Etapa 3 — diseño de contenido y tildes.
- Etapa 5 — seguridad (CSP), SEO (robots, sitemap) y configuración estática.
- LEAN — eliminación de React/Vite.
- Deploy — `.vercelignore`.
- Etapa 4 — Notas leen el padrón desde configuración.

---

*Documento generado según el protocolo IME: fuente `.md` en el repositorio Git; entregables `.docx` y `.pdf` (formato A4) en la carpeta de Drive del proyecto.*
