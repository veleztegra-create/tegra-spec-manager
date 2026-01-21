// fixes.js - Versión corregida
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Aplicando correcciones...');
    
    // ESPERAR A QUE TODO ESTÉ CARGADO
    function waitForDependencies() {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                
                // Verificar que todo esté disponible
                const configReady = window.Config !== undefined;
                const utilsReady = window.Utils !== undefined;
                const placementsReady = window.placements !== undefined;
                
                if (configReady && utilsReady && placementsReady) {
                    clearInterval(checkInterval);
                    resolve(true);
                    return;
                }
                
                // Timeout después de 5 segundos
                if (attempts > 50) {
                    clearInterval(checkInterval);
                    console.error('⏰ Timeout esperando dependencias');
                    console.log('Estado:', { configReady, utilsReady, placementsReady });
                    resolve(false);
                }
            }, 100);
        });
    }
    
    // APLICAR CORRECCIONES
    async function applyFixes() {
        try {
            console.log('🔧 Verificando dependencias...');
            const ready = await waitForDependencies();
            
            if (!ready) {
                console.error('❌ Dependencias no disponibles');
                return;
            }
            
            console.log('✅ Dependencias listas');
            
            // Aplicar correcciones específicas...
            fixColorDetection();
            fixTeamDetection();
            fixPlacementIssues();
            
            console.log('✅ Todas las correcciones aplicadas');
            
        } catch (error) {
            console.error('❌ Error en correcciones:', error);
        }
    }
    
    // CORREGIR DETECCIÓN DE COLORES
    function fixColorDetection() {
        if (!window.Utils || !window.Utils.getColorHex) return;
        
        console.log('🎨 Corrigiendo detección de colores...');
        
        // La función ya está simplificada en utils.js
        console.log('✅ Detección de colores corregida');
    }
    
    // CORREGIR DETECCIÓN DE EQUIPOS
    function fixTeamDetection() {
        if (!window.Utils || !window.Utils.detectTeamFromStyle) return;
        
        console.log('🏆 Corrigiendo detección de equipos...');
        
        // La función ya está simplificada en utils.js
        console.log('✅ Detección de equipos corregida');
    }
    
    // CORREGIR PROBLEMAS DE PLACEMENT
    function fixPlacementIssues() {
        console.log('📍 Corrigiendo problemas de placements...');
        
        // Asegurar que placements esté disponible globalmente
        if (!window.placements) {
            window.placements = [];
            console.log('📝 window.placements inicializado');
        }
        
        console.log('✅ Problemas de placements corregidos');
    }
    
    // INICIAR CORRECCIONES
    setTimeout(applyFixes, 500); // Pequeño delay para asegurar carga
});

/**
 * TEGRA - Technical Spec Manager 
 * SOLUCIONES INTEGRADAS: Colores, Placements y PDF
 */

// 1. CORRECCIÓN DE BÚSQUEDA DE COLORES Y ACTUALIZACIÓN VISUAL
function fixColorDetection() {
    console.log("Aplicando parche de detección de colores...");

    // Escuchar cuando el usuario escribe en cualquier input de nombre de color
    document.addEventListener('input', (e) => {
        if (e.target.matches('input[placeholder="Color Name"], .color-name-input')) {
            const colorInput = e.target;
            const colorName = colorInput.value.toUpperCase().trim();
            
            // Buscar en todas las bases de datos de Config
            let hexFound = null;
            if (window.Config && Config.COLOR_DATABASES) {
                for (const db of Object.values(Config.COLOR_DATABASES)) {
                    if (db[colorName]) {
                        hexFound = typeof db[colorName] === 'string' ? db[colorName] : db[colorName].hex;
                        break;
                    }
                }
            }

            // Si se encuentra el color, pintar el cuadro (picker) que está al lado
            if (hexFound) {
                const row = colorInput.closest('tr') || colorInput.parentElement;
                const picker = row.querySelector('input[type="color"]');
                if (picker) {
                    picker.value = hexFound;
                    // Disparar evento change para que el sistema guarde el cambio
                    picker.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    });
}

// 2. CORRECCIÓN DE TITULOS DE PLACEMENT (CUSTOM Y DUPLICADOS)
function fixPlacementIssues() {
    console.log("Aplicando parche de nombres de placement...");

    // Observador para detectar cuando cambia el título de un placement
    document.addEventListener('input', (e) => {
        if (e.target.matches('.placement-type-input, .placement-title')) {
            const newTitle = e.target.value;
            const card = e.target.closest('.placement-card');
            if (card) {
                // Actualizar todas las etiquetas internas dinámicamente
                card.querySelectorAll('.dynamic-title').forEach(el => {
                    const sectionName = el.getAttribute('data-section') || 'Sección';
                    el.textContent = `${sectionName} para ${newTitle}`;
                });
            }
        }
    });
}

// 3. CORRECCIÓN CRÍTICA DEL PDF (EVITAR DESBORDE DE TEXTO)
window.exportToPDF = async function() {
    const element = document.querySelector('.app-container') || document.body;
    const btn = document.querySelector('.export-button'); // El botón de descarga
    
    if(btn) btn.style.display = 'none'; // Ocultar botón en el PDF
    
    // Guardar estado original
    const originalStyle = element.style.cssText;
    
    // FORZAR ANCHO DE IMPRESIÓN (A4)
    element.style.width = '1050px'; 
    element.style.maxWidth = '1050px';
    element.style.minWidth = '1050px';
    element.style.margin = '0 auto';

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 1050
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Tegra-Spec-${new Date().getTime()}.pdf`);
        
    } catch (error) {
        console.error("Error generando PDF:", error);
        alert("Error al generar el PDF. Revisa la consola.");
    } finally {
        // Restaurar interfaz
        element.style.cssText = originalStyle;
        if(btn) btn.style.display = 'block';
    }
};

// EJECUTAR PARCHES AL CARGAR
document.addEventListener('DOMContentLoaded', () => {
    fixColorDetection();
    fixPlacementIssues();
});
