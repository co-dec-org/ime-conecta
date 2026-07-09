# Protocolo de desarrollo web — Estándar de proyectos IME

**Ámbito:** Proyectos web de IME (Conecta, Planificación Estratégica, Link 2027 y futuros).
**Tipo:** Informe técnico / protocolo de aplicación.
**Estado:** Vigente. Documento maestro; complementa y amplía `CONVENCIONES.md`.
**Versión:** v01 · 28 de junio de 2026

---

## 1. Objetivo y alcance

Definir, de forma aplicable y repetible, cómo se organiza, versiona, respalda, documenta y entrega un proyecto de desarrollo web en IME. El objetivo es un repositorio limpio y respaldado, entregables profesionales consistentes, y cero secretos expuestos. Aplica a todo proyecto nuevo o existente.

---

## 2. Principio rector: dos carpetas por proyecto

Cada proyecto usa **dos carpetas con el mismo nombre** (el nombre del proyecto):

| Ubicación | Para qué | Respaldo |
|---|---|---|
| **Git** — `~/Desktop/GitHub/<Proyecto>/` | Código y todo lo que se versiona | GitHub (`push`) |
| **Drive** — `~/Desktop/Google Drive/_agentic Ai/<Proyecto>/` | Lo complementario: entregables, capturas, referencia | Sincronización automática de Drive |

**Regla dura:** el repositorio git **no** vive dentro de una carpeta sincronizada por Drive o iCloud. La sincronización puede tocar el `.git` a medio commit y corromperlo. El código va en `Desktop/GitHub` (local) y Drive guarda solo lo complementario.

---

## 3. Qué va en git y qué va en Drive

**Git (versionado):** código fuente, configuración, y los archivos `.md` "fuente" (informes, registros, diseño, bitácoras).

**Drive (complementario):** entregables `.docx` / `.pdf` / `.pptx`, capturas de pantalla, material de referencia y todo lo no versionado.

Reglas finas:

1. **Excepción — binarios que la app sirve van en git.** Los archivos que la aplicación necesita o publica se quedan en el repo: `public/docs/`, `public/skins/`, logos, imágenes de assets. Criterio: *binario que la app sirve → git; binario de oficina/entregable/captura → Drive.*
2. **Fuente vs. salida (única fuente de verdad).** El `.md` en git es la fuente editable y versionada. Sus exportaciones (`.docx`, `.pdf`) viven en Drive. Si se edita un informe, se edita el `.md` (git) y se **regenera** el export; nunca se editan a mano el `.docx`/`.pdf`.
3. **Nunca secretos.** No poner `.env`, claves ni credenciales en git ni en Drive (ambos sincronizan/publican). Se mantienen fuera y en gestor de secretos.

---

## 4. Estructura de carpetas estándar

**Repo (git):**

```
~/Desktop/GitHub/<Proyecto>/
├─ src/ (o raíz)        Código fuente
├─ public/             Binarios servidos (docs, skins, logos)
├─ informes/           Fuentes .md y generadores de informes
├─ skin/               Motor del skin + presets (si aplica)
├─ .gitignore  .env.example  README.md
└─ <DOCS>.md           Informes/bitácoras fuente
```

**Drive (complementario):**

```
~/Desktop/Google Drive/_agentic Ai/<Proyecto>/
├─ Informes/           Exports .docx/.pdf/.pptx
├─ Capturas/           Pantallazos
└─ Referencia/         Material de apoyo no versionado
```

---

## 5. Estándar de nombres de archivos

Para entregables e informes:

```
IME_L<n>_<Tipo>_<Tema>_<YYYYMMDD>_v<NN>
```

| Campo | Significado |
|---|---|
| `IME` | Organización |
| `L<n>` | Línea/lote de trabajo (p. ej. `L2`) |
| `<Tipo>` | Clase de documento: `InformeTecnico`, `Bitacora`, `Anexo`, `Protocolo`, etc. |
| `<Tema>` | Tema en CamelCase, sin espacios (p. ej. `DesarrolloEsteticoGraficaViva`) |
| `<YYYYMMDD>` | Fecha del entregable |
| `v<NN>` | Versión, dos dígitos (`v01`, `v02`, …) |

Reglas:

- **Fuente `.md` (git):** lleva el nombre base **sin** fecha ni versión (git ya versiona). Ej.: `IME_L2_InformeTecnico_VisionSkinGenerativoIME.md`.
- **Export (Drive):** el nombre base **más** `_YYYYMMDD_vNN`. Ej.: `..._20260628_v02.pdf`.
- Cada cambio de contenido del entregable sube la versión (`v01 → v02`); las versiones previas quedan como histórico.

---

## 6. Formato de entregables

- **Tamaño A4**, márgenes de 1 pulgada.
- **Par `.docx` + `.pdf`** para cada informe (editable + lectura).
- **Diagramación encuadrada (no quebrar contenido):** las tablas no se parten entre páginas; los títulos no quedan huérfanos al pie (un punto/sección comienza en página nueva si corresponde); encabezado y pie con paginación.
- **Referencias en APA 7**, con sangría francesa.
- **Imágenes/renders** embebidos con su rótulo (no como enlaces).
- **Verificación visual:** antes de entregar, revisar el PDF página por página.

---

## 7. Flujo de trabajo

1. **Documentar antes de codear.** Toda decisión de arquitectura/diseño se escribe primero (visión/norte) y luego se implementa.
2. **Editar la fuente, regenerar la salida.** Se modifica el `.md` y se regeneran `.docx`/`.pdf`; no se tocan los exports a mano.
3. **Respaldo disciplinado.** El respaldo de git **solo existe tras `push`**; lo no commiteado no está respaldado. Drive respalda automáticamente. Commit + push frecuente.
4. **Versionado.** Subir `vNN` del entregable al cambiar su contenido.

---

## 8. Bitácora viva

Cada proyecto mantiene una bitácora (`Bitacora`) con entradas **fechadas** de las decisiones de arquitectura y diseño, en `.md` fuente. Es la traza del proceso y se actualiza al cierre de cada hito.

---

## 9. Seguridad y privacidad

- **`.gitignore` obligatorio** desde el inicio: ignora `node_modules/`, `.env`, `.env.*` (con excepción de `.env.example`), `.DS_Store`, `dist/`, `.vite/`.
- **Secretos fuera de git y de Drive.** Si una clave se expone (queda en el historial), se **rota** en el proveedor; borrarla en un commit nuevo no la quita del historial.
- **`.env.example`** versionado como plantilla, sin valores reales.
- **Minimización de datos:** capturar solo lo necesario y lo más grueso posible; nunca IP cruda ni ubicación precisa; consentimiento y aviso por `app`.

---

## 10. Colaboración y cuentas

- **Código:** organización de GitHub compartida; cada colaborador con su propia cuenta (atribución de commits por persona).
- **Infraestructura:** una cuenta institucional como hogar de base de datos y alojamiento.
- Detalle en el informe de Infraestructura y Gobernanza.

---

## 11. Checklist de inicio de proyecto

1. Crear las dos carpetas con el mismo nombre (`~/Desktop/GitHub/<Proyecto>` y `…/Drive/_agentic Ai/<Proyecto>`).
2. Inicializar el repo en GitHub; clonarlo en `~/Desktop/GitHub/` (**no** en Drive).
3. Agregar `.gitignore`, `.env.example` y `README.md`.
4. Crear las subcarpetas de Drive (`Informes/`, `Capturas/`, `Referencia/`).
5. Primer commit + push.
6. Escribir el documento de visión/norte antes de codear.

---

## 12. Prompt reutilizable (inicio de sesión)

Para estandarizar la organización al comenzar a trabajar un proyecto:

```text
Estándar de organización de proyecto. Sustituye <PROYECTO> por el nombre (igual en ambas carpetas):
- Repo de código (git): ~/Desktop/GitHub/<PROYECTO>/  (código, config, .md fuente, binarios que la app sirve). No vive en Drive/iCloud.
- Carpeta complementaria (Drive): ~/Desktop/Google Drive/_agentic Ai/<PROYECTO>/  (informes .docx/.pdf/.pptx, capturas, referencia).
Reglas: 1) código y .md fuente → git; 2) entregables/capturas/referencia → Drive; 3) binarios que la app sirve → git; 4) los .md son la fuente y sus exportaciones viven en Drive; 5) nunca secretos en git ni Drive; 6) commit + push frecuente.
Nombres: IME_L<n>_<Tipo>_<Tema>_<YYYYMMDD>_v<NN>. Entregables en A4, par .docx + .pdf, diagramación sin quiebres, referencias APA 7.
```

---

## 13. Anexo — Tipos de documento

| Tipo | Uso |
|---|---|
| `InformeTecnico` | Análisis, diseño o arquitectura técnica |
| `Bitacora` | Registro fechado de decisiones de proceso |
| `Anexo` | Material de apoyo de un informe (renders, tablas, figuras) |
| `Protocolo` | Estándar/convención de aplicación |

---

*Documento fuente versionado en git. Exportaciones .docx/.pdf en Drive. Complementa `CONVENCIONES.md`.*
