// state-manager.js CORREGIDO
class StateManager {  
 constructor() {  
     this.state = {  
         placements: [],  
         currentPlacementId: 1,  
         errors: []  
         // ... otros estados
     };  
     this.subscribers = [];
     this.init(); 
 }

 init() {
     // CARGA INICIAL SEGURA
     this.loadErrorsFromLocalStorage();
     this.setupErrorHandling(); // AGREGADA ESTA FUNCIÓN
 }

 setupErrorHandling() {
     window.onerror = (message, source, lineno, colno, error) => {
         this.addError('Global Error', { message, stack: error?.stack });
     };
 }
   
 subscribe(callback) {  
     this.subscribers.push(callback);  
     return () => { this.subscribers = this.subscribers.filter(cb => cb !== callback); };  
 }  
   
 notify() {  
     this.subscribers.forEach(callback => {  
         try { callback(this.state); } catch (error) { console.error('Error en suscriptor:', error); }  
     });  
 }  
   
 setState(updates) {  
     this.state = {...this.state, ...updates};  
     this.notify();  
     this.saveToLocalStorage();
 }  

 // REPARACIÓN: Actualización con nombres personalizados (SHORT, SLEEVE, etc.)
 updatePlacement(id, updates) {  
     const placements = this.state.placements.map(p => {
         if (p.id === id) {
             // Si el nombre es personalizado, lo normalizamos
             if (updates.customType) {
                 updates.name = updates.customType.toUpperCase();
             }
             return {...p, ...updates};
         }
         return p;
     });  
     this.setState({ placements });  
 }  
   
 // Mantenemos tu lógica de Gear for Sport y Géneros intacta
 detectTeamFromText(text) {  
     if (!text) return '';  
     const upperText = text.toUpperCase();  
     for (const [code, name] of Object.entries(Config.GEARFORSPORT_TEAM_MAP)) {  
         if (upperText.includes(code)) return name;  
     }  
     for (const [code, name] of Object.entries(Config.TEAM_CODE_MAP)) {  
         if (upperText.includes(code)) return name;  
     }  
     return '';  
 }  
   
 detectGenderFromText(text) {  
     if (!text) return '';  
     const upperText = text.toUpperCase();  
     const gearForSportMatch = upperText.match(/^U([MWYBGKTIAN])\d+/);  
     if (gearForSportMatch && gearForSportMatch[1]) {  
         const genderCode = `U${gearForSportMatch[1]}`;  
         if (Config.GEARFORSPORT_GENDER_MAP && Config.GEARFORSPORT_GENDER_MAP[genderCode]) {  
             return Config.GEARFORSPORT_GENDER_MAP[genderCode];  
         }  
     }  
     if (upperText.includes(' MEN') || upperText.includes('_M')) return 'Men';  
     if (upperText.includes(' WOMEN') || upperText.includes('_W')) return 'Women';  
     return 'Adult';  
 }  

 // ... (resto de tus funciones de guardado y validación se mantienen igual)
 saveToLocalStorage(key = 'tegraspec_state') {  
     try {  
         localStorage.setItem(key, JSON.stringify({  
             ...this.state, _savedAt: new Date().toISOString()  
         }));  
         return true;  
     } catch (error) { return false; }  
 }

 addError(context, error) {
    const errorEntry = { id: Date.now(), context, message: error.message };
    if (!Array.isArray(this.state.errors)) {
        this.state.errors = [];
    }
    this.state.errors.push(errorEntry);
    this.saveErrorsToLocalStorage();
 }

 saveErrorsToLocalStorage() {
     localStorage.setItem('tegraspec_errors', JSON.stringify(this.state.errors));
 }

 loadErrorsFromLocalStorage() {
     const saved = localStorage.getItem('tegraspec_errors');
     if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                this.state.errors = parsed;
            } else {
                this.state.errors = [];
            }
        } catch (e) {
            this.state.errors = [];
        }
     } else {
        this.state.errors = [];
     }
 }

 loadFromLocalStorage(key = 'tegraspec_state') {
     const saved = localStorage.getItem(key);
     if (saved) { this.state = {...this.state, ...JSON.parse(saved)}; this.notify(); }
 }
}  
  
// Instancia global
window.stateManager = new StateManager();
