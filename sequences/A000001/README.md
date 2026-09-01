# A000001 — Number of groups of order n

`a(n)` counts the number of non-isomorphic groups of order `n` — 1 for every prime, 1 or 2 for a
product of two primes, an explosion for powers of two (`a(1024) = 49 487 365 422`), and a jump
from `a(31)=1` to `a(32)=51` with nothing in between hinting why.

## The idea behind it

The final version reframes the whole sequence without group-theory vocabulary: `a(n)` is the
number of distinct **symmetry types** of an object with exactly `n` self-matching movements
(rotations and flips). Six catalogued devices carry the argument (full write-ups:
[`memory-bank/_terms.md`](../../memory-bank/_terms.md)):

- **[Marked asymmetry](../../memory-bank/_terms.md#devicemarkedasymmetry)** — a rectangle, ellipse,
  "H" and pinwheel each carry a small off-axis mark, so applying a movement to a symmetric shape
  becomes visible instead of looking unchanged.
- **[Cayley table](../../memory-bank/_terms.md#devicecayleytable)** — the object's own 4 movements
  laid out as a row×column grid, one worked example shown before the full grid, headers visually
  distinct from results.
- **[Self-cancel diagonal](../../memory-bank/_terms.md#deviceselfcanceldiagonal)** +
  **[merged result strip](../../memory-bank/_terms.md#devicemergedresultstrip)** — which of a
  shape's movements undo themselves in one repeat, highlighted directly in the table rather than
  asserted as a bare count.
- **[State map](../../memory-bank/_terms.md#devicestatemap)** — the same object's states on a
  ring, contrasting a movement that cycles all the way around against one that folds back in
  pairs.
- **[Divisor chips](../../memory-bank/_terms.md#devicedivisorchips)** — a number's divisors as a
  row of chips, the two trivial ones muted, so "how many extra building blocks" is a count you see,
  not one you're told.

It opens with the object itself before ever showing the sequence, works through *why* the count
for `n=6` is 2 (which cycle lengths are even possible, how they combine, why one combination
repeats), and generalizes to *why* it jumps around for any `n` (more divisors → more building
blocks → more combinations; primes have none to spare).

The catalog at the end draws every symmetry type for `n=1..15` as an actual shape (rectangle,
triangle, tetrahedron, ...), switches to a
**[log growth chart](../../memory-bank/_terms.md#deviceloggrowthchart)** of counted tiles for
`n=16..30`, and closes with an
**[unrealized placeholder](../../memory-bank/_terms.md#deviceunrealizedplaceholder)** for the one
order-8 type with no realizable object at all — paired with a panel naming exactly what the table
demands versus what an actual rotation in space can deliver, not just an unexplained gap. A closing
map ties the four sub-questions' answers together using
**[mini-recap](../../memory-bank/_terms.md#deviceminirecap)** thumbnails of each earlier picture.

**[Open the visualization →](viz.html)**

Full requirements and acceptance criteria (including the independent group-table verification):
[spec.md](../../memory-bank/specs/tasks/A000001.md).

### Drafts

This page went through two structurally different earlier versions before landing on the
movement/symmetry framing above — kept here rather than discarded, since each answers a slightly
different question and the reasoning for abandoning each is itself informative:

- [`drafts/v1-heatmap.html`](drafts/v1-heatmap.html) — a straight infographic: a heatmap of
  `a(n)` for `n=1..64`, the 5 groups of order 8 as labeled icons, primes-vs-powers-of-2 growth
  bars. Correct, but purely descriptive — it shows *what* the sequence does, not *why*.
- [`drafts/v2-symmetry-catalog.html`](drafts/v2-symmetry-catalog.html) — a first attempt at
  proof intuition: Lagrange's theorem for the prime case, Sylow theory (gear diagrams) for
  `n=p·q`, an honest "no short proof" panel for prime powers. Sound, but leans on named theorems
  and notation the reader has to already trust — superseded by `viz.html`'s version, which derives
  the same facts (divisors ⇒ possible cycle lengths ⇒ combinations) from a single picture-native
  rule instead.

Source: [oeis.org/A000001](https://oeis.org/A000001)
