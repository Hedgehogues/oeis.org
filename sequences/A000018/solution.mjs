// A000018 — number of positive integers <= 2^n of the form x^2 + 16*y^2 (x, y >= 0 integers).
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: mark every value x^2+16y^2 up
// to the bound, then count the DISTINCT marked values — not the number of (x,y) pairs, since two
// different pairs can land on the same value (e.g. 16 = 0^2+16*1^2 = 4^2+16*0^2). No table of known
// answers is consulted.
//
// Run:  node sequences/A000018/solution.mjs [maxN]        (default 20)
//
// Method
//   For a bound B = 2^n, x ranges 0..floor(sqrt(B)) and, for each x, y ranges 0..floor(sqrt((B-x^2)/16)).
//   Each (x,y) produces one value v = x^2+16y^2; a flat byte array indexed by v (not a Set) marks
//   which values under B have been hit at least once, and a running counter avoids re-scanning the
//   array — this is what lets the sieve reach much larger bounds than a Set of matched values would
//   (a Set of ~80 million entries hits V8's own maximum-Set-size limit well before memory does).
//
// Cost: not a combinatorial search over an unbounded structure — the pair-enumeration itself is the
// definition, and its cost is O(bound) for the sieve array plus O(sqrt(bound)) pairs. Measured on
// this machine: n=26 (bound ~67M) in 188 ms, n=28 (bound ~268M) in 898 ms, n=30 (bound ~1.07B) in
// 3.8 s; n=32 (bound ~4.3B, a 4.3 GB byte array) did not finish within 70 s and was stopped — the
// wall here is memory bandwidth for the sieve array, not the search itself.

export function countForm16(n) {
  const bound = 2 ** n;
  const marked = new Uint8Array(bound + 1);
  let count = 0;
  for (let x = 0; x * x <= bound; x++) {
    const rest = bound - x * x;
    for (let y = 0; 16 * y * y <= rest; y++) {
      const v = x * x + 16 * y * y;
      if (v >= 1 && !marked[v]) { marked[v] = 1; count++; }
    }
  }
  return count;
}

export function a(n) {
  return countForm16(n);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 20);
  const out = [];
  for (let n = 0; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
