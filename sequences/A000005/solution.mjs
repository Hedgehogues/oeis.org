// A000005 — d(n), the number of divisors of n (also written tau(n) or sigma_0(n)).
//
// IMPLEMENTATION. Computes a(n) from first principles, by the same procedure the page draws: d(n)
// is the Dirichlet convolution of the all-1s function with itself, so counting divisors of n is
// literally counting the ways to write n as an ordered product d · (n/d). No table of known values
// is consulted.
//
// Run:  node sequences/A000005/solution.mjs [maxN]        (default 24)
//
// Method
//   - Dirichlet convolution of two arithmetic functions: (f*g)(n) = sum over divisors d of n of
//     f(d)·g(n/d). Every divisor d contributes exactly one term, paired with its cofactor n/d.
//   - Setting f = g = the constant 1 makes every term equal to 1, so (1*1)(n) counts the divisor
//     pairs of n — which is d(n). That identity is the page's first frame, and this file's `a`.
//   - Divisors are found by trial division up to sqrt(n), each hit contributing the pair (k, n/k)
//     and counting 2, except for a perfect square's middle divisor, which counts 1.
//
// The same convolution machinery is exported because the page's later frames run it on other
// arithmetic functions (the identity function, the Möbius function, Euler's totient) to show the
// results landing OUTSIDE the set of functions being combined. Those functions are defined here
// from their own definitions — the Möbius function from squarefree prime factorisations, the
// totient by counting coprimes — never read off a table.
//
// Cost: O(sqrt n) per term, so a full prefix costs about maxN^1.5 in total. Measured on this
// machine: a(1..1,000) in 3 ms, a(1..100,000) in 35 ms, a(1..1,000,000) in 923 ms. There is no
// combinatorial wall here of the kind A000001's group search or A100001's configuration search
// hit — the limit is patience with large prefixes, not a search that stops working.

// ---- the sequence itself -----------------------------------------------------------------------

export function a(n) {
  let count = 0;
  for (let k = 1; k * k <= n; k++) {
    if (n % k !== 0) continue;
    count += (k === n / k) ? 1 : 2;   // the pair (k, n/k), or one middle divisor if n is a square
  }
  return count;
}

export function divisors(n) {
  const small = [], large = [];
  for (let k = 1; k * k <= n; k++) {
    if (n % k !== 0) continue;
    small.push(k);
    if (k !== n / k) large.push(n / k);
  }
  return small.concat(large.reverse());
}

// ---- the algebra the page draws ------------------------------------------------------------------

// (f*g)(n) = sum over divisors d of n of f(d) · g(n/d)
export function convolve(f, g) {
  return (n) => divisors(n).reduce((sum, d) => sum + f(d) * g(n / d), 0);
}

export const ZERO = () => 0;                       // A000004, re-indexed from 1
export const EPS = (n) => (n === 1 ? 1 : 0);       // A000007's pattern, re-indexed from 1
export const ONE = () => 1;                        // A000012
export const ID = (n) => n;                        // A000027

// Möbius: 0 when a squared prime divides n, otherwise (-1)^(number of distinct primes).
export function MU(n) {
  if (n === 1) return 1;
  let count = 0, m = n, p = 2;
  while (p * p <= m) {
    if (m % p === 0) {
      m /= p;
      if (m % p === 0) return 0;
      count++;
    }
    p++;
  }
  if (m > 1) count++;
  return count % 2 === 0 ? 1 : -1;
}

// Euler's totient, by counting the integers up to n that share no factor with it.
export function PHI(n) {
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  let count = 0;
  for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) count++;
  return count;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 24);
  const t0 = Date.now();
  const out = [];
  for (let n = 1; n <= maxN; n++) out.push(a(n));
  const ms = Date.now() - t0;
  console.log(`a(1..${maxN}) computed in ${ms} ms`);
  console.log('\n' + out.slice(0, 120).join(', ') + (maxN > 120 ? ', …' : ''));
}
