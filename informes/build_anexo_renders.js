const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, ImageRun
} = require("docx");

const CW = 9026;
const INK = "1A1916", MUTE = "6B6256", LINE = "CFC7B8", ACCENT = "1F6F78";
const IMGW = 282, IMGH = 159;

function run(text, o = {}) { return new TextRun({ text, font: "Arial", ...o }); }
function P(text, o = {}) {
  return new Paragraph({ spacing: { after: o.after != null ? o.after : 120, line: 276 }, alignment: o.align,
    children: Array.isArray(text) ? text : [run(text, o)] });
}
function H1(text, opts = {}) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, keepLines: true,
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
    spacing: { before: 200, after: 60 }, children: [run(text, { bold: true, size: 26, color: ACCENT })] });
}

function imgCell(file, caption) {
  const img = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [ new ImageRun({ type: "png", data: fs.readFileSync(file),
      transformation: { width: IMGW, height: IMGH },
      altText: { title: caption, description: caption, name: caption } }) ] });
  const cap = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [run(caption, { size: 18, color: MUTE })] });
  return new TableCell({ width: { size: 4513, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [img, cap] });
}
function grid(prefix) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [4513, 4513],
    rows: [
      new TableRow({ cantSplit: true, children: [ imgCell(`renders/${prefix}_verano.png`, "Verano · 12:00"), imgCell(`renders/${prefix}_otono.png`, "Otoño · 12:00") ] }),
      new TableRow({ cantSplit: true, children: [ imgCell(`renders/${prefix}_invierno.png`, "Invierno · 12:00"), imgCell(`renders/${prefix}_primavera.png`, "Primavera · 12:00") ] })
    ] });
}

const children = [];
// Portada / intro
children.push(new Paragraph({ spacing: { after: 40 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
  children: [ run("IME CHILE A.G.", { bold: true, size: 18, color: MUTE }),
              new TextRun({ text: "\tAnexo del informe técnico", font: "Arial", size: 18, color: MUTE }) ],
  tabStops: [{ type: "right", position: CW }] }));
children.push(new Paragraph({ spacing: { before: 200, after: 40 }, children: [run("Anexo A — Renders del skin por proyecto y estación", { bold: true, size: 36, color: INK })] }));
children.push(P([run("Imágenes fijas del campo generativo para cada proyecto IME, a las 12:00 y en las cuatro estaciones del año.", { size: 22, color: ACCENT })], { after: 60 }));
children.push(P([run("Anexo de “Desarrollo estético de la gráfica viva” · Versión 01 · 28 de junio de 2026", { size: 18, color: MUTE, italics: true })], { after: 160 }));

children.push(P([run("Nota metodológica: ", { bold: true }), run("renders generados con el motor del skin (mismo shader del sitio), hemisferio sur, a las 12:00. A mediodía el día está pleno, por lo que la diferencia entre estaciones es de paleta y temperatura de luz —de la luz helada del invierno a la luz cálida del verano—. Los equinoccios (otoño y primavera) comparten una temperatura de luz cercana por diseño del modelo; se usan valores estacionales representativos.", {})]));

const projects = [
  { id: "conecta", name: "IME Conecta", identity: "Campo violeta–magenta" },
  { id: "planificacion", name: "IME Planificación Estratégica", identity: "Campo ámbar–naranja" },
  { id: "link", name: "IME Link 2027", identity: "Campo cian–esmeralda" }
];
for (const p of projects) {
  children.push(H1(p.name, { pageBreakBefore: true }));
  children.push(P([run("Identidad: ", { bold: true, size: 21 }), run(p.identity + " · aprobada por co-dec.", { size: 21 })], { after: 140 }));
  children.push(grid(p.id));
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 22, color: INK } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
      tabStops: [{ type: "right", position: CW }],
      children: [ run("IME Chile A.G. — Anexo: gráfica viva", { size: 16, color: MUTE }),
                  new TextRun({ text: "\tPágina ", font: "Arial", size: 16, color: MUTE }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MUTE }) ] }) ] }) },
    children
  }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync("anexo.docx", b); console.log("anexo.docx OK", b.length); });
