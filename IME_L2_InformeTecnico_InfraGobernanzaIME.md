# Informe técnico — Arquitectura de cuentas y gobernanza de infraestructura IME

**Proyecto:** IME (Conecta, Planificación Estratégica, Link 2027)
**Tipo:** Informe técnico (gobernanza e infraestructura)
**Estado:** Propuesta para aprobación del Directorio.
**Versión:** v01 · 28 de junio de 2026
**Relacionados:** Modelo de datos unificado; Desarrollo estético de la gráfica viva.

---

## 1. Objetivo

Fijar bajo qué cuentas viven la base de datos, el alojamiento y el código de los tres proyectos IME, y dejar un checklist de migración para consolidarlo de forma ordenada, respaldada y sin secretos expuestos.

---

## 2. Principio de gobernanza

Dos "hogares" claros:

- **Hogar de infraestructura** (datos y alojamiento): cuenta institucional **`ime.conecta@gmail.com`**.
- **Hogar de código** (repositorios): organización de GitHub **`co-dec-org`**, trabajada de forma colaborativa por dos cuentas.

Una sola identidad de usuarios para los tres sitios; dominio y gobernanza separados por proyecto (`app`).

---

## 3. Arquitectura de cuentas

| Plataforma | Cuenta / hogar | Alcance |
|---|---|---|
| Supabase | `ime.conecta@gmail.com` | **Un** proyecto = base de datos común a los 3 sitios |
| Vercel | `ime.conecta@gmail.com` | **Un** equipo con **3** proyectos (un sitio por proyecto) |
| GitHub | Organización `co-dec-org` | Repos de los 3 proyectos; miembros: `co.dec.org@gmail.com` e `ime.conecta@gmail.com` |

---

## 4. Detalle por plataforma

**Supabase (base común).** Un único proyecto Postgres compartido (identidad `auth.users` única, anónimo→registrado, separación por `app`, RLS), según el Modelo de datos unificado. El proyecto actual (`vbspdgvrqkeaebzqkbtx`) debe quedar bajo la organización de `ime.conecta@gmail.com`: se puede **transferir** (si se es dueño de origen y destino) o **recrear** y aplicar las migraciones.

**Vercel (3 sitios).** Bajo un equipo de `ime.conecta@gmail.com`, tres proyectos —`ime-conecta`, `ime-planificacion`, `ime-link`—, cada uno ligado a su repo, con su dominio y sus variables de entorno. Requiere autorizar la integración Vercel↔GitHub para la organización. Revisar el plan vigente (el gratuito Hobby es de uso personal/no comercial; para una A.G. podría corresponder plan Pro).

**GitHub (colaboración).** Cada correo es una cuenta. Se crea una cuenta GitHub para `ime.conecta@gmail.com` y se invita a la organización `co-dec-org` como miembro; así ambas cuentas trabajan los mismos repos, cada una con su atribución de commits. (Alternativa mínima: agregar la cuenta como *collaborator* por repo, pero la organización es preferible para 3 proyectos.)

---

## 5. Checklist de migración

**Supabase**
1. Confirmar/crear cuenta y organización en `ime.conecta@gmail.com`.
2. Transferir el proyecto actual a esa organización **o** crear uno nuevo y aplicar el esquema.
3. Aplicar esquema unificado (notas/roles + capa privada + columna `app`); habilitar *anonymous sign-ins*; registrar *redirect URLs* de los 3 dominios.
4. **Rotar la anon key** expuesta y guardarla en `.env.local` (sin versionar).

**Vercel**
5. Usar/crear el equipo en `ime.conecta@gmail.com` y autorizar la integración con `co-dec-org`.
6. Crear los 3 proyectos, cada uno ligado a su repo, con dominio y variables (URL + anon key de Supabase).
7. Verificar el plan adecuado.

**GitHub**
8. Crear la cuenta GitHub de `ime.conecta@gmail.com` (si no existe) e invitarla a la organización `co-dec-org`.
9. Mover los 3 repos fuera de Drive a `~/Desktop/GitHub/<Proyecto>` y sanearlos (`.gitignore`, quitar `node_modules` y `.env`).
10. Commit + push de cada repo.

---

## 6. Riesgos y notas

- **Eficiencia:** un solo proyecto Supabase para los tres sitios simplifica costos y operación; RLS y `app` mantienen la separación.
- **Secreto:** la anon key actual quedó en el historial de git (bajo riesgo por ser key publicable); se neutraliza rotándola.
- **Disciplina:** los repos no deben vivir en Drive (riesgo de corromper `.git`); el respaldo real es `push`.
- **Costos/planes:** confirmar planes de Vercel y Supabase según el uso institucional.

---

## 7. Decisión solicitada al Directorio

Aprobar la consolidación: **`ime.conecta@gmail.com`** como hogar de infraestructura (una base de datos Supabase y un equipo Vercel con tres sitios) y la organización **`co-dec-org`** como hogar de código, con `co.dec.org@gmail.com` e `ime.conecta@gmail.com` como cuentas colaboradoras.

---

*Documento fuente versionado en git. Exportaciones .docx/.pdf en Drive.*
