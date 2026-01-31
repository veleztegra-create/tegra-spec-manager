// js/modules/export/excel-exporter.js
console.log('🔄 Cargando módulo ExcelExporter...');

const ExcelExporter = (function() {
    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        FILE_PREFIX: 'Calculadora_',
        TEMPLATE: {
            headers: [
                'Area', 'Designer', 'Customer', 'Division', 'SEASON',
                '', '#Folder/SPEC', '', '', '', '', '', '', '', '', '', '', '', '', '',
                'TEAM', '', '', 'COLORWAY', '', 'PLACEMENTS', '', 'SPEC #', '#SCREEEN', 
                'NO. COLORES', 'Stations', 'setup', 'size', 'W', 'H', 'TYPE OF ART', 'INK TYPE'
            ],
            columnWidths: [
                12, 12, 15, 15, 8, 3, 12, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                25, 3, 3, 15, 3, 12, 3, 8, 10, 12, 10, 3, 3, 10, 12, 10, 12
            ],
            defaultValues: {
                area: 'Development',
                division: 'NFL / jersey',
                artType: 'Vector',
                defaultInk: 'WB MAGNA'
            }
        }
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    function extractDimensions(placement) {
        console.log('📏 Extrayendo dimensiones para Excel...');
        try {
            let width = '15.34';
            let height = '12';
            
            // Intentar obtener de los campos específicos
            if (placement.width && placement.height) {
                width = placement.width.replace('"', '');
                height = placement.height.replace('"', '');
            } else if (placement.dimensions) {
                // Extraer del texto de dimensiones
                const dimMatch = placement.dimensions.match(/(\d+\.?\d*)\s*["']?\s*[xX×]\s*(\d+\.?\d*)/);
                if (dimMatch) {
                    width = dimMatch[1];
                    height = dimMatch[2];
                }
            }
            
            console.log(`✅ Dimensiones extraídas: ${width}" x ${height}"`);
            return { width, height };
        } catch (error) {
            console.error('❌ Error en extractDimensions:', error);
            return { width: '15.34', height: '12' };
        }
    }
    
    function getInkTypeForExcel(inkType) {
        console.log('🎨 Convirtiendo tipo de tinta para Excel...');
        try {
            const inkMap = {
                'WATER': 'WB MAGNA',
                'PLASTISOL': 'PLASTISOL',
                'SILICONE': 'SILICONE'
            };
            
            const result = inkMap[inkType] || CONFIG.TEMPLATE.defaultValues.defaultInk;
            console.log(`✅ Tipo de tinta: ${inkType} → ${result}`);
            return result;
        } catch (error) {
            console.error('❌ Error en getInkTypeForExcel:', error);
            return CONFIG.TEMPLATE.defaultValues.defaultInk;
        }
    }
    
    function formatFileName(style, folder) {
        console.log('📄 Formateando nombre de archivo...');
        try {
            const safeStyle = style ? style.replace(/[^\w\s-]/g, '').substring(0, 30) : 'Spec';
            const safeFolder = folder || '00000';
            return `${CONFIG.FILE_PREFIX}${safeStyle}_${safeFolder}.xlsx`;
        } catch (error) {
            console.error('❌ Error en formatFileName:', error);
            return `${CONFIG.FILE_PREFIX}Backup_${Date.now()}.xlsx`;
        }
    }
    
    function showStatus(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        if (window.AppManager && window.AppManager.showStatus) {
            window.AppManager.showStatus(message, type);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    function exportToExcel() {
        console.log('📊 Exportando a Excel...');
        try {
            // Verificar que XLSX esté disponible
            if (typeof XLSX === 'undefined') {
                showStatus('❌ Error: Biblioteca Excel no cargada', 'error');
                return false;
            }
            
            // Recopilar datos
            const data = collectExcelData();
            
            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();
            
            // Crear hoja de trabajo
            const ws = createWorksheet(data);
            
            // Aplicar formato
            applyExcelFormatting(ws);
            
            // Agregar hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
            
            // Generar nombre de archivo
            const fileName = formatFileName(data.style, data.folder);
            
            // Descargar archivo
            XLSX.writeFile(wb, fileName);
            
            showStatus(`📊 Spec Excel generada: ${fileName}`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error al exportar Excel:', error);
            showStatus(`❌ Error al generar Spec Excel: ${error.message}`, 'error');
            return false;
        }
    }
    
    function collectExcelData() {
        console.log('📦 Recopilando datos para Excel...');
        try {
            return {
                designer: document.getElementById('designer')?.value || '',
                customer: document.getElementById('customer')?.value || '',
                season: document.getElementById('season')?.value || '',
                folder: document.getElementById('folder-num')?.value || '',
                nameTeam: document.getElementById('name-team')?.value || '',
                colorway: document.getElementById('colorway')?.value || '',
                style: document.getElementById('style')?.value || ''
            };
        } catch (error) {
            console.error('❌ Error en collectExcelData:', error);
            return {};
        }
    }
    
    function createWorksheet(data) {
        console.log('📋 Creando hoja de trabajo...');
        try {
            const rows = [];
            
            // Obtener placements
            let placements = [];
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                placements = window.PlacementsCore.getAllPlacements();
            } else {
                placements = window.globalPlacements || [];
            }
            
            if (placements && Array.isArray(placements) && placements.length > 0) {
                placements.forEach((placement, index) => {
                    const placementType = placement.type.includes('CUSTOM:') 
                        ? placement.type.replace('CUSTOM: ', '').toLowerCase()
                        : placement.type.toLowerCase();
                    
                    const screenCount = placement.colors ? placement.colors.length : 0;
                    const colorCount = screenCount;
                    const stationCount = colorCount > 0 ? (colorCount * 3 - 2) : 0;
                    
                    // Obtener dimensiones
                    const dimensions = extractDimensions(placement);
                    
                    // Obtener tipo de tinta
                    const inkType = getInkTypeForExcel(placement.inkType);
                    
                    // Crear fila
                    const row = [
                        CONFIG.TEMPLATE.defaultValues.area,                           
                        data.designer,                          
                        data.customer,                          
                        CONFIG.TEMPLATE.defaultValues.division,                         
                        data.season,                            
                        '',                                     
                        data.folder,                            
                        '', '', '', '', '', '', '', '', '', '', '', '', '', 
                        data.nameTeam,                          
                        '', '',                                 
                        data.colorway,                          
                        '',                                     
                        placementType,                          
                        '',                                     
                        `SPEC ${index + 1}`,                    
                        screenCount,                            
                        colorCount,                             
                        stationCount,                           
                        1,                                      
                        'L',                                    
                        `${dimensions.width}"`,                      
                        `${dimensions.height}"`,                       
                        CONFIG.TEMPLATE.defaultValues.artType,                                
                        inkType                                 
                    ];
                    
                    rows.push(row);
                    console.log(`✅ Fila ${index + 1} creada para ${placementType}`);
                });
            } else {
                // Fila por defecto si no hay placements
                const defaultRow = [
                    CONFIG.TEMPLATE.defaultValues.area,      
                    data.designer,      
                    data.customer,      
                    CONFIG.TEMPLATE.defaultValues.division,     
                    data.season,        
                    '',                 
                    data.folder,        
                    '', '', '', '', '', '', '', '', '', '', '', '', '', 
                    data.nameTeam,      
                    '', '',             
                    data.colorway,      
                    '',                 
                    'front',            
                    '',                 
                    'SPEC 1',           
                    0,                  
                    0,                  
                    0,                  
                    1,                  
                    'L',                
                    '15.34"',           
                    '12"',              
                    CONFIG.TEMPLATE.defaultValues.artType,           
                    CONFIG.TEMPLATE.defaultValues.defaultInk          
                ];
                
                rows.push(defaultRow);
                console.log('✅ Fila por defecto creada');
            }
            
            // Crear hoja con cabeceras y datos
            const worksheet = XLSX.utils.aoa_to_sheet([CONFIG.TEMPLATE.headers, ...rows]);
            
            // Configurar anchos de columna
            worksheet['!cols'] = CONFIG.TEMPLATE.columnWidths.map(width => ({ wch: width }));
            
            console.log(`✅ Hoja de trabajo creada con ${rows.length + 1} filas`);
            return worksheet;
            
        } catch (error) {
            console.error('❌ Error en createWorksheet:', error);
            throw error;
        }
    }
    
    function applyExcelFormatting(ws) {
        console.log('🎨 Aplicando formato a Excel...');
        try {
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            
            // Formatear cabeceras
            for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[cellAddress]) continue;
                
                if (CONFIG.TEMPLATE.headers[C] && CONFIG.TEMPLATE.headers[C] !== '') {
                    ws[cellAddress].s = {
                        font: { 
                            bold: true, 
                            color: { rgb: "FFFFFF" },
                            sz: 11
                        },
                        fill: { 
                            fgColor: { rgb: "4472C4" },
                            patternType: "solid"
                        },
                        alignment: { 
                            horizontal: "center", 
                            vertical: "center",
                            wrapText: true
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                }
            }
            
            // Formatear filas de datos
            for (let R = 1; R <= headerRange.e.r; ++R) {
                for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellAddress]) continue;
                    
                    // Formato base para celdas de datos
                    ws[cellAddress].s = ws[cellAddress].s || {};
                    ws[cellAddress].s.font = { sz: 10 };
                    ws[cellAddress].s.alignment = { vertical: "center" };
                    
                    // Bordes para todas las celdas
                    ws[cellAddress].s.border = {
                        top: { style: "thin", color: { rgb: "CCCCCC" } },
                        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                        left: { style: "thin", color: { rgb: "CCCCCC" } },
                        right: { style: "thin", color: { rgb: "CCCCCC" } }
                    };
                    
                    // Resaltar columnas importantes
                    if ([0, 2, 6, 20, 23, 25, 27, 28, 29, 30, 33, 34, 35, 36].includes(C)) {
                        ws[cellAddress].s.fill = { 
                            fgColor: { rgb: "F2F2F2" },
                            patternType: "solid"
                        };
                    }
                }
            }
            
            // Congelar paneles (cabecera)
            ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomRight" };
            
            console.log('✅ Formato aplicado correctamente');
            
        } catch (error) {
            console.error('❌ Error en applyExcelFormatting:', error);
        }
    }
    
    function processExcelData(worksheet, sheetName = '') {
        console.log(`🔍 Procesando datos de Excel: ${sheetName}`);
        try {
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            const extracted = {};

            const isSWOSheet = sheetName.includes('SWO');
            const isPPSSheet = sheetName.includes('PPS');
            const isProtoSheet = sheetName.includes('Proto');

            if (isSWOSheet || isPPSSheet) {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    if (!row || row.length < 2) continue;

                    const label = String(row[1] || '').trim();
                    const val = String(row[2] || '').trim();

                    if (label && val) {
                        if (label.includes('CUSTOMER:')) {
                            extracted.customer = val;
                            if (val.toUpperCase().includes('GEAR FOR SPORT') || 
                                val.toUpperCase().includes('GEARFORSPORT')) {
                                extracted.isGearForSport = true;
                            }
                        }
                        else if (label.includes('STYLE:')) {
                            extracted.style = val;
                            extracted.team = window.Utils ? window.Utils.detectTeamFromStyle(val) : '';
                            if (extracted.isGearForSport && window.Utils) {
                                extracted.gender = window.Utils.extractGenderFromStyle(val);
                            }
                        }
                        else if (label.includes('COLORWAY')) {
                            extracted.colorway = val;
                            if (extracted.isGearForSport && val.includes('-')) {
                                const normalizedColor = window.Utils ? 
                                    window.Utils.normalizeGearForSportColor(val) : val;
                                if (normalizedColor !== val) {
                                    extracted.colorway = normalizedColor;
                                }
                            }
                        }
                        else if (label.includes('SEASON:')) extracted.season = val;
                        else if (label.includes('PATTERN')) extracted.pattern = val;
                        else if (label.includes('P.O.')) extracted.po = val;
                        else if (label.includes('SAMPLE TYPE')) extracted.sample = val;
                        else if (label.includes('DATE:')) extracted.date = val;
                        else if (label.includes('REQUESTED BY:')) extracted.requestedBy = val;
                        else if (label.includes('TEAM:')) extracted.team = val;
                        else if (label.includes('GENDER:')) extracted.gender = val;
                    }
                }
            } else {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    if (!row) continue;
                    
                    for (let j = 0; j < row.length; j++) {
                        const cell = String(row[j] || '').trim();
                        
                        if (cell.includes('CUSTOMER:')) {
                            extracted.customer = String(row[j + 1] || '').trim();
                        } else if (cell.includes('STYLE:')) {
                            extracted.style = String(row[j + 1] || '').trim();
                            extracted.team = window.Utils ? window.Utils.detectTeamFromStyle(extracted.style) : '';
                        } else if (cell.includes('COLORWAY')) {
                            extracted.colorway = String(row[j + 1] || '').trim();
                        } else if (cell.includes('SEASON:')) {
                            extracted.season = String(row[j + 1] || '').trim();
                        } else if (cell.includes('PATTERN')) {
                            extracted.pattern = String(row[j + 1] || '').trim();
                        } else if (cell.includes('P.O.')) {
                            extracted.po = String(row[j + 1] || '').trim();
                        } else if (cell.includes('SAMPLE TYPE') || cell.includes('SAMPLE:')) {
                            extracted.sample = String(row[j + 1] || '').trim();
                        }
                    }
                }
            }

            // Establecer valores en el formulario
            if (extracted.customer) document.getElementById('customer').value = extracted.customer;
            if (extracted.style) document.getElementById('style').value = extracted.style;
            if (extracted.colorway) document.getElementById('colorway').value = extracted.colorway;
            if (extracted.season) document.getElementById('season').value = extracted.season;
            if (extracted.pattern) document.getElementById('pattern').value = extracted.pattern;
            if (extracted.po) document.getElementById('po').value = extracted.po;
            if (extracted.sample) document.getElementById('sample-type').value = extracted.sample;
            if (extracted.team) document.getElementById('name-team').value = extracted.team;

            if (extracted.gender) {
                document.getElementById('gender').value = extracted.gender;
            } else if (extracted.style && window.Utils) {
                const detectedGender = window.Utils.extractGenderFromStyle(extracted.style);
                if (detectedGender) {
                    document.getElementById('gender').value = detectedGender;
                }
            }

            // Actualizar logo del cliente
            if (window.ClientManager && window.ClientManager.updateClientLogo) {
                window.ClientManager.updateClientLogo();
            } else if (window.updateClientLogo) {
                window.updateClientLogo();
            }
            
            showStatus(`✅ "${sheetName || 'hoja'}" procesado - Género: ${extracted.gender || 'No detectado'}`, 'success');
            return extracted;
            
        } catch (error) {
            console.error('❌ Error en processExcelData:', error);
            showStatus('❌ Error leyendo el archivo Excel', 'error');
            return {};
        }
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        exportToExcel,
        processExcelData,
        
        // Funciones auxiliares
        collectExcelData,
        createWorksheet,
        applyExcelFormatting,
        
        // Utilidades
        extractDimensions,
        getInkTypeForExcel,
        formatFileName
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.ExcelExporter = ExcelExporter;
window.exportToExcel = ExcelExporter.exportToExcel; // Para compatibilidad
window.processExcelData = ExcelExporter.processExcelData; // Para compatibilidad

console.log('✅ Módulo ExcelExporter completamente cargado');
