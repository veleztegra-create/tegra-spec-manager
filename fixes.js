// fixes.js - VERSIÓN CORREGIDA
(function() {
    console.log('🔧 Cargando fixes...');
    
    // Lista de dependencias requeridas
    const REQUIRED_DEPENDENCIES = [
        'Config', 'Utils', 'TeamsConfig', 'errorHandler'
    ];
    
    // Función mejorada para verificar dependencias
    function checkDependencies() {
        const missing = [];
        const available = [];
        
        REQUIRED_DEPENDENCIES.forEach(dep => {
            if (typeof window[dep] === 'undefined') {
                missing.push(dep);
            } else {
                available.push(dep);
            }
        });
        
        return { missing, available };
    }
    
    // Intentar aplicar fixes con múltiples intentos
    function tryApplyFixes(maxAttempts = 10, interval = 500) {
        let attempts = 0;
        
        const intervalId = setInterval(() => {
            attempts++;
            const { missing, available } = checkDependencies();
            
            console.log(`🔍 Intento ${attempts}/${maxAttempts} - Disponibles: ${available.join(', ') || 'ninguna'}`);
            
            if (missing.length === 0 || attempts >= maxAttempts) {
                clearInterval(intervalId);
                
                if (missing.length === 0) {
                    console.log('✅ Todas las dependencias cargadas, aplicando fixes...');
                    applyFixes();
                } else {
                    console.warn(`⚠️ Algunas dependencias faltan después de ${maxAttempts} intentos:`, missing);
                    console.log('🔄 Aplicando fixes disponibles de todos modos...');
                    applyFixes();
                }
            }
        }, interval);
    }
    
    // Función principal de fixes
    function applyFixes() {
        try {
            console.log('🔨 Aplicando correcciones...');
            
            // 1. Fix para nombres de placements
            if (typeof window !== 'undefined') {
                window.updateCustomPlacement = window.updateCustomPlacement || function(id, value) {
                    const newName = value.trim() || "Nuevo Placement";
                    console.log(`Actualizando placement ${id} a: ${newName}`);
                    
                    // Buscar y actualizar en el DOM
                    const section = document.getElementById(`placement-section-${id}`);
                    if (!section) return;
                    
                    // Actualizar título principal
                    const mainTitle = section.querySelector('.placement-title span');
                    if (mainTitle) mainTitle.textContent = newName;
                    
                    // Actualizar otros títulos
                    const internalTitles = section.querySelectorAll('h3.card-title, h4');
                    internalTitles.forEach(t => {
                        if (t.innerText.includes('Colores') || t.innerText.includes('Tintas')) {
                            t.innerHTML = `<i class="fas fa-palette"></i> Colores de ${newName}`;
                        }
                        if (t.innerText.includes('Secuencia')) {
                            t.innerHTML = `<i class="fas fa-list-ol"></i> Secuencia de ${newName}`;
                        }
                    });
                    
                    // Actualizar tab
                    const tab = document.querySelector(`.placement-tab[data-placement-id="${id}"], .tab-btn[onclick*="${id}"]`);
                    if (tab) {
                        const icon = tab.querySelector('i') ? tab.querySelector('i').outerHTML : '';
                        tab.innerHTML = `${icon} ${newName}`;
                    }
                };
                
                console.log('✅ Fix para nombres de placements aplicado');
            }
            
            // 2. Fix para jsPDF si está disponible
            if (typeof window.jspdf !== 'undefined') {
                const originalDocText = window.jspdf.jsPDF.prototype.text;
                window.jspdf.jsPDF.prototype.text = function(text, x, y, options) {
                    if (options && options.align) {
                        const valid = ["left", "center", "right", "justify"];
                        if (!valid.includes(options.align)) {
                            options.align = "left";
                        }
                    }
                    return originalDocText.apply(this, arguments);
                };
                console.log('✅ Fix para alineación de PDF aplicado');
            }
            
            // 3. Fix para asegurar que Utils exista
            if (typeof window.Utils === 'undefined') {
                window.Utils = window.Utils || {};
                console.log('⚠️ Utils no estaba definido, creando objeto vacío');
            }
            
            // 4. Fix para client logos
            if (typeof window.updateClientLogo === 'undefined') {
                window.updateClientLogo = function() {
                    const customer = document.getElementById('customer');
                    const logoElement = document.getElementById('logoCliente');
                    
                    if (!customer || !logoElement) return;
                    
                    const customerValue = customer.value.toUpperCase().trim();
                    
                    // Logos básicos como fallback
                    if (customerValue.includes('NIKE')) {
                        logoElement.src = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
                        logoElement.style.display = 'block';
                    } else if (customerValue.includes('FANATICS')) {
                        logoElement.src = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
                        logoElement.style.display = 'block';
                    } else {
                        logoElement.style.display = 'none';
                    }
                };
                console.log('✅ Fix para updateClientLogo aplicado');
            }
            
            console.log('🎉 Todos los fixes aplicados correctamente');
            
        } catch (error) {
            console.error('❌ Error aplicando fixes:', error);
        }
    }
    
    // Iniciar el proceso
    console.log('⏳ Esperando dependencias...');
    tryApplyFixes(15, 300); // 15 intentos, cada 300ms
    
})();
