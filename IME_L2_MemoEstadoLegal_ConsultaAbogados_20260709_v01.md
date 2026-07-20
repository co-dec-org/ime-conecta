# Memo — Estado legal del sitio IME Conecta y preguntas para asesoría jurídica

**Proyecto:** IME Conecta (Industria Musical Electrónica Independiente de Chile A.G.)
**Documento:** IME_L2_MemoEstadoLegal_ConsultaAbogados_20260709_v01
**Fecha:** 9 de julio de 2026
**Sitio:** https://ime-conecta.vercel.app
**Marco:** Ley 19.628 y Ley 21.719 (Protección de Datos Personales, Chile)
**Nota:** documento técnico-organizacional preparado para consulta con abogados. No constituye asesoría legal.

---

## 1. Propósito

Dejar por escrito el estado actual del tratamiento de datos personales del sitio IME Conecta —tras su conversión a sitio estático (vanilla) e integración a la trilogía IME— para orientar la consulta con abogados expertos en la Ley 21.719. Reúne la documentación ya existente, el inventario real de datos que trata el sitio hoy, los controles implementados, los ajustes recientes y un conjunto de preguntas concretas.

---

## 2. Documentación legal ya existente

El proyecto cuenta con un corpus documental que puede entregarse a la asesoría (disponible en `.docx` y `.pdf` en la carpeta de Drive del proyecto):

- **Informe Operativo-Legal de IME Conecta** (con referencias en formato APA 7ª edición): documento principal para revisión jurídica.
- **Borrador de Aviso de Privacidad y Consentimiento.**
- **Política de Retención y borrador de EIPD** (Evaluación de Impacto en la Protección de Datos).
- **Informe / Registro de Trazabilidad de la información.**
- **Diseño de Modelo de Datos (Supabase) e Informe de Modelo de Datos Unificado.**
- **Análisis Técnico del sitio.**

El corpus cubre aviso, consentimiento, EIPD, retención, trazabilidad y modelo de datos.

---

## 3. Inventario de datos personales que trata el sitio (estado actual)

### 3.1 Analítica anónima (tablas `ime_visitas` / `ime_eventos`)

- **Activación:** opt-in mediante banner de consentimiento; sin consentimiento no se registra.
- **Campos:** tipo de dispositivo, sistema operativo, navegador, idioma, resolución de pantalla, densidad de píxeles, zona horaria, una etiqueta de "ciudad", *referrer* y un identificador de sesión aleatorio.
- **Aclaración relevante:** la "ciudad" se **deriva de la zona horaria** del navegador (por ejemplo, "Santiago"), **no** de geolocalización ni de la dirección IP. No se usa la API de geolocalización.
- **IP:** la aplicación **no almacena la IP**. El proveedor de hosting (Vercel) sí la procesa en el borde para servir el sitio.

### 3.2 Notas privadas (tabla `ime_section_notes`)

- **Datos:** correo, nombre y texto de la nota de la persona **autenticada** (directorio).
- **Control:** Row Level Security (RLS): cada persona solo accede a sus propias notas (`auth.uid() = user_id`).

### 3.3 Padrón del directorio (tabla `ime_directors`)

- **Datos:** correo, nombre, rol y estado de las personas del directorio.
- **Control:** vive únicamente en la base de datos con RLS; ya **no** se listan correos personales en el código del cliente (ver sección 5).

---

## 4. Bases y controles ya implementados

- **Consentimiento:** analítica opt-in con banner claro ("sin datos personales ni ubicación precisa").
- **Minimización:** no se recolecta más de lo necesario; sin IP en la aplicación; sin geolocalización.
- **Seguridad:** Content-Security-Policy estricta, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` que bloquea cámara, micrófono y geolocalización; sin secretos versionados.
- **Confidencialidad:** RLS en notas y padrón; la clave pública de Supabase es pública por diseño y está protegida por RLS.
- **Base de datos común:** la trilogía IME comparte una base separada por `app_key`; el tratamiento es conjunto entre los tres sitios de la A.G.

---

## 5. Ajustes recientes (realizados en esta revisión)

- **Se retiraron los correos del directorio del código público.** Estaban en el archivo de configuración del cliente (`supabase-config.js`) y en el módulo de calibración; eran código sin uso funcional. El padrón queda únicamente en la base de datos con RLS. Es una mejora de minimización (Ley 21.719).
- **El acceso al calibrador se cambió** de un correo personal fijo a un control por **rol** del padrón, sin datos personales en el cliente.
- **Se aclaró la duda sobre IP/georreferencia:** la "ciudad" proviene de la zona horaria, no de geolocalización.

**Pendiente detectado:** el sitio **no enlaza aún un Aviso de Privacidad** para el usuario final (solo el microcopy del banner). Existe un borrador; conviene publicarlo y enlazarlo.

---

## 6. Preguntas para la asesoría jurídica

1. ¿El conjunto de campos de la analítica (dispositivo, navegador, zona horaria, *referrer*), aun siendo opt-in y sin IP, constituye "dato personal" bajo la Ley 21.719 por permitir identificación indirecta?
2. ¿Basta el consentimiento del banner o se requiere un **aviso de privacidad formal, publicado y enlazado** antes de recolectar?
3. ¿Qué contenido mínimo debe tener ese aviso (finalidad, responsable, plazos, derechos, contacto)?
4. La **base de datos compartida** entre los tres sitios de la A.G.: ¿genera roles de **responsable/encargado** que deban declararse o formalizarse?
5. **Retención:** ¿qué plazos son razonables para visitas, eventos y notas? (existe borrador de política).
6. ¿Se requiere una **EIPD** dado el tipo y volumen de datos? (existe borrador).
7. **Notas con correo y nombre:** ¿cómo debe habilitarse el ejercicio de derechos (acceso, rectificación, supresión, oposición)?
8. El proveedor de hosting (Vercel) procesa la **IP** en el borde: ¿implica una relación de encargado o una **transferencia internacional** que deba regularse?
9. El padrón y las notas del directorio: ¿qué base de licitud corresponde (consentimiento, relación asociativa, interés legítimo)?

---

## 7. Acciones internas recomendadas (previas o paralelas a la consulta)

- Publicar y **enlazar el Aviso de Privacidad** en el sitio (a partir del borrador existente).
- Definir y documentar **plazos de retención** por tabla.
- Formalizar el **rol de responsable** del tratamiento dentro de la A.G. y el punto de contacto para derechos.
- Registrar en el documento de trazabilidad los ajustes de minimización realizados.

---

*Documento generado según el protocolo IME: fuente `.md` en el repositorio Git; entregables `.docx` y `.pdf` (formato A4) en la carpeta de Drive del proyecto. No constituye asesoría legal.*
