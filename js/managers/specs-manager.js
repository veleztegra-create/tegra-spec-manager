// js/modules/data/specs-manager.js - VERSIÓN CORREGIDA
console.log('📋 Módulo SpecsManager cargando...');

// Verificar si ya existe para evitar redeclaración
if (!window.SpecsManager) {
    window.SpecsManager = (function() {
        let allSpecs = [];
        let currentSpec = null;
        
        const SpecsManager = {
            // ========== INICIALIZACIÓN ==========
            init: function() {
                console.log('🚀 Inicializando SpecsManager...');
                
                // Cargar specs existentes
                this.loadAllSpecs();
                
                // Configurar auto-guardado
                setInterval(() => {
                    if (currentSpec) {
                        this.saveSpec(currentSpec);
                    }
                }, 120000); // 2 minutos
                
                console.log('⏰ Auto-guardado configurado cada 2 minutos');
                console.log('✅ SpecsManager inicializado');
                
                return this;
            },
            
            // ========== GESTIÓN DE SPECS ==========
            createNewSpec: function(specData) {
                const newSpec = {
                    id: 'spec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    status: 'draft',
                    ...specData
                };
                
                currentSpec = newSpec;
                allSpecs.push(newSpec);
                
                console.log('📄 Nueva spec creada:', newSpec.id);
                this.saveToStorage();
                
                return newSpec;
            },
            
            saveSpec: function(spec) {
                if (!spec) {
                    console.warn('⚠️ No hay spec para guardar');
                    return false;
                }
                
                spec.updated = new Date().toISOString();
                
                // Buscar y actualizar o agregar
                const index = allSpecs.findIndex(s => s.id === spec.id);
                if (index > -1) {
                    allSpecs[index] = spec;
                } else {
                    allSpecs.push(spec);
                }
                
                currentSpec = spec;
                
                console.log('💾 Spec guardada:', spec.id);
                this.saveToStorage();
                this.updateSavedSpecsList();
                
                return true;
            },
            
            deleteSpec: function(specId) {
                const index = allSpecs.findIndex(s => s.id === specId);
                if (index > -1) {
                    allSpecs.splice(index, 1);
                    
                    if (currentSpec && currentSpec.id === specId) {
                        currentSpec = null;
                    }
                    
                    console.log('🗑️ Spec eliminada:', specId);
                    this.saveToStorage();
                    this.updateSavedSpecsList();
                    
                    return true;
                }
                
                return false;
            },
            
            getSpec: function(specId) {
                return allSpecs.find(s => s.id === specId) || null;
            },
            
            getAllSpecs: function() {
                return [...allSpecs];
            },
            
            getActiveSpecs: function() {
                return allSpecs.filter(spec => spec.status !== 'archived');
            },
            
            getCurrentSpec: function() {
                return currentSpec;
            },
            
            setCurrentSpec: function(spec) {
                currentSpec = spec;
                return this;
            },
            
            // ========== STORAGE ==========
            saveToStorage: function() {
                try {
                    localStorage.setItem('tegra-specs', JSON.stringify(allSpecs));
                    return true;
                } catch (error) {
                    console.error('❌ Error al guardar specs:', error);
                    return false;
                }
            },
            
            loadAllSpecs: function() {
                try {
                    const saved = localStorage.getItem('tegra-specs');
                    if (saved) {
                        allSpecs = JSON.parse(saved);
                        console.log(`📂 ${allSpecs.length} specs cargadas desde storage`);
                    } else {
                        allSpecs = [];
                        console.log('📂 No hay specs guardadas');
                    }
                    
                    // Actualizar lista en UI
                    setTimeout(() => this.updateSavedSpecsList(), 500);
                    
                    return allSpecs;
                } catch (error) {
                    console.error('❌ Error al cargar specs:', error);
                    allSpecs = [];
                    return [];
                }
            },
            
            // ========== UI UPDATES ==========
            updateSavedSpecsList: function() {
                // Esperar a que el DOM esté listo
                setTimeout(() => {
                    const savedSpecsList = document.getElementById('saved-specs-list');
                    
                    if (!savedSpecsList) {
                        console.warn('⚠️ Elemento saved-specs-list no encontrado, reintentando en 1 segundo...');
                        setTimeout(() => this.updateSavedSpecsList(), 1000);
                        return;
                    }
                    
                    if (allSpecs.length === 0) {
                        savedSpecsList.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px;"></i>
                                <h3>No hay specs guardadas</h3>
                                <p>Crea tu primera spec en la pestaña "Crear Spec"</p>
                            </div>
                        `;
                        return;
                    }
                    
                    let html = `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    `;
                    
                    allSpecs.forEach(spec => {
                        const isCurrent = currentSpec && currentSpec.id === spec.id;
                        const specDate = new Date(spec.updated || spec.created);
                        
                        html += `
                            <div class="spec-card" style="
                                background: ${isCurrent ? 'var(--gray-dark)' : 'var(--bg-card)'};
                                border: 1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-dark)'};
                                border-left: 4px solid ${isCurrent ? 'var(--primary)' : 'var(--border-dark)'};
                                border-radius: var(--radius);
                                padding: 20px;
                                transition: var(--transition);
                                cursor: pointer;
                            " data-spec-id="${spec.id}">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">
                                            ${spec.styleNumber || 'Sin número'}
                                        </h4>
                                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                            ${spec.customer || 'Sin cliente'}
                                        </p>
                                    </div>
                                    ${isCurrent ? '<span class="badge" style="background: var(--primary); color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.7rem;">ACTUAL</span>' : ''}
                                </div>
                                
                                <div style="margin-top: 15px; font-size: 0.85rem; color: var(--text-muted);">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>${specDate.toLocaleDateString()}</span>
                                        <span>${spec.placements ? spec.placements.length : 0} placements</span>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 15px; display: flex; gap: 10px;">
                                    <button class="btn btn-sm btn-primary load-spec-btn" data-spec-id="${spec.id}" style="flex: 1;">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-outline delete-spec-btn" data-spec-id="${spec.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                    savedSpecsList.innerHTML = html;
                    
                    // Configurar event listeners
                    this.setupSpecsListListeners();
                    
                }, 100);
            },
            
            setupSpecsListListeners: function() {
                // Cargar spec al hacer clic en la tarjeta
                document.querySelectorAll('.spec-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (!e.target.closest('button')) {
                            const specId = card.getAttribute('data-spec-id');
                            this.loadSpecIntoEditor(specId);
                        }
                    });
                });
                
                // Botones de editar
                document.querySelectorAll('.load-spec-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const specId = btn.getAttribute('data-spec-id');
                        this.loadSpecIntoEditor(specId);
                    });
                });
                
                // Botones de eliminar
                document.querySelectorAll('.delete-spec-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const specId = btn.getAttribute('data-spec-id');
                        
                        if (confirm('¿Estás seguro de eliminar esta spec?')) {
                            this.deleteSpec(specId);
                        }
                    });
                });
            },
            
            loadSpecIntoEditor: function(specId) {
                const spec = this.getSpec(specId);
                if (!spec) {
                    alert('Spec no encontrada');
                    return;
                }
                
                // Establecer como spec actual
                currentSpec = spec;
                
                // Navegar a la pestaña de creación
                if (window.TabsManager && window.TabsManager.showTab) {
                    window.TabsManager.showTab('spec-creator');
                }
                
                // Cargar datos en el formulario
                this.populateFormWithSpec(spec);
                
                // Cargar placements si existen
                if (spec.placements && window.PlacementsCore) {
                    window.PlacementsCore.loadPlacementsFromSpec(spec);
                }
                
                console.log('📂 Spec cargada en editor:', specId);
                
                // Actualizar UI
                this.updateSavedSpecsList();
                
                // Mostrar mensaje
                if (window.showAppStatus) {
                    window.showAppStatus(`Spec "${spec.styleNumber || specId}" cargada`, 'success');
                }
                
                return spec;
            },
            
            populateFormWithSpec: function(spec) {
                // Mapear campos del formulario
                const fieldMap = {
                    'customer': 'customer',
                    'style': 'styleNumber',
                    'name-team': 'teamName',
                    'gender': 'gender',
                    'folder-num': 'folderNumber',
                    'season': 'season',
                    'designer': 'designer'
                };
                
                for (const [fieldId, specKey] of Object.entries(fieldMap)) {
                    const field = document.getElementById(fieldId);
                    if (field && spec[specKey]) {
                        field.value = spec[specKey];
                    }
                }
                
                // Actualizar logo de cliente si hay ClientManager
                if (spec.customer && window.ClientManager && window.ClientManager.updateClientLogo) {
                    setTimeout(() => {
                        window.ClientManager.updateClientLogo();
                    }, 100);
                }
            },
            
            // ========== IMPORT/EXPORT ==========
            exportSpecToJSON: function(specId) {
                const spec = this.getSpec(specId);
                if (!spec) return null;
                
                const exportData = {
                    ...spec,
                    exportVersion: '1.0',
                    exportDate: new Date().toISOString()
                };
                
                return JSON.stringify(exportData, null, 2);
            },
            
            importSpecFromJSON: function(jsonString) {
                try {
                    const specData = JSON.parse(jsonString);
                    
                    // Validar estructura básica
                    if (!specData.styleNumber && !specData.id) {
                        throw new Error('JSON inválido: falta información de spec');
                    }
                    
                    // Crear nueva spec o actualizar existente
                    const existingIndex = allSpecs.findIndex(s => s.id === specData.id);
                    
                    if (existingIndex > -1) {
                        // Actualizar existente
                        specData.updated = new Date().toISOString();
                        allSpecs[existingIndex] = specData;
                        console.log('📥 Spec actualizada desde import:', specData.id);
                    } else {
                        // Crear nueva
                        specData.id = 'spec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        specData.created = new Date().toISOString();
                        specData.updated = new Date().toISOString();
                        allSpecs.push(specData);
                        console.log('📥 Nueva spec importada:', specData.id);
                    }
                    
                    this.saveToStorage();
                    this.updateSavedSpecsList();
                    
                    return specData.id;
                    
                } catch (error) {
                    console.error('❌ Error al importar spec:', error);
                    throw error;
                }
            },
            
            // ========== STATS ==========
            getStats: function() {
                const total = allSpecs.length;
                const active = allSpecs.filter(s => s.status !== 'archived').length;
                
                // Contar placements totales
                let totalPlacements = 0;
                allSpecs.forEach(spec => {
                    if (spec.placements && Array.isArray(spec.placements)) {
                        totalPlacements += spec.placements.length;
                    }
                });
                
                return {
                    total,
                    active,
                    totalPlacements,
                    lastUpdated: allSpecs.length > 0 
                        ? new Date(Math.max(...allSpecs.map(s => new Date(s.updated).getTime())))
                        : null
                };
            },
            
            // ========== UTILITIES ==========
            clearAllSpecs: function() {
                if (confirm('¿Estás seguro de eliminar TODAS las specs? Esta acción no se puede deshacer.')) {
                    allSpecs = [];
                    currentSpec = null;
                    localStorage.removeItem('tegra-specs');
                    this.updateSavedSpecsList();
                    console.log('🧹 Todas las specs eliminadas');
                    return true;
                }
                return false;
            },
            
            backupSpecs: function() {
                const backup = {
                    specs: allSpecs,
                    backupDate: new Date().toISOString(),
                    count: allSpecs.length
                };
                
                return JSON.stringify(backup, null, 2);
            },
            
            // ========== DEBUG ==========
            debug: function() {
                console.log('🔍 Debug SpecsManager:');
                console.log('- Total specs:', allSpecs.length);
                console.log('- Current spec:', currentSpec ? currentSpec.id : 'Ninguna');
                console.log('- Storage key:', 'tegra-specs');
                
                return {
                    totalSpecs: allSpecs.length,
                    currentSpec: currentSpec,
                    allSpecs: allSpecs
                };
            }
        };
        
        console.log('✅ SpecsManager disponible como window.SpecsManager');
        return SpecsManager;
        
    })();
}
