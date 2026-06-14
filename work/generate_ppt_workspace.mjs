import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "work/content.json");
const workspace = path.join(
  root,
  "outputs/manual-ime-conecta-docs/presentations/ime-conecta-gobernanza",
);
const slidesDir = path.join(workspace, "slides");
const qaDir = path.join(workspace, "qa");
const outputDir = path.join(root, "public/docs");

const content = JSON.parse(await fs.readFile(contentPath, "utf8"));

await fs.mkdir(slidesDir, { recursive: true });
await fs.mkdir(qaDir, { recursive: true });
await fs.mkdir(path.join(workspace, "preview"), { recursive: true });
await fs.mkdir(path.join(workspace, "layout"), { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const claims = {
  portada: "IME Conecta propone una infraestructura interna para sostener la nueva escala gremial.",
  indice: "La presentacion avanza desde diagnostico operacional hacia acuerdos directivos.",
  "punto-partida": "La nueva escala exige estructura operacional antes de seguir creciendo.",
  "mirada-macro": "La musica electronica chilena ya opera como ecosistema productivo y cultural.",
  problema: "El problema central no es la falta de ideas, sino la falta de trazabilidad operativa.",
  analisis: "Cada dolor operacional requiere una respuesta de gestion concreta.",
  concepto: "Ordenar la infraestructura interna tambien es una decision estrategica.",
  "ime-conecta": "IME Conecta organiza personas, acuerdos, documentos y avance institucional.",
  "usabilidad-web": "La Web-Video API puede resolver tareas operativas simples sin backend.",
  sercotec: "Sercotec permite financiar una primera etapa concreta de IME Conecta.",
  "ime-link": "IME Link 2027 funciona como caso real para probar la infraestructura.",
  gobernanza: "El modelo separa estrategia, carteras, comites y operacion valorizable.",
  carteras: "Las carteras directivas distribuyen conduccion y seguimiento por area.",
  separacion: "Profesionalizar al sector exige distinguir trabajo directivo y operativo.",
  "datos-activos": "Datos, archivos y activos digitales requieren gobernanza y seguridad.",
  riesgos: "No ordenar la operacion aumenta sobrecarga, dependencia y riesgo institucional.",
  ruta: "La implementacion puede avanzar por hitos de 15, 30 y 90 dias.",
  discusion: "La sesion debe validar diagnostico, foco y proximos ajustes.",
  acuerdos: "La propuesta deja materias concretas para eventual votacion.",
  cierre: "Ordenar para crecer es la condicion minima para sostener la nueva escala.",
};

const deckData = {
  ...content,
  claims,
};

await fs.writeFile(
  path.join(workspace, "deck-data.mjs"),
  `export default ${JSON.stringify(deckData, null, 2)};\n`,
  "utf8",
);

await fs.writeFile(
  path.join(workspace, "profile-plan.txt"),
  [
    "task mode: create",
    "primary deck-profile: strategy-leadership (base route; auxiliary profile file unavailable in installed package)",
    "audience: Directorio de IME Chile",
    "required proof objects: problem grid, response matrix, operating model flow, web-video use case, roadmap, decision questions",
    "brand constraints: no fabricated official logo; use institutional typography, IME text mark only, palette from the web app",
    "QA gates: editable PPTX, 20 slides, render previews, no overflow, no repeated slide rhythm for long runs",
  ].join("\n"),
  "utf8",
);

await fs.writeFile(
  path.join(workspace, "claim-spine.txt"),
  deckData.sections
    .map((section, index) => {
      const claim = claims[section.id] || section.title;
      return `${String(index + 1).padStart(2, "0")} | ${section.navLabel}: ${claim}`;
    })
    .join("\n"),
  "utf8",
);

await fs.writeFile(
  path.join(workspace, "design-system.txt"),
  [
    "slide size: 1280x720",
    "background: dark institutional field with subtle grid/rules",
    "typography: Aptos Display for claims, Aptos for labels/body",
    "palette: #080808, #2e2d32, #15e9cd, #1370ef, #6755d1, #83f0e2, #fff8af",
    "layout families: cover, index map, bullet proof, matrix, flow, timeline, decision list, close",
    "container grammar: rectangular panels with restrained line weight; no decorative pseudo-logos",
    "footer: section number and short source label",
  ].join("\n"),
  "utf8",
);

await fs.writeFile(
  path.join(workspace, "contact-sheet-plan.txt"),
  [
    "01 cover / thesis",
    "02 index map",
    "03-05 diagnosis proof slides",
    "06 response matrix",
    "07 concept divider",
    "08 platform blocks",
    "09 web-video use case",
    "10 funding opportunity",
    "11 comparison proof",
    "12 governance flow",
    "13-16 operating tables/matrices",
    "17 roadmap",
    "18-19 deliberation and agreements",
    "20 close",
  ].join("\n"),
  "utf8",
);

const helper = String.raw`
import data from "./deck-data.mjs";

const C = {
  bg: "#080808",
  panel: "#111820",
  panel2: "#1d1c22",
  text: "#eff1f5",
  muted: "#b3c8ee",
  cyan: "#15e9cd",
  blue: "#1370ef",
  violet: "#6755d1",
  green: "#83f0e2",
  amber: "#fff8af",
  line: "#285a68",
};

function short(text = "", max = 150) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

function addRule(slide, ctx, x, y, w, color = C.cyan, h = 2) {
  return ctx.addShape(slide, { x, y, width: w, height: h, fill: color, line: ctx.line("#00000000", 0) });
}

function addBg(slide, ctx, index) {
  ctx.addShape(slide, { x: 0, y: 0, width: ctx.W, height: ctx.H, fill: C.bg, line: ctx.line("#00000000", 0) });
  for (let x = 0; x < ctx.W; x += 80) {
    ctx.addShape(slide, { x, y: 0, width: 1, height: ctx.H, fill: "#102832", line: ctx.line("#00000000", 0) });
  }
  for (let y = 0; y < ctx.H; y += 72) {
    ctx.addShape(slide, { x: 0, y, width: ctx.W, height: 1, fill: "#102832", line: ctx.line("#00000000", 0) });
  }
  ctx.addShape(slide, { x: 0, y: 0, width: 14, height: ctx.H, fill: index % 3 === 0 ? C.cyan : index % 3 === 1 ? C.blue : C.violet, line: ctx.line("#00000000", 0) });
}

function addKicker(slide, ctx, section, index) {
  ctx.addShape(slide, { name: "kicker-marker", x: 48, y: 38, width: 11, height: 11, fill: C.cyan, line: ctx.line("#00000000", 0) });
  ctx.addText(slide, {
    name: "kicker-label",
    text: (String(index + 1).padStart(2, "0") + " · " + section.navLabel).toUpperCase(),
    x: 68,
    y: 28,
    width: 420,
    height: 30,
    fontSize: 13,
    bold: true,
    color: C.cyan,
    valign: "middle",
  });
}

function addTitle(slide, ctx, text, y = 76, size = 38, width = 880) {
  ctx.addText(slide, {
    text,
    x: 48,
    y,
    width,
    height: 112,
    fontSize: size,
    bold: true,
    color: C.text,
    typeface: ctx.fonts.title,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function addFooter(slide, ctx, index) {
  addRule(slide, ctx, 48, 668, 1184, "#173844", 1);
  ctx.addText(slide, {
    text: "IME Conecta · Gobernanza operacional",
    x: 48,
    y: 678,
    width: 360,
    height: 22,
    fontSize: 11,
    color: C.muted,
    valign: "middle",
  });
  ctx.addText(slide, {
    text: String(index + 1).padStart(2, "0") + " / " + String(data.sections.length).padStart(2, "0"),
    x: 1120,
    y: 678,
    width: 112,
    height: 22,
    fontSize: 11,
    color: C.muted,
    align: "right",
    valign: "middle",
  });
}

function addBodyRail(slide, ctx, text, x = 48, y = 200, w = 480, h = 156) {
  const clean = short(text, 360);
  const fontSize = clean.length > 260 ? 18 : clean.length > 180 ? 19 : 21;
  ctx.addShape(slide, { x, y, width: w, height: h, fill: "#101920", line: ctx.line(C.line, 1) });
  ctx.addText(slide, {
    text: clean,
    x: x + 22,
    y: y + 16,
    width: w - 44,
    height: h - 32,
    fontSize,
    color: C.muted,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

function addCallout(slide, ctx, text, x, y, w, h, color = C.green) {
  const clean = short(text, 240);
  const fontSize = clean.length > 170 ? 17 : clean.length > 110 ? 18 : 20;
  const pad = clean.length > 170 ? 12 : 16;
  ctx.addShape(slide, { x, y, width: 6, height: h, fill: color, line: ctx.line("#00000000", 0) });
  ctx.addShape(slide, { x: x + 10, y, width: w - 10, height: h, fill: "#15222a", line: ctx.line(C.line, 1) });
  ctx.addText(slide, {
    text: clean,
    x: x + 28,
    y: y + pad,
    width: w - 46,
    height: h - pad * 2,
    fontSize,
    bold: true,
    color,
  });
}

function addBullets(slide, ctx, items, x, y, w, max = 7) {
  const list = items.slice(0, max);
  list.forEach((item, i) => {
    const top = y + i * 50;
    ctx.addShape(slide, { x, y: top + 8, width: 10, height: 10, fill: i % 2 ? C.blue : C.cyan, line: ctx.line("#00000000", 0) });
    ctx.addText(slide, {
      text: short(item, 94),
      x: x + 26,
      y: top,
      width: w - 26,
      height: 44,
      fontSize: 19,
      color: C.text,
      valign: "middle",
    });
  });
}

function addChipGrid(slide, ctx, items, x, y, w, cols = 3, max = 12) {
  const gap = 12;
  const chipW = (w - gap * (cols - 1)) / cols;
  const chipH = 56;
  items.slice(0, max).forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = x + col * (chipW + gap);
    const top = y + row * (chipH + gap);
    ctx.addShape(slide, { x: left, y: top, width: chipW, height: chipH, fill: "#111b23", line: ctx.line(i % 2 ? C.blue : C.cyan, 1) });
    ctx.addText(slide, {
      text: short(item, 36),
      x: left + 14,
      y: top + 10,
      width: chipW - 28,
      height: chipH - 20,
      fontSize: 16,
      bold: true,
      color: C.text,
      valign: "middle",
    });
  });
}

function addTable(slide, ctx, columns, rows, x, y, w, maxRows = 6) {
  const count = columns.length;
  const gap = 0;
  const cellW = w / count;
  const headerH = 42;
  const rowH = Math.min(count > 2 ? 72 : 62, (594 - y - headerH) / Math.max(1, Math.min(maxRows, rows.length)));
  columns.forEach((column, i) => {
    ctx.addShape(slide, { x: x + i * cellW, y, width: cellW - gap, height: headerH, fill: "#15313b", line: ctx.line(C.cyan, 1) });
    ctx.addText(slide, { text: short(column, 32), x: x + i * cellW + 10, y: y + 7, width: cellW - 20, height: headerH - 14, fontSize: 13, bold: true, color: C.cyan, valign: "middle" });
  });
  rows.slice(0, maxRows).forEach((row, r) => {
    row.slice(0, count).forEach((cell, c) => {
      const left = x + c * cellW;
      const top = y + headerH + r * rowH;
      ctx.addShape(slide, { x: left, y: top, width: cellW - gap, height: rowH, fill: r % 2 ? "#101920" : "#111d25", line: ctx.line("#234552", 1) });
      ctx.addText(slide, { text: short(cell, count > 2 ? 76 : 120), x: left + 10, y: top + 8, width: cellW - 20, height: rowH - 16, fontSize: count > 2 ? 11 : 14, color: C.text });
    });
  });
}

function addFlow(slide, ctx, steps, x, y, w) {
  const gap = 14;
  const boxW = (w - gap * (steps.length - 1)) / steps.length;
  steps.forEach((step, i) => {
    const left = x + i * (boxW + gap);
    ctx.addShape(slide, { x: left, y, width: boxW, height: 116, fill: "#111d25", line: ctx.line(i === steps.length - 1 ? C.green : C.cyan, 1.2) });
    ctx.addText(slide, { text: String(i + 1).padStart(2, "0"), x: left + 12, y: y + 12, width: 44, height: 24, fontSize: 13, bold: true, color: C.cyan });
    ctx.addText(slide, { text: short(step, 62), x: left + 12, y: y + 42, width: boxW - 24, height: 62, fontSize: 15, bold: true, color: C.text });
    if (i < steps.length - 1) {
      addRule(slide, ctx, left + boxW, y + 58, gap, C.blue, 2);
    }
  });
}

function addTimeline(slide, ctx, timeline, x, y, w) {
  const gap = 14;
  const laneW = (w - gap * (timeline.length - 1)) / timeline.length;
  timeline.forEach((item, i) => {
    const left = x + i * (laneW + gap);
    ctx.addShape(slide, { x: left, y, width: laneW, height: 292, fill: "#111d25", line: ctx.line(i === 0 ? C.cyan : i === timeline.length - 1 ? C.green : C.blue, 1.2) });
    ctx.addText(slide, { text: item.label, x: left + 14, y: y + 14, width: laneW - 28, height: 34, fontSize: 20, bold: true, color: C.cyan });
    ctx.addText(slide, { text: item.items.slice(0, 4).map((line) => "• " + short(line, 55)).join("\n"), x: left + 14, y: y + 62, width: laneW - 28, height: 210, fontSize: 14, color: C.text });
  });
}

function addIndex(slide, ctx, index) {
  const items = data.sections.slice(2).map((s, i) => String(i + 1).padStart(2, "0") + "  " + s.navLabel);
  addChipGrid(slide, ctx, items, 56, 178, 1168, 4, 18);
}

function addWebVideo(slide, ctx) {
  ctx.addShape(slide, { x: 624, y: 168, width: 548, height: 292, fill: "#05090d", line: ctx.line(C.cyan, 2) });
  for (let x = 654; x < 1148; x += 58) addRule(slide, ctx, x, 168, 1, "#12313c", 292);
  for (let y = 204; y < 440; y += 52) addRule(slide, ctx, 624, y, 548, "#12313c", 1);
  ctx.addText(slide, { text: "Canvas local", x: 656, y: 196, width: 188, height: 30, fontSize: 16, bold: true, color: C.cyan });
  ctx.addShape(slide, { x: 852, y: 240, width: 94, height: 94, fill: "#14252d", line: ctx.line(C.green, 2) });
  ctx.addText(slide, { text: "Avatar", x: 862, y: 275, width: 74, height: 24, fontSize: 16, bold: true, color: C.text, align: "center" });
  ctx.addShape(slide, { x: 982, y: 226, width: 116, height: 150, fill: "#182128", line: ctx.line(C.amber, 2) });
  ctx.addText(slide, { text: "Boleta", x: 998, y: 285, width: 84, height: 24, fontSize: 16, bold: true, color: C.text, align: "center" });
  addCallout(slide, ctx, "Captura PNG local. No se sube a servidor.", 624, 486, 548, 72, C.green);
}

export async function addDeckSlide(presentation, ctx, index) {
  const section = data.sections[index];
  const slide = presentation.slides.add();
  addBg(slide, ctx, index);
  addKicker(slide, ctx, section, index);
  const claim = data.claims[section.id] || section.title;

  if (section.id === "portada") {
    addTitle(slide, ctx, claim, 116, 45, 940);
    ctx.addText(slide, { text: section.subtitle, x: 54, y: 270, width: 660, height: 86, fontSize: 25, color: C.muted });
    addCallout(slide, ctx, "Tesis: a mayor envergadura gremial, mayor necesidad de estructura operacional.", 54, 410, 640, 92, C.cyan);
    ctx.addText(slide, { text: "Patricio Gonzalez Cruz · Director y Tesorero IME Chile", x: 54, y: 548, width: 660, height: 32, fontSize: 16, color: C.text });
  } else {
    addTitle(slide, ctx, claim, 72, claim.length > 92 ? 32 : 38, 1040);
    if (section.id === "indice") {
      addIndex(slide, ctx, index);
    } else {
      const proofX = 580;
      if (section.id === "usabilidad-web") {
        addBodyRail(slide, ctx, section.body, 54, 206, 480, 156);
        addBullets(slide, ctx, section.bullets || [], 64, 404, 470, 4);
        addWebVideo(slide, ctx);
      } else if (section.table) {
        const tableIntro = section.body || section.definition || section.highlight || (section.bullets || []).slice(0, 3).join(" ") || "Matriz de trabajo para ordenar decisiones, riesgos y responsabilidades.";
        addBodyRail(slide, ctx, tableIntro, 54, 206, 470, 144);
        addTable(slide, ctx, section.table.columns, section.table.rows, proofX, 188, 616, section.id === "riesgos" ? 8 : 6);
      } else if (section.comparison) {
        addBodyRail(slide, ctx, section.definition || section.body || "", 54, 206, 470, 168);
        addTable(slide, ctx, [section.comparison.leftTitle, section.comparison.rightTitle], section.comparison.rows, proofX, 190, 616, 6);
      } else if (section.flow) {
        const flowIntro = section.body || section.highlight || (section.bullets || []).slice(0, 3).join(" ");
        addBodyRail(slide, ctx, flowIntro, 54, 206, 510, 146);
        addFlow(slide, ctx, section.flow, 70, 424, 1100);
      } else if (section.timeline) {
        addBodyRail(slide, ctx, section.body || "Ruta de implementacion por horizontes de decision.", 54, 188, 520, 122);
        addTimeline(slide, ctx, section.timeline, 54, 344, 1116);
      } else if (section.cards || section.blocks) {
        addBodyRail(slide, ctx, section.body || section.highlight || "", 54, 206, 470, 144);
        addChipGrid(slide, ctx, section.cards || section.blocks, proofX, 188, 600, 2, 10);
      } else if (section.questions || section.agreements) {
        addBodyRail(slide, ctx, section.body || "", 54, 188, 500, 122);
        addBullets(slide, ctx, section.questions || section.agreements, 610, 188, 560, 6);
      } else if (section.phrases) {
        section.phrases.slice(0, 4).forEach((phrase, i) => addCallout(slide, ctx, phrase, 88 + i * 24, 190 + i * 96, 960, 70, i % 2 ? C.blue : C.cyan));
      } else {
        addBodyRail(slide, ctx, section.body || section.definition || "", 54, 210, 540, 180);
        if (section.bullets) addBullets(slide, ctx, section.bullets, 650, 200, 530, 6);
      }

      if (section.highlight && !section.table && !section.comparison && section.id !== "usabilidad-web") {
        const calloutHeight = section.highlight.length > 150 ? 92 : 72;
        const calloutY = section.highlight.length > 150 ? 538 : 558;
        addCallout(slide, ctx, section.highlight, 54, calloutY, 1078, calloutHeight, C.green);
      }
    }
  }

  addFooter(slide, ctx, index);
  return slide;
}
`;

await fs.writeFile(path.join(workspace, "deck-helpers.mjs"), helper, "utf8");

for (let index = 0; index < content.sections.length; index += 1) {
  const slideNumber = String(index + 1).padStart(2, "0");
  await fs.writeFile(
    path.join(slidesDir, `slide-${slideNumber}.mjs`),
    `import { addDeckSlide } from "../deck-helpers.mjs";\n\nexport async function slide${slideNumber}(presentation, ctx) {\n  return addDeckSlide(presentation, ctx, ${index});\n}\n`,
    "utf8",
  );
}

console.log(
  JSON.stringify(
    {
      workspace,
      slidesDir,
      previewDir: path.join(workspace, "preview"),
      layoutDir: path.join(workspace, "layout"),
      outputDir,
      slideCount: content.sections.length,
    },
    null,
    2,
  ),
);
