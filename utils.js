// utils.js - Versión corregida con el error de sintaxis arreglado
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
    
    // DETECCIÓN DE EQUIPO - VERSIÓN SIMPLIFICADA
    detectTeamFromStyle: function(style) {
        if (!style) return '';
        
        const styleStr = style.toString().toUpperCase().trim();
        console.log('🔍 Detectando equipo para estilo:', styleStr);
        
        // Buscar en mapa simple de equipos
        if (window.TeamMap) {
            for (const [code, teamName] of Object.entries(window.TeamMap)) {
                if (styleStr.includes(code)) {
                    console.log(`✓ Equipo encontrado: ${code} -> ${teamName}`);
                    return teamName;
                }
            }
        }
        
        return '';
    },
    
    // DETECCIÓN DE GÉNERO - VERSIÓN SIMPLIFICADA
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
                    return window.Config.GEARFORSPORT_GENDER_MAP[fullCode];
                }
                if (window.Config.GEARFORSPORT_GENDER_MAP[genderCode]) {
                    return window.Config.GEARFORSPORT_GENDER_MAP[genderCode];
                }
            }
        }
        
        // Buscar códigos de género en el estilo
        const parts = styleStr.split(/[-_ ]/);
        
        if (window.Config && window.Config.GENDER_MAP) {
            for (const part of parts) {
                if (window.Config.GENDER_MAP[part]) {
                    return window.Config.GENDER_MAP[part];
                }
            }
        }
        
        return '';
    },
    
    // OBTENER HEX DE COLOR - VERSIÓN SIMPLIFICADA
    getColorHex: function(colorName) {
        if (!colorName) return null;
        
        const name = colorName.toUpperCase().trim();
        console.log('🎨 Buscando color:', name);
        
        // 1. Buscar en base de datos de colores simplificada
        if (window.ColorDatabase && window.ColorDatabase.institutional) {
            for (const [key, data] of Object.entries(window.ColorDatabase.institutional)) {
                if (name === key || name.includes(key)) {
                    console.log('✓ Color encontrado:', key, '->', data.hex);
                    return data.hex;
                }
            }
        }
        
        // 2. Buscar código hex directo
        const hexMatch = name.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            const hex = `#${hexMatch[1]}`;
            console.log('✓ Código hex directo encontrado:', hex);
            return hex;
        }
        
        // 3. Fallback para colores básicos
        const basicColors = {
            'WHITE': '#FFFFFF',
            'BLACK': '#000000',
            'RED': '#FF0000',
            'BLUE': '#0000FF',
            'GREEN': '#00FF00',
            'YELLOW': '#FFFF00',
            'ORANGE': '#FFA500',
            'PURPLE': '#800080',
            'PINK': '#FFC0CB',
            'BROWN': '#A52A2A',
            'GRAY': '#808080',
            'GREY': '#808080',
            'SILVER': '#C0C0C0',
            'GOLD': '#FFD700',
            'BRONZE': '#CD7F32',
            'NAVY': '#001F3F',
            'MAROON': '#800000',
            'TEAL': '#008080',
            'LIME': '#00FF00',
            'INDIGO': '#4B0082',
            'VIOLET': '#EE82EE',
            'TURQUOISE': '#40E0D0',
            'MAGENTA': '#FF00FF',
            'CYAN': '#00FFFF'
        };
        
        if (basicColors[name]) {
            console.log('✓ Color básico encontrado:', name, '->', basicColors[name]);
            return basicColors[name];
        }
        
        console.log('❌ Color no encontrado:', name);
        return null;
    },
    
    // VERIFICAR SI ES COLOR METÁLICO
    isMetallicColor: function(colorName) {
        if (!colorName) return false;
        
        const upperColor = colorName.toUpperCase();
        
        // Códigos Pantone metálicos
        if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) {
            return true;
        }
        
        // Palabras clave metálicas
        const metallicCodes = [
            "METALLIC", "GOLD", "SILVER", "BRONZE", "COPPER",
            "METÁLICO", "METALIC"
        ];
        
        for (const metallicCode of metallicCodes) {
            if (upperColor.includes(metallicCode)) {
                return true;
            }
        }
        
        return false;
    },
    
    // OBTENER PRESET DE TINTA
    getInkPreset: function(inkType = 'WATER') {
        if (window.Config && window.Config.INK_PRESETS && window.Config.INK_PRESETS[inkType]) {
            return window.Config.INK_PRESETS[inkType];
        }
        
        // Valores por defecto
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
    } // ← CORREGIDO: Eliminado el corchete extra que causaba el error
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
