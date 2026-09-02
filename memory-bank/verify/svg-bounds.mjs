// Checks that no `<text>` inside a page's own SVG charts is clipped by its viewBox.
//
// An SVG's outermost element clips overflow by default -- a `<text y="4">` whose font ascender
// reaches above y=0, or a `text-anchor="end"` label whose string is wider than the room left
// between its anchor and the viewBox edge, gets silently cut. Nothing about that shows up in the
// source (the coordinates look reasonable on their own) and nothing else in this suite renders the
// page and measures real layout the way this does -- it was found only by patching one page's
// value label to a safer y and comparing screenshots by eye.
//
// This measures REAL rendered geometry (getBoundingClientRect), not source coordinates: font
// metrics, the exact scale a responsive `width:100%` SVG ends up at, and text width all come from
// the browser, not from arithmetic on the source.
//
// Setup (not committed -- screenshots are, node_modules isn't):
//   npm install playwright && npx playwright install --with-deps chromium
// Run from the repo root:
//   node memory-bank/verify/svg-bounds.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIZ = path.join(MB, 'visualizations');
const EPS = 0.75; // px of tolerance for anti-aliasing/subpixel rounding

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('playwright is not installed. Run: npm install playwright && npx playwright install --with-deps chromium');
  process.exit(2);
}

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const pages = fs.readdirSync(VIZ)
  .filter((d) => /^A\d{6}$/.test(d))
  .map((d) => [d, path.join(VIZ, d, 'viz.html')])
  .filter(([, p]) => fs.existsSync(p));

const browser = await chromium.launch();
for (const [seq, file] of pages) {
  const page = await browser.newPage();
  await page.goto('file://' + file);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);

  const violations = await page.evaluate((eps) => {
    const out = [];
    document.querySelectorAll('svg[viewBox]').forEach((svg) => {
      const s = svg.getBoundingClientRect();
      svg.querySelectorAll('text').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return; // not actually laid out
        const over = r.left < s.left - eps || r.right > s.right + eps ||
                     r.top < s.top - eps || r.bottom > s.bottom + eps;
        if (over) {
          out.push({
            svg: svg.id || '(no id)',
            text: (el.textContent || '').trim().slice(0, 40),
          });
        }
      });
    });
    return out;
  }, EPS);

  await page.close();

  for (const v of violations) {
    fail(`${seq}: <text> "${v.text}" inside svg#${v.svg} is clipped by the viewBox -- give the ` +
         `viewBox margin, don't just move the text (see principle 18)`);
  }
}
await browser.close();

console.log(failed === 0
  ? `All ${pages.length} pages: no SVG text is clipped by its own viewBox.`
  : `\n${failed} SVG-bounds check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
