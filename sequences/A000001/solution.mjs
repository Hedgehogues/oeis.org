// A000001 — number of groups of order n.
//
// IMPLEMENTATION. Computes a(n) from first principles, by the same procedure the page explains:
// fill an n×n multiplication table, keep only the fillings that are actually groups, then merge
// the ones that differ only by relabelling the elements. No table of known answers is consulted.
//
// Run:  node sequences/A000001/solution.mjs [maxN]        (default 8)
//
// Method
//   - Element 0 is the identity, without loss of generality: any group has one, and naming it 0
//     costs nothing. That fixes row 0 and column 0.
//   - The remaining cells are filled by backtracking under two constraints checked at every step:
//       Latin square  — a value may not repeat within a row or within a column (each element,
//                       multiplied by a fixed one, hits every element exactly once);
//       associativity — for every triple whose both sides are already determined,
//                       (a·b)·c must equal a·(b·c).
//   - Every completed table is a group. Two tables describe the same group when some relabelling
//     of 1..n-1 turns one into the other, so each completed table is tested against the
//     representatives found so far and kept only if it is new.
//
// Cost: the search is exhaustive, so it is exponential, and the wall is close. Measured on this
// machine: n ≤ 7 finishes in under 50 ms, n = 8 takes about 8 s, n = 9 does not finish within
// 4 minutes. That wall is not a defect to hide — it is the sequence's own point restated as a
// runtime: counting groups by looking at every possible multiplication table stops working almost
// immediately, which is why the real values past this range come from classification theory and
// dedicated computer algebra rather than from a loop like this one.

export function elementOrders(table, n) {
  const orders = [];
  for (let a = 0; a < n; a++) {
    let x = a, k = 1;
    while (x !== 0) { x = table[x * n + a]; k++; }
    orders.push(k);
  }
  return orders;
}

// Is there a relabelling φ with φ(0)=0 that turns table A into table B?
export function isomorphic(A, B, n) {
  const ordA = elementOrders(A, n), ordB = elementOrders(B, n);
  const phi = new Int32Array(n).fill(-1);
  const used = new Uint8Array(n);
  phi[0] = 0; used[0] = 1;

  const consistent = (a) => {
    // every product among already-mapped elements must survive the relabelling
    for (let x = 0; x <= a; x++) {
      if (phi[x] < 0) continue;
      for (let y = 0; y <= a; y++) {
        if (phi[y] < 0) continue;
        const p = A[x * n + y];
        if (phi[p] < 0) continue;
        if (B[phi[x] * n + phi[y]] !== phi[p]) return false;
      }
    }
    return true;
  };

  const rec = (a) => {
    if (a === n) return true;
    for (let b = 1; b < n; b++) {
      if (used[b]) continue;
      if (ordA[a] !== ordB[b]) continue;          // a relabelling preserves element order
      phi[a] = b; used[b] = 1;
      if (consistent(a) && rec(a + 1)) return true;
      phi[a] = -1; used[b] = 0;
    }
    return false;
  };
  return rec(1);
}

// Every triple whose both sides are already known must associate.
function partiallyAssociative(t, n) {
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const ab = t[a * n + b];
      if (ab < 0) continue;
      for (let c = 0; c < n; c++) {
        const bc = t[b * n + c];
        if (bc < 0) continue;
        const left = t[ab * n + c], right = t[a * n + bc];
        if (left >= 0 && right >= 0 && left !== right) return false;
      }
    }
  }
  return true;
}

export function enumerateGroups(n) {
  const t = new Int32Array(n * n).fill(-1);
  for (let i = 0; i < n; i++) { t[0 * n + i] = i; t[i * n + 0] = i; }  // identity row/column

  const reps = [];
  const cells = [];
  for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) cells.push([i, j]);

  const rowHas = Array.from({ length: n }, () => new Uint8Array(n));
  const colHas = Array.from({ length: n }, () => new Uint8Array(n));
  for (let i = 0; i < n; i++) { rowHas[i][i] = 1; colHas[i][i] = 1; }   // from the identity line
  for (let i = 1; i < n; i++) { rowHas[i][i] = 1; colHas[i][i] = 1; }

  const rec = (k) => {
    if (k === cells.length) {
      const table = Int32Array.from(t);
      if (!reps.some((r) => isomorphic(table, r, n))) reps.push(table);
      return;
    }
    const [i, j] = cells[k];
    for (let v = 0; v < n; v++) {
      if (rowHas[i][v] || colHas[j][v]) continue;
      t[i * n + j] = v; rowHas[i][v] = 1; colHas[j][v] = 1;
      if (partiallyAssociative(t, n)) rec(k + 1);
      t[i * n + j] = -1; rowHas[i][v] = 0; colHas[j][v] = 0;
    }
  };

  // reset the marks the identity line already placed, then mark them properly
  for (let i = 0; i < n; i++) { rowHas[i].fill(0); colHas[i].fill(0); }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = t[i * n + j];
      if (v >= 0) { rowHas[i][v] = 1; colHas[j][v] = 1; }
    }
  }

  rec(0);
  return reps;
}

export function a(n) {
  return enumerateGroups(n).length;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 8);
  const out = [];
  for (let n = 1; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
