// utils/detectors.js - DETECTORES DE TEAM, GENDER Y ESPECIALIDADES
console.log('🎯 Cargando detectores avanzados...');

window.Detectors = {
    /**
     * Detecta el equipo a partir del estilo (compatible con tu estructura TeamsConfig)
     */
    detectTeamFromStyle: function(style) {
        console.log('🔍 Detectando equipo en:', style);
        
        if (!style || typeof style !== 'string') {
            console.warn('⚠️ Estilo vacío o inválido');
            return '';
        }
        
        const styleUpper = style.toUpperCase().trim();
        
        // 1. PRIMERO: Buscar en Gear for Sport MAP (config-app.js)
        if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
            for (const [code, teamName] of Object.entries(window.Config.GEARFORSPORT_TEAM_MAP)) {
                if (styleUpper.includes(code)) {
                    console.log(`✅ Equipo detectado por código GFS ${code}: ${teamName}`);
                    return teamName;
                }
            }
        }
        
        // 2. SEGUNDO: Buscar en TeamsConfig (estructura por ligas)
        if (window.TeamsConfig) {
            // Buscar en NCAA
            if (window.TeamsConfig.NCAA && window.TeamsConfig.NCAA.teams) {
                for (const [code, teamData] of Object.entries(window.TeamsConfig.NCAA.teams)) {
                    if (styleUpper.includes(code) || 
                        (teamData.name && styleUpper.includes(teamData.name.toUpperCase()))) {
                        console.log(`✅ Equipo NCAA detectado: ${teamData.name}`);
                        return teamData.name;
                    }
                }
            }
            
            // Buscar en NBA
            if (window.TeamsConfig.NBA && window.TeamsConfig.NBA.teams) {
                for (const [code, teamData] of Object.entries(window.TeamsConfig.NBA.teams)) {
                    if (styleUpper.includes(code) || 
                        (teamData.name && styleUpper.includes(teamData.name.toUpperCase()))) {
                        console.log(`✅ Equipo NBA detectado: ${teamData.name}`);
                        return teamData.name;
                    }
                }
            }
            
            // Buscar en NFL
            if (window.TeamsConfig.NFL && window.TeamsConfig.NFL.teams) {
                for (const [code, teamData] of Object.entries(window.TeamsConfig.NFL.teams)) {
                    if (styleUpper.includes(code) || 
                        (teamData.name && styleUpper.includes(teamData.name.toUpperCase()))) {
                        console.log(`✅ Equipo NFL detectado: ${teamData.name}`);
                        return teamData.name;
                    }
                }
            }
        }
        
        // 3. TERCERO: Búsqueda inteligente por palabras clave
        const teamKeywords = {
            'DODGERS': 'LOS ANGELES DODGERS',
            'LAKERS': 'LOS ANGELES LAKERS', 
            'YANKEES': 'NEW YORK YANKEES',
            'RED SOX': 'BOSTON RED SOX',
            'PATRIOTS': 'NEW ENGLAND PATRIOTS',
            'COWBOYS': 'DALLAS COWBOYS',
            'WARRIORS': 'GOLDEN STATE WARRIORS',
            'BULLS': 'CHICAGO BULLS',
            'HEAT': 'MIAMI HEAT',
            'PACKERS': 'GREEN BAY PACKERS',
            'ALABAMA': 'ALABAMA CRIMSON TIDE',
            'CRIMSON TIDE': 'ALABAMA CRIMSON TIDE',
            'MICHIGAN': 'MICHIGAN WOLVERINES',
            'WOLVERINES': 'MICHIGAN WOLVERINES',
            'DUKE': 'DUKE BLUE DEVILS',
            'TEXAS': 'TEXAS LONGHORNS',
            'LONGHORNS': 'TEXAS LONGHORNS'
        };
        
        for (const [keyword, teamName] of Object.entries(teamKeywords)) {
            if (styleUpper.includes(keyword)) {
                console.log(`✅ Equipo detectado por keyword "${keyword}": ${teamName}`);
                return teamName;
            }
        }
        
        console.log('❌ No se encontró equipo');
        return '';
    },
    
    /**
     * Extrae el género del texto del estilo
     */
    extractGenderFromStyle: function(style) {
        console.log('👤 Extrayendo género de:', style);
        
        if (!style || typeof style !== 'string') return '';
        
        const styleUpper = style.toUpperCase();
        
        // 1. PRIMERO: Buscar en Gear for Sport GENDER_MAP
        if (window.Config && window.Config.GEARFORSPORT_GENDER_MAP) {
            for (const [code, gender] of Object.entries(window.Config.GEARFORSPORT_GENDER_MAP)) {
                if (styleUpper.includes(code)) {
                    // Convertir a formato estándar (M, F, U, Y, B, G)
                    const standardCode = this.convertToStandardGenderCode(gender);
                    console.log(`✅ Género GFS detectado: ${standardCode} (${gender})`);
                    return standardCode;
                }
            }
        }
        
        // 2. SEGUNDO: Patrones de género estándar
        const genderPatterns = {
            'M': ['MENS', 'MEN\'S', 'HOMBRES', 'MAN', 'MEN', 'MALE', 'MASCULINO', 'BOYS', 'BOY'],
            'F': ['WOMENS', 'WOMEN\'S', 'LADIES', 'MUJERES', 'WOMAN', 'FEMALE', 'FEMENINO', 'GIRLS', 'GIRL'],
            'U': ['UNISEX', 'UNISEXO', 'BOTH', 'AMBOS', 'UNIVERSAL'],
            'Y': ['YOUTH', 'JUVENIL', 'JUNIOR'],
            'B': ['BOYS', 'NIÑOS', 'CHICOS', 'BOY'],
            'G': ['GIRLS', 'NIÑAS', 'CHICAS', 'GIRL']
        };
        
        for (const [genderCode, patterns] of Object.entries(genderPatterns)) {
            for (const pattern of patterns) {
                if (styleUpper.includes(pattern)) {
                    console.log(`✅ Género detectado por patrón "${pattern}": ${genderCode}`);
                    return genderCode;
                }
            }
        }
        
        // 3. TERCERO: Intentar deducir del equipo detectado
        const detectedTeam = this.detectTeamFromStyle(style);
        if (detectedTeam) {
            // Reglas por deporte (la mayoría son masculinos)
            if (detectedTeam.includes('NBA') || detectedTeam.includes('NFL') || 
                detectedTeam.includes('MLB') || detectedTeam.includes('NCAA')) {
                console.log('✅ Género deducido del deporte: M (masculino)');
                return 'M';
            }
        }
        
        console.log('❌ Género no detectado');
        return '';
    },
    
    /**
     * Convierte nombres de género a códigos estándar
     */
    convertToStandardGenderCode: function(genderName) {
        if (!genderName) return '';
        
        const map = {
            'MEN': 'M', 'MAN': 'M', 'MALE': 'M', 'HOMBRE': 'M', 'MASCULINO': 'M',
            'WOMEN': 'F', 'WOMAN': 'F', 'FEMALE': 'F', 'MUJER': 'F', 'FEMENINO': 'F',
            'UNISEX': 'U', 'UNISEXO': 'U', 'BOTH': 'U', 'AMBOS': 'U',
            'YOUTH': 'Y', 'JUVENIL': 'Y', 'JUNIOR': 'Y',
            'BOYS': 'B', 'BOY': 'B', 'NIÑOS': 'B', 'CHICOS': 'B',
            'GIRLS': 'G', 'GIRL': 'G', 'NIÑAS': 'G', 'CHICAS': 'G'
        };
        
        const upper = genderName.toUpperCase();
        for (const [key, code] of Object.entries(map)) {
            if (upper.includes(key)) {
                return code;
            }
        }
        
        return '';
    },
    
    /**
     * Detección automática al escribir en el campo "STYLE"
     */
    autoDetectFromStyleInput: function(inputElement) {
        if (!inputElement) return;
        
        const style = inputElement.value;
        
        // Detectar equipo
        const team = this.detectTeamFromStyle(style);
        if (team) {
            const nameTeamInput = document.getElementById('name-team');
            if (nameTeamInput && !nameTeamInput.value) {
                nameTeamInput.value = team;
                console.log(`🏈 Auto-detected team: ${team}`);
            }
        }
        
        // Detectar género
        const gender = this.extractGenderFromStyle(style);
        if (gender) {
            const genderInput = document.getElementById('gender');
            if (genderInput && !genderInput.value) {
                genderInput.value = gender;
                console.log(`👤 Auto-detected gender: ${gender}`);
            }
        }
    },
    
    /**
     * Función combinada para detección completa
     */
    detectAllFromStyle: function(style) {
        return {
            team: this.detectTeamFromStyle(style),
            gender: this.extractGenderFromStyle(style),
            style: style
        };
    }
};

console.log('✅ Detectores avanzados cargados correctamente');
