# Informe de usabilidad y auditoría del sitio — IME Conecta

**Proyecto:** IME Conecta (Industria Musical Electrónica Independiente de Chile A.G.)
**Documento:** IME_L2_InformeUsabilidad_AuditoriaSitioConecta_20260709_v01
**Fecha:** 9 de julio de 2026
**Sitio auditado:** https://ime-conecta.vercel.app (rama `vanilla` → producción)
**Método:** revisión heurística + auditoría técnica automatizada (pesos, cabeceras, consola, accesibilidad y SEO) sobre el sitio en producción.

---

## 1. Resumen ejecutivo

IME Conecta es un sitio estático (HTML/CSS/JS, sin build) que presenta la propuesta de gobernanza operacional de IME Chile A.G. y habilita una capa privada de notas por sección para el directorio, sobre la base de datos común de la trilogía IME. Tras la conversión a vanilla, el sitio es **liviano, seguro y accesible**, con una identidad visual violeta-magenta coherente con sus proyectos hermanos.

La auditoría no encontró errores de consola ni recursos bloqueados. El peso total del sitio (código más recursos) es de aproximadamente **187 KB**, lo que ubica al sitio muy por debajo de los promedios de la web. La usabilidad es alta: navegación con índice lateral y seguimiento de sección, buscador, modo presentación, copia de resumen y notas privadas. Las oportunidades de mejora son menores y se concentran en depuración del repositorio (LEAN) y microajustes.

**Calificación general: sólida.** El sitio está listo para uso público y para respaldar la postulación institucional.

---

## 2. Inventario del sitio

### 2.1 Contenido

El sitio presenta **19 secciones** navegables: Portada, Punto de partida, Mirada macro, Problema detectado, Análisis operacional, Concepto rector, IME Conecta, Usabilidad web, Sercotec, IME Link 2027, Gobernanza, Carteras, Separación directiva / operativa, Datos y activos, Riesgos, Ruta, Discusión, Acuerdos y Cierre.

El contenido combina texto, tablas comparativas, líneas de tiempo, tarjetas, listas de decisión y destacados, todo con estilo propio en la identidad violeta-magenta.

### 2.2 Funcionalidades

El sitio incluye: gráfica viva generativa de fondo (motor WebGL compartido con identidad violeta-magenta); tema geoestacionario que ajusta la luz según hora local; índice lateral con seguimiento de sección activa; barra de progreso de lectura; buscador insensible a tildes; modo Presentar; botón Copiar resumen; caja de Notas privadas por sección (autenticación Supabase, una nota por sección, adjuntos de imagen); refuerzo visual de confirmaciones de Notas; calibrador de entrada reservado al director; y analítica anónima opt-in con banner de consentimiento.

---

## 3. Usabilidad (revisión heurística)

**Navegación y orientación.** El índice lateral fijo con seguimiento de sección y la barra de progreso orientan a la persona en todo momento. Los anclajes internos y el botón "Explorar propuesta" facilitan el recorrido. Cumple con la heurística de visibilidad del estado del sistema.

**Consistencia y estándares.** Tipografías, colores y componentes se mantienen coherentes en todas las secciones y con los sitios hermanos de la trilogía. Los controles del encabezado (Copiar resumen, Buscar, Tema, Presentar) usan patrones reconocibles.

**Control y libertad.** El modo Presentar, el cambio de tema y el buscador son reversibles y no bloquean el contenido. La caja de Notas es arrastrable y recuerda su posición.

**Prevención de errores y retroalimentación.** Las acciones de Notas (Enviar / Deshacer / Limpiar) muestran confirmaciones con causa, reforzadas con ícono y color por el módulo de estado. El inicio de sesión informa con claridad los errores (credenciales, cuenta no habilitada en el padrón).

**Flexibilidad.** El buscador insensible a tildes reduce la fricción de escritura en español. El tema se adapta automáticamente a la hora local, con control manual disponible.

**Privacidad como usabilidad.** El banner de analítica es opt-in, con lenguaje claro y sin datos personales ni ubicación precisa; las notas son privadas por diseño (solo su autor/a las ve).

---

## 4. Accesibilidad (WCAG 2.1)

El sitio declara idioma (`lang="es"`), usa un único encabezado principal (`h1`) y una jerarquía de encabezados coherente. No se detectaron imágenes sin texto alternativo; el logotipo se entrega como SVG. Se registran 14 etiquetas `aria-label` en controles interactivos.

El foco de teclado es visible y el contraste se ajustó en trabajo previo (anillo de foco y tokens de color legibles en tema claro y oscuro). El motor de gráfica viva respeta `prefers-reduced-motion`, desactivando el movimiento para quienes lo prefieren.

**Recomendaciones menores:** verificar el recorrido completo por teclado en la caja de Notas (orden de tabulación entre login y editor) y mantener el contraste del texto sobre la gráfica viva en el rango de luz diurna del tema geoestacionario.

---

## 5. Rendimiento

El sitio es estático y no requiere compilación. Pesos de los archivos servidos (aproximados):

- HTML: 32 KB · CSS: 24 KB · JavaScript (8 módulos): 84 KB · Recursos gráficos: 76 KB.
- **Total aproximado: 187 KB.**

El motor de gráfica viva incorpora buenas prácticas de rendimiento: uso de `requestAnimationFrame`, framerate adaptativo, **pausa cuando la pestaña está oculta** y respeto por `prefers-reduced-motion`. Hay `preconnect` a los orígenes de fuentes y de Supabase. No se detectaron errores ni recursos bloqueados en consola.

**Recomendación menor:** el peso ya es óptimo; no se requieren acciones de rendimiento urgentes.

---

## 6. SEO

El sitio cuenta con `<title>` descriptivo, meta descripción, enlace canónico, imagen Open Graph propia (1200×630, identidad violeta-magenta), datos estructurados JSON-LD (Organization / WebSite), `robots.txt` y `sitemap.xml` con el dominio propio. La base de SEO técnico está completa.

**Recomendación:** cuando exista dominio propio definitivo, actualizar canónico, OG y sitemap a ese dominio.

---

## 7. Seguridad

Cabeceras verificadas en producción: Content-Security-Policy estricta (scripts propios más el hash del JSON-LD; conexiones limitadas al proyecto Supabase; `frame-ancestors 'none'`; `object-src 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy` que bloquea cámara, micrófono y geolocalización. No hay secretos versionados; la clave pública de Supabase es pública por diseño y está protegida por Row Level Security. La capa de Notas y el padrón solo son legibles con sesión iniciada.

---

## 8. Depuración (LEAN) — hallazgos

El sitio público ya sirve únicamente sus archivos propios (gracias a `.vercelignore`). En el repositorio quedan materiales que no aportan al sitio y pueden retirarse para dejarlo más limpio:

- **Retiro seguro (sin valor para el sitio):** carpeta `work/` (scripts de trabajo internos) y `.env.example` (plantilla de variables heredada de la etapa React, ya sin uso).
- **Legado opcional:** migración `supabase/0001_init_capa_privada.sql` (modelo React previo, hoy sin uso porque el sitio adopta el modelo compartido de la trilogía).
- **Material propio a decidir (no se sirve, pero conviene conservar en Drive antes de borrar):** `mockups/` (bocetos Constelar/Espectro), `public/` (duplicados y galería de skins de la etapa React), `skin/` (presets y demo) e `informes/`.

---

## 9. Recomendaciones priorizadas

1. **Aplicar LEAN de retiro seguro** (`work/`, `.env.example`) para dejar el repositorio alineado al sitio.
2. **Decidir el destino** de `mockups/`, `public/` y `skin/` (conservar, mover a Drive o retirar).
3. **Verificar el recorrido por teclado** completo en la caja de Notas.
4. **Actualizar dominio** en canónico, OG y sitemap cuando exista dominio propio.
5. **Mantener** las buenas prácticas ya presentes (CSP, opt-in, RLS, reduced-motion).

---

## 10. Datos de uso

La analítica del sitio es anónima y opt-in; las visitas y eventos se registran en las tablas compartidas `ime_visitas` e `ime_eventos`, y las notas en `ime_section_notes`, todas con Row Level Security. Por diseño, estos datos no son legibles sin sesión autorizada, por lo que las métricas de uso deben consultarse desde el SQL Editor de Supabase con las credenciales correspondientes. Este informe no incluye cifras de uso para no reportar datos no verificados.

---

*Documento generado según el protocolo IME: fuente `.md` en el repositorio Git; entregables `.docx` y `.pdf` (formato A4) en la carpeta de Drive del proyecto.*
