// A000015 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks:
//
//   1. soundness    — every a(n) really is a prime power (or 1) and a(n) >= n.
//   2. independence — a(n) re-derived via a SIEVE marking every p^k up to a bound (not
//                     solution.mjs's trial-division-per-candidate scan), then a linear search for
//                     the smallest marked value >= n.
//   3. agreement    — the results equal OEIS's own published terms for A000015.
//
// Also checked directly: grouping the sequence into runs of equal value, each run's length is
// exactly the GAP between that prime power and the previous one — a structural fact about the
// sequence, not the per-term rule, and the one the page's picture actually draws.
//
// Run:  node sequences/A000015/proof.mjs [maxN]        (default 72)

import { a as solutionA } from './solution.mjs';

// ---- OEIS A000015, %S/%T/%U line, a(1)..a(72) -----------------------------------------------
const OEIS = [
  1, 2, 3, 4, 5, 7, 7, 8, 9, 11, 11, 13, 13, 16, 16, 16, 17, 19, 19, 23, 23, 23, 23, 25, 25, 27, 27,
  29, 29, 31, 31, 32, 37, 37, 37, 37, 37, 41, 41, 41, 41, 43, 43, 47, 47, 47, 47, 49, 49, 53, 53, 53,
  53, 59, 59, 59, 59, 59, 59, 61, 61, 64, 64, 64, 67, 67, 67, 71, 71, 71, 71, 73
];

// ---- 2. independent construction: sieve every prime power up to a bound, no trial division per
// candidate — this shares no code path with solution.mjs's smallestPrimeFactor/isPrimePower.
function primePowersUpTo(limit) {
  const isComposite = new Uint8Array(limit + 1);
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (!isComposite[i]) { primes.push(i); for (let j = i * i; j <= limit; j += i) isComposite[j] = 1; }
  }
  const marked = new Uint8Array(limit + 1);
  marked[1] = 1; // this entry's own boundary convention
  for (const p of primes) {
    let pk = p;
    while (pk <= limit) { marked[pk] = 1; pk *= p; }
  }
  const sorted = [];
  for (let i = 1; i <= limit; i++) if (marked[i]) sorted.push(i);
  return { marked, sorted };
}

function aViaSieve(n, marked) {
  let x = n;
  while (x < marked.length && !marked[x]) x++;
  return x;
}

function isPrimePowerIndependent(x, marked) {
  return x < marked.length ? !!marked[x] : null;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 72);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const bound = maxN + 200; // room for a(maxN) to land comfortably inside the sieve
const { marked, sorted } = primePowersUpTo(bound);

const seq = [];
for (let n = 1; n <= maxN; n++) seq.push(solutionA(n));

// 1. soundness
let soundOk = true;
for (let n = 1; n <= maxN; n++) {
  const v = seq[n - 1];
  if (v < n) { fail(`n=${n}: a(n)=${v} is less than n`); soundOk = false; }
  const isPP = isPrimePowerIndependent(v, marked);
  if (isPP === false) { fail(`n=${n}: a(n)=${v} is not a prime power (independently checked)`); soundOk = false; }
}
if (soundOk) console.log(`ok    soundness: every a(1)..a(${maxN}) is a prime power (or 1) and a(n) >= n`);

// 2. independence: sieve-based reconstruction
let indepOk = true;
for (let n = 1; n <= maxN; n++) {
  const viaSieve = aViaSieve(n, marked);
  if (viaSieve !== seq[n - 1]) { fail(`n=${n}: solution.mjs says ${seq[n - 1]}, sieve-based reconstruction says ${viaSieve}`); indepOk = false; }
}
if (indepOk) console.log(`ok    independence: a sieve marking every p^k up to ${bound} (no per-candidate trial division) reproduces a(1)..a(${maxN}) exactly`);

// structural check: runs of equal value have length = gap to the previous prime power.
// The LAST value in the truncated array may belong to a run that continues past maxN — its true
// length is unknown from this window alone, so it's excluded from the comparison (the same
// truncated-last-run handling A000002/A000003's proofs use for their own run-length checks).
let gapOk = true;
let prevPP = 0; // "previous prime power" before the first one (1) is 0, giving gap 1
const lastValue = seq[seq.length - 1];
for (let i = 0; i < sorted.length && sorted[i] <= lastValue; i++) {
  const pp = sorted[i];
  const gap = pp - prevPP;
  const runLen = seq.filter((v) => v === pp).length;
  if (runLen > 0 && pp !== lastValue && runLen !== gap) {
    fail(`prime power ${pp}: run length in the sequence is ${runLen}, but the gap since the previous prime power ${prevPP} is ${gap}`);
    gapOk = false;
  }
  prevPP = pp;
}
if (gapOk) console.log(`ok    structure: every run's length in a(1)..a(${maxN}) equals the gap since the previous prime power`);

// 3. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agreementOk = true;
for (let i = 0; i < checkLen; i++) {
  if (seq[i] !== OEIS[i]) { agreementOk = false; fail(`a(${i + 1}) = ${seq[i]}, OEIS says ${OEIS[i]}`); }
}
if (agreementOk) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000015's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, independently re-derived via a sieve, the run/gap structure holds, and equal to OEIS A000015.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
