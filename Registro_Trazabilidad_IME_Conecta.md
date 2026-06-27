# Registro de Trazabilidad — Proyecto IME Conecta

**Responsable del tratamiento:** IME — Industria Musical Electrónica Independiente de Chile A.G.
**Repositorio:** co-dec-org/ime-conecta (GitHub)
**Sitio en producción:** https://ime-conecta.vercel.app
**Herramientas:** desarrollo asistido con Claude (Cowork); despliegue en Vercel; control de versiones en GitHub.
**Última actualización del registro:** 21 de junio de 2026.

---

## 1. Propósito de este registro

Dejar constancia trazable de la evolución del proyecto IME Conecta desde su trabajo en Claude Cowork, para fines históricos y de cumplimiento de la normativa chilena de protección de datos personales (Ley 19.628 y Ley 21.719). El historial de Git es la fuente de verdad inmutable (cada cambio queda firmado con fecha, autor y contenido); este documento lo resume en lenguaje legible y agrega el contexto de decisiones.

> Nota: este registro es un instrumento de trazabilidad operacional, no una asesoría legal. La validación del cumplimiento normativo debe hacerla un profesional del derecho.

---

## 2. Línea base previa al trabajo en Cowork (13–14 de junio de 2026)

| Fecha/hora | Commit | Autor | Descripción |
|---|---|---|---|
| 2026-06-13 06:45 | 3313252 | co-dec-org | Initial commit |
| 2026-06-14 03:28 | c474b3d | co-dec-org | Carga inicial desarrollo local IME Conecta |
| 2026-06-14 04:22 | c5d8f1b | co-dec-org | Conecta cliente Supabase en IME Conecta *(quedó sin efecto: no hay integración activa de Supabase en el código)* |
| 2026-06-14 05:53 | 16733dc | co-dec-org | Corrige contenido de IME Conecta |

Estado al iniciar Cowork: sitio Vite + React + TypeScript, presentación de 21 secciones, sin backend, sin analítica, con artefactos de build (`.next`) y archivos de trabajo versionados por error.

---

## 3. Sesión de trabajo en Claude Cowork (21 de junio de 2026)

### 3.1 Bitácora de cambios (commits)

| Fecha/hora | Commit | Descripción | Cambios |
|---|---|---|---|
| 2026-06-21 13:47 | f3babc8 | Limpia repo: deja de versionar `.next`, `outputs` y `__pycache__` | 151 archivos, −175.832 líneas |
| 2026-06-21 14:48 | 75a4140 | Agrega logo oficial IME (PNG transparente) | 1 archivo |
| 2026-06-21 15:54 | 76d8da4 | Integra logo en header, favicon y preview social; saca HTML de referencia del repo | 11 archivos |
| 2026-06-21 16:25 | 6647ccd | Usa URLs absolutas para previsualización social | 1 archivo |
| 2026-06-21 17:14 | 0bd0d53 | Actualiza README (activa deploy desde Git) | 1 archivo |
| 2026-06-21 18:57 | f2dd80d | SEO (robots/sitemap/canonical) + versiones fijadas + analítica Vercel | 12 archivos |
| 2026-06-21 19:01 | 9fd63c5 | Quita temporales del repo y los ignora | 3 archivos |

### 3.2 Resumen narrativo del trabajo

- **Conexión y limpieza del repositorio.** Se vinculó la carpeta local con el repositorio de GitHub y se limpiaron ~150 archivos basura (build de Next.js, artefactos y HTML de referencia) que no correspondían al proyecto.
- **Identidad visual.** Se incorporó el logo oficial de IME (obtenido del sitio institucional imechile.org), se generaron variantes (marca, favicon, apple-touch-icon e imagen de previsualización social) y se integró en el encabezado del sitio con adaptación a tema claro/oscuro.
- **Despliegue.** Se configuró el despliegue continuo en Vercel conectando el repositorio de GitHub; desde entonces cada cambio en la rama `main` se publica automáticamente.
- **SEO y metadatos.** Se agregaron `robots.txt`, `sitemap.xml`, etiqueta canonical y metadatos Open Graph/Twitter con imagen de previsualización.
- **Estabilidad.** Se fijaron las versiones exactas de las dependencias para builds reproducibles.
- **Analítica.** Se incorporó Vercel Web Analytics (analítica de visitas anónima y sin cookies). Ver sección 5.

---

## 4. Registro de decisiones

| Decisión | Fundamento |
|---|---|
| No versionar `.next`, `outputs`, `work/__pycache__` ni HTML de referencia | Eran artefactos/temporales, no código fuente; reducen ruido y peso del repositorio. |
| Usar el logo oficial en versión transparente | Flexibilidad gráfica para futuros usos (avatares, plantillas). |
| Desplegar vía conexión Git con Vercel | Despliegue automático y trazable en cada push, sin pasos manuales. |
| Incorporar analítica **anónima y sin cookies** (Vercel) | Conocer el uso del sitio sin recolectar datos personales; coherente con el enfoque de privacidad. |
| Posponer login + base de datos (capa privada) | Requiere base legal/consentimiento y política de datos; se diseña antes de implementar. |

---

## 5. Relevancia para protección de datos personales

**Estado actual del tratamiento de datos (al 21 de junio de 2026):**

- **No se almacenan datos personales en ningún servidor del proyecto.** El sitio no tiene login ni base de datos propia.
- **Notas y preferencias del usuario:** se guardan exclusivamente en el navegador de cada persona (`localStorage`); no se transmiten ni recolectan.
- **Analítica de visitas:** se usa Vercel Web Analytics, que es **anónima y no usa cookies** (no identifica personas). Procesador: Vercel Inc.
- **Aviso de privacidad:** el pie de página del sitio se actualizó el 21-06-2026 para reflejar la incorporación de la analítica anónima y reiterar que las notas y preferencias permanecen solo en el dispositivo del usuario.

**Cambio de estado registrado:** hasta el 21-06-2026 el sitio no tenía analítica alguna ("sin analytics, sin cookies, sin backend"). A partir de esa fecha incorpora analítica anónima de visitas. Este registro deja constancia del cambio.

### Inventario de datos y encargados (al 21-06-2026)

| Dato | Capa / encargado | Finalidad | Base de licitud | Retención | Estado |
|---|---|---|---|---|---|
| URL / sección visitada | Pública / Vercel | Métrica de uso agregada | Anonimizado (fuera de la ley) | Hash 24 h | Activo |
| Referente y query params | Pública / Vercel | Métrica | Anonimizado | Hash 24 h | Activo |
| Geolocalización país/ciudad | Pública / Vercel | Métrica | Anonimizado (IP no almacenada) | — | Activo |
| Dispositivo / navegador / SO | Pública / Vercel | Métrica | Anonimizado | — | Activo |
| IP (transitoria, logs) | Plataforma / Vercel | Operación y seguridad | Interés legítimo (a validar) | Según logs | Activo |
| Identidad (correo, nombre) | Privada / Supabase | Autenticación | Consentimiento | A definir | Planificado |
| Trazas identificadas (sección, tiempo, eventos) | Privada / Supabase | Análisis y modelado | Consentimiento | A definir | Planificado |
| Datos derivados / modelos | Laboratorio / IME | Investigación | Consentimiento o anonimización irreversible | A definir | Planificado |

**Encargados de tratamiento:** Vercel Inc. (hosting y analítica, DPA disponible) y Supabase (backend planificado, DPA por suscribir). Ambos procesan datos fuera de Chile (p. ej., EE. UU.) → transferencia internacional a evaluar. Detalle y citas en el `Informe_Operativo_Legal_IME_Conecta`.

---

## 6. Arquitectura planificada y pendientes

El proyecto evolucionará hacia un modelo de **dos capas**:

1. **Capa pública** (actual): landing/presentación de acceso abierto, anónima.
2. **Capa privada** (planificada): para usuarixs registradxs, con captura de trazas de navegación (sección/activo digital y tiempo, entre otros) almacenadas en Supabase, para análisis y modelado en los laboratorios web (referencia: proyecto WebLabs-Induccion-Operacional).

**Requisitos de cumplimiento para la capa privada (a definir con asesoría legal antes de implementar):**

- Base legal del tratamiento: **consentimiento explícito** obtenido al momento del registro de la persona usuaria.
- Declaración de **finalidad** (análisis y modelado), **minimización** de datos y **plazo de retención**.
- **Aviso de privacidad** actualizado y términos de uso.
- Definición de **responsable y encargado** del tratamiento, y de las medidas de seguridad.
- Política de **anonimización** si los modelos o resultados se comparten o publican.

**Próximos pasos:**

1. Recuperar acceso a Supabase (verificación de cuenta pendiente).
2. Diseñar el modelo de datos de las trazas y el flujo de registro/consentimiento.
3. Redactar la política de uso de datos y el aviso de privacidad.
4. Implementar autenticación y captura de trazas en la capa privada.

---

## 7. Autoría y herramientas

El trabajo de desarrollo de la sesión del 21-06-2026 se realizó con asistencia de Claude (Cowork). Todos los commits quedaron registrados bajo la cuenta **co-dec-org** en GitHub, con marca de tiempo verificable. La integridad y autoría de cada cambio puede auditarse en el historial del repositorio (`git log`).

---

*Este documento debe actualizarse al incorporar la capa privada y cualquier tratamiento de datos personales.*
