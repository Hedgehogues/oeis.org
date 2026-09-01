// Renders each sequence's live viz.html and captures real PNG screenshots — full page plus one
// crop per `.card` section — so the devices catalog and each sequence's README show an actual
// picture when browsed on GitHub (GitHub does not preview .html files inline).
//
// This does NOT replace the live page as the source of truth (see
// memory-bank/specs/visualizations.md's Architecture section for why pages stay live HTML rather
// than a build-only PNG pipeline) — it is a snapshot taken FROM the live page, committed for
// browsability, and re-run whenever a page's markup changes.
//
// Setup (not committed — screenshots are, node_modules isn't):
//   npm init -y && npm install playwright && npx playwright install --with-deps chromium
// Run from the repo root:
//   node memory-bank/visualizations/capture.mjs

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const jobs = [
  {
    file: `${REPO}/sequences/A100001/viz.html`,
    outDir: `${REPO}/sequences/A100001/screenshots`,
    width: 1000,
    full: 'full.png',
    // [output filename, .card index (0-based, document order)]
    cards: [
      ['fano-plane.png', 0],
      ['incidence-matrix-pair.png', 1],
      ['log-growth-chart.png', 2],
    ],
  },
  {
    file: `${REPO}/sequences/A000001/viz.html`,
    outDir: `${REPO}/sequences/A000001/screenshots`,
    width: 1100,
    full: 'full.png',
    cards: [
      ['problem.png', 0],
      ['section-1-what-counts.png', 1],       // MarkedAsymmetry, CayleyTable, SelfCancelDiagonal, StateMap
      ['section-2-orbit-ring.png', 2],         // OrbitRing
      ['section-3-combination-fork.png', 3],   // CombinationFork
      ['section-4-divisor-chips.png', 4],      // DivisorChips, CombinationFork (reused)
      ['assembly-map.png', 5],                 // MiniRecap
      ['solution-catalog.png', 6],             // LogGrowthChart, UnrealizedPlaceholder
    ],
  },
];

const browser = await chromium.launch();
for (const job of jobs) {
  fs.mkdirSync(job.outDir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: job.width, height: 1000 },
    colorScheme: 'light', // pinned per specs/visualizations.md — every screenshot is light-theme
  });
  await page.goto('file://' + job.file);
  await page.waitForTimeout(400); // let the page's own inline <script> finish building its DOM
  await page.screenshot({ path: path.join(job.outDir, job.full), fullPage: true });
  console.log(`${job.file} -> ${job.full}`);

  const cards = page.locator('.card, article.card, section.card');
  const count = await cards.count();
  for (const [name, idx] of job.cards) {
    if (idx >= count) { console.log(`  SKIP ${name} (only ${count} .card elements found)`); continue; }
    const el = cards.nth(idx);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: path.join(job.outDir, name) });
    console.log(`  ${name} (card #${idx})`);
  }
  await page.close();
}
await browser.close();
console.log('done');
