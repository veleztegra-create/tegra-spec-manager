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
    const normalize = value => String(value ?? '').trim().toUpperCase().replace(/\\s+/g, ' ');
    const isSize = value => SIZE_TOKENS.has(normalize(value));

    function extractRequestedSizesFromGrid(grid) {
        if (!Array.isArray(grid)) return [];
        const sectionIndex = grid.findIndex(row =>
            Array.isArray(row) && row.some(cell => /SIZE\\s*BREAKDOWN/i.test(String(cell ?? '')))
        );
        const start = sectionIndex >= 0 ? sectionIndex : 0;
        const end = sectionIndex >= 0 ? Math.min(grid.length, sectionIndex + 8) : Math.min(grid.length, 25);
        let best = [];
        for (let rowIndex = start; rowIndex < end; rowIndex++) {
            const row = grid[rowIndex];
            if (!Array.isArray(row)) continue;
            const sizes = row.map(normalize).filter(isSize);
            const unique = [...new Set(sizes)];
            if (unique.length > best.length) best = unique;
            if (sectionIndex >= 0 && rowIndex > sectionIndex && unique.length >= 2) return unique;
        }
        return best;
    }

    function formatSizeSetLabel(sizes) {
        return Array.isArray(sizes) && sizes.length ? `SIZESET / ${sizes.join('-')}` : '';
    }
    global.SizeSetExtractor = { extractRequestedSizesFromGrid, formatSizeSetLabel };
})(typeof window !== 'undefined' ? window : globalThis);
