/**
 * fixes.js - Operacion 'Relevo Forzoso'
 * Este script intercepta la llamada de generacion de PDF original y la redirige
 * a nuestro nuevo motor basado en plantillas.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("[Fixes.js] Operacion 'Relevo Forzoso' iniciada.");

    // Esperar a que el hilo principal este libre para asegurar que app.js haya terminado de definirse.
    setTimeout(() => {
        // 1. Validar que el motor nuevo y el viejo existan
        if (typeof window.generateProfessionalPDF !== 'function') {
            console.error("[Fixes.js] FRACASO CRITICO: El nuevo motor (generateProfessionalPDF) no esta disponible. La operacion no puede continuar.");
            return;
        }

        if (typeof window.generatePDFBlob !== 'function') {
            console.error("[Fixes.js] ADVERTENCIA: La funcion objetivo (generatePDFBlob) no existe. Puede que ya no sea necesaria la intercepcion.");
            return;
        }

        console.log("[Fixes.js] Objetivo localizado. El motor nuevo esta listo. Procediendo con el relevo...");

        // 2. Guardar una referencia a la funcion original (si la necesitaramos como fallback)
        const oldGeneratePDFBlob = window.generatePDFBlob;

        // 3. Tomar control. Sobrescribir la funcion original.
        window.generatePDFBlob = async function() {
            console.log("[Fixes.js] ¡INTERCEPCION EXITOSA! Llamada a generatePDFBlob desviada.");
            
            try {
                // 4. Recolectar los datos usando la logica existente de la aplicacion
                const data = collectDataForPDF(); // Esta funcion ya existe en app.js
                console.log("[Fixes.js] Datos recolectados para el nuevo motor.");

                // 5. Llamar a nuestro nuevo y superior motor de PDF
                const pdfBlob = await window.generateProfessionalPDF(data);
                console.log("[Fixes.js] Relevo completado. El nuevo motor ha generado el PDF.");
                
                // 6. Devolver el resultado, completando la operacion
                return pdfBlob;

            } catch (error) {
                console.error("[Fixes.js] ERROR DURANTE LA OPERACION DE RELEVO: ", error);
                // Como fallback, podriamos llamar a la funcion original si fuera necesario.
                // return oldGeneratePDFBlob.apply(this, arguments);
                throw error; // Lanzar el error para que la aplicacion principal lo maneje
            }
        };

        console.log("[Fixes.js] ✅ RELEVO FORZOSO COMPLETADO. El control ha sido transferido al nuevo motor de PDF.");

    }, 0); // El timeout de 0 asegura que esto se ejecute en el proximo ciclo de eventos.
});
