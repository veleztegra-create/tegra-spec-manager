// specialties-detector.js
const SpecialtiesDetector = {
    patterns: {
        metallic: [
            /8[7-9][0-9]\s*C?/i,  // Códigos Pantone metálicos
            /\bMETALLIC\b/i,
            /\bGOLD\b/i,
            /\bSILVER\b/i,
            /\bBRONZE\b/i,
            /\bMETÁLICO\b/i,
            /\bMETALIC\b/i
        ],
        foil: [
            /\bFOIL\b/i,
            /\bHOT\s*STAMP\b/i,
            /\bSTAMPING\b/i
        ],
        highDensity: [
            /\bHD\b/i,
            /\bHIGH\s*DENSITY\b/i,
            /\bHIGH\s*DENS\b/i,
            /\b3D\b/i,
            /\bPUFF\b/i
        ]
    },
    
    detect: function(colorName) {
        if (!colorName) return [];
        
        const specialties = [];
        const upperColor = colorName.toUpperCase();
        
        // Detectar metálicos
        for (const pattern of this.patterns.metallic) {
            if (pattern.test(upperColor)) {
                if (!specialties.includes('METALLIC')) {
                    specialties.push('METALLIC');
                }
                break;
            }
        }
        
        // Detectar foil
        for (const pattern of this.patterns.foil) {
            if (pattern.test(upperColor)) {
                if (!specialties.includes('FOIL')) {
                    specialties.push('FOIL');
                }
                break;
            }
        }
        
        // Detectar high density
        for (const pattern of this.patterns.highDensity) {
            if (pattern.test(upperColor)) {
                if (!specialties.includes('HIGH DENSITY')) {
                    specialties.push('HIGH DENSITY');
                }
                break;
            }
        }
        
        return specialties;
    },
    
    // Para detectar en múltiples colores
    detectAll: function(colors) {
        const allSpecialties = new Set();
        
        colors.forEach(color => {
            if (color && color.val) {
                const specialties = this.detect(color.val);
                specialties.forEach(s => allSpecialties.add(s));
            }
        });
        
        return Array.from(allSpecialties);
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SpecialtiesDetector = SpecialtiesDetector;
}