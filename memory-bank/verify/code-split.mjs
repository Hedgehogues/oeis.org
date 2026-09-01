// Checks that the implementation/proof pair is actually a pair, and not one file twice.
//
// The split only means anything while two properties hold, and both are easy to lose by accident
// during an optimisation: the implementation must not consult a table of published terms (it would
// then be confirming its own input), and the proof must not reuse the routine whose output it is
// judging (it would then agree with itself for free). Neither shows up as a wrong answer — the
// numbers stay right and the evidence quietly stops being evidence.
//
// Checked for every sequence:
//   1. both solution.mjs and proof.mjs exist;
//   2. solution.mjs holds no array of published terms — no numeric literal long enough to be one;
//   3. proof.mjs does hold published terms, because comparing against them is its job;
//   4. proof.mjs does not import the isomorphism / equivalence routine from solution.mjs, the one
//      routine whose correctness decides the count;
//   5. proof.mjs defines an equivalence test of its own.
//
// Run: node memory-bank/verify/code-split.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEQ = path.join(REPO, 'sequences');

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// a numeric array literal with at least this many entries reads as a table of answers
const TABLE_LEN = 6;
const longArrays = (src) => {
  const out = [];
  for (const m of src.matchAll(/\[\s*(-?\d+(?:\s*,\s*-?\d+){5,})\s*\]/g)) {
    out.push(m[1].split(',').length);
  }
  return out;
};

// strip comments before looking for a lookup table: the header is allowed to quote the terms
const stripComments = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const sequences = fs.readdirSync(SEQ).filter((d) => /^A\d{6}$/.test(d));

for (const seq of sequences) {
  const solPath = path.join(SEQ, seq, 'solution.mjs');
  const prfPath = path.join(SEQ, seq, 'proof.mjs');

  if (!fs.existsSync(solPath)) { fail(`${seq}: no solution.mjs`); continue; }
  if (!fs.existsSync(prfPath)) { fail(`${seq}: no proof.mjs`); continue; }

  const sol = fs.readFileSync(solPath, 'utf8');
  const prf = fs.readFileSync(prfPath, 'utf8');

  // 2. the implementation may not look its answers up
  const tables = longArrays(stripComments(sol));
  if (tables.length) {
    fail(`${seq}: solution.mjs contains a numeric array of ${tables[0]} entries — an implementation that consults published terms confirms its own input`);
  }

  // 3. the proof must
  if (!longArrays(stripComments(prf)).some((n) => n >= TABLE_LEN)) {
    fail(`${seq}: proof.mjs holds no table of published terms — it has nothing independent to compare against`);
  }

  // 4/5. the proof must not borrow the routine it is judging
  const imported = prf.match(/import\s*\{([^}]*)\}\s*from\s*'\.\/solution\.mjs'/);
  const names = imported ? imported[1].split(',').map((x) => x.trim()) : [];
  const borrowed = names.filter((n) => /^(isomorphic|equivalent|canonical|dedup)/i.test(n));
  if (borrowed.length) {
    fail(`${seq}: proof.mjs imports ${borrowed.join(', ')} from solution.mjs — the routine that decides the count cannot also be the one that checks it`);
  }
  if (!/function\s+(isomorphic|findIsomorphism|isGroup|isConfiguration)/.test(prf)) {
    fail(`${seq}: proof.mjs defines no validity or equivalence test of its own`);
  }
}

console.log(failed === 0
  ? `All ${sequences.length} sequences: implementation consults no answers, proof consults the published terms and brings its own equivalence test.`
  : `\n${failed} code-split check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
