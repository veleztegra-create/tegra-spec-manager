// config-loader.js - Módulo para cargar toda la configuración de la aplicación desde archivos JSON.

(async function() {
    // Define la lista de archivos de configuración a cargar.
    const CONFIG_FILES = {
        inkPresets: 'data/ink-presets.json',
        colorDatabases: 'data/color-databases.json',
        teamsAndColors: 'data/teams-and-colors.json',
        placementDetails: 'data/placement-details.json',
        clientLogos: 'data/client-logos.json'
    };

    try {
        console.log('🔄 [ConfigLoader] Cargando configuración de la aplicación...');

        // Crea un array de promesas de carga
        const promises = Object.entries(CONFIG_FILES).map(async ([key, path]) => {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Falló la carga de ${path}: ${response.statusText}`);
            }
            return [key, await response.json()];
        });

        // Espera a que todos los archivos se carguen y se parseen
        const configEntries = await Promise.all(promises);

        // Construye el objeto de configuración global a partir de las entradas
        window.AppConfig = Object.fromEntries(configEntries);

        // Añade metadatos y funciones de utilidad al objeto de configuración
        window.AppConfig.lastLoaded = new Date().toISOString();
        
        // Re-implementa la lógica de búsqueda de equipos que antes estaba en config-teams.js
        window.AppConfig.findTeam = function(code) {
            if (!this.teamsAndColors) return null;
            const leagues = ['NCAA', 'NBA', 'NFL'];
            for (const league of leagues) {
                if (this.teamsAndColors[league]?.teams?.[code]) {
                    return {
                        name: this.teamsAndColors[league].teams[code].name,
                        league: league
                    };
                }
            }
            return null;
        };

        console.log('✅ [ConfigLoader] Configuración cargada y disponible en window.AppConfig:', window.AppConfig);
        
        // Dispara un evento personalizado para notificar al resto de la aplicación
        // que la configuración ya está lista. app.js escuchará este evento.
        document.dispatchEvent(new CustomEvent('config-loaded'));

    } catch (error) {
        console.error('❌ [ConfigLoader] ERROR CRÍTICO: No se pudo cargar la configuración de la aplicación.', error);
        
        // Muestra un mensaje de error devastador para el usuario,
        // ya que la aplicación no puede funcionar sin su configuración.
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `
                <div style="padding: 40px; text-align: center; font-family: sans-serif; background-color: #2c2c2c; color: #ff8a80; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <h1>Error Crítico</h1>
                    <p>No se pudieron cargar los archivos de configuración esenciales (.json).</p>
                    <p>La aplicación no puede continuar. Revisa la consola (F12) para más detalles.</p>
                    <p style="margin-top: 20px; font-family: monospace; color: #ffa39e; background: #3c1010; padding: 10px; border-radius: 5px;"><em>${error.message}</em></p>
                </div>
            `;
        }
    }
})();
