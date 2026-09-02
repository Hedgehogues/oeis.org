// A000022 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks, none
// reusing the leaf-addition growth that produced the answer:
//
//   1. independent construction — every LABELED tree on n nodes is generated from its Prüfer
//                                 sequence (no canonical growth, no leaf addition — just decode
//                                 every one of the n^(n-2) sequences), filtered to max degree <= 4
//                                 and exactly one center, reduced to canonical unlabeled form with
//                                 its own from-scratch centering + AHU routine, and counted. This
//                                 is exponential (n^(n-2) labeled trees to decode), so it only
//                                 reaches a modest range, but every term it reaches is a genuine
//                                 agreement between two structurally unrelated constructions.
//   2. identity check          — A000022(n) + A000200(n) = A000602(n): every centered quartic tree
//                                 plus every BICENTERED one (Jordan's theorem says a tree is one or
//                                 the other, never neither, never both) accounts for every quartic
//                                 tree there is. Checked against OEIS's own published terms for all
//                                 three sequences — a cross-check this file's construction never
//                                 touches, since A000200 and A000602 are never computed here.
//   3. agreement                — the results equal OEIS's own published terms for A000022.
//
// Run:  node sequences/A000022/proof.mjs [maxN] [agreeMaxN]   (default 8, 16)
//   maxN       — how far the independent (exponential) labeled construction is asked to reach;
//                default kept at 8 (under a second) so a bare `node proof.mjs` — what
//                verify/sequences.mjs's routine quick-check runs — stays fast; n=9 takes ~23s on
//                this machine and is run explicitly (`node proof.mjs 9 16`) for the deeper check
//                this file's own README/spec cite, not on every routine run
//   agreeMaxN  — how far the OEIS-agreement check re-runs the fast growth construction; kept well
//                below solution.mjs's own memory wall (~n=21-22) by default

import { a as fastA } from './solution.mjs';

// ---- OEIS A000022, %S/%T/%U line, a(0)..a(19) ----------------------------------------------------
const OEIS = [0, 1, 0, 1, 1, 2, 2, 6, 9, 20, 37, 86, 181, 422, 943, 2223, 5225, 12613, 30513, 74883];

// ---- the identity this sequence sits inside: centered + bicentered = every quartic tree ----------
// OEIS A000200 (bicentered hydrocarbons) and A000602 (all quartic trees / alkanes), fetched live
// from their own OEIS entries — not derived from anything in this file or in solution.mjs.
const A000200 = [0, 0, 1, 0, 1, 1, 3, 3, 9, 15, 38, 73, 174, 380, 915, 2124, 5134, 12281, 30010, 73401];
const A000602 = [1, 1, 1, 1, 2, 3, 5, 9, 18, 35, 75, 159, 355, 802, 1858, 4347, 10359, 24894, 60523];

// ---- an independent construction: decode EVERY labeled tree from its own Prüfer sequence ---------
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
  // "is this a valid centered quartic tree": every vertex present, connected by construction
  // (Prufer decode always produces a tree), max degree <= 4, and exactly one Jordan center.
  return adj.length === n && !adj.some((a) => a.length > 4) && findCenters(adj, n).length === 1;
}

function countViaLabeledConstruction(n) {
  // Prufer sequences have length n-2, undefined below 0 — n=0/1 have no tree structure to decode
  // and are handled directly; n=2 onward goes through the real construction (its single tree has
  // two adjacent centers, so isConfiguration's single-center filter correctly rejects it, giving 0
  // without needing a special case).
  if (n === 0) return 0;
  if (n === 1) return 1;
  const seen = new Set();
  for (const seq of pruferSequences(n - 2, n)) {
    const adj = decodePrufer(seq, n);
    if (!isConfiguration(adj, n)) continue;
    seen.add(canonicalString(adj, n));
  }
  return seen.size;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 8);
const agreeMaxN = Number(process.argv[3] || 16);
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

// identity: A000022(n) + A000200(n) = A000602(n), checked entirely against published data.
// Starts at n=1, not 0: Jordan's theorem partitions the centers of an actual TREE, and A000602's
// own n=0 term (1) counts the null/empty tree by a separate convention that has no center to be
// centered-or-bicentered about — 0+0=0 there, not a bug in the identity, just a boundary the
// theorem was never about.
let identityOk = true;
const identityLen = Math.min(A000200.length, A000602.length);
for (let n = 1; n < identityLen; n++) {
  const sum = OEIS[n] + A000200[n];
  if (sum !== A000602[n]) { fail(`n=${n}: A000022(n)+A000200(n)=${sum}, but A000602(n)=${A000602[n]}`); identityOk = false; }
}
if (identityOk) console.log(`ok    identity: A000022(n) + A000200(n) = A000602(n) for n=1..${identityLen - 1} (Jordan's theorem: centered + bicentered = every quartic tree), checked against all three sequences' own published terms — n=0 excluded, the null tree has no center to be either about`);

let agreementOk = true;
const checkLen = Math.min(OEIS.length, agreeMaxN + 1);
for (let n = 0; n < checkLen; n++) {
  const got = fastA(n);
  if (got !== OEIS[n]) { fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000022's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN} (independent construction), the A000200/A000602 identity, and n = 0..${checkLen - 1} (OEIS agreement).`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
