# Phase 2 — ACB Sample Audit (NIKE.acb)

**Status:** Sample inspected; isolated RGB decoder added; UI/library integration not yet implemented  
**Sample:** `NIKE.acb` supplied with the project context  
**Purpose:** Confirm what the real Adobe Color Book contains and whether it can supply production metadata.

## 1. Result

The sample is a binary Adobe Color Book. Its signature is `8BCB`, version is `1`, book ID is `3000`, and title is `NIKE`. The description field is `GFSEXTR custom RGB color book`.

A format-level inspection of the supplied bytes reads **47 color records**. Each record contains a color name, a six-character code (`C00001` through `C00047` in this sample), and three color component bytes that can be represented as RGB/HEX. The final eight bytes are `spflproc`, identifying the book as process-color rather than spot-color data.

Examples read from the sample:

| Color name | Code | RGB | HEX |
| --- | --- | --- | --- |
| Sunblush 6BC SpSu15 | C00001 | 241, 134, 137 | `#F18689` |
| TEAM ORANGE 89L FAHO08 | C00002 | 237, 83, 36 | `#ED5324` |
| University Red 65N v17 | C00003 | 168, 44, 52 | `#A82C34` |
| Natural 15A | C00046 | 237, 228, 207 | `#EDE4CF` |
| University Gold 76l | C00047 | 242, 174, 45 | `#F2AE2D` |

These values are a binary sample inspection, not a claim that the HEX values are calibrated production targets. RGB/HEX values in a color book are display representations and should not be treated as proof of an ink formulation or an exact physical print match.

## 2. What this ACB does and does not provide

**Available in the sample**
- Color-book metadata: title, description, book ID, page display settings, color model.
- Per-color display name and code.
- Three channel values that can be represented as RGB/HEX.
- Process/spot identifier at the end of the file.

**Not present as structured fields in this sample**
- Client-specific white-base or blocker decisions.
- Ink system assignment such as WATER, PLASTISOL, or SILICONE.
- Mesh, additives, flash/cool, curing parameters, or approved production exceptions.
- A separate Pantone field. Names may contain internal style/color codes, but those should remain names until a mapping is explicitly approved.

Therefore the ACB can seed color identity and appearance fields, but it cannot replace the production metadata/rules library described in `docs/phase-2-color-library-data-contract.md`.

## 3. Decoder status

The inspected branch did not previously contain a dedicated ACB decoder. An isolated decoder has now been added at `modules/acb-reader.js`, with tests in `tests/acb-reader.test.js` and the command `npm run test:acb`.

The decoder currently supports version-1 RGB books only. It deliberately rejects other color models rather than guessing how to convert them. It is not yet loaded into the UI, does not import directly into a saved palette, and does not change production rules. The sample `NIKE.acb` was decoded locally with this implementation and returned 47 entries; the first and last records match the values in the table above. Seven unit tests passed locally against the isolated decoder. Those local results do not establish that the GitHub-hosted test command has run in CI.

## 4. Format reference and assumptions

The binary layout was checked against Adobe's Photoshop file-format documentation and an independent ACB format reference:
- Adobe Photoshop File Formats — Color Books: https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/?from=20421&from_column=20421
- Unofficial Adobe Color Book format specification: https://ates.dev/pages/acb-spec/
- Decoder/encoder implementation reference: https://github.com/atesgoral/acb

The sample's own description explicitly says RGB, and the record values decode consistently as 47 named entries with three components each. The parser implementation must still validate bounds, supported color models, string lengths, color count, and the optional process/spot identifier; it must fail safely on malformed or unsupported files.

## 5. Required tests before integration

- [ ] Reject invalid signature and unsupported version.
- [ ] Read header strings using the file's big-endian length/UTF-16 encoding.
- [ ] Read the declared color count and verify every record fits within the file.
- [ ] Parse the sample as 47 entries and compare first/last records with the table above.
- [ ] Preserve original color name and six-character code.
- [ ] Convert RGB bytes to normalized `#RRGGBB` without guessing production metadata.
- [ ] Preserve book ID, title, description, color model, page size/key, and spot/process identifier.
- [ ] Detect truncated records, impossible counts, invalid string lengths, and unexpected trailing bytes.
- [ ] Keep imported color identity separate from white base, blocker, ink type, and production rules.
- [ ] Confirm import/export round-trip on a second known ACB file before claiming broad ACB compatibility.

## 6. Decision

The sample confirms the feasibility of extracting color identity from ACB. It does **not** justify inferring production rules from the ACB. The next implementation step is to test the decoder through the repository's own `npm run test:acb` command in the project environment, then add broader real-file fixtures (including a non-RGB book) before integrating it through a library import preview. No UI or production-rule changes are included yet.
