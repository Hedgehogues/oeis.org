# Principles for visualizing OEIS sequences — catalog `memory-bank/`

Source: the actual revision history of `memory-bank/visualizations/A000001/viz.html`, a single
page rebuilt roughly twenty times against direct feedback in one sitting (2026-09-01). Every
principle below is a rule derived from a concrete round in which it was violated and fixed — the
same discipline as [Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler)'s own
`visualization-principles.md`, applied to a different medium (a live, self-contained HTML page a
viewer opens directly, not a build script rendering a static PNG).

The RFC-style specs: `memory-bank/specs/visualizations.md`, `memory-bank/specs/approaches.md`;
devices — `memory-bank/_terms.md`. Each principle below corresponds to a MUST requirement there;
this file is the short, auto-loaded form.

Related files: `memory-bank/index.md` (how the catalog is extended),
`.claude/skills/explain-sequence/SKILL.md` (page assembly).

## 1. A visual convention must be defined once, explicitly — never left to be inferred

A shape or a mark that means something specific (a dot on one corner standing in for "this
particular point, watch where it goes") only carries that meaning if it was stated once, in one
place, before it is reused silently everywhere else. A row of otherwise-identical icons with no
stated convention reads as decoration, not as data.

- MUST: the first time a device introduces its own visual convention (a marker, a color meaning,
  a highlighted cell), state what it means once — as a one-line legend, not a caption repeated
  under every subsequent picture that uses it.
- MUST NOT: assume a reader will reverse-engineer the convention from repetition alone.
- Precedent: a row of four marked rectangles ("what is this, what do these shapes mean, where did
  they come from") was unreadable until the corner-marker convention was named explicitly — after
  which the same pictures needed no further caption.

## 2. Identical presentation implies an identical conclusion — group by fact, not by convenience

Placing several items inside one visually uniform block (same border, same caption template) tells
the reader "these belong to the same category" whether or not that's actually true. If two of three
items genuinely share a structure and the third doesn't, the third does not belong in that block —
even temporarily, even for count purposes.

- MUST: before grouping items under one shared visual treatment, confirm the fact being implied by
  the grouping is actually true of every item in it.
- MUST NOT: rely on a subtle cue (a border color alone) to carry a distinction the layout itself
  contradicts.
- Precedent: a rectangle, an oval, an "H" shape and a pinwheel were shown in one row, each captioned
  "· 4 different" — true of the count, false of the structure, since only the first three share a
  table and the pinwheel doesn't. Read as "why is the pinwheel equal here and unequal later" until
  it was pulled into its own comparison.

## 3. Structural roles (index vs. result) must be visually distinct, not just positionally implied

A grid where the header row, header column and body cells share one identical style has no visual
answer to "what is a header, what is a result, how do I read this at all" — position alone (top row,
left column) is not a strong enough signal once the grid is unfamiliar.

- MUST: header cells of any table-like device carry a different fill/background from body cells.
- MUST: the first table of its kind on a page is preceded by one worked example — row + column →
  highlighted result — using the exact same math the table itself uses.
- Precedent: "what are these tables?" — a 4×4 grid with no visual distinction between the movements
  being combined and the movement that comes out.

## 4. A truly identical result renders as one merged shape, not as separate tiles that happen to match

Four side-by-side tiles holding the same icon still read as "four things", inviting the question
"why don't these differ" even when sameness is exactly the correct, intended finding. If several
results are provably identical, the tiles merge into one contiguous shape (no gaps, shared corners);
if they differ, they stay visually separate. The shape itself carries the finding.

- MUST: before rendering a row of results, check whether they are literally identical; if so, drop
  the gaps between them instead of leaving uniform tiles that must be read value-by-value.
- Precedent: a rectangle's four "repeat this movement twice" outcomes are all the identity — shown
  as four separate green tiles it read as a rendering accident ("if these are all rotations, why
  doesn't this one rotate"); merged into one bar, the sameness became a property of the shape.

## 5. An unlabeled connector communicates nothing — every arrow either carries a symbol or is removed

A bare "→" between two states asks the reader to supply its meaning from context that usually isn't
there. An arrow is only load-bearing when it's paired with a short symbolic mark for the operation
it represents (a repeat count, an operation glyph) — otherwise it is noise and should not be drawn.

- MUST: every connecting arrow between two drawn states carries a one-token label (a glyph, a small
  formula like `×2`) naming the operation the arrow performs.
- MUST NOT: use a plain arrow as a placeholder for "and then" with no stated operation.
- Precedent: "why is there some arrow, what does it mean" — traced to arrows left over from an
  earlier layout that had lost their operation label during a rewrite.

## 6. The distinguishing feature must be rendered at a size where it is actually visible

Enlarging an icon's overall bounding box does not help if the one feature that carries the meaning
(a marker dot, a highlighted corner) stays proportionally tiny inside it. The feature's own size and
contrast against its background — not the icon's outer dimensions — decide legibility.

- MUST: when a small mark is the thing being compared between icons, check its size and contrast in
  isolation, not only the icon's overall size.
- Precedent: after two rounds of enlarging whole icons, the actual marker dot was still a few
  pixels across with low contrast against a similarly-colored fill ("still nothing is visible") —
  fixed only once the dot itself, not the icon, was made bigger and given a contrasting outline.

## 7. Framing communicates category — draw a boundary whenever two adjacent items are unrelated

Two items that answer different questions but sit side by side with only a caption between them
read as connected regardless of what the caption says (and worse once the caption is trimmed for
brevity). A bordered container around each distinct topic separates them without needing a word.

- MUST: when a page's flow moves from one kind of claim to an unrelated one (a rejected attempt,
  then an unrelated example object), enclose each in its own bordered block.
- Precedent: "the transitions feel off" — a rejected candidate sitting directly next to an
  unrelated comparison object, with nothing but a two-word label separating them.

## 8. A count claimed about a structure must show the structure it was counted from

A badge reading a bare number ("on the diagonal: 2") next to a table asks the reader to trust the
number rather than see where it comes from. The cells that number was counted from must be
highlighted in the same grid the badge sits under.

- MUST: any summary count derived from a table or grid highlights the exact cells it counts, in
  that same table, not only in a separate legend.
- Precedent: "why isn't it equal" — resolved only once the diagonal cells themselves were
  highlighted inside each table, rather than trusting two numbers printed underneath.

## 9. A definition is not decorative prose and survives a "remove all text" pass

Cutting narrating sentences ("this shows that...", "as a result...") down to nothing is usually a
correct simplification. A ONE-TIME definition of a new visual convention (principle 1) is a
different kind of sentence — deleting it during the same pass removes the only thing that made the
picture decodable, and the resulting confusion has nothing to do with verbosity.

- MUST: before deleting a caption for brevity, classify it — is it narrating a conclusion the
  picture already shows (delete), or defining a convention nothing else states (keep, but as one
  short line, not a paragraph)?
- Precedent: a full pass to remove narrating captions also deleted the rectangle's marker-dot
  definition; the very next question was "what is this, what do these shapes mean" — the exact
  confusion principle 1 exists to prevent.

- MUST: the defining line is marked as notation in the markup (`class="legend"`), not left among
  the captions, so a pass that removes commentary has a boundary it can see.
- Precedent, the second time: after the legend was restored by hand, a later redesign of the same
  section removed it again — and nobody noticed for weeks, because the page still looked finished.
  Found only when `verify/pages.mjs` was written and immediately failed. A rule that has to be
  remembered gets forgotten; this one is now checked.

## 10. A log-scaled bar keeps its literal number printed on it

Compressing several orders of magnitude onto one chart requires a log scale, or small values vanish
next to large ones — but the compression itself then hides the real magnitude from the reader. Every
bar or tile prints its actual value regardless of the scale used to size it.

- MUST: any chart using a log (or otherwise nonlinear) scale for height/size prints the true value
  as a number on or beside every bar/tile.
- Precedent: an early growth chart on a linear scale rendered values under 20 as invisible slivers
  next to a value in the hundreds; switching to log fixed visibility, and every bar kept its number
  so the compression itself couldn't mislead about scale.

## 11. A duality or self-cancel claim shows the actual comparison — never a matrix forced to look symmetric

When a structure is claimed to equal its own transform (self-duality, a table equal up to
relabeling), the two objects are drawn exactly as they actually come out — even if they look
different as drawn. Relabeling one of them just to make the picture look symmetric overclaims a
stronger fact than the one being demonstrated (a literal match) instead of the true one (a match
exists after some relabeling).

- MUST NOT: choose a labeling or layout for a duality comparison that makes two objects appear
  identical unless they are provably identical under that exact, stated labeling.
- Precedent: A100001's incidence matrix and its transpose are shown as they naturally come out,
  not relabeled to match, with the honest caption that a relabeling exists rather than claiming the
  matrices are the same matrix.

## 12. One picture cannot answer "what / why / how much" at once — decompose, then let each answer feed the next

A single dense infographic trying to define the object, prove the mechanism, and show the final
count all at once collapses under its own weight the moment a reader who doesn't already know the
answer looks at it cold. The fix is a sequence of pictures — Problem → sub-question 1 → sub-question
2 → ... → Solution — where each picture's answer becomes the next picture's given.

- MUST: a page explaining a nontrivial sequence is structured as an explicit decomposition (a
  numbered chain of sub-questions), not one picture carrying the whole argument.
- MUST: the closing picture visibly reuses the outputs of the earlier ones (a shrunk copy, a
  matching color/shape), so the chain reads as one argument, not a list of unrelated diagrams.
- Precedent: `memory-bank/visualizations/A000001/viz.html` was rebuilt from one dense catalog into
  an explicit Problem → (1: what counts) → (2: which movements exist) → (3: how they combine) →
  (4: why it jumps) → Solution chain, each step's answer badge feeding directly into the next
  step's picture.

## 13. The whole repository is in English

Everything that ships in the public repository is written in English: pages, records, specs,
scripts, comments, and therefore the text rendered into every screenshot. This mirrors
project-euler's own principle 13 word for word — the two pages here originally shipped in Russian
(a deliberate choice at the time, matching who they were built for) and were fully translated
after the fact once the repository's screenshots made the inconsistency visible: catalog and specs
in English, pictures in Russian, side by side on the same page.

- MUST: a grep for Cyrillic across every tracked file (`.html`, `.md`, `.mjs`) is empty.
- MUST: after translating a page, regenerate its screenshots (`memory-bank/visualizations/
  capture.mjs`) — a translated source with stale, Russian-language PNGs is the same bug as an
  edited page with stale screenshots of any kind (principle 12's "keep the chain in sync",
  language version).
- Precedent: both `memory-bank/visualizations/A100001/viz.html` and
  `memory-bank/visualizations/A000001/viz.html` (plus its two kept drafts) were fully translated
  in one pass — title, headings, every JS-generated label and tooltip, `<html lang>` — after the
  repository's own English specs and dictionary made Russian screenshots read as a foreign
  element. `grep -rlP '[Ѐ-ӿ]' --include='*.html' --include='*.mjs'`
  across the tracked tree is empty.

## 14. A screenshot embedded in more than one place is a sign the crop is too coarse

If the exact same picture is the `Picture:` field for several different device records, that
usually doesn't mean the devices are the same — it means the crop was taken at the wrong
granularity (a whole card, when the card holds three or four independently-recognizable devices
stacked inside it). The fix is a tighter, targeted crop per device (a specific element id, a
specific `.grp`/sub-widget), not a caption explaining which part of the shared image to look at.

- MUST: before reusing an existing screenshot for a new device's `Picture:` field, check whether a
  more specific element already exists in the page (an id, a bordered sub-group) that isolates just
  that device; capture that instead of the enclosing card.
- MUST NOT: rely on prose ("see the left/right side of this picture") to do the separating job a
  tighter crop should do.
- MUST: treat "I have to aim this record at another device's picture" as evidence that THIS
  device's own visual is missing from the page — check whether a later redesign deleted it, and
  restore it as its own widget (or retire the record) instead of sharing.
- Precedent 1: one shared card screenshot originally served as the `Picture:` for four unrelated
  records (`MarkedAsymmetry`, `CayleyTable`, `SelfCancelDiagonal`, `StateMap`) — re-cropped to four
  distinct, non-overlapping images once flagged.
- Precedent 2: the one crop left shared after that fix (`StateMap` / `MergedResultStrip`) was
  defended in writing as "one frame, two true facts" — and that was wrong. `MergedResultStrip`'s
  actual visual had been deleted from the page by the redesign that introduced `stateMap()`; the
  record had been quietly re-pointed at a neighbour's crop instead of the missing visual being
  noticed. Caught by a direct question ("a duplicate of the previous one, why?"), fixed by
  restoring the widget as `#mergeDemo` with its own crop. Every device now has exactly one picture
  of its own, and no picture serves two devices.

## 15. One visual system across every page in the catalog

Pages written months or hours apart drift into different palettes and typefaces. That is invisible
while each page is read alone and glaring the moment their crops sit next to each other in the
dictionary: the catalog stops reading as one body of work and starts reading as several unrelated
projects. Colour ROLES and typefaces are catalog-level decisions, not per-page ones.

- MUST: a new page adopts the existing token block (same colour roles, same three typefaces)
  rather than inventing its own; a deliberate departure needs a stated reason in the sequence's
  own README.
- MUST: when an older page is restyled to match, re-capture its screenshots in the same pass — a
  restyled page with old-palette PNGs is the same stale-snapshot bug as a translated page with
  old-language PNGs (principle 13).
- Precedent: `memory-bank/visualizations/A100001/viz.html` was built first, in teal/amber with
  Fraunces / Public Sans / IBM Plex Mono; `memory-bank/visualizations/A000001/viz.html` later
  settled on indigo/pink with Literata / Karla / JetBrains Mono. Two of the twelve device pictures
  therefore came from a visibly different design system — flagged directly ("a different style —
  change it too"), fixed by restyling `A100001` onto the same tokens and type and re-capturing
  all four of its crops.

## 16. Every page carries a QR code back to the repository

A picture lives apart from its text — it gets forwarded, pasted into a chat, shown on a screen —
so the way back to the sources, the specs and the other sequences has to be on the picture itself,
not in a caption beside it. Every page therefore ends with a QR code to
`https://github.com/Hedgehogues/oeis.org` plus the address in text, for anyone not scanning.

- MUST: the QR is generated once from the repo URL at error-correction level M and committed as
  `memory-bank/visualizations/qr-repo.svg`; a page inlines that exact SVG rather than drawing its
  own.
- MUST: the QR is rendered dark-on-light with fixed colors, NOT through the page's theme tokens. It
  is a machine target, and the light-on-dark inversion a dark theme produces is unreadable to most
  scanners — the one element in the catalog that deliberately ignores principle 15's single visual
  system.
- MUST: after adding or changing it, decode the QR from the captured PNG (not from the SVG) and
  check the URL that comes out. A code that cannot be read off the snapshot is not a code — and the
  snapshot is the form that actually travels.
- Precedent: the first version followed the theme (`color:var(--ink)` on `var(--surface)`) at 72px.
  Decoding the dark-theme capture returned nothing from either page. Fixed by pinning the colors
  and enlarging to 104px, after which both pages' `full.png` decoded to the repo URL on the first
  attempt.

Trigger: any request to explain an OEIS sequence with a picture — a new device record, a
per-sequence page, an edit to an existing visualization; an invocation of the `explain-sequence`
skill; adding or editing any `[device::*]` record.
Mechanization: `node memory-bank/verify/all.mjs` exits non-zero on a violation of principles 9, 11,
14, 15 and 16, and every one of those checks was proved by reintroducing the exact fault it exists
for rather than merely written:

| # | check | the fault it was tested against |
|---|---|---|
| 9 | `verify/pages.mjs` | deleting the legend that defines the corner marker |
| 11 | `verify/group-tables.mjs` | a table that is not actually a group |
| 14 | `verify/catalog.mjs` | renaming the element a device record describes, leaving the record pointing at nothing |
| 15 | `verify/pages.mjs` | restoring the old teal accent and a different page ground |
| 16 | `verify/qr.mjs` | re-theming the QR and shrinking it, then re-capturing |

The rest stay judgement calls, and saying so is the point of listing them: principles 1, 2, 7 and
12 are about whether a decomposition is honest, which no script decides. Principles 4, 6 and 10
need a human looking at a rendered screenshot — nothing static distinguishes a merged bar from four
touching ones, or a visible marker from an invisible one. Principles 3, 5, 8 and 13 have cheap
greps (a header/body class distinction; a bare arrow glyph with no adjacent label; a count badge
with no highlighted cells nearby; Cyrillic in a tracked file) that are run by hand and have not
been worth wiring up.

The history this file records is the argument for the table above. Every principle in it was
learned from a correction rather than from foresight, and two were learned twice: the marker legend
was deleted, restored after the reader asked what the shapes meant, then deleted again by a later
redesign and noticed only when a check was finally written for it. The compensation so far has been
the reader's own questions, which is exactly what should not be the mechanism going forward.
