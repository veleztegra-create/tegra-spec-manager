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
    
    // URLs de logos de clientes
    CLIENT_LOGOS: {
        'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
        'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
        'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
        'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
        'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
        'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
    },
    
    // Logo de Tegra para PDF (SVG en base64)
    LOGOS: {
        TEGRA: {
            base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ2IiBoZWlnaHQ9IjM5IiB2aWV3Qm94PSIwIDAgMTQ1Ljk0IDM5LjA1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00Mi4yNCwxMi4zN3YxLjkzaDYuOTF2MTUuMjVoNC4yMXYtMTUuMjVoNi45MXYtMy44OGgtMTYuMWwtMS45MywxLjk1Wk05Mi4wNiwyMC4zMXYxLjg3aDQuMjR2Mi43M2MtMC41MywwLjM4LTEuMTMsMC42Ny0xLjgsMC44Ni0wLjY3LDAuMTktMS4zOSwwLjI5LTIuMTYsMC4yOS0wLjg0LDAtMS42MSwwLjE1LTIuMzItMC40NS0wLjcxLTAuMy0xLjMzLTAuNzItMS44NC0xLjI3LTAuNTItMC41NS0wLjkyLTEuMTktMS4yLTEuOTMtMC4yOC0wLjc0LTAuNDItMS41NC0wLjQyLTIuNDJ2LTAuMDVjMC0wLjgyLDAuMTQtMS41OSwwLjQyLTIuMzFjMC4yOC0wLjcyLDAuNjctMS4zNSwxLjE4LTEuODljMC41LTAuNTQsMS4wOC0wLjk3LDEuNzUtMS4yOGMwLjY2LTAuMzIsMS4zOC0wLjQ4LDIuMTUtMC40OGMwLjU1LDAsMS4wNSwwLjA1LDEuNSwwLjE0YzAuNDYsMC4wOSwwLjg4LDAuMjIsMS4yNywwLjM4YzAuMzksMC4xNiwwLjc3LDAuMzYsMS4xMywwLjZjMC4yNSwwLjE2LDAuNDksMC4zNCwwLjc0LDAuNTRsMi45NC0yLjk3Yy0wLjQ3LTAuNC0wLjk2LTAuNzUtMS40Ni0xLjA3Yy0wLjUzLTAuMzMtMS4wOS0wLjYtMS43LTAuODJjLTAuNi0wLjIyLTEuMjUtMC4zOS0xLjk1LTAuNTFjLTAuNy0wLjEyLTEuNDgtMC4xOC0yLjM0LTAuMThjLTEuNDQsMC0yLjc3LDAuMjYtNCwwLjc4Yy0xLjIzLDAuNTItMi4yOSwxLjIzLTMuMTgsMi4xM2MtMC44OSwwLjktMS41OSwxLjk1LTIuMDksMy4xNGMtMC41LDEuMTktMC43NSwyLjQ3LTAuNzUsMy44NHYtMC4wNWMwLDEuNDIsMC4yNSwyLjczLDAuNzQsMy45NGMwLjQ5LDEuMiwxLjE4LDIuMjQsMi4wNiwzLjEyYzAuODgsMC44NywxLjk0LDEuNTYsMy4xNywyLjA1YzEuMjMsMC40OSwyLjU5LDAuNzQsNC4wOSwwLjc0YzEuNzUsMCwzLjMtMC4zLDQuNjYtMC44OWMxLjM2LTAuNTksMi41My0xLjMxLDMuNTEtMi4xNXYtOC4zMWgtNi41NmwtMS43NCwxLjc2Wk02OC4xNSwyMS44aDkuMDJ2LTMuNzRoLTkuMDJ2LTMuODhoMTAuMjV2LTMuNzRoLTEyLjU1bDAuMTQsMC4xNHYxNy4xMmgxNC41NHYtMy43NGgtMTAuNTN2LTQuMDJaTTExNC4yNCwxMC40M2gtOC43NXYxOS4xM2g0LjIxdi02LjEyaDMuMzFsNC4xMCw2LjEyaDIuNTdsMS4zOS0xLjQwLTMuNzEtNS40M2MxLjIyLTAuNDYsMi4yMS0xLjE3LDIuOTctMi4xNWMwLjc2LTAuOTcsMS4xMy0yLjI0LDEuMTMtMy43OXYtMC4wNWMwLTEuODItMC41NS0zLjI4LTEuNjQtNC4zN2MtMS4yOS0xLjI5LTMuMTUtMS45NC01LjU4LTEuOTRaTTExNy4xOSwxNy4wM2MwLDAuODItMC4yOCwxLjQ4LTAuODMsMS45OGMtMC41NiwwLjQ5LTEuMzUsMC43NC0yLjM5LDAuNzRoLTQuMjZ2LTUuNTJoNC4xOGMxLjA0LDAsMS44NSwwLjIzLDIuNDMsMC42OWMwLjU4LDAuNDYsMC44NywxLjE0LDAuODcsMi4wNnYwLjA1Wk0xMzYuNywxMC4yOWgtMy44OGwtOC4yMCwxOS4yN2g0LjI5bDEuNzUtNC4yOWg4LjA5bDEuNzUsNC4yOWgxLjk3bDEuNzAtMS43Mi03LjQ3LTE3LjU1Wk0xMzIuMTYsMjEuNThsMi41NC02LjIwLDIuNTQsNi4yMGgtNS4wOFoiLz48Zz48cG9seWdvbiBwb2ludHM9IjcuNDQgMzEuMzggNi41OSAzMi4yNCA2Ljg4IDMzLjM5IDguMDMgMzMuNjggOC44OSAzMi44MyA4LjU5IDMxLjY4IDcuNDQgMzEuMzgiLz48cG9seWdvbiBwb2ludHM9IjYuNzkgMjguNjcgNy45NCAyOC45NyAxMC40MSAyNi41IDEwLjExIDI1LjM1IDguOTYgMjUuMDUgNi40OSAyNy41MiA2Ljc5IDI4LjY3Ii8+PHBvbHlnb24gcG9pbnRzPSIxMC41NCAxNC42MSA5LjQgMTQuMzEgNi45MyAxNi43OCA3LjIzIDE3LjkzIDguMzcgMTguMjMgMTAuODUgMTUuNzYgMTAuNTQgMTQuNjEiLz48cG9seWdvbiBwb2ludHM9IjI2LjM4IDIyLjc5IDI1LjA2IDI0LjExIDI1LjM2IDI1LjI2IDI2LjUgMjUuNTYgMjcuODIgMjQuMjQgMjcuNTIgMjMuMDkgMjYuMzggMjIuNzkiLz48cGF0aCBkPSJNMjEuOSwzNi45M2wwLjMwLDEuMTUsMS4xNSwwLjMwLDAuODUtMC44NS0wLjMwLTEuMTUtMS4xNS0wLjMwLTAuODUsMC44NVpNMTguMDEsMjkuMjFsLTAuMzAtMS4xNSwwLjg1LTAuODUsMS4xNSwwLjMwLDAuMzAsMS4xNS0wLjg1LDAuODUtMS4xNS0wLjMwWk0xOC44MywxOS41NmwtMC4zMC0xLjE1LDEuNTAtMS41MCwxLjE1LDAuMzAsMC4zMCwxLjE1LTEuNTAsMS41MC0xLjE1LTAuMzBaTTIwLjg1LDE0LjYxbC0wLjMwLTEuMTUsMS41MC0xLjUwLDEuMTUsMC4zMCwwLjMwLDEuMTUtMS41MCwxLjUwLTEuMTUtMC4zMFpNMTQuMzMsMTUuMzRsLTAuMzAtMS4xNCwzLjc4LTMuNjgsMS4xNCwwLjMwLDAuMzAsMS4xNC0zLjc4LDMuNjgtMS4xNS0wLjMwWk0yNC4yMSwxMC42OGwtMC4zMC0xLjE1LDIuMTctMi4xNywxLjE0LDAuMzAsMC4zMCwxLjE0LTIuMTcsMi4xNy0xLjE0LTAuMzBaTTIwLjU5LDkuMTJsLTAuMzAtMS4xNSwwLjg1LTAuODUsMS4xNSwwLjMwLDAuMzAsMS4xNS0wLjg1LDAuODUtMS4xNS0wLjMwWk0xNS4wNiw4LjgybC0wLjMwLTEuMTUsMS41MC0xLjUwLDEuMTUsMC4zMCwwLjMwLDEuMTUtMS41MCwxLjUwLTEuMTUtMC4zMFpNMjUuNTEsMGwtNC45MCw0LjkwLTEuMTQtMC4zMC0wLjMwLTEuMTQsMy40Ni0zLjQ2SDB2OS41NWg0LjU0bC0xLjY3LDEuNjcsMC4zMCwxLjE0LDEuMTUsMC4zMCwzLjEyLTMuMTJoMC4wMmwyLjU5LTIuNTksMS4xNCwwLjMwLDAuMzAsMS4xNC0wLjU3LDAuNTctMS44MSwxLjc4LDAuMzAsMS4xNSwxLjE1LDAuMzAsMi41MC0yLjQ1djguNDFsLTMuOTksMy45OSwwLjMwLDEuMTUsMS4xNSwwLjMwLDQuNjItNC42MiwxLjA3LDAuMjgsMC4zMCwxLjE1LTEuNDIsMS40Mi0wLjkzLDAuOTMtMC44NCwwLjg0LTEuNzgsMS43OCwwLjMwLDEuMTUsMS4xNCwwLjMwLDMuNTYtMy41NiwwLjI3LTAuMjcsMS4xNCwwLjMwLDAuMzAsMS4xNC00LjY0LDQuNjRoLTAuMDNzLTIuNTIsMi41MS0yLjUyLDIuNTFsMC4zMSwxLjE2LDEuMTcsMC4zMSwyLjUyLTIuNTJoMHMwLjMwLTAuMzIsMC4zMC0wLjMybDEuMTQsMC4zMCwwLjMwLDEuMTUtMy43NSwzLjc1aDBzLTIuMTcsMi4xOC0yLjE3LDIuMThsMC4zMCwxLjE0LDEuMTUsMC4zMCw2LjM1LTYuMzUsMS4xNCwwLjMwLDAuMzAsMS4xNS0yLjgyLDIuNzcsMC4zMCwxLjE0LDEuMTUsMC4zMCw1LjE1LTUuMTB2LTIuODloMHMtMS4yNCwxLjI0LTEuMjQsMS4yNGwtMS4xNS0wLjMwLTAuMzAtMS4xNCwzLjQzLTMuNDEtMC4zMC0xLjE1LTAuNDUtMC4xMi0wLjcxLTAuMTktMS4wNSwxLjA1LTEuMTQtMC4zMC0wLjMwLTEuMTQsNi4xNi02LjMxLTAuMzAtMS4xNS0xLjE0LTAuMzAtMS41MSwxLjUxdi00LjM0bDUuMjUtNC43Nmg3LjI4VjBoLTEwLjkyWiIvPjwvZz48L3N2Zz4=',
            width: 146,
            height: 39,
            alt: 'Tegra Logo'
        }
    },

    // Códigos de metálicos para detección
    METALLIC_CODES: [
        "871C", "872C", "873C", "874C", "875C", "876C", "877C",
        "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
    ]
};

// Asegurarse de que Config esté disponible globalmente
if (typeof window !== 'undefined') {
    window.Config = Config;
}