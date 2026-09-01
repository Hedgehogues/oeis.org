# A100001 — Number of self-dual combinatorial configurations of type (n_3)

A configuration `(n_3)` is `n` points and `n` lines, every line holding exactly 3 points and every
point lying on exactly 3 lines. Swapping the roles of points and lines gives the *dual*; `a(n)`
counts the configurations isomorphic to their own dual — 0 until `n=7`, then 1, 1, 3, 10, 25, 95,
… up to 1 992 044 at `n=19`.

## Approach

Build every configuration up to isomorphism, dualise each one, and count those that come back to
themselves:

- Lines are added through the smallest point that still has fewer than 3, so a set of lines is
  built in exactly one order.
- Two normalisations keep the search from producing every relabelling of the same object: point 0's
  three lines are fixed as `{0,1,2}`, `{0,3,4}`, `{0,5,6}`, and a point that has never appeared yet
  must take the smallest unused label.
- The dual's points are this configuration's lines, and its line through an original point `p` is
  the triple of lines through `p`. Self-dual means isomorphic to that — *not* that the incidence
  matrix happens to look symmetric, which is exactly the distinction the page's picture makes.

Status: **reproduces OEIS exactly** for `n = 1..13` — `1, 1, 3, 10, 25, 95, 366` self-dual from
`n=7`. Verified independently by [`proof.mjs`](proof.mjs), run live 2026-09-01: every returned
configuration revalidated against the definition, no two isomorphic under a plain permutation
search sharing no pruning with the one that produced them, the Fano plane rebuilt from algebra
(nonzero vectors over GF(2)³) matching exactly one configuration at `n=7`, the total count matching
the independently published A001403 (`1, 1, 3, 10, 31, 229, 2036`), and every self-duality claim
carrying explicit point and line permutations verified cell by cell on the raw incidence matrix.
Measured: `n=12` in 15 s, `n=13` in about 4 minutes; `n=14` was not run.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A100001.md).

## The ideas behind it

Two catalogued devices, each recognizable in other sequences on its own (full write-ups:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Incidence matrix pair** — a structure's incidence matrix drawn next to its transpose, exactly as
each is labeled, deliberately *not* forced to look alike. The honest point is that the two grids
differ as drawn while the configuration is still self-dual: what matters is that *some* relabeling
turns one into the other. [`[device::IncidenceMatrixPair]`](../../memory-bank/_terms.md#deviceincidencematrixpair)

[![Incidence matrix pair](../../memory-bank/visualizations/A100001/screenshots/incidence-matrix-pair.png)](../../memory-bank/visualizations/A100001/viz.html)

**Log growth chart** — bars sized by logarithm with each literal value printed, so the first
nonzero term at `n=7` and the 1 992 044 at `n=19` stay readable in one
picture. [`[device::LogGrowthChart]`](../../memory-bank/_terms.md#deviceloggrowthchart)

[![Log growth chart](../../memory-bank/visualizations/A100001/screenshots/log-growth-chart.png)](../../memory-bank/visualizations/A100001/viz.html)

## Build & run

```
node sequences/A100001/solution.mjs 12    # compute a(1..12) from the definition
node sequences/A100001/proof.mjs 12       # re-check that output independently
```

## The page these pictures come from

[![Points = lines](../../memory-bank/visualizations/A100001/screenshots/full.png)](../../memory-bank/visualizations/A100001/viz.html)

It opens on the smallest and only famous case — the Fano plane, the unique `(7_3)` configuration,
drawn the classic way as a triangle with its medians and incircle. Hovering a point highlights the
3 lines through it, so "3 lines per point" is something you check rather than something you are
told.

[![Fano plane](../../memory-bank/visualizations/A100001/screenshots/fano-plane.png)](../../memory-bank/visualizations/A100001/viz.html)

**[Open it live →](../../memory-bank/visualizations/A100001/viz.html)** — hover states, both
themes, every diagram built at load time from the numbers being explained.

Source: [oeis.org/A100001](https://oeis.org/A100001)
