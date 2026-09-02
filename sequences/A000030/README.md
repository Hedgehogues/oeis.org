# A000030 — initial digit of n

`a(n)` is the leading (first, leftmost) digit of `n`, with `a(0) = 0` by convention. The rule itself
is a one-line restatement — OEIS's own entry lists the sequence's self-similar block structure as an
"Equivalent definition," not a finding. What this page is actually about is a different, genuinely
open-ended question: **how often does each digit lead**, as you count further and further — and the
honest answer for A000030 itself is that it never settles.

## Approach

`solution.mjs` computes `a(n)` by repeated division (divide by 10 until one digit remains) — the
plain definition, nothing statistical. The statistical claim the page draws lives one level up, the
same way a page's embedded algebraic facts do for A000001's group tables:

- The proportion of `n` in `1..N` with leading digit 1 does **not** converge as `N` grows — it swings
  between roughly 11% and 56% depending on where `N` falls relative to a power of ten, forever.
- The same digit-extraction rule applied to powers of two (`A008952`) settles onto Benford's law and
  stays there, because the fractional parts of `n·log₁₀2` are equidistributed (`log₁₀2` is
  irrational) while the fractional parts of `log₁₀n` are skewed.

Status: **reproduces OEIS exactly** for `a(0)..a(109)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02): every term re-derived by an independent log₁₀-based route (not the division loop),
sound (`a(n)` a single digit, `a(0)=0`), matching OEIS's own `%S`/`%T`/`%U` line fetched from
`oeis.org/search?q=id:A000030&fmt=text`, and the "never settles" claim itself checked by
recomputing digit-1's share at `N = 999, 1999, 5000, 9999, 99999, 199999`: `11.1%, 55.6%, 22.2%,
11.1%, 11.1%, 55.6%` — a real 44-point swing, not a caption asserting one. The page's separate
statistical claims about `A008952` and the equidistribution mechanism are independently re-checked
by [`memory-bank/verify/benford.mjs`](../../memory-bank/verify/benford.mjs), the same role
`memory-bank/verify/group-tables.mjs` plays for A000001's embedded group tables — run live, all
five checks pass, including the exact-`BigInt` cross-check of the fast log-based method used for the
one-million-term aggregate. No combinatorial wall: `a(n)` is `O(log₁₀ n)` per term.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000030.md).

## The ideas behind it

Two devices, both new to the catalog (full write-ups:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

| Device | Essence |
|---|---|
| [`[device::NonConvergingTrace]`](../../memory-bank/_terms.md#devicenonconvergingtrace) | A running statistic plotted at widening sample sizes, connected point to point — here, showing the ABSENCE of a limit as a zigzag with no settling amplitude. |
| [`[device::FractionalPartHistogram]`](../../memory-bank/_terms.md#devicefractionalparthistogram) | Fractional parts bucketed into ten bins against a fixed even-split reference line — the same device drawn twice, once skewed and once flat, so the contrast is a shape comparison. |

[![Non-converging trace](../../memory-bank/visualizations/A000030/screenshots/non-converging-trace.png)](../../memory-bank/visualizations/A000030/viz.html)
[![Fractional-part histogram, skewed](../../memory-bank/visualizations/A000030/screenshots/skew-bars.png)](../../memory-bank/visualizations/A000030/viz.html)

`NonConvergingTrace` exists because the standard "value settles down" convergence chart would have
made the opposite, false claim here — the whole point of step 1 is that nothing settles.
`FractionalPartHistogram` is reused twice on the same page at the same scale specifically so
"skewed" and "uniform" are directly comparable shapes, not two independently-scaled charts that
happen to look different.

## Build & run

```
node sequences/A000030/solution.mjs 109    # compute a(0..109) from the definition
node sequences/A000030/proof.mjs 109       # re-check that output, plus the never-settles claim
node memory-bank/verify/benford.mjs        # independently re-derive the page's A008952/equidistribution claims
```

## The page these pictures come from

[![Same rule, two fates](../../memory-bank/visualizations/A000030/screenshots/full.png)](../../memory-bank/visualizations/A000030/viz.html)

The page runs Problem (leading-digit frequencies at `N=999` look perfectly flat, 11.1% each) → 1
(pushing `N` past the next power of ten breaks that flatness, and it never comes back) → 2 (why:
the fractional parts of `log₁₀n` are skewed, not evenly spread) → 3 (the identical rule applied to
`A008952`, powers of two, settles onto Benford's law and stays there) → 4 (why that one settles:
the fractional parts of `n·log₁₀2` are dead uniform, because `log₁₀2` is irrational) → Solution (one
digit-extraction rule, two inputs, two fates — stated plainly that A000030 itself does **not** obey
Benford's law under plain counting, which is the one claim this page's honesty depends on).

**[Open it live →](../../memory-bank/visualizations/A000030/viz.html)** — every bar, every point on
the trace, every percentage comes from the same functions in the page's own script, computed at
load time, both themes, the same visual system as every other sequence here.

Source: [oeis.org/A000030](https://oeis.org/A000030) · contrast sequence:
[oeis.org/A008952](https://oeis.org/A008952)
