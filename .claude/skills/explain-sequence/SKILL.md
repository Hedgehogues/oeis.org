---
name: explain-sequence
description: Shows or extends a visual explanation of an OEIS sequence from this catalog. Diagram devices are [device::*] blocks in memory-bank/_terms.md (idea and picture in one record); each device's actual code lives inline in the memory-bank/visualizations/A{NNNNNN}/viz.html page(s) that render it — there is no separate build step, since these pages are meant to be opened live, not screenshotted. Builds and extends the picture; the write-up that follows (README, spec, new device records) is document-sequence's job. Hedgehogues/project-euler has one skill where this repo has two — see memory-bank/upstream.md for that split and why.
---

# Explaining an OEIS sequence

The principles behind everything below: `.claude/rules/visualization-principles.md`; the full
requirements with acceptance criteria: `memory-bank/specs/visualizations.md` (picture) and
`memory-bank/specs/approaches.md` (idea). This file is the mechanics.

The point of the skill is not to invent a new picture each time but to reuse an already-catalogued
device, or — when none fits — to run the full cycle that adds one properly: standard-name check,
placement in the right section of a Problem→...→Solution decomposition, and (if the device embeds
a checkable algebraic/numeric claim) a committed verification script before anything ships.

## Catalog layout

```
memory-bank/
  _terms.md                    — [device::*] blocks: ONE record per device, idea and picture as
                                  fields of the same record (Essence/Recognized by/General case/
                                  Source + Picture/Reading order/Example), not two lists; not a
                                  single mention of a specific sequence — a sequence links HERE
                                  from its own README, never the other way round
  specs/approaches.md          — requirements on the idea (MUST/SHOULD)
  specs/visualizations.md      — requirements on the picture
  specs/tasks.md               — format governing specs/tasks/*.md
  specs/tasks/A{NNNNNN}.md     — one applied spec per sequence
  verify/*.mjs                 — independent re-checks of embedded algebraic/numeric claims
  visualizations/
    A{NNNNNN}/viz.html         — the live, self-contained picture
    A{NNNNNN}/screenshots/     — snapshots taken from that page, one crop per device
    A{NNNNNN}/drafts/          — kept structurally-different earlier attempts, reasons in README
    capture.mjs                — regenerates every screenshot from the pages beside it
    qr-repo.svg                — the repo QR every page inlines in its footer
sequences/
  A{NNNNNN}/
    README.md                  — the write-up: what it counts, the framing, links to devices used
    solution.mjs               — computes a(n) from the definition, no table of known answers
    proof.mjs                  — re-checks that output with independently written routines
```

Every picture lives in the memory bank; a sequence's own directory holds no HTML and no PNG at all.

One device — one block in `_terms.md`, its code inline in whichever `viz.html` page(s) its
`Picture:` field names. No separate `examples/` directory (see
`memory-bank/specs/visualizations.md`'s Architecture section for why: there is no static-PNG build
to assemble from, every page renders itself live).

## Input

A free-form request: "explain A000001", "why does the count jump for powers of two", "show a
Cayley table for this", "add a new sequence, A005843". The skill matches it against either an
EXISTING sequence (open/extend its page) or a device NEEDED for a new explanation (reuse or add to
the dictionary).

## Steps (strictly in order)

1. **Read `memory-bank/_terms.md` in full** — mandatory first step of every invocation.

2. **Existing sequence, asked to explain or extend:** open `sequences/A{NNNNNN}/README.md` and
   `memory-bank/visualizations/A{NNNNNN}/viz.html`; the README's own Terms/device links tell you
   which `[device::*]` records are already in play. Re-derive nothing that's already stated there.

3. **New sequence, or a request for a picture with no existing page:**
   a. Fetch the sequence's real data (`oeis.org/search?q=id:A{NNNNNN}&fmt=text`) before writing
      anything — never guess or recall terms from memory.
   b. Decide the page's Problem→...→Solution decomposition (per
      `visualization-principles.md` #12) BEFORE picking devices — the argument's shape comes
      first, the devices that render each step come second.
   c. For each step, match against an existing `[device::*]` block by substance (a shared
      multiplication table → `CayleyTable`; contrasting two same-count movements'
      repeat-behavior → `StateMap`; a duality claim → `IncidenceMatrixPair`; a value spanning
      orders of magnitude → `LogGrowthChart`; and so on). No match → step 4.
   d. Write the page as a single self-contained HTML file (`MUST-self-contained`), both light and
      dark theme tokens (`MUST-both-themes`), the repo QR footer inlined from
      `memory-bank/visualizations/qr-repo.svg` (`MUST-repo-qr`), following every applicable
      principle in `visualization-principles.md`.
   e. If the page embeds a checkable algebraic/numeric claim, write or extend a
      `memory-bank/verify/*.mjs` script that independently reproduces it, run it, and record the
      real output — never assert `Status: done` from memory (`MUST-status-is-evidence`).
   f. Write `sequences/A{NNNNNN}/solution.mjs` (computes the sequence from the definition the page
      draws, no lookup table) and `sequences/A{NNNNNN}/proof.mjs` (re-checks it with routines
      written from scratch — soundness, distinctness, completeness, agreement with the published
      terms), run both, and state the measured range honestly in `solution.mjs`'s header.
   g. Run `node memory-bank/visualizations/capture.mjs`, then **hand off to `document-sequence`**
      for the README, the spec and any new `[device::*]` record. That skill owns those three
      artifacts; writing them here as well would give each one two owners and two shapes.

4. **No device matches — a new one, the full cycle, not a one-off drawing:**
   a. Check for an established name for the underlying idea (not necessarily the specific diagram)
      before writing anything. If none exists, say so plainly in the record — `Standard name: —
      (no established name found)` — rather than inventing or stretching a citation
      (`MUST-canonical-source`).
   b. Design the device's `Reading order` — how a first-time viewer's eye should move across it —
      and write out its `Limits`, marking which belong to the idea and which only to the drawing.
   c. Build it inline in the page that needs it; verify the render (both themes, the actual
      distinguishing feature's own size/contrast per principle 6).
   d. Add the device's own crop to `capture.mjs`, re-capture, and Read the PNG before showing
      anything — the distinguishing feature is judged at its own size, not the icon's.
   e. Only THEN show the result. The `[device::<Name>]` record itself is written by
      `document-sequence`, which also runs `verify/catalog.mjs` over it.

5. **Ambiguity** (two or more devices fit equally well, or it's unclear whether a request wants a
   new sequence page or an edit to an existing one) — ask, do not guess.

6. **A contradiction is found** (a marker too small to see, an ungrouped pair of unrelated items, a
   count badge with nothing highlighted to back it) — fixed by editing the page and rechecking the
   render, never by adding an explanatory sentence in place of a picture fix
   (`visualization-principles.md` #9 cuts the other way too: a text fix is not a substitute for a
   structural one).

## Verification, not memory

Before any `Status: done` is written into a task spec, the claim behind it is actually run:
`node memory-bank/verify/*.mjs` for what a PAGE embeds, `node sequences/A{NNNNNN}/proof.mjs` for
what the IMPLEMENTATION computes, a live `curl`/fetch against `oeis.org` for sequence data. A
status line naming a check that wasn't actually performed during this invocation is a violation of
`specs/tasks.md`'s `MUST-status-is-evidence`.
