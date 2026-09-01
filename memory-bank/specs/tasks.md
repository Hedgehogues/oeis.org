---
status: draft
app: oeis
tags: [oeis, tasks, spec-format, draft]
---

# Sequence spec format: requirements on specs/tasks/*.md

## Layer

This is a spec about specs — it governs the FORMAT of `specs/tasks/*.md`, not the truth of any one
file's content (that's checked per-file, against the actual `sequences/A{NNNNNN}/viz.html` and,
where applicable, `memory-bank/verify/*.mjs`). It sits beside [approaches](approaches.md) and
[visualizations](visualizations.md), not inside their `sequences → pictures → ideas` chain: those
two govern the reusable dictionary (`_terms.md`); this one governs a different kind of document —
a fixed, one-time acceptance record for one already-built page. A task spec may reference the
dictionary (to cite the devices it uses) but this spec does not reference `_terms.md` itself; it
only requires that references resolve.

## Vision
Every sequence gets an RFC-style spec: what it claims to show, why the claim is correct, which
catalogued devices it uses. Not reusable knowledge — the dictionary's job — a checked record for
THIS sequence, useful precisely because it never needs to change once written.

## Terms
MUST/MUST NOT/SHALL/SHOULD/SHOULD NOT/MAY as in RFC 2119. Governs every file matching
`memory-bank/specs/tasks/A{NNNNNN}.md`.

## Scope
**In scope:** the section structure of a sequence's task spec, the phrasing of a Requirement, what
a verification `Status:` line must actually name, which paths and device references it must
contain, and the two pieces of code every sequence directory must carry — one that produces the
sequence and one that checks it.

**Out of scope:** the devices catalog itself — see [approaches](approaches.md) (idea quality),
[visualizations](visualizations.md) (picture quality); the sequence's own `README.md` (the prose
write-up — a different document that links to the spec, not a duplicate of it).

## Architecture

### Overview (prose)
One file per sequence, `memory-bank/specs/tasks/A{NNNNNN}.md`, in the same RFC shape as the two
catalog specs (frontmatter, `## Vision`/`## Terms`/`## Scope`/`## Architecture`/`## Requirements`/
`## Links`) — a reader who knows one of the three specs in this folder can read any other without
learning a new format. A task spec references the dictionary; the dictionary never references it
back (the same one-way rule [approaches](approaches.md)'s Layer section states for pictures and
ideas, applied here to sequences).

### Code: two files, two different jobs
Every sequence directory carries a pair, and the split is the point — one file answers the
question, the other refuses to take that answer on trust:

| File | Job | May it consult published terms? |
|---|---|---|
| `sequences/A{NNNNNN}/solution.mjs` | compute `a(n)` from the definition the page draws | no — a lookup table would make the file circular |
| `sequences/A{NNNNNN}/proof.mjs` | re-derive, re-check and witness what the first file returned | yes — that is its whole purpose |

The proof file MUST NOT reuse the search that produced the answer. Re-running the same code twice
proves nothing; a second, deliberately slower routine written from the definition can disagree, and
that is what makes agreement worth anything. What it checks always includes at minimum: every
returned object really satisfies the definition (soundness), no two returned objects are the same
one counted twice (distinctness), nothing that should have been found is missing (completeness,
against an independent construction or an independently published count), and the final counts
match the sequence's own published terms.

This mirrors the `solution.cpp`-plus-oracle split in
[Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler), with one difference:
there the oracle is usually a slow brute force over the same inputs, while here the object being
counted is a structure, so the check also has to verify the STRUCTURE — and, where a claim is an
existence claim ("this configuration is self-dual"), produce the witness and verify it.

## Requirements
> Statement — acceptance criterion — status.

### MUST
- A task spec MUST have exactly six sections, in this order: Vision, Terms, Scope, Architecture,
  Requirements, Links — **MUST-section-shape** — criterion: the `##` headings of a task spec, read
  in order, are exactly this list. Status: done (A100001, A000001).
- Vision MUST state what the sequence actually counts (its OEIS `%N` line, in plain words) and name
  the specific claim the page's picture makes about WHY it behaves that way, not just restate the
  sequence's data — **MUST-vision-names-claim** — criterion: Vision names both the counted object
  and the page's central explanatory claim (e.g. "divisors of n determine which cycle lengths are
  possible"). Status: done.
- Terms MUST list every catalogued device the page uses as
  `[device::Name](../../_terms.md#devicename)`, and every such anchor MUST resolve to a real
  heading in `_terms.md` — **MUST-devices-resolve** — criterion: grepping the anchor against
  `_terms.md`'s `## [device::*]` headings finds a match for each one. Status: done.
- Every Requirement MUST be phrased: statement — a bold `**MUST-id**` — a `criterion:` clause — a
  `Status:` clause — **MUST-requirement-shape** — criterion: each bullet under `### MUST` contains
  all four parts in that order. Status: done.
- Every task spec MUST include one correctness requirement whose `Status:` line names the ACTUAL
  check performed — a live re-run's command and output, or a cited source's exact data checked
  against — never a bare "done" asserted from memory — **MUST-status-is-evidence** — criterion: the
  correctness requirement's `Status:` clause names either a command that was actually executed
  while writing the spec, or the exact OEIS `%S`/`%T`/`%U` terms the page's own numbers were
  checked against. Status: done (A000001 cites `memory-bank/verify/group-tables.mjs`'s live run;
  A100001 cites the exact terms fetched from `oeis.org/search?q=id:A100001&fmt=text`).
- Every task spec MUST include a self-containment requirement naming the page's actual path
  (`sequences/A{NNNNNN}/viz.html`) — **MUST-standard-requirements** — criterion: the requirement is
  present and its file path matches the sequence's real directory. Status: done.
- Links MUST name the page path and the directory README path, both as they actually resolve on
  disk — **MUST-links-resolve** — criterion: both backtick-quoted paths in Links are real files.
  Status: done.
- Every sequence directory MUST contain `solution.mjs`, which computes `a(n)` from the definition
  the page draws and consults no table of published terms, and the task spec MUST have a
  requirement naming it — **MUST-implementation-present** — criterion: `node
  sequences/A{NNNNNN}/solution.mjs` prints terms, and the file contains no array of known answers
  that any computation reads from. Status: done (A000001 `solution.mjs`, A100001 `solution.mjs`).
- Every sequence directory MUST contain `proof.mjs`, which re-checks what `solution.mjs` returned
  using routines written independently of it, and the task spec MUST have a requirement whose
  `Status:` names a real run of it — **MUST-proof-independent** — criterion: `proof.mjs` re-derives
  its own isomorphism/validity tests rather than importing the ones the answer was produced with,
  and checks soundness, distinctness, completeness and agreement with the published terms. Status:
  done (A000001 `proof.mjs`, A100001 `proof.mjs`).
- An implementation's header MUST state the range it was actually measured over and where it stops,
  as measured wall-clock rather than a guess — **MUST-runtime-honest** — criterion: the header names
  the largest `n` that finishes, the time it took, and the first `n` that does not finish, each
  from a run that was executed. Status: done (A000001: n=8 in ~8 s, n=9 unfinished at 4 min;
  A100001: n=12 in ~15 s, n=13 measured separately).
- A task spec MUST NOT introduce a new `[device::*]` catalog entry of its own — if a device used
  isn't catalogued yet, it is added to `_terms.md` first, following
  [approaches](approaches.md)'s own discipline, and only then referenced —
  **MUST-no-new-devices-here** — criterion: a task spec's only mentions of `[device::*]` are links
  into `_terms.md`, never a `##`-level definition. Status: done.

## Links
- Governs: every file in `memory-bank/specs/tasks/`, and the `solution.mjs`/`proof.mjs` pair in
  every sequence directory.
- Sibling meta-specs, which this one does not duplicate: [approaches](approaches.md) (idea
  quality), [visualizations](visualizations.md) (picture quality) — both govern `_terms.md`, not
  task specs.
- Applied instances: `memory-bank/specs/tasks/A100001.md`, `memory-bank/specs/tasks/A000001.md`.
- Template this spec adapts: [Hedgehogues/project-euler — specs/tasks.md](https://github.com/Hedgehogues/project-euler/blob/main/memory-bank/specs/tasks.md).
