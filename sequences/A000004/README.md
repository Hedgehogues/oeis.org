# A000004 — the zero sequence

`a(n) = 0` for every `n ≥ 0`. That is the whole definition, and it is also the whole behaviour: there
is no gap between what this sequence is and why it does what it does.

This entry is deliberately thin. Its picture lives on
[`A000005`'s page](../../memory-bank/visualizations/A000005/viz.html), where this sequence appears as
one of four actors — not for its values, but for the role it plays: under Dirichlet convolution it is
the **zero and the absorber**, the row that swallows everything it touches.

## Approach

`solution.mjs` returns `0`. There is nothing else to describe, and the file says so rather than
inflating a constant into a method.

Status: **matches OEIS exactly** for `a(0)..a(33)`, the published `%S` line fetched live
2026-09-02 from `oeis.org/search?q=id:A000004&fmt=text` (offset 0; all terms `0`). Checked by
[`proof.mjs`](proof.mjs), run live: `All checks passed for n = 1..60: the terms equal OEIS A000004,
and the sequence really is the zero and the absorber of Dirichlet convolution.`

**The proof is weak, and this is stated plainly rather than papered over.** When every term is `0`
by definition, a second independent routine can only re-derive a constant, and two constants
agreeing proves nothing. The one check with real teeth is the absorber property: convolving this
sequence with five independently defined arithmetic functions (divisor count by factorisation, `σ`
by divisor sum, `φ` by coprime count, `μ` by squarefree factorisation, and `n` itself — all written
inside `proof.mjs`, none imported) must give back zeros everywhere. A single nonzero term anywhere
would break it loudly. That is the honest ceiling of what can be verified here.

Full requirements and acceptance criteria:
[spec.md](../../memory-bank/specs/tasks/A000004.md).

## The ideas behind it

None of its own. This sequence's own values carry no story, and inventing a picture for them would
have meant drawing a claim that is not there. Its interest is entirely the role it plays inside the
Dirichlet-convolution algebra, which is drawn once, on `A000005`'s page, using devices catalogued
there:

| Device | Where this sequence appears in it |
|---|---|
| [`[device::NonClosingTable]`](../../memory-bank/_terms.md#devicenonclosingtable) | The `zeros` row and column of the 4×4 table — every product along them stays zero, which is what makes the escaping cells elsewhere visible as escapes. |
| [`[device::DivisorPairFan]`](../../memory-bank/_terms.md#devicedivisorpairfan) | The operation whose zero this sequence is, defined by one worked instance. |

[![Non-closing table](../../memory-bank/visualizations/A000005/screenshots/non-closing-table.png)](../../memory-bank/visualizations/A000005/viz.html)

## Build & run

```
node sequences/A000004/solution.mjs 34    # print a(0..33)
node sequences/A000004/proof.mjs 60       # check the terms and the absorber property
```

## The page these pictures come from

[![The four boring rows](../../memory-bank/visualizations/A000005/screenshots/full.png)](../../memory-bank/visualizations/A000005/viz.html)

`A000005`'s page opens on four sequences whose values are exhausted by their own definitions — this
one among them — and spends its length showing that they are the constants of an operation whose
products are the interesting functions. This sequence is the least active of the four: it has no
part in the escaping cells, no inverse, and nothing to rebuild at the close. That is a fair
description of its mathematical role, not a shortcoming of the page.

**[Open it live →](../../memory-bank/visualizations/A000005/viz.html)**

Source: [oeis.org/A000004](https://oeis.org/A000004)
