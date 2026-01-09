// fixes.js - Correcciones para Tegra Spec Manager CORREGIDO
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Aplicando correcciones...');
    
    // 1. Asegurar que Utils esté disponible
    if (typeof Utils === 'undefined') {
        console.error('Utils no está disponible. Cargando versión mínima...');
        
        // Versión mínima de Utils
        window.Utils = {
            getInkPreset: function(inkType = 'WATER') {
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
            
            isMetallicColor: function(colorName) {
                if (!colorName) return false;
                const upperColor = colorName.toUpperCase();
                
                if (upperColor.match(/(8[7-9][0-9]\s*C?)/i)) return true;
                
                const METALLIC_CODES = ["871C", "872C", "873C", "874C", "875C", "876C", "877C", "METALLIC", "GOLD", "SILVER", "BRONZE", "METÁLICO", "METALIC"];
                
                for (const metallicCode of METALLIC_CODES) {
                    if (upperColor.includes(metallicCode)) return true;
                }
                
                return false;
            }
        };
    }
    
    // 2. Sobrescribir updateClientLogo para detectar GFS
    if (typeof window.updateClientLogo === 'function') {
        const originalUpdateClientLogo = window.updateClientLogo;
        window.updateClientLogo = function() {
            const customer = document.getElementById('customer');
            if (!customer) return;
            
            const customerValue = customer.value.toUpperCase().trim();
            const logoElement = document.getElementById('logoCliente');
            if (!logoElement) return;
            
            let logoUrl = '';
            
            // Detectar Gear for Sport con todas sus variaciones
            const gfsVariations = ['GEAR FOR SPORT', 'GEARFORSPORT', 'GFS', 'G.F.S.', 'G.F.S', 'GEAR', 'G-F-S'];
            const isGFS = gfsVariations.some(variation => customerValue.includes(variation));
            
            if (customerValue.includes('NIKE') || customerValue.includes('NIQUE')) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Nike-Logotipo-PNG-Photo.png';
            } else if (customerValue.includes('FANATICS') || customerValue.includes('FANATIC')) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/Fanatics_company_logo.svg.png';
            } else if (customerValue.includes('ADIDAS')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1280px-Adidas_Logo.svg.png';
            } else if (customerValue.includes('PUMA')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Puma_Logo.svg/1280px-Puma_Logo.svg.png';
            } else if (customerValue.includes('UNDER ARMOUR') || customerValue.includes('UA')) {
                logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/1280px-Under_armour_logo.svg.png';
            } else if (isGFS) {
                logoUrl = 'https://raw.githubusercontent.com/veleztegra-create/costos/refs/heads/main/SVG.png';
            }
            
            if (logoUrl) {
                logoElement.src = logoUrl;
                logoElement.style.display = 'block';
            } else {
                logoElement.style.display = 'none';
            }
        };
    }
    
    // 3. Mejorar checkForSpecialtiesInColors
    if (typeof window.checkForSpecialtiesInColors === 'function') {
        const originalCheckForSpecialties = window.checkForSpecialtiesInColors;
        window.checkForSpecialtiesInColors = function(placementId) {
            const placement = window.placements.find(p => p.id === placementId);
            if (!placement) return [];
            
            let specialties = [];
            
            placement.colors.forEach(color => {
                if (color.val) {
                    const colorVal = color.val.toUpperCase();
                    
                    // Detectar HIGH DENSITY
                    if (colorVal.includes('HD') || colorVal.includes('HIGH DENSITY')) {
                        if (!specialties.includes('HIGH DENSITY')) {
                            specialties.push('HIGH DENSITY');
                        }
                    }
                    
                    // Detectar metálicos usando Utils
                    if (window.Utils && window.Utils.isMetallicColor(colorVal)) {
                        if (!specialties.includes('METALLIC')) {
                            specialties.push('METALLIC');
                        }
                    }
                    
                    // Detectar FOIL
                    if (colorVal.includes('FOIL')) {
                        if (!specialties.includes('FOIL')) {
                            specialties.push('FOIL');
                        }
                    }
                }
            });
            
            // Actualizar el campo de specialties
            const specialtiesField = document.getElementById(`specialties-${placementId}`);
            if (specialtiesField) {
                specialtiesField.value = specialties.join(', ');
                if (typeof window.updatePlacementField === 'function') {
                    window.updatePlacementField(placementId, 'specialties', specialtiesField.value);
                }
            }
            
            return specialties;
        };
    }
    
    // 4. Función para agregar campo SPECIALTIES
    function addSpecialtiesField(placementId) {
        const specialtiesField = document.getElementById(`specialties-${placementId}`);
        if (specialtiesField) return; // Ya existe
        
        // Buscar la sección de condiciones
        const conditionsCard = document.querySelector(`#placement-section-${placementId} .card:nth-child(3)`);
        if (!conditionsCard) return;
        
        const formGrid = conditionsCard.querySelector('.form-grid');
        if (!formGrid) return;
        
        // Crear campo SPECIALTIES
        const specialtiesHtml = `
            <div class="form-group">
                <label class="form-label">SPECIALTIES:</label>
                <input type="text" 
                       id="specialties-${placementId}"
                       class="form-control placement-specialties"
                       placeholder="Detectado automáticamente..."
                       value=""
                       readonly
                       title="Detectado automáticamente de los colores">
            </div>
        `;
        
        // Insertar después del campo de tiempo
        const timeField = conditionsCard.querySelector('.placement-time');
        if (timeField && timeField.parentElement) {
            timeField.parentElement.insertAdjacentHTML('afterend', specialtiesHtml);
        } else {
            formGrid.insertAdjacentHTML('beforeend', specialtiesHtml);
        }
    }
    
    // 5. Parchear renderPlacementHTML para agregar SPECIALTIES
    if (typeof window.renderPlacementHTML === 'function') {
        const originalRenderPlacementHTML = window.renderPlacementHTML;
        window.renderPlacementHTML = function(placement) {
            // Llamar a la función original
            originalRenderPlacementHTML.call(this, placement);
            
            // Agregar campo SPECIALTIES después de un breve delay
            setTimeout(() => {
                addSpecialtiesField(placement.id);
                
                // Actualizar el título para que solo muestre el tipo
                const title = document.querySelector(`#placement-section-${placement.id} .placement-title span`);
                if (title) {
                    const displayType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    title.textContent = displayType;
                }
                
                // Actualizar "Colores para X"
                const colorTitle = document.querySelector(`#placement-section-${placement.id} .card-title`);
                if (colorTitle && colorTitle.textContent.includes('Colores para')) {
                    const displayType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '')
                        : placement.type;
                    colorTitle.textContent = `Colores para ${displayType}`;
                }
            }, 100);
        };
    }
    
    // 6. Reorganizar botones de acción (CORREGIDO - sin :contains)
    function reorganizeButtons() {
        setTimeout(() => {
            const actionButtons = document.querySelector('.card.no-print .card-body');
            if (!actionButtons) return;
            
            // Encontrar botones por su contenido de texto
            const buttons = actionButtons.querySelectorAll('button');
            let specButton = null;
            let pdfButton = null;
            
            buttons.forEach(button => {
                const text = button.textContent.trim();
                if (text.includes('Descargar Calculadora') || text.includes('Descargar Spec')) {
                    specButton = button;
                    button.textContent = ' Descargar Spec';
                    button.classList.remove('btn-warning');
                    button.classList.add('btn-primary');
                    button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                    button.style.borderColor = '#0056b3';
                } else if (text.includes('Exportar PDF')) {
                    pdfButton = button;
                    button.textContent = ' Exportar PDF';
                    button.classList.remove('btn-warning');
                    button.classList.add('btn-success');
                }
            });
            
            // Reordenar si encontramos ambos botones
            if (specButton && pdfButton) {
                // Mover PDF después de Spec
                specButton.parentNode.insertBefore(pdfButton, specButton.nextSibling);
            }
        }, 1500);
    }
    
    // 7. Corregir duplicatePlacement
    if (typeof window.duplicatePlacement === 'function') {
        const originalDuplicatePlacement = window.duplicatePlacement;
        window.duplicatePlacement = function(placementId) {
            const original = window.placements.find(p => p.id === placementId);
            if (!original) return;
            
            const newId = Date.now();
            const displayType = original.type.includes('CUSTOM:') 
                ? original.type.replace('CUSTOM: ', '')
                : original.type;
            
            // Crear copia sin "(Copia)" en el nombre
            const duplicate = JSON.parse(JSON.stringify(original));
            duplicate.id = newId;
            duplicate.name = displayType; // Solo el tipo, sin "Placement -" ni "(Copia)"
            
            // Asegurar que specialties esté definido
            if (!duplicate.specialties) duplicate.specialties = '';
            
            window.placements.push(duplicate);
            
            // Renderizar
            if (typeof window.renderPlacementHTML === 'function') {
                window.renderPlacementHTML(duplicate);
            }
            
            if (typeof window.updatePlacementsTabs === 'function') {
                window.updatePlacementsTabs();
            }
            
            if (typeof window.showPlacement === 'function') {
                window.showPlacement(newId);
            }
            
            if (typeof window.showStatus === 'function') {
                window.showStatus('✅ Placement duplicado correctamente');
            }
            
            return newId;
        };
    }
    
    // 8. Aplicar correcciones después de que todo esté cargado
    setTimeout(() => {
        reorganizeButtons();
        
        // Agregar SPECIALTIES a placements existentes
        if (window.placements && Array.isArray(window.placements)) {
            window.placements.forEach(placement => {
                addSpecialtiesField(placement.id);
            });
        }
        
        console.log('✅ Correcciones aplicadas correctamente');
    }, 2000);
});