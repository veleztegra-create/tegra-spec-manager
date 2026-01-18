// config-teams-unified.js - VERSIÓN SIMPLIFICADA Y EFICIENTE
const ColorDatabase = {
    // COLORES POR NOMBRE - Simplificado
    institutional: {
        // Rojos
        "CRIMSON": { "hex": "#9E1B32" },
        "SCARLET": { "hex": "#BB0000" },
        "CARDINAL": { "hex": "#990000" },
        "RED": { "hex": "#C5050C" },
        "MAROON": { "hex": "#500000" },
        
        // Azules
        "NAVY": { "hex": "#0C2340" },
        "ROYAL_BLUE": { "hex": "#00338D" },
        "BLUE": { "hex": "#003087" },
        "CAROLINA_BLUE": { "hex": "#7BAFD4" },
        "MICHIGAN_BLUE": { "hex": "#00274C" },
        
        // Verdes
        "GREEN": { "hex": "#154733" },
        "HUNTER_GREEN": { "hex": "#00471B" },
        
        // Amarillos/Dorados
        "GOLD": { "hex": "#C99700" },
        "YELLOW": { "hex": "#FEE123" },
        "OLD_GOLD": { "hex": "#B3995D" },
        
        // Naranjas
        "ORANGE": { "hex": "#FA4616" },
        "BURNT_ORANGE": { "hex": "#BF5700" },
        
        // Púrpuras
        "PURPLE": { "hex": "#461D7C" },
        
        // Neutros
        "WHITE": { "hex": "#FFFFFF" },
        "BLACK": { "hex": "#000000" },
        "GRAY": { "hex": "#666666" },
        "SILVER": { "hex": "#C4CED4" },
        "CREAM": { "hex": "#EEE1C6" },
        "BROWN": { "hex": "#4E3629" }
    },
    
    // CÓDIGOS PANTONE METÁLICOS
    metallic: {
        "871C": { "hex": "#8B7355" },
        "872C": { "hex": "#BC9A6A" },
        "873C": { "hex": "#D4AF37" },
        "874C": { "hex": "#C5A05C" },
        "875C": { "hex": "#A67C52" },
        "876C": { "hex": "#8B6914" },
        "877C": { "hex": "#C0C0C0" }
    }
};

// MAPA SIMPLE DE EQUIPOS - Solo códigos y nombres
const TeamMap = {
    // NCAA
    "ALA": "Alabama Crimson Tide",
    "ARI": "Arizona Wildcats",
    "AUB": "Auburn Tigers",
    "BAY": "Baylor Bears",
    "CLE": "Clemson Tigers",
    "DUK": "Duke Blue Devils",
    "FLA": "Florida Gators",
    "FSU": "Florida State Seminoles",
    "GEO": "Georgia Bulldogs",
    "IND": "Indiana Hoosiers",
    "IOW": "Iowa Hawkeyes",
    "KAN": "Kansas Jayhawks",
    "KEN": "Kentucky Wildcats",
    "LSU": "LSU Tigers",
    "MRY": "Maryland Terrapins",
    "MIC": "Michigan Wolverines",
    "MSU": "Michigan State Spartans",
    "NDM": "Notre Dame Fighting Irish",
    "UNC": "North Carolina Tar Heels",
    "OSU": "Ohio State Buckeyes",
    "OKL": "Oklahoma Sooners",
    "ORE": "Oregon Ducks",
    "PSU": "Penn State Nittany Lions",
    "SYR": "Syracuse Orange",
    "TAM": "Texas A&M Aggies",
    "TEX": "Texas Longhorns",
    "TEN": "Tennessee Volunteers",
    "UCLA": "UCLA Bruins",
    "USC": "USC Trojans",
    "UVA": "Virginia Cavaliers",
    "WAS": "Washington Huskies",
    "WIS": "Wisconsin Badgers",
    
    // NBA
    "ATL": "Atlanta Hawks",
    "BOS": "Boston Celtics",
    "BRK": "Brooklyn Nets",
    "CHA": "Charlotte Hornets",
    "CHI": "Chicago Bulls",
    "CLE": "Cleveland Cavaliers",
    "DAL": "Dallas Mavericks",
    "DEN": "Denver Nuggets",
    "DET": "Detroit Pistons",
    "GSW": "Golden State Warriors",
    "HOU": "Houston Rockets",
    "IND": "Indiana Pacers",
    "LAC": "Los Angeles Clippers",
    "LAL": "Los Angeles Lakers",
    "MEM": "Memphis Grizzlies",
    "MIA": "Miami Heat",
    "MIL": "Milwaukee Bucks",
    "MIN": "Minnesota Timberwolves",
    "NOP": "New Orleans Pelicans",
    "NYK": "New York Knicks",
    "OKC": "Oklahoma City Thunder",
    "ORL": "Orlando Magic",
    "PHI": "Philadelphia 76ers",
    "PHX": "Phoenix Suns",
    "POR": "Portland Trail Blazers",
    "SAC": "Sacramento Kings",
    "SAS": "San Antonio Spurs",
    "TOR": "Toronto Raptors",
    "UTA": "Utah Jazz",
    "WAS": "Washington Wizards"
};

// CONFIGURACIÓN MÍNIMA
const Config = {
    APP: {
        VERSION: '2.0.0',
        NAME: 'Tegra Spec Manager',
        MAX_IMAGE_SIZE_MB: 5,
        MAX_PLACEMENTS: 10,
        MAX_COLORS_PER_PLACEMENT: 12
    },
    
    // BASE DE DATOS DE COLORES - Simplificada
    COLOR_DATABASES: {
        INSTITUTIONAL: ColorDatabase.institutional,
        PANTONE: {},
        GEARFORSPORT: ColorDatabase.institutional // Usar la misma base
    },
    
    // MAPA DE EQUIPOS
    TEAM_CODE_MAP: TeamMap,
    
    // MAPA GEAR FOR SPORT - Simplificado
    GEARFORSPORT_TEAM_MAP: {
        "UM9110-PMD0": "Maryland Terrapins",
        "UM9110-N042": "Notre Dame Fighting Irish", 
        "UM9111-PWI0": "Wisconsin Badgers",
        "UY9112-PGT1": "Georgia Tech Yellow Jackets"
    },
    
    // MAPA DE GÉNERO - Simplificado
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women', 
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
    // MAPA GEAR FOR SPORT GÉNERO
    GEARFORSPORT_GENDER_MAP: {
        "UM": "Men",
        "UW": "Women",
        "UY": "Youth",
        "UB": "Boys",
        "UG": "Girls",
        "UK": "Kids",
        "UT": "Toddler",
        "UI": "Infant",
        "UA": "Adult",
        "UN": "Unisex",
        "M": "Men",
        "W": "Women",
        "Y": "Youth",
        "B": "Boys",
        "G": "Girls",
        "K": "Kids",
        "T": "Toddler",
        "I": "Infant",
        "A": "Adult",
        "N": "Unisex"
    },
    
    // PRESETS DE TINTA - Esenciales
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
    },
    
    // CÓDIGOS METÁLICOS
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "COPPER"
    ]
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Config = Config;
    window.ColorDatabase = ColorDatabase;
    window.TeamMap = TeamMap;
}

console.log('✅ Config simplificado cargado - Versión 2.0.0');
