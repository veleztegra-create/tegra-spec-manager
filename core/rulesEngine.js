// ======================================================
// core/rulesEngine.js - Motor de Reglas de Negocio
// ======================================================
// Versión 1.0
// Reglas para Screen Printing: Tintas, Shrink, Strikeoff, Sleeve Adjustment.
// Funciones PURAS. No tocan el DOM. Devuelven datos transformados.
// ======================================================

(function(global) {
    'use strict';

    // --- Constantes y Mapas (Configurables) ---
    const BRAND_RULES = {
        'FANATICS': {
            resolveInk: (description) => {
                // Regla 3: Si Fanatics y contiene 'Silicone', es Silicone
                if (description && description.toUpperCase().includes('SILICONE')) {
                    return 'SILICONE';
                }
                // Si no, por defecto Waterbase (punto 3)
                return 'WATER';
            },
            defaultInk: 'WATER'
        },
        'NIKE': {
            resolveInk: (description) => {
                // Regla 3: Si Nike y contiene 'Silicone', es Silicone
                if (description && description.toUpperCase().includes('SILICONE')) {
                    return 'SILICONE';
                }
                return 'WATER';
            },
            defaultInk: 'WATER'
        },
        'GEAR FOR SPORT': {
            defaultInk: 'WATER' // Por defecto Waterbase (punto 3)
        },
        'DEFAULT': {
            defaultInk: 'PLASTISOL' // Regla 3: Cualquier otro brand, Plastisol por defecto
        }
    };

    const SAMPLE_TYPE_SHRINK_RULE = {
        'QRS PPF': 3 // Regla 5: Solo QRS PPF tiene shrink de 3mm
    };

    // --- Palabras clave para detectar técnica ---
    const TECH_KEYWORDS = {
        SCREENPRINT: ['SCREEN PRINT', 'SCREENPRINT', 'SCREEN'],
        SUBLIMATION: ['SUBLIMATION', 'SUB', 'SUBLI'],
        EMBROIDERY: ['EMBROIDERY', 'EMB', 'EMBROIDER']
    };

    // --- Función auxiliar para limpiar y normalizar texto ---
    function normalizeText(text) {
        return (text || '').toString().trim().toUpperCase().replace(/\s+/g, ' ');
    }

    // --- 1. FILTRO DE TÉCNICA (Regla 1) ---
    function filterScreenprint(orders) {
        if (!Array.isArray(orders)) return [];

        return orders.filter(order => {
            const technique = normalizeText(order.technique || order.Technique || '');
            // Incluir si contiene palabras de Screenprint y NO contiene Sublimation/Embroidery
            const isScreenprint = TECH_KEYWORDS.SCREENPRINT.some(keyword => technique.includes(keyword));
            const isOtherTech = [...TECH_KEYWORDS.SUBLIMATION, ...TECH_KEYWORDS.EMBROIDERY].some(keyword => technique.includes(keyword));
            
            return isScreenprint && !isOtherTech;
        });
    }

    // --- 2. RESOLVER TIPO DE TINTA (Regla 3) ---
    function resolveInkType(order) {
        const brand = normalizeText(order.brand || order.customer || 'DEFAULT');
        const description = order.description || order.application || '';
        
        let inkType = 'PLASTISOL'; // Default global

        // Buscar reglas específicas por brand
        for (const [brandKey, rules] of Object.entries(BRAND_RULES)) {
            if (brand.includes(brandKey)) {
                if (rules.resolveInk) {
                    inkType = rules.resolveInk(description);
                } else {
                    inkType = rules.defaultInk;
                }
                break;
            }
        }

        // Sobrescribir si la descripción menciona tinta explícitamente (ej: "Waterbased Ink")
        const descUpper = description.toUpperCase();
        if (descUpper.includes('SILICONE')) inkType = 'SILICONE';
        else if (descUpper.includes('WATERBASE') || descUpper.includes('WATER BASE')) inkType = 'WATER';
        // Nota: 'PLASTISOL' podría ser explícito, pero el default ya lo cubre.

        return inkType;
    }

    // --- 3. EVALUAR SI ES STRIKEOFF (Regla 4) ---
    function isStrikeoff(order) {
        const sampleType = normalizeText(order.sampleType || order.sample || '');
        return sampleType === 'STRIKEOFF';
    }

    // --- 4. RESOLVER VALOR DE SHRINK (Regla 5) ---
    function resolveShrink(order) {
        const sampleType = normalizeText(order.sampleType || order.sample || '');
        return SAMPLE_TYPE_SHRINK_RULE[sampleType] || 0;
    }

    // --- 5. APLICAR AJUSTE A SLEEVE (Regla 6) ---
    function applySleeveAdjustment(placement, shrinkValue) {
        // Solo aplicar si es Sleepe y sampleType es QRS PPF (shrinkValue > 0 indica que aplica)
        if (!placement || placement.type !== 'SLEEVE' || shrinkValue <= 0) {
            return placement; // Devolver el placement sin cambios
        }

        // --- IMPORTANTE: Lógica de traslación ---
        // La regla dice mover TODO el arte de la manga hacia arriba 3mm (shrinkValue).
        // En nuestro modelo de datos, un placement es UNA sola entidad que contiene
        // todo el arte de esa ubicación (líneas, swoosh, números).
        
        // La implementación más limpia es añadir un modificador de posición al placement.
        // Luego, el generador de PDF (o el que dibuje) debe usar estos valores.

        const adjustedPlacement = {
            ...placement,
            adjusted: true, // Marcador para saber que fue ajustado
            originalPosition: placement.position || { x: 0, y: 0 }, // Guardar original si existe
            position: { // Nueva posición con el ajuste
                x: placement.position?.x || 0,
                y: (placement.position?.y || 0) - shrinkValue // Mover hacia ARRIBA (restar en Y, asumiendo Y positivo hacia abajo)
            },
            adjustmentNote: `Arte de manga movido ${shrinkValue}mm hacia arriba (alejándose del ruedo).`
        };

        // Si el placement no tenía un objeto 'position', creamos uno.
        if (!adjustedPlacement.position) {
            adjustedPlacement.position = { x: 0, y: 0 - shrinkValue };
        }

        return adjustedPlacement;
    }

    // --- 6. GENERAR COLORES ADICIONALES PARA SILICONE (Parte A / Parte B) (Regla 3) ---
    function getSiliconeColors() {
        return [
            { type: 'COLOR', val: 'PARTE A - SILICONE', screenLetter: 'A', mesh: '43/80' },
            { type: 'COLOR', val: 'PARTE B - CATALYST', screenLetter: 'B', mesh: '43/80' }
        ];
    }

    // --- 7. PROCESAR UN PEDIDO COMPLETO (Orden de Ejecución, Regla 7) ---
    function processOrder(rawOrder) {
        // 1. Asegurar que tenemos un objeto
        const order = { ...rawOrder };

        // 2. Filtrar por técnica (si es un array de órdenes, se haría antes)
        // Asumimos que 'order' ya es un ítem de screenprint.

        // 3. Determinar InkType
        order.inkType = resolveInkType(order);

        // 4. Determinar si es Strikeoff
        const strikeoff = isStrikeoff(order);
        order.isStrikeoff = strikeoff;

        // Si es Strikeoff, no procesamos placements de prenda
        if (strikeoff) {
            order.placements = []; // Vaciar placements
            order.note = "STRIKEOFF: Solo prueba de tinta/diseño. No se generan placements.";
            return order;
        }

        // 5. Resolver Shrink
        const shrinkValue = resolveShrink(order);
        order.shrink = shrinkValue;

        // 6. Procesar placements (asumiendo que vienen en order.placements)
        if (order.placements && Array.isArray(order.placements)) {
            const processedPlacements = [];

            order.placements.forEach((placement, index) => {
                let processedPlacement = { ...placement };

                // --- Regla 2: Detectar placements individuales ---
                // Si el placement viene como un string "Front, Shoulder & Back", lo separamos
                if (typeof placement === 'string') {
                    const types = placement.split(/[,&]/).map(t => t.trim().toUpperCase());
                    types.forEach(type => {
                        if (type) {
                            processedPlacements.push({
                                id: `${order.id || 'order'}_${type}_${index}`,
                                type: type,
                                original: placement
                            });
                        }
                    });
                    return; // Saltar el resto del procesamiento para este string
                }

                // Si ya es un objeto, procesamos normalmente
                // 7. Ajustar Sleeve si aplica
                if (processedPlacement.type === 'SLEEVE') {
                    processedPlacement = applySleeveAdjustment(processedPlacement, shrinkValue);
                }

                // 8. Agregar colores de Silicone si es necesario
                if (order.inkType === 'SILICONE') {
                    const siliconeColors = getSiliconeColors();
                    processedPlacement.colors = [
                        ...(processedPlacement.colors || []),
                        ...siliconeColors
                    ];
                }

                processedPlacements.push(processedPlacement);
            });

            order.placements = processedPlacements;
        }

        return order;
    }

    // --- API Pública ---
    const RulesEngine = {
        filterScreenprint,
        resolveInkType,
        isStrikeoff,
        resolveShrink,
        applySleeveAdjustment,
        getSiliconeColors,
        processOrder
    };

    // Exponer globalmente
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RulesEngine;
    } else {
        global.RulesEngine = RulesEngine;
    }

})(typeof window !== 'undefined' ? window : globalThis);
