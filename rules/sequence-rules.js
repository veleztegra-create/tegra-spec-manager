// =====================================================
// sequence-rules.js
// REGLAS DE SECUENCIA — SOLO DATOS, NO LÓGICA
// =====================================================
// Agregar, editar o apagar una regla aquí NO requiere tocar
// el motor (core/rules-engine.js) ni app.js.
//
// Cómo funciona una regla:
//   cuando    -> condiciones (todas deben cumplirse; lo que no pongas = "cualquiera")
//   entonces  -> acciones que modifican la secuencia ya generada
//
// CONDICIONES (todas opcionales):
//   textoContiene : texto (o lista) que debe aparecer en CUALQUIER dato cargado
//                   (Sample Type/Stage, style, nombre, patrón, PO, SWO, etc.)
//   tipoTinta     : ["WATER"] | ["PLASTISOL"] | ["SILICONE"]
//   tela          : "oscura" | "clara"
//   colorTela     : ["BLACK", "NAVY"]      (coincide si el color contiene alguno)
//   cliente       : ["FANATICS"]           (coincide si el cliente contiene alguno)
//   placements    : "todos" (default) | "primero"
//
// ACCIONES:
//   { accion: "insertarEnEstacion", estacion: N, pasos: [...], omitirSiYaExiste: "TIPO" }
//     Inserta los pasos para que el primero quede en la estación N (1 = primera).
//     Lo que estaba desde la estación N en adelante se recorre.
//     Si la secuencia aún no llega a la estación N-1, se completa con FLASH/COOL.
// =====================================================

window.TegraSequenceRules = {
    version: 1,

    ajustes: {
        // Campos que NO se revisan al buscar texto (comentarios libres, listas pesadas, etc.)
        ignorarCampos: [
            "technicalComments", "patternPieces", "availablePatternPieces",
            "auditTrail", "versionHistory", "fieldSources", "sourceConflicts",
            "sequence", "printColors", "images", "image", "imageData", "curing"
        ],
        maxProfundidad: 4,
        maxLargoTexto: 200
    },

    reglas: [
        {
            id: "ppf-hot-head",
            activa: true,
            descripcion: "Trabajo PPF: HOT HEAD con TEFLÓN en la estación 4 (después del primer FLASH/COOL), sin importar color de tela.",
            cuando: {
                textoContiene: "PPF",
                placements: "todos"
            },
            entonces: [
                {
                    accion: "insertarEnEstacion",
                    estacion: 4,
                    omitirSiYaExiste: "HOT_HEAD",
                    pasos: [
                        { tipo: "HOT_HEAD", stationType: "HOT_HEAD", nombre: "HOT HEAD", mesh: "TEFLÓN" },
                        { tipo: "COOL", nombre: "COOL", mesh: "-" }
                    ]
                }
            ]
        }
    ]
};
