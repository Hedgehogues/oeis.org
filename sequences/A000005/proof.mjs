// A000005 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Four independent checks, none
// of which reuses the divisor-counting loop that produced the answer:
//
//   1. soundness      — d(n) recomputed from the prime factorisation as the product of (exponent+1),
//                       a completely different route to the same number: solution.mjs walks up to
//                       sqrt(n) counting hits, this one factorises and multiplies.
//   2. the algebra    — the relations the PAGE draws, re-derived here with this file's own
//                       convolution: the identity element, Möbius inversion, and the three
//                       classical identities whose results escape the set of functions combined.
//                       Each is checked against an independently computed target (sigma from its
//                       own divisor sum, phi from its own coprime count), never against the page.
//   3. closure fails  — the page's central claim is that this table does NOT close: combining two
//                       of the four "boring" rows lands on functions that are not among them. That
//                       is checked here as a fact, not asserted as a caption.
//   4. agreement      — the computed terms equal OEIS's own published terms for A000005.
//
// Run:  node sequences/A000005/proof.mjs [maxN]        (default 103)

import { a } from './solution.mjs';

// ---- OEIS A000005, %S/%T/%U lines, a(1)..a(103) ------------------------------------------------
const OEIS = [
  1, 2, 2, 3, 2, 4, 2, 4, 3, 4, 2, 6, 2, 4, 4, 5, 2, 6, 2, 6, 4, 4, 2, 8, 3, 4, 4, 6, 2, 8, 2, 6, 4,
  4, 4, 9, 2, 4, 4, 8, 2, 8, 2, 6, 6, 4, 2, 10, 3, 6, 4, 6, 2, 8, 4, 8, 4, 4, 2, 12, 2, 4, 6, 7, 4,
  8, 2, 6, 4, 8, 2, 12, 2, 4, 6, 6, 4, 8, 2, 10, 5, 4, 2, 12, 4, 4, 4, 8, 2, 12, 4, 6, 4, 4, 4, 12,
  2, 6, 6, 9, 2, 8, 2
];

// ---- 1. soundness: d(n) from the prime factorisation -------------------------------------------
// If n = p1^e1 · p2^e2 · … then every divisor picks an exponent 0..ei independently, so there are
// (e1+1)(e2+1)… of them. Shares no code with solution.mjs's sqrt-bounded counting loop.
function divisorCountByFactorisation(n) {
  let m = n, product = 1, p = 2;
  while (p * p <= m) {
    if (m % p === 0) {
      let e = 0;
      while (m % p === 0) { m /= p; e++; }
      product *= (e + 1);
    }
    p++;
  }
  if (m > 1) product *= 2;               // one leftover prime, exponent 1
  return product;
}

// ---- this file's own arithmetic functions and convolution --------------------------------------
function ownDivisors(n) {
  const out = [];
  for (let k = 1; k <= n; k++) if (n % k === 0) out.push(k);   // deliberately the slow, obvious way
  return out;
}
function ownConvolve(f, g) {
  return (n) => ownDivisors(n).reduce((sum, d) => sum + f(d) * g(n / d), 0);
}
const ownGcd = (x, y) => (y ? ownGcd(y, x % y) : x);

const fZERO = () => 0;
const fEPS = (n) => (n === 1 ? 1 : 0);
const fONE = () => 1;
const fID = (n) => n;
function fMU(n) {
  if (n === 1) return 1;
  let count = 0, m = n, p = 2;
  while (p * p <= m) {
    if (m % p === 0) { m /= p; if (m % p === 0) return 0; count++; }
    p++;
  }
  if (m > 1) count++;
  return count % 2 === 0 ? 1 : -1;
}
const fPHI = (n) => { let c = 0; for (let k = 1; k <= n; k++) if (ownGcd(k, n) === 1) c++; return c; };
const fSIGMA = (n) => ownDivisors(n).reduce((s, d) => s + d, 0);
const fTAU = (n) => ownDivisors(n).length;

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 103);
const ALG = Math.min(maxN, 60);          // the algebra checks are quadratic; 60 is plenty
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };
const rowOf = (f, upto) => Array.from({ length: upto }, (_, i) => f(i + 1));
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

// 1. soundness
let soundOk = true;
for (let n = 1; n <= maxN; n++) {
  const got = a(n), want = divisorCountByFactorisation(n);
  if (got !== want) { fail(`n=${n}: solution.mjs says d(n)=${got}, factorisation says ${want}`); soundOk = false; }
}
if (soundOk) console.log(`ok    soundness: d(n) from the sqrt-bounded count equals d(n) from the prime factorisation for every n=1..${maxN}`);

// 2. the algebra the page draws
const checks = [
  ['identity element: eps * ONE = ONE', ownConvolve(fEPS, fONE), fONE],
  ['identity element: eps * ID = ID', ownConvolve(fEPS, fID), fID],
  ['identity element: eps * MU = MU', ownConvolve(fEPS, fMU), fMU],
  ['identity element: eps * PHI = PHI', ownConvolve(fEPS, fPHI), fPHI],
  ['ONE * ONE = d(n)', ownConvolve(fONE, fONE), fTAU],
  ['Möbius inversion: MU * ONE = eps', ownConvolve(fMU, fONE), fEPS],
  ['ID * ONE = sigma', ownConvolve(fID, fONE), fSIGMA],
  ['ID * MU = phi', ownConvolve(fID, fMU), fPHI],
  ['PHI * ONE = ID', ownConvolve(fPHI, fONE), fID],
  ['ONE * ZERO = ZERO', ownConvolve(fONE, fZERO), fZERO],
];
let algebraOk = true;
for (const [label, lhs, rhs] of checks) {
  if (!same(rowOf(lhs, ALG), rowOf(rhs, ALG))) { fail(`the algebra: ${label} does not hold`); algebraOk = false; }
}
// commutativity and associativity on concrete triples
const cast = [fZERO, fEPS, fONE, fID, fMU, fPHI];
for (const f of cast) for (const g of cast) {
  if (!same(rowOf(ownConvolve(f, g), 20), rowOf(ownConvolve(g, f), 20))) { fail('the algebra: convolution is not commutative'); algebraOk = false; }
  for (const h of cast) {
    if (!same(rowOf(ownConvolve(ownConvolve(f, g), h), 14), rowOf(ownConvolve(f, ownConvolve(g, h)), 14))) {
      fail('the algebra: convolution is not associative'); algebraOk = false;
    }
  }
}
if (algebraOk) console.log(`ok    the algebra: all ${checks.length} relations the page draws hold through n=${ALG}, and convolution is commutative and associative on every triple of the cast`);

// 3. the page's central claim: the table does NOT close
const actors = [['ZERO', fZERO], ['eps', fEPS], ['ONE', fONE], ['ID', fID]];
const actorRows = actors.map(([, f]) => rowOf(f, ALG));
const escaped = [];
for (const [na, fa] of actors) {
  for (const [nb, fb] of actors) {
    const result = rowOf(ownConvolve(fa, fb), ALG);
    if (!actorRows.some((r) => same(r, result))) escaped.push(`${na}*${nb}`);
  }
}
if (escaped.length === 0) fail('the page claims this table escapes its own headers, but every cell landed back on an actor');
else console.log(`ok    non-closure: ${escaped.length} of the ${actors.length ** 2} cells land outside the four actors (${escaped.join(', ')}) — the page's central claim, checked rather than captioned`);

// 4. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agree = true;
for (let n = 1; n <= checkLen; n++) if (a(n) !== OEIS[n - 1]) { agree = false; fail(`a(${n}) = ${a(n)}, OEIS says ${OEIS[n - 1]}`); }
if (agree) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000005's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, the drawn algebra holds, the table provably does not close, and the terms equal OEIS A000005.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
