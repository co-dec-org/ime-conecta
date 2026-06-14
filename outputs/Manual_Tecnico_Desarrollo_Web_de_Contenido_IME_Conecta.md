# Manual tecnico de desarrollo web de contenido

Basado e inspirado en la experiencia de IME Conecta  
Version: 1.0  
Fecha: 2026-06-13  
URL de referencia: https://ime-conecta.vercel.app

## 1. Proposito del manual

Este manual define una metodologia tecnica para desarrollar webs de contenido institucional con experiencia de lectura, presentacion y gestion operativa. Toma como caso base la web IME Conecta, una aplicacion estatica construida con React, TypeScript y Vite, orientada a presentar una propuesta de gobernanza operacional mediante laminas navegables, busqueda, modo oscuro/claro, notas locales, documentos descargables y capas demostrativas con Web Video API y Web Audio API.

El objetivo no es documentar solo una implementacion puntual. La meta es dejar una guia reutilizable para crear sitios de contenido que funcionen como:

- Presentaciones web navegables.
- Documentos institucionales vivos.
- Landing pages de trabajo, no solo promocionales.
- Herramientas ligeras para reuniones, directorios, comites o equipos.
- Bases futuras para plataformas internas mas completas.

## 2. Principios de diseno y desarrollo

### 2.1 Contenido primero

La web debe organizarse desde el contenido, no desde componentes decorativos. Cada seccion debe responder a una funcion clara:

- Abrir contexto.
- Plantear problema.
- Mostrar diagnostico.
- Explicar propuesta.
- Detallar modelo operativo.
- Identificar riesgos.
- Definir ruta.
- Cerrar con acuerdos o documentos.

En IME Conecta, esta logica se implementa mediante un arreglo centralizado de secciones. El sitio completo se renderiza desde esa fuente de datos.

### 2.2 Interfaz como soporte institucional

La interfaz debe sentirse sobria, precisa y confiable. En proyectos institucionales conviene evitar efectos visuales que distraigan del contenido. La energia visual debe estar en:

- Jerarquia tipografica clara.
- Ritmo de lectura.
- Contraste suficiente.
- Navegacion evidente.
- Transiciones suaves.
- Estados interactivos comprensibles.

### 2.3 Sitio estatico, comportamiento rico

Una web estatica puede tener mucha interaccion sin requerir backend. IME Conecta usa:

- `localStorage` para preferencias y notas.
- Fullscreen API para presentacion.
- Web Video API para capturas locales.
- Canvas API para procesar imagen.
- Web Audio API para visualizacion sonora.
- Clipboard API para copiar resumen.

Esto permite entregar una experiencia potente sin analytics, cookies ni servicios externos.

## 3. Stack recomendado

El stack base del proyecto es intencionalmente liviano:

```json
{
  "framework": "React",
  "language": "TypeScript",
  "bundler": "Vite",
  "deploy": "Vercel",
  "runtime": "Static client-side app"
}
```

### 3.1 Dependencias principales

- `react`: render de componentes.
- `react-dom`: montaje de la aplicacion.
- `typescript`: tipos, validacion y contrato de datos.
- `vite`: desarrollo local y build.

### 3.2 Scripts minimos

```bash
npm install
npm run dev
npm run build
npm run preview
npx vercel --prod
```

## 4. Arquitectura general

La arquitectura recomendada separa cinco capas:

```text
src/
  data/
    content.ts          Fuente editorial estructurada
  components/
    *.tsx               Componentes visuales y funcionales
  hooks/
    *.ts                Estado, modo presentacion, almacenamiento y APIs
  utils/
    *.ts                Utilidades reutilizables
  styles.css            Sistema visual, responsive y modos
```

### 4.1 Flujo de render

```text
content.ts
  -> App.tsx
    -> HeroSection
    -> IndexSection
    -> ContentSection
      -> StrategyTable / Timeline / DecisionCards / VideoLayer
    -> SectionNav
    -> SearchPanel
    -> PresentationControls
    -> FloatingNotes
```

El patron clave es que `App.tsx` no contiene el contenido editorial principal. Solo decide como se presenta cada bloque.

## 5. Modelo de contenido

El modelo base de seccion es declarativo. Cada seccion puede activar distintos layouts segun sus campos:

```ts
export type SectionContent = {
  id: string;
  navLabel: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  authors?: string[];
  body?: string;
  definition?: string;
  highlight?: string;
  bullets?: string[];
  cards?: string[];
  blocks?: string[];
  phrases?: string[];
  table?: TableData;
  comparison?: {
    leftTitle: string;
    rightTitle: string;
    rows: [string, string][];
  };
  flow?: string[];
  timeline?: TimelineItem[];
  questions?: string[];
  agreements?: string[];
  searchTags?: string[];
};
```

### 5.1 Campos obligatorios

- `id`: identificador unico. Se usa para anclas, navegacion, busqueda y notas.
- `navLabel`: nombre corto para indice.
- `title`: titulo principal de la lamina.

### 5.2 Campos editoriales

- `body`: argumento principal.
- `definition`: expansion conceptual.
- `highlight`: frase destacada en bloque.
- `bullets`: lista de puntos.
- `phrases`: frases de cierre o afirmaciones breves.
- `searchTags`: sinonimos o palabras clave para mejorar busqueda.

### 5.3 Campos estructurales

- `cards`: grilla de tarjetas.
- `blocks`: chips o bloques conceptuales.
- `table`: tabla simple.
- `comparison`: tabla de dos columnas.
- `flow`: pasos de modelo o gobernanza.
- `timeline`: ruta temporal.
- `questions`: tarjetas para deliberacion.
- `agreements`: tarjetas para acuerdos.

## 6. Guia para escribir contenido web institucional

### 6.1 Una idea por lamina

Cada seccion debe defender una sola idea principal. Si una seccion intenta explicar diagnostico, solucion, riesgos y ruta al mismo tiempo, debe dividirse.

Estructura recomendada:

```text
Titulo claro
Subtitulo opcional
Parrafo de contexto
Frase destacada
Evidencia, tabla, lista o matriz
```

### 6.2 Titulos orientados a decision

Evitar titulos genericos como:

```text
Antecedentes
Informacion
Comentarios
Varios
```

Preferir titulos con tension o posicion:

```text
El cuello de botella es operacional
Ordenar para crecer
IME Link 2027 como sujeto de prueba estrategico
Riesgos si no se ordena
```

### 6.3 Busqueda desde el contenido

Cada seccion debe tener `searchTags`. Esto permite que el usuario encuentre contenido aunque use terminos distintos a los visibles en pantalla.

Ejemplo:

```ts
searchTags: [
  "web video api",
  "camara",
  "avatar",
  "boleta",
  "rendicion",
  "gestion operativa",
]
```

## 7. Sistema visual

### 7.1 Tokens CSS

El sistema visual debe vivir en variables CSS. Esto permite cambiar modo oscuro, modo claro y colores de marca sin reescribir componentes.

Ejemplo conceptual:

```css
:root {
  --bg: #0b0614;
  --surface: #1a1026;
  --text: #f5efff;
  --muted: #c8b8da;
  --cyan: #a855f7;
  --line: rgba(168, 85, 247, 0.28);
  --radius: 8px;
}
```

### 7.2 Modo oscuro

En un modo oscuro institucional:

- El fondo debe ser profundo, no negro plano.
- El color principal debe tener contraste real.
- Las tablas deben mantener legibilidad sobre fondos oscuros.
- Los botones no deben depender solo de color; tambien deben usar peso, borde y estado.

### 7.3 Modo claro

En modo claro:

- Evitar texto gris claro sobre fondos pastel.
- Usar fondos suaves, pero texto de alto contraste.
- Reservar el color de marca para acciones, enfasis y estados.

### 7.4 Grilla y fondo

La grilla de fondo funciona como lenguaje de sistema, arquitectura y planificacion. Debe ser sutil:

- Bajo contraste.
- Sin competir con texto.
- Animacion lenta o desactivable.
- Respeto a `prefers-reduced-motion`.

## 8. Navegacion y modos de lectura

### 8.1 Modo lectura

El modo lectura permite explorar el documento como landing vertical. Debe priorizar:

- Header visible.
- Indice desplegable.
- Busqueda.
- Scroll libre.
- Secciones legibles.

### 8.2 Modo presentacion

El modo presentacion convierte la web en deck navegable. Debe priorizar:

- Contenido centrado.
- Controles flotantes.
- Indice colapsado o secundario.
- Teclado con flechas.
- Progreso por seccion.

### 8.3 Fullscreen

Fullscreen debe esconder elementos que compitan con la lamina:

- Header.
- Barra de progreso fija.
- Rail lateral.
- Elementos secundarios.

Los componentes centrales deben escalar hasta un ancho controlado, por ejemplo `80vw`, para no romper lectura en pantallas grandes.

## 9. Transiciones y movimiento

IME Conecta usa una transicion custom con curva logistica para navegar entre laminas. La intencion es simular aceleracion y desaceleracion natural.

Patron recomendado:

```ts
const logisticEase = (progress: number) => {
  const intensity = 5.8;
  const sigmoid = (value: number) =>
    1 / (1 + Math.exp(-intensity * (value - 0.5)));
  const start = sigmoid(0);
  const end = sigmoid(1);

  return (sigmoid(progress) - start) / (end - start);
};
```

Reglas:

- Cancelar animaciones previas antes de iniciar otra.
- Respetar `prefers-reduced-motion`.
- Ajustar duracion segun distancia.
- No animar si la distancia es menor a 2px.

## 10. Componentes clave

### 10.1 `ContentSection`

Renderiza una lamina segun el contenido disponible. Es el componente mas importante para escalar la web, porque evita duplicar layouts manuales.

Responsabilidades:

- Titulo, subtitulo y cuerpo.
- Highlight de busqueda.
- Bloques condicionales.
- Tablas, listas, flujos, timeline y tarjetas.
- Accesibilidad mediante `aria-labelledby`.

### 10.2 `SectionNav`

Indice navegable. Debe:

- Mostrar todas las secciones.
- Indicar seccion activa.
- Reflejar resultados de busqueda.
- Ser colapsable en modos de presentacion.

### 10.3 `SearchPanel`

Busqueda local. Recorre contenido visible y metadatos:

- Titulo.
- Etiqueta de navegacion.
- Cuerpo.
- Listas.
- Tablas.
- Preguntas.
- Tags.

### 10.4 `FloatingNotes`

Notas flotantes por lamina. Patron recomendado:

- Boton flotante movible.
- Panel colapsable.
- Textarea asociado a la seccion activa.
- Boton explicito `Enviar nota`.
- Feedback visible `Nota enviada`.
- Persistencia local por `section.id`.

Estas notas no se envian a un servidor. Funcionan como apoyo local para reuniones, revisiones o presentaciones.

### 10.5 `PresentationControls`

Controla:

- Anterior.
- Siguiente.
- Modo lectura/presentacion.
- Fullscreen.
- Indicador de avance.

Debe estar flotante y visible solo cuando el contexto lo justifique.

## 11. Web Video API como capa operativa

La capa Web Video API permite demostrar capacidades reales del navegador para gestion operacional.

Casos de uso:

- Foto de avatar para ficha de socio/a.
- Captura de boleta para rendicion.
- Evidencia visual de una accion administrativa.
- Validacion de encuadre mediante Canvas.
- Descarga local de imagen.

### 11.1 Principios de privacidad

- La camara debe activarse solo por accion explicita.
- La captura debe procesarse localmente.
- No subir imagenes sin consentimiento.
- Mostrar mensajes claros de estado.
- Permitir detener la camara.

### 11.2 Flujo tecnico recomendado

```text
Usuario activa demo
  -> getUserMedia solicita camara
  -> video muestra stream local
  -> canvas captura frame
  -> se genera Blob PNG
  -> se descarga archivo local
```

## 12. Web Audio API como capa sensorial

La capa Web Audio API puede aportar experiencia sin convertir el sitio en espectaculo. En una web institucional, debe usarse como demostracion funcional:

- Visualizador de nivel de audio.
- Generacion sonora local.
- Microfono opcional.
- Canvas para espectro o pulso.
- Botones claros para iniciar y detener.

Reglas:

- Nunca iniciar audio sin accion del usuario.
- Ofrecer estado visible.
- Detener audio al cambiar de modo si corresponde.
- No grabar ni transmitir sin autorizacion explicita.

## 13. Persistencia local

IME Conecta usa `localStorage` para:

- Tema visual.
- Estado del indice.
- Notas por lamina.
- Posicion del widget de notas.
- Estado abierto/cerrado del panel.

Patron recomendado:

```ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = window.localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // La app debe seguir funcionando sin almacenamiento.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

## 14. Accesibilidad

Checklist minimo:

- Usar `section` con `aria-labelledby`.
- Los botones deben tener texto o `aria-label`.
- No depender solo de color para estados.
- Respetar `prefers-reduced-motion`.
- Evitar overlays que bloqueen lectura.
- Mantener foco visible.
- No capturar teclas cuando el usuario escribe en inputs o textarea.
- Contraste suficiente en tablas, botones y encabezados.

## 15. Responsive design

### 15.1 Desktop

- Contenido maximo controlado.
- Rail lateral flotante o colapsable.
- Controles de presentacion abajo a la derecha.
- Tablas con ancho suficiente.

### 15.2 Mobile

- Header apilado.
- Botones en grilla.
- Indice colapsable.
- Panel de notas con ancho `calc(100vw - margen)`.
- Evitar tablas demasiado anchas; permitir scroll si es necesario.
- Reducir altura de textarea si tapa acciones clave.

## 16. Documentos descargables

La seccion de cierre debe listar documentos asociados. Para proyectos institucionales se recomienda:

- Documento editable (`.docx` o `.html`, segun fuente real).
- Version de lectura (`.pdf`).
- Presentacion editable (`.pptx`).

El componente debe leer una lista de documentos desde datos, no hardcodear enlaces en JSX.

Ejemplo:

```ts
export const documentLinks = [
  {
    label: "Informe DOCX",
    meta: "Documento editable",
    path: "/docs/informe.docx",
  },
];
```

## 17. Seguridad y privacidad

Para una web estatica institucional:

- No incluir analytics si no son necesarios.
- No usar cookies sin politica.
- No subir capturas locales sin consentimiento.
- No persistir datos sensibles en texto plano si exceden el uso local.
- Indicar claramente que notas y preferencias quedan en el navegador.
- Separar demostraciones Web API de funciones productivas reales.

## 18. Build, QA y despliegue

### 18.1 Desarrollo local

```bash
npm install
npm run dev
```

### 18.2 Validacion

```bash
npm run build
npm run preview
```

El build debe pasar:

- TypeScript sin errores.
- Vite build exitoso.
- Assets generados en `dist`.

### 18.3 Despliegue

```bash
npx vercel --prod
```

Antes de publicar:

- Revisar modo oscuro.
- Revisar modo claro.
- Revisar mobile.
- Revisar fullscreen.
- Revisar busqueda.
- Revisar notas.
- Revisar enlaces de descarga.
- Revisar consola sin errores criticos.

## 19. Checklist editorial para nuevas secciones

Antes de agregar una seccion:

- Tiene una idea principal clara.
- El titulo se entiende sin contexto.
- El parrafo inicial no supera lo necesario.
- La seccion tiene formato adecuado: lista, tabla, timeline, tarjetas o frase.
- Tiene `searchTags`.
- El contenido no repite una seccion anterior.
- Se entiende en modo lectura y en fullscreen.
- No depende de una explicacion oral para funcionar.

## 20. Template para nueva lamina

```ts
{
  id: "nueva-seccion",
  navLabel: "Nueva seccion",
  title: "Titulo orientado a decision",
  subtitle: "Subtitulo opcional",
  body:
    "Parrafo breve que explica el contexto, problema o propuesta principal.",
  highlight:
    "Frase fuerza que sintetiza la idea central de la lamina.",
  bullets: [
    "Punto clave uno.",
    "Punto clave dos.",
    "Punto clave tres.",
  ],
  searchTags: [
    "sinonimo",
    "tema",
    "palabra clave",
  ],
}
```

## 21. Template para tabla

```ts
{
  id: "matriz",
  navLabel: "Matriz",
  title: "Matriz de decisiones",
  table: {
    columns: ["Problema", "Respuesta", "Responsable"],
    rows: [
      ["Informacion dispersa", "Repositorio unico", "Secretaria tecnica"],
      ["Acuerdos sin seguimiento", "Matriz de acuerdos", "Directorio"],
    ],
  },
  searchTags: ["matriz", "seguimiento", "responsables"],
}
```

## 22. Template para timeline

```ts
{
  id: "ruta",
  navLabel: "Ruta",
  title: "Ruta de implementacion",
  timeline: [
    {
      label: "0 dias",
      items: [
        "Confirmar proyecto foco.",
        "Definir responsable.",
      ],
    },
    {
      label: "30 dias",
      items: [
        "Activar piloto.",
        "Ordenar documentacion.",
      ],
    },
  ],
  searchTags: ["ruta", "implementacion", "plazos"],
}
```

## 23. Criterios para convertir una web de contenido en herramienta

Una web de contenido empieza a ser herramienta cuando incorpora:

- Busqueda interna.
- Notas vinculadas a secciones.
- Copia rapida de resumen.
- Descargas.
- Modo presentacion.
- Captura local.
- Estados persistentes.
- Navegacion por teclado.

Estas funciones no reemplazan un sistema interno, pero permiten validar comportamiento, lenguaje y necesidades antes de invertir en una plataforma mas compleja.

## 24. Ruta de evolucion recomendada

### Fase 1: Sitio estatico

- Contenido centralizado.
- Navegacion.
- Busqueda.
- Modos visuales.
- Descargas.

### Fase 2: Herramienta local

- Notas por lamina.
- Capturas locales.
- Exportacion de notas.
- Preferencias persistentes.

### Fase 3: Plataforma interna

- Autenticacion.
- Roles.
- Base de datos.
- Matriz de acuerdos real.
- Registro de proyectos.
- Gestion documental.
- Auditoria y trazabilidad.

## 25. Resumen tecnico

IME Conecta demuestra que una presentacion institucional puede funcionar como una aplicacion web de contenido: combina narrativa, navegacion, modos de lectura, controles de presentacion, persistencia local y capacidades nativas del navegador.

La clave tecnica es mantener el contenido estructurado, los componentes declarativos, los estilos tokenizados y las interacciones acotadas. Con esa base, el sitio puede crecer sin perder claridad editorial ni estabilidad tecnica.

