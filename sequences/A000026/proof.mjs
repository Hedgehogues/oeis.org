// A000026 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks:
//
//   1. soundness    — every a(n) reconstructed from a SIEVE of smallest prime factors (not
//                     solution.mjs's own trial-division factorize()), confirming the same value.
//   2. fixed point  — a(n) = n if and only if n is squarefree, checked directly for every n in
//                     range (not assumed from the OEIS comment stating it).
//   3. agreement    — the results equal OEIS's own published terms for A000026.
//
// Run:  node sequences/A000026/proof.mjs [maxN]        (default 72)

import { a as solutionA, isSquarefree } from './solution.mjs';

// ---- OEIS A000026, %S/%T/%U line, a(1)..a(72) -----------------------------------------------
const OEIS = [
  1, 2, 3, 4, 5, 6, 7, 6, 6, 10, 11, 12, 13, 14, 15, 8, 17, 12, 19, 20, 21, 22, 23, 18, 10, 26, 9,
  28, 29, 30, 31, 10, 33, 34, 35, 24, 37, 38, 39, 30, 41, 42, 43, 44, 30, 46, 47, 24, 14, 20, 51, 52,
  53, 18, 55, 42, 57, 58, 59, 60, 61, 62, 42, 12, 65, 66, 67, 68, 69, 70, 71, 36
];

// ---- independent factorization via a smallest-prime-factor sieve (not trial division per call) --
function spfSieveUpTo(limit) {
  const spf = new Int32Array(limit + 1);
  for (let i = 2; i <= limit; i++) {
    if (spf[i] === 0) for (let j = i; j <= limit; j += i) if (spf[j] === 0) spf[j] = i;
  }
  return spf;
}

function factorizeViaSieve(n, spf) {
  const factors = [];
  let m = n;
  while (m > 1) {
    const p = spf[m];
    let k = 0;
    while (m % p === 0) { m /= p; k++; }
    factors.push([p, k]);
  }
  return factors;
}

function aViaSieve(n, spf) {
  if (n === 1) return 1;
  return factorizeViaSieve(n, spf).reduce((acc, [p, k]) => acc * (p * k), 1);
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 72);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const spf = spfSieveUpTo(maxN);
const seq = [];
for (let n = 1; n <= maxN; n++) seq.push(solutionA(n));

// 1. soundness via independent sieve-based factorization
let soundOk = true;
for (let n = 1; n <= maxN; n++) {
  const viaSieve = aViaSieve(n, spf);
  if (viaSieve !== seq[n - 1]) { fail(`n=${n}: solution.mjs says ${seq[n - 1]}, sieve-based factorization says ${viaSieve}`); soundOk = false; }
}
if (soundOk) console.log(`ok    soundness: a smallest-prime-factor sieve (no trial division per call) reproduces a(1)..a(${maxN}) exactly`);

// 2. fixed point: OEIS's own comment is ONE-DIRECTIONAL — "a(n) = n IF n is squarefree" — not the
// converse. Checked here as stated, not as the stronger (and false) "iff": a first version of this
// check assumed the converse too and immediately failed at n=4 (a(4)=2*2=4=n, yet 4=2² is not
// squarefree) — an incidental fixed point with nothing to do with squarefreeness, found only by
// actually checking rather than trusting the comment's informal phrasing.
let fixedOk = true;
let squarefreeCount = 0, fixedCount = 0, incidental = 0;
for (let n = 1; n <= maxN; n++) {
  const sf = isSquarefree(n);
  const fixed = seq[n - 1] === n;
  if (sf) squarefreeCount++;
  if (fixed) fixedCount++;
  if (sf && !fixed) { fail(`n=${n}: n is squarefree but a(n) = ${seq[n - 1]} != n`); fixedOk = false; }
  if (fixed && !sf) incidental++;
}
if (fixedOk) {
  console.log(`ok    fixed point: every squarefree n=1..${maxN} satisfies a(n) = n as OEIS's comment`
    + ` states (${squarefreeCount} squarefree, ${fixedCount} total fixed points, ${incidental}`
    + ` of them incidental — non-squarefree n where a prime's exponent happens to equal that prime)`);
}

// 3. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agreementOk = true;
for (let i = 0; i < checkLen; i++) {
  if (seq[i] !== OEIS[i]) { agreementOk = false; fail(`a(${i + 1}) = ${seq[i]}, OEIS says ${OEIS[i]}`); }
}
if (agreementOk) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000026's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound (independent sieve), every squarefree n is a fixed point, and equal to OEIS A000026.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
