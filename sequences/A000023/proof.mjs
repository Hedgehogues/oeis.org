// A000023 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks, none
// of which reuses the brute-force permutation search that produced the answer:
//
//   1. bucket sum   — a(n) = sum_{k=0}^n (-1)^k * C(n,k) * D(n-k), where D(m) is the number of
//                     derangements of m elements: choose which k positions are fixed (C(n,k) ways),
//                     derange the rest (D(n-k) ways), and sign by the parity of k — a direct
//                     application of the inclusion-exclusion principle, computed from combinatorics
//                     formulas, not by generating a single permutation.
//   2. recurrence   — a(n) = n*a(n-1) + (-2)^n, a(0)=1, which falls out of the exponential
//                     generating function e^(-2x)/(1-x) for this exact signed count (a fact stated
//                     independently in OEIS's own comment on A000023, itself checked against the
//                     brute-force and bucket-sum values here rather than trusted).
//   3. agreement    — the results equal OEIS's own published terms for A000023.
//
// Run:  node sequences/A000023/proof.mjs [maxN]        (default 10, brute-force-bounded)

import { a } from './solution.mjs';

// ---- OEIS A000023, %S/%T/%U lines, a(0)..a(22) -------------------------------------------------
const OEIS = [
  1n, -1n, 2n, -2n, 8n, 8n, 112n, 656n, 5504n, 49024n, 491264n, 5401856n, 64826368n, 842734592n,
  11798300672n, 176974477312n, 2831591702528n, 48137058811904n, 866467058876416n,
  16462874118127616n, 329257482363600896n, 6914407129633521664n, 152116956851941670912n
];

function factorial(n) { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; }
function comb(n, k) { return factorial(n) / (factorial(k) * factorial(n - k)); }

// ---- 1. bucket sum: derangement counts, computed from their own recurrence, no permutations ----
function derangements(maxM) {
  const D = [1n, 0n];
  for (let i = 2; i <= maxM; i++) D.push(BigInt(i - 1) * (D[i - 1] + D[i - 2]));
  return D;
}
function viaBucketSum(n, D) {
  let s = 0n;
  for (let k = 0; k <= n; k++) {
    const term = comb(n, k) * D[n - k] * (k % 2 === 0 ? 1n : -1n);
    s += term;
  }
  return s;
}

// ---- 2. recurrence: a(n) = n*a(n-1) + (-2)^n, a(0) = 1 ------------------------------------------
function viaRecurrence(maxN) {
  const out = [1n];
  for (let n = 1; n <= maxN; n++) out.push(BigInt(n) * out[n - 1] + (-2n) ** BigInt(n));
  return out;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 10);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

const D = derangements(maxN);
const recurrenceVals = viaRecurrence(maxN);

let bucketOk = true, recurrenceOk = true, agreementOk = true;
for (let n = 0; n <= maxN; n++) {
  const got = a(n);

  const bucket = viaBucketSum(n, D);
  if (bucket !== got) { fail(`n=${n}: a(n)=${got}, bucket-sum (inclusion-exclusion) gives ${bucket}`); bucketOk = false; }

  const rec = recurrenceVals[n];
  if (rec !== got) { fail(`n=${n}: a(n)=${got}, recurrence n*a(n-1)+(-2)^n gives ${rec}`); recurrenceOk = false; }

  if (n < OEIS.length && got !== OEIS[n]) { fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}

if (bucketOk) console.log(`ok    bucket sum: sum_k (-1)^k C(n,k) D(n-k) (inclusion-exclusion over fixed-point counts) matches a(0)..a(${maxN}) exactly`);
if (recurrenceOk) console.log(`ok    recurrence: a(n) = n*a(n-1) + (-2)^n matches a(0)..a(${maxN}) exactly`);
if (agreementOk) console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000023's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: two structurally independent formulas agree with the brute-force definition, and both equal OEIS A000023.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
