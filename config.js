// config.js (fragmento con correcciones en CLIENT_LOGOS y METALLIC_CODES)
const Config = {
    // Base de datos de colores
    COLOR_DATABASES: {
        PANTONE: {
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
            "ALT BLACK": { "hex": "#000000", "teams": ["ARI","BAL","CAR","NOS","ATL","PIT","CIN"] },
            "ALT WHITE": { "hex": "#FFFFFF", "teams": "ALL" },
            "ALT RED": { "hex": "#C60C30", "teams": ["ARI","ATL","KCC","TBB","SF9"] },
            "ALT BLUE": { "hex": "#003A70", "teams": ["BUF","NYG","IND","LAC"] },
            "ALT ORANGE": { "hex": "#FB4F14", "teams": ["DEN","CLE","CIN","CHI","HOU"] },
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
        
        GEARFORSPORT: {
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
    },

    // Configuración de tintas (CORREGIDO)
    INK_PRESETS: {
        WATER: {
            temp: '320 °F', 
            time: '1:40 min',
            blocker: { 
                name: 'BLOCKER CHT', 
                mesh1: '122/55', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'AQUAFLEX WHITE', 
                mesh1: '198/40', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            color: { 
                mesh: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: '3 % cross-linker 500 · 1.5 % antitack' 
            }
        },
        PLASTISOL: {
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { 
                name: 'Barrier Base', 
                mesh1: '110/64', 
                mesh2: '156/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'TXT POLY WHITE', 
                mesh1: '156/64', 
                mesh2: '110/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            color: { 
                mesh: '156/64', 
                durometer: '65', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: '1 % catalyst' 
            }
        },
        SILICONE: {
            temp: '320 °F', 
            time: '1:00 min',
            blocker: { 
                name: 'Bloquer Libra', 
                mesh1: '110/64', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            white: { 
                name: 'White Libra', 
                mesh1: '122/55', 
                mesh2: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: 'N/A' 
            },
            color: { 
                mesh: '157/48', 
                durometer: '70', 
                speed: '35', 
                angle: '15', 
                strokes: '2', 
                pressure: '40', 
                additives: '3 % cat · 2 % ret' 
            }
        }
    },

    // Mapeos
    TEAM_CODE_MAP: {
        // NFL
        'ARI': 'Arizona Cardinals', 'ATL': 'Atlanta Falcons', 'BAL': 'Baltimore Ravens',
        'BUF': 'Buffalo Bills', 'CAR': 'Carolina Panthers', 'CHI': 'Chicago Bears',
        'CIN': 'Cincinnati Bengals', 'CLE': 'Cleveland Browns', 'DAL': 'Dallas Cowboys',
        'DEN': 'Denver Broncos', 'DET': 'Detroit Lions', 'GBP': 'Green Bay Packers',
        'HOU': 'Houston Texans', 'IND': 'Indianapolis Colts', 'JAG': 'Jacksonville Jaguars',
        'KCC': 'Kansas City Chiefs', 'LAC': 'Los Angeles Chargers', 'LVR': 'Las Vegas Raiders',
        'MIA': 'Miami Dolphins', 'MIN': 'Minnesota Vikings', 'NEP': 'New England Patriots',
        'NOS': 'New Orleans Saints', 'NYG': 'New York Giants', 'NYJ': 'New York Jets',
        'PHI': 'Philadelphia Eagles', 'PIT': 'Pittsburgh Steelers', 'RAM': 'Los Angeles Rams',
        'SEA': 'Seattle Seahawks', 'SF9': 'San Francisco 49ers', 'TBB': 'Tampa Bay Buccaneers',
        'TEN': 'Tennessee Titans', 'WAS': 'Washington Commanders',
        
        // Universidades
        'ND': 'Notre Dame Fighting Irish',
        'UCLA': 'UCLA Bruins', 'USC': 'USC Trojans', 'BAMA': 'Alabama Crimson Tide',
        'LSU': 'LSU Tigers', 'UGA': 'Georgia Bulldogs', 'CLEM': 'Clemson Tigers',
        'FSU': 'Florida State Seminoles', 'UF': 'Florida Gators', 'UT': 'Texas Longhorns',
        'OU': 'Oklahoma Sooners', 'OSU': 'Ohio State Buckeyes', 'UM': 'Michigan Wolverines'
    },
    
    GENDER_MAP: {
        'M': 'Men', 'W': 'Women', 'B': 'Boys', 'G': 'Girls', 'U': 'Unisex',
        'Y': 'Youth', 'K': 'Kids', 'T': 'Toddler', 'I': 'Infant'
    },
    
    GEARFORSPORT_GENDER_MAP: {
        'UY': 'Youth',    // Youth
        'UW': 'Women',    // Women
        'UM': 'Men',      // Men
        'UB': 'Boys',     // Boys
        'UG': 'Girls',    // Girls
        'UK': 'Kids',     // Kids
        'UT': 'Toddler',  // Toddler
        'UI': 'Infant',   // Infant
        'UA': 'Adult',    // Adult
        'UN': 'Unisex'    // Unisex
    },
    
    GEARFORSPORT_TEAM_MAP: {
        'CHI': 'Chicago Bears',
        'DAL': 'Dallas Cowboys',
        'GB': 'Green Bay Packers',
        'NE': 'New England Patriots',
        'KC': 'Kansas City Chiefs',
        'SF': 'San Francisco 49ers',
        'PHI': 'Philadelphia Eagles',
        'PIT': 'Pittsburgh Steelers',
        'SEA': 'Seattle Seahawks',
        'DEN': 'Denver Broncos'
    },
    
    // Constantes de la aplicación
    APP: {
        NAME: 'Tegra Technical Spec Manager',
        VERSION: '1.0.0',
        MAX_PLACEMENTS: 20,
        MAX_COLORS_PER_PLACEMENT: 15,
        MAX_IMAGE_SIZE_MB: 5,
        DEFAULT_INK_TYPE: 'WATER'
    },
    
 // URLs de logos de clientes (corregidas: raw.githubusercontent.com/owner/repo/branch/path)
    CLIENT_LOGOS: {
        'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/main/Nike-Logotipo-PNG-Photo.png',
        'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/main/Fanatics_company_logo.svg.png',
        'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
        'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
        'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
        'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/main/SVG.png'
    },
    
    // Códigos de metálicos para detección (añadidas variantes sin tilde y correcciones)
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METALICO", "METALIC", "METALICO", "METALICO"
    ]
};
 
if (typeof window !== 'undefined') {
    window.Config = Config;
}
