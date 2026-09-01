# Comparison against the reference repository

Most of this repository's structure is adapted from
[Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler). For a long time that was
asserted rather than checked, and it cost three rounds of correction: the layout was "by analogy"
in intent while the pictures sat in the wrong tree, and two files were cited by name
(`oracle.cpp`, `xcheck.cpp`) that the reference does not contain. This file exists so the claim
rests on a comparison that was actually performed.

**Compared:** 2026-09-01, against `main` cloned fresh that day.
**How to redo it:** clone the reference, then diff the two file listings —

```
git clone --depth 1 git@github.com:Hedgehogues/project-euler.git /tmp/pe && \
  (cd /tmp/pe && git ls-files) && git ls-files
```

Anything below that stops matching is either a change to make here or a line to correct here.
Every "adapted from project-euler" sentence elsewhere in this repository refers to a row of this
table.

## What corresponds to what

| project-euler | here | |
|---|---|---|
| `problems/euler{NNN}/README.md` | `sequences/A{NNNNNN}/README.md` | same section order: statement · Approach (with the `Status:` line naming the real check) · The ideas behind it · Build & run |
| `problems/euler{NNN}/solution.cpp` | `sequences/A{NNNNNN}/solution.mjs` | one file per task that computes the answer |
| — | `sequences/A{NNNNNN}/proof.mjs` | **added**, see below |
| `memory-bank/_terms.md` | `memory-bank/_terms.md` | same record shape; `[method::*]` → `[device::*]` |
| `memory-bank/index.md` | `memory-bank/index.md` | same role |
| `memory-bank/specs/approaches.md` | `memory-bank/specs/approaches.md` | requirements on the idea |
| `memory-bank/specs/visualizations.md` | `memory-bank/specs/visualizations.md` | requirements on the picture |
| `memory-bank/specs/tasks.md` | `memory-bank/specs/tasks.md` | the format governing the applied specs |
| `memory-bank/specs/tasks/euler{NNN}.md` | `memory-bank/specs/tasks/A{NNNNNN}.md` | one applied spec per task |
| `memory-bank/visualizations/` | `memory-bank/visualizations/` | every visual artifact, in the memory bank; a task's own folder holds none |
| `memory-bank/visualizations/build/*.png` | `memory-bank/visualizations/A{NNNNNN}/screenshots/*.png` | the committed pictures |
| `memory-bank/visualizations/qr-repo.svg` | `memory-bank/visualizations/qr-repo.svg` | the repo QR every page carries |
| `memory-bank/visualizations/build.sh` | `memory-bank/visualizations/capture.mjs` | produces the committed pictures — different mechanism, see below |
| `memory-bank/visualizations/skeleton.html` + `examples/` | `memory-bank/visualizations/A{NNNNNN}/viz.html` | **differs**, see below |
| — | `memory-bank/verify/*.mjs` | **added**, see below |
| `.claude/rules/visualization-principles.md` | same path | same role |
| `.claude/skills/document-problem/` | `.claude/skills/document-sequence/` + `.claude/skills/explain-sequence/` | **one skill upstream, two here**, see below |
| `README.md` | `README.md` | intro · Build & run · table of tasks with a Status column · where the write-ups live |

## Where it deliberately differs, and why

**Live pages instead of a shared shell.** There, a method's picture is assembled by `build.sh` from
`skeleton.html` plus `examples/<slug>.{css,html,js}` and rendered to a static PNG; the PNG is the
artifact. Here the page itself is the artifact — it is opened, hovered, and rebuilds its diagrams
at load time from the numbers being explained — so there is no shell to assemble into and no build
step. `capture.mjs` takes snapshots FROM the live page purely because GitHub cannot preview an
`.html` file inline. Consequence: one page per sequence carrying several devices, rather than one
page per device. Stated in `specs/visualizations.md`'s Architecture section.

**The cross-check is committed.** There, a solution's independent verification is described in the
task spec's `Status:` line — "verified against a fresh, differently-implemented computation" — and
that description is the record; the check itself is not kept. There it can be: the answer is a
number, and the judge is HackerRank. Here the answer is a structure and there is no judge, so the
comparison ships as `proof.mjs`, written independently of the routine it judges, and is the one
file allowed to consult the published terms.

**`memory-bank/verify/` has no counterpart.** Same reason, one level up: a page here draws
mathematical claims (a multiplication table's associativity, a device record's picture, a QR that
must decode) which nothing external ever checks. These scripts check them, and a spec's
`Status: done` cites a real run rather than a memory of one.

**One skill upstream, two here.** `document-problem` there covers both halves of the job because
the picture is a small static frame built from a template: designing it and writing it up are the
same sitting. Here the picture is a whole interactive page that goes through many rounds before it
settles, and the write-up is worth nothing until it has. `explain-sequence` owns the page;
`document-sequence` — a step-for-step adaptation of `document-problem` — owns the README, the spec
and the device records, and runs `verify/all.mjs` as its last step. Each artifact has exactly one
owner.

**No QR generator is committed.** There, `build.sh` refuses to build without `qr-repo.svg`. Here
there is no build step to refuse, so `verify/pages.mjs` checks the footer exists and is pinned
outside the theme, and `verify/qr.mjs` decodes it from the captured PNG.
