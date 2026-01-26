// render-helpers.js - Funciones auxiliares para renderizado
const RenderHelpers = {
    renderColorSequence: function(containerId, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!colors || colors.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay colores</p>';
            return;
        }
        
        let html = '<div class="color-sequence">';
        colors.forEach(color => {
            html += this.renderColorItem(color);
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    renderColorItem: function(color) {
        let badgeClass = 'badge-primary';
        if (color.type === 'BLOCKER') badgeClass = 'badge-danger';
        if (color.type === 'WHITE_BASE') badgeClass = 'badge-light';
        if (color.type === 'METALLIC') badgeClass = 'badge-warning';
        
        return `
            <div class="color-item">
                <span class="badge ${badgeClass}">${color.type}</span>
                <span class="color-letter">${color.screenLetter}</span>
                <span class="color-name">${color.val}</span>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.RenderHelpers = RenderHelpers;
}
