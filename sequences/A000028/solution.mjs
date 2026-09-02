// A000028 — numbers m whose prime factorization m = p_1^e_1 * p_2^e_2 * ... has an ODD total count
// of 1-bits across the binary expansions of e_1, e_2, e_3, ....
//
// IMPLEMENTATION. Computes the sequence from the definition the page draws: factorize each
// candidate m by trial division, sum the popcount (number of 1-bits) of each exponent, keep m if
// that sum is odd. No table of published terms is consulted.
//
// Run:  node sequences/A000028/solution.mjs [maxN]        (default 67)
//
// This is a one-line restatement of "popcount of the exponents, summed, is odd" — the per-term
// rule has no further "why" on its own. What IS worth checking: together with its complement
// (numbers where that sum is even, OEIS A000379), this sequence partitions every positive integer
// into exactly one of the two classes — checked directly in
// memory-bank/visualizations/A000028/viz.html and sequences/A000028/proof.mjs, not merely asserted
// from the OEIS comment citing Lambek and Moser.
//
// Cost: trial-division factorization is O(sqrt(m)) per candidate. Measured on this machine:
// a(1..67) in 0 ms; a(1..1000) in 4 ms. No combinatorial wall.

export function factorize(n) {
  const factors = [];
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

function popcount(x) {
  let c = 0;
  while (x > 0) { c += x & 1; x >>= 1; }
  return c;
}

export function exponentPopcountSum(n) {
  if (n === 1) return 0; // empty factorization
  return factorize(n).reduce((sum, [, k]) => sum + popcount(k), 0);
}

export function inSequence(n) {
  return exponentPopcountSum(n) % 2 === 1;
}

export function sequenceUpTo(maxN) {
  const out = [];
  let m = 1;
  while (out.length < maxN) {
    m++;
    if (inSequence(m)) out.push(m);
  }
  return out;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 67);
  const t0 = Date.now();
  const out = sequenceUpTo(maxN);
  const ms = Date.now() - t0;
  console.log(`a(1..${maxN}) computed in ${ms} ms`);
  console.log('\n' + out.join(', '));
}
