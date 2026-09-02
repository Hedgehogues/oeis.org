// A000026 — mosaic numbers: if n = product of p_j^k_j (prime factorization), a(n) = product of
// (p_j * k_j).
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: factorize n by trial division,
// then multiply each prime by its own exponent, and multiply those together. No table of published
// terms is consulted.
//
// Run:  node sequences/A000026/solution.mjs [maxN]        (default 72)
//
// This is a one-line restatement of prime factorization — the per-term rule has no further "why".
// What IS worth a picture: a(n) = n whenever n is squarefree (every exponent is 1, so every factor
// p*1 = p, reproducing n's own factors unchanged) — OEIS's own comment states this direction only
// ("a(n) = n IF n is squarefree"), not the converse, and checking the converse directly (rather
// than assuming it) finds real counterexamples: n=4=2² is not squarefree, yet a(4)=2*2=4=n, an
// INCIDENTAL fixed point where an exponent happens to equal its own prime. Both facts are checked
// in memory-bank/visualizations/A000026/viz.html and sequences/A000026/proof.mjs.
//
// Cost: trial-division factorization is O(sqrt(n)) per term. Measured on this machine: a(1..72) in
// 0 ms, a(1..100000) in 27 ms. No combinatorial wall.

export function factorize(n) {
  const factors = []; // [prime, exponent] pairs, ascending prime order
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      let k = 0;
      while (m % p === 0) { m /= p; k++; }
      factors.push([p, k]);
    }
  }
  if (m > 1) factors.push([m, 1]);
  return factors;
}

export function a(n) {
  if (n === 1) return 1; // empty product
  return factorize(n).reduce((acc, [p, k]) => acc * (p * k), 1);
}

export function isSquarefree(n) {
  return factorize(n).every(([, k]) => k === 1);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 72);
  const t0 = Date.now();
  const out = [];
  for (let n = 1; n <= maxN; n++) out.push(a(n));
  const ms = Date.now() - t0;
  console.log(`a(1..${maxN}) computed in ${ms} ms`);
  console.log('\n' + out.join(', '));
}
