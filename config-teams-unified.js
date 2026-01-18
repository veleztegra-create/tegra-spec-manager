// config-teams-unified.js - VERSIÓN COMPLETA CON COLORES UNI/ALT/COLOR RUSH
const TeamsConfig = {
        teams: {
            "ALA": { "name": "Alabama Crimson Tide" },
            "ARI": { "name": "Arizona Wildcats" },
            "AUB": { "name": "Auburn Tigers" },
            "BAY": { "name": "Baylor Bears" },
            "CLE": { "name": "Clemson Tigers" },
            "DUK": { "name": "Duke Blue Devils" },
            "FLA": { "name": "Florida Gators" },
            "FSU": { "name": "Florida State Seminoles" },
            "GEO": { "name": "Georgia Bulldogs" },
            "IND": { "name": "Indiana Hoosiers" },
            "IOW": { "name": "Iowa Hawkeyes" },
            "KAN": { "name": "Kansas Jayhawks" },
            "KEN": { "name": "Kentucky Wildcats" },
            "LSU": { "name": "LSU Tigers" },
            "MRY": { "name": "Maryland Terrapins" },
            "MIC": { "name": "Michigan Wolverines" },
            "MSU": { "name": "Michigan State Spartans" },
            "NDM": { "name": "Notre Dame Fighting Irish" },
            "UNC": { "name": "North Carolina Tar Heels" },
            "OSU": { "name": "Ohio State Buckeyes" },
            "OKL": { "name": "Oklahoma Sooners" },
            "ORE": { "name": "Oregon Ducks" },
            "PSU": { "name": "Penn State Nittany Lions" },
            "SYR": { "name": "Syracuse Orange" },
            "TAM": { "name": "Texas A&M Aggies" },
            "TEX": { "name": "Texas Longhorns" },
            "TEN": { "name": "Tennessee Volunteers" },
            "UCLA": { "name": "UCLA Bruins" },
            "USC": { "name": "USC Trojans" },
            "UVA": { "name": "Virginia Cavaliers" },
            "WAS": { "name": "Washington Huskies" },
            "WIS": { "name": "Wisconsin Badgers" }
        },
        
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
        "BROWN": { "hex": "#4E3629" },
        
        // ===== COLORES UNI / ALT / COLOR RUSH =====
        "UNI WHITE": { "hex": "#FFFFFF", "teams": "ALL" },
        "UNI BLACK": { "hex": "#000000", "teams": ["ARI","ATL","BAL","CAR","CIN","LAS","NOS","PIT"] },
        "UNI NAVY": { "hex": "#0B162A", "teams": ["CHI","TEN","NEP","DAL","SEA","LAR"] },
        "UNI BLUE": { "hex": "#003A70", "teams": ["BUF","IND","NYG","LAC","DET"] },
        "UNI ORANGE": { "hex": "#FB4F14", "teams": ["DEN","CLE","CIN","CHI","HOU"] },
        "UNI RED": { "hex": "#D50A0A", "teams": ["ARI","ATL","KCC","TBB","SF9"] },
        "UNI GREEN": { "hex": "#004C54", "teams": ["PHI","GBP","NYJ","SEA"] },
        "UNI GOLD": { "hex": "#FFB612", "teams": ["MIN","GBP","NOS","PIT","RAM"] },
        "UNI YELLOW": { "hex": "#FFB612", "teams": ["MIN","GBP","PIT","RAM"] },
        "UNI SILVER": { "hex": "#A5ACAF", "teams": ["DAL","DET","NEP","LVR"] },
        "UNI GREY": { "hex": "#A2AAAD", "teams": ["DET","LVR","NEP"] },
        
        // ALTERNATIVOS
        "ALT BLACK": { "hex": "#000000", "teams": ["ARI","BAL","CAR","NOS","ATL","PIT","CIN"] },
        "ALT WHITE": { "hex": "#FFFFFF", "teams": "ALL" },
        "ALT RED": { "hex": "#C60C30", "teams": ["ARI","ATL","KCC","TBB","SF9"] },
        "ALT BLUE": { "hex": "#003A70", "teams": ["BUF","NYG","IND","LAC"] },
        "ALT ORANGE": { "hex": "#FB4F14", "teams": ["DEN","CLE","CIN","CHI","HOU"] },
        
        // COLOR RUSH
        "COLOR RUSH WHITE": { "hex": "#FFFFFF", "teams": "ALL" },
        "COLOR RUSH BLACK": { "hex": "#000000", "teams": ["ATL","BAL","CAR","ARI","CIN"] },
        "COLOR RUSH BLUE": { "hex": "#003A70", "teams": ["BUF","IND","NYG","LAC"] },
        "COLOR RUSH NAVY": { "hex": "#0B162A", "teams": ["TEN","NEP","DAL","SEA"] },
        "COLOR RUSH GREEN": { "hex": "#004C54", "teams": ["PHI","NYJ","GBP","SEA"] },
        "COLOR RUSH RED": { "hex": "#D50A0A", "teams": ["KCC","SF9","TBB","ATL"] },
        "COLOR RUSH ORANGE": { "hex": "#FB4F14", "teams": ["DEN","CLE","CIN"] },
        "COLOR RUSH GOLD": { "hex": "#FFB612", "teams": ["NOS","PIT","MIN","RAM"], "category": "metallic" },
        
        // METÁLICOS PANTONE
        "871C": { "hex": "#8E6F3E", "category": "metallic", "pantone": "871C" },
        "872C": { "hex": "#9D7E49", "category": "metallic", "pantone": "872C" },
        "873C": { "hex": "#B19864", "category": "metallic", "pantone": "873C" },
        "874C": { "hex": "#C2AB7E", "category": "metallic", "pantone": "874C" },
        "875C": { "hex": "#D4BE96", "category": "metallic", "pantone": "875C" },
        "876C": { "hex": "#E5D2B0", "category": "metallic", "pantone": "876C" },
        "877C": { "hex": "#E8E8E8", "category": "metallic", "pantone": "877C" },
        "METALLIC GOLD": { "hex": "#D4AF37", "category": "metallic" },
        "METALLIC SILVER": { "hex": "#C0C0C0", "category": "metallic" },
        "GOLD": { "hex": "#FFD700", "category": "metallic" },
        "SILVER": { "hex": "#C0C0C0", "category": "metallic" },
        "BRONZE": { "hex": "#CD7F32", "category": "metallic" }
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
    },
    
    // GEAR FOR SPORT - COLORES ESPECÍFICOS
    gearforsport: {
        "3301 - OCHRE": { "hex": "#CC7722", "pantone": "130 C" },
        "TRUE GREY": { "hex": "#A9A9A9", "pantone": "Cool Gray 8 C" },
        "316 - TAXI": { "hex": "#F5C211", "pantone": "123 C" },
        "555 - RED": { "hex": "#FF0000", "pantone": "185 C" },
        "WHITE": { "hex": "#FFFFFF", "pantone": "WHITE" },
        "BLACK": { "hex": "#000000", "pantone": "BLACK" },
        "NAVY": { "hex": "#000080", "pantone": "282 C" },
        "ROYAL": { "hex": "#4169E1", "pantone": "286 C" },
        "SCARLET": { "hex": "#FF2400", "pantone": "186 C" },
        "FOREST GREEN": { "hex": "#228B22", "pantone": "350 C" },
        "KHAKI": { "hex": "#C3B091", "pantone": "4525 C" },
        "CHARCOAL": { "hex": "#36454F", "pantone": "426 C" },
        "UNIVERSITY RED": { "hex": "#C8102E", "pantone": "186 C" },
        "SHINY UNIVERSITY RED": { "hex": "#C8102E", "pantone": "186 C (Shiny)" },
        "ITALY BLUE": { "hex": "#0033A0", "pantone": "286 C" },
        "SHINY ITALY BLUE": { "hex": "#0033A0", "pantone": "286 C (Shiny)" },
        "SEQUOIA": { "hex": "#1D2624", "pantone": "3435 C", "material_code": "3JG" },
        "DARK STUCCO": { "hex": "#6E5241", "pantone": "4995 C", "material_code": "05K" },
        "LT IRON ORE": { "hex": "#C4B7A6", "pantone": "Warm Gray 3 C", "material_code": "05" },
        "SPORT TEAL": { "hex": "#008E97", "pantone": "321 C", "material_code": "3JD" },
        "MEDIUM SILVER": { "hex": "#A7A8AA", "pantone": "Cool Gray 6 C", "material_code": "09D" },
        "DARK STEEL GREY": { "hex": "#53565A", "pantone": "Cool Gray 11 C", "material_code": "01P" },
        "COLLEGE NAVY": { "hex": "#1C2841", "pantone": "296 C", "material_code": "41S" },
        "ACTION GREEN": { "hex": "#008D62", "pantone": "347 C", "material_code": "3HN" },
        "WOLF GREY": { "hex": "#9B9B9B", "pantone": "Cool Gray 8 C", "material_code": "01V" },
        "OLD ROYAL": { "hex": "#002147", "pantone": "2747 C", "material_code": "4DA" },
        "MARINE": { "hex": "#003A70", "pantone": "287 C", "material_code": "41L" }
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
//NFL: {
        teams: {
            "ARI": { "name": "Arizona Cardinals" },
            "ATL": { "name": "Atlanta Falcons" },
            "BAL": { "name": "Baltimore Ravens" },
            "BUF": { "name": "Buffalo Bills" },
            "CAR": { "name": "Carolina Panthers" },
            "CHI": { "name": "Chicago Bears" },
            "CIN": { "name": "Cincinnati Bengals" },
            "CLE": { "name": "Cleveland Browns" },
            "DAL": { "name": "Dallas Cowboys" },
            "DEN": { "name": "Denver Broncos" },
            "DET": { "name": "Detroit Lions" },
            "GBP": { "name": "Green Bay Packers" },
            "HOU": { "name": "Houston Texans" },
            "IND": { "name": "Indianapolis Colts" },
            "JAG": { "name": "Jacksonville Jaguars" },
            "KCC": { "name": "Kansas City Chiefs" },
            "LAC": { "name": "Los Angeles Chargers" },
            "LVR": { "name": "Las Vegas Raiders" },
            "MIA": { "name": "Miami Dolphins" },
            "MIN": { "name": "Minnesota Vikings" },
            "NEP": { "name": "New England Patriots" },
            "NOS": { "name": "New Orleans Saints" },
            "NYG": { "name": "New York Giants" },
            "NYJ": { "name": "New York Jets" },
            "PHI": { "name": "Philadelphia Eagles" },
            "PIT": { "name": "Pittsburgh Steelers" },
            "RAM": { "name": "Los Angeles Rams" },
            "SEA": { "name": "Seattle Seahawks" },
            "SF9": { "name": "San Francisco 49ers" },
            "TBB": { "name": "Tampa Bay Buccaneers" },
            "TEN": { "name": "Tennessee Titans" },
            "WAS": { "name": "Washington Commanders" }
        },


// CONFIGURACIÓN MÍNIMA
const Config = {
    APP: {
        VERSION: '2.1.0',
        NAME: 'Tegra Spec Manager',
        MAX_IMAGE_SIZE_MB: 5,
        MAX_PLACEMENTS: 10,
        MAX_COLORS_PER_PLACEMENT: 12
    },
    
    // BASE DE DATOS DE COLORES - COMPLETA
    COLOR_DATABASES: {
        INSTITUTIONAL: ColorDatabase.institutional,
        PANTONE: {},
        GEARFORSPORT: ColorDatabase.gearforsport,
        METALLIC: ColorDatabase.metallic
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
        "METALLIC", "GOLD", "SILVER", "BRONZE", "COPPER",
        "METALLIC GOLD", "METALLIC SILVER", "COLOR RUSH GOLD"
    ]
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Config = Config;
    window.ColorDatabase = ColorDatabase;
    window.TeamMap = TeamMap;
}

console.log('✅ Config COMPLETO cargado - Versión 2.1.0');
console.log('📊 Total colores institucionales:', Object.keys(ColorDatabase.institutional).length);
console.log('📊 Total colores metálicos:', Object.keys(ColorDatabase.metallic).length);
console.log('📊 Total colores Gear for Sport:', Object.keys(ColorDatabase.gearforsport).length);
