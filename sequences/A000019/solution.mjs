// A000019 — number of primitive permutation groups of degree n (up to conjugacy in S_n).
//
// IMPLEMENTATION. A permutation group G <= S_n is PRIMITIVE if it is transitive and has no
// nontrivial block system — no partition of {0..n-1} into more-than-one, smaller-than-n equal
// blocks that G merely permutes among themselves. Counting primitive groups of degree n up to
// conjugacy therefore means: enumerate every subgroup of S_n, keep the transitive+primitive ones,
// and merge subgroups that are conjugate (the same group acting on relabelled points).
//
// Run:  node sequences/A000019/solution.mjs [maxN]        (default 6)
//
// Method — an EXACT enumeration, not an approximation
//   A prior draft of this file tried to shortcut subgroup enumeration by closing only pairs of
//   generators, which happens to recover the right answer for very small n by luck but is not
//   guaranteed complete in general (a subgroup that needs 3+ generators to reach could be missed).
//   This version enumerates ALL subgroups of S_n correctly: start from the trivial group, and
//   repeatedly extend every subgroup found so far by ONE more element of S_n not already in it,
//   closing under multiplication each time, until no new subgroup appears. This is the standard
//   "one-step extension" closure algorithm (Dixon & Mortimer, "Permutation Groups", ch. 2) and is
//   complete by construction: every subgroup is reachable by adding its elements one at a time to
//   the trivial group.
//   Permutations are encoded as small integers (indices into the full list of n! permutations)
//   with a precomputed multiplication table, so every group operation is an array lookup rather
//   than recomputing a composition — this is what makes n=6 (720 permutations, 1455 subgroups)
//   reach in minutes rather than hours.
//   Primitivity is tested by the classical "minimal block containing a pair" algorithm: for each
//   b != 0, union-find the smallest G-invariant partition merging points 0 and b; if that block's
//   size is anywhere strictly between 1 and n, G is imprimitive.
//   Conjugacy is tested by brute force: two primitive subgroups of the same order are the same
//   class iff some g in S_n conjugates one exactly onto the other.
//
// Cost: this is a full subgroup-lattice enumeration of S_n, and that lattice's size is the actual
// combinatorial explosion (it is independently known, and independently confirmed by this file's
// own proof.mjs, that S_n has 1, 2, 6, 30, 156, 1455 subgroups for n=1..6 — OEIS A005432). Measured
// on this machine: n<=5 finishes in well under a second, n=6 in 229.5 s (~3.83 min). n=7 (S_7 has
// 5040 elements; the subgroup count grows by roughly 8-10x per step in this range) was not
// attempted — extrapolating the growth, it is expected to take many hours with this method, and no
// faster-but-still-exact method is implemented here.

function buildPerms(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const res = [];
  const permute = (k) => {
    if (k === n) { res.push(arr.slice()); return; }
    for (let i = k; i < n; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(0);
  return res;
}

// Builds the full permutation-multiplication context for S_n: the list of permutations, a lookup
// from a permutation (joined string) to its integer id, and a precomputed multiplication table.
export function buildContext(n) {
  const perms = buildPerms(n);
  const N = perms.length;
  const arrToId = new Map();
  perms.forEach((p, i) => arrToId.set(p.join(','), i));
  const idOfIdentity = arrToId.get(Array.from({ length: n }, (_, i) => i).join(','));
  const mul = new Int32Array(N * N);
  for (let a = 0; a < N; a++) {
    const pa = perms[a];
    for (let b = 0; b < N; b++) {
      const pb = perms[b];
      const r = new Array(n);
      for (let i = 0; i < n; i++) r[i] = pa[pb[i]];
      mul[a * N + b] = arrToId.get(r.join(','));
    }
  }
  return { n, perms, N, mul, idOfIdentity, M: (a, b) => mul[a * N + b] };
}

function closureIds(ctx, genIds) {
  const set = new Set([ctx.idOfIdentity]);
  let frontier = [ctx.idOfIdentity];
  while (frontier.length) {
    const next = [];
    for (const g of frontier) {
      for (const s of genIds) {
        const p = ctx.M(g, s);
        if (!set.has(p)) { set.add(p); next.push(p); }
      }
    }
    frontier = next;
  }
  return set;
}

const canon = (set) => Array.from(set).sort((a, b) => a - b).join(',');

// Every subgroup of S_n, as Set<permId>, found by the exact one-step-extension closure algorithm.
export function allSubgroups(ctx) {
  const trivial = new Set([ctx.idOfIdentity]);
  const found = new Map([[canon(trivial), trivial]]);
  let frontier = [trivial];
  while (frontier.length) {
    const next = [];
    for (const H of frontier) {
      const Harr = Array.from(H);
      for (let g = 0; g < ctx.N; g++) {
        if (H.has(g)) continue;
        const newH = closureIds(ctx, Harr.concat([g]));
        const key = canon(newH);
        if (!found.has(key)) { found.set(key, newH); next.push(newH); }
      }
    }
    frontier = next;
  }
  return Array.from(found.values());
}

export function isTransitive(ctx, H) {
  const { n, perms } = ctx;
  const seen = new Set([0]);
  let frontier = [0];
  while (frontier.length) {
    const next = [];
    for (const pt of frontier) {
      for (const g of H) {
        const img = perms[g][pt];
        if (!seen.has(img)) { seen.add(img); next.push(img); }
      }
    }
    frontier = next;
  }
  return seen.size === n;
}

// Size of the minimal G-invariant block containing points a and b (classical union-find closure).
export function minimalBlockSize(ctx, H, a, b) {
  const { n, perms } = ctx;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (x, y) => { x = find(x); y = find(y); if (x !== y) parent[x] = y; };
  union(a, b);
  let changed = true;
  while (changed) {
    changed = false;
    const classes = new Map();
    for (let i = 0; i < n; i++) { const r = find(i); if (!classes.has(r)) classes.set(r, []); classes.get(r).push(i); }
    for (const g of H) {
      const p = perms[g];
      for (const cls of classes.values()) {
        if (cls.length < 2) continue;
        const img0 = p[cls[0]];
        for (let i = 1; i < cls.length; i++) {
          const imgi = p[cls[i]];
          if (find(img0) !== find(imgi)) { union(img0, imgi); changed = true; }
        }
      }
    }
  }
  const classes = new Map();
  for (let i = 0; i < n; i++) { const r = find(i); if (!classes.has(r)) classes.set(r, []); classes.get(r).push(i); }
  return classes.get(find(a)).length;
}

export function isPrimitive(ctx, H) {
  if (!isTransitive(ctx, H)) return false;
  if (ctx.n <= 2) return true;
  for (let b = 1; b < ctx.n; b++) {
    const size = minimalBlockSize(ctx, H, 0, b);
    if (size > 1 && size < ctx.n) return false;
  }
  return true;
}

// g H g^-1, as a Set<permId>.
function conjugateSubgroup(ctx, H, g) {
  const { n, perms, M } = ctx;
  const garr = perms[g];
  const ginvArr = new Array(n);
  for (let i = 0; i < n; i++) ginvArr[garr[i]] = i;
  let ginv = -1;
  for (let i = 0; i < ctx.N; i++) { if (perms[i].every((v, k) => v === ginvArr[k])) { ginv = i; break; } }
  const res = new Set();
  for (const h of H) res.add(M(M(g, h), ginv));
  return res;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// Reduce a list of subgroups to representatives up to S_n-conjugacy; returns the representatives.
export function reduceByConjugacy(ctx, groups) {
  const used = new Array(groups.length).fill(false);
  const reps = [];
  for (let i = 0; i < groups.length; i++) {
    if (used[i]) continue;
    reps.push(groups[i]);
    for (let j = i + 1; j < groups.length; j++) {
      if (used[j] || groups[j].size !== groups[i].size) continue;
      for (let g = 0; g < ctx.N; g++) {
        if (setsEqual(conjugateSubgroup(ctx, groups[i], g), groups[j])) { used[j] = true; break; }
      }
    }
  }
  return reps;
}

export function primitiveGroupData(n) {
  const ctx = buildContext(n);
  const subs = allSubgroups(ctx);
  const primitives = subs.filter((H) => isPrimitive(ctx, H));
  const classes = reduceByConjugacy(ctx, primitives);
  // `subs` is returned too (not just its length) so callers that need the full subgroup list for
  // an independent check — proof.mjs's stabilizer-maximality test — don't have to pay for a
  // second, several-minutes-long enumeration of the exact same thing.
  return { ctx, subs, allSubgroupsCount: subs.length, primitiveCount: primitives.length, classes };
}

export function a(n) {
  return primitiveGroupData(n).classes.length;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 6);
  const out = [];
  for (let n = 1; n <= maxN; n++) {
    const t0 = Date.now();
    const { allSubgroupsCount, primitiveCount, classes } = primitiveGroupData(n);
    const ms = Date.now() - t0;
    out.push(classes.length);
    console.log(`a(${n}) = ${classes.length}   (${allSubgroupsCount} subgroups total, ${primitiveCount} primitive, ${ms} ms)`);
  }
  console.log('\n' + out.join(', '));
}
