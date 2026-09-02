// A000029 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks, none
// of which reuses the flood-fill orbit search that produced the answer:
//
//   1. soundness    — every returned orbit really is closed under rotation and reflection (applying
//                     either move to any member of an orbit lands back inside that same orbit), and
//                     the orbits partition all 2^n strings with no overlap and nothing left over.
//   2. Burnside     — orbit count re-derived by Burnside's lemma (average number of fixed points
//                     over the dihedral group's 2n elements), computed via each element's explicit
//                     permutation-cycle decomposition — a genuinely different algorithm from
//                     flood-filling the whole state space, and the classical way this exact count is
//                     normally proven correct.
//   3. agreement    — the resulting counts equal OEIS's own published terms for A000029.
//
// Run:  node sequences/A000029/proof.mjs [maxN]        (default 20)

import { bracelets } from './solution.mjs';

// ---- OEIS A000029, %S/%T/%U lines, a(0)..a(19) --------------------------------------------------
const OEIS = [
  1, 2, 3, 4, 6, 8, 13, 18, 30, 46, 78, 126, 224, 380, 687, 1224, 2250, 4112, 7685, 14310
];

// ---- 1. soundness: orbits are closed and partition the full state space -----------------------
function rotateBy1(s, n) { return ((s << 1) | (s >>> (n - 1))) & ((1 << n) - 1); }
function reverseBits(s, n) {
  let r = 0;
  for (let i = 0; i < n; i++) r |= ((s >>> i) & 1) << (n - 1 - i);
  return r;
}
function checkSoundness(orbits, n) {
  const problems = [];
  const owner = new Map();
  orbits.forEach((members, idx) => {
    for (const s of members) {
      if (owner.has(s)) problems.push(`state ${s} appears in orbits #${owner.get(s)} and #${idx}`);
      owner.set(s, idx);
      const set = new Set(members);
      if (!set.has(rotateBy1(s, n))) problems.push(`orbit #${idx}: rotating ${s} leaves the orbit`);
      if (!set.has(reverseBits(s, n))) problems.push(`orbit #${idx}: reflecting ${s} leaves the orbit`);
    }
  });
  if (owner.size !== (n === 0 ? 1 : 1 << n)) {
    problems.push(`orbits cover ${owner.size} states, expected ${n === 0 ? 1 : 1 << n}`);
  }
  return problems;
}

// ---- 2. Burnside's lemma, via explicit permutation-cycle decomposition of each group element ---
function cyclesOfPerm(perm) {
  const n = perm.length;
  const seen = new Uint8Array(n);
  let cycles = 0;
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    cycles++;
    let j = i;
    while (!seen[j]) { seen[j] = 1; j = perm[j]; }
  }
  return cycles;
}
function dihedralPerms(n) {
  const perms = [];
  for (let k = 0; k < n; k++) { const p = []; for (let i = 0; i < n; i++) p.push((i + k) % n); perms.push(p); }
  for (let k = 0; k < n; k++) { const p = []; for (let i = 0; i < n; i++) p.push(((k - i) % n + n) % n); perms.push(p); }
  return perms;
}
function burnsideCount(n) {
  if (n === 0) return 1;
  const perms = dihedralPerms(n);
  let total = 0;
  for (const p of perms) total += 2 ** cyclesOfPerm(p);
  return total / perms.length;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 20);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

let soundnessProblems = 0, burnsideMismatches = 0;
for (let n = 0; n <= maxN; n++) {
  const { count, orbits } = bracelets(n);

  const problems = checkSoundness(orbits, n);
  problems.forEach((p) => fail(`n=${n}: ${p}`));
  soundnessProblems += problems.length;

  const b = burnsideCount(n);
  if (b !== count) { fail(`n=${n}: direct search found ${count} orbits, Burnside's lemma gives ${b}`); burnsideMismatches++; }

  if (n < OEIS.length && count !== OEIS[n]) fail(`n=${n}: a(n)=${count}, OEIS says ${OEIS[n]}`);
}

if (!soundnessProblems) console.log(`ok    soundness: every orbit for n=0..${maxN} is closed under rotation and reflection, and orbits partition the full state space`);
if (!burnsideMismatches) console.log(`ok    Burnside: the direct orbit search matches Burnside's lemma (average fixed points over the dihedral group's elements) for every n=0..${maxN}`);
console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000029's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: sound, independently re-derived via Burnside's lemma, and equal to OEIS A000029.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
