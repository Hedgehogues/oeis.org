// Decodes the repo QR out of each captured page and checks the address that comes back.
//
// The point is which artifact gets read. The SVG is guaranteed correct — it was generated from the
// URL. What travels is the PNG, and everything that can go wrong happens between the two: the
// symbol inherits a dark theme and renders light-on-dark, or it is drawn small enough that one
// module lands on two pixels. Both happened here on the first attempt, and both are invisible to
// any check that reads the source instead of the snapshot.
//
// Setup (not committed — the screenshots are, node_modules isn't):
//   npm install jsqr pngjs
// Run from the repo root:
//   node memory-bank/verify/qr.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIZ = path.join(MB, 'visualizations');
const WANT = 'https://github.com/Hedgehogues/oeis.org';

let jsQR, PNG;
try {
  jsQR = (await import('jsqr')).default;
  PNG = (await import('pngjs')).PNG;
} catch {
  console.log('jsqr and pngjs are not installed. Run: npm install jsqr pngjs');
  process.exit(2);
}

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const pages = fs.readdirSync(VIZ)
  .filter((d) => /^A\d{6}$/.test(d))
  .map((d) => [d, path.join(VIZ, d, 'screenshots/full.png')])
  .filter(([, p]) => fs.existsSync(p));

for (const [seq, file] of pages) {
  const png = PNG.sync.read(fs.readFileSync(file));

  // the footer strip, where the symbol sits; scanning the whole page is slower and no more correct
  const from = Math.floor(png.height * 0.82);
  const h = png.height - from;
  const data = new Uint8ClampedArray(png.width * h * 4);
  png.data.copy(data, 0, from * png.width * 4);

  const found = jsQR(data, png.width, h);
  if (!found) fail(`${seq}: no QR could be read out of ${path.relative(MB, file)} — the symbol does not survive the form that actually travels`);
  else if (found.data !== WANT) fail(`${seq}: the QR decodes to "${found.data}", not ${WANT}`);
  else console.log(`ok    ${seq}  ->  ${found.data}`);
}

console.log(failed === 0
  ? `\nEvery captured page carries a QR that decodes to the repository.`
  : `\n${failed} QR check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
