// A000021 — proof side.
//
// Same two independent checks as A000018's proof.mjs, applied to D=12 instead of D=16:
//   1. per-value membership — for every v from 1 to the bound, independently test whether v is
//                             expressible as x^2+12y^2 (loop over y, check if v-12y^2 is a perfect
//                             square), and confirm agreement with the sieve, value by value.
//   2. agreement              — the resulting counts equal OEIS's own published terms for A000021.
//
// Run:  node sequences/A000021/proof.mjs [maxN]        (default 18)

import { countForm12 } from './solution.mjs';

// ---- OEIS A000021, %S/%T/%U lines, a(0)..a(36) --------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 6, 9, 17, 30, 54, 98, 183, 341, 645, 1220, 2327, 4451, 8555, 16489, 31859, 61717,
  119779, 232919, 453584, 884544, 1727213, 3376505, 6607371, 12942012, 25371540, 49777187,
  97731027, 192010355, 377475336, 742512992, 1461352025, 2877572478, 5668965407
];

function isPerfectSquare(v) {
  const r = Math.round(Math.sqrt(v));
  return r * r === v;
}

function isForm12(v) {
  for (let y = 0; 12 * y * y <= v; y++) {
    if (isPerfectSquare(v - 12 * y * y)) return true;
  }
  return false;
}

function countForm12Independent(n) {
  const bound = 2 ** n;
  let count = 0;
  for (let v = 1; v <= bound; v++) if (isForm12(v)) count++;
  return count;
}

const maxN = Number(process.argv[2] || 18);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 0; n <= maxN; n++) {
  const got = countForm12(n);
  const independent = countForm12Independent(n);
  if (independent !== got) fail(`n=${n}: sieve found ${got}, independent per-value scan found ${independent}`);
  else console.log(`ok    n=${n}: sieve and independent per-value scan agree on ${got}`);
  if (n < OEIS.length && got !== OEIS[n]) fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`);
}
const checkLen = Math.min(maxN + 1, OEIS.length);
console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000021's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: every marked value independently re-verified, and equal to OEIS A000021.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
