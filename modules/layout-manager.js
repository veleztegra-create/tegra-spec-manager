import { HeaderTemplate } from '../templates/header.template.js';
import { DashboardTemplate } from '../templates/dashboard.template.js';
import { SpecCreatorTemplate } from '../templates/spec-creator.template.js';

export class LayoutManager {
    init() {
        const container = document.querySelector('.app-container');
        container.innerHTML = `
            ${HeaderTemplate.render()}
            <nav class="app-nav no-print">
                <ul class="nav-tabs">
                    <li class="nav-tab active" data-tab="dashboard">Dashboard</li>
                    <li class="nav-tab" data-tab="spec-creator">Spec Creator</li>
                </ul>
            </nav>
            <main class="app-main">
                <div id="dashboard" class="tab-content active">${DashboardTemplate.render()}</div>
                <div id="spec-creator" class="tab-content">${SpecCreatorTemplate.render()}</div>
            </main>
        `;
        this.setupTabs();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.onclick = () => {
                const target = tab.dataset.tab;
                document.querySelectorAll('.nav-tab, .tab-content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(target).classList.add('active');
                
                // Ejecutar lógica legacy si existe
                if (target === 'dashboard' && window.updateDashboard) window.updateDashboard();
            };
        });
    }
}
