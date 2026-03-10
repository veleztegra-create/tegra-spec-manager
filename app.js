// =====================================================
// app.js - TEGRA TECHNICAL SPEC MANAGER
// Versión: 3.0 - Con secuencias optimizadas y corrección de FLASH/COOL
// 100% local - 0% dependencias externas de IA
// =====================================================

// =====================================================
// VARIABLES GLOBALES
// =====================================================
const stateManager = new StateManager();
// 'placements' is now linked to the Reactive Store to ensure single source of truth
Object.defineProperty(window, 'placements', {
    get: () => Store.state.placements,
    set: (val) => { Store.state.placements = val; }
});
let currentPlacementId = 1;
let clientLogoCache = {};
let isDarkMode = true;
let placementColorDndManager = null;

// =====================================================
// FUNCIONES AUXILIARES BÁSICAS
// =====================================================

function stringToHash(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function normalizeTextValue(value, fallback = '') {
    const normalized = String(value ?? '').trim();
    if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
        return fallback;
    }
    return normalized;
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateTimeEl = document.getElementById('current-datetime');
    if (dateTimeEl) {
        dateTimeEl.textContent = now.toLocaleDateString('es-ES', options);
    }
}

function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => {
        if (el) el.style.display = 'none';
    }, 4000);
}

function getInkPresetSafe(inkType = 'WATER') {
    const normalizedInkType = String(inkType || 'WATER').toUpperCase();
    const defaultPreset = {
        temp: '320 °F',
        time: normalizedInkType === 'PLASTISOL' ? '1:00 min' : '1:40 min',
        blocker: { name: 'BLOCKER CHT', mesh1: '122/55', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
        white: { name: 'AQUAFLEX V2 WHITE', mesh1: '198/40', mesh2: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: 'N/A' },
        color: { mesh: '157/48', durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', additives: '3 % cross-linker 500 · 1.5 % antitack' }
    };

    const basePresetRaw = (window.Utils && typeof window.Utils.getInkPreset === 'function')
        ? (window.Utils.getInkPreset(normalizedInkType) || {})
        : {};

    const basePreset = {
        ...defaultPreset,
        ...basePresetRaw,
        blocker: {
            ...defaultPreset.blocker,
            ...(basePresetRaw.blocker || {})
        },
        white: {
            ...defaultPreset.white,
            ...(basePresetRaw.white || basePresetRaw.whiteBase || {})
        },
        color: {
            ...defaultPreset.color,
            ...(basePresetRaw.color || {})
        }
    };

    const customerValue = (document.getElementById('customer')?.value || '').toUpperCase();

    if (normalizedInkType === 'PLASTISOL') {
        if (customerValue.includes('FANATICS') || customerValue.includes('FANATIC')) {
            return {
                ...basePreset,
                blocker: { ...basePreset.blocker, name: 'BARRIER CHT' },
                white: { ...basePreset.white, name: 'POLY WHITE' },
                temp: '320 °F',
                time: '1:00 min'
            };
        }
        return {
            ...basePreset,
            blocker: { ...basePreset.blocker, name: 'BARRIER BASE' },
            white: { ...basePreset.white, name: 'TXT POLY WHITE' },
            temp: '320 °F',
            time: '1:00 min'
        };
    }

    if (normalizedInkType === 'SILICONE') {
        return {
            ...basePreset,
            blocker: { ...basePreset.blocker, name: 'BLOCKER LIBRA' },
            white: { ...basePreset.white, name: 'BASE WHITE LIBRA' },
            temp: '320 °F',
            time: '1:40 min'
        };
    }

    return {
        ...basePreset,
        blocker: { ...basePreset.blocker, name: 'BLOCKER CHT' },
        white: { ...basePreset.white, name: 'AQUAFLEX V2 WHITE' },
        temp: '320 °F',
        time: '1:40 min'
    };
}

function bindSpecCreatorFormSafety() {
    const form = document.getElementById('spec-creator-form');
    if (!form || form.dataset.submitGuardBound === '1') return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });
    form.dataset.submitGuardBound = '1';
}

async function loadTabTemplates() {
    const templateSections = Array.from(document.querySelectorAll('[data-template]'));
    await Promise.all(templateSections.map(async (section) => {
        const templatePath = section.dataset.template;
        if (!templatePath) return;

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`No se pudo cargar el template: ${templatePath}`);
            }
            section.innerHTML = await response.text();
        } catch (error) {
            console.error('Error cargando template:', templatePath, error);
            section.innerHTML = '<div class="card"><div class="card-body"><p style="color:var(--text-secondary);">No se pudo cargar esta sección.</p></div></div>';
            if (window.errorHandler) {
                window.errorHandler.log('template_load', error);
            }
        }
    }));
}

// =====================================================
// FUNCIONES DE TEMA
// =====================================================

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');

    if (isDarkMode) {
        body.classList.remove('light-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        showStatus('🌙 Modo oscuro activado');
    } else {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        showStatus('☀️ Modo claro activado');
    }

    localStorage.setItem('tegraspec-theme', isDarkMode ? 'dark' : 'light');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('tegraspec-theme');
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'light') {
        isDarkMode = false;
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    } else {
        isDarkMode = true;
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
}

// =====================================================
// FUNCIONES DE NAVEGACIÓN
// =====================================================

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');

    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.innerText.toLowerCase().includes(tabName.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });

    // Llamar a funciones específicas solo si el elemento existe
    if (tabName === 'saved-specs' && document.getElementById('saved-specs-list')) {
        loadSavedSpecsList();
    }
    if (tabName === 'dashboard') updateDashboard();
    if (tabName === 'error-log' && document.getElementById('error-log-content')) {
        loadErrorLog();
    }
    if (tabName === 'spec-creator') {
        if (placements.length === 0 && document.getElementById('placements-container')) {
            initializePlacements();
        }
    }
}

// =====================================================
// FUNCIÓN SETUP PASTE HANDLER
// =====================================================

function setupPasteHandler() {
    document.addEventListener('paste', function (e) {
        const activePlacement = document.querySelector('.placement-section.active');
        if (!activePlacement) return;

        const target = e.target;
        const isEditableTarget = target && target.closest('input, textarea, [contenteditable]');
        const clipboardText = e.clipboardData?.getData('text/plain') || '';

        if (isEditableTarget || clipboardText.trim().length > 0) {
            return;
        }

        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();

                reader.onload = function (event) {
                    const placementId = activePlacement.dataset.placementId;
                    const placement = placements.find(p => p.id === parseInt(placementId));

                    if (placement) {
                        placement.imageData = event.target.result;

                        const img = document.getElementById(`placement-image-preview-${placementId}`);
                        const imageActions = document.getElementById(`placement-image-actions-${placementId}`);

                        if (img && imageActions) {
                            img.src = event.target.result;
                            img.style.display = 'block';
                            imageActions.style.display = 'flex';
                        }

                        showStatus(`✅ Imagen pegada en ${placement.type}`);
                    }
                };

                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    });
}

// =====================================================
// FUNCIONES DE DETECCIÓN
// =====================================================

function detectTeamFromStyle(style, colorway = '', customer = '') {
    if (!style) return '';

    try {
        const styleStr = style.toString().toUpperCase().trim();
        const customerStr = String(customer || '').toUpperCase();
        const isGearForSport = customerStr.includes('GEAR') || customerStr.includes('GFS');

        let gearStyleKey = styleStr;
        if (isGearForSport && colorway) {
            const colorwayPrefix = String(colorway)
                .toUpperCase()
                .replace(/^\s*#\s*/, '')
                .split(/[-\s]/)
                .map((part) => part.trim())
                .find(Boolean);
            if (colorwayPrefix) {
                gearStyleKey = `${styleStr}-${colorwayPrefix}`;
            }
        }

        if (isGearForSport && window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
            const map = window.Config.GEARFORSPORT_TEAM_MAP;
            if (map[gearStyleKey] && map[gearStyleKey] !== 'Generic Team') {
                return map[gearStyleKey];
            }
            if (map[styleStr] && map[styleStr] !== 'Generic Team') {
                return map[styleStr];
            }
        }

        if (isGearForSport && window.SchoolsConfig) {
            const schoolData = window.SchoolsConfig.detectSchoolFromStyle(gearStyleKey) || window.SchoolsConfig.detectSchoolFromStyle(styleStr);
            if (schoolData) return schoolData.teamName;
        }

        if (window.Config && window.Config.TEAM_CODE_MAP) {
            const teamMap = window.Config.TEAM_CODE_MAP;
            if (typeof teamMap === 'object') {
                const searchable = `${styleStr} ${gearStyleKey}`;
                for (const [code, teamName] of Object.entries(teamMap)) {
                    const normalizedCode = String(code || '').toUpperCase().trim();
                    if (!normalizedCode || normalizedCode.length < 2) continue;
                    const safeCode = normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const pattern = new RegExp(`(^|[^A-Z0-9])${safeCode}([^A-Z0-9]|$)`);
                    if (pattern.test(searchable)) {
                        return teamName;
                    }
                }
            }
        }

        if (window.TeamsConfig) {
            const leagues = ['NCAA', 'NBA', 'NFL'];
            for (const league of leagues) {
                if (window.TeamsConfig[league] && window.TeamsConfig[league].teams) {
                    for (const [code, teamData] of Object.entries(window.TeamsConfig[league].teams)) {
                        const normalizedCode = String(code || '').toUpperCase().trim();
                        if (!normalizedCode || normalizedCode.length < 2) continue;
                        const safeCode = normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const pattern = new RegExp(`(^|[^A-Z0-9])${safeCode}([^A-Z0-9]|$)`);
                        if (pattern.test(styleStr)) return teamData.name;
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Error en detectTeamFromStyle:', error);
    }

    return '';
}

function extractGenderFromStyle(style) {
    if (!style) return '';

    try {
        const styleStr = style.toString().toUpperCase().trim();

        if (window.SchoolsConfig && window.SchoolsConfig.extractGenderFromStyle) {
            const gender = window.SchoolsConfig.extractGenderFromStyle(styleStr);
            if (gender) return gender;
        }

        const gearForSportMatch = styleStr.match(/U([MWYBGKTIAN])\d+/);
        if (gearForSportMatch && gearForSportMatch[1]) {
            const genderCode = gearForSportMatch[1];

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

        const parts = styleStr.split(/[-_ ]/);

        if (window.Config && window.Config.GENDER_MAP) {
            for (const part of parts) {
                if (window.Config.GENDER_MAP[part]) {
                    return window.Config.GENDER_MAP[part];
                }
            }
        }

        if (styleStr.includes(' MEN') || styleStr.includes('_M') || styleStr.endsWith('M')) {
            return 'Men';
        }
        if (styleStr.includes(' WOMEN') || styleStr.includes('_W') || styleStr.endsWith('W')) {
            return 'Women';
        }
        if (styleStr.includes(' YOUTH') || styleStr.includes('_Y') || styleStr.endsWith('Y')) {
            return 'Youth';
        }
        if (styleStr.includes(' KIDS') || styleStr.includes('_K') || styleStr.endsWith('K')) {
            return 'Kids';
        }
        if (styleStr.includes(' UNISEX') || styleStr.includes('_U') || styleStr.endsWith('U')) {
            return 'Unisex';
        }

    } catch (error) {
        console.warn('Error en extractGenderFromStyle:', error);
    }

    return '';
}

// =====================================================
// FUNCIÓN ACTUALIZADA updateClientLogo
// =====================================================

function updateClientLogo() {
    const customer = document.getElementById('customer')?.value.toUpperCase().trim() || '';
    const logoElement = document.getElementById('logoCliente');
    if (!logoElement) return;

    let logoUrl = '';

    const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S'];
    const isGFS = gfsVariations.some(variation => customer.includes(variation));

    if (customer.includes('NIKE') || customer.includes('NIQUE')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
    } else if (customer.includes('FANATICS') || customer.includes('FANATIC')) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
    } else if (customer.includes('ADIDAS')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png';
    } else if (customer.includes('PUMA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png';
    } else if (customer.includes('UNDER ARMOUR') || customer.includes('UA')) {
        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png';
    } else if (isGFS) {
        logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png';
    }

    if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.style.display = 'block';
        clientLogoCache[customer] = logoUrl;
    } else {
        logoElement.style.display = 'none';
    }
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}


function applyCustomerInkDefaults() {
    const customerValue = (document.getElementById('customer')?.value || '').toUpperCase().trim();
    const isGFS = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S'].some(v => customerValue.includes(v));
    const targetInk = isGFS ? 'PLASTISOL' : null;
    if (!targetInk) return;

    placements.forEach((placement) => {
        if (placement.inkType !== targetInk) {
            placement.inkType = targetInk;
        }

        const select = document.querySelector(`.placement-ink-type[data-placement-id="${placement.id}"]`);
        if (select && select.value !== targetInk) {
            select.value = targetInk;
        }

        updatePlacementInkType(placement.id, targetInk);
    });
}

function handleGearForSportLogic() {
    const customerInput = document.getElementById('customer');
    const nameTeamInput = document.getElementById('name-team');
    if (!customerInput || !nameTeamInput) return;

    const customerValue = customerInput.value.toUpperCase().trim();
    const isGFS = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.'].some(v => customerValue.includes(v));

    if (!isGFS) return;

    applyCustomerInkDefaults();

    const styleInput = document.getElementById('style');
    const poInput = document.getElementById('po');
    const searchTerm = (styleInput?.value || '') || (poInput?.value || '');

    if (window.SchoolsConfig) {
        const schoolData = window.SchoolsConfig.detectSchoolFromStyle(searchTerm);
        if (schoolData) {
            nameTeamInput.value = schoolData.teamName;
            showStatus(`🏫 Escuela detectada: ${schoolData.teamName}`, 'success');
            return;
        }
    }

    if (window.Config && window.Config.GEARFORSPORT_TEAM_MAP) {
        const teamKey = Object.keys(window.Config.GEARFORSPORT_TEAM_MAP).find(key =>
            searchTerm.toUpperCase().includes(key)
        );
        if (teamKey) nameTeamInput.value = window.Config.GEARFORSPORT_TEAM_MAP[teamKey];
    }
}

// =====================================================
// FUNCIONES PARA MÚLTIPLES PLACEMENTS
// =====================================================

function initializePlacements() {
    const container = document.getElementById('placements-container');
    if (!container) {
        console.warn("initializePlacements: Contenedor 'placements-container' no encontrado.");
        return;
    }
    const firstPlacementId = addNewPlacement('FRONT', true);

    if (placements.length > 0) {
        renderPlacementHTML(placements[0]);
    }

    updatePlacementsTabs();
    showPlacement(firstPlacementId);
}

function addNewPlacement(type = null, isFirst = false) {
    const placementId = isFirst ? 1 : Date.now();
    const placementType = type || getNextPlacementType();

    const newPlacement = {
        id: placementId,
        type: placementType,
        name: `Placement ${getNextPlacementNumber()}`,
        imageData: null,
        colors: [], // Solo tintas reales (WHITE_BASE, BLOCKER, COLOR, METALLIC)
        sequence: [], // Secuencia completa (incluye FLASH/COOL)
        placementDetails: '#.#" FROM COLLAR SEAM',
        dimensions: 'SIZE: (W) ## X (H) ##',
        temp: '320 °F',
        time: '1:40 min',
        specialties: '',
        specialInstructions: '',
        inkType: 'WATER',
        placementSelect: 'FRONT',
        isActive: true,
        meshColor: '',
        meshWhite: '',
        meshBlocker: '',
        durometer: '',
        strokes: '',
        additives: '',
        width: '',
        height: '',
        baseSize: '',
        fabric: ''
    };

    if (!isFirst) {
        placements = [...placements, newPlacement];
    } else {
        placements = [newPlacement];
    }

    if (!isFirst) {
        renderPlacementHTML(newPlacement);
        showPlacement(placementId);
        updatePlacementsTabs();
    }

    return placementId;
}

function getNextPlacementType() {
    const usedTypes = placements.map(p => p.type);
    const allTypes = ['FRONT', 'BACK', 'SLEEVE', 'CHEST', 'TV. NUMBERS', 'SHOULDER', 'COLLAR', 'CUSTOM'];

    for (const type of allTypes) {
        if (!usedTypes.includes(type)) {
            return type;
        }
    }
    return 'CUSTOM';
}

function getNextPlacementNumber() {
    return placements.length + 1;
}

// getPlacementsForExcelExport movido a modules/export-excel.js

// =====================================================
// FUNCIÓN PARA GENERAR ID ÚNICO GFS (STYLE-COLORWAY)
// =====================================================

function generarGFSIdentifier() {
    const customer = document.getElementById('customer')?.value || '';
    const customerUpper = customer.toUpperCase();

    // Solo aplicar para GFS
    const isGFS = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.'].some(v => customerUpper.includes(v));

    if (!isGFS) return null;

    const style = document.getElementById('style')?.value || '';
    const colorway = document.getElementById('colorway')?.value || '';

    // Extraer código de colorway (ej: "W001" o "PMD5-Red" -> "PMD5")
    let colorCode = '';

    // Si tiene guión, tomar la primera parte
    if (colorway.includes('-')) {
        colorCode = colorway.split('-')[0].trim();
    } else {
        // Si no tiene guión, tomar el código completo si parece un código (letras y números)
        const match = colorway.match(/^([A-Z0-9]{3,5})/i);
        if (match) {
            colorCode = match[1].toUpperCase();
        } else {
            colorCode = colorway.toUpperCase();
        }
    }

    if (style && colorCode) {
        const identifier = `${style}-${colorCode}`.toUpperCase();
        console.log('🏷️ GFS Identifier generado:', identifier);
        return identifier;
    }

    return null;
}


function normalizeGearForSportStyleAndColorway(style, colorway, customer = '') {
    const customerUpper = String(customer || '').toUpperCase();
    const isGFS = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.'].some(v => customerUpper.includes(v));
    if (!isGFS) {
        return { style, colorway };
    }

    const styleBase = String(style || '').trim().toUpperCase();
    const colorwayRaw = String(colorway || '').trim().toUpperCase();
    if (!styleBase || !colorwayRaw) {
        return { style: styleBase || style, colorway: colorwayRaw || colorway };
    }

    const parts = colorwayRaw.split('-').map(p => p.trim()).filter(Boolean);
    const colorCode = parts[0] || '';
    const normalizedColorway = parts.length >= 2 ? `${colorCode}-${parts.slice(1).join('-')}` : colorwayRaw;

    let normalizedStyle = styleBase;
    if (colorCode && !styleBase.includes(`-${colorCode}`)) {
        normalizedStyle = `${styleBase}-${colorCode}`;
    }

    return {
        style: normalizedStyle,
        colorway: normalizedColorway
    };
}

// =====================================================
// CORRECCIÓN PARA ERROR HANDLER (si no existe)
// =====================================================

// Si errorHandler no está definido, créalo
if (typeof window.errorHandler === 'undefined') {
    window.errorHandler = {
        errors: [],
        log: function (context, error) {
            console.error(`[${context}]`, error);
            this.errors.push({ context, error, timestamp: new Date() });
        },
        getErrors: function () { return this.errors; },
        clearErrors: function () { this.errors = []; console.log("🧹 Errores limpiados"); }
    };
    console.log("✅ errorHandler creado");
}

// =====================================================
// ⭐ FUNCIÓN PRINCIPAL - GENERAR CON ASISTENTE (MEJORADA) ⭐
// =====================================================

window.generarConAsistente = async function (placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) {
        showStatus('❌ Placement no encontrado', 'error');
        return;
    }

    showStatus('🤖 Generando secuencia inteligente...', 'info');

    try {
        // =============================================
        // 1. OBTENER DATOS NECESARIOS
        // =============================================
        const customer = document.getElementById('customer')?.value || '';
        const garmentColor = document.getElementById('colorway')?.value || '';
        const inkType = placement.inkType || 'WATER';

        // Obtener SOLO los colores del diseño (los que el usuario agregó manualmente)
        const designColors = placement.colors.filter(c =>
            c.type === 'COLOR' || c.type === 'METALLIC'
        ).map(c => ({ id: c.id, val: c.val }));

        if (designColors.length === 0) {
            showStatus('⚠️ No hay colores de diseño para generar secuencia', 'warning');
            return;
        }

        console.log('📋 Procesando con RulesEngine:', { customer, garmentColor, inkType, designColors });

        // =============================================
        // 2. CONSULTAR AL MOTOR DE REGLAS
        // =============================================
        if (!window.RulesEngine) {
            throw new Error('Motor de reglas no disponible');
        }

        // Generar secuencia COMPLETA (incluye FLASH/COOL en la posición correcta)
        const secuenciaCompleta = window.RulesEngine.generarSecuencia({
            customer: customer,
            garmentColor: garmentColor,
            inkType: inkType,
            designColors: designColors
        });

        console.log('✅ Secuencia completa generada:', secuenciaCompleta);

        // =============================================
        // 3. SEPARAR: COLORES REALES vs SECUENCIA COMPLETA
        // =============================================

        // 3.1 COLORES REALES (para la UI de colores) - SOLO tintas
        const coloresReales = secuenciaCompleta.filter(paso =>
            paso.tipo === 'WHITE_BASE' ||
            paso.tipo === 'BLOCKER' ||
            paso.tipo === 'COLOR' ||
            paso.tipo === 'METALLIC'
        );

        // 3.2 SECUENCIA COMPLETA (para la tabla de estaciones)
        placement.sequence = secuenciaCompleta.map((paso, index) => ({
            id: Date.now() + Math.random() + index,
            type: paso.tipo,
            screenLetter: paso.screenLetter || '',
            val: paso.nombre || '---',
            mesh: paso.mesh || '',
            additives: paso.additives || ''
        }));

        // 3.3 ACTUALIZAR SOLO los colores reales en placement.colors
        placement.colors = coloresReales.map((paso, index) => ({
            id: Date.now() + Math.random() + index,
            type: paso.tipo,
            screenLetter: paso.screenLetter || '',
            val: paso.nombre || '---',
            mesh: paso.mesh || '',
            additives: paso.additives || ''
        }));

        // =============================================
        // 4. ACTUALIZAR CONDICIONES DE CURADO
        // =============================================
        const curing = window.RulesEngine.getCuringConditions
            ? window.RulesEngine.getCuringConditions(inkType, customer)
            : { temp: '320 °F', time: '1:40 min' };

        placement.temp = curing.temp;
        placement.time = curing.time;

        // Actualizar campos de temperatura en el HTML
        const tempField = document.getElementById(`temp-${placementId}`);
        const timeField = document.getElementById(`time-${placementId}`);
        if (tempField) tempField.value = placement.temp;
        if (timeField) timeField.value = placement.time;

        // =============================================
        // 5. ACTUALIZAR UI
        // =============================================
        renderPlacementColors(placementId);
        syncPlacementSequenceWithColors(placement);
        updatePlacementStations(placementId);
        updatePlacementColorsPreview(placementId);

        showStatus(`✅ Secuencia generada (${placement.sequence.length} pasos totales, ${placement.colors.length} colores)`, 'success');

    } catch (error) {
        console.error('❌ Error generando secuencia:', error);
        showStatus('❌ Error: ' + error.message, 'error');
        if (window.errorHandler) {
            window.errorHandler.log('generarConAsistente', error, { placementId });
        }
    }
};

// =====================================================
// FUNCIÓN PARA AUTCOMPLETADO DE PLACEMENTS
// =====================================================

function setupPlacementAutocomplete(inputElement, placementId) {
    if (!inputElement || !window.PlacementsDB) return;

    inputElement.addEventListener('input', function () {
        window.PlacementsDB.autocomplete(this, placementId);
    });

    inputElement.addEventListener('blur', function () {
        const suggestions = window.PlacementsDB.search(this.value);
        if (suggestions.length === 1 && suggestions[0].toUpperCase() === this.value.toUpperCase()) {
            this.value = suggestions[0];
            updateCustomPlacement(placementId, this.value);
        }
    });
}

// =====================================================
// RENDER PLACEMENT HTML
// =====================================================

function renderPlacementHTML(placement) {
    const container = document.getElementById('placements-container');
    if (!container) {
        console.warn("renderPlacementHTML: Contenedor 'placements-container' no encontrado.");
        return;
    }

    if (document.getElementById(`placement-section-${placement.id}`)) {
        return;
    }

    const sectionId = `placement-section-${placement.id}`;
    const isCustom = placement.type.includes('CUSTOM:');
    const displayType = isCustom ? 'CUSTOM' : placement.type;
    const customName = isCustom ? placement.type.replace('CUSTOM: ', '') : '';

    const preset = getInkPresetSafe(placement.inkType || 'WATER');

    const defaultMeshColor = preset.color.mesh || '157/48';
    const defaultMeshWhite = preset.white.mesh1 || '198/40';
    const defaultMeshBlocker = preset.blocker.mesh1 || '122/55';
    const defaultDurometer = preset.color.durometer || '70';
    const defaultStrokes = preset.color.strokes || '2';
    const defaultAngle = preset.color.angle || '15';
    const defaultPressure = preset.color.pressure || '40';
    const defaultSpeed = preset.color.speed || '35';
    const defaultAdditives = preset.color.additives || '3 % cross-linker 500 · 1.5 % antitack';

    const dimensions = extractDimensions(placement.dimensions);

    const safeTemp = normalizeTextValue(placement.temp, preset.temp || '320 °F');
    const safeTime = normalizeTextValue(placement.time, preset.time || '1:40 min');
    const safeSpecialInstructions = normalizeTextValue(placement.specialInstructions, '');

    const sectionHTML = `
        <div id="${sectionId}" class="placement-section" data-placement-id="${placement.id}">
            <div class="placement-header">
                <div class="placement-title">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${displayType}</span>
                </div>
                <div class="placement-actions">
                    <button class="btn btn-outline btn-sm" onclick="duplicatePlacement(${placement.id})">
                        <i class="fas fa-copy"></i> Duplicar
                    </button>
                    ${placements.length > 1 ? `
                    <button class="btn btn-danger btn-sm" onclick="removePlacement(${placement.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="placement-grid">
                <div class="placement-left-column">
                    <!-- Tipo de Placement -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE PLACEMENT:</label>
                        <select class="form-control placement-type-select" 
                                data-placement-id="${placement.id}"
                                onchange="updatePlacementType(${placement.id}, this.value)">
                            <option value="FRONT" ${placement.type === 'FRONT' || displayType === 'FRONT' ? 'selected' : ''}>FRONT (Frente)</option>
                            <option value="BACK" ${placement.type === 'BACK' || displayType === 'BACK' ? 'selected' : ''}>BACK (Espalda)</option>
                            <option value="SLEEVE" ${placement.type === 'SLEEVE' || displayType === 'SLEEVE' ? 'selected' : ''}>SLEEVE (Manga)</option>
                            <option value="CHEST" ${placement.type === 'CHEST' || displayType === 'CHEST' ? 'selected' : ''}>CHEST (Pecho)</option>
                            <option value="TV. NUMBERS" ${placement.type === 'TV. NUMBERS' || displayType === 'TV. NUMBERS' ? 'selected' : ''}>TV. NUMBERS (Números TV)</option>
                            <option value="SHOULDER" ${placement.type === 'SHOULDER' || displayType === 'SHOULDER' ? 'selected' : ''}>SHOULDER (Hombro)</option>
                            <option value="COLLAR" ${placement.type === 'COLLAR' || displayType === 'COLLAR' ? 'selected' : ''}>COLLAR (Cuello)</option>
                            <option value="CUSTOM" ${isCustom ? 'selected' : ''}>CUSTOM (Personalizado)</option>
                        </select>
                    </div>
                    
                    <!-- Input para custom placement con autocompletado mejorado -->
                    <div id="custom-placement-input-${placement.id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:10px;">
                        <label class="form-label">NOMBRE DEL PLACEMENT:</label>
                        <input type="text" 
                               class="form-control custom-placement-name"
                               data-placement-id="${placement.id}"
                               placeholder="Escribe el nombre del placement..."
                               value="${customName}"
                               oninput="updateCustomPlacement(${placement.id}, this.value)"
                               onfocus="setupPlacementAutocomplete(this, ${placement.id})"
                               list="placement-autocomplete-${placement.id}">
                        <small style="color: var(--text-secondary); display: block; margin-top: 4px;">
                            <i class="fas fa-info-circle"></i> 
                            Escribe 'F' para Front, 'B' para Back, 'S' para Sleeve, etc.
                        </small>
                    </div>
                    
                    <!-- Imagen de Referencia -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-image"></i> Imagen para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="file-upload-area" onclick="openImagePickerForPlacement(${placement.id})">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir una imagen para este placement</p>
                                <p style="font-size:0.8rem; color:var(--text-secondary);">Ctrl+V para pegar</p>
                            </div>
                            <div class="image-preview-container">
                                <img id="placement-image-preview-${placement.id}" 
                                     class="image-preview placement-image" 
                                     alt="Vista previa"
                                     style="display: none;">
                                <div class="image-actions" id="placement-image-actions-${placement.id}" style="display:none;">
                                    <button class="btn btn-danger btn-sm" onclick="removePlacementImage(${placement.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condiciones de Impresión -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-print"></i> Condiciones para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">DETALLES DE UBICACIÓN:</label>
                                    <input type="text" 
                                           id="placement-details-${placement.id}"
                                           class="form-control placement-details"
                                           value="${placement.placementDetails}"
                                           oninput="updatePlacementField(${placement.id}, 'placementDetails', this.value)">
                                </div>
                                
                                <!-- Dimensiones separadas -->
                                <div class="form-group">
                                    <label class="form-label">DIMENSIONES:</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="text" 
                                               id="dimension-w-${placement.id}"
                                               class="form-control placement-dimension-w"
                                               placeholder="Ancho"
                                               value="${placement.width || dimensions.width.replace('"', '')}"
                                               oninput="handleDimensionInput(${placement.id}, 'width', this)"
                                               onpaste="handleDimensionPaste(event, ${placement.id}, 'width')"
                                               style="width: 100px;">
                                        <span style="color: var(--text-secondary);">X</span>
                                        <input type="text" 
                                               id="dimension-h-${placement.id}"
                                               class="form-control placement-dimension-h"
                                               placeholder="Alto"
                                               value="${placement.height || dimensions.height.replace('"', '')}"
                                               oninput="handleDimensionInput(${placement.id}, 'height', this)"
                                               onpaste="handleDimensionPaste(event, ${placement.id}, 'height')"
                                               style="width: 100px;">
                                        <span style="color: var(--text-secondary);">&nbsp;</span>
                                    </div>
                                </div>
                                
                                <!-- Campos de temperatura y tiempo -->
                                <div class="form-group">
                                    <label class="form-label">TEMPERATURA:</label>
                                    <input type="text" 
                                           id="temp-${placement.id}"
                                           class="form-control placement-temp"
                                           value="${safeTemp}"
                                           readonly
                                           title="Determinado por el tipo de tinta seleccionado">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">TIEMPO:</label>
                                    <input type="text" 
                                           id="time-${placement.id}"
                                           class="form-control placement-time"
                                           value="${safeTime}"
                                           readonly
                                           title="Determinado por el tipo de tinta seleccionado">
                                </div>
                                
                                <!-- CAMPO SPECIALTIES -->
                                <div class="form-group">
                                    <label class="form-label">SPECIALTIES:</label>
                                    <input type="text" 
                                           id="specialties-${placement.id}"
                                           class="form-control placement-specialties"
                                           placeholder="Detectado automáticamente..."
                                           value="${placement.specialties || ''}"
                                           readonly
                                           title="Detectado automáticamente de los colores">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parámetros de Impresión Editables -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-sliders-h"></i> Parámetros de Impresión
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-grid">
                                <!-- Durómetro -->
                                <div class="form-group">
                                    <label class="form-label">DURÓMETRO:</label>
                                    <input type="text" 
                                           id="durometer-${placement.id}"
                                           class="form-control placement-durometer"
                                           value="${placement.durometer || defaultDurometer}"
                                           oninput="updatePlacementParam(${placement.id}, 'durometer', this.value)"
                                           title="Durometer (dureza de la racleta)">
                                </div>
                                
                                <!-- STROKES -->
                                <div class="form-group">
                                    <label class="form-label">STROKES:</label>
                                    <input type="text" 
                                           id="strokes-${placement.id}"
                                           class="form-control placement-strokes"
                                           value="${placement.strokes || defaultStrokes}"
                                           oninput="updatePlacementParam(${placement.id}, 'strokes', this.value)"
                                           title="Número de strokes">
                                </div>
                                
                                <!-- ANGLE -->
                                <div class="form-group">
                                    <label class="form-label">ANGLE:</label>
                                    <input type="text" 
                                           id="angle-${placement.id}"
                                           class="form-control placement-angle"
                                           value="${placement.angle || defaultAngle}"
                                           oninput="updatePlacementParam(${placement.id}, 'angle', this.value)"
                                           title="Ángulo de la racleta">
                                </div>
                                
                                <!-- PRESSURE -->
                                <div class="form-group">
                                    <label class="form-label">PRESSURE:</label>
                                    <input type="text" 
                                           id="pressure-${placement.id}"
                                           class="form-control placement-pressure"
                                           value="${placement.pressure || defaultPressure}"
                                           oninput="updatePlacementParam(${placement.id}, 'pressure', this.value)"
                                           title="Presión de impresión">
                                </div>
                                
                                <!-- SPEED -->
                                <div class="form-group">
                                    <label class="form-label">SPEED:</label>
                                    <input type="text" 
                                           id="speed-${placement.id}"
                                           class="form-control placement-speed"
                                           value="${placement.speed || defaultSpeed}"
                                           oninput="updatePlacementParam(${placement.id}, 'speed', this.value)"
                                           title="Velocidad de impresión">
                                </div>
                                
                                <!-- Aditivos -->
                                <div class="form-group">
                                    <label class="form-label">ADITIVOS:</label>
                                    <input type="text" 
                                           id="additives-${placement.id}"
                                           class="form-control placement-additives"
                                           value="${placement.additives || defaultAdditives}"
                                           oninput="updatePlacementParam(${placement.id}, 'additives', this.value)"
                                           title="Aditivos para la tinta">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="placement-right-column">
                    <!-- Tipo de Tinta -->
                    <div class="form-group">
                        <label class="form-label">TIPO DE TINTA:</label>
                        <select class="form-control placement-ink-type"
                                data-placement-id="${placement.id}"
                                onchange="updatePlacementInkType(${placement.id}, this.value)">
                            <option value="WATER" ${placement.inkType === 'WATER' ? 'selected' : ''}>Water-base</option>
                            <option value="PLASTISOL" ${placement.inkType === 'PLASTISOL' ? 'selected' : ''}>Plastisol</option>
                            <option value="SILICONE" ${placement.inkType === 'SILICONE' ? 'selected' : ''}>Silicone</option>
                        </select>
                    </div>
                    
                    <!-- Colores y Tintas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" style="font-size: 1rem;">
                                <i class="fas fa-palette"></i> Colores para ${displayType}
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
                                <button type="button" class="btn btn-danger btn-sm" onclick="addPlacementColorItem(${placement.id}, 'BLOCKER')">
                                    <i class="fas fa-plus"></i> Blocker
                                </button>
                                <button type="button" class="btn btn-white-base btn-sm" onclick="addPlacementColorItem(${placement.id}, 'WHITE_BASE')">
                                    <i class="fas fa-plus"></i> White Base
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" onclick="addPlacementColorItem(${placement.id}, 'COLOR')">
                                    <i class="fas fa-plus"></i> Color
                                </button>
                                <button type="button" class="btn btn-warning btn-sm" onclick="addPlacementColorItem(${placement.id}, 'METALLIC')">
                                    <i class="fas fa-star"></i> Metálico
                                </button>
                            </div>
                            <div id="placement-colors-container-${placement.id}" class="color-sequence"></div>
                        </div>
                    </div>

                    <div class="no-print" style="margin: 10px 0 14px 0;">
                        <button class="btn btn-primary btn-sm" onclick="generarConAsistente(${placement.id})">
                            <i class="fas fa-magic"></i> Generar Secuencia
                        </button>
                    </div>
                    
                    <!-- Instrucciones Especiales -->
                    <div class="form-group">
                        <label class="form-label">INSTRUCCIONES ESPECIALES:</label>
                        <textarea id="special-instructions-${placement.id}"
                                  class="form-control placement-special-instructions"
                                  rows="3"
                                  placeholder="Instrucciones especiales para este placement..."
                                  oninput="updatePlacementField(${placement.id}, 'specialInstructions', this.value)">${safeSpecialInstructions}</textarea>
                    </div>
                    
                    <!-- Vista previa de colores -->
                    <div id="placement-colors-preview-${placement.id}" class="color-legend"></div>
                    
                    <!-- Secuencia de Estaciones -->
                    <h4 style="margin:15px 0 10px; font-size:0.9rem; color:var(--primary);">
                        <i class="fas fa-list-ol"></i> Secuencia de ${displayType}
                    </h4>
                    <div id="placement-sequence-table-${placement.id}"></div>
                </div>
            </div>
        </div>
    `;

    placement.temp = safeTemp;
    placement.time = safeTime;
    placement.specialInstructions = safeSpecialInstructions;

    container.innerHTML += sectionHTML;

    renderPlacementColors(placement.id);

    // Usar la secuencia guardada si existe, o generar una nueva
    if (placement.sequence && placement.sequence.length > 0) {
        updatePlacementStations(placement.id);
    }

    updatePlacementColorsPreview(placement.id);

    if (placement.imageData) {
        const img = document.getElementById(`placement-image-preview-${placement.id}`);
        const imageActions = document.getElementById(`placement-image-actions-${placement.id}`);

        if (img && imageActions) {
            img.src = placement.imageData;
            img.style.display = 'block';
            imageActions.style.display = 'flex';
        }
    }
}

function updatePlacementsTabs() {
    const tabsContainer = document.getElementById('placements-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    placements.forEach(placement => {
        const displayType = placement.type.includes('CUSTOM:')
            ? placement.type.replace('CUSTOM: ', '')
            : placement.type;

        const tab = document.createElement('div');
        tab.className = `placement-tab ${placement.id === currentPlacementId ? 'active' : ''}`;
        tab.setAttribute('data-placement-id', placement.id);
        tab.innerHTML = `
            <i class="fas fa-${getPlacementIcon(placement.type)}"></i>
            ${displayType.substring(0, 15)}${displayType.length > 15 ? '...' : ''}
            ${placements.length > 1 ? `<span class="remove-tab" onclick="removePlacement(${placement.id})">&times;</span>` : ''}
        `;

        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-tab')) {
                showPlacement(placement.id);
            }
        });
        tabsContainer.appendChild(tab);
    });
}

function showPlacement(placementId) {
    document.querySelectorAll('.placement-section').forEach(section => {
        section.classList.remove('active');
    });

    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) {
        section.classList.add('active');
    }

    document.querySelectorAll('.placement-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.placementId) === placementId);
    });

    currentPlacementId = placementId;
}

function getPlacementIcon(type) {
    const icons = {
        'FRONT': 'tshirt',
        'BACK': 'tshirt',
        'SLEEVE': 'hat-cowboy',
        'CHEST': 'heart',
        'TV. NUMBERS': 'hashtag',
        'SHOULDER': 'user',
        'COLLAR': 'circle',
        'CUSTOM': 'star'
    };

    if (type.includes('CUSTOM:')) {
        return 'star';
    }
    return icons[type] || 'map-marker-alt';
}

// =====================================================
// FUNCIONES DE GESTIÓN DE PLACEMENTS
// =====================================================

function updatePlacementType(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        const customInput = document.getElementById(`custom-placement-input-${placementId}`);

        if (type === 'CUSTOM') {
            if (customInput) customInput.style.display = 'block';
            if (!placement.type.startsWith('CUSTOM:')) {
                placement.type = 'CUSTOM:';
            }
        } else {
            if (customInput) customInput.style.display = 'none';
            placement.type = type;
            placement.name = type;
        }

        updateAllPlacementTitles(placementId);
        showStatus(`✅ Tipo de placement cambiado a ${type}`);
    }
}

function updateCustomPlacement(placementId, customName) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    let finalName = customName.trim();

    if (finalName.length <= 3 && window.PlacementsDB) {
        const expanded = window.PlacementsDB.ABBREVIATIONS[finalName.toUpperCase()];
        if (expanded) {
            finalName = expanded;
            const input = document.querySelector(`.custom-placement-name[data-placement-id="${placementId}"]`);
            if (input) input.value = finalName;
        }
    }

    if (finalName) {
        placement.type = `CUSTOM: ${finalName}`;
        placement.name = finalName;

        updateAllPlacementTitles(placementId);
        showStatus(`✅ Placement personalizado: "${finalName}" creado`);
    }
}

function updateAllPlacementTitles(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const displayType = placement.type.includes('CUSTOM:')
        ? placement.type.replace('CUSTOM: ', '')
        : placement.type;

    const section = document.getElementById(`placement-section-${placementId}`);
    if (!section) return;

    const mainTitle = section.querySelector('.placement-title span');
    if (mainTitle) {
        mainTitle.textContent = displayType;
    }

    const cardHeaders = section.querySelectorAll('.card-header');
    cardHeaders.forEach(header => {
        const titleElement = header.querySelector('.card-title');
        if (!titleElement) return;

        const titleText = titleElement.textContent;

        if (titleText.includes('Colores para')) {
            titleElement.innerHTML = `<i class="fas fa-palette"></i> Colores para ${displayType}`;
        }
        else if (titleText.includes('Imagen para')) {
            titleElement.innerHTML = `<i class="fas fa-image"></i> Imagen para ${displayType}`;
        }
        else if (titleText.includes('Condiciones para')) {
            titleElement.innerHTML = `<i class="fas fa-print"></i> Condiciones para ${displayType}`;
        }
    });

    const sequenceTitle = section.querySelector('h4');
    if (sequenceTitle && sequenceTitle.textContent.includes('Secuencia de')) {
        sequenceTitle.innerHTML = `<i class="fas fa-list-ol"></i> Secuencia de ${displayType}`;
    }

    updatePlacementsTabs();
}

function updatePlacementInkType(placementId, inkType) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    placement.inkType = inkType;

    const preset = getInkPresetSafe(inkType);

    placement.temp = preset.temp;
    placement.time = preset.time;

    const tempField = document.getElementById(`temp-${placementId}`);
    const timeField = document.getElementById(`time-${placementId}`);

    if (tempField) {
        tempField.value = preset.temp;
        tempField.setAttribute('readonly', true);
        tempField.title = `Temperatura para tinta ${inkType}`;
    }

    if (timeField) {
        timeField.value = preset.time;
        timeField.setAttribute('readonly', true);
        timeField.title = `Tiempo de curado para tinta ${inkType}`;
    }

    updateDefaultParameters(placementId, inkType);
    updatePlacementStations(placementId);
    showStatus(`✅ Tinta: ${inkType} - Temp: ${preset.temp}, Tiempo: ${preset.time}`);
}

function updateDefaultParameters(placementId, inkType) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const preset = getInkPresetSafe(inkType);

    if (!placement.meshColor) {
        const meshColorField = document.getElementById(`mesh-color-${placementId}`);
        if (meshColorField) meshColorField.value = preset.color.mesh;
    }

    if (!placement.meshWhite) {
        const meshWhiteField = document.getElementById(`mesh-white-${placementId}`);
        if (meshWhiteField) meshWhiteField.value = preset.white.mesh1;
    }

    if (!placement.meshBlocker) {
        const meshBlockerField = document.getElementById(`mesh-blocker-${placementId}`);
        if (meshBlockerField) meshBlockerField.value = preset.blocker.mesh1;
    }

    if (!placement.durometer) {
        const durometerField = document.getElementById(`durometer-${placementId}`);
        if (durometerField) durometerField.value = preset.color.durometer;
    }

    if (!placement.strokes) {
        const strokesField = document.getElementById(`strokes-${placementId}`);
        if (strokesField) strokesField.value = preset.color.strokes;
    }

    if (!placement.angle) {
        const angleField = document.getElementById(`angle-${placementId}`);
        if (angleField) angleField.value = preset.color.angle;
    }

    if (!placement.pressure) {
        const pressureField = document.getElementById(`pressure-${placementId}`);
        if (pressureField) pressureField.value = preset.color.pressure;
    }

    if (!placement.speed) {
        const speedField = document.getElementById(`speed-${placementId}`);
        if (speedField) speedField.value = preset.color.speed;
    }

    if (!placement.additives) {
        const additivesField = document.getElementById(`additives-${placementId}`);
        if (additivesField) additivesField.value = preset.color.additives;
    }
}

function duplicatePlacement(placementId) {
    const original = placements.find(p => p.id === placementId);
    if (!original) return;

    const newId = Date.now();
    const displayType = original.type.includes('CUSTOM:')
        ? original.type.replace('CUSTOM: ', '')
        : original.type;

    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = newId;
    duplicate.name = displayType;

    if (!duplicate.specialties) duplicate.specialties = '';

    placements = [...placements, duplicate];

    renderPlacementHTML(duplicate);
    updatePlacementsTabs();
    showPlacement(newId);

    setTimeout(() => {
        updateAllPlacementTitles(newId);
    }, 100);

    showStatus('✅ Placement duplicado correctamente');
    return newId;
}

function removePlacement(placementId) {
    if (placements.length <= 1) {
        showStatus('⚠️ No puedes eliminar el único placement', 'warning');
        return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar este placement?`)) {
        return;
    }

    const index = placements.findIndex(p => p.id === placementId);
    if (index === -1) return;

    const removedType = placements[index].type;

    // Use immutable filter instead of splice
    placements = placements.filter((_, i) => i !== index);

    const section = document.getElementById(`placement-section-${placementId}`);
    if (section) {
        section.remove();
    }

    updatePlacementsTabs();

    if (currentPlacementId === placementId && placements.length > 0) {
        showPlacement(placements[0].id);
    }

    showStatus(`🗑️ Placement "${removedType}" eliminado`, 'success');
}

// =====================================================
// FUNCIONES PARA PARÁMETROS EDITABLES
// =====================================================

function updatePlacementParam(placementId, param, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        placement[param] = value;
        updatePlacementStations(placementId);
        showStatus(`✅ ${param} actualizado`);
    }
}

// =====================================================
// FUNCIONES PARA DIMENSIONES
// =====================================================

function extractDimensions(dimensionsText) {
    if (!dimensionsText) return { width: '15.34', height: '12' };

    const patterns = [
        /SIZE:\s*\(W\)\s*([\d\.]+)\s*["']?\s*X\s*\(H\)\s*([\d\.]+)/i,
        /([\d\.]+)\s*["']?\s*[xX×]\s*([\d\.]+)/,
        /W\s*:\s*([\d\.]+).*H\s*:\s*([\d\.]+)/i,
        /ANCHO\s*:\s*([\d\.]+).*ALTO\s*:\s*([\d\.]+)/i,
        /(\d+)\s*["']?\s*[xX]\s*(\d+)/
    ];

    for (const pattern of patterns) {
        const match = dimensionsText.match(pattern);
        if (match) {
            return {
                width: match[1],
                height: match[2]
            };
        }
    }

    return { width: '15.34', height: '12' };
}

function parseDimensionValue(rawValue) {
    const raw = String(rawValue || '').trim();
    if (!raw) return null;

    const normalized = raw.replace(',', '.').toLowerCase();
    const numberMatch = normalized.match(/\d+(?:\.\d+)?/);
    if (!numberMatch) return null;

    const numericText = Number(parseFloat(numberMatch[0]).toFixed(2)).toString();
    const isCentimeters = /(^|[^a-z])cm([^a-z]|$)|cent[ií]metros?/.test(normalized);
    const isInches = /(^|[^a-z])in([^a-z]|$)|inch|pulgad/.test(normalized) || /["″”]/.test(raw);
    const unit = isCentimeters ? 'cm' : (isInches ? 'in' : '');

    return {
        displayValue: `${numericText}${unit}`,
        unit
    };
}

function parseDimensionPair(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return null;

    const normalized = text
        .replace(/″|”|“/g, '"')
        .replace(/×/g, 'x')
        .replace(',', '.')
        .replace(/\s+/g, ' ')
        .trim();

    const parts = normalized.split(/\s*[xX]\s*/);
    if (parts.length < 2) return null;

    const widthParsed = parseDimensionValue(parts[0]);
    const heightParsed = parseDimensionValue(parts[1]);
    if (!widthParsed || !heightParsed) return null;

    return {
        width: widthParsed.displayValue,
        height: heightParsed.displayValue,
        detectedUnit: widthParsed.unit || heightParsed.unit || ''
    };
}

function applyDimensionPair(placementId, width, height, detectedUnit = '') {
    const wField = document.getElementById(`dimension-w-${placementId}`);
    const hField = document.getElementById(`dimension-h-${placementId}`);

    if (wField) wField.value = width;
    if (hField) hField.value = height;

    updatePlacementDimension(placementId, 'width', width);
    updatePlacementDimension(placementId, 'height', height);

    const unitLabel = detectedUnit ? `${detectedUnit} detectado` : 'sin unidad explícita';
    showStatus(`✅ Medidas pegadas automáticamente (${unitLabel})`);
}

function handleDimensionPaste(event, placementId, type) {
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const pair = parseDimensionPair(pastedText);

    if (pair) {
        event.preventDefault();
        applyDimensionPair(placementId, pair.width, pair.height, pair.detectedUnit);
        return;
    }

    const parsedSingle = parseDimensionValue(pastedText);
    if (parsedSingle) {
        event.preventDefault();
        const targetField = event.target;
        targetField.value = parsedSingle.displayValue;
        updatePlacementDimension(placementId, type, parsedSingle.displayValue);

        if (type === 'width') {
            const hField = document.getElementById(`dimension-h-${placementId}`);
            if (hField) hField.focus();
        }
    }
}

function handleDimensionInput(placementId, type, inputElement) {
    const value = inputElement.value;
    if (type === 'width' && /[xX]/.test(value)) {
        const pair = parseDimensionPair(value);
        if (pair) {
            applyDimensionPair(placementId, pair.width, pair.height, pair.detectedUnit);
            const hField = document.getElementById(`dimension-h-${placementId}`);
            if (hField) hField.focus();
            return;
        }

        const [widthCandidate, heightCandidate] = value.split(/[xX]/).map(part => part.trim());
        if (widthCandidate) {
            const parsedWidth = parseDimensionValue(widthCandidate);
            inputElement.value = parsedWidth ? parsedWidth.displayValue : widthCandidate;
            updatePlacementDimension(placementId, 'width', inputElement.value);
        }

        const hField = document.getElementById(`dimension-h-${placementId}`);
        if (hField && heightCandidate) {
            const parsedHeight = parseDimensionValue(heightCandidate);
            hField.value = parsedHeight ? parsedHeight.displayValue : heightCandidate;
            updatePlacementDimension(placementId, 'height', hField.value);
        }

        if (hField) hField.focus();
        return;
    }

    updatePlacementDimension(placementId, type, value);
}

function updatePlacementDimension(placementId, type, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        const wField = document.getElementById(`dimension-w-${placementId}`);
        const hField = document.getElementById(`dimension-h-${placementId}`);

        const width = type === 'width' ? value : (wField ? wField.value : '');
        const height = type === 'height' ? value : (hField ? hField.value : '');

        placement.width = width;
        placement.height = height;

        placement.dimensions = `SIZE: (W) ${width || '##'} X (H) ${height || '##'}`;
    }
}

// =====================================================
// FUNCIONES PARA COLORES DE PLACEMENTS
// =====================================================

function syncPlacementSequenceWithColors(placement, force = false) {
    if (!placement) return;

    const currentSequence = Array.isArray(placement.sequence) ? placement.sequence : [];
    const baseItems = currentSequence.filter(item => item.type !== 'FLASH' && item.type !== 'COOL');
    const hadProcessSteps = currentSequence.some(item => item.type === 'FLASH' || item.type === 'COOL');

    const shouldResync = force || !currentSequence.length || baseItems.length !== placement.colors.length;
    if (!shouldResync) return;

    const existingById = new Map(baseItems.map(item => [String(item.id), item]));

    const rebuiltBase = (placement.colors || []).map((color, index) => {
        const existing = existingById.get(String(color.id)) || {};
        return {
            id: color.id || existing.id || Date.now() + Math.random() + index,
            type: color.type || existing.type || 'COLOR',
            screenLetter: color.screenLetter || existing.screenLetter || '',
            val: color.val || existing.val || '---',
            mesh: color.mesh || existing.mesh || '',
            additives: color.additives || existing.additives || ''
        };
    });

    if (!hadProcessSteps) {
        placement.sequence = rebuiltBase;
        return;
    }

    const withProcess = [];
    rebuiltBase.forEach((item, index) => {
        withProcess.push(item);
        if (index < rebuiltBase.length - 1) {
            withProcess.push({ type: 'FLASH', screenLetter: '', val: 'FLASH', mesh: '-', additives: '' });
            withProcess.push({ type: 'COOL', screenLetter: '', val: 'COOL', mesh: '-', additives: '' });
        }
    });

    placement.sequence = withProcess;
}

function addPlacementColorItem(placementId, type) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    let initialLetter = '';
    let initialVal = '';
    const preset = getInkPresetSafe(placement.inkType || 'WATER');

    if (type === 'BLOCKER') {
        initialLetter = 'A';
        if (placement.inkType === 'PLASTISOL') {
            initialVal = 'BARRIER BASE';
        } else if (placement.inkType === 'SILICONE') {
            initialVal = 'BLOCKER LIBRA';
        } else {
            initialVal = preset.blocker?.name || 'BLOCKER CHT';
        }
    } else if (type === 'WHITE_BASE') {
        initialLetter = 'B';
        initialVal = preset.white?.name || 'AQUAFLEX V2 WHITE';
    } else if (type === 'METALLIC') {
        const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
        initialLetter = String(colorItems.length + 1);
        initialVal = 'METALLIC GOLD';
    } else {
        const colorItems = placement.colors.filter(c => c.type === 'COLOR' || c.type === 'METALLIC');
        initialLetter = String(colorItems.length + 1);
    }

    const colorId = Date.now() + Math.random();
    placement.colors.push({
        id: colorId,
        type: type,
        screenLetter: initialLetter,
        val: initialVal,
        mesh: null,
        additives: null
    });

    syncPlacementSequenceWithColors(placement, true);
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);

    checkForSpecialtiesInColors(placementId);
}

function renderPlacementColors(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const container = document.getElementById(`placement-colors-container-${placementId}`);
    if (!container) return;

    if (placement.colors.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-palette" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                <p>No hay colores agregados para este placement.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    placement.colors.forEach(color => {
        let badgeClass = 'badge-color';
        let label = 'COLOR';

        if (color.type === 'BLOCKER') {
            badgeClass = 'badge-blocker';
            label = 'BLOQUEADOR';
        } else if (color.type === 'WHITE_BASE') {
            badgeClass = 'badge-white';
            label = 'WHITE BASE';
        } else if (color.type === 'METALLIC') {
            badgeClass = 'badge-warning';
            label = 'METÁLICO';
        }

        const div = document.createElement('div');
        div.className = 'color-item';
        div.draggable = true;
        div.dataset.colorId = String(color.id);
        div.dataset.placementId = String(placementId);
        div.innerHTML = `
            <button type="button" class="drag-handle" title="Arrastra para reordenar" aria-label="Arrastra para reordenar">
                <i class="fas fa-grip-vertical"></i>
            </button>
            <span class="badge ${badgeClass}">${label}</span>
            <input type="text" 
                   style="width: 60px; text-align: center; font-weight: bold;" 
                   value="${color.screenLetter}" 
                   class="form-control placement-screen-letter"
                   data-color-id="${color.id}"
                   data-placement-id="${placementId}"
                   oninput="updatePlacementScreenLetter(${placementId}, ${color.id}, this.value)"
                   ondblclick="this.select()"
                   title="Letra/Número de Pantalla">
            <input type="text" 
                   class="form-control placement-ink-input"
                   data-color-id="${color.id}"
                   data-placement-id="${placementId}"
                   placeholder="Nombre de la tinta..." 
                   value="${color.val}"
                   oninput="updatePlacementColorValue(${placementId}, ${color.id}, this.value)"
                   ondblclick="this.select()">
            <input type="text"
                   style="width: 82px; text-align:center;"
                   class="form-control placement-mesh-line"
                   value="${color.mesh || ''}"
                   placeholder="Malla"
                   title="Malla por tinta"
                   oninput="updatePlacementColorMesh(${placementId}, ${color.id}, this.value)"
                   ondblclick="this.select()">
            <div class="color-preview" 
                 id="placement-color-preview-${placementId}-${color.id}" 
                 title="Vista previa del color"></div>
            <button type="button" class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${placementId}, ${color.id}, -1)" title="Subir en secuencia">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="movePlacementColorItem(${placementId}, ${color.id}, 1)" title="Bajar en secuencia">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button type="button" class="btn btn-danger btn-sm" onclick="removePlacementColorItem(${placementId}, ${color.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        if (!placementColorDndManager && window.PlacementColorDnD?.createPlacementColorDndManager) {
            placementColorDndManager = window.PlacementColorDnD.createPlacementColorDndManager({
                getPlacementById: (id) => placements.find(p => p.id === id),
                syncPlacementSequenceWithColors,
                renderPlacementColors,
                updatePlacementStations,
                updatePlacementColorsPreview,
                checkForSpecialtiesInColors,
                showStatus
            });
        }

        if (placementColorDndManager) {
            placementColorDndManager.bindColorItem(div);
        }

        container.appendChild(div);

        setTimeout(() => updatePlacementColorPreview(placementId, color.id), 10);
    });
}

function movePlacementColorByIndex(placementId, fromIndex, toIndex) {
    if (placementColorDndManager) {
        placementColorDndManager.moveByIndex(placementId, fromIndex, toIndex);
        return;
    }

    const placement = placements.find(p => p.id === placementId);
    if (!placement || !Array.isArray(placement.colors)) return;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= placement.colors.length || toIndex >= placement.colors.length) return;

    const [moved] = placement.colors.splice(fromIndex, 1);
    placement.colors.splice(toIndex, 0, moved);

    syncPlacementSequenceWithColors(placement, true);
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);
    checkForSpecialtiesInColors(placementId);
}

function updatePlacementColorValue(placementId, colorId, value) {

    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
        color.val = value;
        updatePlacementColorPreview(placementId, colorId);
        syncPlacementSequenceWithColors(placement, true);
        updatePlacementStations(placementId);
        updatePlacementColorsPreview(placementId);

        checkForSpecialtiesInColors(placementId);
    }
}

function updatePlacementScreenLetter(placementId, colorId, value) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const color = placement.colors.find(c => c.id === colorId);
    if (color) {
        color.screenLetter = value.toUpperCase();
        syncPlacementSequenceWithColors(placement, true);
        updatePlacementStations(placementId);
    }
}

function updatePlacementColorMesh(placementId, colorId, value) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const color = placement.colors.find(c => c.id === colorId);
    if (!color) return;

    color.mesh = value;
    syncPlacementSequenceWithColors(placement, true);
    updatePlacementStations(placementId);
}

function removePlacementColorItem(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    placement.colors = placement.colors.filter(c => c.id !== colorId);
    syncPlacementSequenceWithColors(placement, true);
    renderPlacementColors(placementId);
    updatePlacementStations(placementId);
    updatePlacementColorsPreview(placementId);

    checkForSpecialtiesInColors(placementId);
}

function movePlacementColorItem(placementId, colorId, direction) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement || !Array.isArray(placement.colors)) return;

    const currentIndex = placement.colors.findIndex(c => c.id === colorId);
    if (currentIndex < 0) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= placement.colors.length) return;

    movePlacementColorByIndex(placementId, currentIndex, targetIndex);
    showStatus('↕️ Secuencia de colores actualizada');
}

function updatePlacementColorPreview(placementId, colorId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const color = placement.colors.find(c => c.id === colorId);
    if (!color) return;

    const preview = document.getElementById(`placement-color-preview-${placementId}-${colorId}`);
    if (!preview) return;

    const colorName = (color.val || '').toUpperCase().trim();
    let colorHex = null;

    if (window.ColorConfig && window.ColorConfig.findColorHex) {
        colorHex = window.ColorConfig.findColorHex(color.val);
    }

    if (!colorHex && window.Utils && window.Utils.getColorHex) {
        colorHex = window.Utils.getColorHex(color.val);
    }

    if (!colorHex && window.TeamsConfig) {
        const leagues = ['NCAA', 'NBA', 'NFL'];

        for (const league of leagues) {
            if (window.TeamsConfig[league] && window.TeamsConfig[league].colors) {
                const colorCategories = ['institutional', 'metallic', 'alt', 'uni'];

                for (const category of colorCategories) {
                    const categoryColors = window.TeamsConfig[league].colors[category];
                    if (categoryColors) {
                        for (const [key, data] of Object.entries(categoryColors)) {
                            const keyUpper = key.toUpperCase().replace(/_/g, ' ');
                            if (colorName === keyUpper ||
                                colorName.includes(keyUpper) ||
                                keyUpper.includes(colorName)) {
                                if (data && data.hex) {
                                    colorHex = data.hex;
                                    break;
                                }
                            }
                        }
                    }
                    if (colorHex) break;
                }
            }
            if (colorHex) break;
        }
    }

    if (!colorHex && window.Config && window.Config.COLOR_DATABASES) {
        const databases = ['PANTONE', 'GEARFORSPORT', 'INSTITUCIONAL'];

        for (const dbName of databases) {
            const db = window.Config.COLOR_DATABASES[dbName];
            if (db) {
                for (const [key, data] of Object.entries(db)) {
                    if (colorName === key.toUpperCase() ||
                        colorName.includes(key.toUpperCase()) ||
                        key.toUpperCase().includes(colorName)) {
                        if (data && data.hex) {
                            colorHex = data.hex;
                            break;
                        }
                    }
                }
            }
            if (colorHex) break;
        }
    }

    if (!colorHex) {
        const basicColors = {
            'RED': '#FF0000',
            'BLUE': '#0000FF',
            'GREEN': '#00FF00',
            'BLACK': '#000000',
            'WHITE': '#FFFFFF',
            'YELLOW': '#FFFF00',
            'PURPLE': '#800080',
            'ORANGE': '#FFA500',
            'GRAY': '#808080',
            'GREY': '#808080',
            'GOLD': '#FFD700',
            'SILVER': '#C0C0C0',
            'NAVY': '#000080',
            'MAROON': '#800000',
            'PINK': '#FFC0CB',
            'BROWN': '#A52A2A',
            'TEAL': '#008080',
            'CYAN': '#00FFFF',
            'MAGENTA': '#FF00FF',
            'LIME': '#00FF00',
            'OLIVE': '#808000'
        };

        if (basicColors[colorName]) {
            colorHex = basicColors[colorName];
        } else {
            for (const [basicName, hex] of Object.entries(basicColors)) {
                if (colorName.includes(basicName)) {
                    colorHex = hex;
                    break;
                }
            }
        }
    }

    if (!colorHex) {
        const hexMatch = colorName.match(/#([0-9A-F]{6})/i);
        if (hexMatch) {
            colorHex = `#${hexMatch[1]}`;
        }
    }

    if (colorHex) {
        preview.style.background = colorHex;
        preview.style.backgroundImage = 'none';
        preview.title = `${color.val} - ${colorHex}`;
    } else {
        preview.style.background = '#CCCCCC';
        preview.style.backgroundImage = 'repeating-linear-gradient(45deg, #999 0, #999 2px, #CCC 2px, #CCC 4px)';
        preview.title = `${color.val} - No encontrado`;
    }
}

// =====================================================
// DETECCIÓN DE ESPECIALIDADES
// =====================================================

function checkForSpecialtiesInColors(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    let specialties = [];

    placement.colors.forEach(color => {
        if (color.val) {
            const colorVal = (color.val || '').toUpperCase();

            if (colorVal.includes('HD') || colorVal.includes('HIGH DENSITY')) {
                if (!specialties.includes('HIGH DENSITY')) {
                    specialties.push('HIGH DENSITY');
                }
            }

            if (isMetallicColor(colorVal)) {
                if (!specialties.includes('METALLIC')) {
                    specialties.push('METALLIC');
                }
            }

            if (colorVal.includes('FOIL')) {
                if (!specialties.includes('FOIL')) {
                    specialties.push('FOIL');
                }
            }
        }
    });

    const specialtiesField = document.getElementById(`specialties-${placementId}`);
    if (specialtiesField) {
        specialtiesField.value = specialties.join(', ');
        updatePlacementField(placementId, 'specialties', specialtiesField.value);
    }

    return specialties;
}

function isMetallicColor(colorName) {
    if (!colorName) return false;

    const upperColor = String(colorName).toUpperCase();
    const pantoneMatch = upperColor.match(/\b(\d{3,4})\s*C?\b/);
    if (!pantoneMatch) return false;

    const pantone = parseInt(pantoneMatch[1], 10);
    if (!Number.isFinite(pantone)) return false;

    // Solo rangos metálicos oficiales: 871C-877C y 8001C-8965C
    return (pantone >= 871 && pantone <= 877) || (pantone >= 8001 && pantone <= 8965);
}

function getColorHex(colorName) {
    if (!colorName) return null;

    if (window.ColorConfig && window.ColorConfig.findColorHex) {
        const resolved = window.ColorConfig.findColorHex(colorName);
        if (resolved) return resolved;
    }

    if (window.Utils && window.Utils.getColorHex) {
        return window.Utils.getColorHex(colorName);
    }

    const hexMatch = String(colorName).match(/#([0-9A-F]{6})/i);
    return hexMatch ? `#${hexMatch[1]}` : null;
}

function updatePlacementColorsPreview(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const container = document.getElementById(`placement-colors-preview-${placementId}`);
    if (!container) return;

    const uniqueColors = [];
    const seenColors = new Set();

    placement.colors.forEach(color => {
        if (color.type === 'COLOR' || color.type === 'METALLIC') {
            const colorVal = (color.val || '').toUpperCase().replace(/\s*\(\d+\)\s*$/, '').trim();
            if (colorVal && !seenColors.has(colorVal)) {
                seenColors.add(colorVal);
                uniqueColors.push({
                    val: colorVal,
                    screenLetter: color.screenLetter
                });
            }
        }
    });

    if (uniqueColors.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '<div><strong>Leyenda de Colores:</strong></div><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">';

    uniqueColors.forEach(color => {
        const colorHex = getColorHex(color.val) || '#cccccc';
        html += `
            <div class="color-legend-item" style="display: flex; align-items: center; margin-bottom: 5px;">
                <div class="color-legend-swatch" style="background-color: ${colorHex}; border: 1px solid #666; width: 15px; height: 15px; margin-right: 5px;"></div>
                <span style="font-size: 11px;">${color.screenLetter}: ${color.val}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// =====================================================
// FUNCIÓN CORREGIDA: updatePlacementStations
// =====================================================

function updatePlacementStations(placementId, returnOnly = false) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return [];

    // ✅ USAR LA SECUENCIA COMPLETA si existe
    const sequence = placement.sequence || [];

    if (sequence.length === 0) {
        if (!returnOnly) {
            const div = document.getElementById(`placement-sequence-table-${placementId}`);
            if (div) div.innerHTML = '<p style="color:var(--text-secondary); font-style:italic; text-align:center; padding:15px; background:var(--gray-dark); border-radius:var(--radius);">Genera una secuencia para ver la tabla de impresión.</p>';
        }
        return [];
    }

    const preset = getInkPresetSafe(placement.inkType || 'WATER');
    const stationsData = [];
    let stNum = 1;

    // Recorrer la secuencia completa (YA incluye FLASH/COOL en la posición correcta)
    for (let idx = 0; idx < sequence.length; idx++) {
        const item = sequence[idx];

        // =========================================
        // CASO 1: Es FLASH o COOL (ya están en la secuencia)
        // =========================================
        if (item.type === 'FLASH' || item.type === 'COOL') {
            stationsData.push({
                st: stNum++,
                screenLetter: '',
                screenCombined: item.type,
                mesh: '-',
                ink: '-',
                strokes: '-',
                duro: '-',
                angle: '-',
                pressure: '-',
                speed: '-',
                add: item.additives || ''
            });
            continue; // ← IMPORTANTE: No añadir FLASH/COOL adicional
        }

        // =========================================
        // CASO 2: Es BLOCKER
        // =========================================
        let mesh, strokesVal, duro, ang, press, spd, add;

        if (item.type === 'BLOCKER') {
            mesh = item.mesh || placement.meshBlocker || preset.blocker.mesh1;
            add = item.additives || placement.additives || preset.blocker.additives;
        }
        // =========================================
        // CASO 3: Es WHITE_BASE
        // =========================================
        else if (item.type === 'WHITE_BASE') {
            mesh = item.mesh || placement.meshWhite || preset.white.mesh1;
            add = item.additives || placement.additives || preset.white.additives;
        }
        // =========================================
        // CASO 4: Es METALLIC
        // =========================================
        else if (item.type === 'METALLIC') {
            mesh = item.mesh || '122/55';
            strokesVal = '1';
            duro = '70';
            ang = '15';
            press = '40';
            spd = '35';
            add = item.additives || '3% cross linker 500 · 3% Binder Flex';
        }
        // =========================================
        // CASO 5: Es COLOR
        // =========================================
        else {
            mesh = item.mesh || placement.meshColor || preset.color.mesh;
            add = item.additives || placement.additives || preset.color.additives;
        }

        stationsData.push({
            st: stNum++,
            screenLetter: item.screenLetter || '',
            screenCombined: item.val || '---',
            mesh: mesh,
            ink: item.val || '---',
            strokes: placement.strokes || preset.color.strokes,
            duro: placement.durometer || preset.color.durometer,
            angle: placement.angle || preset.color.angle,
            pressure: placement.pressure || preset.color.pressure,
            speed: placement.speed || preset.color.speed,
            add: add
        });
    }

    if (returnOnly) return stationsData;

    renderPlacementStationsTable(placementId, stationsData);
}

function renderPlacementStationsTable(placementId, data) {
    const div = document.getElementById(`placement-sequence-table-${placementId}`);
    if (!div) return;

    if (data.length === 0) {
        div.innerHTML = '<p style="color:var(--text-secondary); font-style:italic; text-align:center; padding:15px; background:var(--gray-dark); border-radius:var(--radius);">Agrega colores para generar la secuencia de impresión.</p>';
        return;
    }

    let html = `<table class="sequence-table">
        <thead><tr>
            <th>Est</th>
            <th>Screen Letter</th>
            <th>Screen (Tinta/Proceso)</th>
            <th>Aditivos</th>
            <th>Malla</th>
            <th>Strokes</th>
            <th>Angle</th>
            <th>Pressure</th>
            <th>Speed</th>
            <th>Duro</th>
        </tr></thead><tbody>`;

    data.forEach((row, idx) => {
        const isMetallic = row.screenCombined && (
            row.screenCombined.includes('METALLIC') ||
            row.screenCombined.includes('GOLD') ||
            row.screenCombined.includes('SILVER') ||
            row.screenCombined.match(/(8[7-9][0-9])\s*C?/i)
        );

        html += `<tr ${isMetallic ? 'style="background: linear-gradient(90deg, rgba(255,215,0,0.1) 0%, var(--bg-card) 100%);"' : ''}>
            <td><strong>${row.st}</strong></td>
            <td><b style="color: var(--primary);">${row.screenLetter}</b></td>
            <td>${row.screenCombined}</td>
            <td style="font-size:11px; color:var(--primary); font-weight:600;">${row.add}</td>
            <td>${row.mesh}</td>
            <td>${row.strokes}</td>
            <td>${row.angle}</td>
            <td>${row.pressure}</td>
            <td>${row.speed}</td>
            <td>${row.duro}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
}

// =====================================================
// FUNCIONES DE IMÁGENES
// =====================================================

function openImagePickerForPlacement(placementId) {
    currentPlacementId = placementId;
    document.getElementById('placementImageInput')?.click();
}

document.addEventListener('DOMContentLoaded', function () {
    const placementImageInput = document.getElementById('placementImageInput');
    if (placementImageInput) {
        placementImageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const placementId = currentPlacementId;
            const placement = placements.find(p => p.id === placementId);
            if (!placement) return;

            if (!file.type.match('image.*')) {
                showStatus('❌ Por favor, selecciona un archivo de imagen válido', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (ev) {
                const img = document.getElementById(`placement-image-preview-${placementId}`);
                const imageActions = document.getElementById(`placement-image-actions-${placementId}`);

                if (img) {
                    img.src = ev.target.result;
                    img.style.display = 'block';
                }

                if (imageActions) {
                    imageActions.style.display = 'flex';
                }

                placement.imageData = ev.target.result;
                showStatus(`✅ Imagen cargada para ${placement.type}`);
            };
            reader.readAsDataURL(file);

            e.target.value = '';
        });
    }
});

function removePlacementImage(placementId) {
    const placement = placements.find(p => p.id === placementId);
    if (!placement) return;

    const img = document.getElementById(`placement-image-preview-${placementId}`);
    const imageActions = document.getElementById(`placement-image-actions-${placementId}`);

    if (img) {
        img.src = '';
        img.style.display = 'none';
    }

    if (imageActions) {
        imageActions.style.display = 'none';
    }

    placement.imageData = null;
    showStatus('🗑️ Imagen eliminada del placement');
}

// =====================================================
// FUNCIONES DE ACTUALIZACIÓN
// =====================================================

function updatePlacementField(placementId, field, value) {
    const placement = placements.find(p => p.id === placementId);
    if (placement) {
        if (field === 'specialties') {
            let specialties = value.toUpperCase();

            if (specialties.includes('HD') && !specialties.includes('HIGH DENSITY')) {
                specialties = specialties.replace(/\bHD\b/g, 'HIGH DENSITY');
            }

            placement[field] = specialties;

            const specialtiesField = document.getElementById(`specialties-${placementId}`);
            if (specialtiesField && specialtiesField.value !== specialties) {
                specialtiesField.value = specialties;
            }
        } else {
            placement[field] = value;
        }
    }
}


// =====================================================
// FUNCIÓN PARA PROCESAR DATOS EXCEL (VERSIÓN CON LOGS Y SOPORTE PARA WORKBOOK)
// =====================================================

function processExcelData(worksheet, sheetName = '', workbook = null) {
    console.log('📁 processExcelData INICIANDO con hoja:', sheetName);
    console.log('📊 worksheet:', worksheet);
    console.log('📚 workbook recibido:', workbook ? 'SÍ' : 'NO');
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    console.log('📊 data raw:', data);
    
    const extracted = {};

    const normalizedSheetName = String(sheetName || '').toUpperCase();
    const isSWOSheet = normalizedSheetName.includes('SWO') || normalizedSheetName.includes('PPS') || normalizedSheetName.includes('PROTO');
    console.log('🔍 isSWOSheet:', isSWOSheet);

    // --- 1. EXTRACCIÓN DE DATOS BÁSICOS ---
    const assignByLabel = (labelRaw, valueRaw) => {
        const label = String(labelRaw || '').trim().toUpperCase();
        const value = String(valueRaw || '').trim();
        if (!label || !value) return;

        if (label.includes('CUSTOMER')) extracted.customer = value;
        else if (label.includes('STYLE')) extracted.style = value;
        else if (label.includes('COLORWAY')) extracted.colorway = value;
        else if (label.includes('SEASON')) extracted.season = value;
        else if (label.includes('PATTERN')) extracted.pattern = value;
        else if (label.includes('P.O.') || label.includes('PO')) extracted.po = value;
        else if (label.includes('SAMPLE TYPE') || label.includes('SAMPLE')) extracted.sample = value;
        else if (label.includes('TEAM')) extracted.team = value;
        else if (label.includes('GENDER')) extracted.gender = value;
    };

    if (isSWOSheet) {
        console.log('🔍 Buscando en formato SWO flexible...');
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            for (let j = 0; j < row.length - 1; j++) {
                assignByLabel(row[j], row[j + 1]);
            }
        }
    }

    if (Object.keys(extracted).length === 0 || !isSWOSheet) {
        console.log('🔍 Buscando en formato genérico...');
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;

            for (let j = 0; j < row.length; j++) {
                assignByLabel(row[j], row[j + 1]);
            }
        }
    }

    console.log('📦 Datos extraídos:', extracted);

    // --- 2. ASIGNAR VALORES A LOS INPUTS ---
    if (extracted.customer) {
        setInputValue('customer', extracted.customer);
        console.log('✅ customer asignado:', extracted.customer);
    }
    if (extracted.style) {
        setInputValue('style', extracted.style);
        console.log('✅ style asignado:', extracted.style);
    }
    if (extracted.colorway) {
        setInputValue('colorway', extracted.colorway);
        console.log('✅ colorway asignado:', extracted.colorway);
    }
    if (extracted.season) setInputValue('season', extracted.season);
    if (extracted.pattern) setInputValue('pattern', extracted.pattern);
    if (extracted.po) setInputValue('po', extracted.po);
    if (extracted.sample) setInputValue('sample-type', extracted.sample);
    if (extracted.team) setInputValue('name-team', extracted.team);
    if (extracted.gender) setInputValue('gender', extracted.gender);

    // --- 3. EJECUTAR AUTOMATIZACIÓN DE PLACEMENTS ---
    if (window.ExcelAutomation) {
        console.log('🤖 Ejecutando ExcelAutomation.processExcelWithAutomation...');
        try {
            // PASAR EL WORKBOOK A EXCELAUTOMATION
            const result = window.ExcelAutomation.processExcelWithAutomation(worksheet, sheetName, workbook);
            console.log('🤖 Resultado de ExcelAutomation:', result);
            
            if (result.autoPlacements && result.autoPlacements.length > 0) {
                console.log(`📦 Se detectaron ${result.autoPlacements.length} placements automáticos`);
                window.ExcelAutomation.autoCreatePlacements(result.autoPlacements);
            } else {
                console.log('📭 No se detectaron placements automáticos');
            }
        } catch (error) {
            console.error('❌ Error en ExcelAutomation:', error);
        }
    } else {
        console.warn('⚠️ ExcelAutomation no disponible');
    }

    // --- 4. ACTUALIZAR LOGOS Y OTRAS FUNCIONES ---
    updateClientLogo();
    applyCustomerInkDefaults();
    handleGearForSportLogic();

    // --- 5. CAMBIAR A LA PESTAÑA DE CREACIÓN ---
    setTimeout(() => {
        showTab('spec-creator');
    }, 500);

    showStatus(`✅ "${sheetName || 'hoja'}" procesado`, 'success');
}

function setupExcelImportHandler() {
    const excelInput = document.getElementById('excelFile');
    if (!excelInput || excelInput.dataset.bound === '1') return;

    excelInput.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const fileName = String(file.name || '');
            const normalizedFileName = fileName.toLowerCase();

            if (normalizedFileName.endsWith('.zip')) {
                await loadProjectZip(file);
                return;
            }

            if (normalizedFileName.endsWith('.json')) {
                showStatus(`📥 Cargando JSON: ${fileName}...`, 'info');
                const jsonText = await file.text();
                const parsedData = JSON.parse(jsonText);
                loadSpecData(parsedData);
                showTab('spec-creator');
                showStatus(`✅ Archivo JSON "${fileName}" cargado correctamente`, 'success');
                return;
            }

            showStatus(`📥 Cargando archivo Excel: ${file.name}...`, 'info');
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });

            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('El archivo no contiene hojas para procesar');
            }

            const preferredSheetName = workbook.SheetNames.find((name) => {
                const normalizedName = String(name || '').toUpperCase();
                return normalizedName.includes('SWO') || normalizedName.includes('PPS') || normalizedName.includes('PROTO');
            }) || workbook.SheetNames[0];

            const worksheet = workbook.Sheets[preferredSheetName];
            if (!worksheet) {
                throw new Error(`No se encontró la hoja "${preferredSheetName}"`);
            }

            // PASAR EL WORKBOOK A processExcelData
            processExcelData(worksheet, preferredSheetName, workbook);
        } catch (error) {
            console.error('❌ Error procesando archivo importado:', error);
            showStatus(`❌ Error al cargar archivo: ${error.message || error}`, 'error');
            if (window.errorHandler) {
                window.errorHandler.log('excel_import', error, { fileName: file.name });
            }
        } finally {
            event.target.value = '';
        }
    });

    excelInput.dataset.bound = '1';
}
// =====================================================
// FUNCIONES DE DASHBOARD
// =====================================================

function updateDashboard() {
    try {
        const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
        const total = specs.length;
        const totalEl = document.getElementById('total-specs');
        if (totalEl) totalEl.textContent = total;

        let lastSpec = null;
        let lastSpecDate = null;
        let lastSpecKey = null;

        specs.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const specDate = new Date(data.savedAt || 0);

                if (!lastSpecDate || specDate > lastSpecDate) {
                    lastSpecDate = specDate;
                    lastSpec = data;
                    lastSpecKey = key;
                }
            } catch (e) {
                console.warn('Error al parsear spec:', key, e);
            }
        });

        const todaySpecsEl = document.getElementById('today-specs');
        if (lastSpec && todaySpecsEl) {
            const safeStyle = (lastSpec.style || 'Sin nombre').replace(/"/g, '&quot;');
            todaySpecsEl.innerHTML = `
                <div style="font-size:0.9rem; color:var(--text-secondary);">Última Spec:</div>
                <button type="button" onclick="loadSpec(decodeURIComponent('${encodeURIComponent(lastSpecKey)}'))" title="Abrir para seguir editando"
                    style="font-size:1.05rem; font-weight:bold; color:var(--primary); background:none; border:none; padding:0; cursor:pointer; text-decoration:underline; text-align:left;">
                    ${safeStyle}
                </button>
                <div style="font-size:0.8rem; color:var(--text-secondary);">${lastSpecDate.toLocaleDateString('es-ES')}</div>
            `;
        } else if (todaySpecsEl) {
            todaySpecsEl.innerHTML = `
                <div style="font-size:0.9rem; color:var(--text-secondary);">Sin specs creadas</div>
            `;
        }

        let activeCount = 0;
        specs.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.placements && data.placements.length > 0) {
                    activeCount++;
                }
            } catch (e) { }
        });
        const activeProjectsEl = document.getElementById('active-projects');
        if (activeProjectsEl) activeProjectsEl.textContent = activeCount;

        const totalPlacements = specs.reduce((total, key) => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                return total + (data.placements?.length || 0);
            } catch (e) {
                return total;
            }
        }, 0);

        const completionRateEl = document.getElementById('completion-rate');
        if (completionRateEl) {
            completionRateEl.innerHTML = `
                <div style="font-size:0.9rem; color:var(--text-secondary);">Placements totales:</div>
                <div style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${totalPlacements}</div>
            `;
        }

    } catch (error) {
        console.error('Error en updateDashboard:', error);
    }
}

// =====================================================
// FUNCIONES DE STORAGE
// =====================================================

function loadSavedSpecsList() {
    const list = document.getElementById('saved-specs-list');
    if (!list) return;
    const searchInput = document.getElementById('saved-specs-search');
    const query = (searchInput?.value || '').toUpperCase().trim();
    const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));

    if (specs.length === 0) {
        list.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No hay specs guardadas. Crea una nueva spec para verla aquí.
            </p>
        `;
        return;
    }

    list.innerHTML = '';
    let visibleCount = 0;

    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));

            const searchableText = [
                key,
                data.style || '',
                data.customer || '',
                data.po || '',
                data.colorway || ''
            ].join(' ').toUpperCase();

            if (query && !searchableText.includes(query)) {
                return;
            }

            visibleCount += 1;
            const div = document.createElement('div');
            div.style.cssText = "padding:15px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center; transition: var(--transition);";
            div.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | Colorway: ${data.colorway || 'N/A'} | PO: ${data.po || 'N/A'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Guardado: ${new Date(data.savedAt).toLocaleDateString('es-ES')}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data).replace(/'/g, "\\'")})'><i class="fas fa-edit"></i> Cargar</button>
                    <button class="btn btn-outline btn-sm" onclick="downloadSingleSpec('${key}')"><i class="fas fa-download"></i> JSON</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSpec('${key}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
        } catch (e) {
            console.error('Error al parsear spec guardada:', key, e);
            localStorage.removeItem(key);
        }
    });

    if (visibleCount === 0) {
        list.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                <i class="fas fa-search" style="margin-right: 6px;"></i>
                No se encontraron specs para <strong>${query}</strong>
            </p>
        `;
    }
}

function loadSpec(storageKey) {
    try {
        if (!storageKey) return;
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            showStatus('⚠️ No se encontró la spec seleccionada', 'warning');
            return;
        }
        const data = JSON.parse(raw);
        loadSpecData(data);
        showTab('spec-creator');
        showStatus('✅ Spec cargada para edición', 'success');
    } catch (error) {
        console.error('Error al cargar spec:', error);
        showStatus('❌ Error al cargar spec', 'error');
    }
}

function loadSpecData(data) {
    setInputValue('customer', data.customer || '');
    setInputValue('style', data.style || '');
    setInputValue('folder-num', data.folder || '');
    setInputValue('colorway', data.colorway || '');
    setInputValue('season', data.season || '');
    setInputValue('pattern', data.pattern || '');
    setInputValue('po', data.po || '');
    setInputValue('sample-type', data.sampleType || '');
    setInputValue('name-team', data.nameTeam || '');
    setInputValue('gender', data.gender || '');
    setInputValue('designer', data.designer || '');
    setInputValue('base-size', data.baseSize || '');
    setInputValue('fabric', data.fabric || '');
    setInputValue('technician-name', data.technicianName || '');
    setInputValue('technical-comments', data.technicalComments || '');

    const placementsContainer = document.getElementById('placements-container');
    if (placementsContainer) placementsContainer.innerHTML = '';
    placements = [];

    if (data.placements && Array.isArray(data.placements)) {
        data.placements.forEach((placementData, index) => {
            const placementId = index === 0 ? 1 : Date.now() + index;
            const placement = {
                ...placementData,
                id: placementId
            };

            // ✅ Restaurar colores y secuencia
            placement.colors = placementData.colors || [];
            placement.sequence = placementData.sequence || [];

            if (index === 0) {
                placements = [placement];
            } else {
                placements = [...placements, placement];
            }

            renderPlacementHTML(placement);

            if (placement.imageData) {
                const img = document.getElementById(`placement-image-preview-${placementId}`);
                const imageActions = document.getElementById(`placement-image-actions-${placementId}`);

                if (img && imageActions) {
                    img.src = placement.imageData;
                    img.style.display = 'block';
                    imageActions.style.display = 'flex';
                }
            }

            renderPlacementColors(placementId);
            updatePlacementStations(placementId);
            updatePlacementColorsPreview(placementId);
        });
    } else {
        initializePlacements();
    }

    updatePlacementsTabs();
    showPlacement(1);
    updateClientLogo();

    showTab('spec-creator');
    showStatus('📂 Spec cargada correctamente');
}

function downloadSingleSpec(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `TegraSpec_${data.style || 'Backup'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showStatus('✅ Spec descargada como JSON', 'success');
    } catch (e) {
        showStatus('❌ Error al descargar la spec', 'error');
    }
}

function deleteSpec(key) {
    if (confirm('¿Estás seguro de que quieres eliminar esta spec?')) {
        localStorage.removeItem(key);
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Spec eliminada', 'success');
    }
}

function clearAllSpecs() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODAS las specs guardadas?\n\nEsta acción no se puede deshacer y se perderán todos los datos.')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('spec_')) {
                localStorage.removeItem(key);
            }
        });
        loadSavedSpecsList();
        updateDashboard();
        showStatus('🗑️ Todas las specs han sido eliminadas', 'success');
    }
}

// =====================================================
// FUNCIONES DE GUARDADO
// =====================================================

function saveCurrentSpec() {
    try {
        const data = collectData();
        const style = data.style || 'SinEstilo_' + Date.now();
        const storageKey = `spec_${style}_${Date.now()}`;

        placements.forEach(placement => {
            const specialtiesField = document.getElementById(`specialties-${placement.id}`);
            if (specialtiesField) {
                placement.specialties = specialtiesField.value;
            }

            const instructionsField = document.getElementById(`special-instructions-${placement.id}`);
            if (instructionsField) {
                placement.specialInstructions = instructionsField.value;
            }
        });

        data.savedAt = new Date().toISOString();
        data.lastModified = new Date().toISOString();

        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (storageError) {
            if (storageError && storageError.name === 'QuotaExceededError') {
                const lightData = {
                    ...data,
                    placements: (data.placements || []).map((p) => ({ ...p, imageData: null }))
                };
                localStorage.setItem(storageKey, JSON.stringify(lightData));
                showStatus('⚠️ Guardado sin imágenes por límite de almacenamiento', 'warning');
            } else {
                throw storageError;
            }
        }

        updateDashboard();
        loadSavedSpecsList();

        showStatus('✅ Spec guardada correctamente', 'success');

        setTimeout(() => {
            if (confirm('¿Deseas ver todas las specs guardadas?')) {
                showTab('saved-specs');
            }
        }, 1000);

    } catch (error) {
        console.error('Error al guardar:', error);
        showStatus('❌ Error al guardar: ' + error.message, 'error');
    }
}

function collectData() {
    if (typeof buildSpecData === 'function') {
        return buildSpecData();
    }
    console.error('buildSpecData no encontrado! Revisa que modules/spec-data-model.js esté cargado.');
    return { placements: [] };
}

// =====================================================
// FUNCIONES DE LIMPIEZA
// =====================================================

function clearForm() {
    if (confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el formulario?\n\nSe perderán todos los datos no guardados.\n\n¿Continuar?')) {
        document.querySelectorAll('input:not(#folder-num), textarea, select').forEach(i => {
            if (i.type !== 'button' && i.type !== 'submit') {
                i.value = '';
            }
        });
        setInputValue('designer', '');

        placements = [];
        const placementsContainer = document.getElementById('placements-container');
        const placementsTabs = document.getElementById('placements-tabs');
        if (placementsContainer) placementsContainer.innerHTML = '';
        if (placementsTabs) placementsTabs.innerHTML = '';

        initializePlacements();

        const logoElement = document.getElementById('logoCliente');
        if (logoElement) {
            logoElement.style.display = 'none';
        }

        showStatus('🧹 Formulario limpiado correctamente');
    }
}

// =====================================================
// FUNCIONES DE EXPORTACIÓN
// =====================================================

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

function getInputValue(id, fallback = '') {
    const element = document.getElementById(id);
    return element ? element.value : fallback;
}

// =====================================================
// FUNCIÓN EXPORTAR HTML (renombrada)
// =====================================================
async function exportHTML() {
    try {
        if (!window.generateSpecHTMLDocument) {
            throw new Error('Generador HTML no disponible (window.generateSpecHTMLDocument).');
        }

        // ✅ IMPORTANTE: Recolectar datos ACTUALES del formulario y placements
        const data = collectData();

        // ✅ Forzar actualización de la secuencia en los datos
        data.placements = placements.map(p => ({
            ...p,
            // Asegurar que los colores sean los actuales
            colors: p.colors,
            sequence: p.sequence
        }));

        console.log('📤 Exportando HTML con datos:', data);

        const htmlContent = window.generateSpecHTMLDocument(data);
        const style = getInputValue('style', 'Spec') || 'Spec';
        const folderNum = getInputValue('folder-num', '00000') || '00000';
        const fileName = `TegraSpec_${style}_${folderNum}.html`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus('✅ HTML descargado correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar HTML:', error);
        showStatus('❌ Error al generar HTML: ' + error.message, 'error');
    }
}

// exportToExcel movido a modules/export-excel.js

async function downloadProjectZip() {
    try {
        if (typeof JSZip === 'undefined') {
            showStatus('❌ Error: La biblioteca JSZip no está cargada', 'error');
            return;
        }

        const style = getInputValue('style', 'SinEstilo') || 'SinEstilo';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const projectName = `TegraSpec_${style}_${timestamp}`;

        const zip = new JSZip();

        const jsonData = collectData();
        zip.file(`${projectName}.json`, JSON.stringify(jsonData, null, 2));

        if (window.generateSpecHTMLDocument) {
            const htmlContent = window.generateSpecHTMLDocument(collectData());
            zip.file(`${projectName}.html`, htmlContent);
        } else {
            zip.file(`${projectName}_HTML_ERROR.txt`, 'No se pudo generar el archivo HTML del spec.');
        }

        placements.forEach((placement, index) => {
            if (placement.imageData && placement.imageData.startsWith('data:')) {
                try {
                    const imageBlob = dataURLToBlob(placement.imageData);
                    const displayType = placement.type.includes('CUSTOM:')
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    zip.file(`${projectName}_placement${index + 1}_${displayType}.jpg`, imageBlob);
                } catch (imgError) {
                    console.warn(`No se pudo procesar imagen para placement ${placement.type}:`, imgError);
                }
            }
        });

        const readmeContent = `PROYECTO TEGRA SPEC MANAGER ================================

Archivos incluidos:
- ${projectName}.json: Datos de la especificación técnica
- ${projectName}.html: Spec visual en formato HTML (layout carta)
${placements.some(p => p.imageData) ? `- Imágenes de placements: ${placements.filter(p => p.imageData).length} archivo(s) de imagen` : ''}

Total de Placements: ${placements.length}
Generado: ${new Date().toLocaleString('es-ES')}
Cliente: ${document.getElementById('customer')?.value || 'N/A'}
Estilo: ${document.getElementById('style')?.value || 'N/A'}

Para cargar este proyecto:
1. Descomprime el archivo ZIP
2. En Tegra Spec Manager, ve a "Crear Spec"
3. Haz clic en "Cargar Spec" y selecciona el archivo .json
4. Las imágenes de placements se cargarán automáticamente

Placements incluidos: ${placements.map(p => p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type).join(', ')}`;

        zip.file('LEEME.txt', readmeContent);

        showStatus('📦 Generando archivo ZIP...', 'warning');

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        saveAs(zipBlob, `${projectName}.zip`);

        showStatus('📦 Proyecto ZIP descargado correctamente');

    } catch (error) {
        console.error('Error al generar ZIP:', error);
        showStatus('❌ Error al generar proyecto ZIP: ' + error.message, 'error');
    }
}

function dataURLToBlob(dataURL) {
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
        console.error('Error en dataURLToBlob:', error);
        throw error;
    }
}

async function loadProjectZip(file) {
    try {
        showStatus('📦 Cargando proyecto ZIP...', 'warning');

        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);

        let jsonData = null;
        const imageFiles = [];

        for (const [filename, zipEntry] of Object.entries(zipData.files)) {
            if (!zipEntry.dir) {
                if (filename.endsWith('.json')) {
                    const jsonContent = await zipEntry.async('text');
                    jsonData = JSON.parse(jsonContent);
                } else if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    const imageBlob = await zipEntry.async('blob');
                    const imageData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(imageBlob);
                    });
                    imageFiles.push({ filename, imageData });
                }
            }
        }

        if (jsonData) {
            loadSpecData(jsonData);

            imageFiles.forEach((imageFile, index) => {
                const placementIndex = parseInt(imageFile.filename.match(/placement(\d+)/)?.[1]) - 1;
                if (placementIndex >= 0 && placements[placementIndex]) {
                    placements[placementIndex].imageData = imageFile.imageData;

                    const img = document.getElementById(`placement-image-preview-${placements[placementIndex].id}`);
                    const imageActions = document.getElementById(`placement-image-actions-${placements[placementIndex].id}`);

                    if (img && imageActions) {
                        img.src = imageFile.imageData;
                        img.style.display = 'block';
                        imageActions.style.display = 'flex';
                    }
                }
            });

            showStatus('✅ Proyecto ZIP cargado correctamente');
            showTab('spec-creator');
        } else {
            throw new Error('No se encontró archivo JSON en el ZIP');
        }

    } catch (error) {
        console.error('Error al cargar ZIP:', error);
        showStatus('❌ Error al cargar proyecto ZIP: ' + error.message, 'error');
    }
}

// =====================================================
// FUNCIONES PARA LOG DE ERRORES
// =====================================================

function loadErrorLog() {
    const container = document.getElementById('error-log-content');
    if (!container) return;

    const errors = errorHandler ? errorHandler.getErrors() : [];

    if (errors.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--success);"></i>
                No hay errores registrados en el log.
            </p>
        `;
        return;
    }

    let html = `
        <div style="margin-bottom: 20px;">
            <p>Total de errores: <strong>${errors.length}</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
                Última actualización: ${new Date().toLocaleString('es-ES')}
            </p>
        </div>
    `;

    errors.forEach((error, index) => {
        html += `
            <div class="card" style="margin-bottom: 15px; border-left: 4px solid var(--error);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="color: var(--error);">${error.context}</strong>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${new Date(error.timestamp).toLocaleString('es-ES')}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="copyErrorDetails(${index})">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                    </div>
                    <div style="background: var(--gray-dark); padding: 10px; border-radius: var(--radius); margin-bottom: 10px;">
                        <code style="color: var(--text-primary); font-size: 0.85rem;">
                            ${error.error.message || 'Sin mensaje'}
                        </code>
                    </div>
                    ${error.extraData && Object.keys(error.extraData).length > 0 ? `
                    <div style="font-size: 0.8rem;">
                        <strong>Datos adicionales:</strong>
                        <pre style="background: var(--gray-dark); padding: 8px; border-radius: var(--radius); margin-top: 5px; font-size: 0.75rem; max-height: 100px; overflow: auto;">
${JSON.stringify(error.extraData, null, 2)}
                        </pre>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function copyErrorDetails(index) {
    const errors = errorHandler ? errorHandler.getErrors() : [];
    if (index < 0 || index >= errors.length) return;

    const error = errors[index];
    const text = `Error: ${error.error.message}\nContexto: ${error.context}\nFecha: ${error.timestamp}\nStack: ${error.error.stack || 'No disponible'}`;

    navigator.clipboard.writeText(text).then(() => {
        showStatus('✅ Detalles del error copiados al portapapeles', 'success');
    }).catch(err => {
        showStatus('❌ Error al copiar al portapapeles', 'error');
    });
}

function clearErrorLog() {
    if (confirm('¿Estás seguro de que quieres limpiar el log de errores?')) {
        if (window.errorHandler) {
            if (typeof window.errorHandler.clearErrors === 'function') {
                window.errorHandler.clearErrors();
            } else if (typeof window.errorHandler.clear === 'function') {
                window.errorHandler.clear();
            } else if (Array.isArray(window.errorHandler.errors)) {
                window.errorHandler.errors = [];
            }
        }
        loadErrorLog();
        showStatus('🗑️ Log de errores limpiado', 'success');
    }
}

function exportErrorLog() {
    try {
        const errors = errorHandler ? errorHandler.getErrors() : [];
        const exportData = {
            app: 'Tegra Spec Manager',
            version: Config.APP.VERSION || '1.0.0',
            exportDate: new Date().toISOString(),
            totalErrors: errors.length,
            errors: errors
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `TegraSpec_ErrorLog_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        showStatus('✅ Log de errores exportado', 'success');
    } catch (error) {
        console.error('Error al exportar log:', error);
        showStatus('❌ Error al exportar log de errores', 'error');
    }
}

// =====================================================
// FUNCIONES DE INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    loadTabTemplates()
        .then(() => {
            // Una vez que los templates están cargados, podemos inicializar todo
            console.log('✅ Templates cargados, inicializando app...');

            // --- INICIALIZAR REACTIVE STORE ---
            if (window.Store && window.initBindings && window.enableAutosave && window.enableStateDebugger) {
                const savedState = localStorage.getItem("spec-autosave");
                if (savedState) {
                    try {
                        const parsedState = JSON.parse(savedState);
                        console.log("📥 [Autosave] Cargando Spec guardado...");
                        Store.replaceState(parsedState);
                    } catch (e) { console.error("Error cargando autosave", e); }
                }

                initBindings();
                enableAutosave();
                enableStateDebugger();
            }

            updateDateTime();
            updateDashboard();
            loadSavedSpecsList(); // Ahora el contenedor ya existe
            setupPasteHandler();
            setupExcelImportHandler();
            loadThemePreference();
            bindSpecCreatorFormSafety();

            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', toggleTheme);
            }

            const customerInput = document.getElementById('customer');
            if (customerInput) {
                customerInput.addEventListener('change', () => {
                    updateClientLogo();
                    applyCustomerInkDefaults();
                    handleGearForSportLogic();
                });
            }

            setInterval(updateDateTime, 60000);

            // Inicializar placements solo si el contenedor existe
            if (placements.length === 0 && document.getElementById('placements-container')) {
                initializePlacements();
            } else if (placements.length > 0 && document.getElementById('placements-container')) {
                // Si fueron cargados de autosave, re-dibujarlos
                placements.forEach(p => renderPlacementHTML(p));
                updatePlacementsTabs();
                showPlacement(placements[0] ? placements[0].id : null);
            } else {
                console.warn("No se pudo inicializar placements: contenedor no encontrado.");
            }

            if (stateManager) {
                stateManager.loadFromLocalStorage();
            }

            setTimeout(() => {
                // Este código de UI sigue siendo válido
                const actionButtons = document.querySelector('.card.no-print .card-body');
                if (actionButtons) {
                    const buttons = actionButtons.querySelectorAll('button');
                    const specButton = Array.from(buttons).find(btn =>
                        btn.textContent.includes('Descargar Spec') ||
                        btn.textContent.includes('Descargar Calculadora')
                    );
                    const htmlButton = Array.from(buttons).find(btn =>
                        btn.textContent.includes('Exportar HTML') ||
                        btn.textContent.includes('Descargar HTML')
                    );

                    if (specButton && htmlButton) {
                        specButton.textContent = ' Descargar Spec';
                        specButton.classList.remove('btn-warning');
                        specButton.classList.add('btn-primary');
                        specButton.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                        specButton.style.borderColor = '#0056b3';

                        htmlButton.textContent = ' Exportar HTML';
                        htmlButton.classList.remove('btn-warning');
                        htmlButton.classList.add('btn-success');

                        htmlButton.parentNode.insertBefore(htmlButton, specButton.nextSibling);
                    }
                }
            }, 2000);

            console.log('✅ Tegra Spec Manager v3.0 iniciado');
            console.log('✅ Motor de reglas disponible:', !!window.RulesEngine);
        })
        .catch((error) => {
            console.error('Error al cargar templates:', error);
            showStatus('❌ Error al cargar los templates', 'error');

            if (errorHandler) {
                errorHandler.log('template_load', error);
            }
        });
});

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

function normalizeGearForSportColor(colorName) {
    if (!colorName) return colorName;

    const upperColor = colorName.toUpperCase().trim();

    if (Config && Config.COLOR_DATABASES && Config.COLOR_DATABASES.GEARFORSPORT) {
        for (const [key, data] of Object.entries(Config.COLOR_DATABASES.GEARFORSPORT)) {
            const keyUpper = key.toUpperCase();

            if (upperColor === keyUpper) {
                return key;
            }

            if (keyUpper.includes(upperColor) || upperColor.includes(keyUpper)) {
                return key;
            }

            const numberMatch = upperColor.match(/(\d{3,4})/);
            if (numberMatch) {
                const number = numberMatch[1];
                if (keyUpper.includes(number)) {
                    return key;
                }
            }
        }
    }

    return colorName;
}
// =====================================================
// FUNCIONES PARA EL DASHBOARD MEJORADO
// =====================================================

// Debouncer para la búsqueda en el dashboard
const debouncedSearchDashboardSpecs = (() => {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            searchDashboardSpecs();
        }, 300);
    };
})();

function searchDashboardSpecs() {
    const searchInput = document.getElementById('dashboard-spec-search');
    const resultsDiv = document.getElementById('dashboard-search-results');
    if (!searchInput || !resultsDiv) return;

    const query = searchInput.value.toUpperCase().trim();
    const specs = Object.keys(localStorage).filter(key => key.startsWith('spec_'));

    if (query.length < 2) {
        resultsDiv.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 15px;">Escribe al menos 2 caracteres...</p>';
        return;
    }

    if (specs.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No hay specs guardadas.</p>';
        return;
    }

    let visibleCount = 0;
    let resultsHtml = '';

    specs.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const searchableText = [
                key,
                data.style || '',
                data.customer || '',
                data.po || '',
                data.colorway || ''
            ].join(' ').toUpperCase();

            if (query && !searchableText.includes(query)) {
                return;
            }

            visibleCount += 1;
            resultsHtml += `
                <div style="padding:12px; border-bottom:1px solid var(--border-dark); display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight: 700; color: var(--primary);">${data.style || 'N/A'}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Cliente: ${data.customer || 'N/A'} | PO: ${data.po || 'N/A'}</div>
                    </div>
                    <div style="display: flex; gap: 5px; flex-shrink:0;">
                        <button class="btn btn-primary btn-sm" onclick='loadSpecData(${JSON.stringify(data).replace(/'/g, "\\'")})' title="Abrir para editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline btn-sm" onclick='duplicateSpecFromData(${JSON.stringify(data).replace(/'/g, "\\'")})' title="Duplicar"><i class="fas fa-copy"></i></button>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Error al parsear spec guardada:', key, e);
        }
    });

    if (visibleCount === 0) {
        resultsDiv.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                <i class="fas fa-search" style="margin-right: 6px;"></i>
                No se encontraron specs para <strong>${query}</strong>
            </p>
        `;
    } else {
        resultsDiv.innerHTML = resultsHtml;
    }
}

// Función para duplicar una spec directamente desde los datos guardados
function duplicateSpecFromData(data) {
    // Crear una copia profunda de los datos
    const duplicatedData = JSON.parse(JSON.stringify(data));
    // Modificar el nombre o algo para indicar que es una copia
    duplicatedData.style = (duplicatedData.style || 'Spec') + ' (Copia)';
    duplicatedData.savedAt = new Date().toISOString();

    // Cargar los datos duplicados en el formulario
    loadSpecData(duplicatedData);
    showTab('spec-creator');
    showStatus('📋 Spec duplicada. ¡Revisa y guarda los cambios!', 'success');
}
// Función de prueba para Tech Pack
function testTechPack() {
    if (typeof NikeTechPackExtractor === 'undefined') {
        showStatus('❌ NikeTechPackExtractor no está cargado', 'error');
        console.error('NikeTechPackExtractor no está definido');
        return;
    }
    
    // Crear input de archivo temporal
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        showStatus('📄 Procesando Tech Pack...', 'info');
        
        try {
            const extractor = new NikeTechPackExtractor();
            const datosPDF = await extractor.procesarPDF(file);
            console.log('📊 Datos extraídos del PDF:', datosPDF);
            
            // Si tegra-adapter está disponible, usarlo
            if (window.tegraAdapter) {
                window.tegraAdapter.poblarFormularioConPDF(datosPDF);
                showTab('spec-creator');
            } else {
                showStatus('✅ PDF procesado, pero tegra-adapter no está disponible', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('❌ Error: ' + error.message, 'error');
        }
    };
    input.click();
}

// =====================================================
// EXPORTAR FUNCIONES GLOBALES
// =====================================================
window.showTab = showTab;
window.loadSavedSpecsList = loadSavedSpecsList;
window.loadSpec = loadSpec;
window.clearErrorLog = clearErrorLog;
window.exportErrorLog = exportErrorLog;
window.clearAllSpecs = clearAllSpecs;
window.addNewPlacement = addNewPlacement;
window.saveCurrentSpec = saveCurrentSpec;
window.clearForm = clearForm;
window.exportToExcel = exportToExcel;
window.exportHTML = exportHTML; // ✅ Renombrado
window.exportPDF = exportHTML; // Compatibilidad con botones legacy
window.downloadProjectZip = downloadProjectZip;
window.removePlacement = removePlacement;
window.duplicatePlacement = duplicatePlacement;
window.showPlacement = showPlacement;
window.updatePlacementType = updatePlacementType;
window.updatePlacementInkType = updatePlacementInkType;
window.openImagePickerForPlacement = openImagePickerForPlacement;
window.removePlacementImage = removePlacementImage;
window.addPlacementColorItem = addPlacementColorItem;
window.removePlacementColorItem = removePlacementColorItem;
window.movePlacementColorItem = movePlacementColorItem;
window.updatePlacementColorValue = updatePlacementColorValue;
window.updatePlacementColorMesh = updatePlacementColorMesh;
window.updatePlacementScreenLetter = updatePlacementScreenLetter;
window.updatePlacementParam = updatePlacementParam;
window.updateCustomPlacement = updateCustomPlacement;
window.updateAllPlacementTitles = updateAllPlacementTitles;
window.updateClientLogo = updateClientLogo;
window.handleGearForSportLogic = handleGearForSportLogic;
window.applyCustomerInkDefaults = applyCustomerInkDefaults;
window.setupPlacementAutocomplete = setupPlacementAutocomplete;
window.generarConAsistente = generarConAsistente;
window.normalizeGearForSportStyleAndColorway = normalizeGearForSportStyleAndColorway;
