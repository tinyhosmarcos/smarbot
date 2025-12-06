import { marked } from 'marked';
import { deleteQdrantPoint, updateQdrantPoint } from '../lib/api.js';

export function renderPointDetail(item, container) {
    if (item.error) {
        container.innerHTML = `<div class="error">Error: ${item.error}</div>`;
        return;
    }

    const payload = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    const contenido = payload.Contenido || payload.content || '';
    const collection = payload.Coleccion || payload.collection || 'smart_cert_general';
    const id = payload.IdQdrant || payload.Id || payload.id;

    // Build the UI (header, display, edit area, metadata, raw JSON)
    const wrapper = document.createElement('div');
    wrapper.className = 'point-detail';

    // Header with actions
    const header = document.createElement('div');
    header.className = 'point-detail-header';
    header.innerHTML = `
        <h2>Contenido</h2>
        <div class="point-actions">
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        </div>
    `;

    // Display area
    const display = document.createElement('div');
    display.className = 'point-display';
    display.innerHTML = contenido ? marked.parse(contenido) : '<em>Sin contenido de texto</em>';

    // Edit area (hidden)
    const editArea = document.createElement('div');
    editArea.className = 'point-edit';
    editArea.style.display = 'none';
    editArea.innerHTML = `
        <textarea class="edit-textarea">${contenido}</textarea>
        <div class="edit-actions">
            <button class="save-btn">Guardar</button>
            <button class="cancel-btn">Cancelar</button>
        </div>
    `;


    const meta = document.createElement('div');
    meta.className = 'point-meta';
    const metaGrid = document.createElement('div');
    metaGrid.className = 'meta-grid';
    const excluded = { Contenido: true, content: true, text: true };
    Object.entries(payload).forEach(([k, v]) => {
        if (excluded[k]) return;
        const row = document.createElement('div');
        row.className = 'meta-row';
        row.innerHTML = `<div class="meta-key">${k}:</div><div class="meta-value">${typeof v === 'object' ? JSON.stringify(v) : v}</div>`;
        metaGrid.appendChild(row);
    });
    meta.appendChild(metaGrid);


    const raw = document.createElement('details');
    raw.className = 'raw-json';
    raw.innerHTML = `<summary>Ver JSON Crudo</summary><pre>${JSON.stringify(payload, null, 2)}</pre>`;


    wrapper.appendChild(header);
    wrapper.appendChild(display);
    wrapper.appendChild(editArea);
    wrapper.appendChild(meta);
    wrapper.appendChild(raw);
    container.innerHTML = '';
    container.appendChild(wrapper);

    // ----- Event handlers -----
    const editBtn = header.querySelector('.edit-btn');
    const deleteBtn = header.querySelector('.delete-btn');
    const saveBtn = editArea.querySelector('.save-btn');
    const cancelBtn = editArea.querySelector('.cancel-btn');
    const textarea = editArea.querySelector('.edit-textarea');

    editBtn.onclick = () => {
        display.style.display = 'none';
        editArea.style.display = 'block';
        editBtn.style.display = 'none';
    };
    cancelBtn.onclick = () => {
        display.style.display = 'block';
        editArea.style.display = 'none';
        editBtn.style.display = 'inline-block';
        textarea.value = contenido; // reset
    };
    saveBtn.onclick = async () => {
        if (!confirm('¿Confirmas la actualización?')) return;
        const newContent = textarea.value;
        const updatePayload = {
            IdQdrant: id,
            Coleccion: collection,
            Contenido: newContent,
            Estado: payload.Estado || 'activo'
        };
        try {
            await updateQdrantPoint(updatePayload);
            alert('Actualizado correctamente');
            // Refresh UI
            display.innerHTML = marked.parse(newContent);
            display.style.display = 'block';
            editArea.style.display = 'none';
            editBtn.style.display = 'inline-block';
        } catch (e) {
            console.error(e);
            alert('Error al actualizar: ' + e.message);
        }
    };
    deleteBtn.onclick = async () => {
        if (!confirm('¿Eliminar este punto? Esta acción es irreversible.')) return;
        try {
            await deleteQdrantPoint(collection, id);
            alert('Eliminado correctamente');
            container.innerHTML = '<div class="info">Punto eliminado.</div>';
        } catch (e) {
            console.error(e);
            alert('Error al eliminar: ' + e.message);
        }
    };
}
