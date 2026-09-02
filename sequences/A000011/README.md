# A000011 — necklaces where complements are equivalent

`a(n)` counts binary necklaces of `n` beads up to rotation, reflection, AND colour-complement — the
largest of this catalog's three necklace/bracelet groups. Two strings are the same necklace here
exactly when one reaches the other by rotating, flipping end-to-end, and/or swapping every bead's
colour; `a(0)=1, a(1)=1, a(2)=2, a(3)=2, a(4)=4, a(5)=4, a(6)=8, a(7)=9, …`.

This entry is deliberately thin. The mechanism — Burnside's lemma, averaging fixed-string counts
over a symmetry group — lives on [`A000029`'s page](../A000029), drawn there for the plain
rotation+reflection group. Here the SAME technique applies to a LARGER group (4n elements instead
of 2n), not a different idea.

## Approach

`solution.mjs` flood-fills every string's orbit under rotation, reflection, AND complement — the
same method A000029 uses, with complement added as a third generator. No table of published terms
is consulted.

Status: **matches OEIS exactly** for `a(0)..a(19)`, the published `%S`/`%T`/`%U` line fetched live
2026-09-02 from `oeis.org/search?q=id:A000011&fmt=text`. Verified by [`proof.mjs`](proof.mjs), run
live: every orbit independently checked closed under all three moves and partitioning the full
state space, the count re-derived by Burnside's lemma over the full 4n-element group — where a
complemented group element's fixed-string count is `2^cycles` ONLY if every cycle of its underlying
permutation has even length, `0` otherwise (an odd cycle would need a bit equal to its own
complement after one full trip around) — agreeing with the direct search for every `n=0..19`.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000011.md).

## The ideas behind it

None of its own — the explanation is
[`[device::BurnsideFixedPointTable]`](../../memory-bank/_terms.md#deviceburnsidefixedpointtable),
drawn on A000029's page for the plain dihedral group; the same averaging argument applies here with
"and complement" added to every group element, doubling the group's size from `2n` to `4n`.

[![Burnside fixed-point table](../../memory-bank/visualizations/A000029/screenshots/burnside-table.png)](../../memory-bank/visualizations/A000029/viz.html)

## Build & run

```
node sequences/A000011/solution.mjs 19    # compute a(0..19) from the definition
node sequences/A000011/proof.mjs 19       # re-check that output via Burnside's lemma
```

## The page these pictures come from

[![Average, don't search](../../memory-bank/visualizations/A000029/screenshots/full.png)](../../memory-bank/visualizations/A000029/viz.html)

`A000029`'s page walks through Burnside's lemma for the rotation+reflection group; the same
averaging argument, over the larger rotation+reflection+complement group, gives this sequence.

**[Open it live →](../../memory-bank/visualizations/A000029/viz.html)**

Source: [oeis.org/A000011](https://oeis.org/A000011)
