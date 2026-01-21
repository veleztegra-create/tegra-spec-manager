export const HeaderTemplate = {
    render: () => `
    <header class="app-header no-print">
        <div class="header-logo">
            <h1>TEGRA TECHNICAL SPEC</h1>
        </div>
        <div class="header-actions">
            <button onclick="window.toggleTheme()" class="btn-secondary">
                <i class="fas fa-moon"></i>
            </button>
        </div>
    </header>`
};
