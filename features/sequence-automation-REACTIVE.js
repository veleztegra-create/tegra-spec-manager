// features/sequence-automation.js
// VERSIÓN DEMO - Funciona sin IA, SOLO con tus reglas

window.SequenceAutomation = {
    // ============================================
    // TU CONOCIMIENTO ESTRUCTURADO (lo que me diste)
    // ============================================
    
    // Reglas generales
    reglas: {
        temperatura: "320 °F",
        tiempo: "1:40 min",
        flashCool: {
            activo: true,
            orden: ["FLASH", "COOL"],
            entreColores: true
        }
    },
    
    // SECUENCIAS BASE por tipo de tela y color
    secuenciasBase: {
        "blanco": {
            "water": {
                "base": [
                    { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "110" },
                    { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122" },
                    { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157" }
                ],
                "preparacionClaros": [
                    { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "3% CL 500" }
                ]
            }
        },
        "negro": {
            "water": {
                "base": [
                    { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "110" },
                    { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "122" },
                    { tipo: "BLOCKER", nombre: "Bloquer CHT", malla: "157" }
                ],
                "preparacionClaros": [
                    { tipo: "WHITE_BASE", nombre: "AquaFlex V2", malla: "122", aditivos: "3% CL 500" }
                ]
            }
        }
    },
    
    // REGLAS DE COLORES (lo más importante)
    colores: {
        // Clasificación automática
        clasificacion: {
            "claros": ["amarillo", "yellow", "oro", "gold", "naranja", "orange", "rosa", "pink", "beige", "crema"],
            "oscuros": ["rojo", "red", "azul", "blue", "verde", "green", "morado", "purple", "marron", "brown", "negro", "black"],
            "especiales": ["77C", "78H", "761", "university gold"]
        },
        
        // Reglas por color específico
        reglas: {
            "77C Gold": {
                tipo: "especial",
                pantallas: 3,
                mallas: ["157", "198", "110"],
                aditivos: "3% CL 500 · 5% ecofix XL",
                sobre: "AQUAFLEX"
            },
            "78H Amarillo": {
                tipo: "especial",
                pantallas: 3,
                mallas: ["157", "198", "110"],
                aditivos: "3% CL 500 · 5% ecofix XL",
                sobre: "AQUAFLEX"
            },
            "761 University Gold": {
                tipo: "especial",
                pantallas: 3,
                mallas: ["157", "198", "110"],
                aditivos: "3% CL 500 · 5% ecofix XL",
                sobre: "AQUAFLEX"
            },
            "amarillo claro": {
                tipo: "claro",
                pantallas: 2,
                mallas: ["157", "198"],
                aditivos: "3% CL 500 · 5% ecofix XL",
                sobre: "AQUAFLEX"
            },
            "rojo oscuro": {
                tipo: "oscuro",
                pantallas: 2,
                mallas: ["157", "198"],
                aditivos: "3% CL 500 · 5% ecofix XL",
                sobre: "BLOCKER"
            }
        }
    },
    
    // ============================================
    // MOTOR DE INFERENCIA (la lógica)
    // ============================================
    
    generarSecuencia(orden) {
        // orden = {
        //   tela: "jersey",
        //   colorTela: "blanco",
        //   tinta: "WATER",
        //   colores: ["amarillo", "77C Gold", "rojo"]
        // }
        
        console.log("🎯 Generando secuencia para:", orden);
        
        // 1. Obtener secuencia base según tela y color
        let secuencia = this.obtenerBase(orden.colorTela, orden.tinta);
        
        // 2. Añadir preparación si hay colores claros
        if (this.hayColoresClaros(orden.colores)) {
            secuencia.push(...this.obtenerPreparacion(orden.colorTela));
        }
        
        // 3. Procesar CADA color en orden
        orden.colores.forEach((color, index) => {
            const letra = String.fromCharCode(65 + index); // A, B, C...
            const pasosColor = this.generarPasosColor(color, letra);
            secuencia.push(...pasosColor);
            
            // Añadir FLASH/COOL después de cada color (excepto el último)
            if (index < orden.colores.length - 1) {
                secuencia.push({ tipo: "FLASH", nombre: "FLASH", malla: "-" });
                secuencia.push({ tipo: "COOL", nombre: "COOL", malla: "-" });
            }
        });
        
        // 4. Numerar estaciones
        return this.numerarSecuencia(secuencia);
    },
    
    obtenerBase(colorTela, tinta) {
        const key = colorTela.toLowerCase().includes('blan') ? 'blanco' : 'negro';
        return this.secuenciasBase[key][tinta.toLowerCase()].base || [];
    },
    
    hayColoresClaros(colores) {
        return colores.some(c => 
            this.colores.clasificacion.claros.some(claro => 
                c.toLowerCase().includes(claro)
            )
        );
    },
    
    generarPasosColor(color, letra) {
        const colorLower = color.toLowerCase();
        let regla = null;
        
        // Buscar regla específica
        for (const [key, value] of Object.entries(this.colores.reglas)) {
            if (colorLower.includes(key.toLowerCase())) {
                regla = value;
                break;
            }
        }
        
        // Si no hay regla específica, clasificar automáticamente
        if (!regla) {
            if (this.colores.clasificacion.especiales.some(e => colorLower.includes(e))) {
                regla = this.colores.reglas["77C Gold"]; // usar regla genérica de especiales
            } else if (this.colores.clasificacion.claros.some(c => colorLower.includes(c))) {
                regla = { tipo: "claro", pantallas: 2, mallas: ["157", "198"], aditivos: "3% CL 500 · 5% ecofix XL", sobre: "AQUAFLEX" };
            } else {
                regla = { tipo: "oscuro", pantallas: 2, mallas: ["157", "198"], aditivos: "3% CL 500 · 5% ecofix XL", sobre: "BLOCKER" };
            }
        }
        
        // Generar pasos según número de pantallas
        const pasos = [];
        for (let i = 1; i <= regla.pantallas; i++) {
            const letraPantalla = i === 1 ? letra : letra + i;
            pasos.push({
                tipo: "COLOR",
                nombre: color + (i > 1 ? ` (${i})` : ""),
                screenLetter: letraPantalla,
                malla: regla.mallas[i-1],
                aditivos: regla.aditivos,
                sobre: regla.sobre
            });
        }
        
        return pasos;
    },
    
    numerarSecuencia(secuencia) {
        return secuencia.map((item, index) => ({
            ...item,
            estacion: index + 1
        }));
    }
};
