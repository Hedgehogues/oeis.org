# A000025 — coefficients of Ramanujan's mock theta function f(q)

`a(n)` is the `n`-th coefficient of `f(q) = 1 + Σ q^(k²)/∏(1+qⁱ)²`, one of the mock theta functions
Ramanujan defined in his last letter to Hardy: `1, 1, -2, 3, -3, 3, -5, 7, -6, 6, …`. The page's
subject is what these coefficients actually equal: `a(n)` = (partitions of `n` with even rank) −
(partitions of `n` with odd rank), where a partition's rank is its largest part minus its number of
parts (Dyson, 1944) — an exotic analytic series with an entirely ordinary partition statistic
hiding inside it.

## Approach

`solution.mjs` expands the defining `q`-series exactly, in `BigInt`, term by term — for each
`k` with `k² ≤ N`, builds `∏(1+qⁱ)²` for `i=1..k` as a truncated polynomial, inverts it as a formal
power series, and adds the shifted result into a running total. No table of published terms is
consulted.

Status: **reproduces OEIS exactly** for `a(0)..a(59)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02) against a construction sharing no code with the series at all: brute-force enumeration
of every actual partition of `n`, each signed by its own rank's parity and summed — matching the
series coefficient for every `n=0..75` (496 ms for `n≤60`, 5.2 s through `n=75`; the brute-force
side is exponential in `n`, the honest reason it stops there), and matching OEIS's own `%S`/`%T`/
`%U` line fetched from `oeis.org/search?q=id:A000025&fmt=text`. The series side itself has no wall
in that range: `N=300` in 6 ms.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000025.md).

## The ideas behind it

One device, new to the catalog (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Rank signed tally** — every partition of `n` listed and bordered by its rank's parity, then the
two colour counts summed with sign to the same number the series produces.
[`[device::RankSignedTally]`](../../memory-bank/_terms.md#deviceranksignedtally)

[![Rank signed tally](../../memory-bank/visualizations/A000025/screenshots/list.png)](../../memory-bank/visualizations/A000025/viz.html)

## Build & run

```
node sequences/A000025/solution.mjs 60    # expand f(q) from the definition, a(0..60)
node sequences/A000025/proof.mjs 60       # re-check via independent partition-rank enumeration
```

## The page these pictures come from

[![What the coefficients count](../../memory-bank/visualizations/A000025/screenshots/full.png)](../../memory-bank/visualizations/A000025/viz.html)

The page runs Problem (the intimidating series, the signed numbers it produces, "what are these
counting?") → 1 (a partition's rank, worked on one example) → 2 (all 11 partitions of 6, each
bordered by rank parity) → 3 (the two colour counts summed with sign, checked against the series'
own coefficient of `q⁶`) → Solution (the bridge stated plainly: a series from Ramanujan's last
letter to Hardy, adjacent to but not quite a modular form, has coefficients equal to an ordinary
partition statistic, independently verified rather than asserted).

**[Open it live →](../../memory-bank/visualizations/A000025/viz.html)** — every partition, every
rank and every summed count comes from the same functions in the page's own script, computed at
load time, both themes, the same visual system as every other sequence here.

Source: [oeis.org/A000025](https://oeis.org/A000025)
