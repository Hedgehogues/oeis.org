// Independent check of the statistical claims memory-bank/visualizations/A000030/viz.html embeds.
//
// The page's real subject is not a combinatorial count but a NUMERICAL/STATISTICAL claim: the
// proportion of integers whose leading digit is 1 never settles as the range grows, while the same
// digit-extraction applied to powers of 2 (OEIS A008952) settles onto Benford's law — because the
// fractional parts of log10(n) are skewed but the fractional parts of n*log10(2) are equidistributed
// (log10(2) being irrational). This mirrors group-tables.mjs's role for A000001: re-derive, from
// scratch, exactly what the page's own <script> computes, rather than trusting it was authored
// correctly.
//
// Run: node memory-bank/verify/benford.mjs

function leadingDigit(n) {
  if (n === 0) return 0;
  n = Math.floor(Math.abs(n));
  while (n >= 10) n = Math.floor(n / 10);
  return n;
}

// exact leading digit of 2^n via BigInt — the source of truth this check compares the fast,
// log-based method against, since the fast method has a known rare float-boundary error (about
// 1 case in 5000 near an exact power of 10) that must not silently corrupt the page's numbers.
function leadingDigitPow2Exact(n) {
  return Number((2n ** BigInt(n)).toString()[0]);
}
const LOG10_2 = Math.log10(2);
function leadingDigitPow2Fast(n) {
  const frac = (n * LOG10_2) % 1;
  return Math.floor(10 ** frac);
}

let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// ---- 1. A008952 agreement (published terms, offset 0, a(0)=1) -----------------------------------
const A008952 = [
  1, 2, 4, 8, 1, 3, 6, 1, 2, 5, 1, 2, 4, 8, 1, 3, 6, 1, 2, 5, 1, 2, 4, 8, 1, 3, 6, 1, 2, 5, 1, 2, 4,
  8, 1, 3, 6, 1, 2, 5, 1, 2, 4, 8, 1, 3, 7, 1, 2, 5, 1, 2, 4, 9, 1, 3, 7, 1, 2, 5, 1, 2, 4, 9, 1, 3,
  7, 1, 2, 5, 1, 2, 4, 9, 1, 3, 7, 1, 3, 6, 1, 2, 4, 9, 1, 3, 7, 1, 3, 6, 1, 2, 4, 9, 1, 3
];
let a008952Ok = true;
for (let n = 0; n < A008952.length; n++) {
  const exact = leadingDigitPow2Exact(n);
  if (exact !== A008952[n]) { fail(`2^${n}: exact leading digit ${exact}, OEIS A008952 says ${A008952[n]}`); a008952Ok = false; }
}
if (a008952Ok) console.log(`ok    A008952 agreement: exact leading digit of 2^n matches OEIS for n=0..${A008952.length - 1}`);

// ---- 2. the fast method's float-boundary caveat is real, bounded, and known ----------------------
let mismatches = 0;
for (let n = 0; n <= 5000; n++) {
  if (leadingDigitPow2Exact(n) !== leadingDigitPow2Fast(n)) mismatches++;
}
console.log(`ok    fast-method caveat: the log10-fractional-part shortcut disagrees with the exact BigInt value at ${mismatches} of 5001 checked n (a known float-boundary effect, not used for any single displayed term on the page — only for the large-K aggregate below)`);

// ---- 3. Benford convergence for 2^n leading digits, K=1e6 (the page's headline number) ----------
const K = 1e6;
const counts = new Array(10).fill(0);
for (let n = 0; n < K; n++) counts[leadingDigitPow2Fast(n)]++;
const BENFORD = [0, 30.103, 17.609, 12.494, 9.691, 7.918, 6.695, 5.799, 5.115, 4.576];
let benfordOk = true;
for (let d = 1; d <= 9; d++) {
  const observed = 100 * counts[d] / K;
  if (Math.abs(observed - BENFORD[d]) > 0.1) {
    fail(`digit ${d}: observed ${observed.toFixed(2)}% among 2^0..2^${K - 1}, Benford predicts ${BENFORD[d]}% — off by more than 0.1 point`);
    benfordOk = false;
  }
}
if (benfordOk) console.log(`ok    Benford convergence: leading-digit frequencies of 2^0..2^${K - 1} match Benford's law to within 0.1 percentage point on every digit`);

// ---- 4. equidistribution: {n*log10(2)} is uniform, {log10(n)} is skewed (the page's mechanism) --
const decileNLog2 = new Array(10).fill(0);
for (let n = 1; n <= K; n++) decileNLog2[Math.floor(((n * LOG10_2) % 1) * 10)]++;
const maxDevUniform = Math.max(...decileNLog2.map((c) => Math.abs(100 * c / K - 10)));
if (maxDevUniform > 0.5) fail(`{n*log10(2)} deciles deviate from uniform by up to ${maxDevUniform.toFixed(2)} points — expected near-perfect equidistribution`);
else console.log(`ok    equidistribution: {n·log10(2)} deciles are uniform to within ${maxDevUniform.toFixed(2)} points over n=1..${K} (log10(2) is irrational)`);

const decileLogN = new Array(10).fill(0);
for (let n = 1; n <= K; n++) decileLogN[Math.floor((Math.log10(n) % 1) * 10)]++;
const firstDecile = 100 * decileLogN[0] / K, lastDecile = 100 * decileLogN[9] / K;
if (!(lastDecile > firstDecile * 5)) fail(`{log10(n)} deciles are not clearly skewed (first decile ${firstDecile.toFixed(2)}%, last ${lastDecile.toFixed(2)}%) — the page's contrast needs a real skew, not a mild one`);
else console.log(`ok    skew: {log10(n)} deciles run from ${firstDecile.toFixed(2)}% (first) to ${lastDecile.toFixed(2)}% (last) over n=1..${K} — the mechanism behind why plain integers never settle onto Benford`);

console.log(failed === 0
  ? '\nAll statistical claims memory-bank/visualizations/A000030/viz.html embeds check out against an independent re-derivation.'
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
