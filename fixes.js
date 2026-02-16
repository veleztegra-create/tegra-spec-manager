/**
 * fixes.js - Operacion 'Aceptar el Relevo' (v3 - FINAL)
 * Este script intercepta la llamada de generacion de PDF, acepta los datos pasados
 * como argumento y los redirige al nuevo motor de plantillas.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("[Fixes.js] Operacion 'Aceptar el Relevo' iniciada.");

    setTimeout(() => {
        if (typeof window.generateProfessionalPDF !== 'function') {
            console.error("[Fixes.js] FRACASO CRITICO: El nuevo motor (generateProfessionalPDF) no esta disponible. La operacion no puede continuar.");
            return;
        }

        if (typeof window.generatePDFBlob !== 'function') {
            console.error("[Fixes.js] ADVERTENCIA: La funcion objetivo (generatePDFBlob) no existe. La intercepcion puede no ser necesaria.");
            return;
        }

        console.log("[Fixes.js] Objetivo localizado. Procediendo con el relevo...");

        // Tomar control, asegurando que aceptamos los argumentos que la aplicacion original nos pasa.
        window.generatePDFBlob = async function(data) { // <-- LA CORRECCION CLAVE
            console.log("[Fixes.js] ¡INTERCEPCION EXITOSA! Llamada desviada.");
            
            try {
                // La funcion original ya nos provee los datos; no necesitamos recolectarlos.
                if (!data) {
                    throw new Error("El interceptor no recibio datos validos desde la aplicacion principal.");
                }
                console.log("[Fixes.js] Datos recibidos correctamente por el interceptor.");

                // Llamar a nuestro nuevo y superior motor de PDF con los datos recibidos.
                const pdfBlob = await window.generateProfessionalPDF(data);
                console.log("[Fixes.js] Relevo completado. El nuevo motor ha generado el PDF.");
                
                // Devolver el resultado, completando la operacion.
                return pdfBlob;

            } catch (error) {
                console.error("[Fixes.js] ERROR DURANTE LA OPERACION DE RELEVO: ", error);
                throw error; // Lanzar el error para que la aplicacion principal lo maneje
            }
        };

        console.log("[Fixes.js] ✅ RELEVO ACEPTADO. El control ha sido transferido al nuevo motor de PDF.");

    }, 0); // El timeout de 0 asegura que esto se ejecute en el proximo ciclo de eventos.
});
