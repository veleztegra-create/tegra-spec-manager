# Phase 1 — Data Contract Assessment

**Branch:** `cLabelformulas`

**Baseline inspected:** `a6258254030b2035210a60e8bd76691500263f9b`
**Scope:** assessment and contract documentation only. No production rules, migration, renderer redesign, or UI change is included.

## A. Current Data Model

```text
CURRENT SPEC (Store / buildSpecData)
├── generalData
│   ├── customer
│   ├── style
│   ├── colorway
│   ├── season, po, nameTeam, program, specDate
│   └── additional UI fields (fabric, designer, etc. outside Store defaults)
├── placements[]
│   ├── id, type, name, placementDetails, dimensions
│   ├── colors[]
│   │   └── currently mixed: COLOR/METALLIC design inks and generated
│   │       WHITE_BASE/BLOCKER production layers
│   ├── sequence[]
│   │   └── production steps: BLOCKER, WHITE_BASE, COLOR, FLASH, COOL
│   ├── temp, time
│   ├── inkType and per-placement print settings
│   └── fabric (optional placement override)
└── savedAt

PERSISTENCE
├── Spec.payloadJson: generalData + placements + meta
└── Placement.colorsJson / Placement.sequenceJson
```

`placement` is currently a UI/production location record, not a SWO line and not a
single print color. The PDF Tech Pack adapter already groups extracted lines by a
translated location before it creates placements. It does not, however, preserve a
separate `designElements[]` collection.

### Store and global authority findings

`Store.state.placements` is the active UI state. `app.js` exposes `window.placements`
as a getter/setter proxy to that Store array, so the normal app and Excel/Tech Pack
paths that use `window.placements` write the same collection. `buildSpecData`, JSON
export, Excel export, autosave, and remote payload construction read Store-derived
placements.

There is nevertheless a second, incompatible legacy model in `main.js`:
`state.placements` is an object keyed by placement id, each entry has `data` and
`colors`, and its legacy PDF reads that model. `main.js` is not loaded by `index.html`.
If it is loaded by another host page, it can diverge completely from Store because it
does not use the `window.placements` bridge. Future authority must be **Store**;
the legacy `StateManager` model must not be connected without an explicit migration.

### Colors and production findings

The Rules Engine accepts `designColors` and creates a full process sequence. The
assistant generation flow then derives `placement.colors` from that sequence and
retains `WHITE_BASE` and `BLOCKER` alongside real colors. Thus `colors` currently
means both “what is printed” and “production screens.” `FLASH` and `COOL` remain in
`sequence` only.

`syncPlacementSequenceWithColors()` can rebuild all non-process sequence entries
from `placement.colors`, then inserts FLASH/COOL between them. Forced calls occur
after color add, reorder, and edits. This can discard repeated-color positions,
distinct mesh/additive values, intended non-adjacent process steps, and any future
production-only step. It is not safe for a sequence to be authoritative while this
reconstruction remains available.

The improved PDF generator independently builds stations from `placement.colors`
and inserts FLASH/COOL itself; it does not consume `placement.sequence`. This is a
second reconstruction path. The in-app station table and Excel exporter do consume
`placement.sequence` when present.

### Layer normalizer findings

`LayerNormalizer` only merges the types requested by the caller (currently
`WHITE_BASE` and `BLOCKER`). Its grouping key is `type|mesh|additives`; it omits
name, position, and purpose. Therefore two distinct base/blocker steps with equal
type, mesh, and additives can merge even when their names or intended roles differ.
`COLOR` has a screen-letter-aware key but is not included in the current merge set.

### Curing, garment color, and provenance findings

Rules Engine base configurations and `getCuringConditions()` use Spanish keys
`temperatura` / `tiempo`. The active app writes `curing.temp` / `curing.time` into
per-placement `temp` / `time`; this yields `undefined` for Rules Engine results.
The UI presets and PDF consume `temp` / `time`. Curing is per-placement metadata,
independent of the sequence array, but has no Spec-level `curing` object.

The active garment-color input is `generalData.colorway` / `#colorway`; the Rules
Engine passes it as `garmentColor`. `#fabric` / `generalData.fabric` is a distinct
fabric/composition field, optionally overridden by `placement.fabric` for PDF and
additive logic. The code has no explicit colorway-versus-fabric precedence rule:
the color-recognition UI chooses the first non-empty `fabric || colorway`, while the
Rules Engine generation path uses colorway only.

No Spec or Placement provenance model exists. `meta.source`, remote/local source
labels, palette extraction source, and additive-rule source describe transport or
rule outcomes, not origin/conflict provenance for Spec fields. Provenance is a
future capability.

## B. Target Data Contract

```text
TARGET SPEC
├── style
├── customer
├── garment
│   └── garmentColor
├── placements[]
│   ├── placement identity
│   ├── designElements[]
│   ├── printColors[]        # what is printed; no process ordering
│   └── sequence[]           # how it is manufactured; authoritative when present
├── curing                   # independent of sequence
└── provenance               # future capability
```

### Contract invariants

1. `printColors` and `sequence` are separate collections and must not be aliases or
   reconstructed from one another.
2. `sequence` may contain repeated references to one print color with different
   meshes, additives, names, positions, or process conditions.
3. Production-only steps (for example FLASH and COOL) belong only in `sequence`.
4. Rules Engine is the producer of generated production sequences. Renderers consume
   an existing `placement.sequence`; they must not invent a process sequence from
   print colors.
5. Curing is available in the final Spec but remains independent metadata, not an
   inferred sequence step.
6. Placement is a print location/container and may contain multiple design elements;
   it is not defined as one SWO line or one color.

### C. Gap Analysis

| Area | Current | Target | Gap | Risk |
| --- | --- | --- | --- | --- |
| Spec identity | Flat `generalData`; style/customer available | Named style/customer plus garment | Garment object absent | Medium |
| Garment color | `colorway` passed as garment color; fabric separate | `garment.garmentColor` | No canonical field or precedence | High |
| Placement | Location-centric record | Identity plus design elements | `designElements[]` absent | Medium |
| Print colors | `placement.colors` includes design and base/blocker layers | `printColors[]` contains design inks only | Semantic collision | High |
| Production sequence | `placement.sequence` exists | Authoritative manufacturing sequence | Can be rebuilt from colors | High |
| Renderers | PDF generator invents stations from colors | Render sequence only | Independent reconstruction | High |
| Layer normalization | Merges base/blocker by type, mesh, additives | Preserve meaningful distinct steps | Name/position/purpose ignored | Medium |
| Curing | Placement `temp`/`time`; Rules use Spanish names | Separate Spec-visible curing data | Key mismatch and no Spec-level shape | High |
| Provenance | Transport/rule source strings only | Field-level provenance | Not implemented | Medium |
| Persistence | `colorsJson` and `sequenceJson` persist independently | Preserve separate collections | Renaming requires migration/compatibility | High |

### D. Authority Map

| Data | Current authority | Future authority |
| --- | --- | --- |
| Customer | Store `generalData.customer` via data binding; imports also write UI/Store | Store Spec field |
| Garment Color | UNKNOWN: colorway is used by Rules; fabric can win in recognition UI | Canonical `garment.garmentColor` after an approved precedence decision |
| Print Colors | `placement.colors`, UI and assistant generation both write it | Design/SWO/Tech Pack ingestion layer; user edits as approved |
| Production Sequence | Rules Engine generates it, but UI sync and PDF can reconstruct it | Rules Engine → `placement.sequence` |
| Curing | Preset/UI and Rules Engine both generate inconsistent keys | Rules Engine/preset policy stored independently from sequence |
| Placement | Store bridge; Tech Pack adapter and manual UI write it | Store Spec field; future grouping authority UNKNOWN |

## Implementation Decision and Stop Condition

No runtime change is made in this phase. A safe correction cannot be isolated to one
module: separating `colors` into `printColors` requires compatibility behavior in
the Store/UI, Rules Engine handoff, exports/persistence, and PDF renderer at the
same time. Changing only one writer/reader would either lose existing `colorsJson`
data or cause exports/renderers to omit production information. This meets the
specified stop condition for a simultaneous Store + UI + Rules Engine + renderer
change, as well as an import/export compatibility risk.

The documented contract is therefore the controlled Phase 1 deliverable. Do not
rename persisted fields or introduce production rules until the architect approves
the migration and authority decisions below.

## Decisions required from the architect

1. Approve the compatibility/migration strategy from `placement.colors` to
   `placement.printColors` while retaining existing `colorsJson` documents.
2. Decide whether curing is Spec-level, placement-level, or both, and choose one
   canonical field naming convention (`temperature`/`duration` is recommended for
   the target contract; no migration is made here).
3. Define canonical garment color and its precedence relative to colorway and fabric.
4. Approve Store as the sole runtime Spec authority and retire or isolate the legacy
   `main.js`/`StateManager` model.
