// js/utils/pdf-helpers.js
export function calculateExpectedPixelsFromDimensions(dimensions) {
    if (!dimensions) return 0;
    
    const matches = dimensions.match(/(\d+(\.\d+)?)/g);
    if (!matches || matches.length < 2) return 0;
    
    const widthInches = parseFloat(matches[0]);
    const heightInches = parseFloat(matches[1]);
    
    if (isNaN(widthInches) || isNaN(heightInches)) return 0;
    
    const widthPixels = Math.round(widthInches * 300);
    const heightPixels = Math.round(heightInches * 300);
    return widthPixels * heightPixels;
}

export function getColorInfoForPage(pageNum, artes) {
    let totalColors = 0;
    const colorMapping = [];
    
    for (const arte of artes) {
        for (const color of arte.colors) {
            totalColors++;
            colorMapping.push({
                type: color.type,
                screenLetter: color.screenLetter,
                name: color.val || `Color ${totalColors}`,
                arteName: arte.name
            });
        }
    }
    
    if (totalColors > 0) {
        const colorIndex = (pageNum - 1) % totalColors;
        const colorInfo = colorMapping[colorIndex];
        return {
            type: colorInfo.type,
            screenLetter: colorInfo.screenLetter,
            name: colorInfo.name,
            arteName: colorInfo.arteName,
            matches: true
        };
    }
    
    return {
        type: 'DESCONOCIDO',
        screenLetter: `P${pageNum}`,
        name: `Página ${pageNum}`,
        arteName: 'N/A',
        matches: false
    };
}
