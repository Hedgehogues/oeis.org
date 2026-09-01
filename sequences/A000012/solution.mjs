// A000012 — the all 1's sequence: a(n) = 1 for every n >= 0.
//
// IMPLEMENTATION. Returns 1. That is the definition, and inflating it into a method would be
// dishonest. No table of published terms is consulted.
//
// Run:  node sequences/A000012/solution.mjs [maxN]        (default 34)
//
// Why this file exists at all
//   Not for its values. A000012 earns its place as the most productive constant in the algebra of
//   arithmetic functions: Dirichlet convolution combines two functions by splitting n into every
//   pair d x (n/d) and summing f(d)*g(n/d), and this sequence is the one whose products are
//   interesting. Convolved with ITSELF it gives the number of divisors (A000005), because every
//   term of the sum is 1 and the sum therefore counts the divisor pairs. Convolved with n it gives
//   the sum of divisors; convolved with Euler's totient it gives n back; and it has an inverse —
//   the Möbius function — which is Möbius inversion. proof.mjs checks all four of those.
//
//   The picture lives on A000005's page, where this row is one of four actors and where the cell
//   "all 1s against all 1s" is one of the four products that escape the table.
//
// Cost: constant per term.

export function a(n) {
  if (n < 0) throw new RangeError(`A000012 is defined for n >= 0, got ${n}`);
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 34);
  const out = [];
  for (let n = 0; n < maxN; n++) out.push(a(n));
  console.log(`a(0..${maxN - 1}):`);
  console.log('\n' + out.join(', '));
}
