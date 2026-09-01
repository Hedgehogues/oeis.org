// A000002 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks, none
// of which reuses the bootstrap that produced the answer:
//
//   1. soundness       — every term is 1 or 2, and a(1) = 1, exactly as the definition requires.
//   2. self-consistency — the sequence's own definitional claim: read the sequence back through a
//                         plain, from-scratch run-length scan (no self-reference, no read pointer,
//                         just "walk the array and count runs") and check that the resulting run
//                         lengths equal the sequence's own leading terms. This is the one property
//                         that makes it THE Kolakoski sequence rather than an arbitrary 1/2 string.
//   3. agreement        — the computed terms equal OEIS's own published terms for A000002.
//
// Run:  node sequences/A000002/proof.mjs [maxN]        (default 1000)

import { kolakoski } from './solution.mjs';

// ---- OEIS A000002, %S/%T/%U lines, a(1)..a(107) ------------------------------------------------
const OEIS = [
  1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2,
  1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2,
  1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2,
  2, 1, 2, 1, 1, 2, 1, 2, 2
];

// ---- 1. soundness ---------------------------------------------------------------------------
function checkSoundness(seq) {
  const problems = [];
  if (seq[0] !== 1) problems.push(`a(1) = ${seq[0]}, must be 1 by definition`);
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] !== 1 && seq[i] !== 2) problems.push(`a(${i + 1}) = ${seq[i]}, not in {1, 2}`);
  }
  return problems;
}

// ---- 2. self-consistency: an independent run-length scan, sharing no code with solution.mjs ---
// Plain left-to-right scan: no read pointer, no self-reference — it does not know or care that the
// array it's reading was built self-referentially. The last run is dropped before comparing, since
// the array was truncated mid-sequence and that run's true length is unknown.
function runLengthsOf(seq) {
  const lengths = [];
  let i = 0;
  while (i < seq.length) {
    let j = i;
    while (j < seq.length && seq[j] === seq[i]) j++;
    lengths.push(j - i);
    i = j;
  }
  return lengths;
}

function checkSelfConsistency(seq) {
  const lengths = runLengthsOf(seq);
  const complete = lengths.slice(0, -1); // drop the possibly-truncated last run
  const mismatches = [];
  for (let k = 0; k < complete.length; k++) {
    if (complete[k] !== seq[k]) mismatches.push(`run ${k + 1} has length ${complete[k]}, but a(${k + 1}) = ${seq[k]}`);
  }
  return { completeRuns: complete.length, mismatches };
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 1000);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const seq = Array.from(kolakoski(maxN));

// 1. soundness
const soundnessProblems = checkSoundness(seq);
soundnessProblems.forEach((p) => fail(`n=${maxN}: ${p}`));
if (!soundnessProblems.length) console.log(`ok    soundness: all ${maxN} terms are 1 or 2, a(1) = 1`);

// 2. self-consistency (the definitional check, done from scratch)
const { completeRuns, mismatches } = checkSelfConsistency(seq);
mismatches.forEach((m) => fail(`n=${maxN}: ${m}`));
if (!mismatches.length) {
  console.log(`ok    self-consistency: ${completeRuns} complete runs scanned from a(1)..a(${maxN}), every run length equals the corresponding a(k) — the sequence is its own run-length encoding`);
}

// 3. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agreementOk = true;
for (let k = 0; k < checkLen; k++) {
  if (seq[k] !== OEIS[k]) { agreementOk = false; fail(`a(${k + 1}) = ${seq[k]}, OEIS says ${OEIS[k]}`); }
}
if (agreementOk) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000002's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, self-consistent (a fixed point of run-length encoding), and equal to OEIS A000002 for the first ${checkLen} terms.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
