// A000004 — the zero sequence: a(n) = 0 for every n >= 0.
//
// IMPLEMENTATION. There is no computation to describe. The definition IS the value, and this file
// says so rather than dressing it up: a(n) = 0. No table of published terms is consulted, though
// consulting one would hardly be cheating when every entry is the same digit.
//
// Run:  node sequences/A000004/solution.mjs [maxN]        (default 34)
//
// Why this file exists at all
//   Not for its values. A000004 earns its place as the ZERO of an algebra: Dirichlet convolution
//   combines two arithmetic functions by splitting n into every pair d x (n/d) and summing
//   f(d)*g(n/d), and under that operation this sequence is both the additive zero and an absorber —
//   convolving it with anything at all gives it back. That is the one checkable fact about it, and
//   it is what proof.mjs tests. The picture lives on A000005's page, where this row is one of four
//   actors; see sequences/A000004/README.md.
//
// Cost: constant per term. There is no wall, no search, and nothing to measure beyond the loop that
// prints the output — a(1..1,000,000) fills an array in 4 ms on this machine, which says more about
// array allocation than about the sequence.

export function a(n) {
  if (n < 0) throw new RangeError(`A000004 is defined for n >= 0, got ${n}`);
  return 0;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 34);
  const out = [];
  const t0 = Date.now();
  for (let n = 0; n < maxN; n++) out.push(a(n));
  const ms = Date.now() - t0;
  console.log(`a(0..${maxN - 1}) computed in ${ms} ms`);
  console.log('\n' + out.join(', '));
}
