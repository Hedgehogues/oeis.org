# A000009 — partitions of n into distinct parts

`a(n)` counts the partitions of `n` that use each part size at most once: `1, 1, 1, 2, 2, 3, 4, 5,
6, 8, …`. Equivalently — and this equivalence is the page's entire subject — it counts partitions
of `n` into ODD parts only.

## Approach

`solution.mjs` computes `a(n)` by the standard 0/1-knapsack recurrence over part sizes `1..n`,
walking amounts downward so each part size is used at most once — DISTINCT parts, read straight
from the definition. Exact `BigInt` arithmetic throughout, since the values outgrow ordinary
floating-point precision by n≈567.

Status: **reproduces OEIS exactly** for `a(0)..a(55)`. Verified live by [`proof.mjs`](proof.mjs)
(2026-09-02) with three independent checks: **Euler's theorem** itself, re-derived by a
structurally different recurrence — an unbounded knapsack over ODD part sizes only, agreeing with
the distinct-parts count for every `n=0..56`; a **bijection witness** at `n=8` — every one of the 6
actual odd-parts partitions transformed by Euler's explicit binary-expansion rule into a
distinct-parts partition, landing on exactly the 6 actual distinct-parts partitions with no
omissions and no collisions; and agreement with OEIS's own `%S`/`%T`/`%U` line fetched live from
`oeis.org/search?q=id:A000009&fmt=text`. The implementation measures `n=5,000` in 179 ms and
`n=10,000` in 650 ms — polynomial, no combinatorial wall.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000009.md).

## The ideas behind it

One device, new to the catalog (full write-up:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

**Partition bijection match** — two enumerations, each written out in full, connected by one arrow
per pair naming the exact rule that sends one to the other — so "these counts are equal" is a
witnessed one-to-one pairing, not a coincidence between two numbers.
[`[device::PartitionBijectionMatch]`](../../memory-bank/_terms.md#devicepartitionbijectionmatch)

[![Partition bijection match](../../memory-bank/visualizations/A000009/screenshots/bijection.png)](../../memory-bank/visualizations/A000009/viz.html)

## Build & run

```
node sequences/A000009/solution.mjs 56    # compute a(0..56) from the definition
node sequences/A000009/proof.mjs 56       # re-check via Euler's theorem and a witnessed bijection
```

## The page these pictures come from

[![Two disguises, one count](../../memory-bank/visualizations/A000009/screenshots/full.png)](../../memory-bank/visualizations/A000009/viz.html)

The page runs Problem (two unrelated-looking restrictions on partitions of 8, "how many of each?")
→ 1 (both full lists written out — 6 and 6) → 2 (the matching rule: group equal odd parts, write
each group's count in binary, expand into powers-of-two multiples) → 3 (the rule applied to all 6
odd-parts partitions, landing exactly on the 6 distinct-parts partitions, arrow by arrow) →
Solution (the count, Euler's theorem named as the `d=2` case of Glaisher's theorem, and a
verified-match badge citing `proof.mjs`'s real run).

**[Open it live →](../../memory-bank/visualizations/A000009/viz.html)** — every partition, every
binary-expansion step and every matching arrow comes from the same functions in the page's own
script, computed at load time, both themes, the same visual system as every other sequence here.

Source: [oeis.org/A000009](https://oeis.org/A000009)
