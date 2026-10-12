# Phase 2 — Color Library Data Contract

**Status:** Proposal for review; documentation only  
**Target branch:** `codex/phase-2-lifecycle-foundation`  
**Scope:** Define portable data files and invariants for client registries, color palettes, production metadata/rules, and Spec snapshots.  
**Not included:** Runtime implementation, database migration, ACB parser implementation, UI changes, or changes to production rules.

## 1. Purpose

Tegra Spec Manager must support many clients and multiple color libraries per client without requiring source-code edits for routine data maintenance. A user should be able to create, import, validate, save, export, and share library files. The application code should change only for a genuine bug fix or a new capability.

This contract is complementary to `docs/phase-1-data-contract.md`. That document addresses Spec/Placement and production-sequence integrity. This document addresses the separate color-library domain.

## 2. Non-negotiable invariants

1. **Color identity is not a production instruction.** Pantone/name/HEX/RGB identify or display a color. White base, blocker, ink system, mesh, additives, flash/cool, and production sequence are separate production data.
2. **A color is not globally unique by Pantone alone.** The same Pantone or display name may exist in several clients' libraries and may have different production metadata in each context.
3. **Client and palette are separate concepts.** One client may have multiple palettes; a palette has a stable ID and its own version.
4. **ACB is a source, not the complete source of truth.** Importing an ACB may provide names and color values supported by that file. It must not be assumed to contain production metadata such as base requirements, ink type, blocker, or approved exceptions.
5. **Unknown colors remain usable.** A HEX entered in a Spec must display its color swatch even if no library entry matches it. The UI must label it as unregistered rather than silently inventing a Pantone match or production rule.
6. **No silent historical changes.** A saved or approved Spec records a snapshot of the color identity and production decisions used at that time. Editing a library later must not rewrite that Spec.
7. **No heuristic as an approval rule.** RGB brightness, visual similarity, or a sampled image pixel may be offered as a suggestion, but must not silently determine an authoritative white-base/blocker decision.
8. **Portable data files are validated before import.** Invalid files must not partially overwrite a working library.
9. **Stable IDs do not depend on display names.** Renaming a client, palette, or color must not break references.
10. **Existing production rules must be preserved during implementation.** This document does not authorize changing any approved rule or exception.

## 3. Proposed portable files

These are proposed contract filenames, not files confirmed to exist today.

| File | Responsibility |
| --- | --- |
| `customer-registry.json` | Client IDs, display names, and optional aliases |
| `palette.json` | One portable palette, including color identity and palette-specific production metadata |
| `production-rules.json` | Versioned, ordered production rules and explicit exceptions |
| `manifest.json` | Optional package manifest that groups files, declares schema versions, and records source/checksum metadata |
| Original `.ACB` | Preserved source artifact when available; not replaced by derived JSON |
| Spec snapshot | Immutable copy of the resolved color and production data actually used by a saved/approved Spec |

A future UI may package several files in a ZIP for sharing, but each JSON file must also be understandable and independently validateable. No runtime ZIP support is implied by this contract.

## 4. Identity and version rules

- IDs should be stable opaque strings, preferably UUIDs (or an equivalent generated ID). Never derive an ID only from a client name, Pantone, HEX, or palette label.
- Each data file declares a `schemaVersion`. The data records may separately declare a `dataVersion` or revision.
- Each palette has `paletteId`, `customerId`, `name`, and `version`.
- Each color entry has a stable `colorId` within the exported data model. The same color concept may have separate records in separate palettes.
- Store source information where known: source file name, source format, import date, and whether a field was imported, inferred, or manually entered.
- A field that is unknown must be omitted or represented as `null`; it must not be filled with a guessed production value.
- Timestamps use ISO 8601 UTC strings.
- HEX values use the normalized form `#RRGGBB`; RGB is integer channels from 0 through 255. If HEX and RGB are both present, they must agree after normalization or import validation must report a conflict.

## 5. Proposed data shapes

### 5.1 Customer registry

```json
{
  "schemaVersion": 1,
  "kind": "customer-registry",
  "customers": [
    {
      "customerId": "customer-example",
      "name": "Example Client",
      "aliases": [],
      "active": true
    }
  ]
}
```

The example ID is illustrative only. Real IDs must be generated and remain stable. Aliases support matching imported names; they must not silently merge two clients.

### 5.2 Palette

```json
{
  "schemaVersion": 1,
  "kind": "color-palette",
  "paletteId": "palette-example",
  "customerId": "customer-example",
  "name": "Primary Production Palette",
  "version": 1,
  "status": "active",
  "source": {
    "format": "ACB",
    "fileName": "source-palette.acb",
    "importedAt": "2026-01-01T00:00:00Z"
  },
  "colors": [
    {
      "colorId": "color-example",
      "displayName": "PANTONE 186 C",
      "pantone": {
        "code": "186 C",
        "book": "Solid Coated"
      },
      "hex": "#C8102E",
      "rgb": { "r": 200, "g": 16, "b": 46 },
      "metadata": {
        "inkType": null,
        "requiresWhiteBase": null,
        "requiresBlocker": null,
        "isMetallic": null,
        "notes": null
      },
      "fieldProvenance": {
        "displayName": "imported",
        "hex": "imported",
        "rgb": "derived-from-hex",
        "metadata": "unknown"
      }
    }
  ]
}
```

This is a shape example, not a statement that the named Pantone value is an approved Tegra production record. ACB importers should map only data they can reliably read. Unknown metadata remains unknown until a user or approved rule supplies it.

### 5.3 Production rules

```json
{
  "schemaVersion": 1,
  "kind": "production-rules",
  "rulesVersion": 1,
  "rules": [
    {
      "ruleId": "example-rule-id",
      "active": true,
      "priority": 100,
      "when": {
        "customerId": "customer-example",
        "paletteId": "palette-example",
        "colorId": "color-example",
        "inkType": "WATER"
      },
      "then": {
        "requiresWhiteBase": true
      },
      "source": "approved-production-rule",
      "notes": "Illustrative example; not an approved production rule."
    }
  ]
}
```

This example illustrates the file structure only. It must not be loaded as a real rule. Rule evaluation precedence, conflict handling, and the supported condition vocabulary must be finalized against the existing Rules Engine before implementation.

Production rule results should retain the matching `ruleId`, rules version, and whether the result came from a rule, a manual override, an explicit exception, or an unresolved condition. Explicit per-Spec/placement overrides must be preserved and not silently overwritten by a later library import.

### 5.4 Spec color snapshot

A saved Spec must preserve the resolved values that were actually used, not only references to a mutable library entry. At minimum, each referenced color snapshot should preserve:

- Client ID/name as displayed at the time, palette ID/name/version, and color ID when registered.
- Original user input and resolved display name/Pantone/HEX/RGB when available.
- Registration status at save time: registered, unregistered, or unresolved.
- Effective production metadata used by the Spec: ink type, white-base/blocker decisions, metallic classification, and any relevant production parameters.
- Rule ID and rule-set version used, if a rule determined the value.
- Manual override/exception and its reason/source, if applicable.

The snapshot is historical evidence, not a live pointer. A new Spec may use a newer palette version; an already approved Spec must remain unchanged unless an authorized revision explicitly creates a new version.

## 6. Resolution and precedence

The following is the proposed resolution sequence. The exact precedence must be checked against existing application behavior before code is changed.

1. Preserve the user's raw input.
2. If the input is a valid HEX, immediately display its swatch. This display behavior does not depend on library registration.
3. Search within the selected client/palette context first. Do not select a color from another client merely because its Pantone or HEX matches.
4. If exactly one matching entry is found in the selected context, use its identity data and associated metadata.
5. If several entries match, ask for a selection or report a conflict. Do not choose arbitrarily.
6. If no entry matches but the input is a valid HEX, show the swatch and an **UNREGISTERED COLOR** status. Preserve it in the Spec as an unregistered color snapshot.
7. Apply production rules only when their required context is available. Record the rule/result provenance.
8. If production metadata is unknown or rules conflict, surface that condition for review; do not infer a definitive base/blocker decision from brightness alone.
9. A user-approved explicit override may resolve a case, but the override and its source must be saved with the Spec.

The identity lookup and the production-rule lookup are separate operations. A Pantone match must not itself be treated as proof that a particular base, blocker, or ink is required.

## 7. Duplicate and conflict policy

Import must generate a preview/report before committing changes.

- **Exact duplicate:** same normalized identity values and same metadata in the same palette. Offer skip or merge without creating a duplicate record.
- **Same color identity, different production metadata:** retain the conflict visibly. Do not merge away the difference; client/palette context may make both entries valid.
- **Same Pantone, different HEX:** report a conflict and retain source values for review; do not silently overwrite the existing HEX.
- **Same HEX, different names:** keep both when they represent different named records, or let the user merge explicitly.
- **Duplicate IDs:** reject the import or require explicit remapping; never bind two records to one ID.
- **Unknown customer/palette:** offer to create the missing record only after user confirmation; never silently attach the palette to a similarly named client.
- **Malformed file or unsupported schema version:** reject before modifying current data.
- **Partial failure:** import must be atomic: either all validated changes are committed, or none are.

Normalization may be used for matching (case, whitespace, Pantone prefixes and separators), but original source text should be preserved for audit and display where needed.

## 8. Import, export, editing, and recovery

The future library manager should support:

1. Create a client or palette.
2. Import ACB and supported portable JSON files.
3. Preview parsed records and identify fields that could not be read.
4. Review and edit names, Pantone, HEX/RGB, and production metadata.
5. Resolve duplicates/conflicts explicitly.
6. Save a new palette revision without destroying the previous revision.
7. Export one palette or a shareable package.
8. Re-import an exported file on another machine and restore the same data.
9. Validate file/schema versions and produce an understandable error report.
10. Back up before replacement and provide a recovery/rollback path.

The original ACB file should be retained as a source artifact when practical. Exported JSON should not claim to be an ACB file or preserve unsupported ACB features it cannot represent.

## 9. Relationship to the current repository

The following findings were observed in the inspected branch. They describe the current code, not the target implementation.

| Current area | Observed role | Contract implication |
| --- | --- | --- |
| `config/config-color.js` | Builds a lookup from built-in Pantone values, Config databases, `ColorDatabase`, and `TeamsConfig` | Color sources are currently distributed; migration needs a compatibility layer and a controlled source-of-truth plan |
| `config/config-teams.js` | Contains team/institutional color configuration | Client/team color data should eventually be imported or generated from portable data rather than manually duplicated in code |
| `core/rules-engine.js` | Contains production logic and base configurations | Preserve behavior while separating editable data from executable rule logic |
| `config/additives-rules.js` | Defines rule-based additive resolution with context and overrides | Its concepts should be mapped into the future rule contract before replacing or merging it |
| `config/production-conditions.js` | Stores active production conditions/exceptions in a data-oriented file | Useful precedent for externalizing approved conditions, but it is not yet a complete client/palette library |
| `features/manual-palette-extractor.js` | Samples image pixels, uses OCR, and derives a base suggestion from brightness | It is not an ACB reader or authoritative production-rule engine |
| `PaletteExtraction` / `PaletteColor` in `backend/prisma/schema.prisma` | Store extraction jobs and their extracted colors | They represent extraction results, not a complete persistent, versioned, client-owned palette registry |
| `Spec` / `Placement` in Prisma | Store Spec payload plus placement color/sequence JSON | Historical Spec snapshots and compatibility must be planned before changing persistence |
| `docs/phase-1-data-contract.md` | Documents existing Spec/Placement and sequence integrity risks | Color library work must not bypass or undermine its stop conditions |

The repository also has multiple paths that may currently provide or reconstruct production colors. No field should be renamed, removed, or repurposed until all writers, readers, imports, exports, persistence, and HTML/PDF rendering paths are mapped.

## 10. Migration boundaries

This phase authorizes documentation only. It does **not** authorize:

- Removing the existing built-in color tables.
- Replacing `placement.colors` or changing the existing production sequence model.
- Treating `PaletteExtraction` as the permanent palette library without a migration design.
- Changing white-base/blocker, metallic, ink, additive, mesh, flash/cool, or curing rules.
- Automatically changing old Specs when a palette or rule file changes.
- Claiming ACB import support before testing a real ACB file against the parser.

Before implementation, map each current color source and each consumer. The migration should support reading legacy data while the new registry is introduced, and it must include regression tests for existing Spec creation, imports/exports, production sequences, and HTML/PDF output.

## 11. Acceptance criteria for this contract

The contract is ready to guide implementation when the following are agreed and testable:

- [ ] Multiple clients and multiple palettes per client are supported by stable IDs.
- [ ] The same Pantone can carry different client-specific production metadata without collisions.
- [ ] ACB-derived fields are distinguished from manually maintained production metadata.
- [ ] A valid HEX always displays its swatch, including when unregistered.
- [ ] An unregistered color is not silently assigned a Pantone or production instruction.
- [ ] Unknown/ambiguous metadata remains unresolved until reviewed or covered by an approved rule.
- [ ] Import validation, conflict preview, atomic commit, versioning, export, and rollback are specified.
- [ ] Saved/approved Specs preserve immutable color and production snapshots.
- [ ] Existing rule behavior and Phase 1 sequence-integrity constraints are preserved during migration.
- [ ] A real ACB test file is available and used to verify parsing before the parser is declared reliable.

## 12. Recommended next step

Complete a field-by-field mapping from this proposal to the current repository, then test the ACB reader with a real sample file. After those checks, approve the exact schema and resolution precedence. Only then should implementation begin, in small reviewable changes with tests.

**End of proposal.**
