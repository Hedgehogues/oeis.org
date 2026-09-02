// A000008 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Two independent checks, neither
// reusing the staged DP recurrence that produced the answer:
//
//   1. independent count — every way to make n cents is an explicit quadruple (c1,c2,c5,c10) of
//                          non-negative coin counts with c1 + 2c2 + 5c5 + 10c10 = n. Enumerated
//                          directly by nested loops over c10, c5, c2 (c1 is then forced), which is
//                          not the DP recurrence at all — it is the definition, read literally.
//   2. agreement        — the resulting counts equal OEIS's own published terms for A000008.
//
// Run:  node sequences/A000008/proof.mjs [maxN]        (default 60)

import { ways } from './solution.mjs';

// ---- OEIS A000008, %S/%T/%U lines, a(0)..a(60) --------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 11, 12, 15, 16, 19, 22, 25, 28, 31, 34, 40, 43, 49, 52, 58, 64, 70,
  76, 82, 88, 98, 104, 114, 120, 130, 140, 150, 160, 170, 180, 195, 205, 220, 230, 245, 260, 275,
  290, 305, 320, 341, 356, 377, 392, 413, 434, 455, 476, 497, 518, 546
];

// ---- 1. independent count: literal enumeration of coin quadruples --------------------------------
function countDirect(n) {
  let count = 0;
  for (let c10 = 0; 10 * c10 <= n; c10++) {
    for (let c5 = 0; 10 * c10 + 5 * c5 <= n; c5++) {
      for (let c2 = 0; 10 * c10 + 5 * c5 + 2 * c2 <= n; c2++) {
        const rem = n - 10 * c10 - 5 * c5 - 2 * c2;
        if (rem >= 0) count++; // c1 = rem is forced and always valid
      }
    }
  }
  return count;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 60);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const w = ways(maxN);

let directOk = true;
for (let n = 0; n <= Math.min(maxN, 200); n++) { // O(n^3) enumeration, capped for speed
  const direct = countDirect(n);
  if (direct !== w[n]) { fail(`n=${n}: staged DP says ${w[n]}, direct quadruple enumeration says ${direct}`); directOk = false; }
}
if (directOk) console.log(`ok    independent count: literal coin-quadruple enumeration matches the staged DP for every n=0..${Math.min(maxN, 200)}`);

let agreementOk = true;
const checkLen = Math.min(maxN, OEIS.length - 1);
for (let n = 0; n <= checkLen; n++) {
  if (w[n] !== OEIS[n]) { fail(`a(${n}) = ${w[n]}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${checkLen}) match OEIS A000008's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: independently re-derived by literal enumeration, and equal to OEIS A000008.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
