// A000012 — proof side.
//
// The values restate the definition, so re-deriving them proves nothing. What is checked here is
// what makes this sequence the most productive constant in the algebra of arithmetic functions —
// four relations, each computed with this file's own convolution against targets this file computes
// from their own definitions:
//
//   1. agreement       — the terms equal OEIS's own published terms for A000012.
//   2. ones * ones = d — convolved with itself, this sequence gives the number of divisors, checked
//                        against a divisor count computed from prime factorisations (A000005).
//   3. ones * n = sigma— convolved with the identity function it gives the sum of divisors, checked
//                        against a sum computed by enumerating divisors (A000203).
//   4. ones * phi = n  — convolved with Euler's totient it returns the identity function, checked
//                        against phi computed by counting coprimes (A000010).
//   5. ones * mu = eps — it has an inverse, the Möbius function: their convolution is the identity
//                        element. This is Möbius inversion (A008683).
//
// Every one of these would break loudly if a single term of A000012 were not 1: each is a sum over
// divisors in which this sequence contributes a factor at every position.
//
// Run:  node sequences/A000012/proof.mjs [maxN]        (default 200)

import { a } from './solution.mjs';

// ---- OEIS A000012, %S line, a(0)..a(33) --------------------------------------------------------
const OEIS = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
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
const maxN = Number(process.argv[2] || 200);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// the sequence itself, used as an arithmetic function indexed from 1
const ONE = (n) => a(n);

// 1. agreement with the published terms
let agreed = true;
for (let n = 0; n < OEIS.length; n++) {
  if (a(n) !== OEIS[n]) { agreed = false; fail(`a(${n}) = ${a(n)}, OEIS says ${OEIS[n]}`); }
}
if (agreed) console.log(`ok    agreement: a(0)..a(${OEIS.length - 1}) match OEIS A000012's published %S terms exactly`);

// 2..5. the four relations that make this sequence worth an entry
const RELATIONS = [
  ['ones * ones = d(n)      (A000005)', ONE, ONE, divisorCount],
  ['ones * n    = sigma(n)  (A000203)', ONE, (n) => n, sigmaOf],
  ['ones * phi  = n         (A000010)', ONE, phiOf, (n) => n],
  ['ones * mu   = eps       (A008683)', ONE, moebiusOf, (n) => (n === 1 ? 1 : 0)]
];

for (const [label, f, g, target] of RELATIONS) {
  let holds = true;
  for (let n = 1; n <= maxN; n++) {
    const got = convolveAt(f, g, n);
    const want = target(n);
    if (got !== want) { holds = false; fail(`${label}: at n=${n} got ${got}, want ${want}`); }
  }
  if (holds) console.log(`ok    ${label} — holds for n = 1..${maxN}`);
}

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: the terms equal OEIS A000012, and the all-1s row produces the divisor count, the divisor sum and the identity function under Dirichlet convolution, with the Möbius function as its inverse.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
