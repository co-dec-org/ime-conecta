# Análisis Técnico y Plan de Mejoras — Sitio IME Conecta

**Gobernanza operacional**
Industria Musical Electrónica Independiente de Chile A.G.
Sitio: https://ime-conecta.vercel.app
Fecha: 21 de junio de 2026

---

## 1. Resumen ejecutivo

El sitio IME Conecta es una presentación web ejecutiva, construida con Vite, React y TypeScript, y desplegada en Vercel. Tras la revisión completa del código y la infraestructura, el estado general es sólido: el proyecto compila sin errores, no contiene código muerto evidente, respeta buenas prácticas de accesibilidad y, sobre todo, fue diseñado con un enfoque de privacidad estricto: no usa cookies, no tiene rastreadores y no envía datos a ningún servidor de terceros.

Ese mismo enfoque de privacidad es la razón por la que hoy **NO** es posible saber si alguien se ha logeado ni leer las notas que escriben las personas: el sitio no tiene login ni base de datos, y las notas se guardan únicamente en el navegador de cada visitante. Este informe documenta esos hechos, audita el sitio con hallazgos concretos, y entrega dos planes opcionales para, si así se decide, medir visitas y/o incorporar login y notas en la nube.

**Conclusiones rápidas:**

- **Estado del sitio:** saludable. Compila limpio, código ordenado, buen nivel de accesibilidad y privacidad.
- **Login / usuarios:** no existe. No hay forma de saber quién accede porque no hay autenticación.
- **Notas:** se guardan solo en el dispositivo de cada persona (localStorage); no se pueden recolectar.
- **Analíticas:** no instaladas. Hoy ni siquiera se cuentan visitas de forma confiable.
- **Mejoras prioritarias:** agregar robots.txt + sitemap, activar analíticas de visitas y fijar versiones de dependencias.

---

## 2. Estado general y arquitectura

El sitio es una aplicación de una sola página (SPA) que funciona como presentación navegable de 21 secciones, con modo lectura y modo presentación, búsqueda interna, tema claro/oscuro, barra de progreso, pantalla completa, copia de resumen ejecutivo y una capa opcional de Web-Video y Web-Audio API que se procesa localmente.

| Aspecto | Detalle |
|---|---|
| Framework | Vite + React 18 + TypeScript (modo strict activado) |
| Despliegue | Vercel, con auto-deploy desde GitHub (rama main) |
| Repositorio | co-dec-org/ime-conecta (GitHub) |
| Build | `tsc --noEmit && vite build` — compila sin errores |
| Peso de la app | JS ~201 KB (64 KB comprimido), CSS ~35 KB (7,5 KB comprimido) |
| Routing | Navegación por anclas (#secciones); no usa enrutador de cliente |
| Backend | Ninguno. Sitio 100% estático |

---

## 3. Auditoría técnica (depuración)

### 3.1 Calidad de código

- TypeScript en modo strict: el tipado fuerte previene una clase entera de errores.
- Sin `console.log`, `debugger` ni comentarios TODO/FIXME pendientes: el código está limpio para producción.
- El hook de almacenamiento (`useLocalStorage`) está bien hecho: protege contra entornos sin navegador y captura errores, de modo que el sitio no se rompe si el almacenamiento falla.
- Componentes bien separados por responsabilidad (Header, Hero, Secciones, Notas, capa de video/audio, etc.).

### 3.2 Rendimiento

- El bundle es liviano para un sitio de esta riqueza; carga rápida esperable.
- Cero llamadas de red a terceros: nada que bloquee el renderizado ni dependencias externas en runtime.
- Documentos descargables (PDF 236 KB, PPTX 112 KB, DOCX 44 KB) de tamaño razonable.
- **Oportunidad:** definir reglas de caché para los assets estáticos (Vercel ya lo hace por defecto en `/assets`).

### 3.3 Accesibilidad

- Idioma declarado (`lang="es"`) y uso extendido de atributos ARIA (44 instancias en los componentes).
- Respeta la preferencia de movimiento reducido (`prefers-reduced-motion`) para usuarios sensibles a animaciones.
- El logo del header usa `alt` vacío correctamente, porque el nombre "IME Conecta" ya está como texto adyacente (evita redundancia para lectores de pantalla).
- **Oportunidad:** verificar contraste de color en tema claro y el foco visible de teclado en todos los controles.

### 3.4 SEO y metadatos

- Título, descripción y metadatos sociales (Open Graph / Twitter) presentes y correctos, con imagen de previsualización en URL absoluta.
- Favicon e ícono para Apple configurados.
- **Falta (recomendado):** agregar `robots.txt` y `sitemap.xml`, y una etiqueta canonical, para mejorar indexación.

### 3.5 Seguridad y privacidad

- Cabeceras de seguridad configuradas en `vercel.json`: X-Content-Type-Options, Referrer-Policy, Permissions-Policy y una Content-Security-Policy estricta.
- Cámara y micrófono son opcionales y solo se activan por acción explícita del usuario; el análisis de audio no graba ni envía la señal.
- **Fortaleza destacada:** para un gremio que maneja datos de socixs, este diseño sin rastreadores ni backend es una ventaja reputacional y legal.

### 3.6 Hallazgos menores / mantenimiento

| Hallazgo | Severidad | Recomendación |
|---|---|---|
| Falta robots.txt y sitemap.xml | Media | Agregar ambos en `/public` para indexación y SEO. |
| Dependencias con rangos abiertos (^) y Vite 8 muy reciente | Media | Fijar versiones exactas para builds reproducibles y estables. |
| Sin pruebas automatizadas ni linter en el repo | Baja | Opcional: añadir ESLint y un par de tests si el sitio crecerá. |
| `Logo IME.png` en la raíz del repo no se usa en la web | Baja | Es solo un asset versionado; el que sirve la web está en `/public`. Sin acción urgente. |
| Sin etiqueta canonical | Baja | Agregar `<link rel="canonical">` apuntando al dominio definitivo. |

---

## 4. Las notas: cómo funcionan y dónde están los datos

La función de notas es el widget flotante y arrastrable rotulado "Notas". Permite a cada persona escribir una nota por sección mientras revisa la presentación. El contador ("Notas N") muestra cuántas secciones tienen una nota escrita.

**Dónde se guardan**

Las notas se almacenan exclusivamente en el almacenamiento local del navegador (`localStorage`), bajo la clave `ime-conecta-slide-notes`. Lo mismo ocurre con la posición del widget y las preferencias visuales (tema, paneles). El propio pie de página del sitio lo declara: *"se guardan solo en localStorage… sitio estático sin analytics, cookies ni backend"*.

**Qué implica esto**

- **Privadas por diseño:** las notas nunca salen del dispositivo de la persona ni llegan a IME.
- **No recolectables:** hoy es imposible leer, exportar o consolidar las notas de los usuarios, porque no existen en ningún servidor.
- **Por dispositivo:** si la persona cambia de navegador o computador, o borra los datos del navegador, sus notas se pierden.

Si IME necesita que las notas sean recopilables (por ejemplo, recoger comentarios del Directorio sobre cada sección), eso requiere agregar un backend con almacenamiento en la nube — ver el Plan B de la sección 7.

---

## 5. ¿Se puede saber si alguien se logeó?

No, porque el sitio no tiene sistema de login. Es un sitio estático de acceso público: cualquiera con el enlace lo abre directamente, sin usuario ni contraseña. No hay autenticación, sesiones ni cuentas.

En el historial del repositorio aparece un commit llamado "Conecta cliente Supabase", pero la revisión del código confirma que no quedó ninguna integración de Supabase activa: no está entre las dependencias ni se invoca en el código. En la práctica, no hay nada que registre quién entra.

Para responder "quién accedió" o "quién hizo qué" hace falta incorporar autenticación (login). Eso se cubre en el Plan B.

---

## 6. Plan A — Medir visitas (analíticas)

Si el objetivo es entender el uso del sitio (cuántas personas lo visitan, qué secciones se ven más, desde qué país o dispositivo), no se necesita login: basta con activar analíticas de visitas. Es la opción más simple y de menor esfuerzo.

**Situación actual**

El sitio no tiene analíticas. Vercel muestra "edge requests" (peticiones crudas), que no equivalen a visitantes reales ni distinguen páginas.

**Recomendación: Vercel Web Analytics**

- Respeta la privacidad: no usa cookies y es compatible con normativas como GDPR; coherente con el enfoque actual del sitio.
- Se integra en minutos por ser un proyecto ya alojado en Vercel.
- Entrega: visitantes únicos, vistas de página, páginas más vistas, referentes, países y tipos de dispositivo.

**Pasos para activarlo**

1. En Vercel, en el proyecto ime-conecta, abrir la pestaña "Analytics" y activarlo.
2. Instalar el paquete `@vercel/analytics` en el proyecto (un cambio chico de código).
3. Agregar el componente `<Analytics />` a la app y hacer commit + push (GitHub Desktop).
4. A las pocas horas empiezan a verse los datos en el panel de Vercel.

Esfuerzo estimado: bajo (se puede dejar implementado en una sesión corta). Alternativa equivalente y también respetuosa con la privacidad: Plausible Analytics.

| Qué responde | Plan A (analíticas) |
|---|---|
| ¿Cuántas personas visitan? | Sí |
| ¿Qué secciones se ven más? | Sí (por vistas de página/eventos) |
| ¿Desde dónde / qué dispositivo? | Sí |
| ¿Quién específicamente (identidad)? | No (es anónimo, por diseño) |
| ¿Leer las notas de la gente? | No |

---

## 7. Plan B — Login + notas en la nube

Si IME necesita saber quién accede (identidad) y/o recolectar las notas de forma centralizada, se requiere convertir el sitio de "estático" a "con backend": agregar autenticación (login) y una base de datos en la nube.

**Arquitectura recomendada: Supabase**

- **Autenticación:** login por correo (enlace mágico) o usuario/contraseña, para identificar a cada persona del Directorio o socix.
- **Base de datos (Postgres):** una tabla de notas asociada a cada usuario y sección, de modo que las notas se guarden en la nube y sean consultables.
- **Registro de acceso:** con login es posible registrar quién entró y cuándo.

**Consideraciones importantes**

- **Privacidad y consentimiento:** hoy el sitio promete explícitamente que "no hay backend ni cookies". Si se agrega login y se guardan datos, hay que actualizar ese mensaje y, como gremio, definir finalidad, consentimiento y resguardo de datos personales.
- **Esfuerzo:** medio-alto. Implica desarrollo, pruebas y una política de datos, no solo un interruptor.
- **Fricción para el usuario:** pasar de "abrir y leer" a "crear cuenta e iniciar sesión" puede reducir el uso espontáneo; conviene evaluar si realmente se necesita identidad o basta con analíticas anónimas.

| Objetivo | Necesita | Esfuerzo | Impacto privacidad |
|---|---|---|---|
| Contar visitas | Plan A (analíticas) | Bajo | Mínimo (anónimo) |
| Saber qué secciones gustan | Plan A (eventos) | Bajo | Mínimo |
| Saber quién accede (identidad) | Plan B (login) | Medio-alto | Alto: requiere consentimiento |
| Recolectar notas de la gente | Plan B (login + BD) | Alto | Alto: datos personales |

---

## 8. Recomendaciones priorizadas

Propuesta de orden, de mayor a menor relación valor/esfuerzo:

| Prioridad | Acción | Esfuerzo |
|---|---|---|
| 1 | Agregar robots.txt + sitemap.xml y etiqueta canonical (SEO). | Bajo |
| 2 | Activar analíticas de visitas (Vercel Web Analytics) — Plan A. | Bajo |
| 3 | Fijar versiones de dependencias para builds estables. | Bajo |
| 4 | Revisión fina de contraste y foco de teclado (accesibilidad). | Bajo-medio |
| 5 | Decidir si se necesita login/notas en la nube — Plan B (con política de datos). | Alto |

---

## 9. Cierre y próximos pasos

El sitio está en buen estado técnico y desplegado correctamente. Las mejoras de mayor impacto inmediato son de bajo esfuerzo (SEO básico y analíticas de visitas), y permitirían empezar a entender el uso sin comprometer la privacidad. La incorporación de login y notas en la nube es perfectamente factible, pero es una decisión estratégica que conviene tomar con su correspondiente política de datos, dado el rol de IME como gremio.

Cualquiera de estas mejoras —especialmente el Plan A— se puede dejar implementada en una próxima sesión. Basta con indicar por dónde avanzar.
