// Checks that the devices catalog still describes things that exist.
//
// A catalogue record is only worth anything while the item it describes is actually held. When a
// page redesign removes a widget, the record that pointed at it does not fail loudly — it keeps
// naming a PNG that is still on disk, and the temptation is to re-aim it at a neighbouring
// device's crop and move on. That happened once here, and nothing caught it; this does.
//
// Four things are checked for every [device::*] record in _terms.md:
//   1. its Picture: file exists on disk;
//   2. that picture is a crop capture.mjs actually produces — not a stray file left behind;
//   3. the crop's own selector still resolves in the page it is taken from, so the record
//      describes a live element rather than a hole a redesign left;
//   4. no two records share a picture (a shared crop means the crop is too coarse to show
//      either device on its own).
//
// Run: node memory-bank/verify/catalog.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const terms = fs.readFileSync(path.join(MB, '_terms.md'), 'utf8');
const capture = fs.readFileSync(path.join(MB, 'visualizations/capture.mjs'), 'utf8');

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// ---- what capture.mjs produces, and from where --------------------------------------------------
// jobs are literals in that file; read the crop lists per sequence rather than importing it
// (importing would launch a browser).
const crops = new Map();                      // 'A000001/screenshots/x.png' -> selector source
for (const job of capture.split('file: `${VIZ}/').slice(1)) {
  const seq = job.slice(0, job.indexOf('/'));
  const full = job.match(/full:\s*'([^']+)'/);
  if (full) crops.set(`${seq}/screenshots/${full[1]}`, null);   // the whole page, no selector
  for (const m of job.matchAll(/\['([^']+\.png)',\s*\{([^}]*)\}\]/g)) {
    crops.set(`${seq}/screenshots/${m[1]}`, m[2]);
  }
}

// ---- does a crop's selector still resolve in its page? ------------------------------------------
const pageCache = new Map();
const pageOf = (seq) => {
  if (!pageCache.has(seq)) {
    pageCache.set(seq, fs.readFileSync(path.join(MB, `visualizations/${seq}/viz.html`), 'utf8'));
  }
  return pageCache.get(seq);
};

function selectorResolves(seq, sel) {
  if (sel === null) return true;                               // full-page capture
  const css = sel.match(/css:\s*'([^']+)'/)?.[1];
  const nth = sel.match(/nth:\s*(\d+)/);
  if (!css) return false;
  const page = pageOf(seq);
  if (css.startsWith('#')) {
    // an id is written into the markup, or built by the page's own script
    const id = css.slice(1);
    return page.includes(`id="${id}"`) || page.includes(`.id='${id}'`) || page.includes(`id='${id}'`);
  }
  if (css.startsWith('.')) {
    const cls = css.slice(1);
    // count both static markup and the script's own className assignments
    const re = new RegExp(`(class="[^"]*\\b${cls}\\b|className\\s*=\\s*'[^']*\\b${cls}\\b)`, 'g');
    const n = (page.match(re) || []).length;
    return n > (nth ? Number(nth[1]) : 0);
  }
  return false;
}

// ---- walk the records ---------------------------------------------------------------------------
const records = terms.split(/^## \[device::/m).slice(1);
const seen = new Map();                                        // picture -> device that claimed it
let checked = 0;

for (const rec of records) {
  const name = rec.slice(0, rec.indexOf(']'));
  const pic = rec.match(/^Picture:\s*!\[[^\]]*\]\(([^)]+)\)/m);

  if (!pic) {
    if (!/^Picture:\s*—/m.test(rec)) {
      fail(`[device::${name}] has no Picture: field and no stated reason for having none`);
    }
    continue;
  }
  checked++;
  const rel = pic[1];                                          // e.g. visualizations/A000001/screenshots/x.png

  if (!fs.existsSync(path.join(MB, rel))) {
    fail(`[device::${name}] points at ${rel}, which does not exist`);
    continue;
  }

  const key = rel.replace(/^visualizations\//, '');
  if (!crops.has(key)) {
    fail(`[device::${name}] points at ${rel}, which capture.mjs does not produce — a stray file, not a live crop`);
    continue;
  }

  const seq = key.slice(0, key.indexOf('/'));
  if (!selectorResolves(seq, crops.get(key))) {
    fail(`[device::${name}]'s crop ${rel} is captured from a selector that no longer resolves in ${seq}/viz.html — the element it describes is gone`);
    continue;
  }

  const prev = seen.get(rel);
  if (prev) fail(`[device::${name}] shares its picture with [device::${prev}] — one crop cannot show two devices`);
  else seen.set(rel, name);
}

console.log(failed === 0
  ? `All ${checked} device pictures exist, are produced by capture.mjs, still resolve in their page, and are unique.`
  : `\n${failed} catalog check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
