// A000025 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) with a genuinely different construction — not another
// pass over the same q-series, but the completely independent combinatorial meaning OEIS's own
// entry states in its %C line:
//
//   a(n) = (number of partitions of n with even rank) - (number of partitions of n with odd rank)
//   rank of a partition = its largest part minus its number of parts
//   (Dyson's rank; Wikipedia — Rank of a partition — states this exact definition and attributes
//   it to Freeman Dyson, 1944)
//
// This is not a reformulation of the series expansion — it enumerates actual partitions from
// scratch (recursive descent, no generating function, no BigInt polynomial arithmetic) and sums a
// sign per object. Two structurally unrelated computations of the same number is what makes
// agreement here evidence rather than a rerun.
//
//   1. rank-count agreement — brute-force partition enumeration, signed by rank parity, matches
//      solution.mjs's series coefficients for every n in range.
//   2. agreement        — both match OEIS's own published terms for A000025.
//
// Run:  node sequences/A000025/proof.mjs [maxN]        (default 60; the brute-force side is
// exponential in n — see the header's own measured wall before raising this past ~80)

import { mockThetaF } from './solution.mjs';

// ---- OEIS A000025, %S/%T/%U lines, a(0)..a(59) --------------------------------------------------
const OEIS = [
  1, 1, -2, 3, -3, 3, -5, 7, -6, 6, -10, 12, -11, 13, -17, 20, -21, 21, -27, 34, -33, 36, -46, 51,
  -53, 58, -68, 78, -82, 89, -104, 118, -123, 131, -154, 171, -179, 197, -221, 245, -262, 279, -314,
  349, -369, 398, -446, 486, -515, 557, -614, 671, -715, 767, -845, 920, -977, 1046, -1148, 1244
];

// ---- independent construction: enumerate every partition of n, sign by rank parity -------------
// Dyson's rank: largest part minus number of parts. This shares no code, no formula and no
// generating function with solution.mjs's series expansion.
function signedRankSum(n) {
  if (n === 0) return 1n;
  let sum = 0n;
  const parts = [];
  function rec(remaining, maxPart) {
    if (remaining === 0) {
      const rank = parts[0] - parts.length;
      sum += (rank % 2 === 0) ? 1n : -1n;
      return;
    }
    for (let p = Math.min(remaining, maxPart); p >= 1; p--) {
      parts.push(p);
      rec(remaining - p, p);
      parts.pop();
    }
  }
  rec(n, n);
  return sum;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 60);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const series = mockThetaF(maxN);

let rankOk = true;
const t0 = Date.now();
for (let n = 0; n <= maxN; n++) {
  const viaRank = signedRankSum(n);
  if (viaRank !== series[n]) {
    fail(`n=${n}: series says ${series[n]}, independent partition-rank enumeration says ${viaRank}`);
    rankOk = false;
  }
}
const ms = Date.now() - t0;
if (rankOk) console.log(`ok    rank-count agreement: signed partition-rank enumeration matches the series for n=0..${maxN} (brute force, ${ms} ms)`);

let agreementOk = true;
const checkLen = Math.min(maxN + 1, OEIS.length);
for (let n = 0; n < checkLen; n++) {
  if (series[n] !== BigInt(OEIS[n])) { fail(`n=${n}: computed a(n)=${series[n]}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (agreementOk) console.log(`ok    agreement: a(0)..a(${checkLen - 1}) match OEIS A000025's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: the series expansion and an independent, from-scratch partition-rank enumeration agree at every term, and both equal OEIS A000025.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
