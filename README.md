# OEIS, visualized

Interactive, self-contained HTML explainers for entries in the
[On-Line Encyclopedia of Integer Sequences](https://oeis.org/) — each one built to answer a single
question with a picture rather than a paragraph: what is this sequence actually counting, and why
does it behave the way it does.

Each sequence lives in its own directory under [`sequences/`](sequences/) (`sequences/A100001`,
`sequences/A000001`, ...) with a single self-contained `viz.html` — open it directly in a browser,
no build step, no dependencies beyond a Google Fonts stylesheet link.

## Sequences

| # | Sequence | Idea |
|---|---|---|
| [A100001](sequences/A100001) | Self-dual `(n_3)` configurations | Fano plane, incidence matrix vs. its transpose |
| [A000001](sequences/A000001) | Number of groups of order n | movements of an object → Cayley table → why the count jumps |

Each sequence's own `README.md` has the write-up — the framing, why it works, and a link to the
picture itself. Where a page went through earlier structurally-different attempts before landing
on its final framing, those are kept in a `drafts/` subdirectory rather than discarded, since the
reasoning for abandoning each attempt is itself part of the record.

## Why these two facts, not a screenshot pipeline

Unlike a build system that renders a picture to a static PNG, every page here is the picture —
open `viz.html` and it's live: hover states, SVG built at load time from the same numbers the page
is explaining, both light and dark themes. That also means correctness lives in the page's own
logic (each one embeds the sequence's terms and, where relevant, a small script that validates its
own group tables — latin square, associativity — before rendering).
