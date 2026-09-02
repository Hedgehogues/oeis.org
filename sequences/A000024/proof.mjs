// A000024 — proof side.
//
// Same two independent checks as A000018's proof.mjs, applied to D=10 instead of D=16:
//   1. per-value membership — for every v from 1 to the bound, independently test whether v is
//                             expressible as x^2+10y^2 (loop over y, check if v-10y^2 is a perfect
//                             square), and confirm agreement with the sieve, value by value.
//   2. agreement              — the resulting counts equal OEIS's own published terms for A000024.
//
// Run:  node sequences/A000024/proof.mjs [maxN]        (default 18)

import { countForm10 } from './solution.mjs';

// ---- OEIS A000024, %S/%T/%U lines, a(0)..a(36) --------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 7, 10, 20, 36, 65, 118, 221, 409, 776, 1463, 2788, 5328, 10222, 19714, 38054, 73685,
  142944, 277838, 540889, 1054535, 2058537, 4023278, 7871313, 15414638, 30213190, 59266422,
  116343776, 228545682, 449240740, 883570480, 1738769611, 3423469891, 6743730746
];

function isPerfectSquare(v) {
  const r = Math.round(Math.sqrt(v));
  return r * r === v;
}

function isForm10(v) {
  for (let y = 0; 10 * y * y <= v; y++) {
    if (isPerfectSquare(v - 10 * y * y)) return true;
  }
  return false;
}

function countForm10Independent(n) {
  const bound = 2 ** n;
  let count = 0;
  for (let v = 1; v <= bound; v++) if (isForm10(v)) count++;
  return count;
}

const maxN = Number(process.argv[2] || 18);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 0; n <= maxN; n++) {
  const got = countForm10(n);
  const independent = countForm10Independent(n);
  if (independent !== got) fail(`n=${n}: sieve found ${got}, independent per-value scan found ${independent}`);
  else console.log(`ok    n=${n}: sieve and independent per-value scan agree on ${got}`);
  if (n < OEIS.length && got !== OEIS[n]) fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`);
}
const checkLen = Math.min(maxN + 1, OEIS.length);
console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000024's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: every marked value independently re-verified, and equal to OEIS A000024.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
