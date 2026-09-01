# A000007 — the characteristic function of {0}

`a(n) = 0^n`: a single `1` at `n = 0`, then zeros forever. As with the other constant rows, the
values are the definition restated and there is nothing in them to explain.

This entry is deliberately thin. Its picture lives on
[`A000005`'s page](../../memory-bank/visualizations/A000005/viz.html), where this sequence appears as
one of four actors, and for a reason with real content: re-indexed to start at `n = 1`, it is the
**identity element** of Dirichlet convolution — the row that leaves every partner unchanged.

## Approach

`solution.mjs` returns `0^n`. It also exports that same pattern re-indexed from `n = 1`, as a
separate function, so the offset shift is visible in the code rather than assumed: the sequence is
published at offset 0 (`a(0) = 1`), while the identity element of the algebra is the same pattern
read from `n = 1`. The encyclopedia's own note on this entry states the same thing — *"Changing the
offset to 1 gives the arithmetical function a(1)=1, a(n)=0 for n>1, the identity function for
Dirichlet multiplication."*

Status: **matches OEIS exactly** for `a(0)..a(33)`, the published `%S` line fetched live 2026-09-02
from `oeis.org/search?q=id:A000007&fmt=text` (offset 0; `1` followed by zeros). Verified by
[`proof.mjs`](proof.mjs), run live: `All checks passed for n = 1..60: the terms equal OEIS A000007,
and the sequence re-indexed from n = 1 is the identity of Dirichlet convolution — uniquely so among
the patterns tried.`

Unlike [`A000004`](../A000004), this sequence's proof has real substance. The identity check
convolves it against six functions defined inside `proof.mjs` from their own definitions — divisor
count by factorisation, `σ` by divisor sum, `φ` by coprime count, `μ` by squarefree factorisation,
`n` itself, and one deliberately irregular function with no arithmetic meaning at all, included so
that agreement cannot come from shared structure. A single wrong term at position `k` would break
the identity for any partner nonzero below `k`. A third check tries five competing `0/1` patterns
and requires every one of them to **fail**, so that being an identity is a property that picks this
sequence out rather than one many patterns happen to satisfy.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000007.md).

## The ideas behind it

None of its own. The interest is the role, and the role is drawn once, on `A000005`'s page, using
devices catalogued there:

| Device | Where this sequence appears in it |
|---|---|
| [`[device::NonClosingTable]`](../../memory-bank/_terms.md#devicenonclosingtable) | The identity row of the 4×4 table: every product along it returns its partner unchanged, which is what makes the four escaping cells elsewhere legible as escapes. |
| [`[device::FixedPointOverlay]`](../../memory-bank/_terms.md#devicefixedpointoverlay) | The Möbius-inversion frame, where the all-ones row convolved with `μ` is checked column by column against **this** sequence — it is the target the inversion has to land on. |

[![Möbius inversion](../../memory-bank/visualizations/A000005/screenshots/inverse-overlay.png)](../../memory-bank/visualizations/A000005/viz.html)

## Build & run

```
node sequences/A000007/solution.mjs 34    # print a(0..33) at the published offset
node sequences/A000007/proof.mjs 60       # check the terms, the identity property, and its uniqueness
```

## The page these pictures come from

[![The four boring rows](../../memory-bank/visualizations/A000005/screenshots/full.png)](../../memory-bank/visualizations/A000005/viz.html)

`A000005`'s page opens on four sequences whose values are exhausted by their own definitions and
spends its length showing they are the constants of an operation whose products are the interesting
functions. This sequence is the most load-bearing of the four: it is what the table's identity row
demonstrates, and it is the target the Möbius-inversion frame has to reach. The page marks its
offset shift explicitly rather than quietly re-indexing it.

**[Open it live →](../../memory-bank/visualizations/A000005/viz.html)**

Source: [oeis.org/A000007](https://oeis.org/A000007)
