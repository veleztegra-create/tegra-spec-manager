# Tegra Color Registry (JSON master)

## Purpose

The shared JSON registry is the canonical source for color identity and metadata across ink and garment-color recognition. ACB remains an Illustrator color-book interchange format and is not used to store production classifications.

## Record format

Each color record contains:

- `id`: stable internal identifier
- `name`: canonical display name
- `code`: optional team/customer/style code (for example `N042`)
- `aliases[]`: alternate names and search terms
- `hex` and `rgb`: color values
- `classifications.underbase`: `yes | no | unknown`
- `classifications.fabricTone`: `light | dark | unknown`
- `tags[]`, `source`, `updatedAt`

Example:

```json
{
  "format": "TEGRA-COLOR-REGISTRY",
  "version": 1,
  "colors": [
    {
      "id": "clr-notre-dame-white-ffffff",
      "name": "Notre Dame White",
      "code": "N042",
      "aliases": ["ND White"],
      "hex": "#FFFFFF",
      "rgb": { "r": 255, "g": 255, "b": 255 },
      "classifications": {
        "underbase": "yes",
        "fabricTone": "light"
      },
      "tags": ["ink", "garment"],
      "source": "manual"
    }
  ]
}
```

## Safety behavior

- Exact name/code/alias lookup is preferred over partial lookup.
- Duplicate HEX swatches are merged; alternate names become aliases rather than silently replacing the canonical name.
- Underbase and fabric-tone metadata are independent. One does not imply the other.
- Missing classification is stored as `unknown`; the registry does not infer a production rule from HEX.
- A registry mutation refreshes the existing `ColorConfig` resolver.
- Registry persistence is browser-local (localStorage). Use JSON export/import to move the registry between computers.

## Current scope

This commit establishes the shared data model and lookup bridge. The UI for the “color not found → add → return to same spec field” workflow is a separate integration step. Existing ink/garment form behavior and production rules have not been changed here.
