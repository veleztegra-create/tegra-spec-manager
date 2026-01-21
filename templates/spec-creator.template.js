export const SpecCreatorTemplate = {
    render: () => `
    <div class="spec-form-container">
        <section class="general-info-section card">
            <div class="card-header">Información General</div>
            <div class="card-body form-grid">
                <div class="form-group">
                    <label>CLIENTE</label>
                    <input type="text" id="customer" oninput="window.updateClientLogo()">
                </div>
                <div class="form-group">
                    <label>STYLE #</label>
                    <input type="text" id="style">
                </div>
                </div>
        </section>

        <section class="placements-section card mt-4">
            <div class="card-header">Placements</div>
            <div id="placements-tabs" class="tabs-container"></div>
            <div id="placements-container"></div>
            <div class="actions mt-3">
                <button onclick="window.addNewPlacement()" class="btn-primary">
                    <i class="fas fa-plus"></i> Añadir Placement
                </button>
            </div>
        </section>

        <section class="global-actions no-print mt-4">
            <button onclick="window.exportToExcel()" class="btn-success">Exportar Excel</button>
            <button onclick="window.generatePDF()" class="btn-danger">Generar PDF</button>
        </section>
    </div>`
};
