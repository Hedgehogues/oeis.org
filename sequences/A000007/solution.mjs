// A000007 — the characteristic function of {0}: a(n) = 0^n, i.e. a(0) = 1 and a(n) = 0 for n >= 1.
//
// IMPLEMENTATION. Computes a(n) as the literal power 0^n, which is the definition. No table of
// published terms is consulted.
//
// Run:  node sequences/A000007/solution.mjs [maxN]        (default 34)
//
// Why this file exists at all
//   Not for its values, which are exhausted by the definition. A000007 earns its place as the
//   IDENTITY of an algebra: Dirichlet convolution combines two arithmetic functions by splitting n
//   into every pair d x (n/d) and summing f(d)*g(n/d), and re-indexed to start at n = 1 this
//   sequence leaves every partner unchanged under that operation. The encyclopedia's own note on
//   this entry states the same thing: "Changing the offset to 1 gives the arithmetical function
//   a(1)=1, a(n)=0 for n>1, the identity function for Dirichlet multiplication."
//
//   That re-indexing is a real subtlety, not a slip. This file publishes the sequence at its own
//   OEIS offset 0, so a(0) = 1; the identity element used in the algebra is the same pattern read
//   from n = 1, which is what `epsilon` below returns and what proof.mjs tests. A000005's page
//   draws the distinction rather than hiding it.
//
// Cost: constant per term.

// The sequence as published: offset 0, a(n) = 0^n.
export function a(n) {
  if (n < 0) throw new RangeError(`A000007 is defined for n >= 0, got ${n}`);
  return Math.pow(0, n);
}

// The same pattern re-indexed from n = 1, which is the form that acts as the Dirichlet identity.
// Kept as a separate export so the offset shift is explicit in the code rather than assumed.
export function epsilon(n) {
  if (n < 1) throw new RangeError(`the Dirichlet identity is indexed from n >= 1, got ${n}`);
  return a(n - 1);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 34);
  const out = [];
  for (let n = 0; n < maxN; n++) out.push(a(n));
  console.log(`a(0..${maxN - 1}), at the published offset 0:`);
  console.log('\n' + out.join(', '));
}
