# IME Conecta - Gobernanza operacional

Sitio en produccion: https://ime-conecta.vercel.app

Landing page ejecutiva y presentacion web navegable para presentar al Directorio de IME Chile la propuesta **Gobernanza operacional para una nueva escala gremial**.

## Descripcion

El sitio presenta IME Conecta como infraestructura interna de gestion gremial para ordenar socios/as, comites, acuerdos, documentos, proyectos, responsables, plazos, activos digitales, datos personales y avances institucionales. Incluye modo lectura, modo presentacion, busqueda, tema claro/oscuro, progreso, fullscreen, copia de resumen ejecutivo y una capa Web-Video + Web-Audio API local.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm 9 o superior.

## Instalacion

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Despliegue en Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

El archivo `vercel.json` define headers de seguridad, politica de permisos para camara y microfono en `self`, y una CSP para sitio estatico sin trackers.

## Arquitectura (dos capas)

- **Capa publica** (operativa): este sitio, de acceso abierto y anonimo.
- **Capa privada** (en construccion): usuarixs registradxs con captura de trazas de navegacion en Supabase, para analisis en los laboratorios web. Andamiaje en `src/lib/` (`consent.ts`, `traces.ts`) y `src/components/` (`ConsentBanner`, `DataPanel`).

Demo local de la capa privada (sin backend ni datos reales): abrir el sitio con `?demo=privada`.

Preparacion de Supabase: `.env.example` (variables) y `supabase/migrations/` (esquema SQL).

## Pruebas

```bash
npm test
```

Cubren la logica de consentimiento y de captura de trazas, incluida la regla central: no se captura ninguna traza sin consentimiento vigente.

## Documentacion del proyecto

- `PROYECTO.md` — mapa del proyecto.
- `CONVENCIONES.md` — control de proyecto y gestion documental (git vs Drive).
- `Registro_Trazabilidad_IME_Conecta.md`, `Diseno_Modelo_Datos_Supabase_IME_Conecta.md` y demas `.md` de diseño y legales.

## Documentos asociados

Los enlaces de descarga quedan activos en `/public/docs` con estos archivos:

- `Informe_IME_Conecta_Gobernanza_Operacional_actualizado.docx`
- `Informe_IME_Conecta_Gobernanza_Operacional_actualizado.pdf`
- `IME_Conecta_Gobernanza_Operacional_Directorio.pptx`

## Privacidad audiovisual local

- La camara no se activa automaticamente.
- El microfono no se activa automaticamente; solo se solicita desde el boton de analisis local.
- El audio generativo usa Web Audio API con OscillatorNode, filtros, delay y AnalyserNode dentro del navegador.
- El analizador de microfono no reproduce, no graba y no envia la senal a ningun servidor.
- `getUserMedia` solicita solo video para camara y solo audio para analisis de microfono, siempre en acciones separadas.
- El stream se procesa localmente en el navegador mediante Canvas.
- Las capturas PNG y grabaciones WebM se descargan localmente.
- La capa publica no tiene backend ni base de datos propios. La unica analitica es Vercel Web Analytics: anonima y sin cookies.
- La preferencia de tema se guarda en `localStorage`.

## Checklist antes de presentar al Directorio

- Revisar contenido final de cada seccion.
- Confirmar documentos definitivos en `/public/docs`.
- Probar `npm run build`.
- Probar modo presentacion con teclado: flechas y Escape.
- Probar fullscreen en el navegador objetivo.
- Probar busqueda con: Sercotec, IME Conecta, datos, Ley 21.719, operativo.
- Verificar contraste y lectura en desktop, notebook, tablet y movil.
- Probar camara, captura PNG para avatar/boleta, PiP, grabacion WebM, audio generativo y analizador de microfono en el navegador de presentacion.
- Confirmar que no se cargan trackers ni servicios externos.
