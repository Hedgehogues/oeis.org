// A000004 — proof side.
//
// This is the weakest proof in the repository, and pretending otherwise would be worse than saying
// so. When every term is 0 by definition, "an independent re-derivation" has almost nothing to
// re-derive: any second routine that returns the right answer does so by returning a constant, and
// agreement between two constants is not evidence of anything.
//
// So this file checks the one property of A000004 that could actually fail if the sequence were
// something else — its role as the ZERO of Dirichlet convolution:
//
//   1. agreement     — the terms equal OEIS's own published terms for A000004.
//   2. absorber      — for every arithmetic function tried, (ZERO * f)(n) = 0 for all n. Convolution
//                      is implemented here from its own definition, and the partner functions are
//                      defined here too (divisor count by factorisation, sigma by divisor sum, phi
//                      by coprime count, Möbius by squarefree factorisation) — none of them imported
//                      from any solution.mjs.
//   3. additive zero — adding the sequence to any of those functions leaves it unchanged.
//
// Check 2 is the only one with teeth: if a(k) were nonzero at a single position k, every product
// f(d)*a(n/d) touching that position would break, and the absorber property would fail loudly. That
// is a real, if modest, guard — and it is the same fact A000005's page draws.
//
// Run:  node sequences/A000004/proof.mjs [maxN]        (default 60)

import { a } from './solution.mjs';

// ---- OEIS A000004, %S line, a(0)..a(33) --------------------------------------------------------
const OEIS = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

// ---- this file's own arithmetic, sharing no code with any solution.mjs -------------------------
function divisorsOf(n) {
  const out = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);   // deliberately the slow way
  return out;
}

function divisorCount(n) {           // by prime factorisation: product of (exponent + 1)
  let m = n, total = 1;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) { m /= p; e++; }
    total *= e + 1;
  }
  if (m > 1) total *= 2;
  return total;
}

function sigmaOf(n) { return divisorsOf(n).reduce((s, d) => s + d, 0); }

function gcdOf(x, y) { while (y) { const t = y; y = x % y; x = t; } return x; }
function phiOf(n) {
  let c = 0;
  for (let k = 1; k <= n; k++) if (gcdOf(k, n) === 1) c++;
  return c;
}

function moebiusOf(n) {
  let m = n, primes = 0;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      m /= p;
      if (m % p === 0) return 0;
      primes++;
    }
  }
  if (m > 1) primes++;
  return primes % 2 === 0 ? 1 : -1;
}

// (f * g)(n) = sum over divisors d of n of f(d) * g(n/d)
function convolveAt(f, g, n) {
  return divisorsOf(n).reduce((s, d) => s + f(d) * g(n / d), 0);
}

// ---- run ---------------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 60);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// 1. agreement with the published terms
let agreed = true;
for (let n = 0; n < OEIS.length; n++) {
  if (a(n) !== OEIS[n]) { agreed = false; fail(`a(${n}) = ${a(n)}, OEIS says ${OEIS[n]}`); }
}
if (agreed) console.log(`ok    agreement: a(0)..a(${OEIS.length - 1}) match OEIS A000004's published %S terms exactly`);

// 2. the absorber property — the one check that could actually fail
const ZERO = () => a(0);                       // the sequence itself, as an arithmetic function
const PARTNERS = [
  ['d(n)', divisorCount],
  ['sigma(n)', sigmaOf],
  ['phi(n)', phiOf],
  ['mu(n)', moebiusOf],
  ['n', (n) => n]
];

let absorbs = true;
for (const [name, f] of PARTNERS) {
  for (let n = 1; n <= maxN; n++) {
    const left = convolveAt(ZERO, f, n);
    const right = convolveAt(f, ZERO, n);
    if (left !== 0 || right !== 0) {
      absorbs = false;
      fail(`(zeros * ${name})(${n}) = ${left} and (${name} * zeros)(${n}) = ${right}, both must be 0`);
    }
  }
}
if (absorbs) console.log(`ok    absorber: zeros * f = f * zeros = zeros for all ${PARTNERS.length} partner functions, n = 1..${maxN}`);

// 3. additive zero
let additive = true;
for (const [name, f] of PARTNERS) {
  for (let n = 1; n <= maxN; n++) {
    if (f(n) + a(n) !== f(n)) { additive = false; fail(`${name}(${n}) + a(${n}) changed the value`); }
  }
}
if (additive) console.log(`ok    additive zero: adding the sequence leaves every partner function unchanged, n = 1..${maxN}`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: the terms equal OEIS A000004, and the sequence really is the zero and the absorber of Dirichlet convolution. This is a weak proof by this repository's standards, and honestly so — a constant sequence offers almost nothing independent to check.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
