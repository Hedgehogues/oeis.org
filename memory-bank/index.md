# Index

> The **dictionary** (`_terms.md`) holds only reusable knowledge — diagram devices, like a
> textbook. Not a single specific sequence and not a single link to one lives there: the link runs
> the other way, a sequence (`sequences/A{NNNNNN}/README.md`) points at the block it needs by name.
>
> **One device, one block.** The idea and its picture are not split across two parallel lists but
> live as fields of a single `[device::*]` record; a device has at most one picture, and having
> none is legitimate with a stated reason.
>
> The **specs** folder is a different thing: RFC documents, not dictionary entries, split by kind.
> `specs/*.md` describes the catalog itself (idea quality, picture quality) — a meta-spec, about
> what makes any device record and its picture good. `specs/tasks.md` is a THIRD meta-spec, about
> what makes a sequence's own spec good — the format, not the catalog. `specs/tasks/*.md` is where
> that format is actually applied: one file per sequence, its own requirements and acceptance
> criteria. That is exactly the kind of content the dictionary above must never hold, but a spec is
> not a dictionary entry.
>
> This whole layout — dictionary / two meta-specs / applied task specs / a short auto-loaded rules
> file — is adapted directly from
> [Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler)'s own memory bank; see
> each file's own header for exactly what changed and why.

## oeis — explaining sequences
- [_terms.md](_terms.md) — the dictionary and the ONLY place descriptions live: context `device` —
  MarkedAsymmetry, CayleyTable, SelfCancelDiagonal, MergedResultStrip, StateMap, OrbitRing,
  DivisorChips, IncidenceMatrixPair, LogGrowthChart, UnrealizedPlaceholder, MiniRecap,
  CombinationFork, RunLengthEncoding, FixedPointOverlay, FundamentalDomainPlot, DivisorPairFan,
  NonClosingTable, NonConvergingTrace, FractionalPartHistogram, RepresentationGrid,
  BurnsideFixedPointTable, IncrementalTally (the catalog- and shell-level invariants live in the two
  specs below, not as blocks of their own)
- [approaches](specs/approaches.md) — Status: draft — requirements on the IDEA in a device record:
  atomic, recognizable from the situation, canonical source where one exists, no mention of a
  specific sequence
- [visualizations](specs/visualizations.md) — Status: draft — requirements on the PICTURE: an
  explicit Problem→...→Solution decomposition, self-contained live HTML (no build/PNG pipeline —
  see its Architecture section for why), embedded math independently re-verified
- [upstream.md](upstream.md) — what this repository was compared against in
  [Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler), when, file by file,
  and where it deliberately differs; every "adapted from" sentence elsewhere points at a row of it
- [tasks](specs/tasks.md) — Status: draft — requirements on a TASK SPEC's own format: six sections
  in order, devices must resolve, a `Status:` line must name real evidence, and every sequence
  directory carries the implementation/proof pair described below
- [specs/tasks/A100001.md](specs/tasks/A100001.md) · [specs/tasks/A000001.md](specs/tasks/A000001.md) ·
  [specs/tasks/A000002.md](specs/tasks/A000002.md) · [specs/tasks/A000003.md](specs/tasks/A000003.md) ·
  [specs/tasks/A000005.md](specs/tasks/A000005.md) · [specs/tasks/A000004.md](specs/tasks/A000004.md) ·
  [specs/tasks/A000007.md](specs/tasks/A000007.md) · [specs/tasks/A000012.md](specs/tasks/A000012.md) ·
  [specs/tasks/A000027.md](specs/tasks/A000027.md) · [specs/tasks/A000030.md](specs/tasks/A000030.md) ·
  [specs/tasks/A000018.md](specs/tasks/A000018.md) · [specs/tasks/A000021.md](specs/tasks/A000021.md) ·
  [specs/tasks/A000024.md](specs/tasks/A000024.md) · [specs/tasks/A000029.md](specs/tasks/A000029.md) ·
  [specs/tasks/A000011.md](specs/tasks/A000011.md) · [specs/tasks/A000013.md](specs/tasks/A000013.md) ·
  [specs/tasks/A000016.md](specs/tasks/A000016.md) · [specs/tasks/A000008.md](specs/tasks/A000008.md)
  — the applied instances of `tasks.md`'s format; linked from each `sequences/A{NNNNNN}/README.md`

### Pictures — all of them inside the memory bank
Every visual artifact lives under `visualizations/`, the same arrangement project-euler uses: a
problem's own folder there holds no picture files, and neither does a sequence's here.

- `visualizations/A{NNNNNN}/viz.html` — the picture itself: a single self-contained HTML page,
  opened directly, no build step (deliberately different from project-euler's shared-shell +
  `build.sh` → PNG pipeline — this catalog's devices are meant to be interacted with live, not
  screenshotted)
- `visualizations/A{NNNNNN}/screenshots/*.png` — snapshots taken FROM that live page, committed
  only because GitHub cannot preview an `.html` file inline; one crop per device
- `visualizations/A{NNNNNN}/drafts/` — kept structurally-different earlier attempts, with the
  reason each was superseded in the sequence's own README, never silently deleted
- `visualizations/capture.mjs` — regenerates every screenshot from the pages beside it
- `visualizations/qr-repo.svg` — the repo QR every page inlines in its footer, so a forwarded
  snapshot leads back here; generated once at error-correction level M and committed
- `verify/all.mjs` — runs every check below and reports one verdict; this is what a spec's
  `Status: done` is allowed to cite. project-euler describes its cross-check in the spec's Status
  line; here the check is committed so anyone can re-run it. Every one of these was tested by
  reintroducing the exact fault it exists for:
  - `verify/group-tables.mjs` — the multiplication tables the pages draw really are groups
  - `verify/benford.mjs` — A000030's page-embedded statistical claims (A008952's Benford
    convergence, the equidistribution mechanism) hold up against an independent, from-scratch
    re-derivation, not just the fast method the page itself uses
  - `verify/catalog.mjs` — every device record still describes an element that exists on its page,
    from a crop `capture.mjs` really produces, and no two records share one
  - `verify/pages.mjs` — the marker convention is stated, the QR is present and pinned outside the
    theme, both themes are defined, nothing is loaded but the fonts
  - `verify/code-split.mjs` — the implementation consults no published terms and the proof does not
    borrow the routine it judges
  - `verify/qr.mjs` — the QR decodes out of the captured PNG, the form that actually travels
  - `verify/sequences.mjs` — each sequence's own proof at a bound quick enough to run after any edit

### Outside the memory bank
- `sequences/A{NNNNNN}/README.md` — the sequence itself: what it counts, the framing chosen for its
  picture, links to the devices it uses and to its task spec (all sequences live under one
  `sequences/` folder, not loose at the repo root)
- `sequences/A{NNNNNN}/solution.mjs` — computes the sequence from the definition the page draws,
  with no table of published terms anywhere in it: a file that looked its answers up would prove
  nothing about the explanation it accompanies
- `sequences/A{NNNNNN}/proof.mjs` — checks that output using routines written from scratch rather
  than imported from the search that produced it, and is the one file allowed to consult the
  published terms. Running the same code twice agrees with itself for free; a second, slower,
  independently written routine can disagree, which is what makes agreement evidence. Where a claim
  is an existence claim ("this configuration is self-dual"), the proof produces the witness and
  verifies it rather than reporting a yes
- `.claude/rules/visualization-principles.md` — principles 1–12 (the short, auto-loaded form of the
  spec requirements)
- `.claude/skills/explain-sequence/SKILL.md` — builds the picture: finds a device in `_terms.md`,
  or runs the full add-a-device cycle, then opens the resulting page
- `.claude/skills/document-sequence/SKILL.md` — writes the catalog write-up once the page and the
  code exist: the sequence README, its task spec, and any new `[device::*]` record. Upstream has
  one skill covering both; splitting them here keeps one owner per artifact
