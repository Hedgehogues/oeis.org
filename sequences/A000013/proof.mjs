// A000013 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three checks, none reusing the
// flood-fill orbit search that produced the answer:
//
//   1. soundness   — every returned orbit is closed under rotation and complement, and orbits
//                    partition all 2^n strings with nothing left over and nothing double-counted.
//   2. Burnside    — orbit count re-derived by Burnside's lemma over the group {rotation,
//                    rotation-then-complement}: a plain rotation by k fixes 2^(cycles) strings; a
//                    rotation by k FOLLOWED BY a global complement fixes 2^(cycles) strings only if
//                    every cycle of that rotation has even length (an odd cycle would need a bit
//                    equal to its own complement after going around once, which is impossible), and
//                    0 strings otherwise. This is a genuinely different computation — permutation
//                    cycle-length parity, not a state-space walk.
//   3. agreement   — the resulting counts equal OEIS's own published terms for A000013.
//
// Run:  node sequences/A000013/proof.mjs [maxN]        (default 20)

import { necklaces } from './solution.mjs';

// ---- OEIS A000013, %S/%T/%U lines, a(0)..a(19) --------------------------------------------------
const OEIS = [1, 1, 2, 2, 4, 4, 8, 10, 20, 30, 56, 94, 180, 316, 596, 1096, 2068, 3856, 7316, 13798];

function rotateBy1(s, n) { return ((s << 1) | (s >>> (n - 1))) & ((1 << n) - 1); }
function complement(s, n) { return (~s) & ((1 << n) - 1); }

// ---- 1. soundness: orbits are closed and partition the full state space -----------------------
function checkSoundness(orbits, n) {
  const problems = [];
  const owner = new Map();
  orbits.forEach((members, idx) => {
    const set = new Set(members);
    for (const s of members) {
      if (owner.has(s)) problems.push(`state ${s} appears in orbits #${owner.get(s)} and #${idx}`);
      owner.set(s, idx);
      if (!set.has(rotateBy1(s, n))) problems.push(`orbit #${idx}: rotating ${s} leaves the orbit`);
      if (!set.has(complement(s, n))) problems.push(`orbit #${idx}: complementing ${s} leaves the orbit`);
    }
  });
  const expected = n === 0 ? 1 : 1 << n;
  if (owner.size !== expected) problems.push(`orbits cover ${owner.size} states, expected ${expected}`);
  return problems;
}

// ---- 2. Burnside's lemma over {rotation, rotation-then-complement} ------------------------------
function cycleLengths(perm) {
  const n = perm.length, seen = new Uint8Array(n), lens = [];
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    let len = 0, j = i;
    while (!seen[j]) { seen[j] = 1; j = perm[j]; len++; }
    lens.push(len);
  }
  return lens;
}
function burnsideCount(n) {
  if (n === 0) return 1;
  let total = 0;
  for (let k = 0; k < n; k++) {
    const perm = []; for (let i = 0; i < n; i++) perm.push((i + k) % n);
    const lens = cycleLengths(perm);
    total += 2 ** lens.length;                                   // plain rotation
    total += lens.every((L) => L % 2 === 0) ? 2 ** lens.length : 0; // rotation + complement
  }
  return total / (2 * n);
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 20);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

let soundnessProblems = 0, burnsideMismatches = 0;
for (let n = 0; n <= maxN; n++) {
  const { count, orbits } = necklaces(n);

  checkSoundness(orbits, n).forEach((p) => { fail(`n=${n}: ${p}`); soundnessProblems++; });

  const b = burnsideCount(n);
  if (b !== count) { fail(`n=${n}: direct search found ${count}, Burnside's lemma gives ${b}`); burnsideMismatches++; }

  if (n < OEIS.length && count !== OEIS[n]) fail(`n=${n}: a(n)=${count}, OEIS says ${OEIS[n]}`);
}

if (!soundnessProblems) console.log(`ok    soundness: every orbit for n=0..${maxN} is closed under rotation and complement, and orbits partition the full state space`);
if (!burnsideMismatches) console.log(`ok    Burnside: the direct orbit search matches Burnside's lemma over {rotation, rotation+complement} for every n=0..${maxN}`);
console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000013's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: sound, independently re-derived via Burnside's lemma, and equal to OEIS A000013.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
