// tegra-adapter.js - Adaptador con botón visible y funcional

(function() {
    'use strict';

    // Verificar si ya está inicializado
    if (window.__tegraAdapterInitialized) {
        console.log('⚠️ tegra-adapter ya inicializado, omitiendo...');
        return;
    }
    window.__tegraAdapterInitialized = true;

    console.log('🚀 Inicializando tegra-adapter...');

    // Función para mostrar mensajes de estado
    function showStatus(message, type = 'info') {
        // Intentar usar el sistema de status de la app principal
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
            return;
        }
        
        // Fallback: crear nuestro propio status
        let statusEl = document.getElementById('tegra-adapter-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'tegra-adapter-status';
            statusEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
                max-width: 400px;
                background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
                color: white;
            `;
            document.body.appendChild(statusEl);
        }
        
        statusEl.textContent = message;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            if (statusEl) {
                statusEl.style.display = 'none';
            }
        }, 4000);
    }

    // Función para poblar el formulario con datos del PDF
    function poblarFormularioConPDF(datosPDF) {
        if (!datosPDF) {
            showStatus('❌ No hay datos para poblar', 'error');
            return;
        }

        console.log('📄 Poblando formulario con datos del PDF:', datosPDF);

        // Función auxiliar para establecer valor en input
        function setInputValue(id, value) {
            const input = document.getElementById(id);
            if (input && value !== undefined && value !== null && value !== '') {
                input.value = value;
                // Disparar eventos para actualizar bindings
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
            if (info.nombreMarketing) setInputValue('name-team', info.nombreMarketing);
        }

        // 2. TALLA BASE
        if (datosPDF.tallaBase) {
            setInputValue('base-size', datosPDF.tallaBase);
            console.log(`📏 Talla base establecida: ${datosPDF.tallaBase}`);
        }

        // 3. TELA
        if (datosPDF.telas && datosPDF.telas.length > 0) {
            const telaPrincipal = datosPDF.telas[0];
            if (telaPrincipal) {
                const descripcionTela = [];
                if (telaPrincipal.nombre) descripcionTela.push(telaPrincipal.nombre);
                if (telaPrincipal.composicion) descripcionTela.push(telaPrincipal.composicion);
                if (telaPrincipal.peso) descripcionTela.push(telaPrincipal.peso);
                setInputValue('fabric', descripcionTela.join(' - '));
            }
        }

        // 4. PLACEMENTS
        if (datosPDF.placements && datosPDF.placements.length > 0) {
            // Limpiar placements existentes si el usuario quiere
            if (window.placements && Array.isArray(window.placements)) {
                if (confirm('¿Deseas reemplazar los placements existentes con los del PDF?')) {
                    window.placements = [];
                    const container = document.getElementById('placements-container');
                    if (container) container.innerHTML = '';
                    
                    const tabs = document.getElementById('placements-tabs');
                    if (tabs) tabs.innerHTML = '';
                }
            }

            // Crear nuevos placements
            datosPDF.placements.forEach((placement, index) => {
                const placementId = index === 0 ? 1 : Date.now() + index;
                
                // Formatear descripción según el tipo
                let descripcion = '';
                if (placement.descripcionIngles) {
                    descripcion = `${placement.ubicacion}: ${placement.descripcionIngles}`;
                } else {
                    descripcion = placement.descripcion || '';
                }

                // Agregar distancia si existe
                if (placement.distancia && placement.distancia !== 'N/A') {
                    descripcion += ` ${placement.distancia}`;
                }

                const newPlacement = {
                    id: placementId,
                    type: placement.ubicacion || 'CUSTOM',
                    name: placement.ubicacion || 'CUSTOM',
                    imageData: null,
                    colors: [],
                    sequence: [],
                    placementDetails: descripcion,
                    dimensions: `Base: ${placement.talla || 'L'}`,
                    temp: '320 °F',
                    time: '1:40 min',
                    specialties: '',
                    specialInstructions: placement.descripcionIngles || placement.descripcion || '',
                    inkType: datosPDF.tinta?.tipo || 'WATER',
                    isPaired: (placement.ubicacion === 'SLEEVE' || placement.ubicacion === 'SHOULDER'),
                    width: '',
                    height: '',
                    baseSize: placement.talla || 'L'
                };

                if (index === 0 && window.placements && window.placements.length === 0) {
                    window.placements = [newPlacement];
                } else if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                }

                // Renderizar si la función está disponible
                if (typeof window.renderPlacementHTML === 'function') {
                    window.renderPlacementHTML(newPlacement);
                }
            });

            // Actualizar pestañas
            if (typeof window.updatePlacementsTabs === 'function') {
                setTimeout(() => {
                    window.updatePlacementsTabs();
                }, 100);
            }

            // Mostrar el primer placement
            if (window.placements && window.placements.length > 0 && typeof window.showPlacement === 'function') {
                setTimeout(() => {
                    window.showPlacement(window.placements[0].id);
                }, 200);
            }
        }

        showStatus(`✅ Tech Pack cargado exitosamente (talla base: ${datosPDF.tallaBase || 'L'})`, 'success');
        
        // Cambiar a la pestaña de creación
        if (typeof window.showTab === 'function') {
            setTimeout(() => {
                window.showTab('spec-creator');
            }, 500);
        }
    }

    // Función para crear el botón de carga
    function crearBotonCargaPDF() {
        // Eliminar botón existente si lo hay
        const existingBtn = document.getElementById('tegra-pdf-uploader-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Crear nuevo botón
        const boton = document.createElement('button');
        boton.id = 'tegra-pdf-uploader-btn';
        boton.innerHTML = '<i class="fas fa-file-pdf"></i> Cargar Tech Pack Nike';
        boton.title = 'Cargar Tech Pack Nike desde PDF';
        
        // Estilos más agresivos para asegurar visibilidad
        boton.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            z-index: 999999 !important;
            padding: 14px 24px !important;
            background: linear-gradient(135deg, #e31837 0%, #8B0000 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 50px !important;
            box-shadow: 0 4px 20px rgba(227, 24, 55, 0.5) !important;
            cursor: pointer !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            transition: all 0.3s ease !important;
            border: 2px solid rgba(255,255,255,0.2) !important;
            font-family: 'Segoe UI', 'Roboto', sans-serif !important;
            font-size: 14px !important;
            line-height: 1 !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;

        // Hover effects
        boton.onmouseover = () => {
            boton.style.transform = 'translateY(-3px)';
            boton.style.boxShadow = '0 8px 25px rgba(227, 24, 55, 0.7)';
        };
        boton.onmouseout = () => {
            boton.style.transform = 'translateY(0)';
            boton.style.boxShadow = '0 4px 20px rgba(227, 24, 55, 0.5)';
        };

        // Input file oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'tegra-pdf-uploader-input';
        fileInput.accept = '.pdf';
        fileInput.style.cssText = 'display: none !important;';

        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            showStatus('📄 Procesando Tech Pack...', 'info');

            try {
                // Verificar que el extractor está disponible
                if (typeof NikeTechPackExtractor === 'undefined') {
                    throw new Error('NikeTechPackExtractor no está cargado. Asegúrate de incluir nikeTechPackExtractor.js');
                }

                const extractor = new NikeTechPackExtractor();
                const datosPDF = await extractor.procesarPDF(file);
                
                console.log('📊 Datos extraídos:', datosPDF);
                
                // Poblar formulario
                poblarFormularioConPDF(datosPDF);

            } catch (error) {
                console.error('❌ Error:', error);
                showStatus('❌ Error: ' + error.message, 'error');
            } finally {
                // Limpiar input
                fileInput.value = '';
            }
        });

        boton.onclick = () => fileInput.click();

        // Agregar al DOM
        document.body.appendChild(boton);
        document.body.appendChild(fileInput);

        console.log('✅ Botón de carga de PDF añadido correctamente');
        
        // Verificar que el botón está en el DOM
        setTimeout(() => {
            const btnCheck = document.getElementById('tegra-pdf-uploader-btn');
            if (btnCheck) {
                console.log('✅ Botón verificado en DOM');
            } else {
                console.error('❌ Botón no encontrado después de agregarlo');
                // Reintentar
                document.body.appendChild(boton);
            }
        }, 100);
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📦 DOM cargado, creando botón...');
            crearBotonCargaPDF();
        });
    } else {
        console.log('📦 DOM ya cargado, creando botón...');
        crearBotonCargaPDF();
    }

    // También intentar después de un pequeño retraso por si acaso
    setTimeout(() => {
        if (!document.getElementById('tegra-pdf-uploader-btn')) {
            console.log('⏰ Reintentando creación de botón...');
            crearBotonCargaPDF();
        }
    }, 1000);

    // Exponer funciones útiles globalmente
    window.tegraAdapter = {
        poblarFormularioConPDF,
        crearBotonCargaPDF,
        showStatus
    };

    console.log('✅ tegra-adapter.js cargado correctamente');
})();
