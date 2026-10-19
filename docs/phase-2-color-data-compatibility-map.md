# Phase 2 — Current Color Data Compatibility Map

**Status:** Audit document; no runtime changes  
**Branch inspected:** `codex/phase-2-lifecycle-foundation`  
**Purpose:** Map current color-related data paths to the proposed color-library contract before implementation.

Related documents:
- `docs/phase-1-data-contract.md` — Spec/Placement and production sequence integrity.
- `docs/phase-2-color-library-data-contract.md` — proposed portable client/palette/rule contract.

## 1. Executive finding

The repository currently has several overlapping color sources and two different concepts that must not be treated as interchangeable:

1. **Color lookup / appearance** — names and HEX values used to display or find a color.
2. **Production interpretation** — ink recommendations, metallic classification, white base/blocker, additives, mesh, and sequence.

There is a useful start toward data-driven conditions, but there is not yet one persistent, versioned registry that owns client palettes and their production metadata. The existing palette API saves **extraction results**, not a named palette collection with customer ownership and revisions.

This map is a compatibility guide, not approval to remove or rewrite any existing source.

## 2. Current authority and consumers

| Path | Current responsibility | Contract mapping / risk |
| --- | --- | --- |
| `config/config-color.js` | Builds `ColorConfig.db` by merging hardcoded default coated/metallic Pantones, `Config.COLOR_DATABASES`, global `ColorDatabase`, and `TeamsConfig` colors. Provides `findPantoneHex` / `findColorHex`. | Multiple sources can overlap; insertion order can overwrite the same normalized key. Eventually needs a compatibility adapter to the selected client/palette. Do not delete the built-in sources until parity is tested. |
| `config/config.js` | Holds application maps/presets and `COLOR_DATABASES`, including client/system color entries. | Mixed configuration and color data. Candidate for gradual extraction into portable data, with current values preserved. |
| `config/config-teams.js` | Contains NCAA/NBA/NFL team colors and related metadata. | Team colors may need a different namespace/context than a client palette. Do not automatically treat a league/team as the same entity type as a customer. |
| `config/color-database.js` (loaded by `index.html`) | Legacy global color database source. | Another input to the current lookup; must be included in duplicate/conflict inventory. |
| `config/color-database.module.js` | Small module array with name, HEX/RGB, luminance, tone category, and properties such as `recommendedInk`. | Identity and derived suggestions are stored together. The sample set is small and cannot be considered a complete client palette. |
| `config/color-engine.js` | Resolves exact HEX matches or computes a fallback. For unmatched colors it derives tone, `recommendedInk`, and contrast text from luminance. | Its derived ink recommendation is a visual heuristic, not an approved production decision. It should be labelled as a suggestion and must not silently decide production ink/base/blocker. |
| `core/rules-engine.js` | Production configurations, metallic ranges, color recognition, ink-specific bases and curing defaults. | This is executable rule behavior and must remain intact while data is separated. First map every input/output and test the existing rules. |
| `config/additives-rules.js` | Resolves additives from context, placement overrides, explicit rules, and presets. | A rule system already exists; future portable rules must not create a second conflicting precedence model. |
| `config/production-conditions.js` + `modules/production-condition-manager.js` | Defines production conditions in a data-oriented global; local changes persist in browser `localStorage` under `tegra.productionConditions.v1`. | Useful precedent for editable conditions, but localStorage is machine/browser-local and does not itself provide portable, centrally versioned libraries. Export/import and precedence are not established by this contract. |
| `features/manual-palette-extractor.js` | Samples image pixels, OCRs nearby text, and sets `underbase` using a brightness threshold. Exports an array as JSON. | Image extraction is not ACB parsing. The `underbase` result is heuristic and should remain a suggestion requiring confirmation, not authoritative production metadata. |
| `backend/src/routes/palette.js` | GET/POST `/api/palette-extractions`; saves extraction records and their colors. Calls `resolveColor` and includes tone/luminance/suggestion metadata in the extraction payload/response. | Extraction history is not a client-owned palette registry. |
| `backend/prisma/schema.prisma`: `PaletteExtraction`, `PaletteColor` | Stores extraction header and ordered extracted colors, including name, suggested name, HEX/RGB, tone/luminance, OCR text, and manual-correction flag. | No `customerId`, `paletteId`, palette revision/status, Pantone-specific fields, or structured production metadata are represented as first-class fields. `metadataJson` is not a `PaletteColor` column; the route's extra metadata is held in the extraction `payloadJson` and response. |
| `modules/spec-normalizer.js` | Derives `printColors` from legacy `placement.colors` when missing and normalizes curing fields. | Compatibility layer already exists for color separation; do not bypass it or rename legacy data without tests. |
| `modules/spec-data-model.js` / `modules/export-json.js` | Serializes Store state to a Spec JSON file. | Natural future location to preserve color snapshots, but the snapshot shape must be agreed before implementation. |
| `modules/export-excel.js` | Counts printed colors from `placement.printColors` and screens/stations from `placement.sequence`. | Preserve this separation. Do not rebuild the sequence from color identity. |
| `features/pdf-generator-mejorado.js` | Builds the HTML technical sheet and resolves swatch HEX through `ColorConfig.findColorHex` or `Utils.getColorHex`; falls back to gray `#999999`. | Needs a separate registered/unregistered result while retaining valid HEX swatches. A gray fallback must not conceal a valid user-entered HEX. |
| `backend/src/routes/specs.js` / `normalizers.js` | Saves the Spec payload as JSON plus selected general fields and placement colors/sequence JSON. | Snapshot data can fit in `payloadJson` without an immediate relational schema change, but updates replace the payload and placements. Approval/lock immutability is not enforced by these routes today. |

## 3. Important implementation-level observations

### 3.1 Color engine currently computes recommendations

`config/color-engine.js` classifies an unmatched color by luminance and returns `recommendedInk` (`waterbased` or `plastisol`). This is a generic color heuristic. It cannot reliably know client policy, fabric, ink system, garment color, or an approved exception. The new library may preserve this value as a **suggestion** with provenance, but it must not override explicit production rules.

### 3.2 Extraction route is not a palette registry

The API currently exposes `/api/palette-extractions`, with records shaped around extraction time, source, threshold, OCR/color observations, and a list of extracted colors. There is no first-class create/list/update/archive operation for a named customer palette with revision history. A new registry should be additive and distinct from extraction records; existing extraction history should not be reinterpreted or discarded.

### 3.3 HTML swatch resolution loses registration context

The HTML generator currently asks for a HEX by name and falls back to `#999999`. Its helper returns only a HEX, so it cannot tell the renderer whether the color was found in the selected client's library, found in a general lookup table, entered as a valid HEX, or not resolved. The future resolver should return structured status as well as a display HEX, for example:
- `registered`: exact entry in the selected palette context;
- `unregistered-hex`: valid user-entered HEX with no selected-palette entry;
- `unresolved`: no valid HEX and no unambiguous match;
- `ambiguous`: multiple plausible entries.

These labels are proposed semantics; they are not currently implemented.

### 3.4 HEX normalization must not invent black

In `backend/src/routes/normalizers.js`, invalid HEX currently normalizes to `#000000`. That behavior is risky for a color-library import because malformed input can look like a valid black entry. A future palette import validator should reject or explicitly flag invalid HEX rather than silently substitute black. Changing the existing normalizer is outside this documentation-only step and should be tested separately.

### 3.5 Snapshot persistence is not the same as immutability

`Spec.payloadJson` can preserve extra snapshot fields, but the current `PUT /api/specs/:id` endpoint replaces the payload and recreates placements. Therefore storing a snapshot alone does not enforce immutability for approved/locked Specs. The lifecycle/authorization phase must define and enforce who may create a new version versus modify an approved record. Do not solve this by changing palette code in isolation.

## 4. Proposed compatibility boundaries

During the first implementation, prefer adapters over destructive rewrites:

1. **Read adapter:** continue to read existing sources while normalizing their entries into the new color identity shape.
2. **Explicit context:** resolve registered colors only within the selected customer/palette context; keep general Pantone lookup separate from client-specific production metadata.
3. **Separate rule resolver:** resolve production metadata using approved rule logic and explicit overrides, not color brightness.
4. **Structured resolver result:** return HEX plus registration state, source, matched ID, and ambiguity/error information. Keep the HTML renderer dependent on this result rather than embedding production logic in the renderer.
5. **Snapshot writer:** when a Spec is saved, persist the resolved color identity and the effective production decisions, including rule version/source or manual override.
6. **Legacy compatibility:** continue reading old `placement.colors` and current palette-extraction payloads while the new path is introduced. No mass conversion until parity tests pass.
7. **Portable library service:** create/import/validate/review/save/export/version palettes as a distinct concept from OCR/image extraction.

## 5. Dependency and regression test map

Before replacing any color source, test the following paths end-to-end:

- [ ] Existing Pantone and institutional lookups still return the same expected HEX values.
- [ ] Duplicate normalized keys are reported rather than silently shadowed when importing a new palette.
- [ ] Valid user-entered HEX renders its exact swatch even when not registered.
- [ ] Invalid HEX is rejected/flagged; it is not silently converted to black.
- [ ] The same Pantone can resolve to different production metadata in two client/palette contexts.
- [ ] A missing or ambiguous production rule is visible and does not trigger a guessed white-base/blocker.
- [ ] Existing customer/ink rules, metallic ranges, additives, and explicit production conditions remain unchanged.
- [ ] `placement.printColors` remains separate from `placement.sequence`; Flash/Cool and repeated production steps survive.
- [ ] JSON/Excel export and HTML/PDF generation preserve their current data and visual output.
- [ ] A Spec snapshot remains unchanged after a palette revision; approved/locked editing is enforced at the API/lifecycle boundary.
- [ ] Importing a palette on a second machine restores the same IDs, values, metadata, and version.
- [ ] Existing `PaletteExtraction` records remain readable and are not silently converted into named palettes.

## 6. Separate blocker observed on the inspected branch

The inspected `modules/store.js` contains a syntax issue in `DEFAULT_STATE`: a comma is missing after `auditTrail: []` before `fieldSources`. This would prevent the script from parsing as shown. It is a separate defect from the color-library architecture and should be corrected and tested in its own change before relying on the app for end-to-end validation. This audit document does not fix that defect.

## 7. Recommended order of work

1. Correct and test the existing Store syntax blocker separately.
2. Finalize the color-library data contract and this compatibility map.
3. Inspect/verify the ACB reader and run it against a real `.ACB` sample; do not assume the manual image extractor reads ACB.
4. Define a structured color resolver and test HEX/unregistered/ambiguous behavior without changing production rules.
5. Add persistent named client palettes and versioned import/export, preserving extraction history.
6. Add production metadata/rule resolution and snapshot creation.
7. Integrate the UI, HTML/PDF, API, and database only after the adapters and regression tests are in place.

**Boundary:** This document makes no runtime change and does not claim any tests have been executed.
