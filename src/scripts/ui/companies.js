import { formatDate } from '../../lib/utils.js';

export function renderCompanies(companies, onSelect) {
    const container = document.getElementById('company-list');
    if (!container) return;
    container.innerHTML = '';

    if (!companies?.length) {
        container.innerHTML = '<div class="empty-list">No se encontraron empresas.</div>';
        return;
    }

    companies.forEach(company => {
        const div = document.createElement('div');
        div.className = 'company-item';
        div.innerHTML = `
            <span class="company-name">${company.RazonSocial || 'Sin Nombre'}</span>
            <span class="company-ruc">${company.Ruc}</span>
        `;
        div.onclick = () => {
            document.querySelectorAll('.company-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            onSelect(company);
        };
        container.appendChild(div);
    });
}
