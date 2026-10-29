// [file name]: placements-autocomplete.js
// Base de datos de placements para autocompletado inteligente

window.PlacementsDB = {
    // Lista completa de placements desde el Excel
    PLACEMENTS: [
        "FRONT",
        "LOWER FRONT",
        "BACK",
        "NECK",
        "SLEEVE",
        "SHOULDERS",
        "CUELLO",
        "SLEEVE RIGHT",
        "SLEEVE LEFT",
        "SHOULDER",
        "NECK BAND",
        "INNER NECK",
        "GORRO",
        "LOWER FRONT",
        "FRENTE",
        "SHOULDERS LEFT",
        "SHOULDERS RIGHT",
        "RIGHT LEG",
        "LEFT LEG",
        "FRON/BACK",
        "COLLAR",
        "NAMEPLATE",
        "LEFT CHEST",
        "FRONT CHEST",
        "INNER NECK",
        "FRONT NECK GRILL",
        "LEG DERECHO",
        "RIGHT SLEEVE",
        "LEG",
        "NECKBAND",
        "PANEL DERECHO",
        "RIGHT GRAPHIC",
        "LEG PANEL",
        "PANEL",
        "RIGHT & LEFT PANEL",
        "LEFT&RIGHT SLEEVE",
        "HOMBROS",
        "RIGHT SHOULDER",
        "LEFT SHOULDER",
        "NECK GRILL",
        "INNER BACK",
        "Earned.BackNeck",
        "WORDMARK",
        "LATERAL",
        "SIDE RIGHT",
        "NECK PATCH",
        "SWINGMAN",
        "INTERIOR BACK NECK",
        "RIGHT FRONT CHEST",
        "LEFT FRONT SH PATH",
        "POCKET FRONT",
        "PANEL/FRONT",
        "HOODIE LOGO",
        "SIDE PANEL",
        "YOKE",
        "FRONT + SIDE",
        "BACK + NAMEPLATE",
        "FRONT SWOOSH",
        "TV NUMBERS",
        "WAIST BAND",
        "SIDEPANEL",
        "LEFT FRONT",
        "BACK RIGHT",
        "FRONT/SIDE PANELS",
        "BACK YOKE",
        "LOWER SIDE PANEL",
        "LOWER LEFT LEG",
        "INSERTS",
        "GRILL",
        "VARIOS",
        "LOWER SD PANEL",
        "LOWER FRONT PANEL",
        "YOKES",
        "GROMMETS",
        "RIGHT HIP",
        "BACK NECK",
        "FRONT HIP",
        "MANGAS",
        "SLEEVES INSERTS",
        "RIGHT AND LEFT SIDE PANELS",
        "RIGHT AND LEFT INSETS",
        "RIGHT SHOULDER",
        "SHOULDERS (2)",
        "LEFT PANEL",
        "NECK BANDS (2)",
        "RIGHT PANEL",
        "PATCH",
        "LEFT NECK BAND",
        "RIGHT NECK BAND",
        "NK BLOCK",
        "HOOD",
        "LEFT INSERT",
        "RIGHT INSERT",
        "V NECK",
        "STRIKE OFF",
        "V-NECK",
        "RIGHT YOKE",
        "LEFT YOKE",
        "RIGHT CHEST",
        "BACK LOGO",
        "RIGHT CUFF",
        "INSIDE BACK",
        "INSERT",
        "Road-Left and Right Sleeve",
        "Inside Neckband",
        "Inner Back Neckband",
        "Team anthem",
        "Body (Left)",
        "Body (Right)"
    ],

    // Mapa de abreviaciones comunes
    ABBREVIATIONS: {
        'F': 'FRONT',
        'B': 'BACK',
        'L': 'LEFT',
        'R': 'RIGHT',
        'S': 'SLEEVE',
        'SL': 'SLEEVE LEFT',
        'SR': 'SLEEVE RIGHT',
        'C': 'COLLAR',
        'N': 'NECK',
        'NB': 'NECK BAND',
        'CH': 'CHEST',
        'LC': 'LEFT CHEST',
        'RC': 'RIGHT CHEST',
        'SH': 'SHOULDER',
        'SHL': 'SHOULDERS LEFT',
        'SHR': 'SHOULDERS RIGHT',
        'LG': 'LEG',
        'LL': 'LEFT LEG',
        'RL': 'RIGHT LEG',
        'Y': 'YOKE',
        'P': 'PANEL',
        'H': 'HOOD',
        'V': 'V NECK',
        'TV': 'TV NUMBERS',
        'WM': 'WORDMARK',
        'NP': 'NAMEPLATE',
        'IN': 'INNER NECK',
        'IB': 'INNER BACK',
        'FR': 'FRONT',
        'BK': 'BACK'
    },

    // Buscar placements que coincidan con el texto ingresado
    search: function(input) {
        if (!input || input.length < 1) return [];
        
        const searchTerm = input.toUpperCase().trim();
        
        // 1. Buscar por abreviatura exacta
        if (this.ABBREVIATIONS[searchTerm]) {
            return [this.ABBREVIATIONS[searchTerm]];
        }
        
        // 2. Buscar coincidencias parciales
        const matches = this.PLACEMENTS.filter(placement => 
            placement.toUpperCase().includes(searchTerm) ||
            this.getAbbreviationScore(placement, searchTerm) > 0.7
        );
        
        // Ordenar por relevancia
        return matches.sort((a, b) => {
            const scoreA = this.getRelevanceScore(a, searchTerm);
            const scoreB = this.getRelevanceScore(b, searchTerm);
            return scoreB - scoreA;
        }).slice(0, 10); // Top 10 resultados
    },

    // Calcular puntuación de relevancia
    getRelevanceScore: function(placement, searchTerm) {
        const upperPlacement = placement.toUpperCase();
        
        // Coincidencia exacta = 100%
        if (upperPlacement === searchTerm) return 1;
        
        // Empieza con el término = 90%
        if (upperPlacement.startsWith(searchTerm)) return 0.9;
        
        // Contiene el término = 80%
        if (upperPlacement.includes(searchTerm)) return 0.8;
        
        // Coincidencia por abreviatura
        const words = upperPlacement.split(/[\s\-/]+/);
        for (const word of words) {
            if (word.startsWith(searchTerm)) return 0.7;
            if (word.includes(searchTerm)) return 0.6;
        }
        
        return 0;
    },

    // Obtener puntuación por abreviatura
    getAbbreviationScore: function(placement, searchTerm) {
        const upperPlacement = placement.toUpperCase();
        const words = upperPlacement.split(/[\s\-/]+/);
        
        // Tomar primera letra de cada palabra
        const abbreviation = words.map(w => w[0]).join('');
        
        if (abbreviation === searchTerm) return 1;
        if (abbreviation.startsWith(searchTerm)) return 0.8;
        
        return 0;
    },

    // Autocompletar mientras escribe
    autocomplete: function(inputElement, placementId) {
        if (!inputElement) return;
        
        const input = inputElement.value;
        const suggestions = this.search(input);
        
        // Crear o actualizar datalist
        let datalist = document.getElementById(`placement-autocomplete-${placementId}`);
        
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = `placement-autocomplete-${placementId}`;
            document.body.appendChild(datalist);
            inputElement.setAttribute('list', datalist.id);
        }
        
        datalist.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    }
};

if (typeof window !== 'undefined') {
    window.PlacementsDB = PlacementsDB;
}
