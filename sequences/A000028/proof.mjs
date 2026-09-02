// A000028 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks:
//
//   1. soundness     — every returned m really has an ODD total exponent-popcount, reconstructed
//                      via a smallest-prime-factor sieve (not solution.mjs's trial division) and a
//                      from-scratch popcount (Kernighan's bit trick, not shift-and-mask).
//   2. completeness  — every m NOT returned, between consecutive terms, has an EVEN sum — nothing
//                      was skipped that should have been included, checked directly rather than
//                      trusted from the generation loop alone.
//   3. agreement     — the results equal OEIS's own published terms for A000028.
//
// Run:  node sequences/A000028/proof.mjs [maxN]        (default 67)

import { sequenceUpTo } from './solution.mjs';

// ---- OEIS A000028, %S/%T/%U line, a(1)..a(67) -----------------------------------------------
const OEIS = [
  2, 3, 4, 5, 7, 9, 11, 13, 16, 17, 19, 23, 24, 25, 29, 30, 31, 37, 40, 41, 42, 43, 47, 49, 53, 54,
  56, 59, 60, 61, 66, 67, 70, 71, 72, 73, 78, 79, 81, 83, 84, 88, 89, 90, 96, 97, 101, 102, 103, 104,
  105, 107, 108, 109, 110, 113, 114, 121, 126, 127, 128, 130, 131, 132, 135, 136, 137
];

// ---- independent factorization via a smallest-prime-factor sieve ------------------------------
function spfSieveUpTo(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i] === 0) for (let j = i; j <= limit; j += i) if (spf[j] === 0) spf[j] = i;
  }
  return spf;
}
function exponentsViaSieve(n, spf) {
  const exps = [];
  let m = n;
  while (m > 1) {
    const p = spf[m];
    let k = 0;
    while (m % p === 0) { m /= p; k++; }
    exps.push(k);
  }
  return exps;
}
// Kernighan's bit-counting trick — a different algorithm from solution.mjs's shift-and-mask loop
function popcountKernighan(x) {
  let c = 0;
  while (x) { x &= x - 1; c++; }
  return c;
}
function sumIndependent(n, spf) {
  if (n === 1) return 0;
  return exponentsViaSieve(n, spf).reduce((s, k) => s + popcountKernighan(k), 0);
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 67);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const seq = sequenceUpTo(maxN);
const bound = seq[seq.length - 1];
const spf = spfSieveUpTo(bound + 10);

// 1. soundness
let soundOk = true;
for (const m of seq) {
  const sum = sumIndependent(m, spf);
  if (sum % 2 !== 1) { fail(`m=${m}: independent exponent-popcount sum is ${sum} (even), should be odd`); soundOk = false; }
}
if (soundOk) console.log(`ok    soundness: every one of the ${seq.length} returned values has an odd exponent-popcount sum (independently re-derived via a sieve + Kernighan's bit-count)`);

// 2. completeness: every m NOT in the sequence, up to the last returned value, must have an EVEN sum
let completeOk = true;
const inSeq = new Set(seq);
let checkedAbsent = 0;
for (let m = 2; m <= bound; m++) {
  if (inSeq.has(m)) continue;
  checkedAbsent++;
  const sum = sumIndependent(m, spf);
  if (sum % 2 !== 0) { fail(`m=${m}: excluded from the sequence, but its exponent-popcount sum is ${sum} (odd) — it should have been included`); completeOk = false; }
}
if (completeOk) console.log(`ok    completeness: every one of the ${checkedAbsent} excluded values below ${bound} really has an even sum — nothing was skipped`);

// 3. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agreementOk = true;
for (let i = 0; i < checkLen; i++) {
  if (seq[i] !== OEIS[i]) { agreementOk = false; fail(`a(${i + 1}) = ${seq[i]}, OEIS says ${OEIS[i]}`); }
}
if (agreementOk) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000028's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, complete (no odd-sum value skipped), and equal to OEIS A000028.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
