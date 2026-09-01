// Runs each sequence's own proof.mjs at a bound small enough for a routine check.
//
// The bounds here are the fast ones, not the deep ones. They exist so this can be run after any
// edit without waiting minutes; a spec's `Status:` line cites the deep run instead, done once and
// quoted with its real output. Pass a bound to override:  node …/sequences.mjs 8
//
// Run: node memory-bank/verify/sequences.mjs [maxN]

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEQ = path.join(REPO, 'sequences');

// per sequence, the largest bound that still finishes in about a second
const QUICK = { A000001: 7, A100001: 10, A000002: 10000, A000003: 500, A000005: 2000, A000004: 60, A000007: 60, A000012: 200 };

const override = process.argv[2] ? Number(process.argv[2]) : null;
let failed = 0;

for (const seq of fs.readdirSync(SEQ).filter((d) => /^A\d{6}$/.test(d))) {
  const proof = path.join(SEQ, seq, 'proof.mjs');
  if (!fs.existsSync(proof)) { failed++; console.log(`FAIL  ${seq}: no proof.mjs`); continue; }

  const n = override ?? QUICK[seq] ?? 7;
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [proof, String(n)], { cwd: REPO, encoding: 'utf8' });
  const ms = Date.now() - t0;
  const tail = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '(no output)';

  if (r.status !== 0) { failed++; console.log(`FAIL  ${seq} (n≤${n}): ${tail}`); }
  else console.log(`ok    ${seq} (n≤${n}, ${ms} ms): ${tail}`);
}

console.log(failed === 0
  ? `\nEvery sequence reproduces its published terms and survives its own proof.`
  : `\n${failed} sequence check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
