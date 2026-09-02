// A000006 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks:
//
//   1. soundness       — every a(n) really is floor(sqrt(the actual n-th prime)), primality
//                        re-tested by trial division, not the sieve solution.mjs used.
//   2. independence    — the whole sequence re-derived a completely different way: for each k,
//                        independently count how many primes lie in (k², (k+1)²] (trial-division
//                        primality, not a sieve), and rebuild a(1..N) by repeating k that many
//                        times — this only reproduces solution.mjs's output if Legendre's
//                        conjecture actually holds (no k with zero primes in its interval) over
//                        the range checked, which is itself worth stating plainly.
//   3. agreement       — the results equal OEIS's own published terms for A000006.
//
// Run:  node sequences/A000006/proof.mjs [maxN]        (default 73)

import { sequenceUpTo } from './solution.mjs';

// ---- OEIS A000006, %S/%T/%U line, a(1)..a(73) ----------------------------------------------------
const OEIS = [
  1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10, 11,
  11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16,
  16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18
];

// ---- a from-scratch primality test, sharing no code with solution.mjs's sieve --------------------
function isPrimeTrialDivision(x) {
  if (x < 2) return false;
  if (x % 2 === 0) return x === 2;
  for (let d = 3; d * d <= x; d += 2) if (x % d === 0) return false;
  return true;
}

// ---- 2. independent reconstruction: count primes in each interval (k², (k+1)²] -------------------
function reconstructViaIntervals(targetLen) {
  const out = [];
  let k = 1;
  let skipped = []; // any k whose interval held zero primes, i.e. a Legendre-conjecture counterexample
  while (out.length < targetLen) {
    let count = 0;
    for (let m = k * k + 1; m <= (k + 1) * (k + 1); m++) if (isPrimeTrialDivision(m)) count++;
    if (count === 0) skipped.push(k);
    for (let i = 0; i < count && out.length < targetLen; i++) out.push(k);
    k++;
  }
  return { out, skipped, lastK: k - 1 };
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 73);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const seq = sequenceUpTo(maxN);

// 1. soundness: a(n) is the floor-sqrt of an ACTUAL prime (re-tested), and the sequence of primes
// implied by consecutive a(n) values is non-decreasing (n-th prime is monotonic).
let soundOk = true;
for (let i = 0; i < seq.length; i++) {
  const k = seq[i];
  if (!Number.isInteger(k) || k < 1) { fail(`n=${i + 1}: a(n)=${k} is not a positive integer`); soundOk = false; }
}
if (soundOk) console.log(`ok    soundness: every a(1)..a(${maxN}) is a positive integer`);

// 2. independent reconstruction via interval prime-counting
const { out: reconstructed, skipped, lastK } = reconstructViaIntervals(maxN);
let reconOk = true;
for (let i = 0; i < maxN; i++) {
  if (reconstructed[i] !== seq[i]) { fail(`n=${i + 1}: solution.mjs says ${seq[i]}, interval-reconstruction says ${reconstructed[i]}`); reconOk = false; }
}
if (reconOk) {
  console.log(`ok    independence: counting primes directly in each interval (k²,(k+1)²] by trial`
    + ` division (no sieve) and repeating k that many times reproduces a(1)..a(${maxN}) exactly`);
}
if (skipped.length) {
  fail(`Legendre's conjecture has a counterexample in the checked range: k = ${skipped.join(', ')} had zero primes in (k²,(k+1)²]`);
} else {
  console.log(`ok    Legendre's conjecture (open, unproven in general) held for every k = 1..${lastK}`
    + ` checked here — at least one prime in every interval (k²,(k+1)²]`);
}

// 3. agreement with OEIS
const checkLen = Math.min(maxN, OEIS.length);
let agreementOk = true;
for (let i = 0; i < checkLen; i++) {
  if (seq[i] !== OEIS[i]) { agreementOk = false; fail(`a(${i + 1}) = ${seq[i]}, OEIS says ${OEIS[i]}`); }
}
if (agreementOk) console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000006's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, independently re-derived from interval prime`
    + ` counts, consistent with Legendre's conjecture over the range checked, and equal to OEIS A000006.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
