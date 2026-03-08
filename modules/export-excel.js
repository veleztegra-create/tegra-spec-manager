// =====================================================
// EXPORTAR A EXCEL (CALCULADORA) - VERSIÓN CORREGIDA
// =====================================================

function getPlacementsForExcelExport(sourcePlacements = []) {
    const expanded = [];

    sourcePlacements.forEach((placement) => {
        const rawType = String(placement.type || '').replace('CUSTOM: ', '').trim().toUpperCase();

        // Usar la bandera isPaired para decidir si expandir
        if (placement.isPaired || rawType === 'SLEEVE' || rawType === 'SHOULDER') {
            expanded.push({
                ...placement,
                excelPlacementType: `LEFT ${rawType}`,
                type: `LEFT ${rawType}`
            });
            expanded.push({
                ...placement,
                excelPlacementType: `RIGHT ${rawType}`,
                type: `RIGHT ${rawType}`
            });
            return;
        }

        expanded.push({ ...placement, excelPlacementType: rawType || String(placement.type || '') });
    });

    return expanded;
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

        // Obtener los datos centralizados
        const fullData = buildSpecData();

        // Mapear los datos generales de la forma en que lo requiere Excel
        const data = {
            designer: fullData.designer,
            customer: fullData.customer,
            season: fullData.season,
            folder: fullData.folder,
            nameTeam: fullData.nameTeam,
            colorway: fullData.colorway,
            style: fullData.style
        };

        const wb = XLSX.utils.book_new();

        const headers = [
            'Area', 'Designer', 'Customer', 'Division', 'SEASON',
            '', '#Folder/SPEC', '', '', '', '', '', '', '', '', '', '', '', '', '',
            'TEAM', '', '', 'COLORWAY', '', 'PLACEMENTS', '', 'SPEC #', '#SCREEEN',
            'NO. COLORES', 'Stations', 'setup', 'size', 'W', 'H', 'TYPE OF ART', 'INK TYPE'
        ];

        const rows = [];

        // Usar los placements del objeto de datos centralizado
        const dataPlacements = fullData.placements || [];

        if (dataPlacements && Array.isArray(dataPlacements) && dataPlacements.length > 0) {
            const exportPlacements = getPlacementsForExcelExport(dataPlacements);

            exportPlacements.forEach((placement, index) => {
                const placementType = (typeof normalizeTextValue === 'function' ? normalizeTextValue : (v => v || ''))(placement.excelPlacementType, placement.type)
                    .replace('CUSTOM: ', '')
                    .toLowerCase();

                const screenCount = placement.sequence ? placement.sequence.length : 0;
                const colorCount = placement.colors ? placement.colors.length : 0;
                const stationCount = screenCount;
                const artType = 'Vector';

                let inkType = 'WB MAGNA';
                if (placement.inkType === 'WATER') inkType = 'WB MAGNA';
                if (placement.inkType === 'PLASTISOL') inkType = 'PLASTISOL';
                if (placement.inkType === 'SILICONE') inkType = 'SILICONE';

                const width = placement.width || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).width : '');
                const height = placement.height || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).height : '');

                const row = [
                    'Development',
                    data.designer,
                    data.customer,
                    'NFL / jersey',
                    data.season,
                    '',
                    data.folder,
                    '', '', '', '', '', '', '', '', '', '', '', '', '',
                    data.nameTeam,
                    '', '',
                    data.colorway,
                    '',
                    placementType,
                    '',
                    `SPEC ${index + 1}`,
                    screenCount,
                    colorCount,
                    stationCount,
                    1,
                    'L',
                    `${width}"`,
                    `${height}"`,
                    artType,
                    inkType
                ];

                rows.push(row);
            });
        } else {
            const defaultRow = [
                'Development',
                data.designer,
                data.customer,
                'NFL / jersey',
                data.season,
                '',
                data.folder,
                '', '', '', '', '', '', '', '', '', '', '', '', '',
                data.nameTeam,
                '', '',
                data.colorway,
                '',
                'front',
                '',
                'SPEC 1',
                0,
                0,
                0,
                1,
                'L',
                '15.34"',
                '12"',
                'Vector',
                'WB MAGNA'
            ];

            rows.push(defaultRow);
        }

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const colWidths = [];
        for (let i = 0; i < headers.length; i++) {
            if (i === 0) colWidths.push({ wch: 12 });
            else if (i === 1) colWidths.push({ wch: 12 });
            else if (i === 2) colWidths.push({ wch: 15 });
            else if (i === 3) colWidths.push({ wch: 15 });
            else if (i === 4) colWidths.push({ wch: 8 });
            else if (i === 6) colWidths.push({ wch: 12 });
            else if (i === 20) colWidths.push({ wch: 25 });
            else if (i === 23) colWidths.push({ wch: 15 });
            else if (i === 25) colWidths.push({ wch: 12 });
            else if (i === 27) colWidths.push({ wch: 8 });
            else if (i === 28) colWidths.push({ wch: 10 });
            else if (i === 29) colWidths.push({ wch: 12 });
            else if (i === 30) colWidths.push({ wch: 10 });
            else if (i === 34) colWidths.push({ wch: 10 });
            else if (i === 35) colWidths.push({ wch: 12 });
            else colWidths.push({ wch: 3 });
        }
        ws['!cols'] = colWidths;

        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;

            if (headers[C] && headers[C] !== '') {
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

        const fileName = `Calculadora_${data.style || 'Spec'}_${data.folder || '00000'}.xlsx`;
        XLSX.writeFile(wb, fileName);

        if (typeof showStatus === 'function') showStatus('📊 Spec Excel generada correctamente', 'success');

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        if (typeof showStatus === 'function') showStatus('❌ Error al generar Spec Excel: ' + error.message, 'error');
    }
}
