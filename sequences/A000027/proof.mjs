// A000027 — proof side.
//
// a(n) = n is the definition, so re-deriving the values proves nothing. What is checked here is the
// sequence's role in the algebra of arithmetic functions — three relations, each computed with this
// file's own convolution against targets this file computes from their own definitions:
//
//   1. agreement        — the terms equal OEIS's own published terms for A000027.
//   2. n * ones = sigma — convolved with the all-1s row it gives the sum of divisors (A000203),
//                         checked against a sum computed by enumerating divisors.
//   3. n * mu = phi     — convolved with the Möbius function it gives Euler's totient (A000010),
//                         checked against phi computed by counting coprimes.
//   4. phi * ones = n   — and it is REBUILT from the other two: the totients of the divisors of n
//                         add up to n. This is A000005's page's closing frame, verified here rather
//                         than trusted from the picture.
//   5. the partition behind (4) — for each n, the fractions k/n for k = 1..n, reduced to lowest
//                         terms, are bucketed by denominator; each bucket must have exactly phi(d)
//                         members and the buckets must together account for all n fractions. This
//                         checks the ARGUMENT the page draws, not only its arithmetic conclusion.
//
// Run:  node sequences/A000027/proof.mjs [maxN]        (default 200)

import { a } from './solution.mjs';

// ---- OEIS A000027, %S line, a(1)..a(26) --------------------------------------------------------
const OEIS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
];

// ---- this file's own arithmetic, sharing no code with any solution.mjs -------------------------
function divisorsOf(n) {
  const out = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);   // deliberately the slow way
  return out;
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

// the fractions k/n in lowest terms, bucketed by their reduced denominator
function denominatorBuckets(n) {
  const buckets = new Map();
  for (let k = 1; k <= n; k++) {
    const d = n / gcdOf(k, n);
    buckets.set(d, (buckets.get(d) || 0) + 1);
  }
  return buckets;
}

// ---- run ---------------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 200);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const ID = (n) => a(n);
const ONE = () => 1;

// 1. agreement with the published terms
let agreed = true;
for (let i = 0; i < OEIS.length; i++) {
  const n = i + 1;
  if (a(n) !== OEIS[i]) { agreed = false; fail(`a(${n}) = ${a(n)}, OEIS says ${OEIS[i]}`); }
}
if (agreed) console.log(`ok    agreement: a(1)..a(${OEIS.length}) match OEIS A000027's published %S terms exactly`);

// 2..4. the relations that give this sequence its role
const RELATIONS = [
  ['n   * ones = sigma(n)  (A000203)', ID, ONE, sigmaOf],
  ['n   * mu   = phi(n)    (A000010)', ID, moebiusOf, phiOf],
  ['phi * ones = n         (A000027)', phiOf, ONE, ID]
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

// 5. the partition argument the page draws, checked rather than trusted
let partitionOk = true;
for (let n = 1; n <= maxN; n++) {
  const buckets = denominatorBuckets(n);
  let total = 0;
  for (const d of divisorsOf(n)) {
    const size = buckets.get(d) || 0;
    const want = phiOf(d);
    if (size !== want) {
      partitionOk = false;
      fail(`n=${n}: the fractions k/${n} reducing to denominator ${d} number ${size}, want phi(${d}) = ${want}`);
    }
    total += size;
  }
  if (total !== n) {
    partitionOk = false;
    fail(`n=${n}: the buckets hold ${total} fractions in total, want ${n}`);
  }
}
if (partitionOk) console.log(`ok    the page's own argument: for every n = 1..${maxN}, the n fractions k/n bucket by reduced denominator d into groups of exactly phi(d), accounting for all n`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: the terms equal OEIS A000027, the sequence produces sigma and phi under Dirichlet convolution, and it is rebuilt exactly by the totients of its own divisors — including the fraction-bucket argument the page draws.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
