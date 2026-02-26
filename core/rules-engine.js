// rules-engine.js - Motor de reglas COMPLETO
// Versión: 1.0 - 26/02/2026

window.RulesEngine = {
    rules: {
        clientes: {},
        tintas: {},
        telas: {},
        colores: {}
    },
    
    // Inicializar
    async init() {
        console.log("📚 Inicializando RulesEngine...");
        await this.cargarTodas();
        console.log("✅ RulesEngine listo");
        return this;
    },
    
    // Cargar todas las reglas
    async cargarTodas() {
        const basePath = 'https://veleztegra-create.github.io/tegra-spec-manager';
        
        try {
            // Cargar reglas de clientes
            const clientes = ['gear-for-sport', 'fanatics', 'nike'];
            for (const cliente of clientes) {
                try {
                    const response = await fetch(`${basePath}/rules/clientes/${cliente}.json`);
                    if (response.ok) {
                        this.rules.clientes[cliente] = await response.json();
                        console.log(`✅ Cliente cargado: ${cliente}`);
                    }
                } catch (e) {
                    console.warn(`⚠️ No se pudo cargar ${cliente}:`, e);
                }
            }
            
            // Cargar reglas de tintas
            const tintas = ['plastisol', 'waterbase', 'silicone'];
            for (const tinta of tintas) {
                try {
                    const response = await fetch(`${basePath}/rules/tintas/${tinta}.json`);
                    if (response.ok) {
                        this.rules.tintas[tinta] = await response.json();
                    }
                } catch (e) {}
            }
            
            // Cargar reglas de telas
            const telas = ['oscuras', 'claras'];
            for (const tela of telas) {
                try {
                    const response = await fetch(`${basePath}/rules/telas/${tela}.json`);
                    if (response.ok) {
                        this.rules.telas[tela] = await response.json();
                    }
                } catch (e) {}
            }
            
            // Cargar reglas de colores
            try {
                const response = await fetch(`${basePath}/rules/colores/especiales.json`);
                if (response.ok) {
                    this.rules.colores.especiales = await response.json();
                }
            } catch (e) {}
            
            console.log("✅ Todas las reglas cargadas", this.rules);
            
        } catch (error) {
            console.error("❌ Error cargando reglas:", error);
        }
    },
    
    // Obtener reglas para un cliente específico
    getReglasCliente(customer) {
        if (!customer) return null;
        const customerUpper = customer.toUpperCase();
        
        for (const [key, cliente] of Object.entries(this.rules.clientes)) {
            if (cliente.identificadores?.some(id => customerUpper.includes(id))) {
                return cliente;
            }
        }
        return null;
    },
    
    // Obtener reglas para una tinta específica
    getReglasTinta(tinta) {
        if (!tinta) return null;
        return this.rules.tintas[tinta.toLowerCase()] || null;
    },
    
    // Clasificar tela por color
    clasificarTela(colorTela) {
        if (!colorTela) return 'clara';
        
        const tela = colorTela.toLowerCase();
        const oscuras = this.rules.telas.oscuras?.identificadores || 
            ["negro", "black", "navy", "charcoal", "maroon", "dark"];
        
        if (oscuras.some(o => tela.includes(o))) {
            return 'oscura';
        }
        return 'clara';
    },
    
    // Verificar si un color es especial
    esColorEspecial(color) {
        if (!color) return null;
        const colorLower = color.toLowerCase();
        
        const especiales = this.rules.colores.especiales?.colores || [];
        
        for (const especial of especiales) {
            if (especial.identificadores?.some(id => 
                colorLower.includes(id.toLowerCase())
            )) {
                return especial;
            }
        }
        return null;
    },
    
    // Obtener secuencia base según tela y cliente
    obtenerSecuenciaBase(tipoTela, reglasCliente) {
        if (!reglasCliente?.reglas?.secuencias_base) return [];
        
        const secuenciaKey = tipoTela === 'oscura' ? 'tela_oscura' : 'tela_clara';
        const secuencia = reglasCliente.reglas.secuencias_base[secuenciaKey];
        
        if (!secuencia) return [];
        
        let resultado = [];
        
        // Agregar bloqueadores
        if (secuencia.bloqueadores) {
            resultado.push(...secuencia.bloqueadores);
        }
        
        // Agregar base blanca
        if (secuencia.base_blanca) {
            resultado.push(...secuencia.base_blanca);
        }
        
        return resultado;
    }
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.RulesEngine.init();
});
