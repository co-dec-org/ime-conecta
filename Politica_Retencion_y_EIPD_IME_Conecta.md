# Borrador — Política de Retención y Evaluación de Impacto (EIPD)

**Proyecto:** IME Conecta · capa privada
**Responsable:** Industria Musical Electrónica Independiente de Chile A.G. (IME)
**Estado:** BORRADOR para revisión legal. Los plazos propuestos son orientativos y deben validarse.
**Versión:** 0.1 · 21 de junio de 2026

> Aviso: documento operativo de apoyo. No constituye asesoría jurídica. Debe revisarse junto con el Informe Operativo-Legal y el Borrador de Aviso de Privacidad del proyecto.

---

## Parte 1 — Política de retención

Principio: conservar cada dato solo el tiempo necesario para su finalidad (minimización), y luego eliminar o anonimizar de forma irreversible.

| Categoría de dato | Finalidad | Plazo propuesto | Acción al vencer |
|---|---|---|---|
| Identidad de cuenta (correo, nombre) | Autenticación | Mientras la cuenta esté activa + 12 meses tras la baja | Eliminación |
| Registros de consentimiento | Acreditar cumplimiento | 5 años desde su otorgamiento/revocación | Eliminación |
| Trazas de navegación identificadas | Análisis y modelado | 12 meses | Anonimización irreversible o eliminación |
| Datos agregados anonimizados (laboratorio) | Investigación/modelado | Indefinido (ya no son datos personales) | — |
| Logs de seguridad/operación | Seguridad | 6–12 meses | Eliminación |
| Solicitudes de derechos (ARSOPB) | Trazabilidad legal | 3 años | Eliminación |

Notas:
- Los plazos son **propuestas** a confirmar por el abogado según la finalidad y la normativa.
- La **revocación** del consentimiento de tracking detiene la captura y dispara la eliminación/anonimización de las trazas asociadas según esta política.
- La **anonimización irreversible** convierte la traza en dato agregado sin vínculo con la persona; a partir de ahí queda fuera del ámbito de la ley.

---

## Parte 2 — Evaluación de Impacto (EIPD/DPIA) — borrador

La EIPD evalúa los riesgos del tratamiento para los derechos de las personas. Procede especialmente cuando hay perfilamiento o modelado, como en este proyecto.

### 2.1 Cribado: ¿se requiere EIPD?
Indicadores presentes en el proyecto:
- Tratamiento sistemático de datos de comportamiento (trazas de navegación). **Sí.**
- Análisis/modelado que puede perfilar a las personas. **Sí.**
- Uso de encargados con transferencia internacional (Vercel, Supabase). **Sí.**

Conclusión preliminar: **se recomienda realizar EIPD** antes de activar la captura identificada. (A confirmar por el abogado.)

### 2.2 Descripción del tratamiento
- **Qué:** sección/activo digital visitado, tiempo de permanencia y eventos, asociados a una persona registrada.
- **Para qué:** análisis y modelado de uso en los laboratorios web.
- **Base:** consentimiento otorgado al registro.
- **Quiénes:** IME (responsable); Vercel y Supabase (encargados).

### 2.3 Necesidad y proporcionalidad
- ¿Es necesario identificar a la persona, o basta con datos anónimos/agregados? (Decisión clave: gran parte del modelado puede lograrse con la tabla anonimizada.)
- Minimización: capturar solo los eventos imprescindibles; evitar IP y user-agent crudo.

### 2.4 Riesgos identificados (preliminar)
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Re-identificación de un perfil "anónimo" | Media | Alto | Anonimización irreversible; no almacenar IP. |
| Acceso no autorizado a la base | Baja | Alto | RLS, cifrado, control de acceso, DPA. |
| Uso más allá de la finalidad declarada | Media | Medio | Política de uso de datos; control interno. |
| Transferencia internacional sin garantías | Media | Medio | DPA y cláusulas con Vercel/Supabase. |
| Falta de consentimiento válido | Baja | Alto | Opt-in granular y registro auditable. |

### 2.5 Medidas y decisión
- Implementar las mitigaciones anteriores antes de capturar datos identificados.
- Registrar la EIPD y revisarla periódicamente.
- **Decisión final y aprobación:** [A DEFINIR con el abogado].

---

## Parte 3 — Preguntas para el abogado
1. ¿Son adecuados los plazos de retención propuestos por categoría?
2. ¿Es obligatoria la EIPD en este caso bajo la Ley N.º 21.719, y con qué formalidades?
3. ¿Qué garantías concretas se exigen para la transferencia internacional?
4. ¿Conviene operar el laboratorio solo con datos anonimizados para reducir el alcance legal?

---

*Referencias normativas de contexto: Ley N.º 19.628 (1999); Ley N.º 21.719 (2024). Ver el Informe Operativo-Legal del proyecto para citas en APA 7.*
