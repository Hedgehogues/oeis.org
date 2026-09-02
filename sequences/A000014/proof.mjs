// A000014 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Two independent checks, neither
// reusing the leaf-addition growth that produced the answer:
//
//   1. independent construction — every LABELED tree on n nodes is generated from its Prüfer
//                                 sequence (a completely different construction: no canonical
//                                 growth, no leaf addition, just decode every one of the n^(n-2)
//                                 sequences), reduced to canonical unlabeled form with its own
//                                 from-scratch centering + AHU routine, filtered to no degree-2
//                                 vertex, and counted. This is exponential in n (n^(n-2) labeled
//                                 trees to decode), so it only reaches a modest range — but every
//                                 term it reaches is a genuine agreement between two structurally
//                                 unrelated constructions, not the same code run twice.
//   2. agreement               — the results equal OEIS's own published terms for A000014, out to
//                                 wherever the fast construction was run.
//
// Run:  node sequences/A000014/proof.mjs [maxN] [agreeMaxN]   (default 9, 20)
//   maxN       — how far the independent (exponential) labeled construction is asked to reach
//   agreeMaxN  — how far the OEIS-agreement check re-runs the fast growth construction; capped
//                well below its own memory wall (~n=22, see solution.mjs's header) on purpose

import { a as fastA } from './solution.mjs';

// ---- OEIS A000014, %S/%T/%U lines, a(0)..a(39) --------------------------------------------------
const OEIS = [
  0, 1, 1, 0, 1, 1, 2, 2, 4, 5, 10, 14, 26, 42, 78, 132, 249, 445, 842, 1561, 2988, 5671, 10981,
  21209, 41472, 81181, 160176, 316749, 629933, 1256070, 2515169, 5049816, 10172638, 20543579,
  41602425, 84440886, 171794492, 350238175, 715497037, 1464407113
];

// ---- an independent construction: decode EVERY labeled tree from its Prufer sequence ------------
// Deliberately simple (O(n^2) per decode) rather than clever — correctness over speed, since this
// exists to disagree with solution.mjs if solution.mjs is wrong, not to also reach n=20.
function decodePrufer(seq, n) {
  const degree = new Array(n).fill(1);
  for (const v of seq) degree[v]++;
  const adj = Array.from({ length: n }, () => []);
  for (const v of seq) {
    let leaf = -1;
    for (let i = 0; i < n; i++) if (degree[i] === 1) { leaf = i; break; }
    adj[leaf].push(v); adj[v].push(leaf);
    degree[leaf]--; degree[v]--;
  }
  const rem = [];
  for (let i = 0; i < n; i++) if (degree[i] === 1) rem.push(i);
  adj[rem[0]].push(rem[1]); adj[rem[1]].push(rem[0]);
  return adj;
}

// its own centering + AHU canonical form, written separately from solution.mjs's copy
function findCenters(adj, n) {
  if (n === 1) return [0];
  let deg = adj.map((a) => a.length);
  const alive = new Array(n).fill(true);
  let remaining = n;
  let cur = [];
  for (let i = 0; i < n; i++) if (deg[i] <= 1) cur.push(i);
  while (remaining > 2) {
    for (const l of cur) { alive[l] = false; remaining--; }
    const next = [];
    for (const l of cur) for (const nb of adj[l]) { if (!alive[nb]) continue; deg[nb]--; if (deg[nb] === 1) next.push(nb); }
    cur = next;
  }
  return cur;
}
function canonicalString(adj, n) {
  function rec(node, parent) {
    const kids = [];
    for (const nb of adj[node]) if (nb !== parent) kids.push(rec(nb, node));
    kids.sort();
    return '(' + kids.join('') + ')';
  }
  const strs = findCenters(adj, n).map((c) => rec(c, -1));
  strs.sort();
  return strs[0];
}

function* pruferSequences(length, n) {
  if (length === 0) { yield []; return; }
  for (const rest of pruferSequences(length - 1, n)) for (let v = 0; v < n; v++) yield [v, ...rest];
}

export function isConfiguration(adj, n) {
  // "is this a valid series-reduced tree": every vertex present, connected by construction
  // (Prufer decode always produces a tree), and no vertex has degree exactly 2.
  return adj.length === n && !adj.some((a) => a.length === 2);
}

function countViaLabeledConstruction(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 1;
  const seen = new Set();
  for (const seq of pruferSequences(n - 2, n)) {
    const adj = decodePrufer(seq, n);
    if (!isConfiguration(adj, n)) continue;
    seen.add(canonicalString(adj, n));
  }
  return seen.size;
}

// ---- run -----------------------------------------------------------------------------------
// Two different ranges on purpose: the labeled construction is exponential (n^(n-2) sequences to
// decode) and only reaches `maxN`; the fast growth construction has no such wall until memory runs
// out around n=22 (see solution.mjs's header), so the OEIS agreement check is allowed to run
// further — but NOT all the way to OEIS's own 40 published terms, which would try to grow trees
// past that same memory wall and hang exactly the way this file's first draft did.
const maxN = Number(process.argv[2] || 9);
// default kept small so a bare `node proof.mjs` (what verify/sequences.mjs's routine quick-check
// runs) finishes in about a second; the deeper agreement check this file's own header/README cites
// is a deliberate, explicit `node proof.mjs 9 20` run, not the default.
const agreeMaxN = Number(process.argv[3] || 12);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 0; n <= maxN; n++) {
  const t0 = Date.now();
  const fast = fastA(n);
  const slow = countViaLabeledConstruction(n);
  const ms = Date.now() - t0;
  if (fast !== slow) fail(`n=${n}: leaf-addition growth says ${fast}, independent Prufer/AHU construction says ${slow}`);
  else console.log(`ok    n=${n}: leaf-addition and independent labeled construction agree on ${fast}   (${ms} ms)`);
}

let agreementOk = true;
const checkLen = Math.min(OEIS.length, agreeMaxN + 1);
for (let n = 0; n < checkLen; n++) {
  const got = fastA(n);
  if (got !== OEIS[n]) { fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000014's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN} (independent construction) and n = 0..${checkLen - 1} (OEIS agreement).`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
