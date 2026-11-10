// Size Set extractor: preserve explicit sizes found in the SWO SIZE BREAKDOWN header.
(function (global) {
    'use strict';
    const SIZE_TOKENS = new Set([
        'XXS','2XS','XS','XSM','S','SM','M','MD','MED','L','LG','XL','X-LARGE',
        '2XL','XXL','XXLARGE','3XL','XXXL','4XL','5XL','6XL','7XL','8XL',
        '2X','3X','4X','5X','6X','2XLT','3XLT','4XLT','LT','XLT',
        'OS','OSFA','ONESIZE','ONE SIZE','YXS','YS','YM','YL','YXL',
        '0','2','4','6','8','10','12','14','16','18','20','22','24','26','28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'
    ]);
    const normalize = value => String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
    const isSize = value => SIZE_TOKENS.has(normalize(value));
    const hasSizeBreakdown = grid => Array.isArray(grid) && grid.some(row =>
        Array.isArray(row) && row.some(cell => /SIZE\s*BREAKDOWN/i.test(String(cell ?? '')))
    );

    function extractRequestedSizesFromGrid(grid) {
        if (!Array.isArray(grid)) return [];
        const sectionIndex = grid.findIndex(row =>
            Array.isArray(row) && row.some(cell => /SIZE\s*BREAKDOWN/i.test(String(cell ?? '')))
        );
        const start = sectionIndex >= 0 ? sectionIndex : 0;
        const end = sectionIndex >= 0 ? Math.min(grid.length, sectionIndex + 8) : Math.min(grid.length, 25);
        let best = [];
        for (let rowIndex = start; rowIndex < end; rowIndex++) {
            const row = grid[rowIndex];
            if (!Array.isArray(row)) continue;
            // Blank spacer cells are valid; continue scanning later columns.
            const sizes = row.map(normalize).filter(isSize);
            const unique = [...new Set(sizes)];
            if (unique.length > best.length) best = unique;
            if (sectionIndex >= 0 && rowIndex > sectionIndex && unique.length >= 2) return unique;
        }
        return best;
    }

    // A SWO workbook may contain several Proto sheets plus a separate PPS sheet.
    // Read every sheet with an explicit SIZE BREAKDOWN and keep the fullest header.
    function extractRequestedSizesFromWorkbook(workbook) {
        const result = { sheetName: '', sizes: [] };
        const xlsx = global.XLSX;
        if (!workbook || !Array.isArray(workbook.SheetNames) ||
            !workbook.Sheets || !xlsx?.utils?.sheet_to_json) return result;

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) continue;
            let grid;
            try {
                grid = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            } catch (error) {
                console.warn('No se pudo leer Size Breakdown de la hoja:', sheetName, error);
                continue;
            }
            if (!hasSizeBreakdown(grid)) continue;
            const sizes = extractRequestedSizesFromGrid(grid);
            if (sizes.length > result.sizes.length) {
                result.sheetName = sheetName;
                result.sizes = sizes;
            }
        }
        return result;
    }

    function formatSizeSetLabel(sizes) {
        return Array.isArray(sizes) && sizes.length ? `SIZESET / ${sizes.join('-')}` : '';
    }
    global.SizeSetExtractor = {
        extractRequestedSizesFromGrid,
        extractRequestedSizesFromWorkbook,
        formatSizeSetLabel
    };
})(typeof window !== 'undefined' ? window : globalThis);
