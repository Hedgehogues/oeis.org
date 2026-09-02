# A000029 — bracelets: necklaces with turning over allowed

`a(n)` counts binary necklaces of `n` beads up to rotation AND reflection — also called
"bracelets." Two bead-strings count as the same bracelet exactly when rotating and/or flipping one
end-to-end reaches the other; `a(0)=1, a(1)=2, a(2)=3, a(3)=4, a(4)=6, a(5)=8, a(6)=13, …`.

## Approach

`solution.mjs` computes `a(n)` by direct orbit enumeration: every binary string of length `n` is a
point in `{0,1}^n`; flood-fill each unvisited string's whole orbit under rotation and reflection,
and count one orbit per fill. No table of published terms is consulted.

Status: **reproduces OEIS exactly** for `a(0)..a(19)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02): every returned orbit checked closed under both moves and partitioning the full state
space (soundness); the count independently re-derived by **Burnside's lemma** — each of the
dihedral group's `2n` elements gets its own explicit permutation, its fixed-string count computed
from that permutation's cycle decomposition (`2^cycles`), and the average across all `2n` elements
matches the direct search exactly for every `n=0..19`; and agreement with OEIS's own `%S`/`%T`/`%U`
line fetched live from `oeis.org/search?q=id:A000029&fmt=text`. Measured: `n=20` in 45 ms, `n=24`
in 679 ms, `n=27` in 8.5 s (2,493,726 orbits) — exponential in `n` (the same shape as A000001's and
A100001's walls), not a polynomial count; `n=28` needs a 256 MB visited array and was not run.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000029.md).

## The ideas behind it

One device new to the catalog (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Burnside fixed-point table** — every element of the group acting on bead-strings, laid out as a
chip with its own fixed-string count printed beside it; the plain arithmetic mean of those printed
numbers equals the bracelet count, turning "how many bracelets" from a search result into a
checkable average. [`[device::BurnsideFixedPointTable]`](../../memory-bank/_terms.md#deviceburnsidefixedpointtable)

[![Burnside fixed-point table](../../memory-bank/visualizations/A000029/screenshots/burnside-table.png)](../../memory-bank/visualizations/A000029/viz.html)

The Solution section also reuses
[`[device::MergedResultStrip]`](../../memory-bank/_terms.md#devicemergedresultstrip): the Problem's
4 example strings, 3 of which share one orbit, merge into one gapless block while the 4th stays
separate — the device's own "provably identical results fuse into one shape" rule, applied here to
orbit membership rather than a repeated numeric result.

## Build & run

```
node sequences/A000029/solution.mjs 20    # compute a(0..20) from the definition
node sequences/A000029/proof.mjs 20       # re-check that output via Burnside's lemma
```

## The page these pictures come from

[![Average, don't search](../../memory-bank/visualizations/A000029/screenshots/full.png)](../../memory-bank/visualizations/A000029/viz.html)

The page runs Problem (4 six-bead strings, "how many bracelets, really?") → 1 (one string rotated,
then flipped — same bracelet both times) → 2 (Burnside's lemma: all 12 group elements for `n=6`,
their fixed counts, averaging to 13) → Solution (the Problem's 4 strings collapse to 2 bracelets —
3 merged, 1 apart — beside the count and a verified-match badge citing `proof.mjs`'s real run).

**[Open it live →](../../memory-bank/visualizations/A000029/viz.html)** — every chip, every
fixed-point count, every merge decision comes from the same functions in the page's own script,
computed at load time, both themes, the same visual system as every other sequence here.

This page also anchors three sibling sequences that count orbits under a DIFFERENT group on the
same `{0,1}^n` — same device, same technique, different generators: **A000011** (rotation +
reflection + complement), **A000013** (rotation + complement, no reflection), and **A000016** (its
own distinct shift-register construction, verified on its own honest terms).

Source: [oeis.org/A000029](https://oeis.org/A000029)
