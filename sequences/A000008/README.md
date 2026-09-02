# A000008 — ways of making change for n cents

`a(n)` counts the piles of 1-, 2-, 5- and 10-cent coins (unlimited supply of each, order doesn't
matter) that add up to `n` cents: `1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 11, …`.

## Approach

`solution.mjs` builds the count up one coin denomination at a time — the standard unbounded-knapsack
recurrence: allow only 1-cent coins (every amount has exactly one way), then bring in 2-cent coins
(each amount's count becomes what it already was, plus the count for that amount minus 2 — one more
way per way that already existed for the smaller amount), then 5s, then 10s. No table of published
terms is consulted.

Status: **reproduces OEIS exactly** for `a(0)..a(60)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02): every count independently re-derived by literally enumerating coin quadruples
`(c1,c2,c5,c10)` with `c1+2c2+5c5+10c10=n` — the definition read directly, sharing no code with the
staged recurrence — agreeing for every `n=0..200`, and matching OEIS's own `%S`/`%T`/`%U` line
fetched live from `oeis.org/search?q=id:A000008&fmt=text`. The implementation itself measures
`a(0..1,000)` in under a millisecond and `a(0..1,000,000)` in 29 ms — polynomial, no combinatorial
wall.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000008.md).

## The ideas behind it

One device, new to the catalog (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Incremental tally** — build a count up one generator (one coin denomination) at a time, one row
per stage, so a jump in the count is traceable to the exact stage that caused it rather than
asserted about the final row alone.
[`[device::IncrementalTally]`](../../memory-bank/_terms.md#deviceincrementaltally)

[![Incremental tally](../../memory-bank/visualizations/A000008/screenshots/staged-table.png)](../../memory-bank/visualizations/A000008/viz.html)
[![Why a cell grows](../../memory-bank/visualizations/A000008/screenshots/why-grows.png)](../../memory-bank/visualizations/A000008/viz.html)

## Build & run

```
node sequences/A000008/solution.mjs 60    # compute a(0..60) from the definition
node sequences/A000008/proof.mjs 60       # re-check it via literal coin-quadruple enumeration
```

## The page these pictures come from

[![One coin at a time](../../memory-bank/visualizations/A000008/screenshots/full.png)](../../memory-bank/visualizations/A000008/viz.html)

The page runs Problem (the four coins, "how many piles make 7 cents?") → 1 (the staged table:
allowing 1s only, then 1s+2s, then +5s, then +10s, watching the count for each amount grow row by
row) → 2 (zooming into one cell: the count for 7 after adding 2-cent coins splits into "no 2 at
all" plus "at least one 2", both highlighted and summed) → Solution (all 6 concrete piles that make
7 cents, beside the count and a verified-match badge citing `proof.mjs`'s real run).

**[Open it live →](../../memory-bank/visualizations/A000008/viz.html)** — every row, every cell and
every pile comes from the same functions in the page's own script, computed at load time, both
themes, the same visual system as every other sequence here.

Source: [oeis.org/A000008](https://oeis.org/A000008)
