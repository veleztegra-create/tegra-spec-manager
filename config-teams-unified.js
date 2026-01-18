// config-teams-unified.js - VERSIÓN CORREGIDA Y COMPLETA
const TeamsConfig = {
    NCAA: {
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
        
        colors: {
            institutional: {
                "CRIMSON": { "hex": "#9E1B32" },
                "ALABAMA_CRIMSON": { "hex": "#9E1B32" },
                "KANSAS_CRIMSON": { "hex": "#E8000D" },
                "OKLAHOMA_CRIMSON": { "hex": "#841617" },
                "INDIANA_CRIMSON": { "hex": "#990000" },
                "SCARLET": { "hex": "#BB0000" },
                "CARDINAL": { "hex": "#990000" },
                "USC_CARDINAL": { "hex": "#990000" },
                "ARIZONA_CARDINAL": { "hex": "#CC0033" },
                "NAVY": { "hex": "#0C2340" },
                "DUKE_BLUE": { "hex": "#003087" },
                "KENTUCKY_BLUE": { "hex": "#0033A0" },
                "KU_BLUE": { "hex": "#0051BA" },
                "UCLA_BLUE": { "hex": "#2D68C4" },
                "FLORIDA_BLUE": { "hex": "#0021A5" },
                "SYRACUSE_BLUE": { "hex": "#000E54" },
                "CAROLINA_BLUE": { "hex": "#7BAFD4" },
                "MICHIGAN_BLUE": { "hex": "#00274C" },
                "PENN_STATE_NAVY": { "hex": "#041E42" },
                "VIRGINIA_NAVY": { "hex": "#232D4B" },
                "ARIZONA_NAVY": { "hex": "#003366" },
                "ORANGE": { "hex": "#FA4616" },
                "BURNT_ORANGE": { "hex": "#BF5700" },
                "AUBURN_ORANGE": { "hex": "#E87722" },
                "TENNESSEE_ORANGE": { "hex": "#FF8200" },
                "VIRGINIA_ORANGE": { "hex": "#F84C1E" },
                "CLEMSON_ORANGE": { "hex": "#F66733" },
                "SYRACUSE_ORANGE": { "hex": "#F76900" },
                "GOLD": { "hex": "#C99700" },
                "NOTRE_DAME_GOLD": { "hex": "#C99700" },
                "UCLA_GOLD": { "hex": "#F2A900" },
                "USC_GOLD": { "hex": "#FFC72C" },
                "LSU_GOLD": { "hex": "#FDD023" },
                "BAYLOR_GOLD": { "hex": "#FECB00" },
                "WASHINGTON_GOLD": { "hex": "#B7A57A" },
                "FLORIDA_STATE_GOLD": { "hex": "#CEB888" },
                "MARYLAND_GOLD": { "hex": "#FFD520" },
                "IOWA_GOLD": { "hex": "#FFCD00" },
                "MICHIGAN_MAIZE": { "hex": "#FFCB05" },
                "GREEN": { "hex": "#154733" },
                "OREGON_GREEN": { "hex": "#154733" },
                "MICHIGAN_STATE_GREEN": { "hex": "#18453B" },
                "BAYLOR_GREEN": { "hex": "#003015" },
                "PURPLE": { "hex": "#461D7C" },
                "LSU_PURPLE": { "hex": "#461D7C" },
                "WASHINGTON_PURPLE": { "hex": "#4B2E83" },
                "CLEMSON_REGALIA": { "hex": "#522D80" },
                "RED": { "hex": "#C5050C" },
                "WISCONSIN_RED": { "hex": "#C5050C" },
                "GEORGIA_RED": { "hex": "#BA0C2F" },
                "MARYLAND_RED": { "hex": "#E03A3E" },
                "MAROON": { "hex": "#500000" },
                "GARNET": { "hex": "#782F40" },
                "YELLOW": { "hex": "#FEE123" },
                "CREAM": { "hex": "#DFD7C3" },
                "INDIANA_CREAM": { "hex": "#EEEDEB" },
                "GRAY": { "hex": "#666666" }
            },
            
            metallic: {},
            neutrals: {}
        },
        
        mappings: {
            ncaa_team_colors: {
                "Alabama Crimson Tide": {
                    "primary": {
                        "name": "Crimson",
                        "family": "crimson",
                        "aliases": ["ALABAMA CRIMSON", "9E1B32"]
                    },
                    "secondary": {
                        "name": "White",
                        "family": "white",
                        "aliases": ["WHITE", "FFFFFF"]
                    },
                    "accent": {
                        "name": "Gray",
                        "family": "gray",
                        "aliases": ["GRAY"]
                    }
                },
                "Wisconsin Badgers": {
                    "primary": {
                        "name": "Red",
                        "family": "red",
                        "aliases": ["WISCONSIN RED", "C5050C"]
                    },
                    "secondary": {
                        "name": "White",
                        "family": "white",
                        "aliases": ["WHITE", "FFFFFF"]
                    },
                    "accent": {
                        "name": "Black",
                        "family": "black",
                        "aliases": ["BLACK"]
                    }
                }
            }
        }
    },
    
    NBA: {
        teams: {
            "ATL": { "name": "Atlanta Hawks" },
            "BOS": { "name": "Boston Celtics" },
            "BRK": { "name": "Brooklyn Nets" },
            "CHA": { "name": "Charlotte Hornets" },
            "CHI": { "name": "Chicago Bulls" },
            "CLE": { "name": "Cleveland Cavaliers" },
            "DAL": { "name": "Dallas Mavericks" },
            "DEN": { "name": "Denver Nuggets" },
            "DET": { "name": "Detroit Pistons" },
            "GSW": { "name": "Golden State Warriors" },
            "HOU": { "name": "Houston Rockets" },
            "IND": { "name": "Indiana Pacers" },
            "LAC": { "name": "Los Angeles Clippers" },
            "LAL": { "name": "Los Angeles Lakers" },
            "MEM": { "name": "Memphis Grizzlies" },
            "MIA": { "name": "Miami Heat" },
            "MIL": { "name": "Milwaukee Bucks" },
            "MIN": { "name": "Minnesota Timberwolves" },
            "NOP": { "name": "New Orleans Pelicans" },
            "NYK": { "name": "New York Knicks" },
            "OKC": { "name": "Oklahoma City Thunder" },
            "ORL": { "name": "Orlando Magic" },
            "PHI": { "name": "Philadelphia 76ers" },
            "PHX": { "name": "Phoenix Suns" },
            "POR": { "name": "Portland Trail Blazers" },
            "SAC": { "name": "Sacramento Kings" },
            "SAS": { "name": "San Antonio Spurs" },
            "TOR": { "name": "Toronto Raptors" },
            "UTA": { "name": "Utah Jazz" },
            "WAS": { "name": "Washington Wizards" }
        },
        
        colors: {
            institutional: {
                "RED": { "hex": "#CE1141" },
                "HAWKS_RED": { "hex": "#E03A3E" },
                "HEAT_RED": { "hex": "#98002E" },
                "PISTONS_RED": { "hex": "#C8102E" },
                "WINE": { "hex": "#860038" },
                "NAVY": { "hex": "#002B5C" },
                "MIDNIGHT_BLUE": { "hex": "#0C2340" },
                "BEALE_STREET_BLUE": { "hex": "#12173F" },
                "ROYAL_BLUE": { "hex": "#1D428A" },
                "KNICKS_BLUE": { "hex": "#006BB6" },
                "THUNDER_BLUE": { "hex": "#007AC1" },
                "MAGIC_BLUE": { "hex": "#0077C0" },
                "MAVERICKS_BLUE": { "hex": "#00538C" },
                "MAVERICKS_NAVY": { "hex": "#002F5F" },
                "GRIZZLIES_NAVY": { "hex": "#5D76A9" },
                "ORANGE": { "hex": "#EF3B24" },
                "KNICKS_ORANGE": { "hex": "#F58426" },
                "SUNS_ORANGE": { "hex": "#E56020" },
                "GOLD": { "hex": "#FDBB30" },
                "WARRIORS_GOLD": { "hex": "#FFC72C" },
                "LAKERS_GOLD": { "hex": "#FDB927" },
                "NUGGETS_GOLD": { "hex": "#FEC524" },
                "CELTICS_GREEN": { "hex": "#007A33" },
                "HUNTER_GREEN": { "hex": "#00471B" },
                "VOLT_GREEN": { "hex": "#C1D32F" },
                "LIME_GREEN": { "hex": "#9EA2A2" },
                "PURPLE": { "hex": "#552583" },
                "KINGS_PURPLE": { "hex": "#5A2D81" },
                "SUNS_PURPLE": { "hex": "#1D1160" },
                "HORNETS_PURPLE": { "hex": "#1D1160" },
                "TEAL": { "hex": "#00788C" },
                "CREAM": { "hex": "#EEE1C6" }
            },
            
            metallic: {
                "SILVER": { "hex": "#63727A" },
                "SPURS_SILVER": { "hex": "#C4CED4" },
                "CELTICS_GOLD": { "hex": "#BA9653" }
            },
            
            neutrals: {
                "BLACK": { "hex": "#000000" },
                "WHITE": { "hex": "#FFFFFF" }
            }
        },
        
        mappings: {
            nba_team_colors: {
                "Atlanta Hawks": {
                    "primary": {
                        "name": "Hawks Red",
                        "family": "red",
                        "aliases": ["HAWKS RED", "E03A3E"]
                    },
                    "secondary": {
                        "name": "Volt Green",
                        "family": "green",
                        "aliases": ["VOLT GREEN", "C1D32F"]
                    },
                    "accent": {
                        "name": "Black",
                        "family": "black",
                        "aliases": ["BLACK"]
                    }
                },
                "Washington Wizards": {
                    "primary": {
                        "name": "Navy",
                        "family": "navy",
                        "aliases": ["WIZARDS NAVY", "002B5C"]
                    },
                    "secondary": {
                        "name": "Red",
                        "family": "red",
                        "aliases": ["WIZARDS RED", "E31837"]
                    },
                    "accent": {
                        "name": "Silver",
                        "family": "silver",
                        "aliases": ["SILVER"]
                    }
                }
            }
        }
    },
    
    NFL: {
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
        
        colors: {
            institutional: {
                "RED": { "hex": "#C60C30" },
                "SCARLET_RED": { "hex": "#AA0000" },
                "MAROON": { "hex": "#800000" },
                "NAVY": { "hex": "#0C2340" },
                "ROYAL_BLUE": { "hex": "#00338D" },
                "AQUA": { "hex": "#008E97" },
                "ORANGE": { "hex": "#FB4F14" },
                "GOLD": { "hex": "#FFB612" },
                "OLD_GOLD": { "hex": "#B3995D" },
                "GREEN": { "hex": "#125740" },
                "PURPLE": { "hex": "#241773" },
                "BROWN": { "hex": "#4E3629" }
            },
            
            metallic: {
                "SILVER": { "hex": "#A5ACAF" },
                "SILVER_METALLIC": { "hex": "#8A8D8F" },
                "ALUMINUM_METALLIC": { "hex": "#9EA2A2" },
                "GOLD_METALLIC": { "hex": "#B3995D" }
            },
            
            neutrals: {}
        },
        
        mappings: {
            nfl_team_colors: {}
        }
    },
    
    // Función para buscar equipo en cualquier liga
    findTeam: function(code) {
        const leagues = ['NFL', 'NBA', 'NCAA'];
        for (const league of leagues) {
            if (this[league] && this[league].teams && this[league].teams[code]) {
                return {
                    name: this[league].teams[code].name,
                    league: league,
                    colors: this.getTeamColors(this[league].teams[code].name, league)
                };
            }
        }
        return null;
    },
    
    // Función para obtener colores del equipo
    getTeamColors: function(teamName, league) {
        if (!this[league] || !this[league].mappings) return null;
        
        const leagueLower = league.toLowerCase();
        const mappings = this[league].mappings[`${leagueLower}_team_colors`];
        
        return mappings ? mappings[teamName] : null;
    },
    
    // Función para buscar color por nombre
    findColor: function(colorName) {
        const leagues = ['NFL', 'NBA', 'NCAA'];
        for (const league of leagues) {
            if (this[league] && this[league].colors) {
                // Buscar en institutional
                if (this[league].colors.institutional && 
                    this[league].colors.institutional[colorName]) {
                    return this[league].colors.institutional[colorName];
                }
                // Buscar en metallic
                if (this[league].colors.metallic && 
                    this[league].colors.metallic[colorName]) {
                    return this[league].colors.metallic[colorName];
                }
                // Buscar en neutrals
                if (this[league].colors.neutrals && 
                    this[league].colors.neutrals[colorName]) {
                    return this[league].colors.neutrals[colorName];
                }
            }
        }
        return null;
    }
};

// Crear un objeto Config que contenga TeamsConfig y otras configuraciones necesarias
const Config = {
    APP: {
        VERSION: '1.5.0',
        NAME: 'Tegra Spec Manager',
        MAX_IMAGE_SIZE_MB: 5,
        MAX_PLACEMENTS: 10,
        MAX_COLORS_PER_PLACEMENT: 12
    },
    
    COLOR_DATABASES: {
        PANTONE: {},
        GEARFORSPORT: {},
        INSTITUCIONAL: {}
    },
    
    // MAPAS DE EQUIPOS MEJORADOS - ESTOS SON CRÍTICOS PARA LA DETECCIÓN
    GEARFORSPORT_TEAM_MAP: {
        // Mapeo de códigos de estilo de Gear for Sport a equipos
        "UM9110-PMD0": "Maryland Terrapins",
        "UM9110-N042": "Notre Dame Fighting Irish", 
        "UM9111-PWI0": "Wisconsin Badgers",
        "UY9112-PGT1": "Georgia Tech Yellow Jackets",
        "UM9110": "Generic Team",
        "UM9111": "Generic Team",
        "UY9112": "Generic Team",
        
        // Códigos abreviados comunes en estilos
        "MD0": "Maryland",
        "N042": "Notre Dame",
        "PWI0": "Wisconsin",
        "PGT1": "Georgia Tech",
        "MD": "Maryland",
        "ND": "Notre Dame",
        "WIS": "Wisconsin",
        "GT": "Georgia Tech"
    },
    
    TEAM_CODE_MAP: {
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
        "WAS": "Washington Wizards",
        
        // NFL
        "ARI": "Arizona Cardinals",
        "ATL": "Atlanta Falcons",
        "BAL": "Baltimore Ravens",
        "BUF": "Buffalo Bills",
        "CAR": "Carolina Panthers",
        "CHI": "Chicago Bears",
        "CIN": "Cincinnati Bengals",
        "CLE": "Cleveland Browns",
        "DAL": "Dallas Cowboys",
        "DEN": "Denver Broncos",
        "DET": "Detroit Lions",
        "GBP": "Green Bay Packers",
        "HOU": "Houston Texans",
        "IND": "Indianapolis Colts",
        "JAG": "Jacksonville Jaguars",
        "KCC": "Kansas City Chiefs",
        "LAC": "Los Angeles Chargers",
        "LVR": "Las Vegas Raiders",
        "MIA": "Miami Dolphins",
        "MIN": "Minnesota Vikings",
        "NEP": "New England Patriots",
        "NOS": "New Orleans Saints",
        "NYG": "New York Giants",
        "NYJ": "New York Jets",
        "PHI": "Philadelphia Eagles",
        "PIT": "Pittsburgh Steelers",
        "RAM": "Los Angeles Rams",
        "SEA": "Seattle Seahawks",
        "SF9": "San Francisco 49ers",
        "TBB": "Tampa Bay Buccaneers",
        "TEN": "Tennessee Titans",
        "WAS": "Washington Commanders"
    },
    
    GEARFORSPORT_GENDER_MAP: {
        // Mapeo de códigos de género de Gear for Sport
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
        
        // Códigos de una letra
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
    
    GENDER_MAP: {
        'M': 'Men',
        'W': 'Women', 
        'Y': 'Youth',
        'K': 'Kids',
        'U': 'Unisex',
        'B': 'Boys',
        'G': 'Girls'
    },
    
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
    
    // Códigos de colores metálicos para detección
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC",
        "METALLIC GOLD", "METALLIC SILVER", "GOLD METALLIC", "SILVER METALLIC"
    ],
    
    // Incluir TeamsConfig como parte de Config
    TEAMS: TeamsConfig
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.TeamsConfig = TeamsConfig;
    window.Config = Config;
}
// fixes.js - Correcciones para Tegra Spec Manager CORREGIDO
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Aplicando correcciones...');
    
    // 1. Asegurar que Utils esté disponible
    if (typeof Utils === 'undefined') {
        console.error('Utils no está disponible. Cargando versión mínima...');
        
        // Versión mínima de Utils
        window.Utils = {
            getInkPreset: function(inkType = 'WATER') {
                const defaults = {
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
                };
                return defaults[inkType] || defaults.WATER;
            },
            
            isMetallicColor: function(colorName) {
                if (!colorName) return false;
                const upperColor = colorName.toUpperCase();
                
                if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) return true;
                
                const METALLIC_CODES = ["871C", "872C", "873C", "874C", "875C", "876C", "877C", "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"];
                
                for (const metallicCode of METALLIC_CODES) {
                    if (upperColor.includes(metallicCode)) return true;
                }
                
                return false;
            }
        };
    }
    
    // 2. Sobrescribir updateClientLogo para detectar GFS
    if (typeof window.updateClientLogo === 'function') {
        const originalUpdateClientLogo = window.updateClientLogo;
        window.updateClientLogo = function() {
            const customer = document.getElementById('customer');
            if (!customer) return;
            
            const customerValue = customer.value.toUpperCase().trim();
            const logoElement = document.getElementById('logoCliente');
            if (!logoElement) return;
            
            let logoUrl = '';
            
            // Detectar Gear for Sport con todas sus variaciones
            const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S'];
            const isGFS = gfsVariations.some(variation => customerValue.includes(variation));
            
            if (customerValue.includes('NIKE') || customerValue.includes('NIQUE')) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
            } else if (customerValue.includes('FANATICS') || customerValue.includes('FANATIC')) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
            } else if (customerValue.includes('ADIDAS')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png';
            } else if (customerValue.includes('PUMA')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png';
            } else if (customerValue.includes('UNDER ARMOUR') || customerValue.includes('UA')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png';
            } else if (isGFS) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png';
            }
            
            if (logoUrl) {
                logoElement.src = logoUrl;
                logoElement.style.display = 'block';
            } else {
                logoElement.style.display = 'none';
            }
        };
    }
    
    // 3. Mejorar checkForSpecialtiesInColors
    if (typeof window.checkForSpecialtiesInColors === 'function') {
        const originalCheckForSpecialties = window.checkForSpecialtiesInColors;
        window.checkForSpecialtiesInColors = function checkForSpecialtiesInColors(placementId) {
            const placement = window.placements.find(p => p.id === placementId);
            if (!placement) return [];
            
            let specialties = [];
            
            placement.colors.forEach(color => {
                if (color.val) {
                    const colorVal = color.val.toUpperCase();
                    
                    // Detectar HIGH DENSITY
                    if (colorVal.includes('HD') || colorVal.includes('HIGH DENSITY')) {
                        if (!specialties.includes('HIGH DENSITY')) {
                            specialties.push('HIGH DENSITY');
                        }
                    }
                    
                    // Detectar metálicos usando Utils
                    if (window.Utils && window.Utils.isMetallicColor(colorVal)) {
                        if (!specialties.includes('METALLIC')) {
                            specialties.push('METALLIC');
                        }
                    }
                    
                    // Detectar FOIL
                    if (colorVal.includes('FOIL')) {
                        if (!specialties.includes('FOIL')) {
                            specialties.push('FOIL');
                        }
                    }
                }
            });
            
            // Actualizar el campo de specialties
            const specialtiesField = document.getElementById(`specialties-${placementId}`);
            if (specialtiesField) {
                specialtiesField.value = specialties.join(', ');
                if (typeof window.updatePlacementField === 'function') {
                    window.updatePlacementField(placementId, 'specialties', specialtiesField.value);
                }
            }
            
            return specialties;
        };
    }
    
    // 4. Función para agregar campo SPECIALTIES
    function addSpecialtiesField(placementId) {
        const specialtiesField = document.getElementById(`specialties-${placementId}`);
        if (specialtiesField) return; // Ya existe
        
        // Buscar la sección de condiciones
        const conditionsCard = document.querySelector(`#placement-section-${placementId} .card:nth-child(3)`);
        if (!conditionsCard) return;
        
        const formGrid = conditionsCard.querySelector('.form-grid');
        if (!formGrid) return;
        
        // Crear campo SPECIALTIES
        const specialtiesHtml = `
            <div class="form-group">
                <label class="form-label">SPECIALTIES:</label>
                <input type="text" 
                       id="specialties-${placementId}"
                       class="form-control placement-specialties"
                       placeholder="Detectado automáticamente..."
                       value=""
                       readonly
                       title="Detectado automáticamente de los colores">
            </div>
        `;
        
        // Insertar después del campo de tiempo
        const timeField = conditionsCard.querySelector('.placement-time');
        if (timeField && timeField.parentElement) {
            timeField.parentElement.insertAdjacentHTML('afterend', specialtiesHtml);
        } else {
            formGrid.insertAdjacentHTML('beforeend', specialtiesHtml);
        }
    }
    
    // 5. Parchear renderPlacementHTML para agregar SPECIALTIES
    if (typeof window.renderPlacementHTML === 'function') {
        const originalRenderPlacementHTML = window.renderPlacementHTML;
        window.renderPlacementHTML = function(placement) {
            // Llamar a la función original
            originalRenderPlacementHTML.call(this, placement);
            
            // Agregar campo SPECIALTIES después de un breve delay
            setTimeout(() => {
                addSpecialtiesField(placement.id);
                
                // Actualizar el título para que solo muestre el tipo
                const title = document.querySelector(`#placement-section-${placement.id} .placement-title span`);
                if (title) {
                    const displayType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    title.textContent = displayType;
                }
                
                // Actualizar "Colores para X"
                const colorTitle = document.querySelector(`#placement-section-${placement.id} .card-title`);
                if (colorTitle && colorTitle.textContent.includes('Colores para')) {
                    const displayType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    colorTitle.textContent = `Colores para ${displayType}`;
                }
            }, 100);
        };
    }
    
    // 6. Reorganizar botones de acción (CORREGIDO - sin :contains)
    function reorganizeButtons() {
        setTimeout(() => {
            const actionButtons = document.querySelector('.card.no-print .card-body');
            if (!actionButtons) return;
            
            // Encontrar botones por su contenido de texto
            const buttons = actionButtons.querySelectorAll('button');
            let specButton = null;
            let pdfButton = null;
            
            buttons.forEach(button => {
                const text = button.textContent.trim();
                if (text.includes('Descargar Calculadora') || text.includes('Descargar Spec')) {
                    specButton = button;
                    button.textContent = ' Descargar Spec';
                    button.classList.remove('btn-warning');
                    button.classList.add('btn-primary');
                    button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                    button.style.borderColor = '#0056b3';
                } else if (text.includes('Exportar PDF')) {
                    pdfButton = button;
                    button.textContent = ' Exportar PDF';
                    button.classList.remove('btn-warning');
                    button.classList.add('btn-success');
                }
            });
            
            // Reordenar si encontramos ambos botones
            if (specButton && pdfButton) {
                // Mover PDF después de Spec
                specButton.parentNode.insertBefore(pdfButton, specButton.nextSibling);
            }
        }, 1500);
    }
    
    // 7. Corregir duplicatePlacement
    if (typeof window.duplicatePlacement === 'function') {
        const originalDuplicatePlacement = window.duplicatePlacement;
        window.duplicatePlacement = function(placementId) {
            const original = window.placements.find(p => p.id === placementId);
            if (!original) return;
            
            const newId = Date.now();
            const displayType = original.type.includes('CUSTOM:') 
                ? original.type.replace('CUSTOM: ', '')
                : original.type;
            
            // Crear copia sin "(Copia)" en el nombre
            const duplicate = JSON.parse(JSON.stringify(original));
            duplicate.id = newId;
            duplicate.name = displayType; // Solo el tipo, sin "Placement -" ni "(Copia)"
            
            // Asegurar que specialties esté definido
            if (!duplicate.specialties) duplicate.specialties = '';
            
            window.placements.push(duplicate);
            
            // Renderizar
            if (typeof window.renderPlacementHTML === 'function') {
                window.renderPlacementHTML(duplicate);
            }
            
            if (typeof window.updatePlacementsTabs === 'function') {
                window.updatePlacementsTabs();
            }
            
            if (typeof window.showPlacement === 'function') {
                window.showPlacement(newId);
            }
            
            if (typeof window.showStatus === 'function') {
                window.showStatus('✅ Placement duplicado correctamente');
            }
            
            return newId;
        };
    }
    
    // 8. Aplicar correcciones después de que todo esté cargado
    setTimeout(() => {
        reorganizeButtons();
        
        // Agregar SPECIALTIES a placements existentes
        if (window.placements && Array.isArray(window.placements)) {
            window.placements.forEach(placement => {
                addSpecialtiesField(placement.id);
            });
        }
        
        console.log('✅ Correcciones aplicadas correctamente');
    }, 2000);
});
