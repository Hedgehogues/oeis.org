// A000015 — smallest prime power >= n.
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: starting at n, test each
// integer for being a prime power (p^k for a prime p, k >= 1) until one is found. No table of
// published terms is consulted.
//
// Run:  node sequences/A000015/solution.mjs [maxN]        (default 72)
//
// Convention: OEIS's own a(1) = 1 means THIS entry counts 1 as a prime power (p^0 for any p, or
// simply a stated boundary convention) — not the usual number-theory convention, which excludes 1.
// isPrimePower(x) below returns true for x=1 to match the published sequence exactly, and this is
// stated here rather than silently baked in with no explanation (the same discipline A000020's
// header uses for its own n=1 boundary case).
//
// Method
//   isPrimePower(x): trial-divide to find x's smallest prime factor p, then check x is an exact
//   power of that single p (x divided by p repeatedly reaches 1 with no other prime factor).
//   a(n): scan upward from n until isPrimePower matches.
//
// Cost: prime powers are dense (every prime, every prime square, cube, ...), so the scan from n
// rarely goes far. Measured on this machine: a(1..72) in 0 ms; a(1..100000) in 33 ms. No
// combinatorial wall.

function smallestPrimeFactor(x) {
  if (x % 2 === 0) return 2;
  for (let d = 3; d * d <= x; d += 2) if (x % d === 0) return d;
  return x; // x itself is prime
}

export function isPrimePower(x) {
  if (x === 1) return true; // this entry's own boundary convention — see header
  if (x < 1) return false;
  const p = smallestPrimeFactor(x);
  let m = x;
  while (m % p === 0) m /= p;
  return m === 1;
}

export function a(n) {
  let x = n;
  while (!isPrimePower(x)) x++;
  return x;
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
