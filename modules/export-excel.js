// =====================================================
// EXPORTAR A EXCEL (CALCULADORA)
// =====================================================

function getPlacementsForExcelExport(sourcePlacements = []) {
    const expanded = [];

    sourcePlacements.forEach((placement) => {
        const rawType = String(placement.type || '').replace('CUSTOM: ', '').trim().toUpperCase();

        if (placement.isPaired || rawType === 'SLEEVE' || rawType === 'SHOULDER') {
            expanded.push({ ...placement, excelPlacementType: `LEFT ${rawType}` });
            expanded.push({ ...placement, excelPlacementType: `RIGHT ${rawType}` });
            return;
        }

        expanded.push({ ...placement, excelPlacementType: rawType || String(placement.type || '') });
    });

    return expanded;
}

function normalizeColorNameForCounting(name = '') {
    return String(name || '')
        .toUpperCase()
        .replace(/\s*\(\d+\)\s*$/, '')
        .trim();
}

function countScreensFromSequence(sequence = []) {
    return sequence.filter((step) => {
        const type = String(step?.type || step?.tipo || '').toUpperCase();
        return type !== 'FLASH' && type !== 'COOL';
    }).length;
}

function countStationsFromSequence(sequence = []) {
    return Array.isArray(sequence) ? sequence.length : 0;
}

function countUniquePrintedColors(placement = {}) {
    const sequence = Array.isArray(placement.sequence) ? placement.sequence : [];
    const fromSequence = sequence
        .filter((step) => {
            const type = String(step?.type || step?.tipo || '').toUpperCase();
            return type === 'COLOR' || type === 'METALLIC';
        })
        .map((step) => normalizeColorNameForCounting(step?.val || step?.nombre || ''))
        .filter(Boolean);

    const fallbackColors = Array.isArray(placement.colors)
        ? placement.colors
            .filter((item) => {
                const type = String(item?.type || '').toUpperCase();
                return type === 'COLOR' || type === 'METALLIC';
            })
            .map((item) => normalizeColorNameForCounting(item?.val || ''))
            .filter(Boolean)
        : [];

    const allColors = fromSequence.length > 0 ? fromSequence : fallbackColors;
    return new Set(allColors).size;
}

function getInkTypeLabel(inkType) {
    const normalized = String(inkType || '').toUpperCase();
    if (normalized === 'PLASTISOL') return 'PLASTISOL';
    if (normalized === 'SILICONE') return 'SILICONE';
    return 'WB MAGNA';
}

function getColorCode(colorway = '') {
    const raw = String(colorway || '').trim();
    if (!raw) return '';
    if (raw.includes('-')) return raw.split('-')[0].trim();
    const match = raw.match(/^([A-Z0-9]{2,6})/i);
    return match ? match[1].toUpperCase() : raw.toUpperCase();
}

function exportToExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            if (typeof showStatus === 'function') showStatus('❌ Error: Biblioteca Excel no cargada', 'error');
            return;
        }

        if (typeof buildSpecData !== 'function') {
            if (typeof showStatus === 'function') showStatus('❌ Error: buildSpecData() no encontrado', 'error');
            return;
        }

        const fullData = buildSpecData();
        const placements = getPlacementsForExcelExport(fullData.placements || []);

        const headers = [
            'Area', 'Designer', 'Customer', 'Division', 'SEASON Style1', 'TEAM', 'DESCRIPTION', 'PLAYER= # & Name', 'COLORWAY', 'COLOR CODE',
            'PLACEMENTS', 'CP / FG', '#  DE SPEC', '# SCREENS + Iron Plate', 'NUMBER OF COLORS', '# STATION', '# SET UP', 'SIZE RANGE', ' WIDTH', ' HEIGHT',
            'TYPE OF ART', 'INK TYPE', 'SPECIAL EFFECT # 4', 'CATEGORY.', 'PREFERD PRESSES', 'ADDITIONAL PRESSES', 'CATAGORY PRESSES2', 'ADDITIONAL PRESSES3',
            'UPDATED', 'SAMPLE TYPE', '# Arts Seps', 'Spec Qty', 'PL', 'Item', 'Time (Min)', 'Worked %', 'LAST TRACKING DATE', 'STATUS', 'COMMENTS',
            'DESCRIPTION ISSUES', 'DATE OF ISSUE', 'QTY OF ISSUES', 'EXTERNAL/INTERNAL ISSUES', 'responsible Designer', 'TYPE OF ISSUE', '', '', '',
            'SPECIAL EFFECT # 1', 'DIFFICULTY # 1', 'SPECIAL EFFECT # 2', 'DIFFICULTY # 2', 'Special Effect 1 + 2', 'DIFFICULTY SE 1 + 2',
            'SPECIAL EFFECT # 3', 'DIFFICULTY # 3', '# SPECIAL EFFECT', 'DIFFICULTY CODE', 'FORMULA CODE ANEXO', 'DIFFICULTY CODE'
        ];

        const baseData = {
            area: 'Development',
            designer: fullData.designer || '',
            customer: fullData.customer || '',
            division: 'NFL / jersey',
            seasonStyle: `${fullData.season || ''} ${fullData.style || ''}`.trim(),
            team: fullData.nameTeam || '',
            colorway: fullData.colorway || '',
            colorCode: getColorCode(fullData.colorway || ''),
            specNumber: fullData.folder || '',
            sizeRange: fullData.baseSize || 'L',
            sampleType: fullData.sampleType || ''
        };

        const rows = (placements.length > 0 ? placements : [{}]).map((placement, index) => {
            const sequence = Array.isArray(placement.sequence) ? placement.sequence : [];
            const screens = countScreensFromSequence(sequence);
            const stations = countStationsFromSequence(sequence);
            const numberOfColors = countUniquePrintedColors(placement);

            const width = placement.width || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).width : '');
            const height = placement.height || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).height : '');

            const rowMap = {
                'Area': baseData.area,
                'Designer': baseData.designer,
                'Customer': baseData.customer,
                'Division': baseData.division,
                'SEASON Style1': baseData.seasonStyle,
                'TEAM': baseData.team,
                'DESCRIPTION': placement.placementDetails || placement.name || '',
                'PLAYER= # & Name': '',
                'COLORWAY': baseData.colorway,
                'COLOR CODE': baseData.colorCode,
                'PLACEMENTS': String(placement.excelPlacementType || placement.type || '').replace('CUSTOM: ', ''),
                'CP / FG': '',
                '#  DE SPEC': baseData.specNumber || `SPEC ${index + 1}`,
                '# SCREENS + Iron Plate': screens,
                'NUMBER OF COLORS': numberOfColors,
                '# STATION': stations,
                '# SET UP': 1,
                'SIZE RANGE': placement.baseSize || baseData.sizeRange,
                ' WIDTH': width ? `${width}"` : '',
                ' HEIGHT': height ? `${height}"` : '',
                'TYPE OF ART': 'Vector',
                'INK TYPE': getInkTypeLabel(placement.inkType),
                'SAMPLE TYPE': baseData.sampleType,
                'STATUS': '',
                'COMMENTS': ''
            };

            return headers.map((header) => rowMap[header] ?? '');
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = headers.map((header) => ({ wch: Math.max(10, String(header || '').length + 2) }));

        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

        const fileName = `Calculadora_${fullData.style || 'Spec'}_${fullData.folder || '00000'}.xlsx`;
        XLSX.writeFile(wb, fileName);

        if (typeof showStatus === 'function') showStatus('📊 Spec Excel generada correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        if (typeof showStatus === 'function') showStatus('❌ Error al generar Spec Excel: ' + error.message, 'error');
    }
}
