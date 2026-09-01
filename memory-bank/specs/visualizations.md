---
status: draft
app: oeis
tags: [oeis, visualization, catalog, explanation, draft]
---

# Explanation device: requirements on the PICTURE

## Layer

This layer sits **above the ideas** and depends on them one-way:

```
sequences (sequences/A{NNNNNN}/README.md)  →  pictures (this spec)  →  ideas (specs/approaches.md)
```

This spec may — and does — reference [approaches](approaches.md); that spec references nothing
here, and must stay readable with this one closed. Because this is the dependent layer, every rule
about the RELATIONSHIP between an idea and its picture lives here, not there.

## Vision
Someone with no preparation looks at a page and, without reading a paragraph, understands what's
being counted and why the count behaves the way it does: an opening frame shows the unsolved
question, a chain of frames each answer one sub-question and hand its result to the next, and a
closing frame shows the count fully explained. The requirements below come from rebuilding
`sequences/A000001/viz.html` roughly twenty times against direct, live feedback in one sitting
(2026-09-01) — the short form is `.claude/rules/visualization-principles.md`; this file adds
acceptance criteria and status.

## Terms
MUST/MUST NOT/SHALL/SHOULD/SHOULD NOT/MAY as in RFC 2119. Domain terms live in `_terms.md`,
context `device` — see [approaches](approaches.md)'s Terms section for the full list.

## Scope
**In scope:** the layout of `sequences/A{NNNNNN}/`; the picture fields of `[device::*]` records
(`Picture` / `Reading order` / `Example` and the picture half of `Limits`); frame/section
structure of a sequence page; the `explain-sequence` skill; every rule about how a picture relates
to its idea; the algebraic/numeric self-check a page performs on itself before anything is shown.

**Out of scope:** the idea fields themselves — see [approaches](approaches.md); the sequences
themselves, which live in `sequences/A{NNNNNN}/README.md`.

## Findings this is built on
- **F1** (`visualization-principles.md` #1) A row of marked rectangles had no stated convention for
  what the corner dot meant — unreadable until the convention was named once, explicitly, before
  reuse. Traces to: MUST-convention-defined-once.
- **F2** (`visualization-principles.md` #2) A rectangle, an oval, an "H" and a pinwheel shared one
  visual template ("X · 4 different") though only three of the four share a table — the uniform
  template implied a false sameness the pinwheel didn't have. Traces to: MUST-grouping-matches-fact.
- **F3** (`visualization-principles.md` #3) A Cayley-table grid rendered header cells and body
  cells in one identical style, with no worked example of how to read row+column→cell. Traces to:
  MUST-header-distinct, MUST-worked-example-first.
- **F4** (`visualization-principles.md` #4) Four tiles holding an identical result stayed visually
  separate, reading as an unexplained inconsistency rather than the intended finding (every one of
  a shape's flips undoes itself). Traces to: MUST-merge-identical-results.
- **F5** (`visualization-principles.md` #5) A bare, unlabeled arrow between two states carried no
  stated meaning. Traces to: MUST-arrows-labeled.
- **F6** (`visualization-principles.md` #6) Enlarging an icon's outer box twice running did not fix
  legibility, because the actual distinguishing mark inside it stayed a few low-contrast pixels
  across. Traces to: MUST-feature-scale-checked.
- **F7** (`visualization-principles.md` #7) A rejected attempt and an unrelated comparison object
  sat side by side with only a caption between them, read as connected regardless of the caption's
  wording. Traces to: MUST-bounded-groups.
- **F8** (`visualization-principles.md` #8) A bare count badge ("on the diagonal: 2") asked the
  viewer to trust a number with nothing highlighted nearby to verify it against. Traces to:
  MUST-count-shows-source.
- **F9** (`visualization-principles.md` #9) A pass to remove all narrating captions also deleted
  the one sentence defining the corner-marker convention — the very next question was "what do
  these shapes mean", exactly the failure F1 exists to prevent. Traces to:
  MUST-definitions-survive-trims.
- **F10** (`visualization-principles.md` #10) An early growth chart used a linear scale and
  rendered values under 20 as invisible slivers beside a value in the hundreds. Traces to:
  MUST-log-scale-prints-value.
- **F11** (`visualization-principles.md` #11) A100001's incidence matrix and its transpose were
  deliberately NOT relabeled to look identical, since the true claim is "a relabeling exists", a
  weaker and different fact than "these two grids already match". Traces to:
  MUST-duality-not-forced.
- **F12** (`visualization-principles.md` #12) A single dense infographic tried to define the
  object, prove the mechanism and show the final count at once and was unreadable cold; rebuilt as
  an explicit Problem → 1 → 2 → 3 → 4 → Solution chain, each answer feeding the next. Traces to:
  MUST-decomposed-chain, MUST-chain-reuses-prior-frames.
- **F13** (2026-09-01, this catalog's own construction) Unlike project-euler, this catalog has no
  static-PNG build step: every page here is meant to be opened directly and interacted with
  (hover states on `sequences/A100001/viz.html`'s Fano-plane points; live-computed group tables in
  `sequences/A000001/viz.html`) — a build-to-PNG pipeline would throw away exactly the property
  that makes these pages worth opening rather than screenshotting. Deliberate style difference, not
  an omission. Traces to: the Architecture section below.
- **F14** (2026-09-01) A page that embeds a claimed algebraic fact (a Cayley table's diagonal count,
  a group's associativity) can silently ship a wrong number if that fact is only checked by eye
  while authoring. `memory-bank/verify/group-tables.mjs` independently recomputes every group table
  actually embedded in `sequences/A000001/`'s pages (latin square, associativity, identity,
  self-inverse count) and was run live before this requirement was written: all 7 tables checked
  clean, including the 2 tables in the live page and the 5 in the kept draft. Traces to:
  MUST-embedded-math-verified.

## Architecture

### Overview (prose)
A sequence's page (`sequences/A{NNNNNN}/viz.html`) is a single self-contained HTML file: no build
step, no external script beyond a Google Fonts stylesheet link, opened directly in a browser. This
is the deliberate style difference from project-euler's shared shell + `build.sh` → static PNG
pipeline (F13): the devices this catalog favors (hover interactivity, group tables computed live
from a small multiplication function rather than baked into a bitmap) only make sense rendered
live. A page assembles one or more `[device::*]` records — see each device's own `Picture:` field
for which page(s) render it — into an explicit Problem → sub-question chain → Solution structure
(F12), described in the page's own sections, not in a separate machine-readable frame list the way
project-euler's `examples/<slug>.html` is.

Where a page embeds a checkable mathematical claim (a group table's associativity, a sequence's own
early terms), the SAME computation is independently re-implemented and run in
`memory-bank/verify/*.mjs`, committed and re-runnable — this catalog's analogue of project-euler's
`oracle.cpp`/`xcheck.cpp` scripts, adapted to a claim being checked by a script rather than a
competitive-programming submission being checked against a judge.

### Bounded Context and Aggregate Root
- `device` — the only context, matching [approaches](approaches.md). There is no separate context
  for pages or for the verification scripts: a page is where a device's `Picture:` field says it
  lives, and a verify script is referenced from the sequence's own task spec
  (`specs/tasks/A{NNNNNN}.md`), not recorded as an entity of its own here.

## Requirements
> Statement — acceptance criterion — status.

### MUST — the picture itself
- Any visual convention a device introduces (a marker's meaning, a highlight color's meaning) MUST
  be stated once, explicitly, before or at its first use — **MUST-convention-defined-once** —
  criterion: the page's markup/prose contains exactly one definition of the convention, not one
  per repeated use. Status: done (F1; see `[device::MarkedAsymmetry]`'s Limits).
- Items sharing one visual template (a border color, a caption format) MUST actually share the fact
  that template implies — **MUST-grouping-matches-fact** — criterion: before any group of items is
  given identical styling, the claim the styling makes ("these are the same kind of thing") is
  checked true for every member; a member that doesn't hold gets pulled into its own comparison
  instead. Status: done (F2; the pinwheel comparison in `sequences/A000001/viz.html` section 1a).
- A [device::CayleyTable](../_terms.md#devicecayleytable)'s header row/column MUST carry a visually
  distinct background from body cells, and its first appearance on a page MUST be preceded by one
  worked example — **MUST-header-distinct**, **MUST-worked-example-first** — criterion: the CSS
  class used for header cells differs from the body-cell class; a one-cell worked example precedes
  the first full grid in reading order. Status: done (F3; `.cy-head` vs. plain `.cy-cell`, and the
  `demo` block before `sequences/A000001/viz.html`'s first table).
- A row of results that are provably identical across every position MUST render as one merged,
  gapless shape rather than separate tiles — **MUST-merge-identical-results** — criterion: equality
  of every value in the row is checked before rendering; if true, inter-tile gaps and inner
  border-radii are removed. Status: done (F4; see
  [device::MergedResultStrip](../_terms.md#devicemergedresultstrip)).
- Every connecting arrow between two drawn states MUST carry a one-token label naming the operation
  it performs — **MUST-arrows-labeled** — criterion: no bare, unlabeled arrow connects two distinct
  drawn states anywhere on a page. Status: done (F5; the `⟲⟲` "repeat twice" label on every such
  arrow in `sequences/A000001/viz.html`).
- Where a small mark carries the meaning being compared between icons, its own size and contrast
  (not merely the icon's outer size) MUST be checked for legibility at the rendered scale —
  **MUST-feature-scale-checked** — criterion: the mark's rendered diameter and its color contrast
  against the shape's own fill are both verified, independent of the icon's bounding-box size.
  Status: done (F6; `sequences/A000001/viz.html`'s marker went from a plain small dot to a larger
  white dot with a dark contrasting outline).
- Two adjacent items answering unrelated sub-questions MUST be enclosed in visually distinct
  bordered groups, not left separated only by a caption — **MUST-bounded-groups** — criterion: a
  rejected attempt and an unrelated example object never share an unbordered region on the same
  page. Status: done (F7; the `.grp`/`.grp.bad`/`.grp.other` bordered blocks in section 1a).
- A count claimed about a table or grid MUST have its source cells highlighted in that same
  table/grid, not only stated as a number nearby — **MUST-count-shows-source** — criterion: every
  count badge has a corresponding highlighted-cell class applied to the cells it counts, in the
  same rendered table. Status: done (F8; `.cy-self` highlighting under every diagonal-count badge).
- A caption defining a visual convention (as opposed to narrating a conclusion the picture already
  shows) MUST survive a text-reduction pass — **MUST-definitions-survive-trims** — criterion:
  before deleting any caption for brevity, it is classified as narration (safe to cut) or
  definition (kept, as one short line). Status: done (F9, after being violated once and caught by
  the very next question).
- A chart using a nonlinear (typically log) scale for size/height MUST print each bar or tile's
  literal value as text — **MUST-log-scale-prints-value** — criterion: every bar/tile rendered
  with `Math.log10`-derived height carries an adjacent text node with its true numeric value.
  Status: done (F10; every growth chart across both sequences).
- A duality/self-cancel comparison MUST draw the two sides exactly as they naturally come out and
  MUST NOT choose a labeling that forces them to look alike unless they are provably identical
  under that exact labeling — **MUST-duality-not-forced** — criterion: no relabeling step in the
  page's own code is present solely to make two drawn objects visually match. Status: done (F11;
  `sequences/A100001/viz.html`'s matrix/transpose pair).

### MUST — page structure
- A sequence's page MUST be structured as an explicit decomposition — an opening Problem frame, one
  or more sub-question sections whose answer badge feeds the next section, and a closing Solution
  that visibly reuses earlier frames (not merely a new summary) — **MUST-decomposed-chain**,
  **MUST-chain-reuses-prior-frames** — criterion: each section names or visually restates what the
  previous section's answer was before adding to it; the closing section contains at least one
  literal shrunk-recap element (see
  [device::MiniRecap](../_terms.md#deviceminirecap)). Status: done (F12;
  `sequences/A000001/viz.html`'s Problem → 1 → 2 → 3 → 4 → Solution structure, plus its "Как ответы
  складываются в итог" map).
- A page that renders a checkable algebraic/numeric claim (a multiplication table's associativity,
  a sequence's early terms) MUST have that claim independently re-verified by a committed,
  re-runnable script, not only checked by eye while authoring — **MUST-embedded-math-verified** —
  criterion: `memory-bank/verify/*.mjs` reproduces the exact same computation the page's own
  `<script>` performs and was actually executed, with its output recorded in the sequence's task
  spec `Status:` line — not asserted from memory. Status: done (F14;
  `memory-bank/verify/group-tables.mjs`, run 2026-09-01, all 7 embedded group tables clean).

### MUST — repository style
- Every page MUST be a single, self-contained HTML file — no build step, no local script
  dependency beyond a Google Fonts `<link>` — **MUST-self-contained** — criterion: the file opens
  correctly via `file://` with network access limited to the fonts stylesheet. Status: done (both
  `sequences/A100001/viz.html` and `sequences/A000001/viz.html`).
- Every page MUST render legibly in both light and dark viewer themes without a separate build —
  **MUST-both-themes** — criterion: the page defines its color tokens under `:root`,
  `@media (prefers-color-scheme: dark)`, and `:root[data-theme="dark"]`/`:root[data-theme="light"]`
  guards, per the same discipline used across the rest of this account's Artifact work. Status:
  done.
- Structurally different earlier attempts at a page MUST be kept under `sequences/A{NNNNNN}/drafts/`
  rather than discarded, with the sequence's own README stating why each was superseded —
  **MUST-drafts-kept** — criterion: `drafts/` exists for any sequence with more than one
  structurally distinct historical version, and the README's own prose (not a code comment) names
  the reason. Status: done (`sequences/A000001/drafts/`, two kept versions, reasons in
  `sequences/A000001/README.md`).

## Links
- The layer below, which this spec may reference and which never references back:
  [approaches](approaches.md) (requirements on the idea).
- Rules (short auto-loaded form): `.claude/rules/visualization-principles.md`.
- Skill: `.claude/skills/explain-sequence/SKILL.md`.
- Records: `memory-bank/_terms.md`; index — `memory-bank/index.md`.
- Verification: `memory-bank/verify/group-tables.mjs`.
- Template this spec adapts: [Hedgehogues/project-euler — specs/visualizations.md](https://github.com/Hedgehogues/project-euler/blob/main/memory-bank/specs/visualizations.md).
