# A100001 — Number of self-dual combinatorial configurations of type (n_3)

A configuration `(n_3)` is `n` points and `n` lines, each point on exactly 3 lines, each line
holding exactly 3 points. Swapping the roles of points and lines gives the *dual* configuration;
one is **self-dual** if it's isomorphic to its own dual. `a(n)` counts how many self-dual
configurations exist at each size — 0 until `n=7`, then 1, 1, 3, 10, 25, 95, ... up to 1 992 044
at `n=19`.

## The idea behind it

The picture opens with the smallest and only famous case: the **Fano plane**, the unique `(7_3)`
configuration, drawn the classic way (triangle + medians + incircle, 7 points, 7 lines). Hovering
a point highlights the 3 lines through it, making the "3 lines per point" rule tangible rather
than stated.

One catalogued device (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md#deviceincidencematrixpair)):

**Incidence matrix pair** — self-duality is shown as two 7×7 incidence matrices, the
configuration's own matrix and its transpose, side by side, deliberately *not* forced to look
identical. The honest point is that they look different as drawn, yet the configuration is still
self-dual: what matters is that *some* relabeling of points and lines turns one into the other, not
that the naive matrix is symmetric.
[`[device::IncidenceMatrixPair]`](../../memory-bank/_terms.md#deviceincidencematrixpair)

A [log growth chart](../../memory-bank/_terms.md#deviceloggrowthchart) (`n=1..19`) closes it out,
with the Fano plane's `n=7` marked as the first nonzero term.

**[Open the visualization →](viz.html)**

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A100001.md).

Source: [oeis.org/A100001](https://oeis.org/A100001)
