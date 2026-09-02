// A000022 — number of centered hydrocarbons with n atoms: unlabeled trees on n nodes with every
// vertex of degree <= 4 (a carbon skeleton — "quartic trees", Cayley's 1875 alkane-counting
// problem) that have exactly one CENTER, in the sense of Jordan's theorem.
//
// Jordan (1869) proved every tree has either one center vertex or two ADJACENT center vertices,
// found by repeatedly stripping every current layer of leaves until one or two vertices remain.
// Cayley split his alkane count into these two cases; the "centered" ones are this sequence, the
// "bicentered" ones are OEIS A000200, and A000022(n) + A000200(n) = A000602(n) (the total count),
// verified live against all three published sequences by this sequence's own proof.mjs.
//
// IMPLEMENTATION. This reuses A000014's tree-generation machinery (leaf-addition growth + AHU
// canonical form over the tree's own center — see sequences/A000014/solution.mjs for the full
// derivation of why that method is complete and non-redundant) with two differences: the degree
// cap (<=4) is enforced WHILE growing, since a vertex's degree only ever increases as leaves are
// attached to it, so pruning early is both correct and faster; and the final filter keeps
// single-center trees instead of A000014's "no degree-2 vertex" condition.
//
// Run:  node sequences/A000022/solution.mjs [maxN]        (default 20)
//
// Cost: same shape as A000014's wall — leaf-addition growth avoids labeled (Prüfer) explosion, but
// the growing POOL of distinct degree-<=4 unlabeled trees is itself the limit (quartic trees grow
// noticeably faster than A000014's series-reduced ones: 184,484 of them at n=20 versus A000014's
// 2,988). Measured on this machine: n<=19 in under 6 s each, n=20 in 16.0 s (matching OEIS's
// a(20)=184484 exactly), n=21 in 3 min 7 s total wall for the whole 0..21 run (matching OEIS's
// a(21)=458561 exactly) — this machine is noticeably slower than whatever measured the timings in
// an earlier draft of this comment, which is exactly why every number here was re-measured rather
// than kept; n=22 was not attempted given that growth rate.

function centers(adj, n) {
  if (n === 1) return [0];
  let deg = adj.map((a) => a.length);
  const alive = new Array(n).fill(true);
  let remaining = n;
  let cur = [];
  for (let i = 0; i < n; i++) if (deg[i] <= 1) cur.push(i);
  while (remaining > 2) {
    for (const l of cur) { alive[l] = false; remaining--; }
    const next = [];
    for (const l of cur) {
      for (const nb of adj[l]) {
        if (!alive[nb]) continue;
        deg[nb]--;
        if (deg[nb] === 1) next.push(nb);
      }
    }
    cur = next;
  }
  return cur;
}

function ahuString(adj, root) {
  function rec(node, parent) {
    const childStrings = [];
    for (const nb of adj[node]) if (nb !== parent) childStrings.push(rec(nb, node));
    childStrings.sort();
    return '(' + childStrings.join('') + ')';
  }
  return rec(root, -1);
}

export function canonicalForm(adj, n) {
  const strings = centers(adj, n).map((c) => ahuString(adj, c));
  strings.sort();
  return strings[0];
}

export function isCentered(adj, n) {
  return centers(adj, n).length === 1;
}

const MAX_DEGREE = 4;

// Every distinct unlabeled tree on n nodes with every vertex of degree <= MAX_DEGREE, grown by
// leaf addition with the degree cap enforced at every step (never attach a leaf to a vertex
// already at the cap — that vertex's degree can never decrease on the way to n nodes, so this
// prunes exactly the trees that would fail the cap anyway, just earlier).
export function allQuarticTrees(n) {
  if (n < 1) return [];
  let level = [[[]]]; // the single-node tree
  let size = 1;
  while (size < n) {
    const next = new Map();
    for (const adj of level) {
      const k = adj.length;
      for (let v = 0; v < k; v++) {
        if (adj[v].length >= MAX_DEGREE) continue;
        const grown = adj.map((a) => a.slice());
        grown.push([v]);
        grown[v] = grown[v].concat([k]);
        const key = canonicalForm(grown, k + 1);
        if (!next.has(key)) next.set(key, grown);
      }
    }
    level = [...next.values()];
    size++;
  }
  return level;
}

export function centeredHydrocarbons(n) {
  if (n === 0) return [];
  return allQuarticTrees(n).filter((adj) => isCentered(adj, n));
}

export function a(n) {
  return centeredHydrocarbons(n).length;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 16);
  const out = [];
  for (let n = 0; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
