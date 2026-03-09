// tegra-adapter.js - Adaptador para integrar NikeTechPackExtractor en Tegra Spec Manager

(function() {
    'use strict';

    // --- FUNCIÓN PARA TRADUCIR DESCRIPCIÓN DE PLACEMENT (INGLÉS -> ESPAÑOL) ---
    function traducirDescripcion(descripcionIngles) {
        if (!descripcionIngles) return '';

        // Diccionario de términos comunes en tech packs
        const traducciones = {
            // Ubicaciones
            'Center Front': 'Centro Frente',
            'Center Back': 'Centro Espalda',
            'Left Sleeve': 'Manga Izquierda',
            'Right Sleeve': 'Manga Derecha',
            'Left Shoulder': 'Hombro Izquierdo',
            'Right Shoulder': 'Hombro Derecho',
            'Collar': 'Cuello',
            'Neck': 'Cuello',
            'Chest': 'Pecho',
            'Nameplate': 'Placa Nombre',
            'TV Numbers': 'Números TV',
            'Jocktag': 'Jocktag',
            'Swoosh': 'Swoosh',
            'Wordmark': 'Wordmark',
            'Stripes': 'Rayas',
            'Yoke': 'Canesú',

            // Elementos
            'Player Number': 'Número de Jugador',
            'Player Name': 'Nombre de Jugador',
            'Team Logo': 'Logo del Equipo',
            'Brand Logo': 'Logo de Marca',
            'Primary Logo': 'Logo Principal',

            // Direcciones
            'Left': 'Izquierdo',
            'Right': 'Derecho',
            'Top': 'Superior',
            'Bottom': 'Inferior',
            'Front': 'Frente',
            'Back': 'Espalda',
            'Side': 'Lateral'
        };

        let traducido = descripcionIngles;
        for (let [en, es] of Object.entries(traducciones)) {
            const regex = new RegExp(`\\b${en}\\b`, 'gi');
            traducido = traducido.replace(regex, es);
        }
        return traducido;
    }

    // --- FUNCIÓN PARA POBLAR EL FORMULARIO CON DATOS DEL PDF ---
    function poblarFormularioConPDF(datosPDF) {
        if (!datosPDF) return;

        console.log('📄 Poblando formulario con datos del PDF:', datosPDF);

        // 1. Información General
        if (datosPDF.informacionGeneral) {
            const info = datosPDF.informacionGeneral;
            if (info.equipo) setInputValue('customer', info.equipo);
            if (info.styleNumber) setInputValue('style', info.styleNumber);
            if (info.season) setInputValue('season', info.season);
            if (info.nombreMarketing) setInputValue('name-team', info.nombreMarketing);
        }

        // 2. Talla Base
        if (datosPDF.tallaBase) {
            setInputValue('base-size', datosPDF.tallaBase);
        }

        // 3. Tela
        if (datosPDF.telas && datosPDF.telas.length > 0) {
            const telaPrincipal = datosPDF.telas.find(t => t.tipo.includes('Principal') || t.tipo.includes('Tricot')) || datosPDF.telas[0];
            if (telaPrincipal) {
                setInputValue('fabric', `${telaPrincipal.nombre || ''} - ${telaPrincipal.composicion || ''}`);
            }
        }

        // 4. Crear Placements (si no existen o para añadirlos)
        if (datosPDF.placements && datosPDF.placements.length > 0) {
            datosPDF.placements.forEach(placement => {
                // Determinar el tipo de tinta (usar el del PDF o el por defecto)
                const inkType = datosPDF.tinta ? datosPDF.tinta.tipo : 'WATER';

                // Crear el objeto del nuevo placement
                const newPlacement = {
                    id: Date.now() + Math.random(),
                    type: placement.ubicacion || 'CUSTOM',
                    name: placement.ubicacion || 'CUSTOM',
                    imageData: null,
                    colors: [],
                    sequence: [],
                    placementDetails: traducirDescripcion(placement.descripcionIngles || placement.descripcion) || placement.descripcion,
                    dimensions: 'SIZE: (W) ## X (H) ##',
                    temp: inkType === 'PLASTISOL' ? '320 °F' : (inkType === 'SILICONE' ? '320 °F' : '320 °F'),
                    time: inkType === 'PLASTISOL' ? '1:00 min' : (inkType === 'SILICONE' ? '1:40 min' : '1:40 min'),
                    specialties: '',
                    specialInstructions: placement.descripcion,
                    inkType: inkType,
                    isPaired: (placement.ubicacion === 'SLEEVE' || placement.ubicacion === 'SHOULDER')
                };

                // Añadir el placement a window.placements y renderizarlo
                if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                    if (typeof window.renderPlacementHTML === 'function') {
                        window.renderPlacementHTML(newPlacement);
                    }
                }
            });

            // Actualizar las pestañas de placements
            if (typeof window.updatePlacementsTabs === 'function') {
                window.updatePlacementsTabs();
            }
        }

        showStatus('📄 Datos del Tech Pack cargados exitosamente', 'success');
    }

    // --- FUNCIÓN PARA CREAR EL BOTÓN FLOTANTE DE CARGA DE PDF ---
    function crearBotonCargaPDF() {
        // Verificar si el botón ya existe
        if (document.getElementById('tegra-pdf-uploader-btn')) return;

        const boton = document.createElement('button');
        boton.id = 'tegra-pdf-uploader-btn';
        boton.innerHTML = '<i class="fas fa-file-pdf"></i> Cargar Tech Pack';
        boton.title = 'Cargar Tech Pack Nike (PDF)';
        boton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1001;
            padding: 12px 20px;
            background: linear-gradient(135deg, #e31837 0%, #8B0000 100%);
            color: white;
            border: none;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        `;
        boton.onmouseover = () => {
            boton.style.transform = 'translateY(-3px)';
            boton.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
        };
        boton.onmouseout = () => {
            boton.style.transform = 'translateY(0)';
            boton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        };

        // Crear input de archivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'tegra-pdf-uploader-input';
        fileInput.accept = '.pdf';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            showStatus('📄 Procesando Tech Pack...', 'info');

            try {
                if (typeof NikeTechPackExtractor === 'undefined') {
                    throw new Error('NikeTechPackExtractor no está cargado. Asegúrate de incluir nikeTechPackExtractor.js');
                }

                const extractor = new NikeTechPackExtractor();
                const datosPDF = await extractor.procesarPDF(file);

                // Poblar el formulario con los datos extraídos
                poblarFormularioConPDF(datosPDF);

                // Cambiar a la pestaña de creación
                if (typeof showTab === 'function') {
                    showTab('spec-creator');
                }

            } catch (error) {
                console.error('Error al procesar PDF:', error);
                showStatus('❌ Error al procesar PDF: ' + error.message, 'error');
            }

            // Limpiar el input para poder cargar el mismo archivo de nuevo
            fileInput.value = '';
        });

        boton.onclick = () => fileInput.click();

        document.body.appendChild(boton);
        document.body.appendChild(fileInput);
        console.log('✅ Botón de carga de PDF añadido');
    }

    // --- EXPONER FUNCIONES GLOBALES ---
    window.tegraAdapter = {
        poblarFormularioConPDF: poblarFormularioConPDF,
        crearBotonCargaPDF: crearBotonCargaPDF,
        traducirDescripcion: traducirDescripcion
    };

    // Inicializar el botón cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearBotonCargaPDF);
    } else {
        crearBotonCargaPDF();
    }

})();
console.log('✅ tegra-adapter.js cargado correctamente');
