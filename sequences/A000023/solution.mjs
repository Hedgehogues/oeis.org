// A000023 — a(n) is the number of permutations of {1,...,n} with an even number of fixed points
// minus the number with an odd number of fixed points.
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: generate every permutation of
// n elements, count its fixed points, and add +1 if that count is even, -1 if odd. No table of
// published terms, no recurrence, no generating function — just the definition, directly.
//
// Run:  node sequences/A000023/solution.mjs [maxN]        (default 10)
//
// Cost: this is n! work, not polynomial — there is a real combinatorial wall, the same kind
// A000001's and A100001's searches have. Measured on this machine: n=9 in 16 ms, n=10 in 141 ms,
// n=11 in 1.5 s, n=12 in 18.1 s; n=13 was not attempted (projected well past a minute).

export function a(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  let total = 0n;
  const permute = (l) => {
    if (l === arr.length) {
      let fix = 0;
      for (let i = 0; i < arr.length; i++) if (arr[i] === i) fix++;
      total += fix % 2 === 0 ? 1n : -1n;
      return;
    }
    for (let i = l; i < arr.length; i++) {
      [arr[l], arr[i]] = [arr[i], arr[l]];
      permute(l + 1);
      [arr[l], arr[i]] = [arr[i], arr[l]];
    }
  };
  permute(0);
  return total;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 10);
  const out = [];
  for (let n = 0; n <= maxN; n++) {
    const t0 = Date.now();
    const v = a(n);
    out.push(v);
    console.log(`a(${n}) = ${v}   (${Date.now() - t0} ms)`);
  }
  console.log('\n' + out.join(', '));
}
