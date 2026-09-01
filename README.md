# OEIS, visualized

Interactive, self-contained HTML explainers for entries in the
[On-Line Encyclopedia of Integer Sequences](https://oeis.org/) — each one built to answer a single
question with a picture rather than a paragraph: what is this sequence actually counting, and why
does it behave the way it does.

Each sequence lives in its own directory under [`sequences/`](sequences/) (`sequences/A100001`,
`sequences/A000001`, ...) with a `solution.mjs` that computes the sequence from its definition and
a `proof.mjs` that re-checks that output independently. The pictures live in the memory bank, at
[`memory-bank/visualizations/A{NNNNNN}/viz.html`](memory-bank/visualizations/) — one self-contained
page each, opened directly in a browser, no build step.

## Build & run

```
node sequences/A{NNNNNN}/solution.mjs [maxN]    # compute the sequence
node sequences/A{NNNNNN}/proof.mjs [maxN]       # re-check what it computed
node memory-bank/visualizations/capture.mjs     # re-capture every screenshot from the live pages
node memory-bank/verify/all.mjs                 # run every check in the repository
```

`verify/all.mjs` is what a spec's `Status: done` is allowed to cite. Each check under
[`memory-bank/verify/`](memory-bank/verify/) exists because the thing it checks was once wrong in a
way nothing noticed — a catalog record describing a widget a redesign had deleted, a page whose
only line of notation a "remove the prose" pass had taken, a QR readable in its source file and
unreadable in the snapshot that actually travels. Every one of them was tested by reintroducing
that exact fault and confirming it fails.

## Sequences

| # | Sequence | Status |
|---|---|---|
| [A100001](sequences/A100001) | Self-dual `(n_3)` configurations | Matches OEIS for `n = 1..13`, witnessed |
| [A000001](sequences/A000001) | Number of groups of order n | Matches OEIS for `n = 1..8`, verified |
| [A000002](sequences/A000002) | Kolakoski sequence | Matches OEIS for `n = 1..107`, self-consistent through `n = 1,000,000` |
| [A000003](sequences/A000003) | Class number of discriminant -4n | Matches OEIS for `n = 1..99`, independently re-derived through `n = 500` |
| [A000005](sequences/A000005) | Number of divisors of n | Matches OEIS for `n = 1..103`, algebra re-checked through `n = 2000` |
| [A000004](sequences/A000004) | The zero sequence | Matches OEIS for `n = 0..33`; thin entry, borrows A000005's page |
| [A000007](sequences/A000007) | Characteristic function of {0} | Matches OEIS for `n = 0..33`; identity property checked to `n = 60`, thin entry |
| [A000012](sequences/A000012) | The all 1's sequence | Matches OEIS for `n = 0..33`; four convolution relations checked to `n = 200`, thin entry |

[![Points = lines](memory-bank/visualizations/A100001/screenshots/full.png)](memory-bank/visualizations/A100001/viz.html)
[![Census of symmetries](memory-bank/visualizations/A000001/screenshots/full.png)](memory-bank/visualizations/A000001/viz.html)
[![The self-describing sequence](memory-bank/visualizations/A000002/screenshots/full.png)](memory-bank/visualizations/A000002/viz.html)
[![Where the classes land](memory-bank/visualizations/A000003/screenshots/full.png)](memory-bank/visualizations/A000003/viz.html)
[![The four boring rows](memory-bank/visualizations/A000005/screenshots/full.png)](memory-bank/visualizations/A000005/viz.html)

Each sequence's own directory README has the write-up — the approach, why it works, and the
pictures of the ideas it uses — and links to its RFC-style spec (requirements and acceptance
criteria), which lives in [`memory-bank/specs/tasks/`](memory-bank/specs/tasks/). The format that
spec must follow is itself specified: see [`memory-bank/specs/tasks.md`](memory-bank/specs/tasks.md).
Shared write-ups that don't belong to any single sequence — the diagram devices themselves, each
with its own picture — live in [`memory-bank/`](memory-bank/_terms.md).

## Two programs per sequence, and they disagree on purpose

A picture that explains a sequence should be accompanied by code that produces it — and by code
that doesn't take the first one's word for it:

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

Both searches are exhaustive, so both hit a wall quickly — A000001 at `n=9`, A100001 past `n=13` —
and each file's header states the measured range instead of hiding it. For A000001 that wall is the
sequence's own subject matter restated as a runtime. A000002, A000003 and A000005 are not
combinatorial searches at all — A000002's construction is linear (ten million terms in under a
tenth of a second), A000003's and A000005's are `O(√n)` per term — so their headers state the
honest opposite: no wall found, the practical limit is memory or the size of the search net, not
time.

## The page is live; the pictures above are a snapshot of it

`viz.html` is the source of truth, not the PNGs — open it and it's live: hover states, SVG built
at load time from the same numbers the page is explaining, both light and dark themes. GitHub
can't preview an `.html` file inline, though, so every
`memory-bank/visualizations/A{NNNNNN}/screenshots/*.png` (embedded above, in each sequence's own
README, and per-device in [`memory-bank/_terms.md`](memory-bank/_terms.md)) is a real, reproducible
snapshot taken FROM the live page by
[`memory-bank/visualizations/capture.mjs`](memory-bank/visualizations/capture.mjs) (Playwright,
dark theme, one crop per device) — never a hand-made or separately-drawn picture. Re-run it after
editing a page's markup; a stale screenshot next to a changed page is a bug.

Correctness of what a page CLAIMS lives one level up from the picture itself:
[`memory-bank/verify/`](memory-bank/verify/) independently re-checks anything a page embeds as an
algebraic or numeric fact (group tables — latin square, associativity, identity, self-inverse
count) before that check's real output is cited as evidence in the sequence's own spec.

## Repository layout, and what it's copied from

The devices catalog (`memory-bank/_terms.md`), its two meta-specs
(`memory-bank/specs/approaches.md`, `memory-bank/specs/visualizations.md`), the applied per-sequence
specs (`memory-bank/specs/tasks/`), the short auto-loaded rules file
(`.claude/rules/visualization-principles.md`) and the two skills
(`.claude/skills/explain-sequence/`, `.claude/skills/document-sequence/`) are all adapted from
[Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler)'s own memory bank — same
RFC discipline, same one-way "sequences point at the dictionary, never the reverse" rule, same
insistence that every `Status: done` names a real, re-run check rather than a claim from memory,
same directory split (all visual artifacts in the memory bank, a task's own folder holding only its
write-up and its code).

What was compared against what, when, and where it deliberately differs is recorded file by file
in [`memory-bank/upstream.md`](memory-bank/upstream.md), together with the command to redo the
comparison — because "adapted from" was asserted here for a while before anyone actually diffed the
two trees, and two of the files this README cited by name turned out not to exist upstream.

Two things differ, both stated in the adapted files' own headers. Pages here are live and
interactive rather than built to a static PNG, so there is no shared shell and no `build.sh` — see
[`memory-bank/specs/visualizations.md`](memory-bank/specs/visualizations.md)'s Architecture section.
And the independent cross-check is committed as a file rather than described in a Status line:
project-euler records what was checked, this repo also ships `proof.mjs` so anyone can re-run it.
