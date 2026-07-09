# Informe técnico — Modelo de datos unificado: base de usuarios compartida IME

**Proyecto:** IME (base común a IME Planificación Estratégica, IME Link 2027 e IME Conecta)
**Tipo:** Informe técnico (arquitectura de datos)
**Estado:** Diseño. Previo a implementación; sujeto a validación legal.
**Versión:** v01 · 28 de junio de 2026
**Relacionados:** visión del skin, referencia Book of Shaders, bitácora de diseño.

---

## 1. Principio

**Una sola base de identidad** para todas las webs IME; **dominio y gobernanza separados por proyecto**. Comparten *quién eres*; cada sitio mantiene *qué hace con eso*. Resuelve la hipótesis: usuarios anónimos y registrados en una misma base.

---

## 2. Identidad compartida

- **Un único proyecto Supabase** → `auth.users` común a los tres sitios.
- **Anónimo (vitrinear):** Supabase *anonymous sign-in* crea una fila `auth.users` con `is_anonymous = true`, sin correo. Permite generar trazas/portadora sin registro.
- **Ascenso a registrado:** al registrarse, el mismo `id` se conserva (se vincula correo/clave) → no se pierde la huella. **Solo funciona dentro del mismo proyecto**: por eso la base es única.
- **`profiles`** (1:1 con `auth.users`): perfil mínimo compartido.

---

## 3. Separación por proyecto (`app`)

Discriminador `app` en las tablas transversales para no mezclar gobernanza ni reportes:

- Valores: `ime-planificacion-estrategica`, `ime-conecta`, `ime-link-2027`.
- **Notas:** `ime_section_notes` ya incluye `app_key` (el esquema actual ya contempla Planificación y Conecta); se añade Link 2027.
- **Consentimiento por app:** `consents.app` + `policy_version` propios (el tracking de Conecta no se hereda a Planificación).
- **Roles por app:** p. ej. `ime_directors` (Planificación) define quién es director/a; un mismo usuario puede ser director en un sitio y anónimo en otro.

---

## 4. Tablas

| Ámbito | Tablas | Notas |
|---|---|---|
| Compartido | `auth.users`, `profiles` | identidad única |
| Notas (por app) | `ime_section_notes` (`app_key`), `ime_directors` | esquema Planificación existente |
| Capa privada Conecta | `consents` (+`app`), `sessions`, `nav_events`, `analytics_anonymized` | migración `0001_init_capa_privada` |

RLS en todas: cada persona ve/edita solo lo suyo (`auth.uid()`), y las escrituras se acotan por `app` y por consentimiento vigente donde aplique.

---

## 5. Cómo alimenta el skin (bucle dato → estética)

- **Portadora (colectivo):** `analytics_anonymized`, agregado por `app` y `asset` (irreversible, no es dato personal) → alimenta `u_collective` del skin de cada proyecto.
- **Voz (individuo):** navegación/permanencia y notas del usuario → `u_modulation`.
- Cada sitio lee su propio agregado (`app`), así la portadora refleja a *su* comunidad.

---

## 6. Flujos clave

1. **Vitrinear:** anonymous sign-in → trazas anónimas (con consentimiento) → portadora.
2. **Registro:** ascenso del usuario anónimo → conserva id/huella → consentimiento `account` (+ `tracking` opcional) con `policy_version` y `app`.
3. **Derechos ARSOPB:** export/borrado por usuario (cascada en `auth.users`); revocación de tracking corta nuevas trazas.
4. **Anonimización:** job periódico vuelca a `analytics_anonymized` sin identificadores.

---

## 7. Migración (alto nivel)

1. Confirmar acceso y usar **un** proyecto Supabase para los tres sitios.
2. Aplicar: esquema de notas/roles (Planificación) + capa privada (Conecta) + columna `app` en `consents`.
3. Habilitar **anonymous sign-ins**; registrar las *redirect URLs* de los tres dominios.
4. Estandarizar la env key (`VITE_SUPABASE_ANON_KEY`) y completar `supabase-config.js` (hoy vacío en Planificación).

---

## 8. Cumplimiento

- Consentimiento + aviso **por app**; minimización (sin IP cruda; ciudad/hemisferio grueso).
- No capturar datos personales identificados antes de la validación legal.

---

## 9. Decisiones abiertas

1. Confirmar credenciales/acceso al proyecto Supabase compartido.
2. `app_key` definitivo de IME Link 2027.
3. ¿`profiles` único o un perfil por app? (recomendado: único + membresía por app).
4. Política de retención de usuarios anónimos.

---

*Documento fuente versionado en git. Exportaciones .docx/.pdf en Drive. Copia en ambos repos (Conecta + Planificación) según convención.*
