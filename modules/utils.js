// utils.js - COMPLETO Y CORREGIDO

const Utils = {
    // ========== FUNCIONES BÁSICAS ==========
    debounce: function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },
    
    formatDate: function(date, format = 'es-ES', includeTime = true) {
        try {
            const d = date instanceof Date ? date : new Date(date);
            if (format === 'short') {
                return d.toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
            }
            return d.toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (error) {
            return date || 'Fecha inválida';
        }
    },
    
    generateId: function(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // ========== DETECCIÓN DE EQUIPOS (CORREGIDA) ==========
    detectTeamFromStyle: function(style, customer = '') {
        if (!style) return '';
        
        try {
            const styleStr = style.toString().toUpperCase().trim();
            const customerUpper = (customer || '').toUpperCase();
            
            console.log('🔍 detectTeamFromStyle:', { style: styleStr, customer: customerUpper });
            
            // Detectar GFS
            const isGFS = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.'].some(v => customerUpper.includes(v));
            
            if (isGFS) {
                console.log('🏈 Usando SchoolsConfig para GFS');
                if (window.SchoolsConfig) {
                    const schoolData = window.SchoolsConfig.detectSchoolFromStyle(styleStr);
                    if (schoolData) return schoolData.teamName;
                }
            } else {
                console.log('🏈 Usando mapa NFL');
                // Mapa NFL
                const nflTeams = {
                    "TBB": "Tampa Bay Buccaneers", "TB": "Tampa Bay Buccaneers",
                    "CHI": "Chicago Bears", "GB": "Green Bay Packers",
                    "MIN": "Minnesota Vikings", "DET": "Detroit Lions",
                    "ATL": "Atlanta Falcons", "CAR": "Carolina Panthers",
                    "NO": "New Orleans Saints", "NOS": "New Orleans Saints",
                    "DAL": "Dallas Cowboys", "NYG": "New York Giants",
                    "PHI": "Philadelphia Eagles", "WAS": "Washington Commanders",
                    "ARI": "Arizona Cardinals", "LAR": "Los Angeles Rams",
                    "SF": "San Francisco 49ers", "SEA": "Seattle Seahawks",
                    "BAL": "Baltimore Ravens", "CIN": "Cincinnati Bengals",
                    "CLE": "Cleveland Browns", "PIT": "Pittsburgh Steelers",
                    "HOU": "Houston Texans", "IND": "Indianapolis Colts",
                    "JAX": "Jacksonville Jaguars", "TEN": "Tennessee Titans",
                    "BUF": "Buffalo Bills", "MIA": "Miami Dolphins",
                    "NE": "New England Patriots", "NYJ": "New York Jets",
                    "DEN": "Denver Broncos", "KC": "Kansas City Chiefs",
                    "LV": "Las Vegas Raiders", "LAC": "Los Angeles Chargers"
                };
                
                // Ordenar por longitud (códigos más largos primero)
                const sortedCodes = Object.keys(nflTeams).sort((a, b) => b.length - a.length);
                
                for (const code of sortedCodes) {
                    const regex = new RegExp(`\\b${code}\\b`, 'i');
                    if (regex.test(styleStr)) {
                        return nflTeams[code];
                    }
                }
            }
            
            // NCAA como fallback
            if (window.TeamsConfig?.NCAA?.teams) {
                for (const [code, teamData] of Object.entries(window.TeamsConfig.NCAA.teams)) {
                    if (code.length >= 3 && styleStr.includes(code)) {
                        return teamData.name;
                    }
                }
            }
            
        } catch (error) {
            console.warn('Error en detectTeamFromStyle:', error);
        }
        
        return '';
    }, // <-- COMA IMPORTANTE
    
    // ========== EXTRACCIÓN DE GÉNERO ==========
    extractGenderFromStyle: function(style) {
        if (!style) return '';
        
        try {
            const styleStr = style.toString().toUpperCase().trim();
            
            const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
            if (gearForSportMatch && gearForSportMatch[1]) {
                const genderCode = gearForSportMatch[1];
                
                if (window.Config?.GEARFORSPORT_GENDER_MAP) {
                    const fullCode = `U${genderCode}`;
                    if (window.Config.GEARFORSPORT_GENDER_MAP[fullCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
                    }
                    if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
                        return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
                    }
                }
            }
            
            if (styleStr.includes(' MEN') || styleStr.endsWith('M')) return 'Men';
            if (styleStr.includes(' WOMEN') || styleStr.endsWith('W')) return 'Women';
            if (styleStr.includes(' YOUTH') || styleStr.endsWith('Y')) return 'Youth';
            
        } catch (error) {
            console.warn('Error en extractGenderFromStyle:', error);
        }
        
        return '';
    }, // <-- COMA IMPORTANTE
    
    // ========== FUNCIÓN DE COLORES ==========
    getColorHex: function(colorName) {
        if (!colorName) return null;
        
        // Colores básicos
        const basicColors = {
            'RED': '#FF0000', 'BLUE': '#0000FF', 'GREEN': '#00FF00',
            'BLACK': '#000000', 'WHITE': '#FFFFFF', 'YELLOW': '#FFFF00',
            'PURPLE': '#800080', 'ORANGE': '#FFA500', 'GRAY': '#808080',
            'GOLD': '#FFD700', 'SILVER': '#C0C0C0', 'NAVY': '#000080',
            'MAROON': '#800000', 'PINK': '#FFC0CB', 'BROWN': '#A52A2A'
        };
        
        const upperName = colorName.toUpperCase().trim();
        if (basicColors[upperName]) return basicColors[upperName];
        
        for (const [color, hex] of Object.entries(basicColors)) {
            if (upperName.includes(color)) return hex;
        }
        
        return '#CCCCCC';
    },
    
    // ========== FUNCIÓN DE TINTAS ==========
    getInkPreset: function(inkType = 'WATER') {
        const presets = {
            'WATER': { temp: '320 °F', time: '1:40 min' },
            'PLASTISOL': { temp: '320 °F', time: '1:00 min' },
            'SILICONE': { temp: '320 °F', time: '1:40 min' }
        };
        return presets[inkType] || presets.WATER;
    }
    
}; // <-- LLAVE FINAL DEL OBJETO UTILS

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    console.log('✅ Utils cargado correctamente');
}
