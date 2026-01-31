// js/modules/export/zip-exporter.js
console.log('🔄 Cargando módulo ZipExporter...');

const ZipExporter = (function() {
    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        ZIP_PREFIX: 'TegraSpec_',
        README_TEMPLATE: `PROYECTO TEGRA SPEC MANAGER
========================

Archivos incluidos:
- {projectName}.json: Datos de la especificación técnica
- {projectName}.pdf: Documento PDF listo para imprimir
{imagesSection}

Total de Placements: {placementCount}
Generado: {generatedDate}
Cliente: {customer}
Estilo: {style}

Para cargar este proyecto:
1. Descomprime el archivo ZIP
2. En Tegra Spec Manager, ve a "Crear Spec"
3. Haz clic en "Cargar Spec" y selecciona el archivo .json
4. Las imágenes de placements se cargarán automáticamente

Placements incluidos: {placementTypes}`,
        COMPRESSION_LEVEL: 6
    };
    
    // ========== FUNCIONES PRIVADAS ==========
    function dataURLToBlob(dataURL) {
        console.log('🔄 Convirtiendo DataURL a Blob...');
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
            
            console.log('✅ DataURL convertida a Blob correctamente');
            return new Blob([u8arr], { type: mime });
        } catch (error) {
            console.error('❌ Error en dataURLToBlob:', error);
            throw error;
        }
    }
    
    function generateProjectName(style, timestamp) {
        console.log('🏷️ Generando nombre de proyecto...');
        try {
            const safeStyle = style ? 
                style.replace(/[^\w\s-]/g, '').substring(0, 30) : 
                'SinEstilo';
            
            const safeTimestamp = timestamp || 
                new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            
            return `${CONFIG.ZIP_PREFIX}${safeStyle}_${safeTimestamp}`;
        } catch (error) {
            console.error('❌ Error en generateProjectName:', error);
            return `${CONFIG.ZIP_PREFIX}Backup_${Date.now()}`;
        }
    }
    
    function createReadmeContent(projectData) {
        console.log('📝 Creando contenido README...');
        try {
            const { 
                projectName, 
                placementCount, 
                customer, 
                style, 
                imageCount 
            } = projectData;
            
            const generatedDate = new Date().toLocaleString('es-ES');
            
            // Obtener tipos de placements
            let placements = [];
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                placements = window.PlacementsCore.getAllPlacements();
            } else {
                placements = window.globalPlacements || [];
            }
            
            const placementTypes = placements.map(p => 
                p.type.includes('CUSTOM:') ? p.type.replace('CUSTOM: ', '') : p.type
            ).join(', ');
            
            // Crear sección de imágenes
            const imagesSection = imageCount > 0 ? 
                `- Imágenes de placements: ${imageCount} archivo(s) de imagen` : 
                '';
            
            // Reemplazar variables en la plantilla
            let readme = CONFIG.README_TEMPLATE
                .replace(/{projectName}/g, projectName)
                .replace(/{placementCount}/g, placementCount)
                .replace(/{generatedDate}/g, generatedDate)
                .replace(/{customer}/g, customer || 'N/A')
                .replace(/{style}/g, style || 'N/A')
                .replace(/{imagesSection}/g, imagesSection)
                .replace(/{placementTypes}/g, placementTypes);
            
            console.log('✅ README creado correctamente');
            return readme;
        } catch (error) {
            console.error('❌ Error en createReadmeContent:', error);
            return 'Error al generar README';
        }
    }
    
    function showStatus(message, type = 'info') {
        console.log(`📢 [${type.toUpperCase()}] ${message}`);
        if (window.AppManager && window.AppManager.showStatus) {
            window.AppManager.showStatus(message, type);
        }
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    async function downloadProjectZip() {
        console.log('📦 Descargando proyecto ZIP...');
        try {
            // Verificar que JSZip esté disponible
            if (typeof JSZip === 'undefined') {
                showStatus('❌ Error: La biblioteca JSZip no está cargada', 'error');
                return false;
            }
            
            showStatus('📦 Generando archivo ZIP...', 'warning');
            
            // Generar nombre del proyecto
            const style = document.getElementById('style')?.value || 'SinEstilo';
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const projectName = generateProjectName(style, timestamp);
            
            // Crear archivo ZIP
            const zip = new JSZip();
            
            // Obtener datos JSON
            const jsonData = await getJsonData();
            if (!jsonData) {
                throw new Error('No se pudieron obtener los datos JSON');
            }
            
            // Agregar archivo JSON
            zip.file(`${projectName}.json`, JSON.stringify(jsonData, null, 2));
            console.log('✅ Archivo JSON agregado al ZIP');
            
            // Intentar agregar PDF si está disponible
            try {
                if (window.PDFExporter && window.PDFExporter.generatePDFBlob) {
                    const pdfBlob = await window.PDFExporter.generatePDFBlob();
                    zip.file(`${projectName}.pdf`, pdfBlob);
                    console.log('✅ Archivo PDF agregado al ZIP');
                } else {
                    console.warn('⚠️ PDFExporter no disponible, omitiendo PDF');
                    zip.file(`${projectName}_PDF_UNAVAILABLE.txt`, 'El archivo PDF no pudo ser generado en este momento.');
                }
            } catch (pdfError) {
                console.warn('⚠️ No se pudo generar PDF para ZIP:', pdfError);
                zip.file(`${projectName}_PDF_ERROR.txt`, `Error al generar PDF: ${pdfError.message}`);
            }
            
            // Agregar imágenes de placements
            const imageCount = await addPlacementImages(zip, projectName);
            
            // Crear y agregar README
            const readmeContent = createReadmeContent({
                projectName,
                placementCount: jsonData.placements?.length || 0,
                customer: jsonData.customer,
                style: jsonData.style,
                imageCount
            });
            zip.file('LEEME.txt', readmeContent);
            console.log('✅ README agregado al ZIP');
            
            // Generar archivo ZIP
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: CONFIG.COMPRESSION_LEVEL }
            });
            
            // Descargar archivo ZIP
            if (typeof saveAs !== 'undefined') {
                saveAs(zipBlob, `${projectName}.zip`);
            } else {
                // Fallback para navegadores que no tienen saveAs
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectName}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            showStatus('📦 Proyecto ZIP descargado correctamente', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error al generar ZIP:', error);
            showStatus(`❌ Error al generar proyecto ZIP: ${error.message}`, 'error');
            return false;
        }
    }
    
    async function getJsonData() {
        console.log('📊 Obteniendo datos JSON...');
        try {
            if (window.SpecsManager && window.SpecsManager.collectData) {
                return window.SpecsManager.collectData();
            }
            
            // Fallback si SpecsManager no está disponible
            const data = {
                customer: document.getElementById('customer')?.value || '',
                style: document.getElementById('style')?.value || '',
                folder: document.getElementById('folder-num')?.value || '',
                colorway: document.getElementById('colorway')?.value || '',
                season: document.getElementById('season')?.value || '',
                pattern: document.getElementById('pattern')?.value || '',
                po: document.getElementById('po')?.value || '',
                sampleType: document.getElementById('sample-type')?.value || '',
                nameTeam: document.getElementById('name-team')?.value || '',
                gender: document.getElementById('gender')?.value || '',
                designer: document.getElementById('designer')?.value || '',
                savedAt: new Date().toISOString(),
                appVersion: window.Config?.APP?.VERSION || '1.0.0'
            };
            
            // Agregar placements
            let placements = [];
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                placements = window.PlacementsCore.getAllPlacements();
            } else {
                placements = window.globalPlacements || [];
            }
            
            data.placements = placements.map(placement => ({
                id: placement.id,
                type: placement.type,
                name: placement.name,
                imageData: placement.imageData,
                colors: placement.colors || [],
                placementDetails: placement.placementDetails,
                dimensions: placement.dimensions,
                width: placement.width,
                height: placement.height,
                temp: placement.temp,
                time: placement.time,
                specialties: placement.specialties,
                specialInstructions: placement.specialInstructions,
                inkType: placement.inkType
            }));
            
            console.log('✅ Datos JSON obtenidos correctamente');
            return data;
            
        } catch (error) {
            console.error('❌ Error en getJsonData:', error);
            throw error;
        }
    }
    
    async function addPlacementImages(zip, projectName) {
        console.log('🖼️ Agregando imágenes de placements...');
        let imageCount = 0;
        
        try {
            // Obtener placements
            let placements = [];
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                placements = window.PlacementsCore.getAllPlacements();
            } else {
                placements = window.globalPlacements || [];
            }
            
            // Procesar cada placement
            for (let i = 0; i < placements.length; i++) {
                const placement = placements[i];
                
                if (placement.imageData && placement.imageData.startsWith('data:')) {
                    try {
                        const imageBlob = dataURLToBlob(placement.imageData);
                        const displayType = placement.type.includes('CUSTOM:') 
                            ? placement.type.replace('CUSTOM: ', '')
                            : placement.type;
                        
                        // Crear nombre de archivo seguro
                        const safeDisplayType = displayType.replace(/[^\w\s-]/g, '_').substring(0, 30);
                        const imageName = `${projectName}_placement${i + 1}_${safeDisplayType}.jpg`;
                        
                        zip.file(imageName, imageBlob);
                        imageCount++;
                        
                        console.log(`✅ Imagen agregada: ${imageName}`);
                    } catch (imgError) {
                        console.warn(`⚠️ No se pudo procesar imagen para placement ${placement.type}:`, imgError);
                    }
                }
            }
            
            console.log(`✅ Total de imágenes agregadas: ${imageCount}`);
            return imageCount;
            
        } catch (error) {
            console.error('❌ Error en addPlacementImages:', error);
            return imageCount;
        }
    }
    
    async function loadProjectZip(file) {
        console.log('📦 Cargando proyecto ZIP...');
        try {
            // Verificar que JSZip esté disponible
            if (typeof JSZip === 'undefined') {
                showStatus('❌ Error: La biblioteca JSZip no está cargada', 'error');
                return false;
            }
            
            showStatus('📦 Cargando proyecto ZIP...', 'warning');
            
            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);
            
            let jsonData = null;
            const imageFiles = [];
            
            // Procesar archivos en el ZIP
            for (const [filename, zipEntry] of Object.entries(zipData.files)) {
                if (!zipEntry.dir) {
                    if (filename.endsWith('.json')) {
                        // Cargar datos JSON
                        const jsonContent = await zipEntry.async('text');
                        jsonData = JSON.parse(jsonContent);
                        console.log(`✅ Archivo JSON encontrado: ${filename}`);
                    } else if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        // Cargar imágenes
                        const imageBlob = await zipEntry.async('blob');
                        const imageData = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.readAsDataURL(imageBlob);
                        });
                        imageFiles.push({ filename, imageData });
                        console.log(`✅ Imagen encontrada: ${filename}`);
                    }
                }
            }
            
            if (!jsonData) {
                throw new Error('No se encontró archivo JSON en el ZIP');
            }
            
            // Cargar los datos JSON
            if (window.SpecsManager && window.SpecsManager.loadSpecData) {
                await window.SpecsManager.loadSpecData(jsonData);
            } else {
                throw new Error('SpecsManager no disponible para cargar datos');
            }
            
            // Cargar imágenes en los placements correspondientes
            if (imageFiles.length > 0) {
                await loadPlacementImages(imageFiles);
            }
            
            showStatus('✅ Proyecto ZIP cargado correctamente', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error al cargar ZIP:', error);
            showStatus(`❌ Error al cargar proyecto ZIP: ${error.message}`, 'error');
            return false;
        }
    }
    
    async function loadPlacementImages(imageFiles) {
        console.log('🖼️ Cargando imágenes de placements...');
        try {
            // Obtener placements actuales
            let placements = [];
            if (window.PlacementsCore && typeof window.PlacementsCore.getAllPlacements === 'function') {
                placements = window.PlacementsCore.getAllPlacements();
            } else {
                placements = window.globalPlacements || [];
            }
            
            // Asignar imágenes a placements
            for (const imageFile of imageFiles) {
                // Extraer número de placement del nombre de archivo
                const match = imageFile.filename.match(/placement(\d+)/i);
                if (match) {
                    const placementIndex = parseInt(match[1]) - 1;
                    if (placementIndex >= 0 && placements[placementIndex]) {
                        placements[placementIndex].imageData = imageFile.imageData;
                        
                        const placementId = placements[placementIndex].id;
                        const img = document.getElementById(`placement-image-preview-${placementId}`);
                        const imageActions = document.getElementById(`placement-image-actions-${placementId}`);
                        
                        if (img && imageActions) {
                            img.src = imageFile.imageData;
                            img.style.display = 'block';
                            imageActions.style.display = 'flex';
                        }
                        
                        console.log(`✅ Imagen cargada para placement ${placementIndex + 1}`);
                    }
                }
            }
            
            console.log(`✅ Total de imágenes cargadas: ${imageFiles.length}`);
            
        } catch (error) {
            console.error('❌ Error en loadPlacementImages:', error);
        }
    }
    
    // ========== EXPORTACIÓN PÚBLICA ==========
    return {
        // Funciones principales
        downloadProjectZip,
        loadProjectZip,
        
        // Funciones auxiliares
        getJsonData,
        addPlacementImages,
        loadPlacementImages,
        
        // Utilidades
        dataURLToBlob,
        generateProjectName,
        createReadmeContent
    };
})();

// ========== EXPORTACIÓN GLOBAL ==========
window.ZipExporter = ZipExporter;
window.downloadProjectZip = ZipExporter.downloadProjectZip; // Para compatibilidad
window.loadProjectZip = ZipExporter.loadProjectZip; // Para compatibilidad

console.log('✅ Módulo ZipExporter completamente cargado');
