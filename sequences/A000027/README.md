# A000027 — the positive integers

`a(n) = n`. The most transparent definition in the encyclopedia, and also the sequence more OEIS
entries cross-reference than any other — because "the index itself" is what other definitions get
written against.

This entry is deliberately thin. Its picture lives on
[`A000005`'s page](../../memory-bank/visualizations/A000005/viz.html), where this sequence appears as
one of four actors, and it is the busiest of them: it produces `σ(n)` and `φ(n)` under Dirichlet
convolution, and the page's closing frame **rebuilds it** out of the others.

## Approach

`solution.mjs` returns `n`. There is no procedure underneath and the file says so.

Status: **matches OEIS exactly** for `a(1)..a(26)`, the published `%S` line fetched live 2026-09-02
from `oeis.org/search?q=id:A000027&fmt=text` (offset 1). Verified by [`proof.mjs`](proof.mjs), run
live in 54 ms: `All checks passed for n = 1..200: the terms equal OEIS A000027, the sequence
produces sigma and phi under Dirichlet convolution, and it is rebuilt exactly by the totients of its
own divisors — including the fraction-bucket argument the page draws.`

The proof checks three relations plus the argument behind the third, each against a target computed
inside `proof.mjs` from that target's own definition:

| Relation | Target, computed independently |
|---|---|
| `n ∗ ones = σ(n)` | divisor sum by enumerating divisors ([A000203](https://oeis.org/A000203)) |
| `n ∗ μ = φ(n)` | `φ` by counting coprimes ([A000010](https://oeis.org/A000010)) |
| `φ ∗ ones = n` | this sequence, rebuilt from the others |

The last one gets a second, sharper check. `A000005`'s page argues it by a picture — the `n`
fractions `k/n`, reduced to lowest terms, sorted into buckets by denominator — so `proof.mjs`
verifies **that argument** and not merely its conclusion: for every `n`, the bucket for each divisor
`d` must hold exactly `φ(d)` fractions, and the buckets together must account for all `n` of them.
A correct total reached by wrong buckets would fail here.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000027.md).

## The ideas behind it

None of its own. The interest is the role, drawn once on `A000005`'s page with devices catalogued
there:

| Device | Where this sequence appears in it |
|---|---|
| [`[device::NonClosingTable]`](../../memory-bank/_terms.md#devicenonclosingtable) | The `1, 2, 3, …` row and column, source of two of the four cells that escape the table — onto `σ(n)` and onto `n·d(n)`. |
| [`[device::DivisorChips]`](../../memory-bank/_terms.md#devicedivisorchips) | The closing frame's buckets, labelled by the divisors of `n`. |
| [`[device::MiniRecap]`](../../memory-bank/_terms.md#deviceminirecap) | The close, where this row returns redrawn small — rebuilt rather than restated. |

[![Non-closing table](../../memory-bank/visualizations/A000005/screenshots/non-closing-table.png)](../../memory-bank/visualizations/A000005/viz.html)

## Build & run

```
node sequences/A000027/solution.mjs 26    # print a(1..26)
node sequences/A000027/proof.mjs 200      # check the terms, three relations, and the bucket argument
```

## The page these pictures come from

[![The four boring rows](../../memory-bank/visualizations/A000005/screenshots/full.png)](../../memory-bank/visualizations/A000005/viz.html)

`A000005`'s page opens on four sequences whose values are exhausted by their own definitions and
closes by reconstructing this one from the others — the twelve fractions `k/12` bucketing by
denominator into groups of sizes `φ(d)` that sum back to 12. A row that looked like the least
interesting thing on the page turns out to be what the argument produces.

**[Open it live →](../../memory-bank/visualizations/A000005/viz.html)**

Source: [oeis.org/A000027](https://oeis.org/A000027)
