# Convenciones de control de proyecto y gestión documental

Estándar de organización para los proyectos. Define qué vive en git y qué en Drive, para mantener un repo limpio, respaldado y sin riesgos.

---

## 1. Regla principal

Para cada proyecto se usan **dos carpetas con el mismo nombre** ("Carpeta de Proyecto" = nombre del proyecto):

| Ubicación | Para qué |
|---|---|
| **Git** — `~/Desktop/GitHub/<Proyecto>/` | Código y todo lo que se versiona. Respaldo: GitHub. |
| **Drive** — `~/Desktop/Google Drive/_agentic Ai/<Proyecto>/` | Lo complementario: informes técnicos, entregables, capturas, material no versionado y **todo lo que no queda en git**. |

> El repositorio de git **no** debe vivir dentro de una carpeta sincronizada por Drive o iCloud: la sincronización puede tocar el `.git` a medio commit y corromperlo. Por eso el repo va en `Desktop/GitHub` (local) y Drive solo guarda lo complementario.

---

## 2. Precisiones (para que la regla sea a prueba de errores)

1. **Excepción — binarios que la app sirve van en git.** Aunque sean binarios, los archivos que la aplicación necesita o publica se quedan en el repo: por ejemplo `public/docs/` (descargas del sitio), `public/skins/`, logos e imágenes de assets. La regla fina es: *binario que la app sirve → git; binario de oficina / entregable / captura → Drive.*

2. **Fuente vs. salida.** Los archivos `.md` en git son la **fuente editable y versionada**. Sus exportaciones (`.docx`, `.pdf`) viven en Drive. Si se edita un informe, se edita el `.md` (git) y se regenera el `.pdf` (Drive). Así no hay dos fuentes de verdad.

3. **Respaldo y disciplina.** El respaldo de git **solo existe tras `push`**; lo no commiteado no está respaldado. Drive respalda automáticamente. Hacer commit + push con frecuencia.

4. **Mismo nombre en ambos lados.** La carpeta del proyecto se llama igual en `Desktop/GitHub/` y en `Drive/_agentic Ai/` para mapear sin fricción.

5. **Nunca secretos.** No poner `.env`, claves ni credenciales en git ni en Drive (ambos sincronizan/publican). Mantenerlos fuera y en gestor de secretos.

---

## 3. Qué va dónde (resumen)

**Git:** código fuente, configuración, archivos `.md` fuente (informes, registros, diseño), y binarios que la app sirve (`public/...`, logos).

**Drive:** entregables `.docx` / `.pdf` / `.pptx`, capturas de pantalla, material de referencia, y cualquier archivo que no se versiona.

---

## 4. Prompt reutilizable (copiar/pegar en otros proyectos)

Pegar al inicio de una sesión para estandarizar la organización del proyecto:

```text
Estándar de organización de proyecto (Cowork). Aplica esta convención durante toda la sesión.

Sustituye <PROYECTO> por el nombre del proyecto (igual en ambas carpetas):

- Repo de código (git): ~/Desktop/GitHub/<PROYECTO>/
  Contiene: código fuente, configuración, archivos .md "fuente", y los binarios que la
  aplicación sirve o necesita (p. ej. /public/docs, /public/skins, logos). Respaldo: GitHub.
  El repo NO debe vivir dentro de una carpeta sincronizada por Drive o iCloud.

- Carpeta complementaria (Drive): ~/Desktop/Google Drive/_agentic Ai/<PROYECTO>/
  Contiene: todo lo que NO va en git → informes y entregables (.docx, .pdf, .pptx),
  capturas de pantalla, material de referencia y archivos no versionados.

Reglas:
1. Código y .md fuente → repo git.
2. Entregables de oficina, capturas y material complementario → Drive.
3. Excepción: los binarios que la app sirve o necesita se quedan en git.
4. Los .md son la fuente editable y versionada; sus exportaciones (.docx/.pdf) viven en Drive.
5. Nunca pongas secretos (.env, claves) en git ni en Drive.
6. Respaldo: commit + push frecuente en git; Drive sincroniza solo.

Cuando generes archivos: guarda el código y los .md en el repo git; guarda informes, PDFs y
capturas en la carpeta de Drive. Si no tienes acceso a alguna de las dos carpetas, pídemelo.
```

---

*Documento versionado en git (fuente). Actualizar aquí cualquier cambio a la convención.*
