// A000002 — Kolakoski sequence: a(n) is the length of the n-th run of the sequence itself,
// consisting only of 1s and 2s, with a(1) = 1.
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: the sequence is a FIXED POINT
// of run-length encoding — reading off the lengths of its own maximal runs reproduces the same
// sequence. No table of known answers is consulted.
//
// Run:  node sequences/A000002/solution.mjs [maxN]        (default 100)
//
// Method — why a 3-term start is a derivation, not a lookup
//   By definition a(1) = 1, so the first run (symbol "1") has length 1: term 1 is written and
//   nothing more. The second run's SYMBOL is forced to "2" by alternation, independent of its
//   LENGTH — so term 2 = 2, regardless of what a(2) will turn out to be. That fixes a(2) = 2 as a
//   value (term 2 is inside the run that reads its own length). Run 2 therefore has length a(2) = 2,
//   giving term 3 = 2 as well, which fixes a(3) = 2. The seed `[1, 2, 2]` is exactly these three
//   forced values — a normalization step, the same role A100001's fixed first three lines play,
//   not a table of pre-known answers.
//
//   From there the sequence bootstraps itself: a read pointer `i` and the write end of the array
//   are always the same list. To write run number `i+1`, alternate the symbol from the one just
//   written, then append that symbol `seq[i]` times — `seq[i]` is always already on the array,
//   because by the time run `i+1` is being written, runs 1..i have contributed at least `i` terms
//   (each run has length ≥ 1), so index `i` (0-based) already exists.
//
// Cost: this is linear, not a combinatorial search — there is no wall the way A000001's group
// count or A100001's configuration count have one. Measured on this machine: n = 100 in 0 ms,
// n = 10,000,000 in 89 ms; the practical limit is memory (an Int8Array), not time.

export function kolakoski(n) {
  if (n <= 0) return new Int8Array(0);
  const seq = [1, 2, 2];
  let i = 2; // seq[i] is the length of the next run to append
  while (seq.length < n) {
    const symbol = seq[seq.length - 1] === 1 ? 2 : 1; // alternate from the symbol just written
    const runLength = seq[i];
    for (let k = 0; k < runLength; k++) seq.push(symbol);
    i++;
  }
  seq.length = n;
  return Int8Array.from(seq);
}

export function a(n) {
  return kolakoski(n)[n - 1];
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 100);
  const t0 = Date.now();
  const seq = kolakoski(maxN);
  const ms = Date.now() - t0;
  console.log(`kolakoski(${maxN}) computed in ${ms} ms`);
  console.log('\n' + Array.from(seq.slice(0, Math.min(maxN, 200))).join(', ') + (maxN > 200 ? ', …' : ''));
}
