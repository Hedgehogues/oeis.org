# A000001 — Number of groups of order n

`a(n)` counts the number of non-isomorphic groups of order `n` — 1 for every prime, 1 or 2 for a
product of two primes, an explosion for powers of two (`a(1024) = 49 487 365 422`), and a jump
from `a(31)=1` to `a(32)=51` with nothing in between hinting why.

## The idea behind it

The final version reframes the whole sequence without group-theory vocabulary: `a(n)` is the
number of distinct **symmetry types** of an object with exactly `n` self-matching movements
(rotations and flips). It opens with the object itself — a marked rectangle, its 4 movements laid
out as a Cayley table — before ever showing the sequence, then works through *why* the count for
`n=6` is 2 (which cycle lengths are even possible, how they combine, why one combination repeats)
and generalizes to *why* it jumps around for any `n` (more divisors → more building blocks → more
combinations; primes have none to spare).

The catalog at the end draws every symmetry type for `n=1..15` as an actual shape (rectangle,
triangle, tetrahedron, ...) and switches to counted tiles for `n=16..30`, closing with a note on
why a *5th* type at `n=8` has no realizable object at all (the table is internally consistent, but
no physical rotation matches what it demands).

**[Open the visualization →](viz.html)**

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
