// tegra-adapter.js - Adaptador con formato profesional

(function() {
    'use strict';

    function formatearDescripcionPlacement(placement) {
        if (!placement) return '';
        
        const partes = [];
        
        // 1. UBICACIÓN (en mayúsculas como en el ejemplo)
        if (placement.ubicacion) {
            partes.push(placement.ubicacion + ':');
        }
        
        // 2. DESCRIPCIÓN TRADUCIDA
        let descripcion = placement.descripcionIngles || placement.descripcion || '';
        
        // Traducciones específicas para frases comunes
        const traducciones = {
            // ELP52
            'CF yoke seam to top edge of graphic': 'desde costura de canesú CF al borde superior del gráfico',
            // ELP100
            'Distance between numbers': 'distancia entre números',
            // ELP92
            'Set bottom edge of nameplate at back yoke seam. Centered across on back body.': 'Borde inferior alineado con costura de canesú. Centrado horizontalmente.',
            // ELP64
            'Nameplate to top of graphic': 'desde nameplate al borde superior del gráfico',
            // ELP37
            'Side seam to edge of label': 'desde costura lateral al borde',
            // ELP38
            'Bottom edge to edge of label': 'desde borde inferior al borde',
            // ELP67
            'Centered vertically between neck seam and shoulder seam; centered horizontally across natural shoulder fold.': 'Centrado verticalmente entre cuello y hombro; centrado horizontalmente.',
            // ELP05
            'Armhole seam to top of graphic, centered over topline': 'desde costura de sisa al borde superior, centrado',
            // ELP40
            'Sleeve cuff seam to edge of graphic': 'desde costura de puño al borde'
        };
        
        // Buscar traducción exacta
        let descripcionTraducida = descripcion;
        for (const [en, es] of Object.entries(traducciones)) {
            if (descripcion.includes(en)) {
                descripcionTraducida = es;
                break;
            }
        }
        
        partes.push(descripcionTraducida);
        
        // 3. MEDIDA (solo si es un valor válido y no es N/A)
        if (placement.distancia && !placement.distancia.includes('N/A')) {
            partes.push(placement.distancia);
        }
        
        // 4. TALLA BASE (como referencia)
        if (placement.talla) {
            partes.push(`(talla base: ${placement.talla})`);
        }
        
        return partes.join(' ');
    }

    function poblarFormularioConPDF(datosPDF) {
        if (!datosPDF) return;

        console.log('📄 Poblando formulario con:', datosPDF);

        // 1. Talla Base (fundamental)
        if (datosPDF.tallaBase) {
            setInputValue('base-size', datosPDF.tallaBase);
        }

        // 2. Placements con formato corregido
        if (datosPDF.placements && datosPDF.placements.length > 0) {
            
            // EJEMPLO ESPECÍFICO: CF Numbers para talla L
            const cfNumbers = datosPDF.placements.find(p => p.codigo === 'ELP52');
            if (cfNumbers) {
                console.log(`✅ ELP52 para talla ${datosPDF.tallaBase}: ${cfNumbers.distancia}`);
            }
            
            // Crear placements en el sistema
            datosPDF.placements.forEach(placement => {
                const descripcionFormateada = formatearDescripcionPlacement(placement);
                
                const newPlacement = {
                    id: Date.now() + Math.random(),
                    type: placement.ubicacion || 'CUSTOM',
                    name: placement.ubicacion || 'CUSTOM',
                    placementDetails: descripcionFormateada,
                    dimensions: '',
                    temp: '320 °F',
                    time: '1:40 min',
                    specialInstructions: placement.descripcionIngles || '',
                    inkType: 'WATER',
                    isPaired: placement.ubicacion === 'SLEEVE'
                };

                if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                }
            });
        }

        showStatus(`✅ Tech Pack cargado (talla base: ${datosPDF.tallaBase || 'L'})`, 'success');
    }

    function setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input && value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function showStatus(message, type) {
        console.log(`[${type}] ${message}`);
    }

    function crearBotonCargaPDF() {
        // Tu código existente del botón
    }

    // Exponer funciones
    window.tegraAdapter = {
        poblarFormularioConPDF: poblarFormularioConPDF,
        formatearDescripcionPlacement: formatearDescripcionPlacement
    };

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearBotonCargaPDF);
    } else {
        crearBotonCargaPDF();
    }
})();
