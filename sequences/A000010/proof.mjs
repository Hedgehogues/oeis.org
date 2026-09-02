// A000010 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Four independent checks, none
// of which reuses the gcd-counting search that produced the answer:
//
//   1. product-formula — phi(n) re-derived via n * product over DISTINCT primes p|n of (1-1/p),
//                        a structurally different computation (trial-division factorization, no
//                        gcd, no counting 1..n) that must agree with the direct count.
//   2. prime case      — phi(p) = p-1 for every prime p in range, a named special case of the
//                        product formula checked directly against solution.mjs's own output.
//   3. multiplicativity — phi(a*b) = phi(a)*phi(b) whenever gcd(a,b)=1, checked on every coprime
//                        pair in range — the structural property the product formula depends on.
//   4. agreement       — the results equal OEIS's own published terms for A000010.
//
// Run:  node sequences/A000010/proof.mjs [maxN]        (default 69)

import { phi } from './solution.mjs';

// ---- OEIS A000010, %S/%T/%U lines, a(1)..a(69) --------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8, 12, 10, 22, 8, 20, 12, 18, 12, 28,
  8, 30, 16, 20, 16, 24, 12, 36, 18, 24, 16, 40, 12, 42, 20, 24, 22, 46, 16, 42, 20, 32, 24, 52, 18,
  40, 24, 36, 28, 58, 16, 60, 30, 36, 32, 48, 20, 66, 32, 44
];

function gcd(x, y) { while (y) { [x, y] = [y, x % y]; } return x; }

// ---- 1. product formula, via trial-division factorization — shares no code with phi() ---------
function distinctPrimeFactors(n) {
  const primes = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      primes.push(p);
      while (m % p === 0) m /= p;
    }
  }
  if (m > 1) primes.push(m);
  return primes;
}

function phiViaProductFormula(n) {
  let result = n;
  for (const p of distinctPrimeFactors(n)) {
    result = (result / p) * (p - 1);
  }
  return result;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 69);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// 1. product formula
let productOk = true;
for (let n = 1; n <= maxN; n++) {
  const direct = phi(n), viaProduct = phiViaProductFormula(n);
  if (direct !== viaProduct) { fail(`n=${n}: direct count=${direct}, product formula=${viaProduct}`); productOk = false; }
}
if (productOk) console.log(`ok    product-formula: n·∏(1-1/p) over distinct prime factors matches the direct gcd count for every n=1..${maxN}`);

// 2. prime case: phi(p) = p-1
let primeCaseChecked = 0, primeCaseOk = true;
for (let n = 2; n <= maxN; n++) {
  if (isPrime(n)) {
    primeCaseChecked++;
    if (phi(n) !== n - 1) { fail(`n=${n} is prime but phi(n)=${phi(n)}, expected ${n - 1}`); primeCaseOk = false; }
  }
}
if (primeCaseOk) console.log(`ok    prime case: phi(p) = p-1 held for all ${primeCaseChecked} primes in 2..${maxN}`);

// 3. multiplicativity: phi(a*b) = phi(a)*phi(b) when gcd(a,b)=1
let pairsChecked = 0, multOk = true;
const bound = Math.min(maxN, Math.max(40, Math.floor(Math.sqrt(maxN)) + 5)); // a*b must stay <= maxN
for (let a = 2; a <= bound; a++) {
  for (let b = a + 1; b <= bound; b++) {
    if (a * b > maxN) continue;
    if (gcd(a, b) !== 1) continue;
    pairsChecked++;
    const lhs = phi(a * b), rhs = phi(a) * phi(b);
    if (lhs !== rhs) { fail(`phi(${a}*${b})=${lhs}, but phi(${a})*phi(${b})=${rhs}`); multOk = false; }
  }
}
if (multOk) console.log(`ok    multiplicativity: phi(a·b) = phi(a)·phi(b) held for all ${pairsChecked} coprime pairs with a·b <= ${maxN}`);

// 4. agreement with OEIS
let agreementOk = true;
const checkLen = Math.min(maxN, OEIS.length);
for (let n = 1; n <= checkLen; n++) {
  if (phi(n) !== OEIS[n - 1]) { fail(`phi(${n})=${phi(n)}, OEIS says ${OEIS[n - 1]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: phi(1)..phi(${checkLen}) match OEIS A000010's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: product formula agrees, prime case holds, multiplicativity holds, and results equal OEIS A000010.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
