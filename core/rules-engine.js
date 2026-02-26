
// rules-engine.js - Motor de reglas CORREGIDO
// Versión: 2.1 - Con secuencias correctas para WATER BASE

window.RulesEngine = (function() {
    // =============================================
    // CONFIGURACIÓN PRIVADA
    // =============================================
    const config = {
        waterBase: { temp: '320 °F', time: '1:40 min' },
        plastisol: { temp: '320 °F', time: '1:00 min' },
        
        // Clasificación de colores
        colorClassification: {
            light: [
                'amarillo', 'yellow', 'oro', 'gold', 'naranja', 'orange',
                'rosa', 'pink', 'beige', 'crema', 'ivory', 'blanco', 'white',
                'limon', 'lemon', 'dorado', '77c', '78h', '761'
            ],
            dark: [
                'rojo', 'red', 'azul', 'blue', 'verde', 'green', 'morado', 'purple',
                'marron', 'brown', 'negro', 'black', 'gris', 'gray', 'grey', 'navy',
                'charcoal', 'maroon', 'crimson'
            ],
            special: {
                '77c gold': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' },
                '78h amarillo': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' },
                '761 university gold': { pantallas: 3, mallas: ['157', '198', '110'], aditivos: '3% CL 500 · 5% ecofix XL' }
            }
        },
        
        // Mallas CORRECTAS para WATER BASE
        defaults: {
            blocker: { 
                nombre: 'Bloquer CHT', 
                mesh1: '110',    // Primer bloqueador
                mesh2: '122',    // Segundo bloqueador
                mesh3: '157',    // Tercer bloqueador
                additives: 'N/A' 
            },
            whiteBase: { 
                nombre: 'AquaFlex V2', 
                mesh1: '110',    // Primera base blanca
                mesh2: '122',    // Segunda base blanca
                mesh3: '198',    // Tercera base blanca (para colores claros)
                additives: 'N/A' 
            },
            whiteBaseWithCatalyst: { 
                nombre: 'AquaFlex V2', 
                mesh: '122',      // Base con catalizador
                additives: '3% CL 500' 
            },
            color: { 
                mesh1: '157',     // Primera pantalla de color
                mesh2: '198',     // Segunda pantalla de color
                additives: '3% CL 500 · 5% ecofix XL' 
            }
        }
    };

    // =============================================
    // FUNCIONES DE CLASIFICACIÓN
    // =============================================
    
    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        const oscuras = ["negro", "black", "navy", "charcoal", "maroon", "dark", "oscuro"];
        return oscuras.some(o => telaLower.includes(o)) ? 'oscura' : 'clara';
    }

    function clasificarColor(colorName) {
        if (!colorName) return { tipo: 'desconocido', esClaro: false, esOscuro: true, esEspecial: null };
        
        const colorLower = colorName.toLowerCase().trim();

        // 1. Verificar si es especial
        for (const [key, especial] of Object.entries(config.colorClassification.special)) {
            if (colorLower.includes(key)) {
                return { 
                    tipo: 'especial', 
                    esClaro: true, 
                    esOscuro: false, 
                    esEspecial: especial 
                };
            }
        }

        // 2. Verificar si es claro
        if (config.colorClassification.light.some(light => colorLower.includes(light))) {
            return { tipo: 'claro', esClaro: true, esOscuro: false, esEspecial: null };
        }

        // 3. Verificar si es oscuro
        if (config.colorClassification.dark.some(dark => colorLower.includes(dark))) {
            return { tipo: 'oscuro', esClaro: false, esOscuro: true, esEspecial: null };
        }

        // 4. Desconocido (por defecto como oscuro)
        return { tipo: 'desconocido', esClaro: false, esOscuro: true, esEspecial: null };
    }

    // =============================================
    // GENERADOR DE SECUENCIA CORREGIDO
    // =============================================
    
    function generarSecuencia(params) {
        const { garmentColor, designColors = [] } = params;
        
        console.log('🎯 MOTOR: Generando secuencia', { garmentColor, designColors });

        // =========================================
        // 1. CLASIFICAR TELA
        // =========================================
        const telaType = clasificarTela(garmentColor);
        console.log(`   📊 Tela: ${telaType}`);

        // =========================================
        // 2. GENERAR SECUENCIA BASE
        // =========================================
        let secuencia = [];
        let letraCounter = 65; // 'A'

        if (telaType === 'oscura') {
            // TELA OSCURA: 3 bloqueadores (todos con A)
            secuencia.push(
                { tipo: 'BLOCKER', nombre: config.defaults.blocker.nombre, screenLetter: 'A', mesh: config.defaults.blocker.mesh1, additives: config.defaults.blocker.additives },
                { tipo: 'BLOCKER', nombre: config.defaults.blocker.nombre, screenLetter: 'A', mesh: config.defaults.blocker.mesh2, additives: config.defaults.blocker.additives },
                { tipo: 'BLOCKER', nombre: config.defaults.blocker.nombre, screenLetter: 'A', mesh: config.defaults.blocker.mesh3, additives: config.defaults.blocker.additives }
            );
            letraCounter = 66; // 'B' para lo que sigue
        } else {
            // TELA CLARA: 2 bases blancas + 1 blocker
            secuencia.push(
                { tipo: 'WHITE_BASE', nombre: config.defaults.whiteBase.nombre, screenLetter: 'A', mesh: config.defaults.whiteBase.mesh1, additives: config.defaults.whiteBase.additives },
                { tipo: 'WHITE_BASE', nombre: config.defaults.whiteBase.nombre, screenLetter: 'B', mesh: config.defaults.whiteBase.mesh2, additives: config.defaults.whiteBase.additives },
                { tipo: 'BLOCKER', nombre: config.defaults.blocker.nombre, screenLetter: 'C', mesh: config.defaults.blocker.mesh3, additives: config.defaults.blocker.additives }
            );
            letraCounter = 68; // 'D' para la base con catalizador
        }

        // =========================================
        // 3. OBTENER COLORES ÚNICOS (para leyenda)
        // =========================================
        const uniqueDesignColors = [];
        const seenColors = new Set();
        designColors.forEach(c => {
            const colorVal = (c.val || '').toUpperCase().trim();
            if (colorVal && !seenColors.has(colorVal)) {
                seenColors.add(colorVal);
                uniqueDesignColors.push(c);
            }
        });

        console.log(`   🎨 Colores únicos:`, uniqueDesignColors.map(c => c.val));

        // =========================================
        // 4. AÑADIR BASE BLANCA CON CATALIZADOR
        // =========================================
        secuencia.push({
            tipo: 'WHITE_BASE',
            screenLetter: String.fromCharCode(letraCounter),
            nombre: config.defaults.whiteBase.nombre,
            mesh: config.defaults.whiteBaseWithCatalyst.mesh,
            additives: config.defaults.whiteBaseWithCatalyst.additives
        });
        letraCounter++; // Avanzamos para el primer color

        // =========================================
        // 5. PROCESAR CADA COLOR
        // =========================================
        for (let i = 0; i < uniqueDesignColors.length; i++) {
            const colorOriginal = uniqueDesignColors[i];
            const clasificacion = clasificarColor(colorOriginal.val);
            const screenLetterBase = String.fromCharCode(letraCounter);

            console.log(`       Color: "${colorOriginal.val}" → ${clasificacion.tipo} (letra ${screenLetterBase})`);

            if (clasificacion.esEspecial) {
                // COLOR ESPECIAL: 3 pantallas con MISMA LETRA
                const especial = clasificacion.esEspecial;
                for (let p = 0; p < especial.pantallas; p++) {
                    secuencia.push({
                        tipo: 'COLOR',
                        screenLetter: screenLetterBase,
                        nombre: colorOriginal.val + (p > 0 ? ` (${p+1})` : ''),
                        mesh: especial.mallas[p],
                        additives: especial.aditivos
                    });
                }
            } else {
                // COLOR NORMAL: 2 pantallas con MISMA LETRA
                secuencia.push(
                    {
                        tipo: 'COLOR',
                        screenLetter: screenLetterBase,
                        nombre: colorOriginal.val,
                        mesh: clasificacion.esOscuro ? config.defaults.color.mesh2 : config.defaults.color.mesh1,
                        additives: config.defaults.color.additives
                    },
                    {
                        tipo: 'COLOR',
                        screenLetter: screenLetterBase,
                        nombre: colorOriginal.val + ' (2)',
                        mesh: clasificacion.esOscuro ? config.defaults.color.mesh1 : config.defaults.color.mesh2,
                        additives: config.defaults.color.additives
                    }
                );
            }

            letraCounter++; // Avanzamos para el próximo color

            // Añadir FLASH y COOL después de cada color (excepto el último)
            if (i < uniqueDesignColors.length - 1) {
                secuencia.push({ tipo: 'FLASH', nombre: 'FLASH', screenLetter: '', mesh: '-', additives: '' });
                secuencia.push({ tipo: 'COOL', nombre: 'COOL', screenLetter: '', mesh: '-', additives: '' });
            }
        }

        console.log(`✅ Secuencia generada (${secuencia.length} pasos)`);
        return secuencia;
    }

    function getCuringConditions(inkType) {
        return inkType === 'PLASTISOL' ? config.plastisol : config.waterBase;
    }

    // API pública
    return {
        generarSecuencia,
        getCuringConditions,
        clasificarColor,
        clasificarTela
    };
})();

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine v2.1 cargado');
});
