const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat
} = require("docx");

const CW = 9026; // content width A4 con márgenes de 1"
const INK = "1A1916", MUTE = "6B6256", LINE = "CFC7B8";
const HEADFILL = "163B45", HEADTXT = "FFFFFF";
const ACCENT = "1F6F78";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function run(text, o = {}) { return new TextRun({ text, font: "Arial", ...o }); }
function P(text, o = {}) {
  return new Paragraph({
    spacing: { after: o.after != null ? o.after : 120, line: 276 },
    alignment: o.align,
    children: Array.isArray(text) ? text : [run(text, o)],
    ...(o.keepNext ? { keepNext: true } : {}),
    ...(o.keepLines ? { keepLines: true } : {})
  });
}
function H1(text, opts = {}) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, keepLines: true,
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
    spacing: { before: 280, after: 120 }, children: [run(text, { bold: true, size: 26, color: ACCENT })] });
}
function H2(text) {
  return new Paragraph({ keepNext: true, keepLines: true, spacing: { before: 180, after: 70 },
    children: [run(text, { bold: true, size: 23, color: INK })] });
}
function ref(parts) {
  return new Paragraph({ spacing: { after: 90, line: 268 }, indent: { left: 480, hanging: 480 },
    children: parts });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 60, line: 270 },
    children: Array.isArray(text) ? text : [run(text, { size: 21 })] });
}
function hCell(text, w) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: HEADFILL, type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ spacing: { after: 0 }, children: [run(text, { bold: true, color: HEADTXT, size: 20 })] })] });
}
function bCell(text, w, fill) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: [run(text, { size: 20 })] })] });
}
function table(cols, header, rows) {
  const head = new TableRow({ tableHeader: true, cantSplit: true,
    children: header.map((t, i) => hCell(t, cols[i])) });
  const body = rows.map((r, ri) => new TableRow({ cantSplit: true,
    children: r.map((t, i) => bCell(t, cols[i], ri % 2 ? "F4F1EA" : undefined)) }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: cols, rows: [head, ...body] });
}
const spacer = (h = 80) => new Paragraph({ spacing: { after: h }, children: [] });

// ---------- contenido ----------
const children = [];

// Encabezado / título
children.push(new Paragraph({ spacing: { after: 40 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
  children: [ run("IME CHILE A.G.", { bold: true, size: 18, color: MUTE }),
              new TextRun({ text: "\tInforme técnico", font: "Arial", size: 18, color: MUTE }) ],
  tabStops: [{ type: "right", position: CW }] }));
children.push(new Paragraph({ spacing: { before: 200, after: 40 },
  children: [run("Desarrollo estético de la gráfica viva", { bold: true, size: 40, color: INK })] }));
children.push(P([run("Skin generativo para las plataformas web IME — Conecta · Planificación Estratégica · Link 2027", { size: 24, color: ACCENT })], { after: 60 }));
children.push(P([run("Versión 01 · 28 de junio de 2026 · Documento preparado para el Directorio de IME Chile A.G.", { size: 18, color: MUTE, italics: true })], { after: 160 }));

// 1. Resumen ejecutivo
children.push(H1("1. Resumen ejecutivo"));
children.push(P("Las plataformas web de IME dejan de ser una presentación estática para convertirse en una gráfica viva: una imagen generativa de fondo cuya estética se modula con el uso real de cada sitio y con el contexto de quien lo visita. El resultado es una identidad digital propia de IME, distinta para cada proyecto pero construida con un mismo motor técnico, sin dependencias externas y respetuosa de la privacidad y la accesibilidad."));
children.push(P("Este informe documenta el concepto, el modelo de diseño, la técnica empleada y el estado del desarrollo. El motor ya está implementado y probado; resta su integración en cada sitio y la conexión con la base de datos común de IME."));

// 2. Concepto
children.push(H1("2. Concepto: una web que responde"));
children.push(P("El contenido es público y se puede recorrer de forma anónima, sin fricción. Quien quiere participar —comentar o tomar notas— se registra. Sobre esa base se construye un bucle: lo que la comunidad hace en el sitio genera datos, y esos datos vuelven a pintar la propia página. La web deja de ser un folleto y pasa a ser un organismo que refleja a su comunidad."));

// 3. Modelo
children.push(H1("3. Modelo de diseño: radio FM"));
children.push(P([run("La metáfora rectora es la transmisión por frecuencia modulada (FM): ", {}), run("el colectivo es la portadora", { bold: true }), run(" (la señal estable y compartida) y ", {}), run("la persona es quien modula", { bold: true }), run(" esa señal con su navegación, su contexto y su voz. La estética se ordena en tres niveles:", {})]));
children.push(table([1900, 3463, 3663],
  ["Nivel", "Qué es", "De qué datos"],
  [
    ["Emisión", "La portadora compartida, igual para todos", "Actividad agregada y anónima del sitio"],
    ["Recepción", "Cómo recibes esa señal según tu contexto", "Estación del año, hora local, dispositivo"],
    ["Voz", "Lo que tú aportas e identifica tu huella", "Navegación, permanencia y notas (registrado)"]
  ]));
children.push(spacer());
children.push(P("La imagen práctica: es la misma transmisión de IME, recibida distinto según dónde estés, a qué hora y con qué equipo —como sintonizar una estación desde otra ciudad."));

// 4. Variables
children.push(H1("4. Variables que modulan la imagen", { pageBreakBefore: true }));
children.push(P("Cada variable controla una dimensión visual independiente, para que su efecto sea legible y no se mezcle con las demás:"));
children.push(table([2200, 3013, 3813],
  ["Variable", "Fuente", "Efecto estético"],
  [
    ["Colectivo", "Uso agregado del sitio", "Densidad, brillo y ritmo del campo (portadora)"],
    ["Individuo", "Navegación y notas", "Turbulencia / deformación del campo (modulación)"],
    ["Estación", "Hemisferio + fecha", "Paleta y calidad de luz (fría ↔ cálida)"],
    ["Hora local", "Reloj del visitante", "De visión nocturna a plena diurna"],
    ["Dispositivo", "Equipo de acceso", "Textura y grano de la imagen"]
  ]));
children.push(spacer());
children.push(P("La luz cruza estación y hora: una noche de invierno tiñe en azul profundo; una de verano, en azul cálido; el día de invierno da luz helada y el de verano, luz dorada."));

// 5. Identidad por proyecto
children.push(H1("5. Una piel por proyecto, un solo motor"));
children.push(P("El mismo motor genera una identidad de color estable para cada proyecto, que se mantiene todo el año mientras la estación y la hora solo modulan la luz:"));
children.push(table([3100, 3500, 2426],
  ["Proyecto", "Identidad visual", "Estado"],
  [
    ["IME Conecta", "Campo violeta–magenta", "Aprobado"],
    ["IME Planificación Estratégica", "Campo ámbar–naranja", "Aprobado"],
    ["IME Link 2027", "Campo cian–esmeralda", "Aprobado"]
  ]));
children.push(P([run("Identidades visuales definidas y aprobadas por co-dec.", { size: 19, color: MUTE, italics: true })], { after: 60 }));

// 6. Técnica e implementación
children.push(H1("6. Técnica e implementación"));

children.push(H2("6.1 Cómo se genera la imagen"));
children.push(P([run("La imagen es un ", {}), run("campo continuo", { bold: true }), run(" dibujado por un ", {}), run("fragment shader en WebGL", { bold: true }), run(": un pequeño programa que la tarjeta gráfica ejecuta en paralelo para cada píxel, en tiempo real. La textura base se construye sumando varias capas de ruido a distinta escala —técnica conocida como ", {}), run("fBm", { bold: true }), run("—, lo que produce un aspecto orgánico. Sobre ella se aplica ", {}), run("domain warping", { bold: true }), run(" (alimentar el ruido con coordenadas deformadas por otro ruido), que es lo que le da el movimiento vivo y fluido, sin que se repita.", {})]));

children.push(H2("6.2 Cómo los datos modulan la estética"));
children.push(P([run("Cada variable entra al shader como un parámetro (", {}), run("uniform", { italics: true }), run("). El ", {}), run("colectivo", { bold: true }), run(" controla la escala, el brillo y el ritmo del campo (la portadora); el ", {}), run("individuo", { bold: true }), run(" controla la intensidad del domain warping (la modulación). La identidad de cada proyecto se fija con una rotación de color ", {}), run("estable", { bold: true }), run("; de forma separada, la estación y la hora —calculadas desde el reloj del dispositivo y el hemisferio— aplican una capa de luz (temperatura y brillo) sobre esa identidad. Separar ", {}), run("identidad", { italics: true }), run(" (color del proyecto) de ", {}), run("luz", { italics: true }), run(" (contexto) evita que la imagen pierda su sello al cambiar la estación.", {})]));

children.push(H2("6.3 Cómo se integra en los sitios"));
children.push(P([run("El motor es un ", {}), run("único módulo JavaScript sin dependencias", { bold: true }), run(" (", {}), run("IMESkin.mount", { font: "Courier New", size: 20 }), run("). Cada sitio lo incluye y lo monta como fondo fijo detrás del contenido. Las fuentes de datos son funciones conectables: hoy usan valores base y, al enlazar la base de datos común, leerán el ", {}), run("agregado anónimo", { bold: true }), run(" del sitio (colectivo) y la ", {}), run("sesión", { bold: true }), run(" de la persona (individuo) sin modificar el motor.", {})]));

children.push(H2("6.4 Calidad, accesibilidad y privacidad"));
children.push(bullet([run("Legibilidad: ", { bold: true, size: 21 }), run("velo y control de intensidad que garantizan el contraste del texto sobre la imagen.", { size: 21 })]));
children.push(bullet([run("Rendimiento: ", { bold: true, size: 21 }), run("la animación se pausa cuando el fondo no está a la vista o la pestaña queda oculta, y el lienzo solo se recalcula al cambiar de tamaño.", { size: 21 })]));
children.push(bullet([run("Accesibilidad: ", { bold: true, size: 21 }), run("respeta la preferencia del sistema de movimiento reducido y degrada de forma silenciosa si no hay WebGL.", { size: 21 })]));
children.push(bullet([run("Privacidad: ", { bold: true, size: 21 }), run("usa contexto grueso (hemisferio, hora, tipo de dispositivo); nunca ubicación precisa ni datos identificables.", { size: 21 })]));

// 7. Datos
children.push(H1("7. Datos y cumplimiento"));
children.push(P("La portadora colectiva se alimenta de un agregado anónimo e irreversible (que deja de ser dato personal), proveniente de una base de datos común a los tres proyectos IME. La captura de cualquier traza, aun anónima, queda condicionada al consentimiento y al aviso de privacidad ya redactados, y por proyecto."));

// 8. Estado y próximos pasos
children.push(H1("8. Estado y próximos pasos"));
children.push(bullet([run("Motor del skin: ", { bold: true, size: 21 }), run("implementado, probado y documentado.", { size: 21 })]));
children.push(bullet([run("Identidades: ", { bold: true, size: 21 }), run("las tres definidas y aprobadas por co-dec (violeta-magenta, ámbar-naranja y cian-esmeralda).", { size: 21 })]));
children.push(bullet([run("Pendiente: ", { bold: true, size: 21 }), run("integrar el motor en cada sitio y conectar la base de datos común (Supabase).", { size: 21 })]));
children.push(bullet([run("Decisión sugerida al Directorio: ", { bold: true, size: 21 }), run("aprobar la consolidación de cuentas para los tres proyectos (una base de datos y un alojamiento comunes).", { size: 21 })]));

// 9. Referencias (APA 7)
children.push(H1("9. Referencias"));
const rs = 20;
children.push(ref([ run("González Vivo, P., & Lowe, J. (2015). ", { size: rs }), run("The Book of Shaders", { size: rs, italics: true }), run(". https://thebookofshaders.com/", { size: rs }) ]));
children.push(ref([ run("Quílez, I. (2002). ", { size: rs }), run("Domain warping", { size: rs, italics: true }), run(". https://iquilezles.org/articles/warp/", { size: rs }) ]));
children.push(ref([ run("Quílez, I. (s. f.). ", { size: rs }), run("Fbm — more noise", { size: rs, italics: true }), run(". https://iquilezles.org/articles/morenoise/", { size: rs }) ]));
children.push(ref([ run("IME Chile A.G. (2026a). ", { size: rs }), run("Visión: web IME como plataforma generativa (estética modulada por uso)", { size: rs, italics: true }), run(" [Informe técnico interno].", { size: rs }) ]));
children.push(ref([ run("IME Chile A.G. (2026b). ", { size: rs }), run("Referencia técnica: The Book of Shaders como base del skin generativo", { size: rs, italics: true }), run(" [Informe técnico interno].", { size: rs }) ]));
children.push(ref([ run("IME Chile A.G. (2026c). ", { size: rs }), run("Bitácora de arquitectura y diseño del skin generativo", { size: rs, italics: true }), run(" [Documento interno].", { size: rs }) ]));
children.push(ref([ run("IME Chile A.G. (2026d). ", { size: rs }), run("Modelo de datos unificado: base de usuarios compartida", { size: rs, italics: true }), run(" [Informe técnico interno].", { size: rs }) ]));

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 22, color: INK } } } },
  numbering: { config: [ { reference: "b", levels: [ { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } } ] } ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
      tabStops: [{ type: "right", position: CW }],
      children: [ run("IME Chile A.G. — Gráfica viva", { size: 16, color: MUTE }),
                  new TextRun({ text: "\tPágina ", font: "Arial", size: 16, color: MUTE }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MUTE }) ] }) ] }) },
    children
  }]
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync("informe.docx", b); console.log("docx OK", b.length, "bytes"); });
