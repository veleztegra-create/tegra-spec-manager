// js/utils/ui-helpers.js
function showStatus(msg, type = 'success') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    
    el.textContent = msg;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}

function updateDateTime() {
    const dateElement = document.getElementById('current-datetime');
    if (!dateElement) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);
}

// Hacerlas disponibles globalmente
window.showStatus = showStatus;
window.updateDateTime = updateDateTime;
