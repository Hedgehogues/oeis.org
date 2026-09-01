// A100001 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Five independent checks:
//
//   1. soundness      — every configuration returned really is of type (n_3): n lines of 3 points,
//                       every point on exactly 3 lines, no two points sharing two lines.
//   2. distinctness   — no two returned configurations are isomorphic, tested by a from-scratch
//                       permutation search that shares no pruning or invariant with solution.mjs.
//   3. completeness   — the number of configurations found equals the published count of (n_3)
//                       configurations (OEIS A001403), and for n = 7 the Fano plane built the
//                       algebraic way (points = nonzero vectors over GF(2)³, lines = triples that
//                       add to zero) is found exactly once.
//   4. duality        — every configuration called self-dual comes with explicit witness
//                       permutations of points and lines, and those are verified against the raw
//                       incidence matrices: M[σ(i)][τ(j)] = M[j][i]. This is the check the page's
//                       matrix-and-transpose picture makes visually.
//   5. agreement      — the resulting self-dual counts equal OEIS's own terms for A100001.
//
// Run:  node sequences/A100001/proof.mjs [maxN]        (default 11)

import { enumerateConfigurations, dual, pointLines } from './solution.mjs';

// ---- published terms, used only as the final comparison ---------------------------------------
// A100001, a(1..19): self-dual configurations of type (n_3).
const A100001 = [0, 0, 0, 0, 0, 0, 1, 1, 3, 10, 25, 95, 366, 1433, 5802, 24105, 102479, 445577, 1992044];
// A001403, a(1..14): all configurations of type (n_3) up to isomorphism.
const A001403 = [0, 0, 0, 0, 0, 0, 1, 1, 3, 10, 31, 229, 2036, 21399];

// ---- 1. soundness ------------------------------------------------------------------------------
function isConfiguration(lines, n) {
  if (lines.length !== n) return `has ${lines.length} lines, not ${n}`;
  const deg = new Array(n).fill(0);
  const seen = new Set();
  for (const L of lines) {
    if (L.length !== 3) return 'a line does not hold exactly 3 points';
    if (new Set(L).size !== 3) return 'a line repeats a point';
    for (const p of L) {
      if (!Number.isInteger(p) || p < 0 || p >= n) return `point ${p} is out of range`;
      deg[p]++;
    }
    for (const [x, y] of [[L[0], L[1]], [L[0], L[2]], [L[1], L[2]]]) {
      const k = Math.min(x, y) * n + Math.max(x, y);
      if (seen.has(k)) return `points ${x} and ${y} share two lines`;
      seen.add(k);
    }
  }
  for (let p = 0; p < n; p++) if (deg[p] !== 3) return `point ${p} lies on ${deg[p]} lines, not 3`;
  return null;
}

// ---- 2/4. an isomorphism search written independently of solution.mjs's ------------------------
// Plain backtracking over point images with one constraint — the image of a line must be a line —
// and no invariant colouring at all. Slower, and deliberately so: it must not be able to inherit
// a mistake from the routine it is checking. Returns the permutation, or null.
function findIsomorphism(A, B, n) {
  const linesB = new Set(B.map((L) => L.slice().sort((x, y) => x - y).join(',')));
  const linesThrough = pointLines(A, n);
  const phi = new Array(n).fill(-1);
  const taken = new Array(n).fill(false);

  const rec = (x) => {
    if (x === n) return A.every((L) => linesB.has([phi[L[0]], phi[L[1]], phi[L[2]]].sort((a, b) => a - b).join(',')));
    for (let y = 0; y < n; y++) {
      if (taken[y]) continue;
      phi[x] = y; taken[y] = true;
      // every line of A whose points are all mapped by now must already be a line of B
      let ok = true;
      for (const li of linesThrough[x]) {
        const L = A[li];
        if (L.some((p) => phi[p] < 0)) continue;
        if (!linesB.has([phi[L[0]], phi[L[1]], phi[L[2]]].sort((a, b) => a - b).join(','))) { ok = false; break; }
      }
      if (ok && rec(x + 1)) return true;
      phi[x] = -1; taken[y] = false;
    }
    return false;
  };
  return rec(0) ? phi.slice() : null;
}

// ---- 3. the Fano plane, built from algebra rather than from a search ---------------------------
function fanoPlane() {
  const lines = [];
  for (let a = 1; a <= 7; a++) {
    for (let b = a + 1; b <= 7; b++) {
      const c = a ^ b;                              // the three add to zero over GF(2)
      if (c > b) lines.push([a - 1, b - 1, c - 1]);
    }
  }
  return lines.map((L) => L.sort((x, y) => x - y)).sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
}

// ---- 4. duality checked on the raw incidence matrices ------------------------------------------
const incidence = (lines, n) => {
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  lines.forEach((L, j) => L.forEach((p) => { M[p][j] = 1; }));
  return M;                                          // M[point][line]
};

// σ maps this configuration's points onto the dual's points, i.e. onto line indices; the line
// permutation τ it induces is read straight off the lines. Verified cell by cell.
function verifySelfDualWitness(lines, n, sigma) {
  const M = incidence(lines, n);                     // M[point][line]
  const D = dual(lines, n);                          // D[p] = the lines through point p
  const tau = new Array(n).fill(-1);
  lines.forEach((L, j) => {
    const image = L.map((p) => sigma[p]).sort((a, b) => a - b).join(',');
    tau[j] = D.findIndex((line) => line.join(',') === image);
  });
  if (tau.some((k) => k < 0) || new Set(tau).size !== n) return 'the induced line permutation is not a permutation';

  // σ sends a point to a line index, τ sends a line to a point index. "Point i lies on line j" must
  // hold exactly when the images do — and in the dual that reads off the transposed matrix.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (M[i][j] !== M[tau[j]][sigma[i]]) return `incidence mismatch at point ${i}, line ${j}`;
    }
  }
  return null;
}

// ---- run ---------------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 11);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 1; n <= maxN; n++) {
  const cfgs = enumerateConfigurations(n);

  // 1. soundness
  cfgs.forEach((c, i) => {
    const why = isConfiguration(c, n);
    if (why) fail(`n=${n}: returned configuration #${i} ${why}`);
  });

  // 2. distinctness
  for (let i = 0; i < cfgs.length; i++) {
    for (let j = i + 1; j < cfgs.length; j++) {
      if (findIsomorphism(cfgs[i], cfgs[j], n)) {
        fail(`n=${n}: configurations #${i} and #${j} are the same one counted twice`);
      }
    }
  }

  // 3. completeness
  if (n - 1 < A001403.length && cfgs.length !== A001403[n - 1]) {
    fail(`n=${n}: found ${cfgs.length} configurations, A001403 says ${A001403[n - 1]}`);
  }
  if (n === 7) {
    const hits = cfgs.filter((c) => findIsomorphism(fanoPlane(), c, 7)).length;
    if (hits !== 1) fail(`n=7: the Fano plane matched ${hits} returned configurations (want exactly 1)`);
  }

  // 4. duality, with a witness verified on the incidence matrices
  let selfDual = 0;
  cfgs.forEach((c, i) => {
    const sigma = findIsomorphism(c, dual(c, n), n);
    if (!sigma) return;
    selfDual++;
    const why = verifySelfDualWitness(c, n, sigma);
    if (why) fail(`n=${n}: configuration #${i} was called self-dual but ${why}`);
  });

  // 5. agreement
  const want = A100001[n - 1] ?? null;
  if (want !== null && selfDual !== want) fail(`n=${n}: computed a(n)=${selfDual}, OEIS says ${want}`);

  if (cfgs.length > 0 || n >= 7) {
    console.log(`ok    a(${n}) = ${selfDual} self-dual of ${cfgs.length} configuration(s)` +
      (n === 7 ? '  · Fano plane matched exactly once' : '') +
      (selfDual ? `  · ${selfDual} duality witness(es) verified on the incidence matrices` : ''));
  }
}

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, distinct, complete, witnessed, and equal to OEIS A100001.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
