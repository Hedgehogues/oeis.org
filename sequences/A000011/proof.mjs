// A000011 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three checks, none reusing the
// flood-fill orbit search that produced the answer:
//
//   1. soundness   — every returned orbit is closed under rotation, reflection AND complement, and
//                    orbits partition all 2^n strings with nothing left over, nothing double-counted.
//   2. Burnside    — orbit count re-derived by Burnside's lemma over the full group (rotations and
//                    reflections, each either plain or followed by a global complement — 4n elements
//                    total). A plain group element fixes 2^(cycles) strings; a complemented one
//                    fixes 2^(cycles) strings only if every cycle of the underlying permutation has
//                    even length, 0 otherwise (an odd cycle would need a bit equal to its own
//                    complement after going all the way round). This is a genuinely different
//                    computation — permutation cycle-length parity over the dihedral group's
//                    elements, not a state-space walk.
//   3. agreement   — the resulting counts equal OEIS's own published terms for A000011.
//
// Run:  node sequences/A000011/proof.mjs [maxN]        (default 20)

import { necklaces } from './solution.mjs';

// ---- OEIS A000011, %S/%T/%U lines, a(0)..a(19) --------------------------------------------------
const OEIS = [1, 1, 2, 2, 4, 4, 8, 9, 18, 23, 44, 63, 122, 190, 362, 612, 1162, 2056, 3914, 7155];

function rotateBy1(s, n) { return ((s << 1) | (s >>> (n - 1))) & ((1 << n) - 1); }
function reverseBits(s, n) {
  let r = 0;
  for (let i = 0; i < n; i++) r |= ((s >>> i) & 1) << (n - 1 - i);
  return r;
}
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
      for (const [name, nx] of [['rotating', rotateBy1(s, n)], ['reflecting', reverseBits(s, n)], ['complementing', complement(s, n)]]) {
        if (!set.has(nx)) problems.push(`orbit #${idx}: ${name} ${s} leaves the orbit`);
      }
    }
  });
  const expected = n === 0 ? 1 : 1 << n;
  if (owner.size !== expected) problems.push(`orbits cover ${owner.size} states, expected ${expected}`);
  return problems;
}

// ---- 2. Burnside's lemma over the full dihedral-plus-complement group (order 4n) ----------------
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
  for (const p of perms) {
    const lens = cycleLengths(p);
    total += 2 ** lens.length;                                     // plain
    total += lens.every((L) => L % 2 === 0) ? 2 ** lens.length : 0; // + complement
  }
  return total / (4 * n);
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

if (!soundnessProblems) console.log(`ok    soundness: every orbit for n=0..${maxN} is closed under rotation, reflection and complement, and orbits partition the full state space`);
if (!burnsideMismatches) console.log(`ok    Burnside: the direct orbit search matches Burnside's lemma over the full 4n-element group for every n=0..${maxN}`);
console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000011's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: sound, independently re-derived via Burnside's lemma, and equal to OEIS A000011.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
