// A000010 — Euler's totient function phi(n): count of positive integers <= n coprime to n.
//
// IMPLEMENTATION. Computes phi(n) from the definition the page draws: count k in 1..n with
// gcd(k,n) = 1. No table of published terms is consulted.
//
// Run:  node sequences/A000010/solution.mjs [maxN]        (default 69)
//
// Cost: a single phi(n) is O(n) (one gcd per candidate k). Computing a full prefix table this way
// is therefore O(maxN^2) — not a combinatorial wall, just a naive-definition cost. Measured on this
// machine: maxN=300 in 4 ms, maxN=3,000 in 145 ms. proof.mjs's product-formula route is the fast,
// independent one (O(√n) per term via trial division), used to check this one, not the reverse.

function gcd(x, y) {
  while (y) { [x, y] = [y, x % y]; }
  return x;
}

export function phi(n) {
  let count = 0;
  for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) count++;
  return count;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 69);
  const t0 = Date.now();
  const out = [];
  for (let n = 1; n <= maxN; n++) out.push(phi(n));
  const ms = Date.now() - t0;
  console.log(`phi(1..${maxN}) computed in ${ms} ms`);
  console.log('\n' + out.join(', '));
}
