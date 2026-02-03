// js/modules/data/client-manager.js
// MÓDULO PARA GESTIÓN DE CLIENTES Y LOGOS

const ClientManager = (function() {
    console.log('🏢 Módulo ClientManager cargando...');
    
    // ========== VARIABLES PRIVADAS ==========
    const clientLogoCache = {};
    const CLIENT_CONFIG = {
        'NIKE': {
            logo: 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png',
            variations: ['NIKE', 'NIQUE']
        },
        'FANATICS': {
            logo: 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png',
            variations: ['FANATICS', 'FANATIC']
        },
        'ADIDAS': {
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png',
            variations: ['ADIDAS']
        },
        'PUMA': {
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png',
            variations: ['PUMA']
        },
        'UNDER ARMOUR': {
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png',
            variations: ['UNDER ARMOUR', 'UA']
        },
        'GEAR FOR SPORT': {
            logo: 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png',
            variations: ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S']
        }
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    
    function findClientLogo(clientName) {
        if (!clientName) return null;
        
        const upperClient = clientName.toUpperCase().trim();
        
        // Buscar en caché primero
        if (clientLogoCache[upperClient]) {
            return clientLogoCache[upperClient];
        }
        
        // Buscar en configuración
        for (const [clientKey, config] of Object.entries(CLIENT_CONFIG)) {
            for (const variation of config.variations) {
                if (upperClient.includes(variation)) {
                    clientLogoCache[upperClient] = config.logo;
                    return config.logo;
                }
            }
        }
        
        // Usar LogoConfig global si existe
        if (window.LogoConfig) {
            for (const [key, logoUrl] of Object.entries(window.LogoConfig)) {
                if (upperClient.includes(key)) {
                    clientLogoCache[upperClient] = logoUrl;
                    return logoUrl;
                }
            }
        }
        
        return null;
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    function initialize() {
        console.log('⚙️ Inicializando ClientManager...');
        
        // Configurar evento para input de cliente
        setupClientInputListener();
        
        console.log('✅ ClientManager inicializado');
        return true;
    }
    
    function setupClientInputListener() {
        const customerInput = document.getElementById('customer');
        if (customerInput) {
            // Remover listener anterior si existe
            customerInput.removeEventListener('input', handleClientInput);
            
            // Agregar nuevo listener
            customerInput.addEventListener('input', handleClientInput);
            
            console.log('✅ Listener de cliente configurado');
        } else {
            console.warn('⚠️ Input de cliente no encontrado');
        }
    }
    
    function handleClientInput(event) {
        const clientName = event.target.value;
        updateClientLogo(clientName);
    }
    
    function updateClientLogo(clientName) {
        console.log(`🏢 Actualizando logo para cliente: ${clientName}`);
        
        const logoElement = document.getElementById('logoCliente');
        if (!logoElement) {
            console.error('❌ Elemento logoCliente no encontrado');
            return false;
        }
        
        const logoUrl = findClientLogo(clientName);
        
        if (logoUrl) {
            logoElement.src = logoUrl;
            logoElement.style.display = 'block';
            console.log(`✅ Logo encontrado: ${logoUrl}`);
            
            // Mostrar notificación
            showClientNotification(clientName, true);
            return true;
        } else {
            logoElement.style.display = 'none';
            console.log('❌ Logo no encontrado');
            
            showClientNotification(clientName, false);
            return false;
        }
    }
    
    function showClientNotification(clientName, success) {
        if (!clientName || clientName.trim() === '') return;
        
        const message = success ? 
            `✅ Logo cargado para ${clientName}` : 
            `ℹ️ No se encontró logo para ${clientName}`;
        
        const type = success ? 'success' : 'info';
        
        if (window.AppManager && typeof window.AppManager.showStatus === 'function') {
            window.AppManager.showStatus(message, type);
        } else if (typeof showStatus === 'function') {
            showStatus(message, type);
        }
    }
    
    function getClientInfo(clientName) {
        const logoUrl = findClientLogo(clientName);
        
        return {
            name: clientName,
            hasLogo: !!logoUrl,
            logoUrl: logoUrl,
            normalizedName: normalizeClientName(clientName)
        };
    }
    
    function normalizeClientName(clientName) {
        if (!clientName) return '';
        
        const upperClient = clientName.toUpperCase().trim();
        
        for (const [clientKey, config] of Object.entries(CLIENT_CONFIG)) {
            for (const variation of config.variations) {
                if (upperClient.includes(variation)) {
                    return clientKey;
                }
            }
        }
        
        return clientName;
    }
    
    function getAvailableClients() {
        return Object.keys(CLIENT_CONFIG).map(clientKey => ({
            name: clientKey,
            logo: CLIENT_CONFIG[clientKey].logo,
            variations: CLIENT_CONFIG[clientKey].variations
        }));
    }
    
    function clearLogoCache() {
        const previousSize = Object.keys(clientLogoCache).length;
        Object.keys(clientLogoCache).forEach(key => {
            delete clientLogoCache[key];
        });
        console.log(`🗑️ Caché de logos limpiada (${previousSize} entradas)`);
        return previousSize;
    }
    
    // ========== EXPORTAR MÓDULO ==========
    
    const publicAPI = {
        // Métodos principales
        initialize,
        updateClientLogo,
        
        // Información
        getClientInfo,
        normalizeClientName,
        getAvailableClients,
        
        // Utilidades
        clearLogoCache,
        
        // Para compatibilidad
        updateLogo: updateClientLogo, // alias
        
        // Información del módulo
        _info: {
            name: 'ClientManager',
            version: '1.0.0',
            supportedClients: Object.keys(CLIENT_CONFIG).length
        }
    };
    
    // Hacer disponible globalmente
    if (typeof window !== 'undefined') {
        window.ClientManager = publicAPI;
        
        // Mantener compatibilidad con updateClientLogo global
        window.updateClientLogo = function() {
            console.log('🔗 updateClientLogo llamado globalmente, redirigiendo a ClientManager');
            const customerInput = document.getElementById('customer');
            if (customerInput) {
                return publicAPI.updateClientLogo(customerInput.value);
            }
            return false;
        };
        
        console.log('✅ ClientManager disponible como window.ClientManager');
        console.log('✅ updateClientLogo global redirigido a ClientManager');
    }
    
    return publicAPI;
})();

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (ClientManager && typeof ClientManager.initialize === 'function') {
            setTimeout(() => ClientManager.initialize(), 1500);
        }
    });
} else {
    if (ClientManager && typeof ClientManager.initialize === 'function') {
        setTimeout(() => ClientManager.initialize(), 1500);
    }
}

console.log('🏢 Módulo ClientManager cargado correctamente');
