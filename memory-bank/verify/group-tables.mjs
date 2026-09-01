// Independent check of every group-multiplication table embedded in this repo's A000001 pages
// (sequences/A000001/viz.html and sequences/A000001/drafts/*.html): latin square, associativity,
// identity at index 0, and the self-inverse (diagonal) count each page's caption claims.
//
// Run: node memory-bank/verify/group-tables.mjs
//
// This mirrors — line for line — the multiplication functions actually written into the pages'
// own <script> blocks (mulV4, mulC4 in viz.html; C(n)/XOR/C4xC2/D8/Q8 in drafts/v1-heatmap.html).
// If a page's group math is ever edited, this file's copies must be edited to match, or it stops
// checking what's actually shipped.

function C(n) { return (a, b) => (a + b) % n; }
function XOR() { return (a, b) => a ^ b; }
function C4xC2() {
  return (a, b) => {
    const a1 = a >> 1, a2 = a & 1, b1 = b >> 1, b2 = b & 1;
    return (((a1 + b1) % 4) << 1) | ((a2 + b2) % 2);
  };
}
function D8() {
  return (a, b) => {
    const i1 = a >> 1, j1 = a & 1, i2 = b >> 1, j2 = b & 1;
    const i = (((i1 + (j1 ? -i2 : i2)) % 4) + 4) % 4;
    return (i << 1) | ((j1 + j2) % 2);
  };
}
function Q8() {
  const U = [
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[1, 0], [0, 1], [3, 0], [2, 1]],
    [[2, 0], [3, 1], [0, 1], [1, 0]],
    [[3, 0], [2, 0], [1, 1], [0, 1]],
  ];
  return (a, b) => {
    const u1 = a >> 1, s1 = a & 1, u2 = b >> 1, s2 = b & 1;
    const [u, f] = U[u1][u2];
    return (u << 1) | ((s1 ^ s2 ^ f) & 1);
  };
}

function checkGroup(name, n, f) {
  // Latin square: every row and column is a permutation of 0..n-1.
  for (let r = 0; r < n; r++) {
    const row = new Set(), col = new Set();
    for (let c = 0; c < n; c++) { row.add(f(r, c)); col.add(f(c, r)); }
    if (row.size !== n || col.size !== n) {
      return { ok: false, reason: `not a latin square at row/col ${r}` };
    }
  }
  // Associativity, exhaustive over all triples.
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
    if (f(f(a, b), c) !== f(a, f(b, c))) {
      return { ok: false, reason: `not associative at (${a},${b},${c})` };
    }
  }
  // Identity at index 0.
  for (let a = 0; a < n; a++) {
    if (f(0, a) !== a || f(a, 0) !== a) return { ok: false, reason: '0 is not the identity' };
  }
  // Self-inverse count (diagonal cells equal to identity) — this is the number every page
  // renders as the highlighted-diagonal count next to each table.
  let selfInverse = 0;
  for (let a = 0; a < n; a++) if (f(a, a) === 0) selfInverse++;
  return { ok: true, selfInverse };
}

const cases = [
  // sequences/A000001/viz.html — the two groups compared throughout ("What counts" / 1c)
  ['V4 (rectangle, rhombus)', 4, XOR(), 4],
  ['C4 (pinwheel)', 4, C(4), 2],
  // sequences/A000001/drafts/v1-heatmap.html — the 5 groups of order 8
  ['C8', 8, C(8), 2],
  ['C4×C2', 8, C4xC2(), 4],
  ['C2³ (elementary abelian)', 8, XOR(), 8],
  ['D8 (dihedral)', 8, D8(), 6],
  ['Q8 (quaternion)', 8, Q8(), 2],
];

let failed = 0;
for (const [name, n, f, expectedSelfInverse] of cases) {
  const r = checkGroup(name, n, f);
  if (!r.ok) {
    failed++;
    console.log(`FAIL  ${name.padEnd(28)} ${r.reason}`);
    continue;
  }
  const match = r.selfInverse === expectedSelfInverse;
  if (!match) failed++;
  console.log(
    `${match ? 'ok  ' : 'FAIL'}  ${name.padEnd(28)} size ${n} · self-inverse on diagonal: ` +
    `${r.selfInverse}${match ? '' : ` (page claims ${expectedSelfInverse})`}`
  );
}

console.log(failed === 0 ? '\nAll group tables valid.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
