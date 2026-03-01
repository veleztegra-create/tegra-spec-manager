// rules-engine.js - Motor de reglas centralizado
// Mantiene separación: placement.colors (solo tintas) vs placement.sequence (incluye FLASH/COOL)

window.RulesEngine = (function () {
    const SPECIAL_COLORS = {
        '77c gold': {
            identificadores: ['77c', '77c gold', 'gold 77c'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        },
        '78h amarillo': {
            identificadores: ['78h', '78h amarillo', 'amarillo 78h'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        },
        '761 university gold': {
            identificadores: ['761', '761 gold', 'university gold'],
            mallas: ['157', '198', '110'],
            aditivos: '3% CL 500 · 5% ecofix XL'
        }
    };

    const BASE_PRESETS = {
        WATER: {
            inkType: 'WATER',
            blocker: { nombre: 'BLOCKER CHT', additives: '' },
            whiteBase: { nombre: 'AquaFlex V2', additives: '' },
            whiteBaseWithCatalyst: { mesh: '122', additives: '3% CL 500' },
            color: { additives: '3% CL 500 · 5% ecofix XL' },
            curing: { temp: '320 °F', time: '1:40 min' }
        },
        PLASTISOL: {
            inkType: 'PLASTISOL',
            blocker: { nombre: 'BARRIER BASE', additives: '', meshDark1: '110/64', meshDark2: '122/55', meshDark3: '157' },
            whiteBase: { nombre: 'Poly White', additives: '' },
            whiteBaseWithCatalyst: { mesh: '122', additives: '' },
            color: { additives: '' },
            curing: { temp: '320 °F', time: '1:00 min' }
        },
        SILICONE: {
            inkType: 'SILICONE',
            blocker: { nombre: 'Bloquer Libra', additives: '' },
            whiteBase: { nombre: 'BASE WHITE LIBRA', additives: '' },
            whiteBaseWithCatalyst: { mesh: '122', additives: '' },
            color: { additives: '' },
            curing: { temp: '320 °F', time: '1:40 min' }
        }
    };

    function clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        const telaLower = colorTela.toLowerCase();
        const oscuras = ['negro', 'black', 'navy', 'charcoal', 'maroon', 'dark', 'oscuro', 'midnight', 'azul marino'];
        return oscuras.some((o) => telaLower.includes(o)) ? 'oscura' : 'clara';
    }

    function clasificarColor(colorName) {
        if (!colorName) return { tipo: 'desconocido', esClaro: false, esOscuro: true };
        const colorLower = colorName.toLowerCase().trim();
        const claros = [
            'amarillo', 'yellow', 'oro', 'gold', 'naranja', 'orange', 'rosa', 'pink', 'beige', 'crema',
            'ivory', 'blanco', 'white', 'limon', 'lemon', 'dorado', '123', '124', '125', '127', '128',
            '129', '136', '137', '138', '1495', '1505', '176', '177', '178', '196', '197', '198', '256',
            '257', '258', '263', '264', '265', '270', '271', '272', '277', '278', '279', '283', '284',
            '285', '297', '298', '299', '317', '318', '319', '337', '338', '339', '362', '363', '364',
            '374', '375', '376', '380', '381', '382', '386', '387', '388', '393', '394', '395', '396',
            '397', '398', '3965', '3975', '3985', '801', '802', '803', '804', '805', '806'
        ];
        const oscuros = [
            'rojo', 'red', 'azul', 'blue', 'verde', 'green', 'morado', 'purple', 'marron', 'brown',
            'negro', 'black', 'gris', 'gray', 'grey', 'navy', 'charcoal', 'maroon', 'crimson', '186', '187',
            '188', '194', '195', '200', '201', '202', '208', '209', '210', '216', '217', '218', '221',
            '222', '223', '228', '229', '230', '235', '236', '237', '242', '243', '244', '247', '248',
            '249', '252', '253', '254', '259', '260', '261', '262', '266', '267', '268', '273', '274',
            '275', '280', '281', '282', '286', '287', '288', '289', '294', '295', '296', '300', '301',
            '302', '307', '308', '309', '316'
        ];

        if (claros.some((c) => colorLower.includes(c))) return { tipo: 'claro', esClaro: true, esOscuro: false };
        if (oscuros.some((o) => colorLower.includes(o))) return { tipo: 'oscuro', esClaro: false, esOscuro: true };
        return { tipo: 'desconocido', esClaro: false, esOscuro: true };
    }

    function esColorEspecial(colorName) {
        const normalized = (colorName || '').toLowerCase().trim();
        return Object.values(SPECIAL_COLORS).find((entry) => entry.identificadores.some((id) => normalized.includes(id))) || null;
    }

    function obtenerPreset(customer, inkType) {
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        const preset = BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER;
        const customerText = String(customer || '').toUpperCase();

        if (selectedInk === 'PLASTISOL' && (customerText.includes('FANATICS') || customerText.includes('FANATIC'))) {
            return {
                ...preset,
                blocker: { ...preset.blocker, nombre: 'BARRIER CHT' },
                whiteBase: { ...preset.whiteBase, nombre: 'AQUAFLEX V2 WHITE' }
            };
        }

        return preset;
    }

    function generateCoreSteps({ customer, garmentColor, inkType = 'WATER', designColors = [] }) {
        const telaType = clasificarTela(garmentColor);
        const preset = obtenerPreset(customer, inkType);
        const steps = [];

        if (telaType === 'oscura') {
            const mesh1 = preset.blocker.meshDark1 || '110';
            const mesh2 = preset.blocker.meshDark2 || '122';
            const mesh3 = preset.blocker.meshDark3 || '157';
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: mesh1, additives: preset.blocker.additives });
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: mesh2, additives: preset.blocker.additives });
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: mesh3, additives: preset.blocker.additives });
        } else {
            steps.push({ tipo: 'BLOCKER', screenLetter: 'A', nombre: preset.blocker.nombre, mesh: '157', additives: preset.blocker.additives });
        }

        const garmentIsMidnightNavy = String(garmentColor || '').toUpperCase().includes('MIDNIGHT NAVY');
        const skipInitialWhite = String(inkType || '').toUpperCase() === 'PLASTISOL' && garmentIsMidnightNavy;
        if (!skipInitialWhite) {
            steps.push({ tipo: 'WHITE_BASE', screenLetter: 'B', nombre: preset.whiteBase.nombre, mesh: '157', additives: preset.whiteBase.additives });
            steps.push({ tipo: 'WHITE_BASE', screenLetter: 'B', nombre: preset.whiteBase.nombre, mesh: preset.whiteBaseWithCatalyst.mesh, additives: preset.whiteBaseWithCatalyst.additives });
        }

        const uniqueColors = [];
        const seen = new Set();
        designColors.forEach((c) => {
            const key = String(c.val || '').toUpperCase().trim();
            if (key && !seen.has(key)) {
                seen.add(key);
                uniqueColors.push(c);
            }
        });

        let numeroColor = 1;
        uniqueColors.forEach((color) => {
            const especial = esColorEspecial(color.val);

            if (especial) {
                especial.mallas.forEach((mesh, index) => {
                    steps.push({
                        tipo: 'COLOR',
                        screenLetter: String(numeroColor),
                        nombre: color.val + (index ? ` (${index + 1})` : ''),
                        mesh,
                        additives: especial.aditivos
                    });
                });
            } else {
                const darkFabric = telaType === 'oscura';
                const malla1 = darkFabric ? '198' : '157';
                const malla2 = darkFabric ? '157' : '198';

                steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: color.val, mesh: malla1, additives: preset.color.additives });
                steps.push({ tipo: 'COLOR', screenLetter: String(numeroColor), nombre: `${color.val} (2)`, mesh: malla2, additives: preset.color.additives });
            }

            numeroColor += 1;
        });

        return steps;
    }

    function generarSecuencia(params) {
        const core = generateCoreSteps(params);
        const sequence = [];
        core.forEach((step, index) => {
            sequence.push(step);
            if (index < core.length - 1) {
                sequence.push({ tipo: 'FLASH', screenLetter: '', nombre: 'FLASH', mesh: '-', additives: '' });
                sequence.push({ tipo: 'COOL', screenLetter: '', nombre: 'COOL', mesh: '-', additives: '' });
            }
        });
        return sequence;
    }

    function getCuringConditions(inkType) {
        const selectedInk = String(inkType || 'WATER').toUpperCase();
        return (BASE_PRESETS[selectedInk] || BASE_PRESETS.WATER).curing;
    }

    return {
        generarSecuencia,
        getCuringConditions,
        clasificarTela,
        clasificarColor,
        esColorEspecial
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RulesEngine actualizado cargado');
});
