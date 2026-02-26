// validators.js - Funciones de validación
const Validators = {
    validateCustomer: function(customer) {
        if (!customer || customer.trim().length < 2) {
            return { isValid: false, message: 'Cliente es requerido (mínimo 2 caracteres)' };
        }
        return { isValid: true };
    },
    
    validateStyle: function(style) {
        if (!style || style.trim().length < 2) {
            return { isValid: false, message: 'Estilo es requerido (mínimo 2 caracteres)' };
        }
        return { isValid: true };
    },
    
    validateColorway: function(colorway) {
        if (!colorway || colorway.trim().length === 0) {
            return { isValid: false, message: 'Colorway es requerido' };
        }
        return { isValid: true };
    },
    
    validatePlacement: function(placement) {
        const errors = [];
        
        if (!placement.type) {
            errors.push('Tipo de placement requerido');
        }
        
        if (!placement.colors || placement.colors.length === 0) {
            errors.push('Debe agregar al menos un color');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

if (typeof window !== 'undefined') {
    window.Validators = Validators;
}
