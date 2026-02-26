// =====================================================
// sequence-automation.js - MOTOR DE REGLAS TEGRA
// Versión: 1.0 - DEMO para GitHub Pages
// Basado en conocimiento REAL del taller
// 0% IA externa - 100% reglas locales
// =====================================================

window.SequenceAutomation = {
    // =====================================================
    // CONFIGURACIÓN GLOBAL
    // =====================================================
    config: {
        temperatura: "320 °F",
        tiempo: "1:40 min",
        version: "1.0",
        taller: "TEGRA"
    },

    // =====================================================
    // SECUENCIAS BASE (lo que me diste)
    // =====================================================
    secuencias: {
        // JERSEY BLANCO / COLORES CLAROS
        "blanco_claros": {
            condiciones: {
                tela: "jersey",
                colorTela: ["blanco", "white", "natural", "crema", "ivory"],
                tipoColor: "claros"
            },
            pasos: [
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "110", aditivos: "N/A", screenLetter: "A" },
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "N/A", screenLetter: "B" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157", aditivos: "N/A", screenLetter: "C" },
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "3% CL 500", screenLetter: "D" }
            ],
            notas: "Colores claros sobre AquaFlex"
        },

        // JERSEY BLANCO / COLORES OSCUROS
        "blanco_oscuros": {
            condiciones: {
                tela: "jersey",
                colorTela: ["blanco", "white", "natural", "crema", "ivory"],
                tipoColor: "oscuros"
            },
            pasos: [
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "110", aditivos: "N/A", screenLetter: "A" },
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "N/A", screenLetter: "B" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157", aditivos: "N/A", screenLetter: "C" },
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "3% CL 500", screenLetter: "D" }
            ],
            notas: "Colores oscuros sobre Blocker CHT"
        },

        // JERSEY NEGRO / COLORES OSCUROS
        "negro_oscuros": {
            condiciones: {
                tela: "jersey",
                colorTela: ["negro", "black", "navy", "charcoal", "maroon"],
                tipoColor: "oscuros"
            },
            pasos: [
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "110", aditivos: "N/A", screenLetter: "A" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "122", aditivos: "N/A", screenLetter: "B" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157", aditivos: "N/A", screenLetter: "C" }
            ],
            notas: "Triple bloqueador para fondo negro"
        },

        // JERSEY NEGRO / COLORES CLAROS (requieren base blanca)
        "negro_claros": {
            condiciones: {
                tela: "jersey",
                colorTela: ["negro", "black", "navy", "charcoal"],
                tipoColor: "claros"
            },
            pasos: [
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "110", aditivos: "N/A", screenLetter: "A" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "122", aditivos: "N/A", screenLetter: "B" },
                { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157", aditivos: "N/A", screenLetter: "C" },
                { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "3% CL 500", screenLetter: "D" }
            ],
            notas: "Colores claros sobre fondo negro necesitan base blanca"
        }
    },

    // =====================================================
    // REGLAS DE COLORES ESPECIALES (3 pantallas)
    // =====================================================
    coloresEspeciales: {
        "77C Gold": {
            nombres: ["77C", "77C GOLD", "GOLD 77C"],
            pantallas: 3,
            mallas: ["157", "198", "110"],
            aditivos: "3% CL 500 · 5% ecofix XL",
            sobre: "AQUAFLEX",
            letras: ["E", "E2", "E3"]
        },
        "78H Amarillo": {
            nombres: ["78H", "78H AMARILLO", "AMARILLO 78H"],
            pantallas: 3,
            mallas: ["157", "198", "110"],
            aditivos: "3% CL 500 · 5% ecofix XL",
            sobre: "AQUAFLEX",
            letras: ["F", "F2", "F3"]
        },
        "761 University Gold": {
            nombres: ["761", "761 GOLD", "UNIVERSITY GOLD"],
            pantallas: 3,
            mallas: ["157", "198", "110"],
            aditivos: "3% CL 500 · 5% ecofix XL",
            sobre: "AQUAFLEX",
            letras: ["G", "G2", "G3"]
        }
    },

    // =====================================================
    // CONFIGURACIÓN DE MALLAS POR TIPO
    // =====================================================
    mallas: {
        "WHITE_BASE": {
            "primera": "110",
            "segunda": "122",
            "tercera": "157",
            "preparacion": "122"
        },
        "BLOCKER": {
            "primera": "110",
            "segunda": "122",
            "tercera": "157"
        },
        "COLOR": {
            "claro": ["157", "198"],
            "oscuro": ["157", "198"],
            "especial": ["157", "198", "110"]
        }
    },

    // =====================================================
    // ADITIVOS POR TIPO
    // =====================================================
    aditivos: {
        "WHITE_BASE": {
            "normal": "N/A",
            "conCatalizador": "3% CL 500"
        },
        "BLOCKER": {
            "normal": "N/A"
        },
        "COLOR": {
            "base": "3% CL 500 · 5% ecofix XL"
        }
    },

    // =====================================================
    // MOTOR PRINCIPAL - Genera secuencia completa
    // =====================================================
    generarSecuencia: function(orden) {
        // orden = {
        //   colorTela: "blanco",
        //   tinta: "WATER",
        //   colores: ["77C Gold", "rojo", "azul"]
        // }

        console.log("🎯 Generando secuencia para:", orden);
        
        let secuenciaCompleta = [];
        let contadorLetras = 0;

        // 1. Determinar tipo de tela y color base
        const esTelaOscura = this._esTelaOscura(orden.colorTela);
        const coloresClasificados = this._clasificarColores(orden.colores);
        
        // 2. Obtener secuencia base según condiciones
        let secuenciaBase = this._obtenerSecuenciaBase(esTelaOscura, coloresClasificados.tieneClaros);
        secuenciaCompleta.push(...secuenciaBase);
        contadorLetras = secuenciaBase.length;

        // 3. Añadir preparación para colores claros (si aplica)
        if (coloresClasificados.tieneClaros && this._necesitaPreparacion(esTelaOscura)) {
            secuenciaCompleta.push({
                tipo: "WHITE_BASE",
                nombre: "AquaFlex V2",
                malla: "122",
                aditivos: "3% CL 500",
                screenLetter: String.fromCharCode(65 + contadorLetras)
            });
            contadorLetras++;
        }

        // 4. Procesar cada color individualmente
        for (let i = 0; i < coloresClasificados.lista.length; i++) {
            const color = coloresClasificados.lista[i];
            const esEspecial = this._esColorEspecial(color);
            const esClaro = this._esColorClaro(color);
            
            // Generar pasos para este color
            const pasosColor = this._generarPasosColor(color, contadorLetras, esEspecial, esClaro, esTelaOscura);
            secuenciaCompleta.push(...pasosColor.pasos);
            contadorLetras = pasosColor.siguienteLetra;

            // Añadir FLASH + COOL después de cada color (excepto el último)
            if (i < coloresClasificados.lista.length - 1) {
                secuenciaCompleta.push({
                    tipo: "FLASH",
                    nombre: "FLASH",
                    malla: "-",
                    aditivos: "",
                    screenLetter: ""
                });
                secuenciaCompleta.push({
                    tipo: "COOL",
                    nombre: "COOL",
                    malla: "-",
                    aditivos: "",
                    screenLetter: ""
                });
            }
        }

        // 5. Numerar estaciones
        return this._numerarSecuencia(secuenciaCompleta);
    },

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================

    _esTelaOscura: function(colorTela) {
        if (!colorTela) return false;
        const tela = colorTela.toLowerCase();
        const oscuros = ["negro", "black", "navy", "charcoal", "maroon", "dark", "oscuro"];
        return oscuros.some(o => tela.includes(o));
    },

    _clasificarColores: function(colores) {
        const resultado = {
            lista: [],
            tieneClaros: false,
            tieneEspeciales: false,
            claros: [],
            oscuros: [],
            especiales: []
        };

        colores.forEach(color => {
            resultado.lista.push(color);
            
            if (this._esColorEspecial(color)) {
                resultado.especiales.push(color);
                resultado.tieneEspeciales = true;
            } else if (this._esColorClaro(color)) {
                resultado.claros.push(color);
                resultado.tieneClaros = true;
            } else {
                resultado.oscuros.push(color);
            }
        });

        return resultado;
    },

    _esColorEspecial: function(color) {
        if (!color) return false;
        const c = color.toLowerCase();
        return Object.keys(this.coloresEspeciales).some(key => 
            c.includes(key.toLowerCase()) || 
            this.coloresEspeciales[key].nombres.some(n => c.includes(n.toLowerCase()))
        );
    },

    _esColorClaro: function(color) {
        if (!color) return false;
        if (this._esColorEspecial(color)) return false; // especiales se tratan aparte
        
        const c = color.toLowerCase();
        const claros = ["amarillo", "yellow", "oro", "gold", "naranja", "orange", 
                       "rosa", "pink", "beige", "crema", "ivory", "blanco", "white",
                       "limon", "lemon", "dorado"];
        return claros.some(claro => c.includes(claro));
    },

    _obtenerSecuenciaBase: function(esTelaOscura, tieneClaros) {
        if (esTelaOscura) {
            if (tieneClaros) {
                return [...this.secuencias.negro_claros.pasos];
            } else {
                return [...this.secuencias.negro_oscuros.pasos];
            }
        } else {
            if (tieneClaros) {
                return [...this.secuencias.blanco_claros.pasos];
            } else {
                return [...this.secuencias.blanco_oscuros.pasos];
            }
        }
    },

    _necesitaPreparacion: function(esTelaOscura) {
        return esTelaOscura; // Solo telas oscuras necesitan preparación extra
    },

    _generarPasosColor: function(color, letraInicio, esEspecial, esClaro, esTelaOscura) {
        const pasos = [];
        let letraActual = letraInicio;

        if (esEspecial) {
            // Encontrar qué color especial es
            let especial = null;
            for (const [key, value] of Object.entries(this.coloresEspeciales)) {
                if (color.toLowerCase().includes(key.toLowerCase()) ||
                    value.nombres.some(n => color.toLowerCase().includes(n.toLowerCase()))) {
                    especial = value;
                    break;
                }
            }

            if (especial) {
                // 3 pantallas para especiales
                for (let i = 0; i < especial.pantallas; i++) {
                    pasos.push({
                        tipo: "COLOR",
                        nombre: color + (i > 0 ? ` (${i+1})` : ""),
                        malla: especial.mallas[i],
                        aditivos: especial.aditivos,
                        screenLetter: String.fromCharCode(65 + letraActual + i) + (i > 0 ? (i+1) : "")
                    });
                }
                letraActual += especial.pantallas;
            }
        } else {
            // 2 pantallas para colores normales
            const mallas = esClaro ? this.mallas.COLOR.claro : this.mallas.COLOR.oscuro;
            
            pasos.push({
                tipo: "COLOR",
                nombre: color,
                malla: mallas[0],
                aditivos: this.aditivos.COLOR.base,
                screenLetter: String.fromCharCode(65 + letraActual)
            });
            
            pasos.push({
                tipo: "COLOR",
                nombre: color + " (2)",
                malla: mallas[1],
                aditivos: this.aditivos.COLOR.base,
                screenLetter: String.fromCharCode(65 + letraActual + 1)
            });
            
            letraActual += 2;
        }

        return {
            pasos: pasos,
            siguienteLetra: letraActual
        };
    },

    _numerarSecuencia: function(secuencia) {
        return secuencia.map((item, index) => ({
            ...item,
            estacion: index + 1
        }));
    },

    // =====================================================
    // FUNCIÓN PÚBLICA PARA INTEGRAR CON APP.JS
    // =====================================================
    generarParaPlacement: function(placement) {
        const orden = {
            colorTela: document.getElementById('colorway')?.value || '',
            tinta: placement.inkType || 'WATER',
            colores: placement.colors
                .filter(c => c.type === 'COLOR' || c.type === 'METALLIC')
                .map(c => c.val)
        };

        return this.generarSecuencia(orden);
    }
};

// =====================================================
// INTEGRACIÓN CON APP.JS
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // Exponer función global
    window.generarSecuenciaTegra = function(placementId) {
        const placement = placements.find(p => p.id === placementId);
        if (!placement) return;
        
        const secuencia = window.SequenceAutomation.generarParaPlacement(placement);
        console.log("✅ Secuencia generada:", secuencia);
        
        // Aquí llamas a tu función para actualizar la UI
        if (typeof actualizarSecuenciaUI === 'function') {
            actualizarSecuenciaUI(placementId, secuencia);
        }
        
        return secuencia;
    };
    
    console.log("✅ Motor de reglas TEGRA cargado");
});
