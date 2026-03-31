// =====================================================
// EXPORTAR A EXCEL (CALCULADORA) - ESTRUCTURA EXACTA 22 COLUMNAS
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

        const wb = XLSX.utils.book_new();

        // EXACTAMENTE los 22 headers del formato maestro (incluyendo los que van vacíos)
        const headers = [
            'Area',           // 0
            'Designer',       // 1
            'Customer',       // 2
            'Division',       // 3
            'SEASON',         // 4
            '#Folder/SPEC',   // 5
            'Abbreviations',  // 6 - Vacía en maestro
            'Style1',         // 7
            'TEAM',           // 8
            'DESCRIPTION',    // 9 - Vacía en maestro
            'COLORWAY',       // 10
            'PLACEMENTS',     // 11
            'SPEC #',         // 12
            '#SCREEEN',       // 13
            'NO. COLORES',    // 14
            'Stations',       // 15
            'setup',          // 16
            'size',           // 17
            'W',              // 18
            'H',              // 19
            'TYPE OF ART',    // 20
            'INK TYPE'        // 21
        ];

        const rows = [];
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

                let inkType = 'WB MAGNA';
                if (placement.inkType === 'WATER') inkType = 'WB MAGNA';
                if (placement.inkType === 'PLASTISOL') inkType = 'PLASTISOL';
                if (placement.inkType === 'SILICONE') inkType = 'SILICONE';

                const width = placement.width || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).width : '');
                const height = placement.height || (typeof extractDimensions === 'function' && placement.dimensions ? extractDimensions(placement.dimensions).height : '');

                // EXACTAMENTE 22 columnas en el mismo orden que el maestro
                const row = [
                    'Development',                    // 0: Area
                    fullData.designer || '',          // 1: Designer
                    fullData.customer || '',          // 2: Customer
                    'NFL / jersey',                   // 3: Division
                    fullData.season || '',            // 4: SEASON
                    fullData.folder || '',            // 5: #Folder/SPEC
                    '',                               // 6: Abbreviations (VACÍA - igual que maestro)
                    fullData.style || '',             // 7: Style1
                    fullData.nameTeam || '',          // 8: TEAM
                    '',                               // 9: DESCRIPTION (VACÍA - igual que maestro)
                    fullData.colorway || '',          // 10: COLORWAY
                    placementType,                    // 11: PLACEMENTS
                    `SPEC ${index + 1}`,              // 12: SPEC #
                    screenCount,                      // 13: #SCREEEN
                    colorCount,                       // 14: NO. COLORES
                    stationCount,                     // 15: Stations
                    1,                                // 16: setup
                    'L',                              // 17: size
                    width ? `${width}"` : '',         // 18: W
                    height ? `${height}"` : '',       // 19: H
                    'Vector',                         // 20: TYPE OF ART
                    inkType                           // 21: INK TYPE
                ];

                rows.push(row);
            });
        } else {
            // Fila por defecto con las 22 columnas exactas
            const defaultRow = [
                'Development',           // 0
                fullData.designer || '', // 1
                fullData.customer || '', // 2
                'NFL / jersey',          // 3
                fullData.season || '',   // 4
                fullData.folder || '',   // 5
                '',                      // 6: Abbreviations (vacía)
                fullData.style || '',    // 7
                fullData.nameTeam || '', // 8
                '',                      // 9: DESCRIPTION (vacía)
                fullData.colorway || '', // 10
                'front',                 // 11
                'SPEC 1',                // 12
                0,                       // 13
                0,                       // 14
                0,                       // 15
                1,                       // 16
                'L',                     // 17
                '15.34"',                // 18
                '12"',                   // 19
                'Vector',                // 20
                'WB MAGNA'               // 21
            ];

            rows.push(defaultRow);
        }

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Anchos optimizados para cada una de las 22 columnas
        const colWidths = [
            { wch: 12 },  // 0: Area
            { wch: 12 },  // 1: Designer
            { wch: 15 },  // 2: Customer
            { wch: 15 },  // 3: Division
            { wch: 35 },  // 4: SEASON (ancho aumentado para texto largo)
            { wch: 15 },  // 5: #Folder/SPEC
            { wch: 12 },  // 6: Abbreviations
            { wch: 12 },  // 7: Style1
            { wch: 25 },  // 8: TEAM
            { wch: 20 },  // 9: DESCRIPTION
            { wch: 15 },  // 10: COLORWAY
            { wch: 12 },  // 11: PLACEMENTS
            { wch: 10 },  // 12: SPEC #
            { wch: 10 },  // 13: #SCREEEN
            { wch: 12 },  // 14: NO. COLORES
            { wch: 10 },  // 15: Stations
            { wch: 8 },   // 16: setup
            { wch: 8 },   // 17: size
            { wch: 10 },  // 18: W
            { wch: 10 },  // 19: H
            { wch: 12 },  // 20: TYPE OF ART
            { wch: 12 }   // 21: INK TYPE
        ];
        ws['!cols'] = colWidths;

        // Estilos para headers
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

        const fileName = `Calculadora_${fullData.style || 'Spec'}_${fullData.folder || '00000'}.xlsx`;
        XLSX.writeFile(wb, fileName);

        if (typeof showStatus === 'function') showStatus('📊 Spec Excel generada correctamente', 'success');

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        if (typeof showStatus === 'function') showStatus('❌ Error al generar Spec Excel: ' + error.message, 'error');
    }
}
