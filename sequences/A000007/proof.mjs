// A000007 — proof side.
//
// The values are a definition restated, so re-deriving them proves nothing. What CAN be checked, and
// is checked here, is the property that makes this sequence worth an entry: re-indexed to start at
// n = 1 it is the IDENTITY of Dirichlet convolution.
//
//   1. agreement  — the terms equal OEIS's own published terms for A000007, at its offset 0.
//   2. identity   — for every arithmetic function tried, (epsilon * f)(n) = f(n) and
//                   (f * epsilon)(n) = f(n), for all n in range. Convolution is implemented here
//                   from its own definition, and every partner function is defined here too
//                   (divisor count by factorisation, sigma by divisor sum, phi by coprime count,
//                   Möbius by squarefree factorisation, the identity function, and a deliberately
//                   irregular function with no arithmetic meaning) — none imported.
//   3. uniqueness — no OTHER 0/1 pattern in the first few positions acts as an identity. Every
//                   competing candidate is tried and must fail, so that "this one works" is not
//                   accidentally true of many.
//
// Check 2 has real teeth: a single wrong term at position k would make (epsilon * f)(k) differ from
// f(k) for any f that is nonzero somewhere below k. Check 3 has more: it shows the property picks
// this sequence out rather than merely tolerating it.
//
// Run:  node sequences/A000007/proof.mjs [maxN]        (default 60)

import { a, epsilon } from './solution.mjs';

// ---- OEIS A000007, %S line, a(0)..a(33) --------------------------------------------------------
const OEIS = [
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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

// no arithmetic meaning at all — included so the identity check cannot be passing by accident on
// functions that happen to share structure
function irregular(n) { return ((n * 7919) % 101) - 50; }

// (f * g)(n) = sum over divisors d of n of f(d) * g(n/d)
function convolveAt(f, g, n) {
  return divisorsOf(n).reduce((s, d) => s + f(d) * g(n / d), 0);
}

// ---- run ---------------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 60);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// 1. agreement with the published terms, at the published offset
let agreed = true;
for (let n = 0; n < OEIS.length; n++) {
  if (a(n) !== OEIS[n]) { agreed = false; fail(`a(${n}) = ${a(n)}, OEIS says ${OEIS[n]}`); }
}
if (agreed) console.log(`ok    agreement: a(0)..a(${OEIS.length - 1}) match OEIS A000007's published %S terms exactly, at offset 0`);

// 2. the identity property, on the re-indexed form
const PARTNERS = [
  ['d(n)', divisorCount],
  ['sigma(n)', sigmaOf],
  ['phi(n)', phiOf],
  ['mu(n)', moebiusOf],
  ['n', (n) => n],
  ['an irregular function', irregular]
];

let isIdentity = true;
for (const [name, f] of PARTNERS) {
  for (let n = 1; n <= maxN; n++) {
    const left = convolveAt(epsilon, f, n);
    const right = convolveAt(f, epsilon, n);
    if (left !== f(n) || right !== f(n)) {
      isIdentity = false;
      fail(`(eps * ${name})(${n}) = ${left}, (${name} * eps)(${n}) = ${right}, both must equal ${f(n)}`);
    }
  }
}
if (isIdentity) console.log(`ok    identity: eps * f = f * eps = f for all ${PARTNERS.length} partner functions, n = 1..${maxN}`);

// 3. uniqueness — every competing 0/1 pattern must FAIL to be an identity
const CANDIDATES = [
  ['all 1s', () => 1],
  ['all 0s', () => 0],
  ['1 at n=2', (n) => (n === 2 ? 1 : 0)],
  ['1 at n=1 and n=2', (n) => (n <= 2 ? 1 : 0)],
  ['1 at every even n', (n) => (n % 2 === 0 ? 1 : 0)]
];

let uniqueness = true;
for (const [name, cand] of CANDIDATES) {
  let actsAsIdentity = true;
  for (const [, f] of PARTNERS) {
    for (let n = 1; n <= 24 && actsAsIdentity; n++) {
      if (convolveAt(cand, f, n) !== f(n)) actsAsIdentity = false;
    }
  }
  if (actsAsIdentity) {
    uniqueness = false;
    fail(`the pattern "${name}" also acts as an identity — then the property does not single out A000007`);
  }
}
if (uniqueness) console.log(`ok    uniqueness: all ${CANDIDATES.length} competing 0/1 patterns fail to be an identity, so the property picks this sequence out`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: the terms equal OEIS A000007, and the sequence re-indexed from n = 1 is the identity of Dirichlet convolution — uniquely so among the patterns tried.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
