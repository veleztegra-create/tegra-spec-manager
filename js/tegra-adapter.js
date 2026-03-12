// tegra-adapter.js - Adaptador con traducción contextual de frases técnicas

(function() {
    'use strict';

    // DICCIONARIO DE FRASES COMPLETAS TÍPICAS DE TECH PACKS
    const PHRASE_DICTIONARY = {
        // Frases de Swoosh
        'Swoosh: CF neck seam to top of graphic': 'Swoosh: CF (centro del frente) desde costura de cuello a borde superior del gráfico',
        'Swoosh: Sleeve hem edge to top of graphic': 'Swoosh: desde ruedo de manga a borde superior del gráfico',
        'Swoosh: centered over topline': 'Swoosh: centrado sobre línea superior',
        'Swoosh: placement on sleeve': 'Swoosh: ubicación en manga',
        
        // Frases de Wordmark
        'Wordmark: CF neck seam to top of graphic': 'Wordmark: CF (centro del frente) desde costura de cuello a borde superior',
        'Wordmark: centered on front': 'Wordmark: centrado en frente',
        'Front Team Wordmark': 'Wordmark del equipo (frente)',
        
        // Frases de Números
        'CF Numbers: distance between numbers': 'Números frontales: distancia entre números',
        'Back Numbers: placement': 'Números traseros: ubicación',
        'TV Numbers: shoulder placement': 'Números TV: ubicación en hombro',
        'Distance between CF numbers': 'Distancia entre números frontales',
        
        // Frases de Nameplate
        'Nameplate: back placement': 'Nameplate: ubicación en espalda',
        'Nameplate: centered on back': 'Nameplate: centrado en espalda',
        
        // Frases de Jocktag
        'Jocktag: Side Seam to Edge of Jocktag': 'Jocktag: desde costado al borde',
        'Jocktag: Bottom hem edge to bottom edge': 'Jocktag: desde ruedo inferior al borde inferior',
        
        // Frases de Stripes/Rayas
        'Sleeve Stripes: Sleeve edge to edge of graphic': 'Rayas de manga: desde borde de manga al borde del gráfico',
        'Left and Right Sleeve Stripe': 'Rayas de manga izquierda y derecha',
        
        // Frases de Shield/Escudo
        'NFL Shield: centered on collar': 'Escudo NFL: centrado en cuello',
        'Back Neck Team Logo': 'Logo del equipo en cuello trasero',
        
        // Frases generales de posición
        'centered on front': 'centrado en frente',
        'centered on back': 'centrado en espalda',
        'centered on sleeve': 'centrado en manga',
        'centered over topline': 'centrado sobre línea superior',
        'from top edge': 'desde borde superior',
        'from bottom edge': 'desde borde inferior',
        'from side seam': 'desde costado',
        'from armhole seam': 'desde costura de sisa',
        'from neck seam': 'desde costura de cuello',
        'from hem edge': 'desde ruedo',
        
        // Tipos de medidas
        'to top of graphic': 'al borde superior del gráfico',
        'to bottom of graphic': 'al borde inferior del gráfico',
        'to edge of graphic': 'al borde del gráfico',
        'distance to graphic': 'distancia al gráfico',
        'edge to edge': 'de borde a borde',
        
        // Descripciones de ELP comunes
        'CF neck seam to top of graphic': 'desde costura de cuello CF al borde superior',
        'neck seam to top of graphic': 'desde costura de cuello al borde superior',
        'side seam to edge': 'desde costado al borde',
        'hem edge to bottom edge': 'desde ruedo al borde inferior',
        
        // Calificadores
        'centered': 'centrado',
        'left side': 'lado izquierdo',
        'right side': 'lado derecho',
        'top edge': 'borde superior',
        'bottom edge': 'borde inferior',
        'front': 'frente',
        'back': 'espalda',
        'sleeve': 'manga',
        'shoulder': 'hombro',
        'collar': 'cuello',
        'neck': 'cuello'
    };

    // Mapeo de códigos ELP a descripciones base
    const ELP_DESCRIPTIONS = {
        'ELP68': 'Escudo NFL - Centrado en cuello',
        'ELP69': 'Escudo NFL - Cuello trasero',
        'ELP66': 'Back Neck Band - Cinta cuello trasero',
        'ELP01': 'Wordmark - Centro frente',
        'ELP71': 'Números Frontales',
        'ELP100': 'Distancia entre números frontales',
        'ELP08': 'Nameplate - Espalda',
        'ELP64': 'Números Traseros',
        'ELP67': 'Números TV - Hombros',
        'ELP79': 'Swoosh - Manga',
        'ELP40': 'Rayas de Manga',
        'ELP37': 'Jocktag - Lateral',
        'ELP38': 'Jocktag - Vertical'
    };

    function escapeRegex(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Traduce frases completas de tech packs manteniendo la estructura profesional
     */
    function traducirFraseTechPack(fraseIngles, distancia, tallaBase) {
        if (!fraseIngles) return '';

        let fraseTraducida = fraseIngles;
        let medida = distancia ? ` ${distancia}` : ' [medida]';
        
        // Ordenar frases por longitud (de mayor a menor) para priorizar frases completas
        const frasesOrdenadas = Object.entries(PHRASE_DICTIONARY)
            .sort((a, b) => b[0].length - a[0].length);

        // Aplicar traducciones de frases completas
        for (const [en, es] of frasesOrdenadas) {
            const regex = new RegExp(escapeRegex(en), 'gi');
            if (regex.test(fraseTraducida)) {
                fraseTraducida = fraseTraducida.replace(regex, es);
                break; // Tomar la primera coincidencia más específica
            }
        }

        // Si no hubo coincidencia de frase completa, hacer traducción inteligente
        if (fraseTraducida === fraseIngles) {
            fraseTraducida = traducirInteligente(fraseIngles);
        }

        // Agregar la medida si está disponible
        if (distancia && distancia !== 'N/A') {
            // Extraer el número de la distancia
            const valorNumero = parseFloat(distancia);
            if (!isNaN(valorNumero)) {
                // Insertar la medida antes de la preposición relevante
                const preposiciones = [' desde', ' al', ' de ', ' a '];
                for (const prep of preposiciones) {
                    if (fraseTraducida.includes(prep)) {
                        const partes = fraseTraducida.split(prep);
                        if (partes.length > 1) {
                            fraseTraducida = partes[0] + prep + valorNumero + ' cm ' + partes.slice(1).join(prep);
                            break;
                        }
                    }
                }
                
                // Si no se pudo insertar con preposición, agregar al inicio
                if (!fraseTraducida.includes(valorNumero + ' cm')) {
                    fraseTraducida = valorNumero + ' cm ' + fraseTraducida.toLowerCase();
                }
            }
        }

        // Capitalizar primera letra
        return fraseTraducida.charAt(0).toUpperCase() + fraseTraducida.slice(1);
    }

    /**
     * Traducción inteligente cuando no hay frase exacta en el diccionario
     */
    function traducirInteligente(texto) {
        let traducido = texto;

        // Reemplazar abreviaturas comunes
        const abreviaturas = {
            'CF': 'centro del frente',
            'CB': 'centro de la espalda',
            'L': 'izquierdo',
            'R': 'derecho',
            'LT': 'izquierdo',
            'RT': 'derecho',
            'C/B': 'centro espalda',
            'C/F': 'centro frente',
            'W/:': 'con:',
            'w/': 'con',
            '&': 'y'
        };

        for (const [abrev, significado] of Object.entries(abreviaturas)) {
            const regex = new RegExp(`\\b${escapeRegex(abrev)}\\b`, 'gi');
            traducido = traducido.replace(regex, significado);
        }

        // Traducir palabras comunes
        const palabrasComunes = {
            'swoosh': 'swoosh',
            'wordmark': 'wordmark',
            'jocktag': 'jocktag',
            'nameplate': 'nameplate',
            'shield': 'escudo',
            'stripe': 'raya',
            'stripes': 'rayas',
            'placement': 'ubicación',
            'graphic': 'gráfico',
            'numbers': 'números',
            'number': 'número',
            'team': 'equipo',
            'logo': 'logo',
            'sleeve': 'manga',
            'shoulder': 'hombro',
            'front': 'frente',
            'back': 'espalda',
            'neck': 'cuello',
            'collar': 'cuello',
            'hem': 'ruedo',
            'edge': 'borde',
            'seam': 'costura',
            'center': 'centro',
            'centered': 'centrado',
            'distance': 'distancia',
            'between': 'entre',
            'from': 'desde',
            'to': 'al',
            'top': 'superior',
            'bottom': 'inferior',
            'left': 'izquierdo',
            'right': 'derecho',
            'side': 'lateral',
            'panel': 'panel',
            'yoke': 'canesú',
            'armhole': 'sisa',
            'chest': 'pecho'
        };

        for (const [en, es] of Object.entries(palabrasComunes)) {
            const regex = new RegExp(`\\b${escapeRegex(en)}\\b`, 'gi');
            traducido = traducido.replace(regex, es);
        }

        return traducido;
    }

    /**
     * Formatea la descripción completa del placement para mostrar
     */
    function formatearDescripcionPlacement(placement) {
        const partes = [];
        
        // 1. Código ELP (si existe)
        if (placement.codigo) {
            partes.push(`[${placement.codigo}]`);
        }

        // 2. Ubicación (ya traducida)
        if (placement.ubicacion) {
            partes.push(placement.ubicacion);
        }

        // 3. Descripción traducida con medida
        if (placement.descripcionIngles || placement.descripcion) {
            const descripcionTraducida = traducirFraseTechPack(
                placement.descripcionIngles || placement.descripcion,
                placement.distancia,
                placement.talla
            );
            partes.push(`: ${descripcionTraducida}`);
        }

        // 4. Talla base (si es relevante)
        if (placement.talla && placement.talla !== 'N/A') {
            partes.push(`(talla base: ${placement.talla})`);
        }

        return partes.join(' ');
    }

    /**
     * Traduce y formatea las instrucciones especiales
     */
    function formatearInstruccionesEspeciales(placement, inkType) {
        const instrucciones = [];
        
        // Tipo de tinta
        if (inkType) {
            const tiposTinta = {
                'WATER': 'Impresión base acuosa',
                'PLASTISOL': 'Impresión plastisol',
                'SILICONE': 'Impresión silicona'
            };
            instrucciones.push(`Tinta: ${tiposTinta[inkType] || inkType}`);
        }

        // Distancia específica
        if (placement.distancia && placement.distancia !== 'N/A') {
            instrucciones.push(`Distancia: ${placement.distancia}`);
        }

        // Descripción original (para referencia)
        if (placement.descripcionIngles) {
            instrucciones.push(`Ref: ${placement.descripcionIngles}`);
        }

        return instrucciones.join(' | ');
    }

    /**
     * Poblar el formulario con los datos extraídos del PDF
     */
    function poblarFormularioConPDF(datosPDF) {
        if (!datosPDF) return;

        console.log('📄 Poblando formulario con datos del PDF:', datosPDF);

        // 1. Información General
        if (datosPDF.informacionGeneral) {
            const info = datosPDF.informacionGeneral;
            if (info.equipo) setInputValue('customer', info.equipo); // No traducir nombres de equipos
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
            const telaPrincipal = datosPDF.telas[0];
            if (telaPrincipal) {
                const telaDescripcion = [];
                if (telaPrincipal.nombre) telaDescripcion.push(telaPrincipal.nombre);
                if (telaPrincipal.composicion && telaPrincipal.composicion !== 'N/A') {
                    telaDescripcion.push(telaPrincipal.composicion);
                }
                if (telaPrincipal.peso && telaPrincipal.peso !== 'N/A') {
                    telaDescripcion.push(telaPrincipal.peso);
                }
                setInputValue('fabric', telaDescripcion.join(' - '));
            }
        }

        // 4. Placements con descripciones formateadas
        if (datosPDF.placements && datosPDF.placements.length > 0) {
            if (window.placements && Array.isArray(window.placements)) {
                if (confirm('¿Deseas reemplazar los placements existentes con los del PDF?')) {
                    window.placements = [];
                    const container = document.getElementById('placements-container');
                    if (container) container.innerHTML = '';
                }
            }

            datosPDF.placements.forEach(placement => {
                const inkType = datosPDF.tinta ? datosPDF.tinta.tipo : 'WATER';

                // Formatear descripción para placementDetails
                const descripcionFormateada = formatearDescripcionPlacement(placement);
                
                // Formatear instrucciones especiales
                const instrucciones = formatearInstruccionesEspeciales(placement, inkType);

                const newPlacement = {
                    id: Date.now() + Math.random(),
                    type: placement.ubicacion || 'CUSTOM',
                    name: placement.ubicacion || 'CUSTOM',
                    imageData: null,
                    colors: [],
                    sequence: [],
                    placementDetails: descripcionFormateada,
                    dimensions: `Base: ${placement.talla || 'L'}`,
                    temp: inkType === 'PLASTISOL' ? '320 °F' : '320 °F',
                    time: inkType === 'PLASTISOL' ? '1:00 min' : '1:40 min',
                    specialties: '',
                    specialInstructions: instrucciones,
                    inkType: inkType,
                    isPaired: (placement.ubicacion === 'SLEEVE' || placement.ubicacion === 'SHOULDER')
                };

                if (Array.isArray(window.placements)) {
                    window.placements.push(newPlacement);
                    if (typeof window.renderPlacementHTML === 'function') {
                        window.renderPlacementHTML(newPlacement);
                    }
                }
            });

            if (typeof window.updatePlacementsTabs === 'function') {
                window.updatePlacementsTabs();
            }
        }

        showStatus('✅ Tech Pack cargado exitosamente', 'success');
        
        if (typeof window.showTab === 'function') {
            setTimeout(() => window.showTab('spec-creator'), 500);
        }
    }

    // Funciones auxiliares (setInputValue, showStatus, crearBotonCargaPDF) 
    // se mantienen igual que en la versión anterior...

    // Exponer funciones globales mejoradas
    window.tegraAdapter = {
        poblarFormularioConPDF: poblarFormularioConPDF,
        crearBotonCargaPDF: crearBotonCargaPDF,
        traducirFraseTechPack: traducirFraseTechPack,
        formatearDescripcionPlacement: formatearDescripcionPlacement,
        showStatus: showStatus,
        PHRASE_DICTIONARY: PHRASE_DICTIONARY,
        ELP_DESCRIPTIONS: ELP_DESCRIPTIONS
    };

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearBotonCargaPDF);
    } else {
        crearBotonCargaPDF();
    }

})();
