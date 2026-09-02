// A000009 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks:
//
//   1. Euler's theorem  — the SAME count is re-derived by a completely different recurrence: an
//                         UNBOUNDED knapsack (like A000008's coins) over ODD part sizes only,
//                         rather than a bounded 0/1 knapsack over ALL part sizes. Agreement between
//                         these two, structurally unrelated constructions is Euler's theorem itself
//                         ("partitions into distinct parts" = "partitions into odd parts"), not a
//                         restatement of the same computation.
//   2. bijection witness — for one concrete n, every actual odd-parts partition is transformed by
//                         Euler's explicit binary-expansion map into a distinct-parts partition,
//                         and the resulting set is checked to be EXACTLY the set of distinct-parts
//                         partitions of n — no omissions, no collisions. This is what makes the
//                         page's central claim a witnessed correspondence, not an asserted count.
//   3. agreement        — the resulting counts equal OEIS's own published terms for A000009.
//
// Run:  node sequences/A000009/proof.mjs [maxN]        (default 56)

import { distinctPartWays } from './solution.mjs';

// ---- OEIS A000009, %S/%T/%U lines, a(0)..a(55) (kept as plain numbers, converted below — every
// value here is well under Number.MAX_SAFE_INTEGER, unlike the BigInt-only range solution.mjs
// reaches past n=567) --------------------------------------------------------------------------
const OEIS = [
  1, 1, 1, 2, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 27, 32, 38, 46, 54, 64, 76,
  89, 104, 122, 142, 165, 192, 222, 256, 296, 340, 390, 448, 512, 585, 668, 760,
  864, 982, 1113, 1260, 1426, 1610, 1816, 2048, 2304, 2590, 2910, 3264, 3658, 4097,
  4582, 5120, 5718, 6378
].map(BigInt);

// ---- 1. Euler's theorem: partitions into ODD parts, an unbounded knapsack over odd part sizes ----
function oddPartWays(n) {
  const ways = new Array(n + 1).fill(0n);
  ways[0] = 1n;
  for (let part = 1; part <= n; part += 2) {
    for (let amt = part; amt <= n; amt++) ways[amt] += ways[amt - part];
  }
  return ways;
}

// ---- 2. bijection witness: enumerate actual partitions, apply Euler's explicit binary map --------
function partitionsDistinct(n, max = n) {
  if (n === 0) return [[]];
  const out = [];
  for (let k = Math.min(max, n); k >= 1; k--) {
    for (const rest of partitionsDistinct(n - k, k - 1)) out.push([k, ...rest]);
  }
  return out;
}
function partitionsOdd(n, max = n) {
  if (n === 0) return [[]];
  const out = [];
  const maxOdd = max % 2 === 0 ? max - 1 : max;
  for (let k = maxOdd; k >= 1; k -= 2) {
    if (k > n) continue;
    for (const rest of partitionsOdd(n - k, k)) out.push([k, ...rest]);
  }
  return out;
}
// Euler's map: group odd parts by value, write each value's multiplicity in binary, and expand
// odd_value * 2^bit for every set bit — the standard bijection behind the theorem.
function oddToDistinct(oddParts) {
  const counts = new Map();
  for (const p of oddParts) counts.set(p, (counts.get(p) || 0) + 1);
  const result = [];
  for (const [odd, mult] of counts) {
    let m = mult, bit = 0;
    while (m > 0) { if (m & 1) result.push(odd * (2 ** bit)); m >>= 1; bit++; }
  }
  return result.sort((x, y) => y - x);
}
function checkBijection(n) {
  const dp = partitionsDistinct(n).map((p) => [...p].sort((x, y) => y - x));
  const op = partitionsOdd(n);
  const mapped = op.map(oddToDistinct);
  const key = (p) => p.join(',');
  const dpKeys = new Set(dp.map(key));
  const mappedKeys = mapped.map(key);
  const allFound = mappedKeys.every((k) => dpKeys.has(k));
  const noCollisions = new Set(mappedKeys).size === mappedKeys.length;
  const sizesMatch = dp.length === op.length;
  return { allFound, noCollisions, sizesMatch, dpCount: dp.length, opCount: op.length };
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 56);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const w = distinctPartWays(maxN);
const wOdd = oddPartWays(maxN);

let eulerOk = true;
for (let n = 0; n <= maxN; n++) {
  if (w[n] !== wOdd[n]) { fail(`n=${n}: distinct-parts count ${w[n]} != odd-parts count ${wOdd[n]}`); eulerOk = false; }
}
if (eulerOk) console.log(`ok    Euler's theorem: the odd-parts recurrence (a structurally different construction) agrees with the distinct-parts recurrence for every n=0..${maxN}`);

const BIJECTION_N = 8;
const bij = checkBijection(BIJECTION_N);
if (!bij.sizesMatch || !bij.allFound || !bij.noCollisions) {
  fail(`n=${BIJECTION_N}: bijection witness failed — sizesMatch=${bij.sizesMatch} allFound=${bij.allFound} noCollisions=${bij.noCollisions}`);
} else {
  console.log(`ok    bijection witness: for n=${BIJECTION_N}, all ${bij.opCount} odd-parts partitions map via Euler's binary-expansion rule to exactly the ${bij.dpCount} distinct-parts partitions, with no omissions and no collisions`);
}

let agreementOk = true;
const checkLen = Math.min(maxN, OEIS.length - 1);
for (let n = 0; n <= checkLen; n++) {
  if (w[n] !== OEIS[n]) { fail(`a(${n}) = ${w[n]}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${checkLen}) match OEIS A000009's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: Euler's theorem verified by two structurally different constructions, the bijection witnessed concretely at n=${BIJECTION_N}, and the terms equal OEIS A000009.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
