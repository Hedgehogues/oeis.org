// A000030 — initial (leading) digit of n, with a(0) = 0 by convention (0 has no digits).
//
// IMPLEMENTATION. Computes a(n) from the definition the page draws: repeatedly divide by 10 until
// one digit remains. No table of published terms is consulted.
//
// Run:  node sequences/A000030/solution.mjs [maxN]        (default 109, matching OEIS's own %S/%T/%U line)
//
// This sequence is not a combinatorial search and has no wall — O(log10 n) per term. What the page
// actually explains is a STATISTICAL question about this sequence (how often each digit leads,
// as n grows) that this file does not address; that claim is independently re-derived in
// memory-bank/verify/benford.mjs, since it is math the PAGE embeds, not a property of a(n) itself.

export function leadingDigit(n) {
  if (n === 0) return 0;
  n = Math.floor(Math.abs(n));
  while (n >= 10) n = Math.floor(n / 10);
  return n;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const maxN = Number(process.argv[2] || 109);
  const out = [];
  for (let n = 0; n <= maxN; n++) out.push(leadingDigit(n));
  console.log(`a(0..${maxN}) computed`);
  console.log('\n' + out.join(', '));
}
