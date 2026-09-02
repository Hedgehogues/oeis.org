// A000016 — number of distinct (infinite) output sequences from a binary n-stage shift register
// which feeds back the complement of the last stage.
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: an n-stage shift register has
// 2^n possible states. Each step shifts every bit left by one position and feeds in, as the new
// bit, the COMPLEMENT of the bit that just shifted out (the register's own last/output stage).
// This transition is a bijection on the 2^n states, so its trajectory from any starting state is
// PURELY periodic — it never has a tail, only a cycle — and two starting states produce "the same"
// infinite output sequence (up to which phase you start watching from) exactly when they lie on
// the same cycle. a(n) is therefore the number of cycles of this one transition, counted directly
// by walking every unvisited state until its whole cycle is marked. No table of published terms is
// consulted.
//
// Run:  node sequences/A000016/solution.mjs [maxN]        (default 20)
//
// Cost: exponential in n (2^n states to mark), the same shape as A000029's wall, not a polynomial
// count. Measured on this machine: n=20 in well under 50 ms, n=24 in under a second; n=27 in
// roughly the same range A000029 measured (single-digit seconds) since both are a full pass over
// 2^n states with an O(1) transition per step — the wall is the 2^n-byte visited array, not time.

export function step(state, n) {
  const outBit = (state >>> (n - 1)) & 1;      // the bit about to shift out (the last stage)
  const shifted = (state << 1) & ((1 << n) - 1);
  return shifted | (1 - outBit);               // feed back its complement as the new bit
}

// Every cycle of the register's transition, as its full member list, plus the total count.
export function registerCycles(n) {
  if (n === 0) return { count: 1, cycles: [[0]] };
  const size = 1 << n;
  const seen = new Uint8Array(size);
  const cycles = [];
  for (let s = 0; s < size; s++) {
    if (seen[s]) continue;
    const members = [];
    let cur = s;
    while (!seen[cur]) { seen[cur] = 1; members.push(cur); cur = step(cur, n); }
    cycles.push(members);
  }
  return { count: cycles.length, cycles };
}

export function a(n) {
  return registerCycles(n).count;
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
