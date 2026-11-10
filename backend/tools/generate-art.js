// Generates 125 SVG paintings (5 tabs x 25) + merges them into paintings.json
// Run:  node tools/generate-art.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "..", "frontend", "images", "art");
fs.mkdirSync(OUT, { recursive: true });

// ---------- helpers ----------
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => Math.round(n * 10) / 10;
const GREEN = "#2f9e6b", DGREEN = "#1f6b4a";

const PAL = [
  { key: "kumkum", bg1: "#c2243f", bg2: "#ff8a4c", a: "#ffe08a", b: "#fff3d6", c: "#ffb35c", ink: "#fff6e3", dark: "#8f1530" },
  { key: "pasupu", bg1: "#e08a00", bg2: "#ffd25a", a: "#fff1b8", b: "#fffaf0", c: "#e8452c", ink: "#fffaf0", dark: "#a8520a" },
  { key: "neelam", bg1: "#3a4fd0", bg2: "#7fb0ff", a: "#ffe08a", b: "#f0f6ff", c: "#ff7fa3", ink: "#f0f6ff", dark: "#2234a0" },
  { key: "pachcha", bg1: "#1a8f66", bg2: "#8fe0b0", a: "#fff0a8", b: "#f2fff7", c: "#ff8566", ink: "#f2fff7", dark: "#0f6446" },
  { key: "gulabi", bg1: "#d6177f", bg2: "#ff8fc4", a: "#ffe9a0", b: "#fff5fa", c: "#ffa24a", ink: "#fff5fa", dark: "#a00e5e" },
  { key: "peacock", bg1: "#0f8b8d", bg2: "#8ee8d8", a: "#ffe08a", b: "#f0fffc", c: "#ff7a8a", ink: "#f0fffc", dark: "#0a5c63" },
  { key: "jamun", bg1: "#7b2cbf", bg2: "#d9a6ff", a: "#ffe08a", b: "#fbf3ff", c: "#ff9ec4", ink: "#fbf3ff", dark: "#53198c" },
  { key: "sindoor", bg1: "#e63946", bg2: "#ffb199", a: "#fff0a8", b: "#fff7f3", c: "#ffd166", ink: "#fff7f3", dark: "#a3162a" },
];

const flame = (x, y, s, P) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-14" r="26" fill="${P.a}" opacity=".25"/><path d="M0 0 C-12 -10 -8 -26 0 -40 C8 -26 12 -10 0 0Z" fill="${P.c}"/><path d="M0 -2 C-6 -8 -4 -18 0 -26 C4 -18 6 -8 0 -2Z" fill="${P.a}"/></g>`;
const diya = (x, y, s, P) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0 Q0 34 30 0Z" fill="${P.dark}" stroke="${P.a}" stroke-width="2.5"/>${flame(0, -2, 1, P)}</g>`;
const leaf = (x, y, r, s, fill) => `<path d="M0 0 C-14 -14 -14 -34 0 -48 C14 -34 14 -14 0 0Z" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="${fill}"/>`;
const flower = (x, y, r, P, col) => `<g transform="translate(${x} ${y}) scale(${r / 10})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="-9" rx="5" ry="9" fill="${col}" transform="rotate(${a})"/>`).join("")}<circle r="4.5" fill="${P.a}"/></g>`;
const stars = (R, n, col, ymax = 300) => Array.from({ length: n }, () => `<circle cx="${f(R() * 380 + 10)}" cy="${f(R() * ymax + 20)}" r="${f(R() * 1.6 + 0.5)}" fill="${col}" opacity=".8"/>`).join("");
const bird = (x, y, s, col) => `<path d="M${x - 10 * s} ${y} Q${x - 5 * s} ${y - 8 * s} ${x} ${y} Q${x + 5 * s} ${y - 8 * s} ${x + 10 * s} ${y}" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const potBody = (P, fill) => `<path d="M135 330 C135 300 165 300 170 307 H230 C235 300 265 300 265 330 C275 380 245 420 200 420 C155 420 125 380 135 330Z" fill="${fill}" stroke="${P.dark}" stroke-width="3"/><path d="M138 345 Q200 370 262 345" stroke="${P.dark}" stroke-width="3" fill="none"/><path d="M142 372 Q200 398 258 372" stroke="${P.a}" stroke-width="3" fill="none"/>`;
const rays = (cx, cy, r1, r2, n, col) => Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n; return `<line x1="${f(cx + r1 * Math.cos(a))}" y1="${f(cy + r1 * Math.sin(a))}" x2="${f(cx + r2 * Math.cos(a))}" y2="${f(cy + r2 * Math.sin(a))}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`; }).join("");

// ---------- motifs ----------
const MOTIFS = {
  temple: [
    // Gopuram
    (R, P) => {
      const n = 5 + Math.floor(R() * 3);
      let y = 440;
      let s = `<circle cx="200" cy="${f(300 - R() * 40)}" r="${f(70 + R() * 20)}" fill="${P.a}" opacity=".85"/>` + stars(R, 18, P.b, 200);
      s += `<path d="M0 440 H400 V500 H0Z" fill="${P.dark}"/>`;
      for (let i = 0; i < n; i++) {
        const w = 230 - i * (150 / n), h = 38;
        s += `<rect x="${f(200 - w / 2)}" y="${y - h}" width="${f(w)}" height="${h}" fill="${P.dark}" stroke="${P.a}" stroke-width="1.5"/>`;
        const k = Math.max(2, Math.floor(w / 42));
        for (let j = 0; j < k; j++) s += `<rect x="${f(200 - w / 2 + ((j + 0.5) * w) / k - 5)}" y="${y - h + 8}" width="10" height="${h - 16}" rx="5" fill="${P.a}"/>`;
        y -= h;
      }
      s += `<path d="M170 ${y} L200 ${y - 40} L230 ${y}Z" fill="${P.dark}" stroke="${P.a}"/>` + [-9, 0, 9].map((d, i) => `<ellipse cx="${200 + d}" cy="${y - 52 - (i === 1 ? 8 : 0)}" rx="4" ry="${i === 1 ? 12 : 8}" fill="${P.a}"/>`).join("");
      return s;
    },
    // Deepasthambham (lamp stand)
    (R, P) => {
      let s = `<circle cx="200" cy="250" r="170" fill="${P.a}" opacity=".16"/>` + stars(R, 22, P.b, 420);
      s += `<path d="M150 450 L170 420 H230 L250 450Z" fill="${P.dark}" stroke="${P.a}" stroke-width="2"/><rect x="193" y="150" width="14" height="272" fill="${P.dark}" stroke="${P.a}"/>`;
      for (let i = 0; i < 4; i++) {
        const y = 380 - i * 62, w = 130 - i * 24;
        s += `<rect x="${200 - w}" y="${y}" width="${w * 2}" height="6" rx="3" fill="${P.a}"/>` + diya(200 - w, y, 0.55, P) + diya(200 + w, y, 0.55, P);
      }
      return s + diya(200, 148, 0.8, P);
    },
    // Kalasam (sacred pot)
    (R, P) => {
      let s = `<circle cx="200" cy="270" r="150" fill="${P.a}" opacity=".15"/>`;
      [-62, -31, 0, 31, 62].forEach((r, i) => (s += leaf(200, 285, r, 1.5, i % 2 ? GREEN : DGREEN)));
      s += `<circle cx="200" cy="232" r="30" fill="#8a5a2b"/><circle cx="192" cy="226" r="3" fill="#3b2410"/><circle cx="208" cy="226" r="3" fill="#3b2410"/><circle cx="200" cy="238" r="3" fill="#3b2410"/>`;
      s += `<ellipse cx="200" cy="288" rx="38" ry="10" fill="${P.a}" stroke="${P.dark}" stroke-width="2"/>`;
      s += potBody(P, P.a);
      s += Array.from({ length: 5 }, (_, i) => `<circle cx="${160 + i * 20}" cy="${f(362 + Math.sin(i * 1.25) * 10)}" r="3" fill="${P.dark}"/>`).join("");
      return s + `<ellipse cx="200" cy="432" rx="80" ry="14" fill="${P.dark}" opacity=".6"/><ellipse cx="200" cy="427" rx="70" ry="10" fill="${P.b}"/>`;
    },
    // Mandapam (pillared arch)
    (R, P) => {
      let s = stars(R, 16, P.b, 150) + `<rect x="0" y="430" width="400" height="70" fill="${P.dark}"/>`;
      s += Array.from({ length: 8 }, (_, i) => `<path d="M${i * 50} 500 L${i * 50 + 25} 430 L${i * 50 + 50} 500Z" fill="${P.a}" opacity=".25"/>`).join("");
      s += `<path d="M60 430 V210 Q200 10 340 210 V430 H300 V220 Q200 60 100 220 V430Z" fill="${P.dark}" stroke="${P.a}" stroke-width="3"/>`;
      [80, 320].forEach((x) => (s += `<rect x="${x - 17}" y="215" width="34" height="215" fill="${P.dark}" stroke="${P.a}" stroke-width="2"/><rect x="${x - 24}" y="418" width="48" height="14" fill="${P.a}"/><rect x="${x - 24}" y="205" width="48" height="12" fill="${P.a}"/>`));
      for (let i = 0; i <= 6; i++) { const t = i / 6, x = (1 - t) ** 2 * 100 + 2 * (1 - t) * t * 200 + t * t * 300, y = (1 - t) ** 2 * 220 + 2 * (1 - t) * t * 60 + t * t * 220; s += flower(f(x), f(y + 6), 7, P, P.c); }
      return s + `<line x1="200" y1="140" x2="200" y2="236" stroke="${P.a}" stroke-width="2"/><path d="M184 236 H216 L222 266 H178Z" fill="${P.a}"/>` + flame(200, 252, 0.6, P);
    },
    // Ghanta (temple bell)
    (R, P) => {
      let s = `<circle cx="200" cy="300" r="150" fill="${P.a}" opacity=".14"/>` + stars(R, 16, P.b, 200);
      s += `<rect x="60" y="40" width="280" height="14" rx="7" fill="${P.dark}" stroke="${P.a}" stroke-width="2"/>`;
      for (let i = 0; i < 5; i++) s += `<ellipse cx="200" cy="${70 + i * 20}" rx="7" ry="11" fill="none" stroke="${P.a}" stroke-width="3"/>`;
      s += `<circle cx="200" cy="175" r="12" fill="${P.a}"/><path d="M120 380 C120 280 160 200 200 190 C240 200 280 280 280 380Z" fill="${P.a}" stroke="${P.dark}" stroke-width="3"/>`;
      s += `<path d="M112 380 Q200 400 288 380 L292 396 Q200 416 108 396Z" fill="${P.c}" stroke="${P.dark}" stroke-width="3"/>`;
      s += [[300, 140], [335, 128], [362, 118]].map(([y, w]) => `<path d="M${200 - w} ${y} Q200 ${y + 18} ${200 + w} ${y}" stroke="${P.dark}" stroke-width="3" fill="none"/>`).join("");
      s += `<circle cx="200" cy="416" r="14" fill="${P.dark}" stroke="${P.a}" stroke-width="2"/>`;
      return s + Array.from({ length: 7 }, (_, i) => flower(120 + i * 27, f(398 + Math.sin(i) * 3), 7, P, i % 2 ? P.b : P.c)).join("");
    },
  ],
  kalamkari: [
    // Tree of life
    (R, P) => {
      const j = () => R() * 30 - 15;
      let s = `<rect x="26" y="26" width="348" height="448" fill="none" stroke="${P.a}" stroke-dasharray="4 6" opacity=".6"/>`;
      s += `<path d="M200 460 C${f(200 + j() / 2)} 380 ${f(190 + j())} 320 200 250 C208 200 200 170 200 130" stroke="${P.a}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
      [[330, -1, 110], [270, 1, 115], [210, -1, 90], [170, 1, 80]].forEach(([y, d, len], i) => {
        const ex = 200 + d * len, ey = f(y - 60 + j() / 3);
        s += `<path d="M200 ${y} C${200 + d * len * 0.4} ${y - 10} ${200 + d * len * 0.9} ${y - 20} ${ex} ${ey}" stroke="${P.a}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
        s += leaf(ex, ey, d * (30 + R() * 30), 1.1, i % 2 ? P.c : GREEN) + leaf(ex, ey, d * (80 + R() * 20), 0.9, P.b) + flower(ex, ey - 4, 9, P, P.c);
      });
      s += flower(200, 112, 12, P, P.c) + leaf(200, 130, -25, 1, GREEN) + leaf(200, 130, 25, 1, GREEN);
      s += `<g fill="${P.b}"><ellipse cx="110" cy="130" rx="13" ry="8"/><circle cx="121" cy="125" r="5.5"/></g><g fill="${P.c}"><ellipse cx="292" cy="140" rx="13" ry="8"/><circle cx="281" cy="135" r="5.5"/></g>`;
      return s + `<path d="M90 462 C150 440 180 452 200 462 C220 452 250 440 310 462" stroke="${P.a}" stroke-width="8" fill="none"/>`;
    },
    // Peacock
    (R, P) => {
      let s = "";
      for (let i = 0; i < 9; i++) s += `<g transform="translate(200 340) rotate(${-68 + i * 17})"><path d="M0 0 L0 -130" stroke="${GREEN}" stroke-width="3"/><ellipse cy="-160" rx="24" ry="54" fill="${i % 2 ? DGREEN : GREEN}" stroke="${P.a}" stroke-width="1.5"/><circle cy="-190" r="15" fill="${P.a}"/><circle cy="-190" r="10" fill="${P.c}"/><circle cy="-190" r="4.5" fill="${P.dark}"/></g>`;
      s += `<ellipse cx="200" cy="375" rx="32" ry="52" fill="${P.c}" stroke="${P.dark}" stroke-width="2"/><ellipse cx="200" cy="380" rx="18" ry="34" fill="${P.b}" opacity=".5"/>`;
      s += `<path d="M192 335 Q190 295 198 272 L206 272 Q214 295 208 335Z" fill="${P.c}"/><circle cx="202" cy="266" r="14" fill="${P.c}"/><path d="M214 264 L228 268 L214 272Z" fill="${P.a}"/><circle cx="205" cy="263" r="2.5" fill="${P.dark}"/>`;
      s += `<g stroke="${P.a}" stroke-width="2"><path d="M200 254 L192 238"/><path d="M203 253 L203 234"/><path d="M206 254 L214 238"/></g><g fill="${P.a}"><circle cx="192" cy="237" r="3"/><circle cx="203" cy="233" r="3"/><circle cx="214" cy="237" r="3"/></g>`;
      return s + `<path d="M190 418 L184 452 M210 418 L216 452" stroke="${P.a}" stroke-width="3"/><path d="M70 456 h260" stroke="${GREEN}" stroke-width="3"/>`;
    },
    // Paisley (mango motif)
    (R, P) => {
      const body = "M200 70 C340 90 350 300 240 410 C160 490 80 410 125 320 C158 255 110 190 200 70Z";
      let s = "";
      [[1, P.a], [0.8, P.c], [0.6, P.b], [0.4, P.dark], [0.2, P.a]].forEach(([k, c]) => (s += `<path d="${body}" transform="translate(200 280) scale(${k}) translate(-200 -280)" fill="${c}"/>`));
      s += `<path d="${body}" transform="translate(58 90) rotate(-28) scale(.22) translate(-200 -280)" fill="${P.b}"/><path d="${body}" transform="translate(342 420) rotate(152) scale(.22) translate(-200 -280)" fill="${P.c}"/>`;
      return s + flower(340, 90, 14, P, P.b) + flower(60, 430, 14, P, P.c) + `<circle cx="200" cy="250" r="190" fill="none" stroke="${P.a}" stroke-dasharray="2 8" opacity=".6"/>`;
    },
    // Vine (latha)
    (R, P) => {
      const X = (y) => 200 + 75 * Math.sin((470 - y) / 38);
      let d = "";
      for (let y = 470; y >= 60; y -= 5) d += `${y === 470 ? "M" : "L"}${f(X(y))} ${y} `;
      let s = `<path d="${d}" stroke="${P.a}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 9; i++) {
        const y = 440 - i * 40, x = f(X(y)), dir = i % 2 ? 1 : -1;
        s += leaf(x, y, dir * 65, 1.3, i % 3 === 0 ? P.c : GREEN) + leaf(x, y, -dir * 40, 0.8, P.b);
        if (i % 3 === 1) s += flower(x + dir * 30, y - 10, 10, P, P.c);
      }
      return s + flower(f(X(60)), 60, 16, P, P.c);
    },
    // Medallion
    (R, P) => {
      const petals = (n, rx, ry, off, col) => Array.from({ length: n }, (_, i) => `<ellipse cx="0" cy="${-off}" rx="${rx}" ry="${ry}" fill="${col}" stroke="${P.dark}" stroke-width="1.2" transform="rotate(${(i * 360) / n})"/>`).join("");
      let s = `<g transform="translate(200 250)"><circle r="178" fill="none" stroke="${P.a}" stroke-width="2" stroke-dasharray="3 7"/>` + petals(16, 16, 46, 130, P.c) + petals(12, 20, 50, 88, P.b) + petals(8, 18, 38, 52, P.a) + `<circle r="26" fill="${P.dark}"/><circle r="14" fill="${P.a}"/></g>`;
      [[58, 66], [342, 66], [58, 434], [342, 434]].forEach(([x, y]) => (s += flower(x, y, 16, P, P.b)));
      return s;
    },
  ],
  muggu: [
    // Flower muggu
    (R, P) => {
      const n1 = 10 + Math.floor(R() * 4) * 2;
      let s = `<g transform="translate(200 250)" fill="none"><circle r="170" stroke="${P.ink}" stroke-dasharray="2 7" opacity=".7"/><circle r="150" stroke="${P.a}" stroke-width="2"/>`;
      s += Array.from({ length: n1 }, (_, i) => `<ellipse cy="-105" rx="19" ry="42" stroke="${P.ink}" stroke-width="2.2" transform="rotate(${(i * 360) / n1})"/>`).join("");
      s += Array.from({ length: 8 }, (_, i) => `<ellipse cy="-55" rx="14" ry="32" stroke="${P.c}" stroke-width="3" transform="rotate(${i * 45 + 22.5})"/>`).join("");
      return s + `<circle r="20" fill="${P.c}"/><circle r="9" fill="${P.a}"/></g>`;
    },
    // Chukkala muggu (dot lattice)
    (R, P) => {
      const pts = [], set = new Set();
      for (let r = -3; r <= 3; r++) { const n = 7 - 2 * Math.abs(r); for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * 44, y = r * 44; pts.push([x, y]); set.add(`${x},${y}`); } }
      let s = `<g transform="translate(200 250)">`;
      pts.forEach(([x, y]) => [[44, 44], [-44, 44]].forEach(([dx, dy]) => { if (set.has(`${x + dx},${y + dy}`)) s += `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="${P.ink}" stroke-width="2.4"/>`; }));
      pts.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${i % 2 ? P.a : P.c}" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="3.5" fill="${P.ink}"/>`));
      return s + `<circle r="188" fill="none" stroke="${P.a}" stroke-dasharray="2 7" opacity=".7"/></g>`;
    },
    // Star
    (R, P) => {
      const n = [8, 10, 12][Math.floor(R() * 3)];
      const pts = (ro, ri, rot) => Array.from({ length: n * 2 }, (_, i) => { const r = i % 2 ? ri : ro, a = (i * Math.PI) / n + rot; return `${f(r * Math.sin(a))},${f(-r * Math.cos(a))}`; }).join(" ");
      let s = `<g transform="translate(200 250)"><circle r="172" fill="none" stroke="${P.ink}" stroke-dasharray="2 7" opacity=".7"/>`;
      s += `<polygon points="${pts(150, 70, 0)}" fill="none" stroke="${P.a}" stroke-width="3"/><polygon points="${pts(120, 56, Math.PI / n)}" fill="none" stroke="${P.ink}" stroke-width="2"/><polygon points="${pts(85, 40, 0)}" fill="${P.c}" opacity=".85"/>`;
      s += Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n; return `<circle cx="${f(162 * Math.sin(a))}" cy="${f(-162 * Math.cos(a))}" r="4" fill="${P.a}"/>`; }).join("");
      return s + `<circle r="22" fill="${P.dark}"/><circle r="10" fill="${P.a}"/></g>`;
    },
    // Rings (valayam)
    (R, P) => {
      let s = `<g transform="translate(200 250)" fill="none">`;
      for (let i = 0; i < 7; i++) s += `<circle r="${170 - i * 22}" stroke="${i % 2 ? P.a : P.ink}" stroke-width="${i % 2 ? 5 : 2}" ${i % 2 ? 'stroke-dasharray="2 9" stroke-linecap="round"' : ""}/>`;
      s += Array.from({ length: 24 }, (_, i) => { const a = (i * 2 * Math.PI) / 24; return `<circle cx="${f(137 * Math.cos(a))}" cy="${f(137 * Math.sin(a))}" r="4" fill="${P.c}" stroke="none"/>`; }).join("");
      return s + `</g>` + flower(200, 250, 30, P, P.c);
    },
    // Spiral (sudi)
    (R, P) => {
      const spiral = (rot) => { let d = ""; for (let t = 0; t <= 6 * Math.PI; t += 0.1) { const r = t * 8.5, x = r * Math.cos(t + rot), y = r * Math.sin(t + rot); d += `${t === 0 ? "M" : "L"}${f(x)} ${f(y)} `; } return d; };
      let s = `<g transform="translate(200 250)" fill="none" stroke-linecap="round"><circle r="178" stroke="${P.ink}" stroke-dasharray="2 7" opacity=".7"/>`;
      s += `<path d="${spiral(0)}" stroke="${P.ink}" stroke-width="3"/><path d="${spiral(Math.PI)}" stroke="${P.a}" stroke-width="3"/>`;
      s += Array.from({ length: 12 }, (_, i) => { const a = (i * 2 * Math.PI) / 12; return `<circle cx="${f(168 * Math.cos(a))}" cy="${f(168 * Math.sin(a))}" r="4" fill="${P.c}" stroke="none"/>`; }).join("");
      return s + `<circle r="10" fill="${P.c}" stroke="none"/></g>`;
    },
  ],
  festival: [
    // Bathukamma
    (R, P) => {
      const cols = [P.a, P.c, P.b, "#ff7a2f", "#d6246e", P.a];
      let s = `<circle cx="200" cy="260" r="150" fill="${P.a}" opacity=".13"/><ellipse cx="200" cy="424" rx="160" ry="32" fill="${P.a}"/><ellipse cx="200" cy="418" rx="146" ry="26" fill="${P.b}" opacity=".85"/>`;
      [[392, 130, 30], [348, 112, 27], [306, 92, 24], [268, 72, 21], [232, 52, 18], [200, 32, 14]].forEach(([y, rx, ry], i) => (s += `<ellipse cx="200" cy="${y}" rx="${rx}" ry="${ry}" fill="${cols[i]}"/><ellipse cx="200" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="9" stroke-dasharray="3 9"/>`));
      s += `<circle cx="200" cy="178" r="16" fill="${P.c}"/><circle cx="200" cy="178" r="8" fill="${P.a}"/>`;
      return s + diya(95, 120, 0.8, P) + diya(305, 120, 0.8, P) + stars(R, 14, P.b, 300);
    },
    // Deepavali diyas
    (R, P) => {
      let s = `<circle cx="200" cy="260" r="180" fill="${P.a}" opacity=".12"/>` + stars(R, 26, P.b, 460);
      s += `<path d="M0 50 Q100 110 200 50 T400 50" stroke="${P.a}" stroke-width="3" fill="none"/>` + Array.from({ length: 9 }, (_, i) => flower(25 + i * 44, f(70 + (i % 2) * 20), 9, P, i % 2 ? P.c : P.b)).join("");
      [[200, 190, 1.1], [130, 300, 1], [270, 300, 1], [70, 410, 0.95], [200, 410, 0.95], [330, 410, 0.95]].forEach(([x, y, k]) => (s += diya(x, y, k, P)));
      return s;
    },
    // Sankranti kites
    (R, P) => {
      const cols = [P.a, P.c, P.b, P.a, P.c, P.b];
      let s = "";
      [[90, 110, -20], [305, 90, 15], [200, 205, 5], [72, 290, -12], [322, 295, 18], [200, 365, -4]].forEach(([x, y, r], i) => {
        const jx = f(R() * 16 - 8), jy = f(R() * 16 - 8);
        s += `<path d="M${x + jx} ${y + jy + 40} Q${200 + (x - 200) * 0.3} 430 200 520" stroke="${P.ink}" stroke-width="1" fill="none" opacity=".5"/>`;
        s += `<g transform="translate(${x + jx} ${y + jy}) rotate(${r})"><path d="M0 -42 L28 0 L0 58 L-28 0Z" fill="${cols[i]}"/><path d="M0 -42 V58 M-28 0 H28" stroke="${P.dark}" stroke-width="1.5"/><path d="M0 58 Q14 80 0 100 Q-14 118 0 140" stroke="${P.ink}" stroke-width="2" fill="none"/><circle cx="0" cy="86" r="4" fill="${P.c}"/><circle cx="0" cy="118" r="4" fill="${P.a}"/></g>`;
      });
      return s + bird(60, 190, 1, P.ink) + bird(350, 190, 1, P.ink) + bird(280, 400, 0.8, P.ink);
    },
    // Ugadi sunrise garland
    (R, P) => {
      let s = `<circle cx="200" cy="270" r="92" fill="${P.a}"/><circle cx="200" cy="270" r="115" fill="${P.a}" opacity=".25"/>` + rays(200, 270, 125, 160, 20, P.c);
      [60, 300].forEach((y0) => {
        s += `<path d="M0 ${y0} Q200 ${y0 + 130} 400 ${y0}" stroke="${GREEN}" stroke-width="4" fill="none"/>`;
        for (let t = 0.04; t < 1; t += 0.08) { const x = 400 * t, y = y0 * (1 - t) ** 2 + 2 * (y0 + 130 / 2 * 1) * (1 - t) * t + y0 * t * t; s += leaf(f(x), f(y), 180, 1.1, (Math.round(t * 12) % 2) ? GREEN : DGREEN); }
        for (let t = 0.08; t < 1; t += 0.16) { const x = 400 * t, y = y0 * (1 - t) ** 2 + 2 * (y0 + 65) * (1 - t) * t + y0 * t * t; s += flower(f(x), f(y), 9, P, P.c); }
      });
      return s;
    },
    // Pongal pot
    (R, P) => {
      let s = `<circle cx="200" cy="210" r="105" fill="${P.a}"/>` + rays(200, 210, 115, 150, 18, P.c);
      [90, 120, 280, 310].forEach((x, i) => { s += `<line x1="${x}" y1="${i % 2 ? 340 : 360}" x2="${x + (x < 200 ? -8 : 8)}" y2="${i % 2 ? 130 : 150}" stroke="${GREEN}" stroke-width="9" stroke-linecap="round"/>` + [200, 250, 300].map((y) => `<line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="${P.dark}" stroke-width="2"/>`).join("") + leaf(x + (x < 200 ? -8 : 8), i % 2 ? 130 : 150, x < 200 ? -30 : 30, 1.3, DGREEN); });
      s += potBody(P, P.c).replace(/H230/, "H230");
      s += [[165, 306, 16], [190, 296, 20], [218, 298, 18], [240, 308, 14], [205, 282, 14], [178, 284, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.b}"/>`).join("");
      s += `<ellipse cx="200" cy="432" rx="90" ry="14" fill="${P.dark}" opacity=".6"/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${60 + i * 35}" cy="462" r="3" fill="${P.ink}"/>`).join("");
      return s;
    },
  ],
  nature: [
    // Lotus pond
    (R, P) => {
      let s = `<circle cx="200" cy="230" r="150" fill="${P.b}" opacity=".12"/><circle cx="200" cy="230" r="125" fill="none" stroke="${P.a}" stroke-dasharray="3 6" opacity=".7"/>`;
      s += `<ellipse cx="200" cy="420" rx="185" ry="42" fill="${DGREEN}"/><ellipse cx="100" cy="402" rx="75" ry="22" fill="${GREEN}"/><ellipse cx="310" cy="408" rx="70" ry="20" fill="#3b8160"/>`;
      s += `<path d="M30 440 q40 -10 80 0 t80 0 t80 0 t80 0" stroke="${P.b}" stroke-width="2" fill="none" opacity=".5"/>`;
      const petal = `<path d="M0 0 C-42 -50 -34 -130 0 -175 C34 -130 42 -50 0 0Z"/>`;
      s += `<g transform="translate(200 400)">` + [[-75, P.c], [75, P.c], [-50, P.a], [50, P.a], [-25, P.b], [25, P.b], [0, P.b]].map(([r, c]) => `<g transform="rotate(${r})" fill="${c}" stroke="${P.dark}" stroke-opacity=".35">${petal}</g>`).join("") + `<ellipse cy="-30" rx="22" ry="12" fill="${P.a}"/></g>`;
      return s;
    },
    // Mountains at sunrise
    (R, P) => {
      let s = `<circle cx="${f(120 + R() * 160)}" cy="190" r="58" fill="${P.a}"/><circle cx="${f(200)}" cy="190" r="0"/>`;
      [[300, 110, P.b, 0.35], [350, 90, P.dark, 0.55], [405, 70, P.dark, 1]].forEach(([base, amp, c, op]) => {
        let d = `M0 500 L0 ${base}`;
        for (let x = 40; x <= 400; x += 40) d += ` L${x} ${f(base - R() * amp)}`;
        s += `<path d="${d} L400 500Z" fill="${c}" opacity="${op}"/>`;
      });
      return s + bird(90, 90, 1, P.ink) + bird(130, 110, 0.8, P.ink) + bird(300, 80, 1, P.ink) + `<path d="M0 440 Q100 425 200 440 T400 435" stroke="${P.a}" stroke-width="2" fill="none" opacity=".5"/>`;
    },
    // Konaseema palms
    (R, P) => {
      let s = `<circle cx="200" cy="250" r="75" fill="${P.a}"/><circle cx="200" cy="250" r="105" fill="${P.a}" opacity=".2"/><rect y="390" width="400" height="110" fill="${P.dark}" opacity=".7"/>`;
      s += [0, 1, 2, 3].map((i) => `<path d="M0 ${415 + i * 20} q50 -10 100 0 t100 0 t100 0 t100 0" stroke="${P.c}" stroke-width="2.5" fill="none" opacity="${0.8 - i * 0.15}"/>`).join("");
      [[85, 130, -20], [320, 170, 18], [240, 230, 10]].forEach(([x, top, lean]) => {
        s += `<path d="M${x} 400 Q${x + lean * 0.4} ${(400 + top) / 2} ${x + lean} ${top}" stroke="${P.dark}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
        [-165, -140, -115, -90, -65, -40, -15].forEach((deg, i) => { const a = (deg * Math.PI) / 180, tx = x + lean, ex = tx + Math.cos(a) * 75, ey = top + Math.sin(a) * 60 + 30; s += `<path d="M${tx} ${top} Q${f(tx + Math.cos(a) * 45)} ${f(top + Math.sin(a) * 60 - 10)} ${f(ex)} ${f(ey)}" stroke="${i % 2 ? GREEN : DGREEN}" stroke-width="7" fill="none" stroke-linecap="round"/>`; });
      });
      return s + bird(60, 70, 1, P.ink) + bird(100, 90, 0.8, P.ink) + bird(340, 80, 1, P.ink);
    },
    // Paddy field
    (R, P) => {
      let s = `<circle cx="${f(110 + R() * 180)}" cy="170" r="52" fill="${P.a}"/>`;
      s += `<path d="M0 290 Q80 230 160 280 T320 270 T400 285 V320 H0Z" fill="${P.dark}" opacity=".5"/>`;
      for (let i = 0; i < 9; i++) s += `<path d="M0 ${300 + i * 24} Q100 ${290 + i * 24 + (i % 2 ? 8 : -8)} 200 ${300 + i * 24} T400 ${300 + i * 24} V500 H0Z" fill="${i % 2 ? "#3aa66b" : "#9bcf53"}" opacity=".95"/>`;
      for (let x = -100; x <= 500; x += 50) s += `<line x1="200" y1="300" x2="${x}" y2="500" stroke="${P.dark}" stroke-opacity=".25" stroke-width="2"/>`;
      return s + bird(80, 100, 1, P.ink) + bird(320, 120, 1, P.ink) + bird(250, 80, 0.8, P.ink);
    },
    // Moonlit night
    (R, P) => {
      const mx = f(220 + R() * 100);
      let s = stars(R, 40, P.b, 300) + `<circle cx="${mx}" cy="120" r="85" fill="${P.b}" opacity=".12"/><circle cx="${mx}" cy="120" r="58" fill="${P.b}"/><circle cx="${mx - 18}" cy="108" r="9" fill="${P.a}" opacity=".35"/><circle cx="${mx + 16}" cy="136" r="6" fill="${P.a}" opacity=".35"/>`;
      s += `<rect y="390" width="400" height="110" fill="${P.dark}"/><ellipse cx="${mx}" cy="440" rx="40" ry="8" fill="${P.b}" opacity=".6"/><path d="M0 410 q50 -8 100 0 t100 0 t100 0 t100 0" stroke="${P.b}" stroke-width="1.5" fill="none" opacity=".4"/>`;
      [[90, 1.1], [330, 0.9]].forEach(([x, k]) => (s += `<g transform="translate(${x} 392) scale(${k})"><rect x="-8" y="-120" width="16" height="120" fill="${P.dark}"/><ellipse cx="0" cy="-150" rx="60" ry="50" fill="${P.dark}"/><ellipse cx="-34" cy="-120" rx="40" ry="30" fill="${P.dark}"/><ellipse cx="36" cy="-122" rx="38" ry="28" fill="${P.dark}"/></g>`));
      return s + bird(210, 230, 1, P.ink) + bird(250, 250, 0.8, P.ink);
    },
  ],
};


// ---------- naming + stories ----------
const PAL_INFO = [
  ["Kumkum", "Kumkum is the first mark of every auspicious day, so this palette says: begin."],
  ["Pasupu", "Turmeric stands for health, prosperity and blessing, the colour of a home that is looked after."],
  ["Neelam", "Deep blue is the colour of calm and distance, a reminder that quiet has depth."],
  ["Pachcha", "Green is growth and renewal. It forgives, regrows and starts again."],
  ["Gulabi", "Rose is tenderness. It is the colour we reach for when we love something."],
  ["Peacock", "Teal is pride without arrogance, the joy of showing up in full colour."],
  ["Jamun", "Jamun purple is rich and a little mysterious, the colour of ripe evenings."],
  ["Sindoor", "Vermilion is devotion and courage, a bold promise made in red."],
];
// [name, short description, historic story, hidden meaning]
const NOUNS = {
  kalamkari: [
    ["Tree of Life", "A tree of life alive with birds and blossoms", "For centuries, Kalamkari artists in places like Srikalahasti and Machilipatnam have drawn the tree of life with a bamboo pen, one patient line at a time. Cloth like this once travelled by ship to faraway markets, carrying a small piece of the Telugu land with it.", "Everything is connected. The roots feed the trunk, the branches shelter the birds, and the birds carry seeds. Nobody in this picture grows alone."],
    ["Peacock", "A dancing peacock fanning out its tail", "The peacock fans out when the first monsoon clouds gather, and Kalamkari painters have long drawn it with a hundred watchful eyes in its tail. Old temple cloths show it beside gods and kings, but it always steals the scene.", "Joy arrives after the storm. Let yourself dance when the rain finally comes."],
    ["Mango Motif", "The paisley mango motif, layer upon layer", "The curled mango shape travelled along trade routes and ended up on fabrics across the world, but at home it is simply a young mango, the first sign of summer. Weavers and painters have repeated it for generations, each adding their own tiny twist.", "Every big thing starts small and curled up inside itself. Be gentle with your beginnings."],
    ["Vine", "A curling vine of leaves and flowers", "Along the borders of old Kalamkari cloth, a vine winds without ever ending, because borders were meant to feel like a story that carries on past the edge of the fabric.", "Growth is not a straight line. It curls, pauses, and reaches again, and that is perfectly fine."],
    ["Medallion", "A lotus medallion framed by blossoms", "Look up in many old temples and a stone lotus looks back down at you from the ceiling. Painters borrowed this idea for their cloths, so a visitor could carry a bit of that ceiling home.", "Rise from the mud untouched. Purity isn't the absence of struggle, it is what you do with it."],
  ],
  temple: [
    ["Gopuram", "A temple tower catching the last light", "South Indian temples grew taller gateways over the centuries, and a gopuram could be seen from miles away. For a tired traveller it meant one thing: a place of shelter and prayer was near.", "Look up. Every tier is a small step from the ordinary toward something bigger than you."],
    ["Deepasthambham", "A tiered temple lamp with every flame lit", "Lamp pillars stand outside many temples and are lit at dusk, so the lamp is the last thing the day sees and the first thing the night meets. Villagers say a lit lamp never argues with the dark, it simply stays.", "One flame can light a thousand others and lose nothing. Kindness works the same way."],
    ["Kalasam", "A sacred pot crowned with mango leaves and coconut", "A pot of water crowned with mango leaves and a coconut welcomes guests at weddings and housewarmings. The coconut, hard outside and sweet inside, has been trusted as a symbol of good beginnings for as long as anyone remembers.", "A full pot means a full heart. Welcome people with what you have, and what you have will be enough."],
    ["Mandapam", "A pillared temple arch hung with flowers", "The pillared hall in a temple was never only for prayer. It was where villages met to hear music, watch dance and listen to stories under one roof.", "Culture lives wherever people gather. Art is a roof we build together."],
    ["Ghanta", "A temple bell in a garland of flowers", "Devotees ring the bell on the way in, to announce themselves to the divine, and perhaps also to wake up their own attention. The sound is meant to clear the mind, even if only for a moment.", "Arrive fully. The bell isn't asking you to be perfect, only present."],
  ],
  muggu: [
    ["Flower Muggu", "A flower muggu of petals and patience", "At dawn, women across the Telugu lands draw muggu with rice flour at the doorstep. The flour is food for ants and birds, which means the art feeds the day before it even begins.", "Make something beautiful that also serves others, even if the wind erases it by noon."],
    ["Dot Muggu", "A dot-lattice muggu, drawn the old way", "Chukkala muggu begins with a grid of dots, and the hand moves in loops around them without lifting until the pattern closes. Grandmothers drew these from memory, and called it counting with a pinch of rice flour.", "Order grows from patient little points. Discipline can be a quiet kind of art."],
    ["Star Muggu", "A many-pointed star muggu", "On festival nights, star-shaped muggus bring the sky down to the doorstep. Children are asked to help with the dots, which is how most of us learned to draw them.", "Even the smallest doorstep can hold a constellation."],
    ["Ripple Muggu", "Rings within rings, a muggu of quiet rhythm", "Circular muggus echo ripples on a pond, and are often the first design a child is trusted to draw alone, because circles forgive wobbles.", "Every act ripples outward. A small kindness travels farther than you think."],
    ["Spiral Muggu", "A double spiral muggu that never ends", "In Telugu, a swirl of hair or a whirl in water is called a sudi, and many people believe swirls are linked to luck. The double spiral is drawn at thresholds, to say that what goes out will come back around.", "What you give circles back. Both spirals are the same line, seen from two ends."],
  ],
  festival: [
    ["Bathukamma", "Tiers of flowers stacked for Bathukamma", "Bathukamma is Telangana's festival of flowers. Women stack seasonal blooms like gunuka and tangedu into a glowing cone, sing around it for hours, then float it on water at the end. The name roughly means 'come alive, mother'.", "Celebrate life, thank nature, and let go gracefully. Letting go is part of honouring."],
    ["Deepavali", "Rows of diyas lit for Deepavali", "On Deepavali, rows of clay lamps are lit along windows and doorsteps. Families say the real tradition is not the lamps, but the neighbours who stop by because they saw the light.", "Light one lamp and the dark has to rethink its plans."],
    ["Sankranti Kites", "Kites filling the Sankranti sky", "Sankranti marks the harvest, and rooftops fill up with kites in every colour. The unwritten rule is that the best kite flyers are the ones who know when to loosen the string.", "Hold your dreams loosely. They fly higher that way."],
    ["Ugadi", "A new year sun framed by mango garlands", "On Ugadi, doors are hung with mango leaves and families share a dish with six tastes: sweet, sour, bitter, salty, spicy and tangy. It is a gentle way of saying the year ahead will contain all of them.", "Life tastes of everything. Accept every flavour and you will never go hungry."],
    ["Pongal", "A pot overflowing with the harvest", "Pongal means 'to overflow'. Families cook the first rice of the harvest in a new pot outdoors and cheer when it bubbles over, because an overflowing pot is the best omen of the year.", "Abundance is meant to be shared. Let your cup overflow, then pour it for someone else."],
  ],
  nature: [
    ["Lotus", "A lotus rising from still water", "The lotus grows from muddy ponds and opens clean in the morning. Poets across the south have used it for centuries as a picture of grace under pressure.", "You are allowed to come from the mud and still bloom."],
    ["Hills", "Hills catching the morning sun", "The Eastern Ghats run quietly along the coast of Andhra, cradling forests, waterfalls and villages. Locals say you don't climb them to conquer anything, but to see how small your worries look from the top.", "Perspective. The climb is slow, but the view changes how you see everything below."],
    ["Konaseema", "Palms swaying along a river", "Konaseema, on the Godavari delta, is so green with coconut palms and canals that people call it the Kerala of Andhra. Boats still carry coconuts and neighbours along the water.", "Bend with the wind and keep your roots. Both are strength."],
    ["Paddy Field", "Paddy fields rolling to the horizon", "The Godavari and Krishna deltas have fed millions for centuries, and farmers still sing while they plant. Rice here is counted in seasons of waiting, not in grains.", "Patience is a crop too. Some things only ripen when you stop rushing them."],
    ["Moonlight", "A moonlit night by the lake", "On warm village nights, families used to drag their cots outside and listen to stories under the moon. Poets have written about moonlight in Telugu for ages, always as something soft that makes ordinary places beautiful.", "Stillness has its own glow. Not every light needs to be loud."],
  ],
};
const CAT_LABEL = { kalamkari: "Kalamkari", temple: "Temple Art", muggu: "Muggu", festival: "Festivals", nature: "Nature" };
const MEDIUM = { kalamkari: "Kalamkari-style, natural dyes on cotton", temple: "Acrylic on canvas", muggu: "Poster colours on handmade paper", festival: "Acrylic on canvas", nature: "Oil pastel and acrylic" };
const SIZES = ["12 x 16 in", "16 x 20 in", "18 x 24 in", "20 x 28 in", "24 x 30 in"];
const CATS = Object.keys(MOTIFS);

// ---------- build ----------
const svgWrap = (inner, P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.bg1}"/><stop offset="1" stop-color="${P.bg2}"/></linearGradient></defs><rect width="400" height="500" fill="url(#bg)"/>${inner}<rect x="14" y="14" width="372" height="472" fill="none" stroke="${P.a}" stroke-width="2" opacity=".75"/></svg>\n`;

const out = [];
let id = 1, seed = 1;

// every (palette, noun, category) combo, shuffled so colours and subjects mix in every tab
const combos = [];
for (let pi = 0; pi < PAL.length; pi++) for (let ni = 0; ni < 5; ni++) for (const cat of CATS) combos.push({ pi, ni, cat, seed: seed++ });
const sh = rng(2024);
for (let i = combos.length - 1; i > 0; i--) { const j = Math.floor(sh() * (i + 1)); [combos[i], combos[j]] = [combos[j], combos[i]]; }

for (const { pi, ni, cat, seed: cs } of combos) {
  const P = PAL[pi], R = rng(cs * 7919);
  const file = `${cat}-${ni + 1}-${P.key}.svg`;
  fs.writeFileSync(path.join(OUT, file), svgWrap(MOTIFS[cat][ni](R, P), P));
  const [nName, nDesc, nStory, nMeaning] = NOUNS[cat][ni];
  const [pName, pMeaning] = PAL_INFO[pi];
  const r = rng(id * 31);
  out.push({
    id: id++,
    title: `${pName} ${nName}`,
    category: cat,
    price: Math.round((3000 + r() * 19000) / 500) * 500,
    size: SIZES[Math.floor(r() * SIZES.length)],
    medium: MEDIUM[cat],
    image: `images/art/${file}`,
    featured: cat === "temple" && ni === 0 && pi === 4,
    description: `${nDesc}, painted in ${pName.toLowerCase()} tones.`,
    story: nStory,
    meaning: nMeaning,
    colorNote: pMeaning,
  });
}

fs.writeFileSync(path.join(ROOT, "data", "paintings.json"), JSON.stringify(out, null, 2));
const counts = {};
out.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
console.log("Total:", out.length, counts);

