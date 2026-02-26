// [file name]: config-schools.js
// Configuración de escuelas y universidades para Gear for Sport

window.SchoolsConfig = {
    // Base de datos de escuelas con sus códigos identificadores
    SCHOOLS: {
        // Georgia Tech
        'GEORGIA TECH': {
            name: 'Georgia Tech Yellow Jackets',
            codes: ['GT', 'PGT'],
            primary: 'Georgia Tech',
            conference: 'ACC'
        },
        // Maryland
        'MARYLAND': {
            name: 'Maryland Terrapins',
            codes: ['M', 'MD', 'PMD'],
            primary: 'Maryland',
            conference: 'Big Ten'
        },
        // Notre Dame
        'NOTRE DAME': {
            name: 'Notre Dame Fighting Irish',
            codes: ['ND', 'N', 'PND'],
            primary: 'Notre Dame',
            conference: 'Independent'
        },
        // Wisconsin
        'WISCONSIN': {
            name: 'Wisconsin Badgers',
            codes: ['WI', 'W', 'PWI'],
            primary: 'Wisconsin',
            conference: 'Big Ten'
        }
    },

    // Mapa de códigos a nombres de escuelas (para búsqueda rápida)
    get CODE_TO_SCHOOL() {
        const map = {};
        Object.entries(this.SCHOOLS).forEach(([schoolName, schoolData]) => {
            schoolData.codes.forEach(code => {
                map[code] = schoolName;
            });
        });
        return map;
    },

    // Mapa de códigos a nombres completos de equipos
    get CODE_TO_TEAM() {
        const map = {};
        Object.entries(this.SCHOOLS).forEach(([schoolName, schoolData]) => {
            schoolData.codes.forEach(code => {
                map[code] = schoolData.name;
            });
        });
        return map;
    },

    // Detectar escuela desde un código de estilo
    detectSchoolFromStyle: function(styleCode) {
        if (!styleCode) return null;
        
        const upperStyle = styleCode.toUpperCase();
        
        // Buscar coincidencia exacta de código
        for (const [code, schoolName] of Object.entries(this.CODE_TO_SCHOOL)) {
            // Patrones: después de guion, con o sin números
            const patterns = [
                new RegExp(`[-_]${code}\\d*`),           // -GT01, _GT01
                new RegExp(`[-_]P${code}\\d*`),          // -PGT0, _PGT0
                new RegExp(`${code}$`),                   // termina con GT
                new RegExp(`^${code}\\d`)                 // empieza con GT01
            ];
            
            for (const pattern of patterns) {
                if (pattern.test(upperStyle)) {
                    return {
                        code: code,
                        school: schoolName,
                        teamName: this.CODE_TO_TEAM[code],
                        fullData: this.SCHOOLS[schoolName]
                    };
                }
            }
        }
        
        return null;
    },

    // Extraer género desde código de estilo
    extractGenderFromStyle: function(styleCode) {
        if (!styleCode) return null;
        
        const upperStyle = styleCode.toUpperCase();
        
        // Patrones de género Gear for Sport
        if (upperStyle.startsWith('UM')) return 'Men';
        if (upperStyle.startsWith('UW')) return 'Women';
        if (upperStyle.startsWith('UY')) return 'Youth';
        if (upperStyle.startsWith('UB')) return 'Boys';
        if (upperStyle.startsWith('UG')) return 'Girls';
        
        return null;
    },

    // Verificar si es un código de Gear for Sport
    isGearForSportCode: function(styleCode) {
        if (!styleCode) return false;
        
        const upperStyle = styleCode.toUpperCase();
        // Los códigos GFS típicamente empiezan con U[M,W,Y,B,G]
        return /^U[M,W,Y,B,G]/.test(upperStyle);
    }
};

// Asegurar que esté disponible globalmente
if (typeof window !== 'undefined') {
    window.SchoolsConfig = SchoolsConfig;
}
