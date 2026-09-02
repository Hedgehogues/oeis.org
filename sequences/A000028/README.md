# A000028 — numbers whose exponent 1-bits sum to an odd count

If `m`'s prime factorization is `p_1^e_1 · p_2^e_2 · …`, `m` belongs to this sequence exactly when
the total number of 1-bits across the binary expansions of `e_1, e_2, …` is odd. The rule is a
one-line restatement — no further "why" beyond the arithmetic itself.

## Approach

`solution.mjs` factorizes each candidate `m` by trial division, sums the popcount of every
exponent, and keeps `m` when that sum is odd — nothing beyond the definition.

Status: **reproduces OEIS exactly** for `a(1)..a(67)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02): every returned value re-derived via a from-scratch smallest-prime-factor sieve and a
different popcount algorithm (Kernighan's bit trick, not shift-and-mask) — genuinely independent of
`solution.mjs`'s trial division; every EXCLUDED value below the last returned term (507 of them, up
to 1008, checked at `n=500`) confirmed to have an even sum, so nothing was skipped; and agreement
with OEIS's own `%S`/`%T`/`%U` line fetched from `oeis.org/search?q=id:A000028&fmt=text`. Measured:
`node sequences/A000028/solution.mjs` computes `a(1..1000)` in 4 ms. No combinatorial wall.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000028.md).

## The ideas behind it

No catalogued device fits or was needed: the page's content is two small, exact worked examples
(`24 = 2³×3¹`, marked; `12 = 2²×3¹`, not) laid out as plain factorization-and-binary chips, not a
reusable diagram convention distinct from what other simple pages already show without a formal
device.

## Build & run

```
node sequences/A000028/solution.mjs 1000    # compute a(1..1000) from the definition
node sequences/A000028/proof.mjs 500        # re-check that output, plus completeness of what was excluded
```

## The page these pictures come from

[![Counting 1-bits in the exponents](../../memory-bank/visualizations/A000028/screenshots/full.png)](../../memory-bank/visualizations/A000028/viz.html)

The page runs Problem (numbers 2–17, some marked, some not) → 1 (`24 = 2³×3¹` — its exponents'
1-bit counts, `2 + 1 = 3`, are odd, so it's marked) → 2 (`12 = 2²×3¹` — same shape, `1 + 1 = 2`,
even, not marked) → Solution (the rule holds for every number checked, not only the two worked
here).

**[Open it live →](../../memory-bank/visualizations/A000028/viz.html)** — every factorization,
every binary expansion and every sum comes from the same functions in the page's own script,
computed at load time, both themes, the same visual system as every other sequence here.

Source: [oeis.org/A000028](https://oeis.org/A000028)
