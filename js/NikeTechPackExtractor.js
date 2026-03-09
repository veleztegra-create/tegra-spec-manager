/**
 * Nike Tech Pack Extractor
 * Módulo para extraer información de tech packs de Nike desde PDF
 * Compatible con: https://veleztegra-create.github.io/tegra-spec-manager/
 * 
 * Uso: Integrar este archivo en tu aplicación y llamar a las funciones
 * según sea necesario.
 */

// ============================================
// CONFIGURACIÓN Y DICCIONARIOS
// ============================================

const CONFIG = {
  // Tallas disponibles en tech packs Nike
  TALLAS: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
  
  // Palabras clave para identificar secciones
  KEYWORDS: {
    tallaBase: ['Base Size', 'Talla Base'],
    tela: ['Fabric', 'Tela', 'Knit', 'Tricot', 'Mesh'],
    tinta: ['Water Base', 'Plastisol', 'Silicone', 'High Solids'],
    placement: ['Graphic Placement', 'Placement', 'ELP'],
    measurement: ['Measurement', 'Medida', 'QC Tol']
  }
};

// Diccionario de traducción de términos técnicos
const TRADUCCIONES = {
  // Ubicaciones
  'CF': 'FRONT (Frente)',
  'Center Front': 'FRONT (Frente)',
  'CB': 'BACK (Espalda)',
  'Center Back': 'BACK (Espalda)',
  'Sleeve': 'SLEEVE (Manga)',
  'Left Sleeve': 'SLEEVE (Manga)',
  'Right Sleeve': 'SLEEVE (Manga)',
  'Shoulder': 'SHOULDER (Hombro)',
  'TV Numbers': 'TV. NUMBERS (Números TV)',
  'Chest': 'CHEST (Pecho)',
  'Collar': 'COLLAR (Cuello)',
  'Neck': 'COLLAR (Cuello)',
  'Jocktag': 'CUSTOM (Jocktag)',
  'Nameplate': 'BACK (Nameplate)',
  
  // Tipos de tinta
  'Water Base': 'Water-base',
  'High Solids Water Base': 'Water-base',
  'Plastisol': 'Plastisol',
  'Silicone': 'Silicone',
  
  // Telas
  'Polyester': 'Poliéster',
  'Recycled Polyester': 'Poliéster Reciclado',
  'Cotton': 'Algodón',
  'Nylon': 'Nylon',
  'Spandex': 'Spandex',
  'Elastane': 'Elastano'
};

// Mapeo de códigos ELP a ubicaciones en español
const ELP_MAPPING = {
  'ELP68': { ubicacion: 'COLLAR', descripcion: 'Escudo NFL - Centrado en cuello' },
  'ELP01': { ubicacion: 'FRONT', descripcion: 'Wordmark - Centro frente' },
  'ELP71': { ubicacion: 'FRONT', descripcion: 'Números Frontales' },
  'ELP27': { ubicacion: 'FRONT', descripcion: 'Centrado Wordmark/Números' },
  'ELP73': { ubicacion: 'BACK', descripcion: 'Logo trasero centrado' },
  'ELP08': { ubicacion: 'BACK', descripcion: 'Nameplate' },
  'ELP64': { ubicacion: 'BACK', descripcion: 'Números Traseros' },
  'ELP28': { ubicacion: 'BACK', descripcion: 'Centrado Logo/Nameplate' },
  'ELP67': { ubicacion: 'TV. NUMBERS', descripcion: 'Números de Hombro' },
  'ELP79': { ubicacion: 'SLEEVE', descripcion: 'Swoosh en manga' },
  'ELP40': { ubicacion: 'SLEEVE', descripcion: 'Rayas de Manga' },
  'ELP37': { ubicacion: 'CUSTOM', descripcion: 'Jocktag lateral' },
  'ELP38': { ubicacion: 'CUSTOM', descripcion: 'Jocktag vertical' }
};

// ============================================
// CLASE PRINCIPAL EXTRACTORA
// ============================================

class NikeTechPackExtractor {
  constructor() {
    this.extractedData = {
      informacionGeneral: {},
      tallaBase: null,
      telas: [],
      tinta: null,
      placements: []
    };
  }

  /**
   * Extrae texto de un archivo PDF usando PDF.js
   * @param {File|ArrayBuffer} pdfFile - Archivo PDF o ArrayBuffer
   * @returns {Promise<string>} - Texto extraído del PDF
   */
  async extractTextFromPDF(pdfFile) {
    try {
      // Cargar PDF.js (asegúrate de incluirlo en tu HTML)
      if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js no está cargado. Incluye: <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>');
      }

      const arrayBuffer = pdfFile instanceof File 
        ? await pdfFile.arrayBuffer() 
        : pdfFile;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error);
      throw error;
    }
  }

  /**
   * Procesa el texto extraído y extrae la información estructurada
   * @param {string} text - Texto extraído del PDF
   * @returns {Object} - Datos estructurados
   */
  parseTechPackText(text) {
    this.extractedData = {
      informacionGeneral: this.extractGeneralInfo(text),
      tallaBase: this.extractBaseSize(text),
      telas: this.extractFabrics(text),
      tinta: this.extractInkType(text),
      placements: this.extractPlacements(text)
    };

    return this.extractedData;
  }

  /**
   * Extrae información general del producto
   */
  extractGeneralInfo(text) {
    const info = {};

    // Nombre de marketing
    const marketingNameMatch = text.match(/Marketing Name\s*[:#]?\s*([^\n]+)/i);
    if (marketingNameMatch) {
      info.nombreMarketing = marketingNameMatch[1].trim();
    }

    // Style Number
    const styleMatch = text.match(/Style\s*#?\s*[:#]?\s*(\w+)/i);
    if (styleMatch) {
      info.styleNumber = styleMatch[1].trim();
    }

    // Temporada
    const seasonMatch = text.match(/Season\s*[:#]?\s*([^\n]+)/i);
    if (seasonMatch) {
      info.season = seasonMatch[1].trim();
    }

    // Colorway (equipo)
    const teamMatch = text.match(/(Bills|Bengals|Ravens|Steelers|Cowboys|Eagles|Giants|Commanders|49ers|Rams|Seahawks|Cardinals|Chiefs|Raiders|Broncos|Chargers|Packers|Bears|Lions|Vikings|Saints|Buccaneers|Falcons|Panthers|Patriots|Jets|Dolphins|Bills|Jaguars|Colts|Titans|Texans)\s+(Home|Road|Away|Alternate)/i);
    if (teamMatch) {
      info.equipo = teamMatch[1];
      info.tipo = teamMatch[2];
    }

    return info;
  }

  /**
   * Extrae la talla base del tech pack
   */
  extractBaseSize(text) {
    // Buscar "Base Size" seguido de la talla
    const baseSizeMatch = text.match(/Base Size[^\n]*?\b([SMXL]|2XL|3XL|4XL|5XL)\b/i);
    if (baseSizeMatch) {
      return baseSizeMatch[1].toUpperCase();
    }

    // Buscar en tabla de medidas
    const sizeTableMatch = text.match(/Size Scale[^\n]*?\b([SMXL]|2XL|3XL|4XL|5XL)\b/i);
    if (sizeTableMatch) {
      return sizeTableMatch[1].toUpperCase();
    }

    return 'L'; // Default
  }

  /**
   * Extrae información de las telas
   */
  extractFabrics(text) {
    const telas = [];

    // Buscar sección de Bill of Material
    const bomMatch = text.match(/Bill of Material[\s\S]*?(?=Measurement|Graphic Placement|$)/i);
    if (!bomMatch) return telas;

    const bomText = bomMatch[0];

    // Patrones para identificar telas
    const fabricPatterns = [
      {
        regex: /(\w+)\s+Tricot[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
        tipo: 'Tricot Principal'
      },
      {
        regex: /(\w+)\s+Mesh[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
        tipo: 'Mesh'
      },
      {
        regex: /Flat Knit Rib[\s\S]*?(\d+)\s*gsm[\s\S]*?(\d+%\s*[^\n]+)/i,
        tipo: 'Rib (Cuello)'
      }
    ];

    fabricPatterns.forEach(pattern => {
      const match = bomText.match(pattern.regex);
      if (match) {
        const composicion = match[3] || '';
        telas.push({
          nombre: match[1] || pattern.tipo,
          tipo: pattern.tipo,
          peso: match[2] + ' gsm',
          composicion: this.traducirComposicion(composicion)
        });
      }
    });

    // Si no encontramos con patrones, buscar líneas con composición
    if (telas.length === 0) {
      const composicionMatches = bomText.match(/(\d+%\s*(?:Polyester|Recycled Polyester|Cotton|Nylon)[^\n]*)/gi);
      if (composicionMatches) {
        composicionMatches.forEach((comp, index) => {
          telas.push({
            nombre: `Tela ${index + 1}`,
            tipo: index === 0 ? 'Principal' : 'Secundaria',
            composicion: this.traducirComposicion(comp)
          });
        });
      }
    }

    return telas;
  }

  /**
   * Extrae el tipo de tinta utilizado
   */
  extractInkType(text) {
    // Buscar tipos de tinta específicos
    if (text.match(/High Solids Water Base/i)) {
      return {
        tipo: 'Water-base',
        nombreCompleto: 'High Solids Water Base Print',
        descripcion: 'Impresión de base acuosa de alta solidez'
      };
    }

    if (text.match(/Water Base|Waterbase/i)) {
      return {
        tipo: 'Water-base',
        nombreCompleto: 'Water Base Print',
        descripcion: 'Impresión base acuosa'
      };
    }

    if (text.match(/Plastisol/i)) {
      return {
        tipo: 'Plastisol',
        nombreCompleto: 'Plastisol Print',
        descripcion: 'Impresión plastisol'
      };
    }

    if (text.match(/Silicone/i)) {
      return {
        tipo: 'Silicone',
        nombreCompleto: 'Silicone Print',
        descripcion: 'Impresión de silicona'
      };
    }

    return {
      tipo: 'Water-base',
      nombreCompleto: 'No especificado',
      descripcion: 'Asumiendo water-base (estándar Nike)'
    };
  }

  /**
   * Extrae los placements con sus ubicaciones para la talla base
   */
  extractPlacements(text) {
    const placements = [];
    const tallaBase = this.extractedData.tallaBase || 'L';

    // Buscar sección de Graphic Placement
    const placementMatch = text.match(/Graphic Placement[\s\S]*?(?=Measurement|$)/i);
    if (!placementMatch) return placements;

    const placementText = placementMatch[0];

    // Extraer cada código ELP con sus medidas
    const elpPattern = /(ELP\d+)\s+([^\n]+?)\s+Yes\s+[^\n]*?\b(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi;
    
    let match;
    while ((match = elpPattern.exec(placementText)) !== null) {
      const codigo = match[1];
      const descripcionIngles = match[2].trim();
      const valorBase = parseFloat(match[5]); // Valor para talla base

      if (ELP_MAPPING[codigo]) {
        const mapping = ELP_MAPPING[codigo];
        placements.push({
          codigo: codigo,
          ubicacion: mapping.ubicacion,
          descripcion: mapping.descripcion,
          descripcionIngles: descripcionIngles,
          distancia: valorBase + ' cm',
          talla: tallaBase
        });
      }
    }

    // Si no encontramos con el patrón complejo, buscar líneas simples
    if (placements.length === 0) {
      Object.keys(ELP_MAPPING).forEach(codigo => {
        const regex = new RegExp(`${codigo}[^\n]*`, 'i');
        const match = placementText.match(regex);
        if (match) {
          const mapping = ELP_MAPPING[codigo];
          placements.push({
            codigo: codigo,
            ubicacion: mapping.ubicacion,
            descripcion: mapping.descripcion,
            distancia: 'Ver especificación'
          });
        }
      });
    }

    return placements;
  }

  /**
   * Traduce la composición de la tela al español
   */
  traducirComposicion(composicion) {
    let traducida = composicion;
    
    Object.keys(TRADUCCIONES).forEach(ingles => {
      const regex = new RegExp(ingles, 'gi');
      traducida = traducida.replace(regex, TRADUCCIONES[ingles]);
    });

    return traducida;
  }

  /**
   * Obtiene el índice de la talla base en la tabla de medidas
   */
  getTallaBaseIndex(tallaBase) {
    const tallas = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    return tallas.indexOf(tallaBase);
  }

  /**
   * Procesa un archivo PDF completo
   * @param {File} pdfFile - Archivo PDF del tech pack
   * @returns {Promise<Object>} - Datos extraídos
   */
  async procesarPDF(pdfFile) {
    try {
      const text = await this.extractTextFromPDF(pdfFile);
      return this.parseTechPackText(text);
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw error;
    }
  }
}

// ============================================
// FUNCIONES DE INTEGRACIÓN CON TU APLICACIÓN
// ============================================

/**
 * Integra los datos extraídos con el formulario de Tegra Spec Manager
 * @param {Object} datos - Datos extraídos del PDF
 * @param {Object} formElements - Referencias a los elementos del formulario
 */
function poblarFormularioTegra(datos, formElements) {
  // Información general
  if (formElements.cliente && datos.informacionGeneral.equipo) {
    formElements.cliente.value = datos.informacionGeneral.equipo;
  }
  
  if (formElements.style && datos.informacionGeneral.styleNumber) {
    formElements.style.value = datos.informacionGeneral.styleNumber;
  }
  
  if (formElements.season && datos.informacionGeneral.season) {
    formElements.season.value = datos.informacionGeneral.season;
  }
  
  if (formElements.nameTeam && datos.informacionGeneral.nombreMarketing) {
    formElements.nameTeam.value = datos.informacionGeneral.nombreMarketing;
  }

  // Talla base
  if (formElements.tallaBase && datos.tallaBase) {
    formElements.tallaBase.value = datos.tallaBase;
  }

  // Tela (concatenar todas las telas encontradas)
  if (formElements.tela && datos.telas.length > 0) {
    const telaPrincipal = datos.telas.find(t => t.tipo.includes('Principal') || t.tipo.includes('Tricot'));
    if (telaPrincipal) {
      formElements.tela.value = `${telaPrincipal.nombre} - ${telaPrincipal.composicion}`;
    }
  }

  // Placements
  if (formElements.placementsContainer && datos.placements.length > 0) {
    datos.placements.forEach(placement => {
      agregarPlacementATegra(placement, formElements.placementsContainer, datos.tinta);
    });
  }
}

/**
 * Agrega un placement al contenedor de placements de Tegra
 */
function agregarPlacementATegra(placement, container, tintaInfo) {
  // Esta función debe adaptarse a cómo Tegra crea los placements
  // Ejemplo básico:
  const placementData = {
    tipo: placement.ubicacion,
    tipoTinta: tintaInfo ? tintaInfo.tipo : 'Water-base',
    detalles: placement.descripcion,
    distancia: placement.distancia
  };

  // Aquí llamarías a la función de tu aplicación que crea placements
  // Por ejemplo: window.crearPlacement(placementData);
  console.log('Agregando placement:', placementData);
}

// ============================================
// COMPONENTE DE UI PARA CARGAR PDF
// ============================================

/**
 * Crea un componente de carga de PDF que puedes integrar en tu HTML
 * @param {string} containerId - ID del contenedor donde se insertará
 * @param {Function} onDataExtracted - Callback cuando se extraen los datos
 */
function crearPDFUploader(containerId, onDataExtracted) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contenedor #${containerId} no encontrado`);
    return;
  }

  const extractor = new NikeTechPackExtractor();

  const html = `
    <div class="pdf-uploader" style="
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      background: #f9f9f9;
      margin: 10px 0;
    ">
      <h3>📄 Cargar Tech Pack Nike (PDF)</h3>
      <p>Arrastra un archivo PDF o haz clic para seleccionar</p>
      <input type="file" id="pdfInput" accept=".pdf" style="display: none;">
      <button onclick="document.getElementById('pdfInput').click()" style="
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">
        Seleccionar PDF
      </button>
      <div id="pdfStatus" style="margin-top: 10px; color: #666;"></div>
      <div id="pdfPreview" style="margin-top: 15px; text-align: left;"></div>
    </div>
  `;

  container.innerHTML = html;

  const pdfInput = container.querySelector('#pdfInput');
  const statusDiv = container.querySelector('#pdfStatus');
  const previewDiv = container.querySelector('#pdfPreview');

  pdfInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusDiv.textContent = '⏳ Procesando PDF...';
    
    try {
      const datos = await extractor.procesarPDF(file);
      
      statusDiv.innerHTML = '✅ <strong>PDF procesado correctamente</strong>';
      
      // Mostrar preview de datos extraídos
      previewDiv.innerHTML = generarPreviewHTML(datos);
      
      // Llamar al callback con los datos
      if (typeof onDataExtracted === 'function') {
        onDataExtracted(datos);
      }
    } catch (error) {
      statusDiv.innerHTML = '❌ <strong>Error:</strong> ' + error.message;
      console.error(error);
    }
  });

  // Drag and drop
  const uploaderDiv = container.querySelector('.pdf-uploader');
  
  uploaderDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploaderDiv.style.borderColor = '#007bff';
    uploaderDiv.style.background = '#e3f2fd';
  });

  uploaderDiv.addEventListener('dragleave', () => {
    uploaderDiv.style.borderColor = '#ccc';
    uploaderDiv.style.background = '#f9f9f9';
  });

  uploaderDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    uploaderDiv.style.borderColor = '#ccc';
    uploaderDiv.style.background = '#f9f9f9';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      pdfInput.files = e.dataTransfer.files;
      pdfInput.dispatchEvent(new Event('change'));
    } else {
      statusDiv.textContent = '❌ Por favor, arrastra un archivo PDF válido';
    }
  });
}

/**
 * Genera HTML de preview de los datos extraídos
 */
function generarPreviewHTML(datos) {
  let html = '<div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">';
  
  html += '<h4>📋 Datos Extraídos:</h4>';
  
  // Talla base
  html += `<p><strong>Talla Base:</strong> ${datos.tallaBase || 'No detectada'}</p>`;
  
  // Telas
  if (datos.telas.length > 0) {
    html += '<p><strong>Telas:</strong></p><ul>';
    datos.telas.forEach(tela => {
      html += `<li>${tela.tipo}: ${tela.composicion}</li>`;
    });
    html += '</ul>';
  }
  
  // Tinta
  if (datos.tinta) {
    html += `<p><strong>Tipo de Tinta:</strong> ${datos.tinta.tipo}</p>`;
  }
  
  // Placements
  if (datos.placements.length > 0) {
    html += '<p><strong>Placements Encontrados:</strong></p><ul>';
    datos.placements.forEach(p => {
      html += `<li>${p.ubicacion} - ${p.descripcion} (${p.distancia})</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div>';
  return html;
}

// ============================================
// EXPORTAR PARA USO EN TU APLICACIÓN
// ============================================

// Exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NikeTechPackExtractor,
    poblarFormularioTegra,
    crearPDFUploader,
    TRADUCCIONES,
    ELP_MAPPING
  };
}

// Hacer disponible globalmente para uso directo en navegador
if (typeof window !== 'undefined') {
  window.NikeTechPackExtractor = NikeTechPackExtractor;
  window.poblarFormularioTegra = poblarFormularioTegra;
  window.crearPDFUploader = crearPDFUploader;
  window.TRADUCCIONES = TRADUCCIONES;
  window.ELP_MAPPING = ELP_MAPPING;
}
