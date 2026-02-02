// js/managers/client-manager.js

const ClientManager = {
    init: function() {
        console.log('⚙️ Inicializando ClientManager...');
        
        const clientInput = document.getElementById('client-name-input'); // O el ID que uses
        
        // VALIDACIÓN DE SEGURIDAD
        if (!clientInput) {
            console.warn('⚠️ ClientManager: No se encontró el input del cliente (ID: client-name-input). Verifica tu HTML.');
            return; // Detenemos la ejecución aquí para no causar error
        }

        // Si existe, continuamos con la lógica...
        this.setupListeners(clientInput);
        console.log('✅ ClientManager inicializado.');
    },

    setupListeners: function(inputElement) {
        // Tu lógica actual aquí
    }
    // ... resto del código
};
