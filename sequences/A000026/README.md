# A000026 — mosaic numbers

If `n = ∏ p_j^k_j` (prime factorization), `a(n) = ∏ (p_j · k_j)`. The per-term rule is a one-line
restatement of factorization with no further "why" — but the question of *when `a(n) = n`* has a
real answer, and OEIS's own comment on the entry states only half of it.

## Approach

`solution.mjs` factorizes `n` by trial division and multiplies each prime by its own exponent —
nothing beyond the definition.

Status: **reproduces OEIS exactly** for `a(1)..a(72)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02): every term re-derived via a from-scratch smallest-prime-factor sieve (sharing no code
with `solution.mjs`'s trial division), matching OEIS's own `%S`/`%T`/`%U` line fetched from
`oeis.org/search?q=id:A000026&fmt=text`; and OEIS's own comment — "`a(n) = n` if `n` is squarefree"
— checked directly as the one-directional claim it actually is, not the stronger `iff` a first
version of this check assumed. That stronger version failed immediately at `n = 4`: `4 = 2²` is not
squarefree, yet `a(4) = 2×2 = 4` anyway, an **incidental** fixed point (an exponent happening to
equal its own prime) with nothing to do with squarefreeness. Among `n = 1..5000`, 3,042 are
squarefree (all fixed points, as claimed) and 3,550 are fixed points in total — 508 of them
incidental. Measured: `node sequences/A000026/solution.mjs` computes `a(1..100000)` in 27 ms. No
combinatorial wall — trial-division factorization is `O(√n)` per term.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000026.md).

## The ideas behind it

No catalogued device fits or was needed: the page's content is two small, exact worked
examples (`6 = 2×3` squarefree, `4 = 2²` incidental) laid out as plain factorization chips, not a
reusable diagram convention distinct from what other simple pages already show without a formal
device.

## Build & run

```
node sequences/A000026/solution.mjs 1000    # compute a(1..1000) from the definition
node sequences/A000026/proof.mjs 5000       # re-check that output, plus the fixed-point claim
```

## The page these pictures come from

[![An if, not an iff](../../memory-bank/visualizations/A000026/screenshots/full.png)](../../memory-bank/visualizations/A000026/viz.html)

The page runs Problem (`a(n)` for `n=1..12`, some landing back on `n`, some not) → 1 (squarefree `n`
always works, worked on `6 = 2×3`) → 2 (but it's not the only way — `4 = 2²` also lands back on `4`,
incidentally) → Solution (squarefree implies fixed, always; the converse is false, with `4` as a
real counterexample rather than a caveat glossed over).

**[Open it live →](../../memory-bank/visualizations/A000026/viz.html)** — every factorization and
every match comes from the same functions in the page's own script, computed at load time, both
themes, the same visual system as every other sequence here.

Source: [oeis.org/A000026](https://oeis.org/A000026)
