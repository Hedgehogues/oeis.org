// A000025 — coefficients of Ramanujan's 3rd-order mock theta function f(q).
//
// IMPLEMENTATION. Expands the defining q-series exactly, in BigInt, by the same formula the page
// draws:
//
//   f(q) = 1 + Sum_{k>=1}  q^(k^2) / Product_{i=1..k} (1+q^i)^2
//
// (OEIS's own %F line for A000025; matches Wikipedia's "Mock theta function" article's stated
// definition of f(q) verbatim, f(q) = Sum_{n>=0} q^(n^2) / (-q;q)_n^2 where (-q;q)_n is exactly
// Product_{i=1..n}(1+q^i)). No table of published terms is consulted — each coefficient a(n) is
// read off the truncated series after building it term by term.
//
// Run:  node sequences/A000025/solution.mjs [maxN]        (default 60, matching OEIS's own %S/%T/%U line)
//
// Method
//   For each k with k^2 <= N, build (1+q^i) twice for i=1..k as a truncated polynomial (degree N),
//   take its formal power-series INVERSE (the standard `inv[d] = -sum_{j=1..d} poly[j]*inv[d-j]`
//   recurrence, since poly[0]=1), then add that inverse, shifted right by k^2, into the running
//   total. Every arithmetic operation is BigInt: the coefficients are signed and grow like
//   exp(pi*sqrt(n/6)), well past safe-integer range by n~200.
//
// Cost: polynomial, not a combinatorial search — building all k<=sqrt(N) inverses costs O(N^1.5)
// or so BigInt operations. Measured on this machine: N=60 in 1 ms, N=100 in 2 ms, N=300 in 6 ms.
// No wall found at any N a page would draw; far past that (N in the thousands) the coefficients
// themselves, not the runtime, become the limiting factor for display.

export function mockThetaF(N) {
  const total = new Array(N + 1).fill(0n);
  total[0] = 1n;
  for (let k = 1; k * k <= N; k++) {
    // poly = Product_{i=1..k} (1+q^i)^2, truncated to degree N
    let poly = new Array(N + 1).fill(0n);
    poly[0] = 1n;
    for (let i = 1; i <= k; i++) {
      for (let rep = 0; rep < 2; rep++) {
        const next = poly.slice();
        for (let d = 0; d + i <= N; d++) next[d + i] += poly[d];
        poly = next;
      }
    }
    // inv = 1 / poly, as a truncated power series (poly[0] = 1)
    const inv = new Array(N + 1).fill(0n);
    inv[0] = 1n;
    for (let d = 1; d <= N; d++) {
      let s = 0n;
      for (let j = 1; j <= d; j++) s += poly[j] * inv[d - j];
      inv[d] = -s;
    }
    for (let d = 0; d + k * k <= N; d++) total[d + k * k] += inv[d];
  }
  return total;
}

export function a(n) {
  return mockThetaF(n)[n];
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 60);
  const t0 = Date.now();
  const terms = mockThetaF(maxN);
  const ms = Date.now() - t0;
  console.log(`a(0..${maxN}) computed in ${ms} ms`);
  console.log('\n' + terms.map((x) => x.toString()).join(', '));
}
