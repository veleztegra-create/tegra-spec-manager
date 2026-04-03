// tegra-adapter.js - Adaptador con limpieza de descripciones

(function() {
    'use strict';

    if (window.__tegraAdapterV4Initialized) return;
    window.__tegraAdapterV4Initialized = true;

    console.log('🚀 Inicializando tegra-adapter V4...');

    function showStatus(message, type = 'info') {
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
            return;
        }
        console.log(`[${type}] ${message}`);
    }

    const LOCATION_TRANSLATIONS = {
        'FRONT': 'FRENTE',
        'BACK': 'ESPALDA',
        'COLLAR': 'CUELLO',
        'SLEEVE': 'MANGA',
        'TV. NUMBERS': 'NÚMEROS TV',
        'SHOULDER': 'HOMBRO',
        'CUSTOM': 'PERSONALIZADO'
    };

    const TEXT_TRANSLATIONS = [
        [/\bfront\b/gi, 'frente'],
        [/\bback\b/gi, 'espalda'],
        [/\bcollar\b/gi, 'cuello'],
        [/\bsleeve\b/gi, 'manga'],
        [/\bshoulder\b/gi, 'hombro'],
        [/\bnameplate\b/gi, 'placa de nombre'],
        [/\bnumbers?\b/gi, 'números'],
        [/\bdistance between\b/gi, 'distancia entre'],
        [/\bcenter front\b/gi, 'centro frente'],
        [/\bcenter back\b/gi, 'centro espalda'],
        [/\bleft\b/gi, 'izquierdo'],
        [/\bright\b/gi, 'derecho'],
        [/\bstripe\b/gi, 'franja'],
        [/\bswoosh\b/gi, 'swoosh'],
        [/\bjocktag\b/gi, 'jocktag']
    ];

    function translatePlacementLocation(location) {
        const key = String(location || '').trim().toUpperCase();
        return LOCATION_TRANSLATIONS[key] || key || 'PERSONALIZADO';
    }

    function translatePlacementText(text) {
        let translated = String(text || '');
        TEXT_TRANSLATIONS.forEach(([regex, replacement]) => {
            translated = translated.replace(regex, replacement);
        });
        return translated;
    }

    function limpiarDescripcion(texto) {
        if (!texto) return '';
        
        // Eliminar números y puntos decimales (medidas)
        let limpio = texto.replace(/\d+\.?\d*/g, '');
        
        // Eliminar Yes/No
        limpio = limpio.replace(/\b(Yes|No)\b/gi, '');
        
        // Traducir términos comunes de placement al español
        limpio = translatePlacementText(limpio);

        // Eliminar espacios múltiples
        limpio = limpio.replace(/\s+/g, ' ').trim();
        
        // Capitalizar primera letra
        return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

    function formatearDescripcionPlacement(placement) {
        if (!placement) return '';
        
        const partes = [];
        
        // Ubicación
        if (placement.ubicacion) {
            partes.push(translatePlacementLocation(placement.ubicacion) + ':');
        }
        
        // Descripción limpia
        if (placement.descripcionIngles) {
            partes.push(limpiarDescripcion(placement.descripcionIngles));
        } else if (placement.descripcion) {
            partes.push(placement.descripcion);
        }
        
        // Distancia (solo si es válida)
        if (placement.distancia && placement.distancia !== 'N/A') {
            partes.push(placement.distancia);
        }
        
        // Talla base como referencia
        if (placement.talla) {
            partes.push(`(talla base: ${placement.talla})`);
        }
        
        return partes.join(' ');
    }

    function poblarFormularioConPDF(datosPDF) {
        if (!datosPDF) {
            showStatus('❌ No hay datos para poblar', 'error');
            return;
        }

        console.log('📄 Poblando formulario con datos del PDF:', datosPDF);

        function setInputValue(id, value) {
            const input = document.getElementById(id);
            if (input && value && value !== 'N/A') {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // 1. INFORMACIÓN GENERAL
        if (datosPDF.informacionGeneral) {
            const info = datosPDF.informacionGeneral;
            if (info.equipo) setInputValue('name-team', info.equipo);
            if (info.styleNumber) setInputValue('style', info.styleNumber);
            if (info.season) setInputValue('season', info.season);
        }

        // 2. TALLA BASE
        if (datosPDF.tallaBase) {
            setInputValue('base-size', datosPDF.tallaBase);
        }

        // 3. TELA
        if (datosPDF.telas && datosPDF.telas.length > 0) {
            const tela = datosPDF.telas[0];
            if (tela.composicion) {
                setInputValue('fabric', tela.composicion);
            }
        }

        // 4. PLACEMENTS
        if (datosPDF.placements && datosPDF.placements.length > 0) {
            
            if (window.placements && Array.isArray(window.placements)) {
                if (confirm('¿Deseas reemplazar los placements existentes con los del PDF?')) {
                    window.placements = [];
                    const container = document.getElementById('placements-container');
                    if (container) container.innerHTML = '';
                    
                    const tabs = document.getElementById('placements-tabs');
                    if (tabs) tabs.innerHTML = '';
                }
            }

            const groupedPlacements = new Map();

            datosPDF.placements.forEach((placement) => {
                const translatedType = translatePlacementLocation(placement.ubicacion);
                const groupKey = translatedType || 'PERSONALIZADO';
                const detalleLinea = formatearDescripcionPlacement(placement);
                const instruccion = limpiarDescripcion(placement.descripcionIngles || placement.descripcion || '');

                if (!groupedPlacements.has(groupKey)) {
                    groupedPlacements.set(groupKey, {
                        type: groupKey,
                        name: groupKey,
                        detailLines: [],
                        specialInstructionsLines: [],
                        isPaired: (String(placement.ubicacion || '').toUpperCase() === 'SLEEVE' || String(placement.ubicacion || '').toUpperCase() === 'SHOULDER'),
                        baseSize: placement.talla || 'L'
                    });
                }

                const group = groupedPlacements.get(groupKey);
                if (detalleLinea && !group.detailLines.includes(detalleLinea)) {
                    group.detailLines.push(detalleLinea);
                }
                if (instruccion && !group.specialInstructionsLines.includes(instruccion)) {
                    group.specialInstructionsLines.push(instruccion);
                }
            });

            const mergedPlacements = Array.from(groupedPlacements.values());

            mergedPlacements.forEach((placement, index) => {
                const placementId = index === 0 ? 1 : Date.now() + index;

                const newPlacement = {
                    id: placementId,
                    type: placement.type,
                    name: placement.name,
                    imageData: null,
                    colors: [],
                    sequence: [],
                    placementDetails: placement.detailLines.join(' | '),
                    dimensions: '',
                    temp: '320 °F',
                    time: '1:40 min',
                    specialties: '',
                    specialInstructions: placement.specialInstructionsLines.join(' | '),
                    inkType: datosPDF.tinta?.tipo || 'WATER',
                    isPaired: placement.isPaired,
                    baseSize: placement.baseSize
                };

                if (index === 0 && window.placements && window.placements.length === 0) {
                    window.placements = [newPlacement];
                } else if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                }

                if (typeof window.renderPlacementHTML === 'function') {
                    window.renderPlacementHTML(newPlacement);
                }
            });

            if (typeof window.updatePlacementsTabs === 'function') {
                setTimeout(window.updatePlacementsTabs, 100);
            }

            if (window.placements && window.placements.length > 0 && typeof window.showPlacement === 'function') {
                setTimeout(() => window.showPlacement(window.placements[0].id), 200);
            }
        }

        showStatus(`✅ Tech Pack cargado (talla base: ${datosPDF.tallaBase || 'L'})`, 'success');
        
        if (typeof window.showTab === 'function') {
            setTimeout(() => window.showTab('spec-creator'), 500);
        }
    }

    function crearBotonCargaPDF() {
        let boton = document.getElementById('tegra-pdf-uploader-btn');

        if (!boton) {
            const actions = document.querySelector('#spec-creator .card .card-actions') || document.querySelector('.card-actions');
            if (!actions) {
                console.warn('⚠️ No se encontró contenedor para botón PDF');
                return;
            }

            boton = document.createElement('button');
            boton.id = 'tegra-pdf-uploader-btn';
            boton.type = 'button';
            boton.className = 'btn btn-outline btn-sm';
            actions.appendChild(boton);
        }

        boton.innerHTML = '<i class="fas fa-file-pdf"></i> Cargar Tech Pack Nike';
        boton.title = 'Cargar Tech Pack Nike desde PDF';

        let fileInput = document.getElementById('tegra-pdf-uploader-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'tegra-pdf-uploader-input';
            fileInput.accept = '.pdf';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }

        fileInput.onchange = async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            showStatus('📄 Procesando Tech Pack...', 'info');

            try {
                if (typeof NikeTechPackExtractor === 'undefined') {
                    throw new Error('NikeTechPackExtractor no está cargado');
                }

                const extractor = new NikeTechPackExtractor();
                const datosPDF = await extractor.procesarPDF(file);
                
                console.log('📊 Datos extraídos:', datosPDF);
                poblarFormularioConPDF(datosPDF);

            } catch (error) {
                console.error('❌ Error:', error);
                showStatus('❌ Error: ' + error.message, 'error');
            } finally {
                fileInput.value = '';
            }
        };

        boton.onclick = () => fileInput.click();

        console.log('✅ Botón de carga de PDF vinculado');
    }

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearBotonCargaPDF);
    } else {
        crearBotonCargaPDF();
    }

    window.tegraAdapter = {
        poblarFormularioConPDF,
        crearBotonCargaPDF,
        limpiarDescripcion,
        formatearDescripcionPlacement
    };

    console.log('✅ tegra-adapter V4 cargado');
})();
