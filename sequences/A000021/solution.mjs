// A000021 — number of positive integers <= 2^n of the form x^2 + 12*y^2 (x, y >= 0 integers).
//
// Thin entry: the same construction as A000018 (x^2+16y^2) with a different constant. It has no
// picture of its own — see sequences/A000018/README.md and
// memory-bank/visualizations/A000018/viz.html for the explanation (why counting (x,y) pairs
// overcounts, why deduplication is the real work, the growth chart).
//
// IMPLEMENTATION. Computes a(n) from the definition: mark every value x^2+12y^2 up to the bound,
// count the DISTINCT marked values. No table of known answers is consulted.
//
// Run:  node sequences/A000021/solution.mjs [maxN]        (default 18)

export function countForm12(n) {
  const bound = 2 ** n;
  const marked = new Uint8Array(bound + 1);
  let count = 0;
  for (let x = 0; x * x <= bound; x++) {
    const rest = bound - x * x;
    for (let y = 0; 12 * y * y <= rest; y++) {
      const v = x * x + 12 * y * y;
      if (v >= 1 && !marked[v]) { marked[v] = 1; count++; }
    }
  }
  return count;
}

export function a(n) {
  return countForm12(n);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 18);
  const out = [];
  for (let n = 0; n <= maxN; n++) out.push(a(n));
  console.log(`a(0..${maxN}) computed`);
  console.log('\n' + out.join(', '));
}
