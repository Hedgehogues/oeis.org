// Renders each sequence's live viz.html and captures real PNG screenshots — full page plus one
// targeted crop per device — so the devices catalog and each sequence's README show an actual
// picture when browsed on GitHub (GitHub does not preview .html files inline).
//
// StateMap and MergedResultStrip get separate crops (were briefly one shared frame -- see
// visualization-principles.md #14's own precedent note, corrected after the shared crop was
// flagged: the two devices need genuinely distinct visualizations, not one picture for both).
//
// This does NOT replace the live page as the source of truth (see
// memory-bank/specs/visualizations.md's Architecture section for why pages stay live HTML rather
// than a build-only PNG pipeline) — it is a snapshot taken FROM the live page, committed for
// browsability, and re-run whenever a page's markup changes.
//
// Crops are targeted at the specific element that demonstrates ONE device (an id set in the
// page's own markup, or the nth `.grp`/`.card` in document order) rather than reusing one big
// card screenshot across several unrelated device records — see
// .claude/rules/visualization-principles.md and the commit that introduced this granularity for
// why a shared, undifferentiated crop is a real defect, not a shortcut.
//
// Setup (not committed — screenshots are, node_modules isn't):
//   npm init -y && npm install playwright && npx playwright install --with-deps chromium
// Run from the repo root:
//   node memory-bank/visualizations/capture.mjs

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The pages, their drafts and their screenshots all live here, beside this script — a sequence's
// own directory holds no picture files at all, only its README and its code.
const VIZ = path.dirname(fileURLToPath(import.meta.url));

// selector forms:
//   { css: '#some-id' }                -> page.locator(css), first match
//   { css: '.grp', nth: 2 }             -> page.locator(css).nth(2)
//   { css: '.card', nth: 2 }            -> page.locator(css).nth(2)
function locatorFor(page, sel) {
  const l = page.locator(sel.css);
  return sel.nth === undefined ? l.first() : l.nth(sel.nth);
}

const jobs = [
  {
    file: `${VIZ}/A100001/viz.html`,
    outDir: `${VIZ}/A100001/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['fano-plane.png', { css: '.card', nth: 0 }],
      ['incidence-matrix-pair.png', { css: '.card', nth: 1 }],
      ['log-growth-chart.png', { css: '.card', nth: 2 }],
    ],
  },
  {
    file: `${VIZ}/A000001/viz.html`,
    outDir: `${VIZ}/A000001/screenshots`,
    width: 1100,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '.card', nth: 0 }],
      ['marked-asymmetry.png', { css: '.grp', nth: 0 }],       // device::MarkedAsymmetry
      ['cayley-table.png', { css: '#s1b' }],                    // device::CayleyTable
      ['self-cancel-diagonal.png', { css: '#s1c' }],            // device::SelfCancelDiagonal
      ['state-map.png', { css: '.grp', nth: 3 }],               // device::StateMap
      ['merged-result-strip.png', { css: '#mergeDemo' }],       // device::MergedResultStrip
      ['orbit-ring.png', { css: '.card', nth: 2 }],             // device::OrbitRing
      ['combination-fork.png', { css: '.card', nth: 3 }],       // device::CombinationFork
      ['divisor-chips.png', { css: '#s4a' }],                   // device::DivisorChips
      ['assembly-map.png', { css: '.card', nth: 5 }],           // device::MiniRecap
      ['unrealized-placeholder.png', { css: '#ghostWhy' }],     // device::UnrealizedPlaceholder
      ['solution-catalog.png', { css: '.card', nth: 6 }],       // full Solution section
    ],
  },
  {
    file: `${VIZ}/A000002/viz.html`,
    outDir: `${VIZ}/A000002/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['run-length-encoding.png', { css: '#cardRLE' }],          // device::RunLengthEncoding
      ['fixed-point-overlay.png', { css: '#cardOverlay' }],      // device::FixedPointOverlay
      ['bootstrap-minirecap.png', { css: '#s3frames' }],         // device::MiniRecap (reused)
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000003/viz.html`,
    outDir: `${VIZ}/A000003/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['reduction-minirecap.png', { css: '#cardReduce' }],       // device::MiniRecap (reused)
      ['condition.png', { css: '#cardCondition' }],
      ['fundamental-domain-plot.png', { css: '#cardDomain' }],   // device::FundamentalDomainPlot
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000005/viz.html`,
    outDir: `${VIZ}/A000005/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['divisor-pair-fan.png', { css: '#cardOperation' }],       // device::DivisorPairFan
      ['non-closing-table.png', { css: '#cardTable' }],          // device::NonClosingTable
      ['inverse-overlay.png', { css: '#cardInverse' }],          // device::FixedPointOverlay (reused)
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000030/viz.html`,
    outDir: `${VIZ}/A000030/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['non-converging-trace.png', { css: '#cardTrace' }],        // device::NonConvergingTrace
      ['skew-bars.png', { css: '#cardSkew' }],                    // device::FractionalPartHistogram
      ['benford-bars.png', { css: '#cardBenford' }],
      ['uniform-bars.png', { css: '#cardUniform' }],              // device::FractionalPartHistogram (reused)
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000018/viz.html`,
    outDir: `${VIZ}/A000018/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['representation-grid.png', { css: '#cardGrid' }],          // device::RepresentationGrid
      ['condition.png', { css: '#cardCondition' }],
      ['solution.png', { css: '#cardSolution' }],                 // device::LogGrowthChart (reused)
    ],
  },
  {
    file: `${VIZ}/A000029/viz.html`,
    outDir: `${VIZ}/A000029/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['group.png', { css: '#cardGroup' }],
      ['burnside-table.png', { css: '#cardBurnside' }],            // device::BurnsideFixedPointTable
      ['solution.png', { css: '#cardSolution' }],                  // device::MergedResultStrip (reused)
    ],
  },
  {
    file: `${VIZ}/A000008/viz.html`,
    outDir: `${VIZ}/A000008/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['staged-table.png', { css: '#cardStaged' }],   // device::IncrementalTally
      ['why-grows.png', { css: '#cardWhy' }],          // device::IncrementalTally
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000009/viz.html`,
    outDir: `${VIZ}/A000009/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['lists.png', { css: '#cardLists' }],
      ['rule.png', { css: '#cardRule' }],
      ['bijection.png', { css: '#cardBijection' }],   // device::PartitionBijectionMatch
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000010/viz.html`,
    outDir: `${VIZ}/A000010/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['factors.png', { css: '#cardFactors' }],
      ['strike2.png', { css: '#cardStrike2' }],
      ['strike5.png', { css: '#cardStrike5' }],        // device::TotientSieveStrip
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000020/viz.html`,
    outDir: `${VIZ}/A000020/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['orbit-ring.png', { css: '#cardRing' }],          // device::OrbitRing (reused)
      ['sieve.png', { css: '#cardSieve' }],               // device::TotientSieveStrip (reused)
      ['count.png', { css: '#cardCount' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000023/viz.html`,
    outDir: `${VIZ}/A000023/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['buckets.png', { css: '#cardBuckets' }],           // device::SignedBucketSum
      ['sum.png', { css: '#cardSum' }],
      ['recurrence.png', { css: '#cardRecurrence' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000006/viz.html`,
    outDir: `${VIZ}/A000006/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['runs.png', { css: '#cardRuns' }],                  // device::RunLengthEncoding (reused)
      ['legendre.png', { css: '#cardLegendre' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000015/viz.html`,
    outDir: `${VIZ}/A000015/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['runs.png', { css: '#cardRuns' }],                  // device::RunLengthEncoding (reused)
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000026/viz.html`,
    outDir: `${VIZ}/A000026/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['squarefree.png', { css: '#cardSquarefree' }],
      ['counter.png', { css: '#cardCounter' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000028/viz.html`,
    outDir: `${VIZ}/A000028/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['included.png', { css: '#cardIncluded' }],
      ['excluded.png', { css: '#cardExcluded' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000025/viz.html`,
    outDir: `${VIZ}/A000025/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['rank.png', { css: '#cardRank' }],
      ['list.png', { css: '#cardList' }],
      ['signed-tally.png', { css: '#cardTally' }],   // device::RankSignedTally
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000014/viz.html`,
    outDir: `${VIZ}/A000014/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['condition.png', { css: '#cardCondition' }],
      ['collapse.png', { css: '#cardCollapse' }],     // device::DegreeTwoCollapse
      ['bigger.png', { css: '#cardBigger' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000019/viz.html`,
    outDir: `${VIZ}/A000019/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['divisors.png', { css: '#cardDivisors' }],       // device::DivisorChips (reused)
      ['closure.png', { css: '#cardClosure' }],         // device::BlockClosureTrace
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
  {
    file: `${VIZ}/A000022/viz.html`,
    outDir: `${VIZ}/A000022/screenshots`,
    width: 1000,
    full: 'full.png',
    crops: [
      ['problem.png', { css: '#cardProblem' }],
      ['peel.png', { css: '#cardPeel' }],
      ['dichotomy.png', { css: '#cardDichotomy' }],
      ['identity.png', { css: '#cardIdentity' }],
      ['solution.png', { css: '#cardSolution' }],
    ],
  },
];

const browser = await chromium.launch();
for (const job of jobs) {
  fs.mkdirSync(job.outDir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: job.width, height: 1000 },
    colorScheme: 'dark',
  });
  await page.goto('file://' + job.file);
  await page.waitForTimeout(400); // let the page's own inline <script> finish building its DOM
  await page.screenshot({ path: path.join(job.outDir, job.full), fullPage: true });
  console.log(`${job.file} -> ${job.full}`);

  for (const [name, sel] of job.crops) {
    const el = locatorFor(page, sel);
    if ((await el.count()) === 0) { console.log(`  SKIP ${name} (selector not found: ${JSON.stringify(sel)})`); continue; }
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: path.join(job.outDir, name) });
    console.log(`  ${name}`);
  }
  await page.close();
}
await browser.close();
console.log('done');
