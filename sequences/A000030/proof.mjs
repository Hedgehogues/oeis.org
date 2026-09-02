// A000030 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it, plus the one statistical claim
// that belongs to THIS sequence's own values (the frequency claim about A008952/powers of 2 lives
// in memory-bank/verify/benford.mjs instead, since that is math a different sequence's page embeds).
//
//   1. soundness    — every a(n) is a single digit 0-9, and a(0) = 0 as the definition requires.
//   2. independence — a(n) re-derived via a completely different route (log10, not string/division)
//                     and cross-checked against solution.mjs's own output.
//   3. agreement    — the results equal OEIS's own published terms for A000030.
//   4. never-settles — the natural-density claim the page's Problem/1 frames make: the proportion
//                     of n in 1..N with leading digit 1 does NOT converge as N grows. Checked
//                     directly by recomputing that proportion at several N and confirming it swings
//                     both far above and far below any fixed target, rather than asserting a limit.
//
// Run:  node sequences/A000030/proof.mjs [maxN]        (default 109)

import { leadingDigit } from './solution.mjs';

// ---- OEIS A000030, %S/%T/%U lines, a(0)..a(108) (offset 0) --------------------------------------
const OEIS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3,
  3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

// ---- independent re-derivation: floor(n / 10^floor(log10 n)), not the string/division loop ------
function leadingDigitViaLog(n) {
  if (n === 0) return 0;
  n = Math.abs(n);
  const k = Math.floor(Math.log10(n) + 1e-9); // epsilon guards the classic 10^k boundary float error
  let d = Math.floor(n / 10 ** k);
  if (d >= 10) d = Math.floor(d / 10); // defends against the rare case k was rounded down by the guard
  return d;
}

// ---- 4. the natural-density-never-settles claim, recomputed from scratch ------------------------
function digit1Share(N) {
  let c = 0;
  for (let n = 1; n <= N; n++) if (leadingDigit(n) === 1) c++;
  return c / N;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 109);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

// 1 & 2 & 3
let soundnessOk = true, independentOk = true, agreementOk = true;
for (let n = 0; n <= maxN; n++) {
  const got = leadingDigit(n);
  if (got < 0 || got > 9 || !Number.isInteger(got)) { fail(`n=${n}: a(n)=${got} is not a single digit`); soundnessOk = false; }
  if (n === 0 && got !== 0) { fail(`a(0) = ${got}, must be 0 by definition`); soundnessOk = false; }
  const viaLog = leadingDigitViaLog(n);
  if (viaLog !== got) { fail(`n=${n}: solution.mjs says ${got}, independent log10 route says ${viaLog}`); independentOk = false; }
  if (n < OEIS.length && got !== OEIS[n]) { fail(`n=${n}: a(n)=${got}, OEIS says ${OEIS[n]}`); agreementOk = false; }
}
if (soundnessOk) console.log(`ok    soundness: every a(0)..a(${maxN}) is a single digit, a(0) = 0`);
if (independentOk) console.log(`ok    independence: log10-based re-derivation agrees with solution.mjs for every n=0..${maxN}`);
if (agreementOk) console.log(`ok    agreement: a(0)..a(${Math.min(maxN, OEIS.length - 1)}) match OEIS A000030's published %S/%T/%U terms exactly`);

// 4. never settles
const samples = [999, 1999, 5000, 9999, 99999, 199999];
const shares = samples.map((N) => [N, digit1Share(N)]);
const maxShare = Math.max(...shares.map(([, s]) => s));
const minShare = Math.min(...shares.map(([, s]) => s));
const spread = maxShare - minShare;
console.log('      digit-1 share at N =', shares.map(([N, s]) => `${N}:${(100 * s).toFixed(1)}%`).join(', '));
if (spread < 0.3) {
  fail(`the digit-1 share barely moved (spread ${(100 * spread).toFixed(1)} points) across N=${samples.join(',')} — the "never settles" claim needs a real swing to be honest, and this run did not show one`);
} else {
  console.log(`ok    never-settles: digit-1's share swings from ${(100 * minShare).toFixed(1)}% to ${(100 * maxShare).toFixed(1)}% across N=${samples.join(',')} — no fixed value fits all of them`);
}

console.log(failed === 0
  ? `\nAll checks passed for n = 0..${maxN}: sound, independently re-derived, equal to OEIS A000030, and the natural-density claim the page makes is real.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
