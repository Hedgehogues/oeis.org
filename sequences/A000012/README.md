# A000012 — the all 1's sequence

`a(n) = 1` for every `n ≥ 0`. The values are the definition restated; there is nothing in them to
explain.

This entry is deliberately thin. Its picture lives on
[`A000005`'s page](../../memory-bank/visualizations/A000005/viz.html), where this sequence appears as
one of four actors — and it is the most productive of them. Under Dirichlet convolution this row is
the one whose **products are the interesting functions**: convolved with itself it gives the number
of divisors, which is `A000005` itself.

## Approach

`solution.mjs` returns `1`. There is no method to describe and the file says so.

Status: **matches OEIS exactly** for `a(0)..a(33)`, the published `%S` line fetched live 2026-09-02
from `oeis.org/search?q=id:A000012&fmt=text` (offset 0; all terms `1`). Verified by
[`proof.mjs`](proof.mjs), run live in 53 ms: `All checks passed for n = 1..200: the terms equal OEIS
A000012, and the all-1s row produces the divisor count, the divisor sum and the identity function
under Dirichlet convolution, with the Möbius function as its inverse.`

The proof checks four relations, each with its own convolution against a target computed inside
`proof.mjs` from that target's own definition — nothing imported:

| Relation | Target, computed independently |
|---|---|
| `ones ∗ ones = d(n)` | divisor count from prime factorisations ([A000005](https://oeis.org/A000005)) |
| `ones ∗ n = σ(n)` | divisor sum by enumerating divisors ([A000203](https://oeis.org/A000203)) |
| `ones ∗ φ = n` | `φ` by counting coprimes ([A000010](https://oeis.org/A000010)) |
| `ones ∗ μ = ε` | Möbius inversion ([A008683](https://oeis.org/A008683)) |

Each of these is a sum over divisors in which this sequence contributes a factor at every position,
so a single term that were not `1` would break all four loudly. That is a real check, unlike the
near-vacuous one [`A000004`](../A000004) can offer.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000012.md).

## The ideas behind it

None of its own. The interest is the role, drawn once on `A000005`'s page with devices catalogued
there:

| Device | Where this sequence appears in it |
|---|---|
| [`[device::DivisorPairFan]`](../../memory-bank/_terms.md#devicedivisorpairfan) | The worked instance at `n = 12`: every factor pair contributes `1 × 1`, so the fan's six arms sum to `d(12) = 6`. This sequence is what makes the fan count pairs at all. |
| [`[device::NonClosingTable]`](../../memory-bank/_terms.md#devicenonclosingtable) | The `all 1s` row and column, whose diagonal cell is one of the four products that escape the table onto a function no header holds. |
| [`[device::FixedPointOverlay]`](../../memory-bank/_terms.md#devicefixedpointoverlay) | The Möbius-inversion frame: this row combined with `μ`, checked column by column against the identity row. |

[![Divisor pair fan](../../memory-bank/visualizations/A000005/screenshots/divisor-pair-fan.png)](../../memory-bank/visualizations/A000005/viz.html)

## Build & run

```
node sequences/A000012/solution.mjs 34    # print a(0..33)
node sequences/A000012/proof.mjs 200      # check the terms and the four relations
```

## The page these pictures come from

[![The four boring rows](../../memory-bank/visualizations/A000005/screenshots/full.png)](../../memory-bank/visualizations/A000005/viz.html)

`A000005`'s page opens on four sequences whose values are exhausted by their own definitions, then
shows they are the constants of an operation whose products are the interesting functions. This
sequence is the engine of that argument: the escaping cell that produces `d(n)` is this row against
itself, which is exactly why `A000005` is the page's host rather than one of the four.

**[Open it live →](../../memory-bank/visualizations/A000005/viz.html)**

Source: [oeis.org/A000012](https://oeis.org/A000012)
