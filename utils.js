// utils.js - Utilidades generales CORREGIDO Y COMPLETO
const Utils = {
    // Debounce para mejorar rendimiento
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
            if (callNow) func(...args);
        };
    },
    
    // Throttle para eventos que se disparan frecuentemente
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Formatear fecha
    formatDate: function(date, format = 'es-ES', includeTime = true) {
        const d = date instanceof Date ? date : new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        if (format === 'long') {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            
            return d.toLocaleDateString('es-ES', options);
        }
        
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Generar ID único
    generateId: function(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Capitalizar texto
    capitalize: function(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    // Formatear texto (primera letra mayúscula de cada palabra)
    titleCase: function(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },
    
    // Truncar texto con elipsis
    truncate: function(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // Extraer números de un string
    extractNumbers: function(text) {
        if (!text) return [];
        const matches = text.match(/\d+/g);
        return matches ? matches.map(Number) : [];
    },
    
    // Convertir tamaño de bytes a formato legible
    formatBytes: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    // Validar email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar URL
    validateURL: function(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Convertir DataURL a Blob
    dataURLtoBlob: function(dataURL) {
        try {
            if (!dataURL.startsWith('data:')) {
                throw new Error('No es una data URL válida');
            }
            
            const arr = dataURL.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            
            if (!mimeMatch) {
                throw new Error('No se pudo determinar el tipo MIME');
            }
            
            const mime = mimeMatch[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            return new Blob([u8arr], { type: mime });
        } catch (error) {
            console.error('Error en dataURLtoBlob:', error);
            throw error;
        }
    },
    
    // Convertir Blob a DataURL
    blobToDataURL: function(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error al leer el blob'));
            reader.readAsDataURL(blob);
        });
    },
    
    // Descargar archivo
    downloadFile: function(data, filename, type = 'application/octet-stream') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Leer archivo como texto
    readFileAsText: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    },
    
    // Leer archivo como ArrayBuffer
    readFileAsArrayBuffer: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
            reader.readAsArrayBuffer(file);
        });
    },
    
    // Copiar texto al portapapeles
    copyToClipboard: function(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // Fallback para navegadores más antiguos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    successful ? resolve() : reject(new Error('Falló el comando copy'));
                } catch (err) {
                    document.body.removeChild(textArea);
                    reject(err);
                }
            }
        });
    },
    
    // Generar hash simple de un string
    stringToHash: function(str) {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },
    
    // Generar color aleatorio basado en string
    stringToColor: function(str) {
        const hash = this.stringToHash(str);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    },
    
    // ========== FUNCIÓN MEJORADA detectTeamFromStyle ==========
    detectTeamFromStyle: function(style) {
        if (!style) return '';
        
        const styleStr = style.toString().toUpperCase().trim();
        console.log('🔍 Detectando equipo para estilo:', styleStr);
        
        // 1. Buscar en Gear for Sport primero (coincidencia exacta)
        if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
            console.log('Buscando en GEARFORSPORT_TEAM_MAP...');
            for (const [code, teamName] of Object.entries(window.Config.GEARFORSPORT_TEAM_MAP)) {
                // Coincidencia exacta o parcial
                if (styleStr === code || styleStr.includes(code)) {
                    console.log(`✓ Encontrado en GEARFORSPORT_TEAM_MAP: ${code} -> ${teamName}`);
                    return teamName;
                }
            }
        }
        
        // 2. Buscar en códigos de equipo generales (TEAM_CODE_MAP)
        if (window.Config && window.Config.TEAM_CODE_MAP) {
            console.log('Buscando en TEAM_CODE_MAP...');
            for (const [code, teamName] of Object.entries(window.Config.TEAM_CODE_MAP)) {
                // Buscar el código en el estilo
                if (styleStr.includes(code)) {
                    console.log(`✓ Encontrado en TEAM_CODE_MAP: ${code} -> ${teamName}`);
                    return teamName;
                }
            }
        }
        
        // 3. Buscar directamente en TeamsConfig (NCAA, NBA, NFL)
        if (window.TeamsConfig) {
            console.log('Buscando en TeamsConfig...');
            const leagues = ['NCAA', 'NBA', 'NFL'];
            
            for (const league of leagues) {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].teams) {
                    for (const [code, teamData] of Object.entries(window.TeamsConfig[league].teams)) {
                        // Buscar por código (ej: "WIS" en "UM9111-PWI0")
                        if (styleStr.includes(code)) {
                            console.log(`✓ Encontrado en TeamsConfig.${league}: ${code} -> ${teamData.name}`);
                            return teamData.name;
                        }
                        
                        // También buscar por nombre del equipo (palabras clave)
                        const teamNameUpper = teamData.name.toUpperCase();
                        const teamWords = teamNameUpper.split(' ');
                        
                        // Verificar si alguna palabra del nombre del equipo está en el estilo
                        for (const word of teamWords) {
                            if (word.length > 3 && styleStr.includes(word)) {
                                console.log(`✓ Encontrado por palabra clave en ${league}: ${word} -> ${teamData.name}`);
                                return teamData.name;
                            }
                        }
                    }
                }
            }
        }
        
        // 4. Si no se encuentra, intentar extraer del estilo usando patrones comunes
        console.log('Intentando extraer con patrones...');
        
        // Patrón para Gear for Sport: UM9111-PWI0 -> "PWI0" podría contener "WIS"
        const patternMatch = styleStr.match(/[_-]([A-Z]{2,4}\d*)/);
        if (patternMatch && patternMatch[1]) {
            const potentialCode = patternMatch[1].substring(0, 3); // Tomar primeros 3 caracteres
            
            // Buscar este código en TEAM_CODE_MAP
            if (window.Config && window.Config.TEAM_CODE_MAP[potentialCode]) {
                console.log(`✓ Encontrado por patrón: ${potentialCode} -> ${window.Config.TEAM_CODE_MAP[potentialCode]}`);
                return window.Config.TEAM_CODE_MAP[potentialCode];
            }
        }
        
        console.log('❌ No se detectó equipo para:', styleStr);
        return '';
    },
    
    // ========== FUNCIÓN MEJORADA extractGenderFromStyle ==========
    extractGenderFromStyle: function(style) {
        if (!style) return '';
        
        const styleStr = style.toString().toUpperCase().trim();
        console.log('👤 Detectando género para estilo:', styleStr);
        
        // Detectar formato Gear for Sport (UM9002, UW9002, UY9002)
        const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
        if (gearForSportMatch && gearForSportMatch[1]) {
            const genderCode = gearForSportMatch[1];
            console.log(`Gear for Sport código detectado: ${genderCode}`);
            
            // Buscar en el mapa de Gear for Sport
            if (window.Config && window.Config.GEARFORSPORT_GENDER_MAP) {
                const fullCode = `U${genderCode}`;
                if (window.Config.GEARFORSPORT_GENDER_MAP[fullCode]) {
                    console.log(`✓ Género encontrado en GEARFORSPORT_GENDER_MAP: ${fullCode} -> ${window.Config.GEARFORSPORT_GENDER_MAP[fullCode]}`);
                    return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
                }
                // También probar con solo la letra
                if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
                    console.log(`✓ Género encontrado en GEARFORSPORT_GENDER_MAP: ${genderCode} -> ${window.Config.GEARFORSPORT_GENDER_MAP[genderCode]}`);
                    return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
                }
            }
        }
        
        // Buscar códigos de género en el estilo
        const parts = styleStr.split(/[-_ ]/);
        
        if (window.Config && window.Config.GENDER_MAP) {
            for (const part of parts) {
                if (window.Config.GENDER_MAP[part]) {
                    console.log(`✓ Género encontrado en GENDER_MAP: ${part} -> ${window.Config.GENDER_MAP[part]}`);
                    return window.Config.GENDER_MAP[part];
                }
            }
        }
        
        // Verificar combinaciones comunes
        if (styleStr.includes(' MEN') || styleStr.includes('_M') || styleStr.endsWith('M')) {
            console.log('✓ Género detectado por patrón: Men');
            return 'Men';
        }
        if (styleStr.includes(' WOMEN') || styleStr.includes('_W') || styleStr.endsWith('W')) {
            console.log('✓ Género detectado por patrón: Women');
            return 'Women';
        }
        if (styleStr.includes(' YOUTH') || styleStr.includes('_Y') || styleStr.endsWith('Y')) {
            console.log('✓ Género detectado por patrón: Youth');
            return 'Youth';
        }
        if (styleStr.includes(' KIDS') || styleStr.includes('_K') || styleStr.endsWith('K')) {
            console.log('✓ Género detectado por patrón: Kids');
            return 'Kids';
        }
        if (styleStr.includes(' UNISEX') || styleStr.includes('_U') || styleStr.endsWith('U')) {
            console.log('✓ Género detectado por patrón: Unisex');
            return 'Unisex';
        }
        if (styleStr.includes(' BOYS') || styleStr.includes('_B') || styleStr.endsWith('B')) {
            console.log('✓ Género detectado por patrón: Boys');
            return 'Boys';
        }
        if (styleStr.includes(' GIRLS') || styleStr.includes('_G') || styleStr.endsWith('G')) {
            console.log('✓ Género detectado por patrón: Girls');
            return 'Girls';
        }
        
        console.log('❌ No se detectó género para:', styleStr);
        return '';
    },
    
    // Normalizar color Gear for Sport
    normalizeGearForSportColor: function(colorName) {
    if (!colorName) return colorName;
    
    const upperColor = colorName.toUpperCase().trim();
        
           if (!window.Config || !window.Config.COLOR_DATABASES || !window.Config.COLOR_DATABASES.GEARFORSPORT) {
        console.warn('Config.COLOR_DATABASES.GEARFORSPORT no está cargado');
        return colorName;
    }
    
    for (const [key, data] of Object.entries(window.Config.COLOR_DATABASES.GEARFORSPORT)) {
        const keyUpper = key.toUpperCase();
                
                // Coincidencia exacta
        if (upperColor === keyUpper) {
            return key;
        }
        
        // Coincidencia parcial
        if (keyUpper.includes(upperColor) || upperColor.includes(keyUpper)) {
            return key;
        }
        
        // Coincidencia con número
        const numberMatch = upperColor.match(/(\d{3,4})/);
        if (numberMatch) {
            const number = numberMatch[1];
            if (keyUpper.includes(number)) {
                return key;
            }
        }
    }
    
    return colorName;
},

getColorHex: function(colorName) {
    if (!colorName) return null;
    
    const name = colorName.toUpperCase().trim();
    
    // VERIFICAR SI CONFIG ESTÁ DEFINIDO
    if (!window.Config || !window.Config.COLOR_DATABASES) {
        console.warn('Config.COLOR_DATABASES no está cargado');
        return null;
    }
    
    // Buscar en todas las bases de datos
    for (const db of Object.values(window.Config.COLOR_DATABASES)) {
        for (const [key, data] of Object.entries(db)) {
            if (name === key.toUpperCase() || 
                name.includes(key.toUpperCase()) || 
                key.toUpperCase().includes(name)) {
                return data.hex;
            }
        }
    }
    
    // Buscar código hex directo
    const hexMatch = name.match(/#([0-9A-F]{6})/i);
    if (hexMatch) {
        return `#${hexMatch[1]}`;
    }
    
    return null;
},
    
    // Verificar si es color metálico
    isMetallicColor: function(colorName) {
        if (!colorName) return false;
        
        const upperColor = colorName.toUpperCase();
        
        // Detectar códigos Pantone metálicos (871C-877C)
        if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
            return true;
        }
        
        // Detectar palabras clave metálicas
        const metallicCodes = (window.Config && window.Config.METALLIC_CODES) || [
            "871C", "872C", "873C", "874C", "875C", "876C", "877C",
            "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"
        ];
        
        for (const metallicCode of metallicCodes) {
            if (upperColor.includes(metallicCode)) {
                return true;
            }
        }
        
        return false;
    },
    
    // Verificar si es FOIL
    isFoilColor: function(colorName) {
        if (!colorName) return false;
        return colorName.toUpperCase().includes('FOIL');
    },
    
    // Verificar si es HIGH DENSITY
    isHighDensityColor: function(colorName) {
        if (!colorName) return false;
        const upperColor = colorName.toUpperCase();
        return upperColor.includes('HD') || upperColor.includes('HIGH DENSITY');
    },
    
    // Detectar todas las especialidades
    detectSpecialties: function(colorName) {
        const specialties = [];
        
        if (this.isMetallicColor(colorName)) {
            specialties.push('METALLIC');
        }
        if (this.isFoilColor(colorName)) {
            specialties.push('FOIL');
        }
        if (this.isHighDensityColor(colorName)) {
            specialties.push('HIGH DENSITY');
        }
        
        return specialties;
    },
    
    // Obtener logo del cliente
    getClientLogo: function(customerName) {
        if (!customerName) return null;
        
        const upperCustomer = customerName.toUpperCase();
        
        const logoMap = {
            'NIKE': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            'FANATICS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            'ADIDAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
            'PUMA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
            'UNDER ARMOUR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
            'UA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
            'GEAR FOR SPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            'GEARFORSPORT': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            'GFS': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            'G.F.S.': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            'GEAR': 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png'
        };
        
        for (const [key, logoUrl] of Object.entries(logoMap)) {
            if (upperCustomer.includes(key)) {
                return logoUrl;
            }
        }
        
        return null;
    },
    
    // Delay/pausa
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Filtrar objetos duplicados por propiedad
    removeDuplicates: function(array, property) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[property];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },
    
    // Ordenar array por propiedad
    sortBy: function(array, property, ascending = true) {
        return [...array].sort((a, b) => {
            let aValue = a[property];
            let bValue = b[property];
            
            // Convertir a string si es necesario
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            
            if (aValue < bValue) return ascending ? -1 : 1;
            if (aValue > bValue) return ascending ? 1 : -1;
            return 0;
        });
    },
    
    // Obtener preset de tinta
    getInkPreset: function(inkType = 'WATER') {
        // Primero intentar desde Config
        if (window.Config && window.Config.INK_PRESETS && window.Config.INK_PRESETS[inkType]) {
            return window.Config.INK_PRESETS[inkType];
        }
        
        // Valores por defecto si Config no está cargado
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
    
    // Convertir hex a RGB
    hexToRgb: function(hex) {
        if (!hex) return [0, 0, 0];
        hex = hex.replace('#', '');
        
        // Expandir formato corto (3 dígitos) a largo (6 dígitos)
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    },
    
    // Validar si un archivo es imagen
    isImageFile: function(file) {
        if (!file || !file.type) return false;
        return file.type.startsWith('image/');
    },
    
    // Validar si un archivo es Excel
    isExcelFile: function(file) {
        if (!file || !file.type) return false;
        const excelTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.spreadsheet'
        ];
        return excelTypes.includes(file.type) || 
               file.name.toLowerCase().endsWith('.xlsx') || 
               file.name.toLowerCase().endsWith('.xls');
    },
    
    // Crear objeto placement por defecto
    createDefaultPlacement: function(type = 'FRONT') {
        const inkPreset = this.getInkPreset('WATER');
        
        return {
            id: this.generateId('placement_'),
            type: type,
            name: type, // Solo el tipo, sin "Placement -"
            imageData: null,
            colors: [],
            placementDetails: '#.#" FROM COLLAR SEAM',
            dimensions: 'SIZE: (W) ##" X (H) ##"',
            temp: inkPreset.temp,
            time: inkPreset.time,
            specialties: '',
            specialInstructions: '',
            inkType: 'WATER',
            placementSelect: type,
            isActive: true,
            // Parámetros de impresión
            meshColor: inkPreset.color.mesh,
            meshWhite: inkPreset.white.mesh1,
            meshBlocker: inkPreset.blocker.mesh1,
            durometer: inkPreset.color.durometer,
            strokes: inkPreset.color.strokes,
            angle: inkPreset.color.angle,
            pressure: inkPreset.color.pressure,
            speed: inkPreset.color.speed,
            additives: inkPreset.color.additives
        };
    },
    
    // ========== FUNCIONES DE DEBUG ==========
    debugTeamDetection: function(style) {
        console.log('=== DEBUG TEAM DETECTION ===');
        console.log('Input:', style);
        
        const styleStr = style.toString().toUpperCase().trim();
        
        // 1. Verificar Gear for Sport
        console.log('\n1. Buscando en GEARFORSPORT_TEAM_MAP:');
        if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
            for (const [code, teamName] of Object.entries(window.Config.GEARFORSPORT_TEAM_MAP)) {
                if (styleStr.includes(code)) {
                    console.log(`   ✓ "${code}" -> "${teamName}"`);
                }
            }
        }
        
        // 2. Verificar TEAM_CODE_MAP
        console.log('\n2. Buscando en TEAM_CODE_MAP:');
        if (window.Config && window.Config.TEAM_CODE_MAP) {
            for (const [code, teamName] of Object.entries(window.Config.TEAM_CODE_MAP)) {
                if (styleStr.includes(code)) {
                    console.log(`   ✓ "${code}" -> "${teamName}"`);
                }
            }
        }
        
        // 3. Verificar TeamsConfig
        console.log('\n3. Buscando en TeamsConfig:');
        if (window.TeamsConfig) {
            const leagues = ['NCAA', 'NBA', 'NFL'];
            leagues.forEach(league => {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].teams) {
                    for (const [code, teamData] of Object.entries(window.TeamsConfig[league].teams)) {
                        if (styleStr.includes(code)) {
                            console.log(`   ✓ "${code}" -> "${teamData.name}" (${league})`);
                        }
                    }
                }
            });
        }
        
        // 4. Ejecutar la función real
        console.log('\n4. Resultado de detectTeamFromStyle:');
        const result = this.detectTeamFromStyle(style);
        console.log(`   Resultado: "${result}"`);
        
        return result;
    },
    
    debugGenderDetection: function(style) {
        console.log('=== DEBUG GENDER DETECTION ===');
        console.log('Input:', style);
        
        const styleStr = style.toString().toUpperCase().trim();
        
        // Verificar patrones
        console.log('\nPatrones encontrados:');
        
        // Gear for Sport pattern
        const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
        if (gearForSportMatch) {
            console.log(`   Gear for Sport pattern: ${gearForSportMatch[0]} -> ${gearForSportMatch[1]}`);
        }
        
        // Buscar en partes del estilo
        const parts = styleStr.split(/[-_ ]/);
        console.log(`   Partes del estilo: ${parts.join(', ')}`);
        
        // Verificar GENDER_MAP
        if (window.Config && window.Config.GENDER_MAP) {
            console.log('\nBuscando en GENDER_MAP:');
            for (const part of parts) {
                if (window.Config.GENDER_MAP[part]) {
                    console.log(`   ✓ "${part}" -> "${window.Config.GENDER_MAP[part]}"`);
                }
            }
        }
        
        // Ejecutar la función real
        console.log('\nResultado de extractGenderFromStyle:');
        const result = this.extractGenderFromStyle(style);
        console.log(`   Resultado: "${result}"`);
        
        return result;
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
