# IME Conecta — Mapa del proyecto

Índice maestro del proyecto. Punto de entrada para navegar código, documentos y estado.

**Responsable:** Industria Musical Electrónica Independiente de Chile A.G. (IME)
**Sitio:** https://ime-conecta.vercel.app · **Skins:** https://ime-conecta.vercel.app/skins/
**Repositorio:** co-dec-org/ime-conecta (GitHub) · **Última actualización:** 21 de junio de 2026

---

## 1. Qué es

Plataforma web de IME en dos capas:

- **Capa pública** (operativa): presentación ejecutiva navegable, anónima, con analítica sin cookies.
- **Capa privada** (en construcción): usuarixs registradxs con captura de trazas de navegación en Supabase, para análisis y modelado en los laboratorios web.

Stack: Vite + React + TypeScript · Despliegue: Vercel (auto-deploy desde `main`).

---

## 2. Estado (resumen)

| Frente | Estado |
|---|---|
| Repositorio, sitio, identidad, despliegue, SEO, analítica anónima | Hecho |
| Documentación legal-operativa y trazabilidad | Hecho |
| Diseño de la capa privada (datos) | Diseñado |
| Implementación de la capa privada | Pendiente (necesita Supabase) |
| Validación legal profesional | Pendiente |

Detalle completo en `Informe_Avance_IME_Conecta`.

---

## 3. Documentos del proyecto

| Documento | Propósito |
|---|---|
| `Informe_Avance_IME_Conecta` | Estado, lo hecho y lo pendiente (arquitectura y desarrollo). |
| `Analisis_Tecnico_IME_Conecta` | Auditoría técnica del sitio. |
| `Informe_Operativo_Legal_IME_Conecta` | Para revisión de abogado; marco legal y APA 7. |
| `Borrador_Aviso_Privacidad_y_Consentimiento_IME_Conecta` | Texto de aviso y flujo de consentimiento. |
| `Politica_Retencion_y_EIPD_IME_Conecta` | Plazos de retención y evaluación de impacto. |
| `Diseno_Modelo_Datos_Supabase_IME_Conecta` | Esquema SQL, RLS y flujos de la capa privada. |
| `Registro_Trazabilidad_IME_Conecta` | Bitácora del proyecto e inventario de datos. |

(Los informes están en `.md`, `.docx` y/o `.pdf`.)

---

## 4. Estructura del repositorio

```
IME Conecta/
├─ src/
│  ├─ components/        Componentes del sitio (Header, Hero, ...)
│  │  ├─ ConsentBanner.tsx   (scaffolding capa privada)
│  │  └─ DataPanel.tsx       (scaffolding: "Gestiona mis datos")
│  ├─ lib/
│  │  ├─ consent.ts      Consentimiento granular auditable
│  │  └─ traces.ts       Captura de trazas (adaptador local + stub Supabase)
│  ├─ hooks/  data/  utils/
├─ public/
│  ├─ docs/              Informes descargables del sitio
│  └─ skins/             Laboratorio: constelar, espectro + sample-data.json
├─ mockups/              Copias de trabajo de los skins (redundantes con public/skins)
├─ index.html  vercel.json  package.json  ...
└─ [documentos del proyecto en la raíz]
```

---

## 5. Laboratorio (skins)

Visualizadores-sonificadores de trazas (Web Audio API + Canvas):

- `skins/constelar-ime.html` — Skin 02, look IME; consume `sample-data.json`.
- `skins/espectro-ime.html` — Skin 03, analizador en tiempo real (AnalyserNode).
- `skins/constelar.html` — Skin 01, base cósmica.

Datos de ejemplo en `skins/sample-data.json` (estructura de la tabla anonimizada). Se reemplazarán por trazas reales con la capa privada.

---

## 6. Próximos pasos

1. Respaldar en GitHub cada avance (especialmente al vivir en Google Drive).
2. Recuperar acceso a Supabase y crear el proyecto/migraciones (esquema ya diseñado).
3. Validación legal del informe y el aviso de privacidad.
4. Implementar capa privada (auth, RLS, captura, panel de derechos) sobre el scaffolding existente.
5. Conectar los skins a datos reales (tabla anonimizada).

---

## 7. Notas operativas

- **Google Drive + git:** evitar operaciones de git mientras Drive sincroniza; GitHub es el respaldo.
- **Cumplimiento:** no capturar datos personales identificados antes de la validación legal y del aviso de privacidad.
