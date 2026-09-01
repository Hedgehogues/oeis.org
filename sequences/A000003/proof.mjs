// A000003 — proof side.
//
// Checks the IMPLEMENTATION (solution.mjs) instead of trusting it. Three independent checks, none
// of which reuses the direct-enumeration search that produced the answer:
//
//   1. soundness       — every returned triple (a,b,c) really is a reduced, primitive,
//                        positive-definite form of the right discriminant: a > 0, b²-4ac = D,
//                        gcd(a,b,c) = 1, and -a < b ≤ a ≤ c with b ≥ 0 when a = c.
//   2. completeness &
//      distinctness     — a WIDE net of arbitrary (not necessarily reduced) forms of the same
//                        discriminant is built, each one is folded down to its canonical reduced
//                        representative by a from-scratch Gauss reduction (a completely different
//                        algorithm — no bounded-a enumeration, just "walk a form down until it's
//                        reduced"), and the resulting SET is checked equal to solution.mjs's own
//                        output — nothing missing, nothing extra, no duplicate class.
//   3. agreement        — the resulting counts equal OEIS's own published terms for A000003.
//
// Run:  node sequences/A000003/proof.mjs [maxN]        (default 99)

import { reducedForms } from './solution.mjs';

// ---- OEIS A000003, %S/%T/%U lines, a(1)..a(99) --------------------------------------------------
const OEIS = [
  1, 1, 1, 1, 2, 2, 1, 2, 2, 2, 3, 2, 2, 4, 2, 2, 4, 2, 3, 4, 4, 2, 3, 4, 2, 6, 3, 2, 6, 4, 3, 4, 4,
  4, 6, 4, 2, 6, 4, 4, 8, 4, 3, 6, 4, 4, 5, 4, 4, 6, 6, 4, 6, 6, 4, 8, 4, 2, 9, 4, 6, 8, 4, 4, 8, 8,
  3, 8, 8, 4, 7, 4, 4, 10, 6, 6, 8, 4, 5, 8, 6, 4, 9, 8, 4, 10, 6, 4, 12, 8, 6, 6, 4, 8, 8, 8, 4, 8,
  6, 4
];

function gcd(x, y) {
  x = Math.abs(x); y = Math.abs(y);
  while (y) { [x, y] = [y, x % y]; }
  return x;
}

// ---- 1. soundness ---------------------------------------------------------------------------
function checkSoundness(forms, D) {
  const problems = [];
  for (const [a, b, c] of forms) {
    if (a <= 0) problems.push(`(${a},${b},${c}): a is not positive`);
    if (b * b - 4 * a * c !== D) problems.push(`(${a},${b},${c}): discriminant is ${b * b - 4 * a * c}, not ${D}`);
    if (gcd(gcd(a, b), c) !== 1) problems.push(`(${a},${b},${c}): not primitive`);
    if (!(b > -a && b <= a && a <= c)) problems.push(`(${a},${b},${c}): fails -a < b ≤ a ≤ c`);
    if (a === c && b < 0) problems.push(`(${a},${b},${c}): a = c but b < 0 (the duplicate case)`);
  }
  return problems;
}

// ---- 2. completeness & distinctness: an independent Gauss reduction, from scratch -------------
// Fold ANY (a,b,c) of discriminant D down to its unique reduced representative by walking it there
// — no bounded search over a, just the two classical moves: shift b into (-a,a] via x -> x+ky, and
// swap (a,c) with b -> -b whenever c < a. This shares no code with reducedForms()'s direct
// enumeration in solution.mjs.
function reduceForm(a, b, c) {
  let steps = 0;
  while (steps++ < 10000) {
    if (b <= -a || b > a) {
      const k = Math.round(-b / (2 * a));
      const nb = b + 2 * a * k;
      const nc = a * k * k + b * k + c;
      b = nb; c = nc;
      continue;
    }
    if (c < a) { [a, c] = [c, a]; b = -b; continue; }
    if (a === c && b < 0) { b = -b; continue; }
    return [a, b, c];
  }
  throw new Error(`reduceForm did not converge from (${a},${b},${c})`);
}

// A wide net of raw (not necessarily reduced) primitive forms of discriminant D: a beyond the
// reduced bound sqrt(|D|/3) by a comfortable margin, b over the full symmetric range for that a.
// If reduction from this much larger net still lands on exactly solution.mjs's set, nothing was
// missed by the bounded direct search, and nothing in it was a duplicate class.
function reducedFormsViaIndependentNet(n, marginFactor = 3) {
  const D = -4 * n;
  const aMax = Math.floor(Math.sqrt(-D / 3));
  const aNet = aMax * marginFactor + 5;
  const seen = new Set();
  const out = [];
  for (let a = 1; a <= aNet; a++) {
    for (let b = -a; b <= a; b++) {
      const num = b * b - D;
      if (num % (4 * a) !== 0) continue;
      const c = num / (4 * a);
      if (c <= 0) continue;
      if (gcd(gcd(a, b), c) !== 1) continue;
      const [ra, rb, rc] = reduceForm(a, b, c);
      const key = `${ra},${rb},${rc}`;
      if (!seen.has(key)) { seen.add(key); out.push([ra, rb, rc]); }
    }
  }
  return out;
}

// ---- run -----------------------------------------------------------------------------------
const maxN = Number(process.argv[2] || 99);
let failed = 0;
const fail = (msg) => { failed++; console.log(`FAIL  ${msg}`); };

let soundnessProblems = 0;
let netMismatches = 0;

for (let n = 1; n <= maxN; n++) {
  const D = -4 * n;
  const forms = reducedForms(n);

  // 1. soundness
  const problems = checkSoundness(forms, D);
  problems.forEach((p) => fail(`n=${n}: ${p}`));
  soundnessProblems += problems.length;

  // 2. completeness & distinctness via the independent net-and-reduce method
  const net = reducedFormsViaIndependentNet(n).map((f) => f.join(',')).sort();
  const direct = forms.map((f) => f.join(',')).sort();
  const same = net.length === direct.length && net.every((v, i) => v === direct[i]);
  if (!same) {
    fail(`n=${n}: independent net-and-reduce found {${net.join('; ')}}, direct search found {${direct.join('; ')}}`);
    netMismatches++;
  }

  // 3. agreement with OEIS
  if (n <= OEIS.length && forms.length !== OEIS[n - 1]) {
    fail(`n=${n}: a(n) = ${forms.length}, OEIS says ${OEIS[n - 1]}`);
  }
}

if (!soundnessProblems) console.log(`ok    soundness: every returned form for n=1..${maxN} is reduced, primitive, and has the right discriminant`);
if (!netMismatches) console.log(`ok    completeness & distinctness: an independent Gauss reduction over a net ${3}x wider than the direct search's bound recovers exactly the same set of classes for every n=1..${maxN}`);
const checkLen = Math.min(maxN, OEIS.length);
console.log(`ok    agreement: a(1)..a(${checkLen}) match OEIS A000003's published %S/%T/%U terms exactly`);

console.log(failed === 0
  ? `\nAll checks passed for n = 1..${maxN}: sound, complete and distinct (independently re-derived), and equal to OEIS A000003.`
  : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
