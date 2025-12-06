import { fetchQdrantPoint, deleteQdrantPoint, updateQdrantPoint } from '../../lib/api.js';
import { renderPointDetail } from './qdrantDetail.js';

let modal = null;

function createModal() {
    modal = document.createElement('div');
    modal.id = 'qdrant-modal';
    modal.className = 'qdrant-modal';
    modal.innerHTML = `
        <div class="qdrant-modal-content">
            <div class="qdrant-modal-header">
                <h3>Qdrant Points</h3>
                <div>
                    <button id="btn-knowledge-modal" class="modal-header-btn">Gestionar Base de Conocimiento</button>
                    <button id="qdrant-modal-close" class="modal-header-btn">Cerrar</button>
                </div>
            </div>
            <div class="qdrant-modal-body">
                <div id="qdrant-modal-sidebar" class="qdrant-sidebar"></div>
                <div id="qdrant-modal-detail" class="qdrant-detail"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('qdrant-modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    document.getElementById('btn-knowledge-modal').onclick = () => {
        window.location.href = '/knowledge';
    };
}


export async function openQdrantModal(pointIds, onUpdate = null) {
    if (!modal) createModal();
    const sidebar = document.getElementById('qdrant-modal-sidebar');
    const detail = document.getElementById('qdrant-modal-detail');

    sidebar.innerHTML = '<div class="loading">Cargando...</div>';
    detail.innerHTML = '<div class="loading">Cargando detalles...</div>';
    modal.style.display = 'flex';

    const results = [];
    for (const id of pointIds) {
        try {
            const data = await fetchQdrantPoint(id);
            results.push({ id, data, error: null });
        } catch (e) {
            results.push({ id, data: null, error: e.message });
        }
    }

    
    sidebar.innerHTML = '';
    results.forEach((item, idx) => {
        const btn = document.createElement('div');
        btn.className = 'qdrant-sidebar-item';
        btn.textContent = `Punto ${idx + 1}`;
        if (item.error) btn.classList.add('error-item');
        btn.onclick = () => {
            document.querySelectorAll('.qdrant-sidebar-item')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPointDetail(item, detail, onUpdate);
        };
        sidebar.appendChild(btn);
    });

    // Auto‑select first point if any
    if (results.length) sidebar.firstChild.click();
}
