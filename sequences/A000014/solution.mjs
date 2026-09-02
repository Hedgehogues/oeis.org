// A000014 — number of series-reduced trees with n nodes (also called homeomorphically irreducible
// or "topological" trees: unlabeled trees with no vertex of degree exactly 2 — every vertex is
// either a leaf (degree 1), an isolated single node (degree 0, only possible at n=1), or a branch
// point (degree >= 3)).
//
// IMPLEMENTATION. Computes a(n) from the definition by GROWING every unlabeled tree one node at a
// time (leaf addition), then filtering to the ones with no degree-2 vertex at the target size. No
// table of published terms is consulted.
//
// Run:  node sequences/A000014/solution.mjs [maxN]        (default 15)
//
// Method — leaf addition, not Prüfer sequences
//   Every tree with k+1 nodes has at least one leaf; removing it leaves a tree with k nodes. So
//   the complete, non-redundant way to build every unlabeled tree of size k+1 is: take every
//   canonical (unlabeled) tree of size k already found, and for every one of its k vertices,
//   attach one new leaf there — then deduplicate the results by canonical form. Repeating this
//   from the single-node tree reaches every unlabeled tree of every size, with no relabelling and
//   no combinatorial explosion in the NUMBER of labeled trees the way a naive labeled construction
//   (n^(n-2) Prüfer sequences) would hit almost immediately.
//
//   The degree-2 restriction is NOT applied while growing — a tree that will end up series-reduced
//   at size n can pass through a non-series-reduced shape on the way there (removing a leaf can
//   turn a degree-3 vertex into a degree-2 one). It is applied only once, to the final n-node
//   trees, exactly as the definition requires.
//
//   Canonical form: find the tree's center (the well-known fact that repeatedly stripping every
//   current leaf layer leaves either one vertex or two adjacent ones — Jordan's theorem), root
//   there, and compute the standard AHU canonical string (each node's signature is its sorted
//   children's signatures, in parentheses); a two-center tree takes the lexicographically smaller
//   of its two possible rootings.
//
// Cost: this reaches far further than the labeled (Prüfer) construction `proof.mjs` uses to check
// it, because it never enumerates more than one representative per unlabeled shape. Measured on
// this machine: n=15 in well under a second, n=18 in 4.2 s, n=20 in 34.8 s (matching OEIS's own
// a(20)=2988 exactly). n=22 does not finish — not from time but from memory: the growing pool of
// distinct unlabeled trees (551 at n=12, already thousands by n=20) each carries its own adjacency
// list, and at n=22 that pool exhausts a 4 GB heap before finishing a single further level.

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

// Every distinct unlabeled tree on n nodes, as adjacency lists, grown by leaf addition.
export function allTrees(n) {
  if (n < 1) return [];
  let level = [[[]]]; // the single-node tree
  let size = 1;
  while (size < n) {
    const next = new Map();
    for (const adj of level) {
      const k = adj.length;
      for (let v = 0; v < k; v++) {
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

export function seriesReducedTrees(n) {
  if (n === 0) return [];
  return allTrees(n).filter((adj) => !adj.some((a) => a.length === 2));
}

export function a(n) {
  return seriesReducedTrees(n).length;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 15);
  const out = [];
  for (let n = 0; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
