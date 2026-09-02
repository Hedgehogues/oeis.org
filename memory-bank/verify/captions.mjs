// Checks that the two kinds of text a page is allowed to carry stay the size
// `.claude/rules/visualization-principles.md` actually asks for, instead of relying on someone
// noticing a page has grown wordier than its neighbours.
//
// Principle 1 permits exactly one thing in prose: a one-time definition of a new visual
// convention (`class="legend"`), kept "as a one-line legend, not a paragraph." Principle 12
// permits per-step narration (`class="subcap"`) that is allowed to grow with how many
// sub-questions a page decomposes into — a page with more steps legitimately needs more words,
// which is why this check bounds the AVERAGE words per subcap paragraph rather than a flat total:
// a longer chain of genuinely separate steps does not fail this by virtue of having more of them,
// but each individual step is still held to roughly a sentence and a half.
//
// Both principles were, until this check, judgement calls with no script behind them (see that
// file's own closing table) — the same gap that let principle 9's marker legend get deleted twice
// before a check was finally written for it. Measured across the five real pages in this
// repository at the time this check was added, legend/subcap word counts grew page over page
// (A000001 -> A000002 -> A000003 -> A000005) without anything flagging it; this is the sensor
// that closes that loop.
//
// This reads real rendered DOM text (via Playwright), not the page's source string literals —
// `.legend`/`.subcap` content is built several different ways across pages (a single
// `innerHTML =` assignment, several `appendChild` calls), and only the rendered result reflects
// what a reader actually sees.
//
// Setup (not committed — screenshots are, node_modules isn't):
//   npm install playwright && npx playwright install --with-deps chromium
// Run from the repo root:
//   node memory-bank/verify/captions.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIZ = path.join(MB, 'visualizations');

const LEGEND_MAX_WORDS = 25;      // "a one-line legend" — roughly one sentence
const SUBCAP_AVG_MAX_WORDS = 25;  // per-step narration budget, averaged so more steps aren't penalized

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('playwright is not installed. Run: npm install playwright && npx playwright install --with-deps chromium');
  process.exit(2);
}

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const pages = fs.readdirSync(VIZ)
  .filter((d) => /^A\d{6}$/.test(d))
  .map((d) => [d, path.join(VIZ, d, 'viz.html')])
  .filter(([, p]) => fs.existsSync(p));

const browser = await chromium.launch();
for (const [seq, file] of pages) {
  const page = await browser.newPage();
  await page.goto('file://' + file);
  await page.waitForTimeout(200); // let the page's own inline <script> finish building its DOM

  const legends = await page.$$eval('.legend', (els) => els.map((e) => e.textContent || ''));
  const subcaps = await page.$$eval('.subcap', (els) => els.map((e) => e.textContent || ''));
  await page.close();

  for (const text of legends) {
    const n = words(text);
    if (n > LEGEND_MAX_WORDS) {
      fail(`${seq}: a legend runs ${n} words (over ${LEGEND_MAX_WORDS}) — "${text.trim().slice(0, 70)}..." reads as a paragraph, not a one-line convention`);
    }
  }

  if (subcaps.length > 0) {
    const total = subcaps.reduce((sum, t) => sum + words(t), 0);
    const avg = total / subcaps.length;
    if (avg > SUBCAP_AVG_MAX_WORDS) {
      fail(`${seq}: ${subcaps.length} step captions average ${avg.toFixed(1)} words (over ${SUBCAP_AVG_MAX_WORDS}) — narration is growing past a sentence and a half per step`);
    }
  }
}
await browser.close();

console.log(failed === 0
  ? `All ${pages.length} pages: legends stay one-line, step narration stays within its per-step budget.`
  : `\n${failed} caption check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
