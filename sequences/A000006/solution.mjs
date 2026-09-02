// A000006 — integer part of the square root of the n-th prime.
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: sieve primes up to a generous
// bound, take the n-th one, floor its square root. No table of published terms is consulted.
//
// Run:  node sequences/A000006/solution.mjs [maxN]        (default 100)
//
// Method
//   A sieve of Eratosthenes up to `limit` lists every prime <= limit in order; a(n) is
//   floor(sqrt(prime(n))). `limit` must be pushed up (via the prime number theorem's rough
//   estimate n·ln(n)) until it holds at least `maxN` primes.
//
// Cost: the sieve is O(limit log log limit). Measured on this machine: n=100 in 0 ms, n=1,000 in
// 1 ms, n=100,000 in 11 ms. No combinatorial wall — the only real cost is the sieve's memory at
// very large n.
//
// This sequence's real content isn't the per-term formula (that's a one-line restatement) but an
// OPEN CONJECTURE about it: Legendre's conjecture states there is always a prime between k² and
// (k+1)² for every k > 0. If that's true, a(n) never "skips" a value k — every k from 1 up appears
// at least once. The page shows this honestly as unproven, checked only up to where the sieve
// reaches, in memory-bank/verify/legendre.mjs (an independent re-derivation of the same claim from
// a prime-counting function, not from this file's own sieve).

function sieve(limit) {
  const isComposite = new Uint8Array(limit + 1);
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (!isComposite[i]) {
      primes.push(i);
      for (let j = i * i; j <= limit; j += i) isComposite[j] = 1;
    }
  }
  return primes;
}

export function primesUpTo(n) {
  // grow the sieve bound until it holds at least n primes (prime number theorem estimate, padded)
  let limit = Math.max(20, Math.ceil(n * (Math.log(n + 2) + Math.log(Math.log(n + 3))) * 1.2));
  let primes = sieve(limit);
  while (primes.length < n) {
    limit *= 2;
    primes = sieve(limit);
  }
  return primes;
}

export function a(n) {
  const primes = primesUpTo(n);
  return Math.floor(Math.sqrt(primes[n - 1]));
}

export function sequenceUpTo(maxN) {
  const primes = primesUpTo(maxN);
  return primes.slice(0, maxN).map((p) => Math.floor(Math.sqrt(p)));
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 100);
  const t0 = Date.now();
  const out = sequenceUpTo(maxN);
  const ms = Date.now() - t0;
  console.log(`a(1..${maxN}) computed in ${ms} ms`);
  console.log('\n' + out.join(', '));
}
