# OEIS, visualized

Interactive, self-contained HTML explainers for entries in the
[On-Line Encyclopedia of Integer Sequences](https://oeis.org/) — each one built to answer a single
question with a picture rather than a paragraph: what is this sequence actually counting, and why
does it behave the way it does.

The pictures themselves live in the memory bank, at
[`memory-bank/visualizations/A{NNNNNN}/viz.html`](memory-bank/visualizations/) — a single
self-contained page each, opened directly in a browser, no build step, no dependencies beyond a
Google Fonts stylesheet link. A sequence's own directory under [`sequences/`](sequences/) holds no
picture files at all: its write-up, and the two programs described below — one that computes the
sequence, one that checks that computation.

## Sequences

| # | Sequence | Idea |
|---|---|---|
| [A100001](sequences/A100001) | Self-dual `(n_3)` configurations | Fano plane, incidence matrix vs. its transpose |
| [A000001](sequences/A000001) | Number of groups of order n | movements of an object → Cayley table → why the count jumps |

![Points = lines](memory-bank/visualizations/A100001/screenshots/full.png)
![Census of symmetries](memory-bank/visualizations/A000001/screenshots/full.png)

Each sequence's own `README.md` has the write-up — the framing, why it works, and links to its
device(s) — and links to its RFC-style spec (requirements and acceptance criteria), which lives in
[`memory-bank/specs/tasks/`](memory-bank/specs/tasks/). The format that spec must follow is itself
specified: see [`memory-bank/specs/tasks.md`](memory-bank/specs/tasks.md). Shared write-ups that
don't belong to any single sequence — the diagram devices themselves, each with its own picture —
live in [`memory-bank/`](memory-bank/_terms.md). Where a page went through earlier
structurally-different attempts before landing on its final framing, those are kept beside it in
`memory-bank/visualizations/A{NNNNNN}/drafts/` rather than discarded, since the reasoning for
abandoning each attempt is itself part of the record.

## The page is live; the pictures above are a snapshot of it

`viz.html` is the source of truth, not the PNGs — open it and it's live: hover states, SVG built
at load time from the same numbers the page is explaining, both light and dark themes. GitHub
can't preview an `.html` file inline, though, so every
`memory-bank/visualizations/A{NNNNNN}/screenshots/*.png`
(embedded above, in each sequence's own README, and per-device in
[`memory-bank/_terms.md`](memory-bank/_terms.md)) is a real, reproducible snapshot taken FROM the
live page by [`memory-bank/visualizations/capture.mjs`](memory-bank/visualizations/capture.mjs)
(Playwright, light theme, one crop per section) — never a hand-made or separately-drawn picture.
Re-run it after editing a page's markup; a stale screenshot next to a changed page is a bug.

Correctness of what a page CLAIMS lives one level up from the picture itself:
[`memory-bank/verify/`](memory-bank/verify/) independently re-checks anything a page embeds as an
algebraic or numeric fact (group tables — latin square, associativity, identity, self-inverse
count) before that check's real output is cited as evidence in the sequence's own spec.

## Every sequence ships two programs, and they disagree on purpose

A picture that explains a sequence should be accompanied by code that produces it — and by code
that doesn't take the first one's word for it. So each `sequences/A{NNNNNN}/` holds a pair:

| File | Job | May it consult published terms? |
|---|---|---|
| `solution.mjs` | computes `a(n)` by exactly the procedure the page draws | **no** — a lookup table would make it circular |
| `proof.mjs` | re-derives, re-checks and witnesses what the first one returned | **yes** — that is its entire purpose |

`proof.mjs` never reuses the search that produced the answer. Running one routine twice agrees with
itself for free; a second, deliberately slower routine written straight from the definition can
disagree, and that possibility is what makes agreement mean something. Each pair checks four things
at minimum — every returned object really satisfies the definition, no two are the same object
counted twice, nothing is missing (against an independent construction or an independently
published count), and the totals match OEIS. Where the claim is an existence claim — "this
configuration is isomorphic to its own dual" — the proof produces the relabeling and verifies it
entry by entry rather than reporting a yes.

```
$ node sequences/A000001/proof.mjs 8
All checks passed for n = 1..8: sound, distinct, complete, and equal to OEIS A000001.

$ node sequences/A100001/proof.mjs 12
All checks passed for n = 1..12: sound, distinct, complete, witnessed, and equal to OEIS A100001.
```

Both searches are exhaustive, so both hit a wall quickly — A000001 at `n=9`, A100001 past `n=13` —
and each file's header states the measured range instead of hiding it. For A000001 that wall is the
sequence's own subject matter restated as a runtime.

## Repository layout, and what it's copied from

The devices catalog (`memory-bank/_terms.md`), its two meta-specs
(`memory-bank/specs/approaches.md`, `memory-bank/specs/visualizations.md`), the applied per-sequence
specs (`memory-bank/specs/tasks/`), the short auto-loaded rules file
(`.claude/rules/visualization-principles.md`) and the assembly skill
(`.claude/skills/explain-sequence/`) are all adapted from
[Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler)'s own memory bank — same
RFC discipline, same one-way "sequences point at the dictionary, never the reverse" rule, same
insistence that every `Status: done` names a real, re-run check rather than a claim from memory.
The `solution.mjs` / `proof.mjs` split follows that repository's `solution.cpp`-plus-oracle
arrangement, with one change: there the oracle is usually a slow brute force over the same inputs,
while the objects counted here are structures, so the check also has to verify the structure and,
for an existence claim, produce the witness.
What changed, and why, is stated in each adapted file's own header — most substantially,
[`memory-bank/specs/visualizations.md`](memory-bank/specs/visualizations.md)'s Architecture section,
since this catalog's pages are live and interactive rather than built to a static PNG.
