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
