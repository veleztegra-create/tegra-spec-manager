export function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}

export function updateDateTime() {
    const dateElement = document.getElementById('current-datetime');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
}

export function createLoadingOverlay(message = 'Procesando...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

export function removeLoadingOverlay(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

export function getColorHex(colorName) {
    if (!colorName) return '#CCCCCC';
    
    const normalized = colorName.toUpperCase().trim();
    
    // Buscar en la base de datos Pantone
    if (PANTONE_DB[normalized]) {
        return PANTONE_DB[normalized];
    }
    
    // Búsqueda parcial
    for (const [key, value] of Object.entries(PANTONE_DB)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    // Valores por defecto basados en palabras clave
    if (normalized.includes('BLACK')) return '#000000';
    if (normalized.includes('WHITE')) return '#FFFFFF';
    if (normalized.includes('RED')) return '#C8102E';
    if (normalized.includes('BLUE')) return '#003A70';
    if (normalized.includes('GREEN')) return '#008D62';
    if (normalized.includes('GOLD')) return '#FFB612';
    if (normalized.includes('SILVER') || normalized.includes('GREY')) return '#A5ACAF';
    
    // Generar color aleatorio como fallback
    return '#CCCCCC';
}

export function validateDimensions(dimensions) {
    if (!dimensions) return false;
    
    // Verificar formato en pulgadas
    const inchMatch = dimensions.match(/SIZE:\s*\(W\)\s*([\d\.]+)"\s*X\s*\(H\)\s*([\d\.]+)"/i);
    if (inchMatch) {
        const width = parseFloat(inchMatch[1]);
        const height = parseFloat(inchMatch[2]);
        return !isNaN(width) && !isNaN(height) && width > 0 && height > 0;
    }
    
    return false;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
