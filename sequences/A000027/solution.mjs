// A000027 — the positive integers: a(n) = n, offset 1.
//
// IMPLEMENTATION. Returns n. That is the definition, and there is no procedure underneath it worth
// describing. No table of published terms is consulted.
//
// Run:  node sequences/A000027/solution.mjs [maxN]        (default 26)
//
// Why this file exists at all
//   Not for its values — a(n) = n is the most transparent statement in the encyclopedia, and is
//   also the sequence more OEIS entries cross-reference than any other, precisely because "the
//   index itself" is what other definitions are written against.
//
//   In this catalog it earns its entry as an ORDINARY MEMBER of the algebra of arithmetic
//   functions, and it is the busiest of the four constant rows A000005's page draws. Dirichlet
//   convolution combines two functions by splitting n into every pair d x (n/d) and summing
//   f(d)*g(n/d). Under it, this sequence:
//     - convolved with the all-1s row gives the sum of divisors (A000203);
//     - convolved with the Möbius function gives Euler's totient (A000010);
//     - is itself REBUILT by convolving the totient with the all-1s row — the classical fact that
//       the totients of the divisors of n add up to n.
//   That last relation is A000005's page's closing frame, and proof.mjs checks all three.
//
// Cost: constant per term.

export function a(n) {
  if (n < 1) throw new RangeError(`A000027 is defined for n >= 1, got ${n}`);
  return n;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 26);
  const out = [];
  for (let n = 1; n <= maxN; n++) out.push(a(n));
  console.log(`a(1..${maxN}):`);
  console.log('\n' + out.join(', '));
}
