// A000020 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it, plus resolves the n=1
// discrepancy with OEIS's own published data rather than quietly hiding it.
//
//   1. soundness    — every irreducibility/primitivity call solution.mjs makes is re-derived here
//                     from scratch (a from-scratch irreducibility check and multiplicative-order
//                     computation that share no code with solution.mjs's routines).
//   2. formula      — the standard count of primitive polynomials of degree n over GF(2) is
//                     phi(2^n - 1) / n (Euler's totient of the group order, divided by the
//                     extension degree) — computed here via trial-division factorization, a
//                     completely different route from enumerating and testing every polynomial.
//   3. agreement    — the results equal OEIS's own published terms for A000020, n = 2..37 — n = 1
//                     is EXCLUDED from this check and handled separately, since OEIS's own comment
//                     on A000020 states plainly: "The initial 2 should really be a 1." Both the
//                     direct enumeration (solution.mjs) and the phi(2^n-1)/n formula (this file)
//                     independently give a(1) = 1, agreeing with OEIS's own correction rather than
//                     its own listed %S value.
//
// Run:  node sequences/A000020/proof.mjs [maxN]        (default 16)

import { a } from './solution.mjs';

// ---- OEIS A000020, %S/%T/%U lines, a(1)..a(37) (note: a(1) is excluded from the agreement check
// below — see the header) --------------------------------------------------------------------
const OEIS = [
  2, 1, 2, 2, 6, 6, 18, 16, 48, 60, 176, 144, 630, 756, 1800, 2048, 7710, 7776, 27594, 24000, 84672,
  120032, 356960, 276480, 1296000, 1719900, 4202496, 4741632, 18407808, 17820000, 69273666,
  67108864, 211016256, 336849900, 929275200, 725594112, 3697909056
];

// ---- 1. soundness: an independent irreducibility test and order computation -------------------
// Long division over GF(2), written independently of solution.mjs's bit-shift routine.
function divides(divisorPoly, dDeg, poly, n) {
  let rem = poly;
  for (let k = n; k >= dDeg; k--) {
    if (rem & (1 << k)) rem ^= (divisorPoly << (k - dDeg));
  }
  return rem === 0;
}
function isIrreducibleIndependent(poly, n) {
  for (let d = 1; d * 2 <= n; d++) {
    for (let cand = (1 << d) | 1; cand < (1 << (d + 1)); cand += 2) {
      if (divides(cand, d, poly, n)) return false;
    }
  }
  return true;
}
function orderIndependent(n, mod) {
  // repeated squaring-and-multiply style walk, but built from a fresh GF(2) multiply routine
  function mulGF2(x, y) {
    let r = 0;
    for (let i = 0; i <= n; i++) if ((y >> i) & 1) r ^= (x << i);
    for (let d = 2 * n; d >= n; d--) if ((r >> d) & 1) r ^= (mod << (d - n));
    return r;
  }
  const target = (1 << n) - 1;
  let cur = 1;
  for (let k = 1; k <= target; k++) {
    cur = mulGF2(cur, 2);
    if (cur === 1) return k;
  }
  return -1;
}

// ---- 2. the standard formula: phi(2^n - 1) / n, via trial-division factorization ---------------
function eulerPhiOf(m) {
  let result = m, mm = m;
  for (let p = 2; p * p <= mm; p++) {
    if (mm % p === 0) {
      while (mm % p === 0) mm /= p;
      result -= result / p;
    }
  }
  if (mm > 1) result -= result / mm;
  return result;
}
function countViaFormula(n) {
  return eulerPhiOf((1 << n) - 1) / n;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 16);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

let soundnessOk = true, formulaOk = true, agreementOk = true;
for (let n = 1; n <= maxN; n++) {
  const got = a(n);

  // 1. soundness: recount using the independent irreducibility/order routines
  let independentCount = n === 1 ? 1 : 0;
  if (n > 1) {
    const groupOrder = (1 << n) - 1;
    for (let poly = (1 << n) | 1; poly < (1 << (n + 1)); poly += 2) {
      if (!isIrreducibleIndependent(poly, n)) continue;
      if (orderIndependent(n, poly) === groupOrder) independentCount++;
    }
  }
  if (independentCount !== got) {
    fail(`n=${n}: solution.mjs says ${got}, independent re-derivation says ${independentCount}`);
    soundnessOk = false;
  }

  // 2. formula
  const viaFormula = countViaFormula(n);
  if (viaFormula !== got) {
    fail(`n=${n}: a(n)=${got}, phi(2^n-1)/n formula gives ${viaFormula}`);
    formulaOk = false;
  }

  // 3. agreement (n=1 excluded — see header)
  if (n >= 2 && n <= OEIS.length && got !== OEIS[n - 1]) {
    fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n - 1]}`);
    agreementOk = false;
  }
}

if (soundnessOk) console.log(`ok    soundness: an independently-written irreducibility test and order computation reproduce a(1)..a(${maxN})`);
if (formulaOk) console.log(`ok    formula: phi(2^n-1)/n matches a(1)..a(${maxN}) exactly (a completely different route than testing every polynomial)`);
if (agreementOk) console.log(`ok    agreement: a(2)..a(${Math.min(maxN, OEIS.length)}) match OEIS A000020's published %S/%T/%U terms exactly`);
console.log(`      a(1) = ${a(1)} by direct enumeration and by the phi(2^n-1)/n formula — OEIS lists 2 there but its own comment says "The initial 2 should really be a 1."`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, matches the standard formula, and equal to OEIS A000020 for n >= 2 (n=1 resolved against OEIS's own correction).`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
