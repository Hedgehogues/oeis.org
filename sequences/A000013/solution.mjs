// A000013 — number of n-bead binary necklaces where colors may be swapped but turning over is
// not allowed.
//
// IMPLEMENTATION. Same construction as A000029's page (orbit counting on {0,1}^n), with a
// different group: rotation AND colour-complement, but no reflection. Two strings are the same
// necklace here exactly when one reaches the other by rotating and/or complementing every bead's
// colour — flipping the string end-to-end is NOT one of the allowed moves for this sequence. No
// table of published terms is consulted.
//
// Run:  node sequences/A000013/solution.mjs [maxN]        (default 20)
//
// Cost: exponential in n (2^n strings), the same shape as A000029's wall. Measured on this
// machine: n=20 in well under 100 ms, matching A000029's measured range for the same reason (one
// flood-fill pass over 2^n states).

function rotateBy1(s, n) {
  return ((s << 1) | (s >>> (n - 1))) & ((1 << n) - 1);
}
function complement(s, n) {
  return (~s) & ((1 << n) - 1);
}

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
      const r = rotateBy1(cur, n);
      const c = complement(cur, n);
      if (!seen[r]) { seen[r] = 1; stack.push(r); }
      if (!seen[c]) { seen[c] = 1; stack.push(c); }
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
