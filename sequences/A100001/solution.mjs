// A100001 — number of self-dual combinatorial configurations of type (n_3).
//
// IMPLEMENTATION. Computes a(n) from first principles, by the definition the page draws: build
// every (n_3) configuration up to isomorphism, swap the roles of points and lines in each one, and
// count the configurations that come back isomorphic to themselves. No table of known answers is
// consulted.
//
// Run:  node sequences/A100001/solution.mjs [maxN]        (default 11)
//
// What a configuration is
//   n points and n lines; every line holds exactly 3 points, every point lies on exactly 3 lines,
//   and two distinct points share at most one line. Only the incidence pattern matters — the
//   drawing on the page (triangle, medians, incircle) is one way to place the Fano plane on paper,
//   not part of the object.
//
// How the enumeration avoids counting the same configuration many times
//   A naive search over labelled configurations would produce every relabelling of the same object.
//   Two normalisations cut that down before any isomorphism test runs:
//     - the three lines through point 0 are fixed as {0,1,2}, {0,3,4}, {0,5,6}. Any configuration
//       can be relabelled this way, so nothing is lost.
//     - lines are always added through the smallest point that still has fewer than 3 lines, in
//       increasing order, and a point that has never appeared yet must take the smallest unused
//       label. This makes the labels follow the construction instead of being free.
//   What survives is a handful of labellings per configuration, and those are merged by an explicit
//   isomorphism test.
//
// Duality
//   The dual swaps the two roles: its points are this configuration's lines, and its line through
//   an original point p is the triple of lines that pass through p. A configuration is self-dual
//   when it is isomorphic to that dual — not when its incidence matrix happens to look symmetric.
//   The page makes exactly this distinction with the matrix-and-transpose pair.
//
// Cost: measured on this machine — n ≤ 10 finishes in under 0.1 s, n = 11 in about 0.9 s, n = 12
// in about 15 s, n = 13 in about 4 minutes (2036 configurations, 366 of them self-dual). n = 14
// was not run; the count of configurations there is 21399, an order of magnitude more, and the
// search cost grows faster than the count does. The published terms run to n = 19 (1 992 044),
// which no search of this shape reaches — those come from dedicated configuration-generation
// software, not from a loop like this one.

const pairKey = (n, a, b) => (a < b ? a * n + b : b * n + a);

// ---- structure helpers ------------------------------------------------------------------------

// For each point, the indices of the lines through it.
export function pointLines(lines, n) {
  const pl = Array.from({ length: n }, () => []);
  lines.forEach((L, i) => L.forEach((p) => pl[p].push(i)));
  return pl;
}

// Two points lie on at most one line, so a pair determines the third point when it exists.
function thirdPointMap(lines, n) {
  const m = new Map();
  for (const L of lines) {
    m.set(pairKey(n, L[0], L[1]), L[2]);
    m.set(pairKey(n, L[0], L[2]), L[1]);
    m.set(pairKey(n, L[1], L[2]), L[0]);
  }
  return m;
}

// The dual: points become lines and lines become points.
export function dual(lines, n) {
  return pointLines(lines, n).map((ls) => ls.slice().sort((a, b) => a - b));
}

// ---- colour refinement ------------------------------------------------------------------------
// A colour per point, refined from the incidence pattern alone: isomorphic configurations always
// produce the same colours, so colours can prune an isomorphism search and can serve as a bucket
// key. They are an invariant, not a proof of anything — equal colours never decide the answer on
// their own.

const mix = (h, v) => (Math.imul(h ^ v, 16777619) >>> 0);

// Which points share a line with which.
function adjacency(lines, n) {
  const adj = new Uint8Array(n * n);
  for (const L of lines) {
    adj[L[0] * n + L[1]] = adj[L[1] * n + L[0]] = 1;
    adj[L[0] * n + L[2]] = adj[L[2] * n + L[0]] = 1;
    adj[L[1] * n + L[2]] = adj[L[2] * n + L[1]] = 1;
  }
  return adj;
}

export function refineColors(lines, n) {
  const adj = adjacency(lines, n);
  const pl = pointLines(lines, n);

  // Seed: how many of a point's six collinear neighbours are themselves collinear. This alone
  // separates configurations that a purely degree-based colouring cannot tell apart — every point
  // in every (n_3) configuration has the same degree, so degree carries no information here.
  let color = new Uint32Array(n);
  for (let p = 0; p < n; p++) {
    const nb = [];
    for (let q = 0; q < n; q++) if (adj[p * n + q]) nb.push(q);
    let tri = 0;
    for (let i = 0; i < nb.length; i++) {
      for (let j = i + 1; j < nb.length; j++) if (adj[nb[i] * n + nb[j]]) tri++;
    }
    color[p] = tri + 1;
  }

  const parts = new Float64Array(3);
  for (let round = 0; round < 4; round++) {
    const next = new Uint32Array(n);
    for (let p = 0; p < n; p++) {
      for (let k = 0; k < 3; k++) {
        const L = lines[pl[p][k]];
        let lo = 0xffffffff, hi = 0;
        for (const q of L) {
          if (q === p) continue;
          if (color[q] < lo) lo = color[q];
          if (color[q] > hi) hi = color[q];
        }
        parts[k] = lo * 4294967296 + hi;
      }
      const s = Array.prototype.slice.call(parts).sort((a, b) => a - b);
      let h = mix(2166136261, color[p]);
      for (const v of s) { h = mix(h, v % 4294967296); h = mix(h, Math.floor(v / 4294967296)); }
      next[p] = h;
    }
    color = next;
  }
  return color;
}

// Bucket key: the multiset of point colours together with the multiset of line colours. Both are
// invariants, so isomorphic configurations always land in the same bucket; the exact test decides.
export function fingerprint(lines, n, color = refineColors(lines, n)) {
  const pts = Array.from(color).sort((a, b) => a - b).join('.');
  const lns = lines
    .map((L) => L.map((p) => color[p]).sort((a, b) => a - b).join(','))
    .sort()
    .join(';');
  return pts + '|' + lns;
}

// ---- isomorphism ------------------------------------------------------------------------------
// Backtracking over point images. Points of A are visited in an order that keeps each new point
// collinear with as many already-placed ones as possible, because every such pair is an immediate
// constraint: two points either determine a third (they share a line) or determine nothing, and
// their images must agree on which.

function searchOrder(lines, n) {
  const third = thirdPointMap(lines, n);
  const order = [0];
  const placed = new Uint8Array(n); placed[0] = 1;
  while (order.length < n) {
    let best = -1, bestTies = -1;
    for (let p = 0; p < n; p++) {
      if (placed[p]) continue;
      let ties = 0;
      for (const u of order) if (third.has(pairKey(n, p, u))) ties++;
      if (ties > bestTies) { bestTies = ties; best = p; }
    }
    order.push(best); placed[best] = 1;
  }
  return order;
}

export function isomorphic(A, B, n, cA = refineColors(A, n), cB = refineColors(B, n)) {
  if (A.length !== n || B.length !== n) return false;
  const thirdA = thirdPointMap(A, n);
  const thirdB = thirdPointMap(B, n);
  const lineSetB = new Set(B.map((L) => L.join(',')));
  const order = searchOrder(A, n);
  const phi = new Int32Array(n).fill(-1);
  const taken = new Uint8Array(n);

  const rec = (k) => {
    if (k === n) {
      return A.every((L) => lineSetB.has([phi[L[0]], phi[L[1]], phi[L[2]]].sort((a, b) => a - b).join(',')));
    }
    const x = order[k];
    for (let y = 0; y < n; y++) {
      if (taken[y] || cA[x] !== cB[y]) continue;
      let ok = true;
      for (let j = 0; j < k && ok; j++) {
        const u = order[j];
        const zA = thirdA.get(pairKey(n, x, u));
        const zB = thirdB.get(pairKey(n, y, phi[u]));
        if ((zA === undefined) !== (zB === undefined)) { ok = false; break; }
        if (zA === undefined) continue;
        if (phi[zA] >= 0) { if (phi[zA] !== zB) ok = false; }
        else if (taken[zB]) ok = false;            // zB is already the image of another point
      }
      if (!ok) continue;
      phi[x] = y; taken[y] = 1;
      if (rec(k + 1)) return true;
      phi[x] = -1; taken[y] = 0;
    }
    return false;
  };
  return rec(0);
}

// ---- enumeration ------------------------------------------------------------------------------

export function enumerateConfigurations(n) {
  if (n < 7) return [];                       // three lines through one point already need 7 points

  const deg = new Int32Array(n);
  const used = new Uint8Array(n);             // point has appeared in at least one line
  const pairSeen = new Uint8Array(n * n);     // pairSeen[a*n+b] — the pair already shares a line
  const flat = new Int32Array(3 * n);         // the lines, three entries each
  let nLines = 0;
  const buckets = new Map();                  // fingerprint -> representatives
  const reps = [];

  const addLine = (x, y, z) => {
    flat[3 * nLines] = x; flat[3 * nLines + 1] = y; flat[3 * nLines + 2] = z; nLines++;
    deg[x]++; deg[y]++; deg[z]++;
    used[x] = 1; used[y] = 1; used[z] = 1;
    pairSeen[x * n + y] = pairSeen[y * n + x] = 1;
    pairSeen[x * n + z] = pairSeen[z * n + x] = 1;
    pairSeen[y * n + z] = pairSeen[z * n + y] = 1;
  };
  const dropLine = () => {
    nLines--;
    const x = flat[3 * nLines], y = flat[3 * nLines + 1], z = flat[3 * nLines + 2];
    deg[x]--; deg[y]--; deg[z]--;
    if (!deg[x]) used[x] = 0; if (!deg[y]) used[y] = 0; if (!deg[z]) used[z] = 0;
    pairSeen[x * n + y] = pairSeen[y * n + x] = 0;
    pairSeen[x * n + z] = pairSeen[z * n + x] = 0;
    pairSeen[y * n + z] = pairSeen[z * n + y] = 0;
  };

  addLine(0, 1, 2); addLine(0, 3, 4); addLine(0, 5, 6);

  // Two reasons a partial configuration can no longer be completed:
  //   - a point that still needs k lines has fewer than 2k usable partners left;
  //   - more points have never been used than the remaining lines could ever introduce.
  const feasible = () => {
    let freshLeft = 0;
    for (let p = 0; p < n; p++) if (!used[p]) freshLeft++;
    if (freshLeft > 2 * (n - nLines)) return false;
    for (let q = 0; q < n; q++) {
      const need = 3 - deg[q];
      if (need <= 0) continue;
      let avail = freshLeft;
      const base = q * n;
      for (let r = 0; r < n; r++) {
        if (r === q || !used[r] || deg[r] >= 3 || pairSeen[base + r]) continue;
        avail++;
      }
      if (avail < 2 * need) return false;
    }
    return true;
  };

  const record = () => {
    const cfg = [];
    for (let i = 0; i < nLines; i++) cfg.push([flat[3 * i], flat[3 * i + 1], flat[3 * i + 2]]);
    cfg.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
    const color = refineColors(cfg, n);
    const fp = fingerprint(cfg, n, color);
    const bucket = buckets.get(fp);
    if (!bucket) { buckets.set(fp, [[cfg, color]]); reps.push(cfg); return; }
    if (bucket.some(([r, cr]) => isomorphic(cfg, r, n, color, cr))) return;
    bucket.push([cfg, color]); reps.push(cfg);
  };

  // minA/minB: lines through the same point are added in increasing order, so each set is built once
  const rec = (minA, minB) => {
    let p = -1;
    for (let i = 0; i < n; i++) if (deg[i] < 3) { p = i; break; }
    if (p < 0) { record(); return; }

    let fresh = -1;
    for (let i = 0; i < n; i++) if (!used[i]) { fresh = i; break; }

    for (let a = p + 1; a < n; a++) {
      if (a < minA) continue;
      if (deg[a] >= 3 || pairSeen[p * n + a]) continue;
      if (!used[a] && a !== fresh) continue;                       // fresh points enter in order
      const freshAfterA = used[a] ? fresh : fresh + 1;
      for (let b = a + 1; b < n; b++) {
        if (a === minA && b < minB) continue;
        if (deg[b] >= 3 || pairSeen[p * n + b] || pairSeen[a * n + b]) continue;
        if (!used[b] && b !== freshAfterA) continue;
        addLine(p, a, b);
        if (feasible()) rec(deg[p] < 3 ? a : 0, deg[p] < 3 ? b : 0);
        dropLine();
      }
    }
  };

  rec(0, 0);
  return reps;
}

export function selfDual(lines, n) {
  return isomorphic(lines, dual(lines, n), n);
}

export function a(n) {
  return enumerateConfigurations(n).filter((c) => selfDual(c, n)).length;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 11);
  const out = [];
  for (let n = 1; n <= maxN; n++) {
    const t0 = Date.now();
    const cfgs = enumerateConfigurations(n);
    const sd = cfgs.filter((c) => selfDual(c, n)).length;
    out.push(sd);
    console.log(`a(${n}) = ${sd}   (of ${cfgs.length} configuration(s) of type (${n}_3), ${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
