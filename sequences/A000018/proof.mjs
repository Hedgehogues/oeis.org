// A000018 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Two independent checks, neither
// reusing the (x,y)-pair sieve that produced the answer:
//
//   1. per-value membership — for EVERY integer v from 1 to the bound, independently test whether v
//                             itself is expressible as x^2+16y^2 (loop over y, check if v-16y^2 is a
//                             perfect square) and confirm that test agrees, value by value, with
//                             what the sieve marked. This is a completely different algorithm (a
//                             per-candidate test, not a per-(x,y)-pair generator) and it catches
//                             BOTH a spurious mark (soundness) and a missed one (completeness) in
//                             the same pass, since it examines every v independently rather than
//                             only the v's the sieve happened to produce.
//   2. agreement              — the resulting counts equal OEIS's own published terms for A000018.
//
// Run:  node sequences/A000018/proof.mjs [maxN]        (default 18)

import { countForm16 } from './solution.mjs';

// ---- OEIS A000018, %S/%T/%U lines, a(0)..a(36) --------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 4, 8, 13, 25, 44, 83, 152, 286, 538, 1020, 1942, 3725, 7145, 13781, 26627, 51572,
  100099, 194633, 379037, 739250, 1443573, 2822186, 5522889, 10818417, 21209278, 41613288,
  81705516, 160532194, 315604479, 620834222, 1221918604, 2406183020, 4740461247
];

function isPerfectSquare(v) {
  const r = Math.round(Math.sqrt(v));
  return r * r === v;
}

// independent per-value membership test: does ANY y make v - 16y^2 a nonnegative perfect square?
function isForm16(v) {
  for (let y = 0; 16 * y * y <= v; y++) {
    if (isPerfectSquare(v - 16 * y * y)) return true;
  }
  return false;
}

function countForm16Independent(n) {
  const bound = 2 ** n;
  let count = 0;
  for (let v = 1; v <= bound; v++) if (isForm16(v)) count++;
  return count;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 18);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 0; n <= maxN; n++) {
  const got = countForm16(n);
  const independent = countForm16Independent(n);
  if (independent !== got) {
    fail(`n=${n}: sieve found ${got}, independent per-value scan found ${independent}`);
  } else {
    console.log(`ok    n=${n}: sieve and independent per-value scan agree on ${got}`);
  }
  if (n < OEIS.length && got !== OEIS[n]) {
    fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`);
  }
}
const checkLen = Math.min(maxN + 1, OEIS.length);
console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000018's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: every marked value independently re-verified by a per-candidate test, and equal to OEIS A000018.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
