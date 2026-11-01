# Integridad de datos: patrones AI, piezas y encogimientos

## Propósito

Este documento registra cómo funciona la lectura de patrones de Illustrator (.AI), cómo se asignan las piezas a cada Placement y cómo se conserva esa información al guardar y volver a abrir una Spec.

Su objetivo es evitar regresiones: si en el futuro desaparece parte de esta mecánica, debe ser posible identificar qué archivos, datos y conexiones de interfaz revisar antes de reescribir funcionalidades que ya estaban resueltas.

**Estado validado por el usuario:** carga de Excel/SWO y carga de patrón .AI, detección de piezas, asignación desde el catálogo y recuperación de la Spec guardada. En la última validación comunicada, todo funcionó correctamente hasta ese punto.

## 1. Flujo funcional aprobado

1. Se carga el Excel/SWO y se obtiene la información general de la Spec.
2. Se carga el archivo de patrón .AI.
3. El lector analiza el archivo y extrae las piezas y los encogimientos que pueda identificar.
4. El resultado se guarda como catálogo general de piezas disponibles.
5. Cada Placement tiene su propio selector de piezas.
6. El selector puede sugerir una pieza según el nombre del Placement, pero la sugerencia no es una asignación automática definitiva.
7. El usuario puede elegir manualmente cualquier pieza del catálogo y pulsar **Asignar pieza**.
8. La pieza y su encogimiento se guardan dentro del Placement correspondiente.
9. Al guardar y volver a abrir la Spec, deben recuperarse tanto el catálogo general como las asignaciones individuales.

La asignación manual es importante: una pieza que no se relacione automáticamente con FRONT, BACK, SLEEVE u otro Placement debe seguir estando disponible para selección manual, siempre que el lector la haya incluido en el catálogo.

## 2. Dónde vive cada dato

Hay dos niveles de información y no deben confundirse.

### Catálogo general del patrón

Se conserva en `Store.state.generalData`:

- `availablePatternPieces`: lista de todas las piezas extraídas del patrón cargado, con sus metadatos y encogimientos disponibles.
- `exportedPatternName`: nombre del archivo de patrón cargado.
- `patternPieces`: campo heredado de versiones anteriores. La integración actual limpia este campo al cargar un patrón nuevo; las nuevas asignaciones se hacen por Placement.

El catálogo es compartido por todos los Placements de esa Spec. No se debe duplicar el catálogo completo dentro de cada Placement.

### Piezas asignadas

Se conservan dentro de cada objeto de `Store.state.placements`:

- `patternPieces`: piezas seleccionadas para ese Placement.
- `patternPieceSelection`: índice/selección actual del selector de ese Placement; es estado de interfaz, no una asignación confirmada.

Cada elemento de `patternPieces` se copia desde el catálogo disponible. Así la asignación conserva el nombre, el encogimiento y los demás metadatos de la pieza aunque el selector cambie después.

**Regla de integridad:** el catálogo general responde a «¿qué piezas encontró el patrón?»; `placement.patternPieces` responde a «¿qué piezas corresponden a este Placement?».

## 3. Archivos y responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `features/ai-pattern-piece-shrinkage.js` | Analizar el archivo .AI y extraer nombres de piezas y datos de encogimiento. |
| `features/spec-pattern-metadata.js` | Mantener el catálogo, poblar selectores, sugerir piezas, asignar/quitar piezas y mostrar sus encogimientos. |
| `app.js` | Crear el HTML de cada Placement, incorporar los campos de piezas y encogimientos, guardar y reconstruir los datos de la Spec. |
| `modules/spec-data-model.js` | Construir los datos serializables desde el Store. |
| `modules/spec-normalizer.js` | Normalizar Placements sin descartar propiedades adicionales del objeto. |
| `state-manager.js` / Store | Mantener el estado reactivo y el autosave del programa. |

### Contrato entre HTML y lógica de piezas

El módulo `features/spec-pattern-metadata.js` depende de estos elementos en cada Placement:

- Selector: `.placement-pattern-piece-select`
- Identificador del Placement en el selector: `data-placement-id`
- Estado/mensaje: `placement-pattern-status-{placementId}`
- Contenedor de asignaciones: `placement-pattern-pieces-{placementId}`
- Botón de asignación: `data-add-placement-pattern-piece="{placementId}"`
- Botón de eliminación: `data-remove-placement-pattern-piece="{placementId}"`

El HTML se genera desde `renderPlacementHTML(placement)` en `app.js`. Si el módulo de metadatos parece funcionar pero no aparece el selector o la lista dentro de los Placements, comprobar primero que ese HTML siga incluyendo los identificadores y atributos anteriores. No crear una segunda implementación paralela del selector.

## 4. Guardado y recuperación: puntos críticos

### Guardado

`saveCurrentSpec()` llama a `collectData()`, que utiliza `buildSpecData()` en `modules/spec-data-model.js`.

El modelo toma:

- Los datos generales desde `Store.state.generalData`.
- Los Placements desde `Store.state.placements`.

Por tanto, el catálogo `availablePatternPieces` debe estar en `generalData`, y las asignaciones deben estar en cada Placement antes de serializar.

El guardado puede utilizar el backend remoto si `TEGRA_BACKEND_URL` está configurado. Si no está disponible o falla, el código actual utiliza `localStorage` como alternativa. No asumir que una Spec guardada localmente en un navegador ya está sincronizada con otro equipo.

### Normalización al recuperar

`normalizeSpecDataForUi()` y `getSpecGeneralData()` deben conservar `availablePatternPieces` al preparar una Spec para edición.

### Restauración al abrir una Spec

En `loadSpecData(data)` hay dos restauraciones que deben mantenerse:

1. El estado general se reconstruye en `Store.replaceState()`, combinando el estado existente con `getSpecGeneralData(data)`. Esto recupera explícitamente el catálogo del patrón, incluido `availablePatternPieces`.
2. Cada Placement se reconstruye desde `placementData` mediante spread (`...placementData`), conservando `patternPieces`. Luego los Placements reconstruidos se vuelven a sincronizar con el Store.

**Regresión que ya se corrigió:** antes de la corrección, las piezas asignadas podían conservarse dentro de los Placements, pero el catálogo general no se restauraba explícitamente al reabrir una Spec. El usuario podía encontrarse con asignaciones visibles pero sin el catálogo completo para seguir asignando piezas. El commit `11d73a0bf701c0cd86b53a7747753d8db30cb792` agregó la restauración de `generalData` dentro de `loadSpecData()`.

## 5. Comportamiento deliberado al cargar otro patrón

Al analizar un nuevo archivo .AI:

- Se reemplaza `availablePatternPieces` con las piezas del nuevo archivo.
- Se limpia el campo heredado global `patternPieces`.
- Se limpian las asignaciones `patternPieces` de los Placements existentes para evitar mezclar piezas de dos patrones distintos.
- Se vuelven a poblar los selectores y las listas de cada Placement.

Esto es intencional. Si se necesita conservar asignaciones de un patrón anterior, debe definirse primero un flujo explícito de confirmación o migración; no eliminar esta protección silenciosamente.

## 6. Lista de verificación ante una regresión

Si vuelve a ocurrir que «se perdió la inteligencia» o que las piezas/encogimientos desaparecen, revisar en este orden:

1. **¿El archivo .AI se analiza?** Revisar el resultado de `PatternPieceShrinkage.extractFromAiFile(file)` y confirmar que devuelve `result.pieces`.
2. **¿Se actualiza el catálogo?** Confirmar que `Store.state.generalData.availablePatternPieces` contiene el resultado.
3. **¿Existe el selector en cada Placement?** Revisar el HTML generado por `renderPlacementHTML()` y los selectores/atributos del contrato de interfaz.
4. **¿Se asigna realmente la pieza?** Confirmar que `placement.patternPieces` aumenta al pulsar **Asignar pieza**. Elegir una opción no equivale a asignarla.
5. **¿El Store conserva el cambio?** Revisar `Store.state.placements` y `Store.state.generalData` antes de guardar.
6. **¿El modelo serializa ambos niveles?** Revisar `buildSpecData()`: catálogo general y Placements deben formar parte del objeto guardado.
7. **¿El registro guardado contiene ambos niveles?** Inspeccionar el JSON de la Spec, sin modificarlo.
8. **¿La normalización conserva los campos?** Revisar `getSpecGeneralData()`, `normalizeSpecDataForUi()` y `SpecNormalizer.normalizePlacement()`.
9. **¿La recuperación reconstruye ambos niveles?** Revisar `loadSpecData()`, especialmente `generalData` en `Store.replaceState()` y el spread de `placementData`.
10. **¿La interfaz se vuelve a dibujar?** Confirmar que se llama a `renderPlacementHTML()` y que el módulo de metadatos vuelve a poblar selectores y asignaciones.

No corregir una falla visual cambiando primero el parser: aislar si el problema está en extracción, estado, serialización, restauración o renderizado.

## 7. Prueba de regresión manual obligatoria

Después de tocar cualquiera de los archivos anteriores:

- [ ] Cargar un Excel/SWO real.
- [ ] Cargar un patrón .AI real.
- [ ] Confirmar que el catálogo general muestra las piezas detectadas.
- [ ] Confirmar que las piezas con encogimiento muestran ese dato.
- [ ] Confirmar que se puede seleccionar manualmente una pieza que no fue sugerida para el Placement.
- [ ] Asignar piezas distintas a FRONT, BACK y al menos otro Placement.
- [ ] Guardar la Spec.
- [ ] Cerrar o salir del editor y volver a abrir la Spec guardada.
- [ ] Confirmar que el catálogo completo sigue disponible.
- [ ] Confirmar que cada Placement conserva sus propias piezas y encogimientos.
- [ ] Asignar una pieza adicional después de recuperar la Spec.
- [ ] Guardar otra vez y comprobar que no se pierden los datos.

La validación debe hacerse con un archivo real; una prueba que solo comprueba que el HTML aparece no demuestra que el ciclo de guardado y recuperación funcione.

## 8. Límites y reglas que no deben romperse

- No modificar el renderer de la Spec ni el exportador HTML/PDF como parte de esta mecánica.
- No alterar las reglas de duplicación de colores en la secuencia de producción. La duplicación existente es deliberada y correcta.
- No confundir el catálogo del patrón con las piezas asignadas a un Placement.
- No convertir una sugerencia automática en una asignación definitiva sin acción del usuario.
- No borrar `availablePatternPieces` al normalizar o recuperar una Spec.
- No reemplazar el objeto completo de un Placement con una versión parcial que omita `patternPieces`.
- No modificar el lector .AI para resolver un problema que realmente esté en el HTML, el Store o el guardado.
- Mantener los cambios acotados y en la rama de trabajo autorizada. No integrar en `main` ni fusionar el PR sin autorización expresa.

## 9. Cambios relacionados registrados

- `aaead5947d67a113cb3b6e372672fac303dd8e77` — Restore per-placement pattern shrinkage assignment UI.
- `11d73a0bf701c0cd86b53a7747753d8db30cb792` — Restore pattern catalog when reopening saved specs.
- `070a7b9ba8312a1b7e67269e12a7da05672308b6` — Hide print-only duplicates in sequence editor (cambio visual separado; no modifica la lógica de duplicación).

Este documento describe el comportamiento actual validado y los puntos de integración conocidos. Si cambia la arquitectura de estado o el formato de almacenamiento, actualizarlo junto con el código y la prueba de regresión.
