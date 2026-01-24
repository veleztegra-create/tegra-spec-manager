// validators.js - VERSIÓN CORREGIDA
class Validators {
    static validateHexColor(color) {
        if (!color) return false;
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }
    
    static validateFolderNumber(folderNum) {
        return /^\d{5,}$/.test(folderNum);
    }
    
    static validateSpecData(data) {
        const errors = [];
        
        if (!data.customer || data.customer.trim().length < 2) {
            errors.push('Cliente es requerido (mínimo 2 caracteres)');
        }
        
        if (!data.style || data.style.trim().length < 2) {
            errors.push('Estilo es requerido (mínimo 2 caracteres)');
        }
        
        if (!data.placements || data.placements.length === 0) {
            errors.push('Debe crear al menos un placement');
        }
        
        // Validar cada placement
        if (data.placements) {
            data.placements.forEach((placement, index) => {
                const placementErrors = this.validatePlacement(placement);
                if (placementErrors.length > 0) {
                    errors.push(`Placement ${index + 1}: ${placementErrors.join(', ')}`);
                }
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static validatePlacement(placement) {
        const errors = [];
        
        if (!placement.type || placement.type.trim().length === 0) {
            errors.push('Tipo de placement es requerido');
        }
        
        if (!placement.colors || placement.colors.length === 0) {
            errors.push('Debe agregar al menos un color al placement');
        }
        
        // Validar colores si existen
        if (placement.colors) {
            placement.colors.forEach((color, index) => {
                if (!color.val || color.val.trim().length === 0) {
                    errors.push(`Color ${index + 1} no puede estar vacío`);
                }
                
                if (!color.screenLetter || color.screenLetter.trim().length === 0) {
                    errors.push(`Letra de pantalla para color ${index + 1} es requerida`);
                }
            });
        }
        
        // Validar dimensiones
        if (placement.dimensions && !this.validateDimensions(placement.dimensions)) {
            errors.push('Formato de dimensiones inválido (ej: SIZE: (W) 10" X (H) 12")');
        }
        
        // Validar temperatura
        if (placement.temp && !this.validateTemperature(placement.temp)) {
            errors.push('Formato de temperatura inválido (ej: 320 °F)');
        }
        
        return errors;
    }
    
    static validateDimensions(dimensions) {
        if (!dimensions) return true;
        return /SIZE:\s*\(W\)\s*[\d\.]+\s*["']?\s*X\s*\(H\)\s*[\d\.]+\s*["']?/i.test(dimensions);
    }
    
    static validateTemperature(temp) {
        if (!temp) return true;
        return /[\d\.]+\s*°[FC]/.test(temp);
    }
    
    static validateImageFile(file, maxSizeMB = 5) {  // Valor por defecto
        const errors = [];
        const maxSizeBytes = maxSizeMB * 1024 * 1024;  // Cambiar nombre a maxSizeBytes
        
        if (!file.type.match('image.*')) {
            errors.push('El archivo debe ser una imagen (JPG, PNG, GIF)');
        }
        
        if (file.size > maxSizeBytes) {
            errors.push(`La imagen no debe superar ${maxSizeMB}MB`);
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            errors.push('Tipo de archivo no permitido. Use JPG, PNG o GIF');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static validateExcelFile(file) {
        const errors = [];
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/zip'
        ];
        
        if (!allowedTypes.includes(file.type) && 
            !file.name.toLowerCase().endsWith('.xlsx') &&
            !file.name.toLowerCase().endsWith('.xls') &&
            !file.name.toLowerCase().endsWith('.json') &&
            !file.name.toLowerCase().endsWith('.zip')) {
            errors.push('Tipo de archivo no permitido. Use Excel (.xlsx, .xls), JSON o ZIP');
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push('El archivo no debe superar 10MB');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static validateColorName(colorName) {
        if (!colorName || colorName.trim().length === 0) {
            return {
                isValid: false,
                error: 'El nombre del color no puede estar vacío'
            };
        }
        
        if (colorName.length > 100) {
            return {
                isValid: false,
                error: 'El nombre del color es demasiado largo (máximo 100 caracteres)'
            };
        }
        
        return {
            isValid: true
        };
    }
    
    static validatePlacementCount(placements) {
        const maxPlacements = 20; // Valor por defecto
        
        if (placements.length > maxPlacements) {
            return {
                isValid: false,
                error: `No puede tener más de ${maxPlacements} placements`
            };
        }
        
        return {
            isValid: true
        };
    }
    
    static validateColorCount(colors) {
        const maxColors = 15; // Valor por defecto
        
        if (colors.length > maxColors) {
            return {
                isValid: false,
                error: `No puede tener más de ${maxColors} colores por placement`
            };
        }
        
        return {
            isValid: true
        };
    }
    
    static validateDate(dateString) {
        if (!dateString) return { isValid: true };
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                error: 'Fecha inválida'
            };
        }
        
        return {
            isValid: true
        };
    }
    
    static validateNumeric(value, min = 0, max = null) {
        if (value === undefined || value === null || value === '') {
            return {
                isValid: false,
                error: 'Valor requerido'
            };
        }
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return {
                isValid: false,
                error: 'Debe ser un número'
            };
        }
        
        if (num < min) {
            return {
                isValid: false,
                error: `Debe ser mayor o igual a ${min}`
            };
        }
        
        if (max !== null && num > max) {
            return {
                isValid: false,
                error: `Debe ser menor o igual a ${max}`
            };
        }
        
        return {
            isValid: true
        };
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Validators = Validators;
}
