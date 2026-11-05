# Shared color registry UI — implementation notes

## Missing garment colorway
1. Enter a garment colorway code/name in the Spec Creator.
2. If the resolver cannot recognize it, the recognition note offers **Agregar color**.
3. The dialog asks for canonical name, code, HEX, aliases, Underbase and Fabric Tone.
4. Save adds/merges the color in the JSON registry and refreshes the existing ColorConfig lookup. The current Spec inputs remain intact.
5. Explicit Fabric Tone values (`light`/`dark`) are honored by `RulesEngine.esTelaOscura()` before its legacy classification rules.

## Missing ink color
- Each COLOR/METALLIC placement color row has a plus button next to its ACB picker.
- The dialog captures name/code/HEX/aliases and independent classifications.
- Saving updates the existing placement color name, swatch metadata, and preview.
- It does not automatically change screen sequence or add White Base/Blocker.
- User may separately confirm adding the swatch to the active ACB library.

## Registry transfer
The ACB Library tab now includes:
- Export master registry to `Tegra-Color-Registry.json`
- Import a JSON registry, GFSEXTR palette, or GFSEXTR backup in merge mode
- Existing catalog records are not deleted during import

## Classification safeguards
- Underbase: `yes | no | unknown`
- Fabric tone: `light | dark | unknown`
- Unknown classifications remain unknown. HEX is not used to guess either production classification.
- Fabric tone is a deliberate override only when explicitly set in the shared registry.

## Test checklist (browser)
1. Open Spec Creator and enter an unknown garment code, e.g. `N042`.
2. Click **Agregar color**, fill name and HEX, set Fabric Tone LIGHT, save.
3. Confirm the current Colorway field remains unchanged and recognition shows the HEX/tone.
4. Verify the corresponding sequence decision uses the explicit fabric tone.
5. Add a COLOR placement, type a missing ink name, click the plus button, save.
6. Verify placement color value and preview update without losing the placement.
7. In ACB Library, export the JSON and import it back using merge. Confirm no duplicate HEX swatches are created.
8. Confirm that the ACB sync option is only invoked after the user accepts.

This branch has JavaScript syntax and isolated registry/rules tests; browser/UI behavior still needs manual verification.
