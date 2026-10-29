// general-info-service.js - Reglas y utilidades para Información General
(function () {
    function extractGenderFromStyle(style, customer = '') {
        if (!style) return '';

        try {
            const styleStr = style.toString().toUpperCase().trim();
            const customerStr = String(customer || '').toUpperCase().trim();

            // Fanatics NFL jersey convention (ej: 67NM / 67NW, 31NM / 31NW)
            // NM = Men, NW = Women
            const fanaticsNMatch = styleStr.match(/(?:^|[^A-Z0-9])(?:67|31)N([MW])(?:[^A-Z0-9]|$)/);
            if (fanaticsNMatch && fanaticsNMatch[1]) {
                return fanaticsNMatch[1] === 'W' ? 'Women' : 'Men';
            }

            // Fallback for other two-digit prefixes that still use NM/NW convention
            const genericNMatch = styleStr.match(/(?:^|[^A-Z0-9])\d{2}N([MW])(?:[^A-Z0-9]|$)/);
            if (genericNMatch && genericNMatch[1] && (customerStr.includes('FANATICS') || customerStr.includes('FANATIC'))) {
                return genericNMatch[1] === 'W' ? 'Women' : 'Men';
            }

            if (window.SchoolsConfig && window.SchoolsConfig.extractGenderFromStyle) {
                const gender = window.SchoolsConfig.extractGenderFromStyle(styleStr);
                if (gender) return gender;
            }

            const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
            if (gearForSportMatch && gearForSportMatch[1]) {
                const genderCode = gearForSportMatch[1];

                if (window.Config && window.Config.GEARFORSPORT_GENDER_MAP) {
                    const fullCode = `U${genderCode}`;
                    if (window.Config.GEARFORSPORT_GENDER_MAP[fullCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
                    }
                    if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
                    }
                }
            }

            const parts = styleStr.split(/[-_ ]/);

            if (window.Config && window.Config.GENDER_MAP) {
                for (const part of parts) {
                    if (window.Config.GENDER_MAP[part]) {
                        return window.Config.GENDER_MAP[part];
                    }
                }
            }

            if (styleStr.includes(' MEN') || styleStr.includes('_M') || styleStr.endsWith('M')) return 'Men';
            if (styleStr.includes(' WOMEN') || styleStr.includes('_W') || styleStr.endsWith('W')) return 'Women';
            if (styleStr.includes(' YOUTH') || styleStr.includes('_Y') || styleStr.endsWith('Y')) return 'Youth';
            if (styleStr.includes(' KIDS') || styleStr.includes('_K') || styleStr.endsWith('K')) return 'Kids';
            if (styleStr.includes(' UNISEX') || styleStr.includes('_U') || styleStr.endsWith('U')) return 'Unisex';
        } catch (error) {
            console.warn('Error en extractGenderFromStyle:', error);
        }

        return '';
    }

    function normalizeGenderValue(rawGender, style = '', customer = '') {
        const normalizedRaw = String(rawGender || '').trim();
        if (!normalizedRaw) return extractGenderFromStyle(style, customer);

        const upper = normalizedRaw.toUpperCase();

        if (upper.includes('WOMEN') || upper.includes('WOMAN') || upper.includes('LADIES') || upper === 'W') return 'Women';
        if (upper.includes('MEN') || upper.includes('MAN') || upper === 'M') return 'Men';
        if (upper.includes('YOUTH') || upper === 'Y') return 'Youth';
        if (upper.includes('KID') || upper.includes('TODDLER') || upper === 'K') return 'Kids';
        if (upper.includes('UNISEX') || upper === 'U') return 'Unisex';

        return normalizedRaw;
    }

    function extractBaseSizeFromGrid(grid) {
        if (!Array.isArray(grid) || grid.length === 0) return '';

        const normalizeSize = (raw) => {
            const text = String(raw || '').trim().toUpperCase();
            if (!text) return '';
            if (text.includes('BASE SIZE') || text === 'SIZE' || text.includes('MEASUREMENT')) return '';

            const sizeMatch = text.match(/\b(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL)\b/);
            if (!sizeMatch) return '';

            const normalized = sizeMatch[1];
            if (normalized === 'XXXL') return '3XL';
            if (normalized === 'XXL') return '2XL';
            return normalized;
        };

        // Preferencia SWO/PPS: fila 16, columnas C:J
        if (grid[15]) {
            for (let col = 2; col <= 9; col++) {
                const candidate = normalizeSize(grid[15][col]);
                if (candidate) return candidate;
            }
        }

        // Fallback: buscar etiqueta BASE SIZE en cualquier fila
        for (const row of grid) {
            if (!Array.isArray(row) || row.length === 0) continue;

            for (let col = 0; col < row.length; col++) {
                const label = String(row[col] || '').toUpperCase();
                if (!label.includes('BASE SIZE')) continue;

                const sameRow = normalizeSize(row[col + 1]);
                if (sameRow) return sameRow;
            }
        }

        return '';
    }

    window.GeneralInfoService = {
        extractGenderFromStyle,
        normalizeGenderValue,
        extractBaseSizeFromGrid
    };

    console.log('✅ GeneralInfoService cargado correctamente');
})();
