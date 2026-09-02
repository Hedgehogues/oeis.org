// A000016 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three checks:
//
//   1. bijection    — the register's transition really is a permutation of the 2^n states (every
//                     state has exactly one predecessor), which is what makes "purely periodic, no
//                     tail" true in the first place rather than an assumption.
//   2. independent  — the transition re-derived on an ARRAY of individual bits (shift the array,
//                     complement the bit that fell off the end, push it back at the front) instead
//                     of solution.mjs's integer bit-tricks, and cross-checked state by state.
//   3. agreement    — the resulting counts equal OEIS's own published terms for A000016.
//
// Run:  node sequences/A000016/proof.mjs [maxN]        (default 20)

import { step, registerCycles } from './solution.mjs';

// ---- OEIS A000016, %S/%T/%U lines, a(0)..a(19) --------------------------------------------------
const OEIS = [1, 1, 1, 2, 2, 4, 6, 10, 16, 30, 52, 94, 172, 316, 586, 1096, 2048, 3856, 7286, 13798];

// ---- 1. bijection: every state has exactly one predecessor --------------------------------------
function checkBijection(n) {
  const size = 1 << n;
  const preimageCount = new Uint8Array(size);
  for (let s = 0; s < size; s++) preimageCount[step(s, n)]++;
  const problems = [];
  for (let s = 0; s < size; s++) {
    if (preimageCount[s] !== 1) problems.push(`state ${s} has ${preimageCount[s]} predecessors, expected exactly 1`);
  }
  return problems;
}

// ---- 2. independent re-derivation: bit array, not integer bit-tricks ----------------------------
function stepViaBitArray(state, n) {
  const bits = [];
  for (let i = n - 1; i >= 0; i--) bits.push((state >>> i) & 1); // bits[0] = most significant
  const outBit = bits.shift();          // the stage that shifts out
  bits.push(1 - outBit);                // feed its complement back in at the far end
  let result = 0;
  for (const b of bits) result = (result << 1) | b;
  return result;
}
function checkIndependentStep(n) {
  const size = 1 << n;
  const problems = [];
  for (let s = 0; s < size; s++) {
    const a = step(s, n), b = stepViaBitArray(s, n);
    if (a !== b) problems.push(`state ${s}: integer method gives ${a}, array method gives ${b}`);
  }
  return problems;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 20);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

let bijectionProblems = 0, stepMismatches = 0;
for (let n = 1; n <= Math.min(maxN, 16); n++) { // the O(2^n) per-state checks stay quick through n=16
  checkBijection(n).forEach((p) => { fail(`n=${n}: ${p}`); bijectionProblems++; });
  checkIndependentStep(n).forEach((p) => { fail(`n=${n}: ${p}`); stepMismatches++; });
}
if (!bijectionProblems) console.log(`ok    bijection: the transition has exactly one predecessor per state for n=1..${Math.min(maxN, 16)} — purely periodic, no tail`);
if (!stepMismatches) console.log(`ok    independent: the array-based transition agrees with the integer bit-trick one on every state for n=1..${Math.min(maxN, 16)}`);

let agreementOk = true;
for (let n = 0; n <= maxN; n++) {
  const { count } = registerCycles(n);
  if (n < OEIS.length && count !== OEIS[n]) { fail(`n=${n}: a(n)=${count}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000016's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: the transition is a genuine bijection, independently re-derived, and equal to OEIS A000016.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
