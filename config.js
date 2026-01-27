// config.js - Configuración central de la aplicación
window.Config = window.Config || {
    APP: {
        VERSION: '1.0.0',
        NAME: 'Tegra Spec Manager'
    },
    
    // Mapa de códigos de equipo
    TEAM_CODE_MAP: {},
    
    // Mapa de códigos de género
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women',
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
    // Configuración Gear for Sport
    GEARFORSPORT_TEAM_MAP: {},
    GEARFORSPORT_GENDER_MAP: {
        'UM': 'Men',
        'UW': 'Women',
        'UY': 'Youth',
        'U': 'Unisex'
    },
    
    // Bases de datos de colores
    COLOR_DATABASES: {
        PANTONE: {},
        GEARFORSPORT: {
    'BLUE': { hex: '#0000FF', name: 'Blue' },
    'RED': { hex: '#FF0000', name: 'Red' },
    'GREEN': { hex: '#008000', name: 'Green' },
    'YELLOW': { hex: '#FFFF00', name: 'Yellow' },
    'BLACK': { hex: '#000000', name: 'Black' },
    'WHITE': { hex: '#FFFFFF', name: 'White' },
    'ORANGE': { hex: '#FFA500', name: 'Orange' },
    'PURPLE': { hex: '#800080', name: 'Purple' },
    'BROWN': { hex: '#A52A2A', name: 'Brown' },
    'GRAY': { hex: '#808080', name: 'Gray' },
    'PINK': { hex: '#FFC0CB', name: 'Pink' },
    'GOLD': { hex: '#FFD700', name: 'Gold' },
    'SILVER': { hex: '#C0C0C0', name: 'Silver' },
    'NAVY': { hex: '#000080', name: 'Navy Blue' },
    'ROYAL BLUE': { hex: '#4169E1', name: 'Royal Blue' },
    'SKY BLUE': { hex: '#87CEEB', name: 'Sky Blue' },
    'LIGHT BLUE': { hex: '#ADD8E6', name: 'Light Blue' },
    'DARK BLUE': { hex: '#00008B', name: 'Dark Blue' }
},
        RAL: {},
        CUSTOM: {}
    },
    
    // Códigos metálicos
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
    ],
    
    // Presets de tinta
    INK_PRESETS: {
        'WATER': { 
            temp: '320 °F', 
            time: '1:40 min',
            blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            white: { name: 'AQUAFLEX WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
        },
        'PLASTISOL': { 
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { name: 'BLOCKER plastisol', mesh1: '110/64', mesh2: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: 'N/A' },
            white: { name: 'PLASTISOL WHITE', mesh1: '156/64', mesh2: '110/64', durometer: '65', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '156/64', durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', additives: '1 % catalyst' }
        },
        'SILICONE': { 
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { name: 'Bloquer Libra', mesh1: '110/64', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            white: { name: 'White Libra', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
            color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cat · 2 % ret' }
        }
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Config = window.Config;
}
