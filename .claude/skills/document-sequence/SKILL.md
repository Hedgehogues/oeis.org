---
name: document-sequence
description: Writes the full catalog write-up for a sequence that already computes and checks — sequences/A{NNNNNN}/README.md, memory-bank/specs/tasks/A{NNNNNN}.md, and any new memory-bank/_terms.md device entries its page needs — by following the shape already established by A000001 and A100001, not improvising a new one. Escalates to the user (AskUserQuestion) instead of guessing wherever the new sequence doesn't fit that precedent cleanly. Adapted from Hedgehogues/project-euler's document-problem skill; the correspondence is recorded in memory-bank/upstream.md.
---

# Documenting a sequence

This skill produces the whole write-up for ONE sequence — README, spec, and whichever device
entries its page needs, including drawing a picture for a genuinely new device — reusing the
catalog wherever possible and extending it only when genuinely new.

Precondition: `sequences/A{NNNNNN}/solution.mjs` and `proof.mjs` already exist and the page
`memory-bank/visualizations/A{NNNNNN}/viz.html` already renders. This skill does not design the
explanation and does not derive the algorithm — `explain-sequence` builds the picture, and the code
is written before this skill runs. If either is missing, that's a different task; say so and stop.

The full formal requirements this skill's output must satisfy: `memory-bank/specs/tasks.md` (spec
format), `memory-bank/specs/approaches.md` (idea quality), `memory-bank/specs/visualizations.md`
(picture quality). This file is the mechanics of getting there by following precedent
(`sequences/A000001`, `sequences/A100001` and their specs) rather than re-deriving the format from
the RFC documents each time.

## Steps (in order)

1. **Read the precedent.** Open one existing `sequences/A{NNNNNN}/README.md` and its
   `memory-bank/specs/tasks/A{NNNNNN}.md` side by side — these are the actual template, not a
   description of one. **Read `memory-bank/_terms.md` in full** — mandatory first step, every
   invocation, never rely on memory of what's catalogued from an earlier session.

2. **Verify the sequence actually works, live — never assert it from memory or from the fact that
   `solution.mjs` runs without throwing.** Per `specs/tasks.md`'s MUST-status-is-evidence: run
   `node sequences/A{NNNNNN}/solution.mjs [maxN]`, run `node sequences/A{NNNNNN}/proof.mjs [maxN]`,
   and fetch the sequence's real terms from `oeis.org/search?q=id:A{NNNNNN}&fmt=text`. The README's
   and spec's `Status:` lines must name what was ACTUALLY run this time, with the real output and
   the real wall-clock, not repeat a claim from an earlier session.
   - **Escalate** if no independent check is feasible for this sequence's shape (no second
     construction, no independently published count to compare the enumeration against) — do not
     write a "done" status you couldn't actually check.
   - State the wall honestly. Both existing implementations are exhaustive and stop early; the
     header says which `n` finishes, how long it took, and which `n` does not. A guessed bound is
     the same failure as a guessed status.

3. **Identify the device(s) the page uses**, then classify each one against the catalog:
   - **Already catalogued** (an existing `[device::Name]` block in `_terms.md` describes it) —
     reuse by reference. Per MUST-reuse-changes-nothing, this touches ZERO lines of `_terms.md`.
   - **Not catalogued** — add it properly, in this order, not as a shortcut inline description:

     (a) `WebSearch` for the established name and an encyclopedic source (Wikipedia, Britannica, a
     professional body, a standard reference text — blogs are supplements only) BEFORE writing
     anything; if none exists, say so in the record (`Standard name: — (no established name
     found)`) rather than inventing or stretching a citation. This search covers the PICTURE too:
     before writing `Picture: —`, actually check whether a standard visual exists for the thing
     this device shows, even under a different mechanism, rather than copying the "no picture"
     reasoning from a structurally similar prior record by inertia.

     (b) design the device's `Reading order` — how a first-time viewer's eye should move across it —
     and write out its `Limits`, marking which belong to the idea and which only to the drawing;

     (c) build it inline in the page that needs it (there is no `examples/` directory and no build
     step here — see `specs/visualizations.md`'s Architecture section for why), then add a crop for
     it to `capture.mjs`'s crop list, targeted at that device's own element via an `id` the page
     sets — never at a neighbouring `.card` that happens to contain it;

     (d) run `node memory-bank/visualizations/capture.mjs` and **look at the resulting PNG (Read
     it)** — the mandatory observation step before showing anything to the user, never skipped on
     the assumption the markup must be fine. Check the distinguishing feature at its own size, not
     the icon's: a marker dot that is a few pixels across with low contrast is invisible no matter
     how large the shape around it is (principle 6);

     (e) write the `[device::Name]` block in `_terms.md` — ONE block, idea and picture fields on the
     same record (Class/Standard name/Essence/Recognized by/General case; Picture/Reading
     order/Example; a shared Limits marking which limit belongs to the idea and which only to the
     drawing) — never a separate "for the picture" block;

     (f) **before calling the picture done, list every number that appears in its final frame and
     confirm each one is directly visible or countable in an earlier frame.** A number that only
     shows up at the end, with no earlier frame it can be checked against, means the picture does
     not carry its own causal chain no matter how polished it looks. Go back and add the missing
     step before moving on.

     (g) run `node memory-bank/verify/catalog.mjs`. It fails if the new record points at a crop
     `capture.mjs` does not produce, at a selector that does not resolve, or at a picture another
     record already claims. Precedent: `[device::MergedResultStrip]`'s widget was deleted by a
     redesign and the record was quietly re-aimed at a neighbouring device's crop, with a
     justification written for it — caught only when the user asked why two records showed the same
     picture. A `Picture:` field that has to be aimed at ANOTHER device's crop is evidence the
     device's own visual is missing, not a labelling choice.
   - **Escalate** if the page uses two techniques together and it's unclear whether they are one
     atomic device or should be split into independent records — the real test is "is each one
     recognizable in ANOTHER sequence without the other". If that test doesn't resolve cleanly, ask
     rather than pick a side.
   - **Escalate** if a candidate device's only findable source is a blog or teaching site with no
     encyclopedic citation — don't catalog it on a weak source and hope to fix it later.
   - **Escalate** if the technique matches two or more existing `[device::Name]` blocks about
     equally well — ask which one, don't guess.
   - **Determinism**: re-running `capture.mjs` against an UNCHANGED page must produce byte-for-byte
     identical PNGs. If a re-capture shows a diff with no page edit behind it, that's a bug in the
     capture setup, not acceptable variance — fix it before moving on rather than committing the
     churn.

4. **Write `sequences/A{NNNNNN}/README.md`**, matching the existing two's shape exactly:
   - Title line (`# A{NNNNNN} — <name>`), then the statement of what the sequence counts in one or
     two sentences. No lead image here — the pictures belong to the devices.
   - `## Approach` — bullet steps of how `solution.mjs` computes it, then a `Status:` line naming
     the actual verification from step 2 (the command, its real output, the measured wall), then
     `Full requirements and acceptance criteria: [spec.md](../../memory-bank/specs/tasks/A{NNNNNN}.md).`
   - `## The ideas behind it` — one entry per device used, each a one-line essence plus
     ``[`[device::Name]`](../../memory-bank/_terms.md#devicename)`` and the picture embedded as a
     link to the live page:
     `[![Name](../../memory-bank/visualizations/A{NNNNNN}/screenshots/<crop>.png)](../../memory-bank/visualizations/A{NNNNNN}/viz.html)`.
     Two or more devices go in a two-column table; one or two go as paragraphs.
   - `## Build & run` — the `node …/solution.mjs` and `node …/proof.mjs` commands with the bounds
     that actually finish.
   - `## The page these pictures come from` — the full-page snapshot linked to the live page, one
     short paragraph on the page's Problem → … → Solution shape, and the "Open it live" link.
   - `### Drafts`, only if structurally different earlier versions were kept — naming, for each,
     what question it answers differently rather than "an earlier, worse version".

5. **Write `memory-bank/specs/tasks/A{NNNNNN}.md`**, following `specs/tasks.md`'s format
   requirement by requirement — six sections in this exact order (MUST-section-shape): Vision,
   Terms, Scope, Architecture, Requirements, Links.
   - Vision MUST state what the sequence counts in plain words AND the page's central explanatory
     claim about why it behaves that way (MUST-vision-names-claim) — not just restate the data.
   - Terms MUST link every device used via `[device::Name](../../_terms.md#devicename)`
     (MUST-devices-resolve) — verify each anchor actually exists in `_terms.md` before writing it.
     The anchor is the heading lowercased with non-word characters stripped; compute it, don't
     guess it.
   - Architecture MUST carry a `### Code` subsection describing what `solution.mjs` does and what
     `proof.mjs` checks that is independent of it.
   - Requirements MUST each be phrased statement — bold `**MUST-id**` — `criterion:` — `Status:`
     (MUST-requirement-shape), and MUST include: a data-match requirement against OEIS's own terms,
     MUST-implementation-present, MUST-proof-independent, MUST-runtime-honest, and a
     self-containment requirement naming the real page path.
   - Prefer a criterion that names a command over one that names a judgement. `node
     memory-bank/verify/all.mjs` exits 0 is checkable; "the picture is clear" is not.
   - MUST NOT define a new `[device::*]` block inside this file (MUST-no-new-devices-here) — if
     step 3 found something uncatalogued, it was catalogued in `_terms.md` FIRST, in its own step.
   - **Escalate** if the Vision's central claim isn't something the page actually demonstrates —
     that usually means the page needs another frame, not that the spec needs better wording.

6. **Update the shared surfaces**: add the sequence's row to the root `README.md` table with its
   real Status; if any new device was catalogued in step 3, update `memory-bank/index.md`'s device
   list and check `.claude/rules/visualization-principles.md`'s principle count is still current
   (both list exact counts — a stale count is small, easy to miss, and exactly the kind of drift
   this catalog keeps hitting). If the new sequence introduced a structural correspondence that
   `memory-bank/upstream.md` doesn't yet record, add the row there rather than leaving the
   "adapted from" claim broader than what was actually compared.

7. **Run `node memory-bank/verify/all.mjs` and quote its real output.** This is the last step, not
   an optional one: it is what every `Status: done` in the files just written is allowed to cite.
   If a check fails, fix the thing rather than the wording of the status. Precedent: writing these
   checks immediately found that the line defining the corner marker had been deleted from
   A000001 for the second time — once by a "remove the prose" pass and once by a later redesign,
   both unnoticed, because the page still looked finished.

8. **Escalate — catalog growth**: if the number of directories under `sequences/` is starting to
   make that flat folder mix kinds (a distinction not yet visible in the tree), name it explicitly
   rather than silently letting it accumulate. The fix pattern (a subfolder per kind) is
   established upstream, but WHEN to apply it is a judgement call for the user, not a threshold to
   guess at.

## What "escalate" means here

`AskUserQuestion` with the specific fork named (not "does this look right?") — e.g. "this page
contrasts two objects on one ring of states and also merges identical results; precedent says these
are usually two independent records, but here neither is used without the other — split or keep as
one?" A question naming the actual fork, not a status update disguised as a question.

## Language

Everything this skill writes — README, spec, new `[device::*]` records, every label rendered into a
page — is English (principle 13). After any edit on the picture side, re-run `capture.mjs`; a
translated page shipping with a stale, still-Russian PNG is a real, previously-hit bug in this
repository, not a hypothetical one.

## Verified-not-assumed discipline

Every claim this skill's output makes — the terms matching OEIS, a device being genuinely
uncatalogued, an anchor resolving, a source being encyclopedic, a runtime — is checked live in the
current session. Re-asserting an earlier session's claim without re-running the check is exactly
the mistake `specs/tasks.md`'s MUST-status-is-evidence exists to prevent, and this repository has
made it about the reference repository itself: two files were cited by name as the model for its
own verification split, and neither exists upstream. Anything said about another repository is
checked against a fresh clone, and the result recorded in `memory-bank/upstream.md`.
