# A000016 — outputs of a complementing shift register

`a(n)` counts the distinct infinite output sequences of a binary `n`-stage shift register whose
feedback is the COMPLEMENT of the last stage: each step shifts every bit left by one position and
feeds in, as the new bit, the opposite of the bit that just shifted out. `a(0)=1, a(1)=1, a(2)=1,
a(3)=2, a(4)=2, a(5)=4, a(6)=6, a(7)=10, …`.

This entry is deliberately thin, but for a different reason than A000011/A000013: it does NOT
borrow [`A000029`'s page](../A000029). The register's transition is a bijection on the `2^n`
possible states, so its trajectory from any start is purely periodic; `a(n)` is the number of
CYCLES of that one transition, not an orbit count under a symmetry group. The numbers happen to sit
very close to A000013's (rotation+complement necklaces) — both track binary strings up to a
complement-linked cyclic structure — but the register's feedback complements only the single
incoming bit each step, not the whole string at once, so the two are genuinely different
constructions that were checked to diverge (`A000013(6)=8`, `A000016(6)=6`) rather than assumed
identical. No established diagram in this catalog fits a general permutation's cycle decomposition
(unlike [`[device::OrbitRing]`](../../memory-bank/_terms.md#deviceorbitring), whose own General
case requires every cycle to come out the SAME length, which is false here), so this entry ships
with its code and verification only, honestly, rather than stretched onto a picture that doesn't
fit.

## Approach

`solution.mjs` simulates the actual register: shift left, feed back the complement of the outgoing
bit, and walk each unvisited state until its whole cycle is marked. No table of published terms is
consulted.

Status: **matches OEIS exactly** for `a(0)..a(19)`, the published `%S`/`%T`/`%U` line fetched live
2026-09-02 from `oeis.org/search?q=id:A000016&fmt=text`. Verified by [`proof.mjs`](proof.mjs), run
live: the transition confirmed to be a genuine bijection (every state has exactly one predecessor,
for `n=1..16`) — which is what makes "purely periodic, no tail" true rather than assumed — the
transition independently re-derived on an array of individual bits (not solution.mjs's integer
bit-tricks) and cross-checked state by state, and agreement with OEIS's published terms.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000016.md).

## Build & run

```
node sequences/A000016/solution.mjs 20    # compute a(0..20) from the definition
node sequences/A000016/proof.mjs 20       # re-check the transition and the resulting counts
```

Source: [oeis.org/A000016](https://oeis.org/A000016)
