// js/modules/data/storage-manager.js
console.log('🔄 Cargando módulo StorageManager...');

const StorageManager = (function() {
    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        STORAGE_PREFIX: 'tegra_spec_',
        BACKUP_PREFIX: 'backup_',
        MAX_STORAGE_ITEMS: 100,
        AUTO_BACKUP_INTERVAL: 5 * 60 * 1000, // 5 minutos
        COMPRESSION_ENABLED: true,
        ENCRYPTION_ENABLED: false
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    function generateStorageKey(type, identifier) {
        console.log('🔑 Generando clave de almacenamiento...');
        try {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 9);
            
            switch (type) {
                case 'spec':
                    return `${CONFIG.STORAGE_PREFIX}spec_${identifier}_${timestamp}_${random}`;
                case 'backup':
                    return `${CONFIG.STORAGE_PREFIX}${CONFIG.BACKUP_PREFIX}${timestamp}_${random}`;
                case 'config':
                    return `${CONFIG.STORAGE_PREFIX}config_${identifier}`;
                case 'cache':
                    return `${CONFIG.STORAGE_PREFIX}cache_${identifier}`;
                default:
                    return `${CONFIG.STORAGE_PREFIX}${type}_${identifier}_${timestamp}`;
            }
        } catch (error) {
            console.error('❌ Error en generateStorageKey:', error);
            return `${CONFIG.STORAGE_PREFIX}error_${Date.now()}`;
        }
    }
    
    function compressData(data) {
        console.log('🗜️ Comprimiendo datos...');
        try {
            if (!CONFIG.COMPRESSION_ENABLED || !data) {
                return data;
            }
            
            // Compresión simple (para grandes cantidades de datos)
            const jsonString = JSON.stringify(data);
            
            // Solo comprimir si es grande (> 10KB)
            if (jsonString.length < 10240) {
                return data;
            }
            
            // Aquí podríamos implementar compresión real si fuera necesario
            // Por ahora, solo minificamos el JSON
            return JSON.parse(jsonString); // Devuelve el mismo objeto, pero ya está parseado
            
        } catch (error) {
            console.error('❌ Error en compressData:', error);
            return data;
        }
    }
    
    function decompressData(data) {
        console.log('🗜️ Descomprimiendo datos...');
        try {
            // Si no está comprimido, devolver tal cual
            return data;
        } catch (error) {
            console.error('❌ Error en decompressData:', error);
            return data;
        }
    }
    
    function validateData(data, schema = null) {
        console.log('🔍 Validando datos...');
        try {
            if (!data) {
                throw new Error('Datos vacíos');
            }
            
            // Validación básica
            if (typeof data !== 'object') {
                throw new Error('Los datos deben ser un objeto');
            }
            
            // Si se proporciona un esquema, validar contra él
            if (schema && typeof schema === 'object') {
                for (const [key, validator] of Object.entries(schema)) {
                    if (validator.required && !data.hasOwnProperty(key)) {
                        throw new Error(`Campo requerido faltante: ${key}`);
                    }
                    
                    if (data[key] && validator.type) {
                        if (typeof data[key] !== validator.type) {
                            throw new Error(`Tipo incorrecto para ${key}: esperado ${validator.type}, obtenido ${typeof data[key]}`);
                        }
                    }
                }
            }
            
            console.log('✅ Datos validados correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error en validateData:', error);
            throw error;
        }
    }
    
    function calculateStorageUsage() {
        console.log('📊 Calculando uso de almacenamiento...');
        try {
            let totalSize = 0;
            let itemCount = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                if (key && value) {
                    totalSize += key.length + value.length;
                    itemCount++;
                }
            }
            
            const usage = {
                totalItems: itemCount,
                totalSize: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                usagePercentage: (totalSize / (5 * 1024 * 1024) * 100).toFixed(2) // Asumiendo 5MB límite
            };
            
            console.log('✅ Uso calculado:', usage);
            return usage;
            
        } catch (error) {
            console.error('❌ Error en calculateStorageUsage:', error);
            return {
                totalItems: 0,
                totalSize: 0,
                totalSizeKB: '0.00',
                totalSizeMB: '0.00',
                usagePercentage: '0.00'
            };
        }
    }
    
    function showStatus(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        if (window.AppManager && window.AppManager.showStatus) {
            window.AppManager.showStatus(message, type);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    function saveSpec(data) {
        console.log('💾 Guardando spec en almacenamiento...');
        try {
            // Validar datos
            const specSchema = {
                customer: { type: 'string', required: false },
                style: { type: 'string', required: true },
                placements: { type: 'object', required: false }
            };
            
            validateData(data, specSchema);
            
            // Generar clave única
            const storageKey = generateStorageKey('spec', data.style || 'untitled');
            
            // Preparar datos para guardar
            const dataToSave = {
                ...data,
                _metadata: {
                    savedAt: new Date().toISOString(),
                    version: window.Config?.APP?.VERSION || '1.0.0',
                    storageKey: storageKey,
                    compression: CONFIG.COMPRESSION_ENABLED
                }
            };
            
            // Comprimir si está habilitado
            const compressedData = compressData(dataToSave);
            
            // Guardar en localStorage
            localStorage.setItem(storageKey, JSON.stringify(compressedData));
            
            // Limitar número máximo de items
            cleanupOldItems();
            
            console.log(`✅ Spec guardada: ${storageKey}`);
            showStatus('✅ Spec guardada correctamente', 'success');
            
            return storageKey;
            
        } catch (error) {
            console.error('❌ Error en saveSpec:', error);
            showStatus(`❌ Error al guardar spec: ${error.message}`, 'error');
            return null;
        }
    }
    
    function loadSpec(key) {
        console.log(`📂 Cargando spec: ${key}`);
        try {
            // Verificar que la key exista
            if (!localStorage.getItem(key)) {
                throw new Error(`Spec no encontrada: ${key}`);
            }
            
            // Cargar datos
            const storedData = JSON.parse(localStorage.getItem(key));
            
            // Descomprimir si es necesario
            const decompressedData = decompressData(storedData);
            
            // Validar datos cargados
            validateData(decompressedData);
            
            console.log(`✅ Spec cargada: ${key}`);
            return decompressedData;
            
        } catch (error) {
            console.error('❌ Error en loadSpec:', error);
            showStatus(`❌ Error al cargar spec: ${error.message}`, 'error');
            return null;
        }
    }
    
    function deleteSpec(key) {
        console.log(`🗑️ Eliminando spec: ${key}`);
        try {
            if (!localStorage.getItem(key)) {
                throw new Error(`Spec no encontrada: ${key}`);
            }
            
            localStorage.removeItem(key);
            
            console.log(`✅ Spec eliminada: ${key}`);
            showStatus('🗑️ Spec eliminada', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en deleteSpec:', error);
            showStatus(`❌ Error al eliminar spec: ${error.message}`, 'error');
            return false;
        }
    }
    
    function getAllSpecs() {
        console.log('📋 Obteniendo todas las specs...');
        try {
            const specs = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith(`${CONFIG.STORAGE_PREFIX}spec_`)) {
                    try {
                        const data = loadSpec(key);
                        if (data) {
                            specs.push({
                                key: key,
                                data: data,
                                metadata: data._metadata || {}
                            });
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error al cargar spec ${key}:`, error);
                    }
                }
            }
            
            // Ordenar por fecha (más reciente primero)
            specs.sort((a, b) => {
                const dateA = new Date(a.metadata.savedAt || 0);
                const dateB = new Date(b.metadata.savedAt || 0);
                return dateB - dateA;
            });
            
            console.log(`✅ ${specs.length} specs encontradas`);
            return specs;
            
        } catch (error) {
            console.error('❌ Error en getAllSpecs:', error);
            return [];
        }
    }
    
    function searchSpecs(query) {
        console.log(`🔍 Buscando specs: "${query}"`);
        try {
            const allSpecs = getAllSpecs();
            const normalizedQuery = query.toLowerCase().trim();
            
            if (!normalizedQuery) {
                return allSpecs;
            }
            
            const results = allSpecs.filter(spec => {
                const data = spec.data;
                
                // Buscar en varios campos
                const searchFields = [
                    data.customer,
                    data.style,
                    data.colorway,
                    data.nameTeam,
                    data.designer
                ].filter(Boolean).map(f => f.toLowerCase());
                
                return searchFields.some(field => 
                    field.includes(normalizedQuery)
                );
            });
            
            console.log(`✅ ${results.length} resultados encontrados`);
            return results;
            
        } catch (error) {
            console.error('❌ Error en searchSpecs:', error);
            return [];
        }
    }
    
    function createBackup() {
        console.log('💾 Creando backup...');
        try {
            const allSpecs = getAllSpecs();
            const backupData = {
                specs: allSpecs.map(spec => ({
                    key: spec.key,
                    data: spec.data
                })),
                metadata: {
                    created: new Date().toISOString(),
                    totalSpecs: allSpecs.length,
                    appVersion: window.Config?.APP?.VERSION || '1.0.0'
                }
            };
            
            const backupKey = generateStorageKey('backup', 'manual');
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            console.log(`✅ Backup creado: ${backupKey}`);
            showStatus('✅ Backup creado correctamente', 'success');
            
            return backupKey;
            
        } catch (error) {
            console.error('❌ Error en createBackup:', error);
            showStatus('❌ Error al crear backup', 'error');
            return null;
        }
    }
    
    function restoreBackup(backupKey) {
        console.log(`🔄 Restaurando backup: ${backupKey}`);
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            
            if (!backupData || !backupData.specs) {
                throw new Error('Datos de backup inválidos');
            }
            
            // Eliminar specs existentes
            getAllSpecs().forEach(spec => {
                localStorage.removeItem(spec.key);
            });
            
            // Restaurar specs
            let restoredCount = 0;
            backupData.specs.forEach(spec => {
                try {
                    localStorage.setItem(spec.key, JSON.stringify(spec.data));
                    restoredCount++;
                } catch (error) {
                    console.warn(`⚠️ Error al restaurar spec ${spec.key}:`, error);
                }
            });
            
            console.log(`✅ Backup restaurado: ${restoredCount} specs`);
            showStatus(`✅ Backup restaurado (${restoredCount} specs)`, 'success');
            
            return restoredCount;
            
        } catch (error) {
            console.error('❌ Error en restoreBackup:', error);
            showStatus(`❌ Error al restaurar backup: ${error.message}`, 'error');
            return 0;
        }
    }
    
    function exportAllData() {
        console.log('📤 Exportando todos los datos...');
        try {
            const allData = {
                specs: getAllSpecs(),
                storageInfo: calculateStorageUsage(),
                exportDate: new Date().toISOString(),
                appVersion: window.Config?.APP?.VERSION || '1.0.0'
            };
            
            return allData;
            
        } catch (error) {
            console.error('❌ Error en exportAllData:', error);
            throw error;
        }
    }
    
    function importData(importData) {
        console.log('📥 Importando datos...');
        try {
            if (!importData || !importData.specs) {
                throw new Error('Datos de importación inválidos');
            }
            
            let importedCount = 0;
            let skippedCount = 0;
            
            importData.specs.forEach(spec => {
                try {
                    // Verificar si ya existe
                    if (localStorage.getItem(spec.key)) {
                        skippedCount++;
                        return;
                    }
                    
                    // Guardar spec
                    localStorage.setItem(spec.key, JSON.stringify(spec.data));
                    importedCount++;
                    
                } catch (error) {
                    console.warn(`⚠️ Error al importar spec ${spec.key}:`, error);
                    skippedCount++;
                }
            });
            
            console.log(`✅ Datos importados: ${importedCount} nuevos, ${skippedCount} saltados`);
            showStatus(`✅ ${importedCount} specs importadas`, 'success');
            
            return { imported: importedCount, skipped: skippedCount };
            
        } catch (error) {
            console.error('❌ Error en importData:', error);
            showStatus(`❌ Error al importar datos: ${error.message}`, 'error');
            return { imported: 0, skipped: 0 };
        }
    }
    
    function cleanupOldItems() {
        console.log('🧹 Limpiando items antiguos...');
        try {
            const allSpecs = getAllSpecs();
            
            // Si excede el máximo, eliminar las más antiguas
            if (allSpecs.length > CONFIG.MAX_STORAGE_ITEMS) {
                const toDelete = allSpecs
                    .sort((a, b) => {
                        const dateA = new Date(a.metadata.savedAt || 0);
                        const dateB = new Date(b.metadata.savedAt || 0);
                        return dateA - dateB;
                    })
                    .slice(0, allSpecs.length - CONFIG.MAX_STORAGE_ITEMS);
                
                toDelete.forEach(spec => {
                    localStorage.removeItem(spec.key);
                    console.log(`🗑️ Spec antigua eliminada: ${spec.key}`);
                });
                
                console.log(`✅ ${toDelete.length} specs antiguas eliminadas`);
            }
            
            // Limpiar backups antiguos (mantener solo los 5 más recientes)
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes(CONFIG.BACKUP_PREFIX)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        backups.push({
                            key: key,
                            date: data.metadata?.created || '1970-01-01'
                        });
                    } catch (error) {
                        // Eliminar backups corruptos
                        localStorage.removeItem(key);
                    }
                }
            }
            
            if (backups.length > 5) {
                backups
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, backups.length - 5)
                    .forEach(backup => {
                        localStorage.removeItem(backup.key);
                        console.log(`🗑️ Backup antiguo eliminado: ${backup.key}`);
                    });
            }
            
        } catch (error) {
            console.error('❌ Error en cleanupOldItems:', error);
        }
    }
    
    function clearAllStorage() {
        console.log('🗑️ Limpiando todo el almacenamiento...');
        try {
            if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos almacenados?\n\nEsta acción no se puede deshacer.')) {
                // Crear backup antes de eliminar
                createBackup();
                
                // Eliminar solo nuestros datos
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(CONFIG.STORAGE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                }
                
                console.log('✅ Almacenamiento limpiado');
                showStatus('🗑️ Todos los datos han sido eliminados', 'success');
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error en clearAllStorage:', error);
            showStatus('❌ Error al limpiar almacenamiento', 'error');
            return false;
        }
    }
    
    function getStorageStats() {
        console.log('📈 Obteniendo estadísticas de almacenamiento...');
        try {
            const usage = calculateStorageUsage();
            const allSpecs = getAllSpecs();
            
            const stats = {
                usage: usage,
                specs: {
                    total: allSpecs.length,
                    byCustomer: {},
                    byDate: {}
                },
                backups: 0,
                lastBackup: null
            };
            
            // Estadísticas por cliente
            allSpecs.forEach(spec => {
                const customer = spec.data.customer || 'Sin cliente';
                stats.specs.byCustomer[customer] = (stats.specs.byCustomer[customer] || 0) + 1;
                
                // Por fecha (solo fecha, sin hora)
                const date = spec.metadata.savedAt ? 
                    spec.metadata.savedAt.split('T')[0] : 
                    'Desconocida';
                stats.specs.byDate[date] = (stats.specs.byDate[date] || 0) + 1;
            });
            
            // Contar backups
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes(CONFIG.BACKUP_PREFIX)) {
                    stats.backups++;
                    
                    // Obtener el backup más reciente
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const backupDate = data.metadata?.created;
                        if (backupDate && (!stats.lastBackup || backupDate > stats.lastBackup)) {
                            stats.lastBackup = backupDate;
                        }
                    } catch (error) {
                        // Ignorar backups corruptos
                    }
                }
            }
            
            console.log('✅ Estadísticas obtenidas:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Error en getStorageStats:', error);
            return {
                usage: calculateStorageUsage(),
                specs: { total: 0, byCustomer: {}, byDate: {} },
                backups: 0,
                lastBackup: null
            };
        }
    }
    
    // ========== INICIALIZACIÓN ==========
    function init() {
        console.log('🚀 Inicializando StorageManager...');
        
        // Configurar auto-backup
        if (CONFIG.AUTO_BACKUP_INTERVAL > 0) {
            setInterval(() => {
                createBackup();
            }, CONFIG.AUTO_BACKUP_INTERVAL);
            
            console.log(`⏰ Auto-backup configurado cada ${CONFIG.AUTO_BACKUP_INTERVAL / 60000} minutos`);
        }
        
        // Limpieza inicial
        setTimeout(() => {
            cleanupOldItems();
        }, 3000);
        
        console.log('✅ StorageManager inicializado');
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales de specs
        saveSpec,
        loadSpec,
        deleteSpec,
        getAllSpecs,
        searchSpecs,
        
        // Funciones de backup/restore
        createBackup,
        restoreBackup,
        
        // Funciones de import/export
        exportAllData,
        importData,
        
        // Gestión de almacenamiento
        cleanupOldItems,
        clearAllStorage,
        getStorageStats,
        calculateStorageUsage,
        
        // Utilidades
        generateStorageKey,
        compressData,
        decompressData,
        validateData,
        
        // Inicialización
        init
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.StorageManager = StorageManager;

console.log('✅ Módulo StorageManager completamente cargado');

// Inicialización automática
setTimeout(() => {
    if (window.StorageManager && window.StorageManager.init) {
        window.StorageManager.init();
    }
}, 1000);
