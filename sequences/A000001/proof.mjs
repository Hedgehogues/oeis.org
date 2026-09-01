// A000001 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Four independent checks, none
// of which reuses the search that produced the answer:
//
//   1. soundness    — every table the implementation returned really is a group: Latin square,
//                     associative on all n³ triples, identity at 0, every element invertible.
//   2. distinctness — no two returned tables are isomorphic (so nothing is double-counted),
//                     tested with a from-scratch permutation search that does NOT reuse
//                     solution.mjs's isomorphism routine.
//   3. completeness — for the orders where a full independent construction is cheap (n ≤ 8), every
//                     group built by a KNOWN construction (cyclic, direct products, dihedral,
//                     quaternion) is isomorphic to exactly one returned table, and vice versa —
//                     so the search neither missed a group nor invented one.
//   4. agreement    — the resulting counts equal OEIS's own published terms for A000001.
//
// Run:  node sequences/A000001/proof.mjs [maxN]        (default 8)

import { enumerateGroups, elementOrders } from './solution.mjs';

// ---- OEIS A000001, %S line, a(0)..a(32); a(0)=0 is dropped when indexing from n=1 -------------
const OEIS = [0, 1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2,
  5, 4, 1, 4, 1, 51];

// ---- 1. soundness ----------------------------------------------------------------------------
function isGroup(t, n) {
  for (let i = 0; i < n; i++) {
    const row = new Set(), col = new Set();
    for (let j = 0; j < n; j++) { row.add(t[i * n + j]); col.add(t[j * n + i]); }
    if (row.size !== n || col.size !== n) return 'not a latin square';
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
    if (t[t[a * n + b] * n + c] !== t[a * n + t[b * n + c]]) return `not associative at (${a},${b},${c})`;
  }
  for (let a = 0; a < n; a++) if (t[0 * n + a] !== a || t[a * n + 0] !== a) return '0 is not the identity';
  for (let a = 0; a < n; a++) {
    let inv = -1;
    for (let b = 0; b < n; b++) if (t[a * n + b] === 0 && t[b * n + a] === 0) inv = b;
    if (inv < 0) return `${a} has no inverse`;
  }
  return null;
}

// ---- 2. distinctness: an isomorphism test written independently of solution.mjs's -------------
// Brute force over every bijection fixing 0, with no order-based pruning: slower, but it shares
// no logic with the routine whose result it is checking.
function isomorphicBruteForce(A, B, n) {
  const perm = [];
  const used = new Uint8Array(n);
  const rec = (k) => {
    if (k === n) {
      const phi = [0, ...perm];
      for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
        if (B[phi[x] * n + phi[y]] !== phi[A[x * n + y]]) return false;
      }
      return true;
    }
    for (let v = 1; v < n; v++) {
      if (used[v]) continue;
      used[v] = 1; perm.push(v);
      if (rec(k + 1)) return true;
      perm.pop(); used[v] = 0;
    }
    return false;
  };
  return rec(1);
}

// ---- 3. completeness: build the known groups of order n directly ------------------------------
const cyclic = (n) => (a, b) => (a + b) % n;
const directProduct = (m, k) => (a, b) => {
  const a1 = Math.floor(a / k), a2 = a % k, b1 = Math.floor(b / k), b2 = b % k;
  return ((a1 + b1) % m) * k + ((a2 + b2) % k);
};
const directProduct3 = (p, q, r) => (a, b) => {
  const dec = (x) => [Math.floor(x / (q * r)), Math.floor(x / r) % q, x % r];
  const [a1, a2, a3] = dec(a), [b1, b2, b3] = dec(b);
  return ((a1 + b1) % p) * q * r + ((a2 + b2) % q) * r + ((a3 + b3) % r);
};
const dihedral = (m) => (a, b) => {           // order 2m: element = rotation i, flip j
  const i1 = a >> 1, j1 = a & 1, i2 = b >> 1, j2 = b & 1;
  const i = (((i1 + (j1 ? -i2 : i2)) % m) + m) % m;
  return (i << 1) | ((j1 + j2) % 2);
};
const quaternion = () => {                    // Q8: unit*2 + sign, unit 0=1,1=i,2=j,3=k
  const U = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[1, 0], [0, 1], [3, 0], [2, 1]],
             [[2, 0], [3, 1], [0, 1], [1, 0]], [[3, 0], [2, 0], [1, 1], [0, 1]]];
  return (a, b) => {
    const u1 = a >> 1, s1 = a & 1, u2 = b >> 1, s2 = b & 1;
    const [u, f] = U[u1][u2];
    return (u << 1) | ((s1 ^ s2 ^ f) & 1);
  };
};

// The classification of groups of order ≤ 8, written out as explicit constructions. This is the
// independent source: it comes from group theory, not from this repo's search.
const KNOWN = {
  1: [['trivial', cyclic(1)]],
  2: [['C2', cyclic(2)]],
  3: [['C3', cyclic(3)]],
  4: [['C4', cyclic(4)], ['C2×C2', directProduct(2, 2)]],
  5: [['C5', cyclic(5)]],
  6: [['C6', cyclic(6)], ['S3 = D6', dihedral(3)]],
  7: [['C7', cyclic(7)]],
  8: [['C8', cyclic(8)], ['C4×C2', directProduct(4, 2)], ['C2×C2×C2', directProduct3(2, 2, 2)],
      ['D8', dihedral(4)], ['Q8', quaternion()]],
};

const tableOf = (n, mul) => {
  const t = new Int32Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) t[i * n + j] = mul(i, j);
  return t;
};

// ---- run -------------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 8);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

for (let n = 1; n <= maxN; n++) {
  const reps = enumerateGroups(n);

  // 1. soundness
  reps.forEach((t, i) => {
    const why = isGroup(t, n);
    if (why) fail(`n=${n}: returned table #${i} is ${why}`);
  });

  // 2. distinctness
  for (let i = 0; i < reps.length; i++) {
    for (let j = i + 1; j < reps.length; j++) {
      if (isomorphicBruteForce(reps[i], reps[j], n)) {
        fail(`n=${n}: tables #${i} and #${j} are the same group counted twice`);
      }
    }
  }

  // 3. completeness against the known classification
  const known = KNOWN[n];
  if (known) {
    for (const [name, mul] of known) {
      const kt = tableOf(n, mul);
      const matches = reps.filter((r) => isomorphicBruteForce(kt, r, n)).length;
      if (matches !== 1) fail(`n=${n}: known group ${name} matched ${matches} returned tables (want exactly 1)`);
    }
    for (let i = 0; i < reps.length; i++) {
      const matches = known.filter(([, mul]) => isomorphicBruteForce(tableOf(n, mul), reps[i], n)).length;
      if (matches !== 1) fail(`n=${n}: returned table #${i} matched ${matches} known groups (want exactly 1)`);
    }
  }

  // 4. agreement with OEIS
  const want = OEIS[n];
  const got = reps.length;
  if (got !== want) fail(`n=${n}: computed a(n)=${got}, OEIS says ${want}`);

  const orders = reps.map((t) => elementOrders(t, n).sort((x, y) => x - y).join(''));
  console.log(
    `ok    a(${n}) = ${got}` +
    (known ? `  · matched ${known.length} known group(s): ${known.map(([k]) => k).join(', ')}` : '') +
    `  · element-order signatures: ${orders.length ? orders.join(' | ') : '—'}`
  );
}

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, distinct, complete, and equal to OEIS A000001.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
