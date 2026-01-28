// specialties-detector.js - Detección de especialidades
const SpecialtiesDetector = {
    detectFromColors: function(colors) {
        if (!Array.isArray(colors)) return [];
        
        const specialties = new Set();
        
        colors.forEach(color => {
            if (color.val) {
                const val = color.val.toUpperCase();
                
                // High Density
                if (val.includes('HD') || val.includes('HIGH DENSITY')) {
                    specialties.add('HIGH DENSITY');
                }
                
                // Metallic
                if (this.isMetallic(val)) {
                    specialties.add('METALLIC');
                }
                
                // Foil
                if (val.includes('FOIL')) {
                    specialties.add('FOIL');
                }
                
                // Glitter
                if (val.includes('GLITTER') || val.includes('BRIGHT')) {
                    specialties.add('GLITTER');
                }
            }
        });
        
        return Array.from(specialties);
    },
    
    isMetallic: function(colorName) {
        if (!colorName) return false;
        
        const upper = colorName.toUpperCase();
        
        // Códigos Pantone metálicos
        if (upper.match(/(8[7-9][0-9]\s*C?)/i)) {
            return true;
        }
        
        // Palabras clave
        const metallicKeywords = [
            'METALLIC', 'GOLD', 'SILVER', 'BRONZE', 'METÁLICO',
            'CHROME', 'PLATINUM', 'COPPER', 'NICKEL'
        ];
        
        return metallicKeywords.some(keyword => upper.includes(keyword));
    }
};

if (typeof window !== 'undefined') {
    window.SpecialtiesDetector = SpecialtiesDetector;
}
