// Runs every check in this folder and reports one verdict.
//
// This is what a spec's `Status: done` is allowed to cite. Each check below exists because the
// thing it checks was, at some point, wrong in a way that nothing noticed: a catalog record
// describing a widget a redesign had deleted, a page whose only line of notation a "remove the
// prose" pass had taken, a QR readable in the source and unreadable in the snapshot that actually
// travels.
//
// The QR check needs `npm install jsqr pngjs`; without them it reports as skipped rather than
// failing, since the dependency is not committed.
//
// Run: node memory-bank/verify/all.mjs

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

const checks = [
  ['group-tables', 'the multiplication tables the pages draw'],
  ['benford', 'the statistical claims A000030\'s page embeds'],
  ['catalog', 'device records still describe live elements'],
  ['pages', 'notation, QR, themes, self-containment'],
  ['captions', 'legends stay one-line, step narration stays within budget'],
  ['svg-bounds', 'no SVG text is clipped by its own viewBox'],
  ['code-split', 'implementation and proof stay independent'],
  ['qr', 'the QR decodes out of the captured snapshot'],
  ['sequences', 'each sequence reproduces its published terms'],
];

let failed = 0, skipped = 0;

for (const [name, what] of checks) {
  const file = path.join(HERE, `${name}.mjs`);
  const r = spawnSync(process.execPath, [file], { cwd: REPO, encoding: 'utf8' });
  const tail = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '(no output)';

  if (r.status === 2) { skipped++; console.log(`skip  ${name.padEnd(13)} ${tail}`); continue; }
  if (r.status !== 0) {
    failed++;
    console.log(`FAIL  ${name.padEnd(13)} ${what}`);
    console.log((r.stdout || r.stderr || '').trim().split('\n').map((l) => `        ${l}`).join('\n'));
    continue;
  }
  console.log(`ok    ${name.padEnd(13)} ${tail}`);
}

console.log(failed === 0
  ? `\nAll checks passed${skipped ? ` (${skipped} skipped for a missing dependency)` : ''}.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
