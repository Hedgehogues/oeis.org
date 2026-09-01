// Checks the invariants a page must hold that no amount of looking at it will reliably catch.
//
// 1. The marker convention is stated. A page that draws the white corner dot must also carry the
//    one line that binds that dot to its meaning, marked `class="legend"`. This is notation, not
//    commentary: without it the reader sees shapes with an unexplained speck. It has been deleted
//    twice by "remove the prose" passes — once caught by the reader asking what the shapes were,
//    once caught only months later. Hence a check rather than a principle.
// 2. The repo QR is present and pinned outside the theme. A QR that follows a dark theme renders
//    light-on-dark and decodes for nobody; whether it actually decodes is checked separately by
//    qr.mjs, which needs the captured PNG.
// 3. Both themes are defined at token level, and the body paints its own background.
// 4. No page depends on anything but the Google Fonts stylesheet.
// 5. Every page shares one visual system — the same colour-role tokens and the same typefaces —
//    so crops from different sequences read as one catalog rather than several projects.
//
// Run: node memory-bank/verify/pages.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIZ = path.join(MB, 'visualizations');

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const pages = fs.readdirSync(VIZ)
  .filter((d) => /^A\d{6}$/.test(d))
  .map((d) => [d, path.join(VIZ, d, 'viz.html')])
  .filter(([, p]) => fs.existsSync(p));

for (const [seq, file] of pages) {
  const s = fs.readFileSync(file, 'utf8');

  // 1. the marker convention, stated once
  const drawsMarker = /'class':'marker'/.test(s);
  const legend = s.match(/className\s*=\s*'legend'/) || s.match(/class="legend"/);
  if (drawsMarker && !legend) {
    fail(`${seq}: the page draws the corner marker but carries no class="legend" defining it — a "remove the prose" pass took the notation with the commentary`);
  }
  if (legend) {
    const body = s.match(/innerHTML\s*=\s*'([^']{20,})'/);
    if (!body) fail(`${seq}: has a legend element but no text of usable length in it`);
  }

  // 2. the repo QR, pinned outside the theme
  if (!s.includes('class="repo"')) {
    fail(`${seq}: no repo footer — a forwarded snapshot has no way back to the sources`);
  } else {
    const rule = s.match(/\.repo svg\{([^}]*)\}/);
    if (!rule) fail(`${seq}: has a repo footer but no .repo svg rule to pin the symbol`);
    else if (/var\(--/.test(rule[1])) {
      fail(`${seq}: the QR takes its colours from the theme tokens — a dark theme renders it light-on-dark, which most scanners cannot read`);
    }
  }
  if (!s.includes('github.com/Hedgehogues/oeis.org')) {
    fail(`${seq}: the repo address is not written out in text beside the QR`);
  }

  // 3. both themes, and a body that paints its own ground
  for (const need of ['@media (prefers-color-scheme: dark)', ':root[data-theme="dark"]']) {
    if (!s.includes(need)) fail(`${seq}: missing \`${need}\` — the viewer's theme decides how this renders`);
  }
  if (!/body\{[^}]*background:\s*var\(--/.test(s)) {
    fail(`${seq}: body does not set a background from a token — a transparent body borrows the host's ground`);
  }

  // 4. self-contained
  for (const m of s.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
    if (!m[1].startsWith('https://fonts.googleapis.com') && !m[1].startsWith('https://oeis.org')) {
      fail(`${seq}: depends on ${m[1]} — pages must be self-contained apart from the fonts stylesheet`);
    }
  }
}

// ---- 5. one visual system across every page ----------------------------------------------------
// Two pages may name their accents differently — a configuration page has points and lines where a
// symmetry page has rotations and flips — and that is a real difference in subject, not in system.
// What must not differ: the ground the pages are painted on, the hues those accents are drawn from,
// and the typefaces. Those are what make two crops read as one catalog.

const GROUND = {                       // identical on every page, light theme
  '--bg': '#F1EFF6', '--surface': '#FFFFFF', '--surface-2': '#F6F5FA',
  '--ink': '#1C1A2E', '--ink-soft': '#5D5977', '--ink-faint': '#9691AE', '--line': '#E1DFEC',
};
const ACCENTS = [                      // the catalog's hues; an accent may only be one of these
  '#3E5FA6', '#8AA0D6', '#B23E77', '#DE9AB9', '#C9C5D8', '#2F8A66', '#C4534A',
];

const rootBlock = (src) => {
  const i = src.indexOf(':root{');
  if (i < 0) return null;
  return src.slice(i, src.indexOf('}', i));
};

let fontsRef = null, fontsRefSeq = null;
for (const [seq, file] of pages) {
  const src = fs.readFileSync(file, 'utf8');
  const root = rootBlock(src);
  if (!root) { fail(`${seq}: no :root token block`); continue; }

  const defined = new Map();
  for (const m of root.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) defined.set('--' + m[1], m[2].trim());

  for (const [k, v] of Object.entries(GROUND)) {
    if (!defined.has(k)) fail(`${seq}: does not define ${k} — the catalog's shared ground`);
    else if (defined.get(k).toUpperCase() !== v) fail(`${seq}: ${k} is ${defined.get(k)}, the catalog uses ${v}`);
  }

  const allowed = new Set([...Object.values(GROUND), ...ACCENTS].map((c) => c.toUpperCase()));
  for (const m of root.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    if (!allowed.has(m[0].toUpperCase())) {
      fail(`${seq}: ${m[0]} in :root is outside the catalog's palette — a crop from this page reads as another project`);
    }
  }

  const fonts = (src.match(/fonts\.googleapis\.com\/css2\?([^"]+)/) || [])[1] || null;
  if (fontsRef === null) { fontsRef = fonts; fontsRefSeq = seq; }
  else if (fonts !== fontsRef) fail(`${seq}: loads different typefaces from ${fontsRefSeq}`);
}

console.log(failed === 0
  ? `All ${pages.length} pages: notation stated, QR present and pinned, both themes defined, self-contained, one shared palette and type.`
  : `\n${failed} page check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
