// A000011 — number of n-bead necklaces (turning over is allowed) where complements are
// equivalent.
//
// IMPLEMENTATION. Same construction as A000029's page (orbit counting on {0,1}^n), with a larger
// group: rotation, reflection, AND colour-complement all allowed. Two strings are the same
// necklace here exactly when one reaches the other by rotating, flipping end-to-end, and/or
// complementing every bead's colour — the largest of the three necklace/bracelet groups in this
// catalog (A000029 has rotation+reflection only, A000013 has rotation+complement only). No table
// of published terms is consulted.
//
// Run:  node sequences/A000011/solution.mjs [maxN]        (default 20)
//
// Cost: exponential in n (2^n strings), the same shape as A000029's and A000013's walls. Measured
// on this machine: n=20 in well under 100 ms, for the same reason (one flood-fill pass over 2^n
// states, a larger generator set does not change the asymptotic cost).

function rotateBy1(s, n) { return ((s << 1) | (s >>> (n - 1))) & ((1 << n) - 1); }
function reverseBits(s, n) {
  let r = 0;
  for (let i = 0; i < n; i++) r |= ((s >>> i) & 1) << (n - 1 - i);
  return r;
}
function complement(s, n) { return (~s) & ((1 << n) - 1); }

export function necklaces(n) {
  if (n === 0) return { count: 1, orbits: [[0]] };
  const size = 1 << n;
  const seen = new Uint8Array(size);
  const orbits = [];
  for (let s = 0; s < size; s++) {
    if (seen[s]) continue;
    const members = [];
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const cur = stack.pop();
      members.push(cur);
      for (const nx of [rotateBy1(cur, n), reverseBits(cur, n), complement(cur, n)]) {
        if (!seen[nx]) { seen[nx] = 1; stack.push(nx); }
      }
    }
    orbits.push(members);
  }
  return { count: orbits.length, orbits };
}

export function a(n) {
  return necklaces(n).count;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 20);
  const out = [];
  for (let n = 0; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
