---
status: draft
app: oeis
tags: [oeis, approaches, explanation, draft]
---

# Explanation device: requirements on the IDEA

## Layer

This is the **base layer** of the catalog. It knows nothing about anything above it: no pictures,
no rendering, no sequences. Layers above may reference it, and it references none of them — that
direction is fixed and one-way:

```
sequences (sequences/A{NNNNNN}/README.md)  →  pictures (specs/visualizations.md)  →  ideas (this spec)
```

A rule about the relationship between an idea and its picture therefore does NOT live here — it
lives in the dependent layer, which is the one allowed to know both sides. This spec must be
readable and applicable on its own, with no other spec open.

Adapted from [Hedgehogues/project-euler](https://github.com/Hedgehogues/project-euler)'s own
`specs/approaches.md`, which this repository's `.claude/rules/visualization-principles.md`
credits directly as its template. The layering, the RFC shape and the MUST-vocabulary are kept
identical on purpose — this catalog's `device` records are a smaller unit than that repository's
`method` records (see `_terms.md`'s header for the exact difference), which is the one substantive
change; everything else about how a dictionary entry earns its place transfers unchanged.

## Vision
When explaining what an OEIS sequence counts and why it behaves the way it does, name the diagram
device behind each picture rather than redrawing an improvised one each time — so the same device
is recognized on sight the next time a similar argument is needed. The catalog grows as sequences
are worked through, but holds no sequence and no link to one: only the bare devices, like a
textbook of diagram conventions.

## Terms
MUST/MUST NOT/SHALL/SHOULD/SHOULD NOT/MAY as in RFC 2119. Terms live in `_terms.md`, context
`device`: [device::MarkedAsymmetry](../_terms.md#devicemarkedasymmetry),
[device::CayleyTable](../_terms.md#devicecayleytable),
[device::SelfCancelDiagonal](../_terms.md#deviceselfcanceldiagonal),
[device::MergedResultStrip](../_terms.md#devicemergedresultstrip),
[device::StateMap](../_terms.md#devicestatemap),
[device::OrbitRing](../_terms.md#deviceorbitring),
[device::DivisorChips](../_terms.md#devicedivisorchips),
[device::IncidenceMatrixPair](../_terms.md#deviceincidencematrixpair),
[device::LogGrowthChart](../_terms.md#deviceloggrowthchart),
[device::UnrealizedPlaceholder](../_terms.md#deviceunrealizedplaceholder),
[device::MiniRecap](../_terms.md#deviceminirecap),
[device::CombinationFork](../_terms.md#devicecombinationfork),
[device::RunLengthEncoding](../_terms.md#devicerunlengthencoding),
[device::FixedPointOverlay](../_terms.md#devicefixedpointoverlay),
[device::FundamentalDomainPlot](../_terms.md#devicefundamentaldomainplot),
[device::DivisorPairFan](../_terms.md#devicedivisorpairfan),
[device::NonClosingTable](../_terms.md#devicenonclosingtable),
[device::NonConvergingTrace](../_terms.md#devicenonconvergingtrace),
[device::FractionalPartHistogram](../_terms.md#devicefractionalparthistogram),
[device::RepresentationGrid](../_terms.md#devicerepresentationgrid),
[device::BurnsideFixedPointTable](../_terms.md#deviceburnsidefixedpointtable).

## Scope
**In scope:** the idea fields of `[device::*]` records — `Essence`, `Recognized by`,
`General case`, `Source`, and the part of `Limits` that bounds the idea itself; the discipline for
adding new records.

**Out of scope:** anything belonging to a layer above — how a device is drawn, how a page renders
it, which sequence used it.

## Findings this is built on
This dictionary's first version was written in one pass rather than accreted over many corrected
rounds (unlike project-euler's, whose findings span months) — so the findings below are the real
decisions made while writing it, not a long history yet. Future findings accrue here the same way
project-euler's did: named, dated, traced to a requirement.

- **F1** (2026-09-01, decided while drafting `_terms.md`) A project-euler `method` record IS a
  full Problem→Solution narrative; this catalog's records are smaller, reusable diagram components
  assembled together at the page level. Copying the `Sequence:` field (Problem/Transform/Solution
  frames) verbatim would misdescribe every record — a `[device::CayleyTable]` is not itself a
  story with a beginning and an end. Replaced with `Reading order:` (how a first-time viewer's eye
  should move across the device), and the Problem→Solution narrative was relocated to the page
  level, described in each sequence's own README rather than in the dictionary. Traces to:
  MUST-entry-schema (below, adapted).
- **F2** (2026-09-01) Several devices genuinely have no established name — checked, not assumed —
  and are marked `Standard name: — (no established name found)` rather than being given an
  invented-sounding but fake citation. Where the underlying MATHEMATICAL fact is standard even
  though the DIAGRAM convention isn't (e.g. `[device::SelfCancelDiagonal]`'s "an involution is a
  self-inverse element" versus the specific act of highlighting a Cayley table's diagonal for it),
  the record cites the standard math fact and says plainly that the diagram itself is not a named
  technique. Traces to: MUST-source, MUST-canonical-source (below).
- **F3** Every device record's `Picture:` field names the actual file(s) in
  `sequences/A{NNNNNN}/` where it's used — there is no separate `examples/` directory the way
  project-euler's `visualizations/examples/` holds frame code, because there is no static-PNG
  build step to assemble from it (see `specs/visualizations.md`'s Architecture section). This is a
  deliberate style difference, not an omission: the device's code lives inline in the one live page
  that renders it. Traces to: MUST-no-task-specifics (adapted) and `specs/visualizations.md`'s own
  Architecture section.

## Architecture

### Overview (prose)
`[device::*]` records in `memory-bank/_terms.md`, one record per device. The idea fields: Essence
(one plain sentence, no formulas) / Recognized by (the situation that calls for this device) /
General case (not tied to one sequence's specific numbers) / Source (independent evidence the
underlying idea is standard, or an honest statement that no established name exists) / the idea
half of Limits. Not one field about a specific sequence. The catalog grows as sequences are worked
through; reusing a known device does not change this file at all — the sequence links to the
existing record from its own README.

### Bounded Context and Aggregate Root
- `device` — the only context. It has no separate aggregate-root record: the catalog-level
  invariants (schema, sourcing discipline) ARE the requirements below, not a block of their own.
  `_terms.md` holds only the entities — the twenty-one `[device::*]` records themselves.

## Requirements
> Statement — acceptance criterion — status.

### MUST
- Every record MUST carry Essence / Recognized by / General case / Source, and MUST NOT carry a
  field about a specific sequence — **MUST-entry-schema** — criterion: grepping each mandatory
  heading yields as many lines as there are device records (21); there is no `Used in:` field.
  Status: done.
- "Essence" MUST be a single sentence without formulas — **MUST-essence-plain** — criterion: the
  field contains no inline math notation beyond the plain word "n". Status: done.
- "General case" MUST describe the device for arbitrary applicable sequences, and MUST NOT present
  one sequence's specific numbers as if they were the general rule —
  **MUST-general-case** — criterion: no `General case` field names a specific OEIS number (A100001,
  A000001) or one page's specific numeric example. Status: done.
- "Recognized by" MUST name the SITUATION that calls for the device (what the argument needs to
  show) rather than a property of the finished picture — **MUST-recognition-trigger** — criterion:
  the field is phrased as a need ("the argument needs to show...", "two things need to be
  contrasted..."), not a description of the drawing itself. Status: done.
- Every record MUST carry its own `Source:` field, honestly stating "no established name found"
  when that's true rather than inventing or stretching a citation — **MUST-source** — criterion:
  `grep -c '^Source:'` in `_terms.md` equals the number of device records (21). Status: done (21 of
  21; 15 honestly cite no established name for the diagram itself, some still sourcing the
  underlying math concept where one exists).
- Where a `Source:` field cites a URL, it MUST be encyclopedic (Wikipedia or an equivalent
  reference work) and MUST resolve over the network — **MUST-canonical-source** /
  **MUST-source-resolves** — criterion: every cited URL returns HTTP 200; verified live on
  2026-09-01 (`Cayley_table`, `Involution_(mathematics)`, `Group_theory#Group_actions`,
  `Cyclic_permutation`, `Divisor`, `Incidence_matrix`, `Configuration_(geometry)`,
  `Logarithmic_scale`, `Run-length_encoding`, `Kolakoski_sequence`, `Morphic_word` — all 200) and
  again on 2026-09-02 (`Fundamental_domain`, `Modular_group`, `Dirichlet_convolution`,
  `Closure_(mathematics)`, `Dirichlet_hyperbola_method`, Encyclopedia of Mathematics'
  `Dirichlet_convolution`, `Run_chart`, `Law_of_large_numbers`, `Histogram`,
  `Equidistribution_theorem`, `Benford%27s_law`, `Quadratic_form` — all 200) and again on
  2026-09-02 (`Burnside%27s_lemma`, `Necklace_(combinatorics)` — both 200). Status: done.
- The catalog — `_terms.md`'s `[device::*]` records — MUST NOT hold ANYTHING about a specific
  sequence — no OEIS number, no specific numeric example, not even a "used in" backlink —
  **MUST-no-task-specifics** — criterion: `_terms.md` contains no `[A{NNNNNN}::*]` records and no
  `Used in:` field naming a sequence; the `Picture:`/`Example:` fields name FILES, which is a
  location, not a reverse-dependency claim about the sequence's own content. Status: done.
- Reusing a known device on a new sequence MUST NOT change this layer —
  **MUST-reuse-changes-nothing** — criterion: adding a sequence whose page uses only already-
  catalogued devices requires no edit to `_terms.md`; the link appears only in
  `sequences/A{NNNNNN}/README.md`. Status: done — A000004, A000007, A000012 and A000027 each link to
  devices A000005's page already introduced (`DivisorPairFan`, `NonClosingTable`,
  `FixedPointOverlay`, `MiniRecap`, `DivisorChips`) with no page of their own, and A000021 and
  A000024 likewise link to `RepresentationGrid` and `LogGrowthChart` from A000018's page; `_terms.md`
  was confirmed unchanged across all six (diffed, not assumed) — the full acceptance bar this line
  used to call untested.
- This spec MUST NOT reference any layer above it — **MUST-no-upward-reference** — criterion: it
  contains no link to `visualizations.md` and no requirement whose subject is a picture, a
  rendering step or a sequence. Status: done.

### SHOULD
- A device's name SHOULD be the commonly accepted one where one exists, verified by search rather
  than assumed — **SHOULD-standard-name**. Status: done for the six devices with a real standard
  name (`CayleyTable`, `LogGrowthChart`, `RunLengthEncoding`, `FundamentalDomainPlot`,
  `FractionalPartHistogram`, `BurnsideFixedPointTable`); honestly marked absent for the other
  fifteen.

## Links
- Records this spec governs: the `[device::*]` blocks in `memory-bank/_terms.md`.
- Rules (short auto-loaded form): `.claude/rules/visualization-principles.md`.
- Template this spec adapts: [Hedgehogues/project-euler — specs/approaches.md](https://github.com/Hedgehogues/project-euler/blob/main/memory-bank/specs/approaches.md).
