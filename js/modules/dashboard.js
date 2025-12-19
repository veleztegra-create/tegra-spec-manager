// js/modules/dashboard.js
function updateDashboard() {
    console.log("Actualizando dashboard...");
    
    const specs = Object.keys(localStorage).filter(k => k.startsWith('spec_'));
    const total = specs.length;
    
    const totalEl = document.getElementById('total-specs');
    const todayEl = document.getElementById('today-specs');
    const activeEl = document.getElementById('active-projects');
    const rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = total;
    
    // Contar specs de hoy
    const today = new Date().toDateString();
    let todayCount = 0;
    specs.forEach(k => {
        try {
            const spec = JSON.parse(localStorage.getItem(k));
            if (new Date(spec.savedAt).toDateString() === today) {
                todayCount++;
            }
        } catch(e) {
            console.error("Error parsing spec:", e);
        }
    });
    
    if (todayEl) todayEl.textContent = todayCount;
    if (activeEl) activeEl.textContent = Math.floor(total * 0.7);
    if (rateEl) {
        const rate = Math.floor((todayCount / Math.max(total, 1)) * 100);
        rateEl.textContent = rate + '%';
    }
}

window.updateDashboard = updateDashboard;
