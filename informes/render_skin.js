// Render CPU del skin IME (replica del fragment shader ime-skin.js) -> PNG.
const fs = require("fs");
const { PNG } = require("pngjs");

const W = 512, H = 288, TIME = 6.0, DEV = 1.0, DAY = 1.0, INTENSITY = 1.0;

const fract = x => x - Math.floor(x);
const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const mix = (a, b, t) => a + (b - a) * t;
function smooth(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

function hash(x, y) {
  let px = fract(x * 123.34), py = fract(y * 345.45);
  const d = px * (px + 34.345) + py * (py + 34.345);
  px += d; py += d;
  return fract(px * py);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return mix(a, b, ux) + (c - a) * uy * (1 - ux) + (d - b) * ux * uy;
}
function fbm(x, y) {
  let v = 0, a = 0.5;
  for (let i = 0; i < 6; i++) { v += a * noise(x, y); x *= 2; y *= 2; a *= 0.5; }
  return v;
}
function hueShift(c, h) {
  const s = 0.57735, ca = Math.cos(h * 6.2831), si = Math.sin(h * 6.2831);
  const dotkc = s * (c[0] + c[1] + c[2]);
  const cr = [s * (c[2] - c[1]), s * (c[0] - c[2]), s * (c[1] - c[0])];
  return [c[0] * ca + cr[0] * si + s * dotkc * (1 - ca),
          c[1] * ca + cr[1] * si + s * dotkc * (1 - ca),
          c[2] * ca + cr[2] * si + s * dotkc * (1 - ca)];
}
function sat(c, sv) {
  const l = c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  return [mix(l, c[0], sv), mix(l, c[1], sv), mix(l, c[2], sv)];
}

function renderPixel(px, py, hue, col, mod, warmth) {
  const aspect = W / H;
  let sx = (px + 0.5) / W, sy = (H - 1 - py + 0.5) / H; sx *= aspect;
  const eCol = smooth(0, 1, col), eMod = mod * mod, eDay = smooth(0, 1, DAY), eW = smooth(0.05, 0.95, warmth);
  const t = TIME * (0.03 + 0.10 * eCol);
  const scale = mix(1.1, 6.0, eCol);
  const qx = fbm(sx * scale + t, sy * scale + t);
  const qy = fbm(sx * scale + 5.2 - t, sy * scale + 1.3 - t);
  const warp = 1 + 7 * eMod;
  const rx = fbm(sx * scale + qx * warp + 1.7 + t, sy * scale + qy * warp + 9.2 + t);
  const ry = fbm(sx * scale + qx * warp + 8.3 - t, sy * scale + qy * warp + 2.8 - t);
  let f = fbm(sx * scale + rx * warp, sy * scale + ry * warp);
  f = mix(f, Math.abs(f - 0.5) * 2, eMod * 0.6);
  const bg = [0.067, 0.063, 0.059], cyan = [0.373, 0.843, 0.875], coral = [0.941, 0.447, 0.384], gold = [0.929, 0.784, 0.365];
  let fld = bg.slice();
  const m1 = clamp(f * f * 1.6, 0, 1); fld = [mix(fld[0], coral[0], m1), mix(fld[1], coral[1], m1), mix(fld[2], coral[2], m1)];
  const m2 = clamp(Math.sqrt(qx * qx + qy * qy) * 0.6, 0, 1); fld = [mix(fld[0], gold[0], m2), mix(fld[1], gold[1], m2), mix(fld[2], gold[2], m2)];
  const m3 = clamp(Math.pow(f, 4) * 1.7, 0, 1); fld = [mix(fld[0], cyan[0], m3), mix(fld[1], cyan[1], m3), mix(fld[2], cyan[2], m3)];
  fld = hueShift(fld, hue);
  fld = sat(fld, mix(0.95, 1.2, eW));
  const nC = [0.42, 0.30, 0.52], nW = [0.66, 0.46, 0.74], dC = [0.92, 0.96, 1.08], dW = [1.16, 1.04, 0.86];
  const tint = [
    mix(mix(nC[0], nW[0], eW), mix(dC[0], dW[0], eW), eDay),
    mix(mix(nC[1], nW[1], eW), mix(dC[1], dW[1], eW), eDay),
    mix(mix(nC[2], nW[2], eW), mix(dC[2], dW[2], eW), eDay)
  ];
  fld = [fld[0] * tint[0], fld[1] * tint[1], fld[2] * tint[2]];
  const cb = mix(0.80, 1.25, eCol); fld = [fld[0] * cb, fld[1] * cb, fld[2] * cb];
  fld = [(fld[0] - 0.5) * 1.08 + 0.5, (fld[1] - 0.5) * 1.08 + 0.5, (fld[2] - 0.5) * 1.08 + 0.5];
  const g = (hash(px + TIME, py + TIME) - 0.5) * 0.10 * (1 - DEV * 0.85);
  fld = [fld[0] + g, fld[1] + g, fld[2] + g];
  const vx = sx - 0.5 * aspect, vy = sy - 0.5, vig = 1 - 0.55 * (vx * vx + vy * vy);
  fld = [fld[0] * vig, fld[1] * vig, fld[2] * vig];
  fld = [mix(bg[0], fld[0], INTENSITY), mix(bg[1], fld[1], INTENSITY), mix(bg[2], fld[2], INTENSITY)];
  return [clamp(fld[0], 0, 1) * 255, clamp(fld[1], 0, 1) * 255, clamp(fld[2], 0, 1) * 255];
}

function render(file, hue, col, mod, warmth) {
  const png = new PNG({ width: W, height: H });
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const c = renderPixel(px, py, hue, col, mod, warmth);
      const i = (py * W + px) * 4;
      png.data[i] = c[0]; png.data[i + 1] = c[1]; png.data[i + 2] = c[2]; png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log("ok", file);
}

const OUT = "renders";
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const projects = [
  { id: "conecta", hue: 0.6667, col: 0.30, mod: 0.20 },
  { id: "planificacion", hue: 0.00, col: 0.50, mod: 0.35 },
  { id: "link", hue: 0.45, col: 0.72, mod: 0.55 }
];
const seasons = [
  { id: "verano", w: 0.95 }, { id: "otono", w: 0.45 },
  { id: "invierno", w: 0.05 }, { id: "primavera", w: 0.55 }
];
for (const p of projects)
  for (const s of seasons)
    render(`${OUT}/${p.id}_${s.id}.png`, p.hue, p.col, p.mod, s.w);
console.log("DONE", projects.length * seasons.length, "imágenes");
