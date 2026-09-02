// A000020 — number of primitive polynomials of degree n over GF(2) ("version 2": OEIS's own
// comment on this entry states its own a(1)=2 should really be 1 — see the header note below).
//
// IMPLEMENTATION. Computes a(n) from the definition: a monic degree-n polynomial over GF(2) is
// PRIMITIVE when it is irreducible and its root generates the entire multiplicative group of
// GF(2^n), i.e. the root's multiplicative order is exactly 2^n - 1 (the largest possible order).
// No table of published terms is consulted.
//
// Run:  node sequences/A000020/solution.mjs [maxN]        (default 16)
//
// Method
//   Polynomials over GF(2) of degree <= n are represented as (n+1)-bit integers (bit k = the
//   coefficient of x^k). For each monic (top bit set), nonzero-constant-term candidate:
//     1. irreducibility — trial division against every polynomial of degree 1..floor(n/2); if any
//        divides it evenly (remainder 0 under polynomial long division over GF(2), i.e. XOR-based
//        reduction), it is reducible.
//     2. primitivity — multiply "x" by itself repeatedly modulo the candidate polynomial; the
//        candidate is primitive exactly when the multiplicative order of x reaches 2^n - 1 without
//        returning to 1 sooner.
//
//   n = 1 is a genuine edge case, not a hack: the only candidate with nonzero constant term is
//   x + 1, whose root is 1, the single element of the trivial group GF(2)* — order 1 equals the
//   group size 2^1 - 1 = 1, so it counts as primitive. This gives a(1) = 1, matching the standard
//   primitive-polynomial-count formula φ(2^n - 1)/n at n=1 (φ(1)/1 = 1) — see proof.mjs and the
//   sequence's own README for why OEIS's published a(1) = 2 differs (OEIS says so itself).
//
// Cost: irreducibility testing is polynomial in n, but the primitivity check multiplies up to
// 2^n - 1 times per candidate — exponential overall. Measured on this machine: n=14 in 389 ms,
// n=16 in 4.1 s, n=18 in 55.6 s; n=20 did not finish within 90 s.

function polyMulMod(a, b, mod, degMod) {
  let result = 0;
  for (let i = 0; i <= 32; i++) if (b & (1 << i)) result ^= (a << i);
  for (let d = 32; d >= degMod; d--) if (result & (1 << d)) result ^= (mod << (d - degMod));
  return result >>> 0;
}

export function isIrreducible(poly, n) {
  for (let d = 1; d * 2 <= n; d++) {
    for (let cand = (1 << d); cand < (1 << (d + 1)); cand++) {
      let rem = poly;
      for (let k = n; k >= d; k--) if (rem & (1 << k)) rem ^= (cand << (k - d));
      if (rem === 0) return false;
    }
  }
  return true;
}

// Multiplicative order of x modulo `mod` (a degree-n polynomial), over GF(2).
export function multiplicativeOrder(n, mod) {
  const groupSize = (1 << n) - 1;
  let x = 2, cur = 1;
  for (let k = 1; k <= groupSize; k++) {
    cur = polyMulMod(cur, x, mod, n);
    if (cur === 1) return k;
  }
  return -1;
}

export function a(n) {
  if (n === 1) return 1; // see header note: the single candidate x+1 is primitive by definition
  const groupOrder = (1 << n) - 1;
  let count = 0;
  for (let poly = (1 << n) | 1; poly < (1 << (n + 1)); poly += 2) {
    if (!isIrreducible(poly, n)) continue;
    if (multiplicativeOrder(n, poly) === groupOrder) count++;
  }
  return count;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 16);
  const out = [];
  for (let n = 1; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
