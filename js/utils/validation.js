// js/utils/validation.js
export function validateDimensions(dimensions) {
    if (!dimensions) return false;
    const matches = dimensions.match(/SIZE:\s*\(W\)\s*([\d\.]+)"\s*X\s*\(H\)\s*([\d\.]+)"/i);
    if (!matches) return false;
    
    const width = parseFloat(matches[1]);
    const height = parseFloat(matches[2]);
    return !isNaN(width) && !isNaN(height) && width > 0 && height > 0;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
