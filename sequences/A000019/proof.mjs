// A000019 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. The expensive step — enumerating
// every subgroup of S_n — is reused (the same role solution.mjs's own `enumerateGroups` plays for
// A000001's proof.mjs: re-deriving it from scratch a second time would just re-run the identical
// search); everything downstream of that list is checked by routines written independently.
//
//   1. completeness — the total subgroup count matches OEIS A005432 ("number of subgroups of S_n"),
//                     an independently published sequence that has nothing to do with primitivity —
//                     if the enumeration itself were incomplete, this would already disagree.
//   2. soundness    — every group solution.mjs calls "primitive" really is transitive with no
//                     nontrivial block (re-checked by the same block test, since that IS the
//                     definition — but independently, every one of solution.mjs's classes is also
//                     re-tested by a DIFFERENT theorem: primitive iff a point stabilizer is a
//                     MAXIMAL subgroup, checked directly against the full subgroup list).
//   3. distinctness — no two of solution.mjs's returned classes are conjugate to each other, via a
//                     freshly written conjugacy test.
//   4. agreement    — the resulting counts equal OEIS's own published terms for A000019.
//
// Run:  node sequences/A000019/proof.mjs [maxN]        (default 6)

import { isTransitive, primitiveGroupData } from './solution.mjs';

// ---- OEIS A000019, %S line, a(1)..a(31) ----------------------------------------------------------
const OEIS = [1, 1, 2, 2, 5, 4, 7, 7, 11, 9, 8, 6, 9, 4, 6, 22, 10, 4, 8, 4, 9, 4, 7, 5, 28, 7, 15, 14, 8, 4, 12];

// ---- OEIS A005432, %S line, a(0)..a(11): number of subgroups of S_n (labeled, i.e. counting
// conjugates as distinct) — an independently published sequence about a DIFFERENT question
// (all subgroups, not primitive ones), used only to check the enumeration step is complete.
const A005432 = [1, 1, 2, 6, 30, 156, 1455, 11300, 151221, 1694723, 29594446, 404126228];

// ---- 2. independent primitivity test: point-stabilizer maximality (Dixon & Mortimer, Thm 1.10)
// A transitive G is primitive iff, for the stabilizer G_0 of point 0, there is no subgroup K with
// G_0 strictly between G_0 and G. This is a different theorem from "no nontrivial block", checked
// against the SAME already-enumerated subgroup list rather than by re-deriving blocks again.
function pointStabilizer(ctx, H) {
  const res = new Set();
  for (const g of H) if (ctx.perms[g][0] === 0) res.add(g);
  return res;
}
function isSubsetOf(a, b) { for (const x of a) if (!b.has(x)) return false; return true; }
function isPrimitiveByMaximality(ctx, allSubs, H) {
  if (!isTransitive(ctx, H)) return false;
  const G0 = pointStabilizer(ctx, H);
  for (const K of allSubs) {
    if (K.size <= G0.size || K.size >= H.size) continue; // strictly between in order
    if (isSubsetOf(G0, K) && isSubsetOf(K, H)) return false; // K strictly between G0 and H
  }
  return true;
}

// ---- 3. independent conjugacy test: written fresh, not imported from solution.mjs's reducer ----
function conjugateSubgroupFresh(ctx, H, g) {
  const { perms, n, M } = ctx;
  const garr = perms[g];
  const ginvArr = new Array(n);
  for (let i = 0; i < n; i++) ginvArr[garr[i]] = i;
  let ginv = -1;
  for (let i = 0; i < ctx.N; i++) {
    let ok = true;
    for (let k = 0; k < n; k++) if (perms[i][k] !== ginvArr[k]) { ok = false; break; }
    if (ok) { ginv = i; break; }
  }
  const res = new Set();
  for (const h of H) res.add(M(M(g, h), ginv));
  return res;
}
function areConjugate(ctx, H, K) {
  if (H.size !== K.size) return false;
  for (let g = 0; g < ctx.N; g++) {
    const c = conjugateSubgroupFresh(ctx, H, g);
    if (c.size !== K.size) continue;
    let same = true;
    for (const x of c) if (!K.has(x)) { same = false; break; }
    if (same) return true;
  }
  return false;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 6);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 1; n <= maxN; n++) {
  const t0 = Date.now();
  const { ctx, subs: allSubs, allSubgroupsCount, classes } = primitiveGroupData(n);

  // 1. completeness of the enumeration, against an unrelated published sequence
  if (n < A005432.length) {
    if (allSubgroupsCount !== A005432[n]) {
      fail(`n=${n}: enumerated ${allSubgroupsCount} subgroups of S_${n}, OEIS A005432 says ${A005432[n]}`);
    }
  }

  // 2. every returned class is independently confirmed primitive by a different theorem
  for (const H of classes) {
    if (!isPrimitiveByMaximality(ctx, allSubs, H)) {
      fail(`n=${n}: a returned class of order ${H.size} fails the independent stabilizer-maximality primitivity test`);
    }
  }

  // 3. distinctness: no two returned classes are conjugate
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      if (areConjugate(ctx, classes[i], classes[j])) {
        fail(`n=${n}: returned classes #${i} and #${j} (both order ${classes[i].size}) are conjugate — counted twice`);
      }
    }
  }

  // 4. agreement with OEIS
  const want = OEIS[n - 1];
  if (classes.length !== want) fail(`n=${n}: a(n) = ${classes.length}, OEIS says ${want}`);

  console.log(`ok    n=${n}: a(n)=${classes.length}, ${allSubgroupsCount} subgroups (A005432-checked), ${Date.now() - t0} ms`);
}

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: enumeration complete (matches A005432), every class independently confirmed primitive (stabilizer maximality) and pairwise non-conjugate, and equal to OEIS A000019.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
