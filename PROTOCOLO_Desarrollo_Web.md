# Protocolo de Desarrollo Web — Estándar de Proyectos

**Versión:** 1.0 · 28 de junio de 2026
**Ámbito:** estándar reutilizable para los proyectos de desarrollo web. IME Conecta es la implementación de referencia.
**Mantención:** documento versionado en git (fuente). Cualquier cambio al protocolo se registra aquí.

---

## 1. Propósito y alcance

Estandarizar cómo se organizan, gobiernan, desarrollan, documentan y resguardan los proyectos web, de modo que cualquier proyecto nuevo arranque con la misma estructura, trazabilidad y cumplimiento. El protocolo aplica a la organización de archivos, la titularidad de cuentas, el flujo de desarrollo, los entregables y la protección de datos.

---

## 2. Gobernanza de identidad y cuentas

### 2.1 Principio

Cada proyecto tiene una **identidad gobernante institucional** (un correo dedicado) que es **dueña de todos los servicios** del proyecto, separada de las cuentas **personales/creativas** que sólo colaboran. Esto da confianza y trazabilidad: los activos no dependen de una persona.

### 2.2 Modelo de cuentas

| Servicio | Titularidad | Rol de la cuenta operativa/creativa |
|---|---|---|
| GitHub (repos) | Identidad institucional (dueña) | Colaborador con acceso de escritura |
| Vercel | Identidad institucional | — |
| Supabase | Identidad institucional | — |
| Correo (Gmail) | Identidad institucional | — |

Referencia IME: identidad institucional `ime.conecta@gmail.com` (usuario GitHub `co-dec-242`); cuenta creativa `co-dec-org`.

### 2.3 Control distribuido (separación de poderes)

El poder de acceso se reparte para que **nadie actúe solo**: una persona custodia la **contraseña** y otra (p. ej. la presidencia) custodia el **segundo factor (2FA)**. Los **códigos de recuperación** se resguardan aparte como mecanismo de rompe-vidrio.

### 2.4 Reglas

- **2FA obligatorio** en todas las cuentas, preferentemente con app de autenticación (TOTP).
- Guardar los **códigos de recuperación** en lugar seguro y acordado.
- La identidad institucional es la **dueña**; las cuentas creativas entran como **colaboradoras**.

---

## 3. Organización de carpetas y versionado (git + Drive)

### 3.1 Dos carpetas por proyecto (mismo nombre)

| Ubicación | Para qué |
|---|---|
| **Git** — `~/Desktop/GitHub/<Proyecto>/` | Código y todo lo versionable. Respaldo: GitHub. |
| **Drive** — `~/Desktop/Google Drive/_agentic Ai/<Proyecto>/` | Complementario: informes, entregables, capturas, material no versionado. |

### 3.2 Reglas

- **El repo de git NO vive dentro de una carpeta sincronizada por Drive/iCloud** (riesgo de corromper `.git`). Por eso el repo va local en `Desktop/GitHub`.
- **Excepción:** los binarios que la aplicación sirve o necesita (p. ej. `public/`, logos, documentos de descarga) **van en git**, aunque sean binarios.
- **Fuente vs. salida:** los `.md` en git son la fuente editable y versionada; sus exportaciones `.docx`/`.pdf` viven en Drive.
- **Secretos nunca** en git ni en Drive (`.env.local` fuera de versionado).
- Mismo nombre de carpeta en ambos lados.

---

## 4. Estructura multi-proyecto (ecosistema)

Cuando una institución tiene varios proyectos web (referencia IME: Conecta, Planificación, Link):

- **Supabase — una base de datos común.** Un solo proyecto Supabase con **schemas por proyecto** (`conecta`, `planificacion`, `link`) más un schema **`comun`** para datos compartidos (p. ej. la base única de socixs). **Auth unificado:** un login sirve para todos los sitios.
- **Vercel — un sitio por proyecto.** Una sola cuenta con varios proyectos, cada uno con su repo y dominio; todos apuntan a la misma Supabase vía variables de entorno.
- **GitHub — un repo por proyecto**, propiedad de la identidad institucional, con la(s) cuenta(s) creativa(s) como colaboradoras. La Organización de GitHub se reserva para la etapa de expansión.

---

## 5. Flujo de trabajo y control de versiones

- Rama principal **`main`**; despliegue continuo (Vercel publica en cada push a `main`).
- **El respaldo solo existe tras `push`**: lo no commiteado no está respaldado. Commit + push frecuente.
- **Doble sombrero (autoría):** el acceso lo da la cuenta de GitHub (colaboración); la **autoría** de cada commit la define `git user.email`. Se firma según el tipo de aporte (operativo institucional / creativo personal).
- **Pruebas (tests)** sobre la lógica crítica antes de cambios mayores.
- Verificación de build (`npm run build`) antes de publicar.

---

## 6. Entregables y formatos

### 6.1 Dónde vive cada formato

- **`.md`** → git (fuente versionada).
- **`.docx` y `.pdf`** → Drive (entregables para compartir/imprimir).

### 6.2 Estándar de impresión

- **Formato A4** para todos los `.docx`/`.pdf`, de aquí en adelante.
- **Saltos de página cuidados:** las filas de tabla no se parten entre páginas y los encabezados no quedan huérfanos (separados de su contenido).
- Portada con logo; pie de página con número de página.

### 6.3 Nomenclatura

Nombre descriptivo + proyecto, p. ej. `Informe_Operativo_Legal_IME_Conecta`. Versionar con sufijo cuando aplique (`_v01`).

---

## 7. Cumplimiento, datos y privacidad

- **Cumplimiento por diseño:** consentimiento granular, minimización, finalidad declarada, retención definida.
- **Dos capas:** capa pública anónima (analítica sin cookies) y capa privada con consentimiento (datos identificados).
- **No capturar datos personales identificados** sin validación legal previa y aviso de privacidad publicado.
- **Anonimización irreversible** de los datos antes de usarlos para análisis/modelado en laboratorios (deja de ser dato personal).
- **Trazabilidad por git:** el historial es la fuente inmutable (fecha, autor y contenido por cambio).
- **Marco legal de referencia (Chile):** Ley 19.628 y Ley 21.719. La validación corresponde a un profesional del derecho.

---

## 8. Restricciones del proyecto

- **Uso no comercial:** mientras el sitio no se monetice por la vía web, los planes gratuitos son válidos y están en regla (Vercel Hobby es para uso no comercial; Supabase Free aplica).
- **Disparador a futuro:** si el proyecto se monetiza (cobros, publicidad, datos con fin comercial), revisar: (1) plan Pro de Vercel, (2) finalidad y base legal del tratamiento de datos, (3) implicancias tributarias.

---

## 9. Seguridad

- **2FA** en todas las cuentas; **secretos** fuera de git y Drive (`.env.local` + `.gitignore`); **códigos de recuperación** resguardados; **control distribuido** (contraseña y 2FA en manos distintas).
- Cabeceras de seguridad y CSP en el despliegue (referencia: `vercel.json`).

---

## 10. Bootstrap de un proyecto nuevo (checklist)

1. Crear el correo institucional y sus cuentas dueñas (GitHub, Vercel, Supabase); activar 2FA y guardar recovery codes.
2. Crear el repo bajo la identidad institucional; agregar la cuenta creativa como colaboradora.
3. Crear las dos carpetas (`Desktop/GitHub/<Proyecto>` y `Drive/_agentic Ai/<Proyecto>`).
4. Conectar el repo a Vercel (auto-deploy desde `main`).
5. Definir variables en `.env.example`; mantener `.env.local` fuera de git.
6. Aplicar el cumplimiento por diseño desde el inicio (capa pública anónima; capa privada sólo con consentimiento y aviso).
7. Documentar: `PROYECTO.md` (mapa), `CONVENCIONES.md` (carpetas) y este protocolo.

### Prompt reutilizable (copiar/pegar al iniciar una sesión)

```text
Estándar de organización de proyecto (Cowork). Aplica esta convención durante toda la sesión.
Sustituye <PROYECTO> por el nombre del proyecto (igual en ambas carpetas):

- Repo de código (git): ~/Desktop/GitHub/<PROYECTO>/ → código, configuración, .md fuente y
  binarios que la app sirve (public/, logos). Respaldo: GitHub. No vive dentro de Drive/iCloud.
- Carpeta complementaria (Drive): ~/Desktop/Google Drive/_agentic Ai/<PROYECTO>/ → todo lo que
  NO va en git: informes/entregables (.docx, .pdf), capturas y material no versionado.

Reglas: 1) código y .md → git; 2) entregables y capturas → Drive; 3) excepción: binarios que la
app sirve van en git; 4) los .md son la fuente, sus .docx/.pdf van a Drive; 5) nunca secretos en
git ni Drive; 6) commit + push frecuente; 7) entregables .docx/.pdf en A4 con saltos cuidados.

Guarda el código y los .md en el repo git; informes, PDFs y capturas en Drive. Si no tienes
acceso a alguna carpeta, pídelo.
```

---

*Documento de referencia. Versionado en git; actualizar aquí cualquier cambio al protocolo.*
