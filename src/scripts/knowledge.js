import { fetchAllQdrantPoints, addQdrantPoint, updateQdrantPoint, deleteQdrantPoint } from '../lib/api.js';
import { formatDate } from '../lib/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const pointsList = document.getElementById('points-list');
    const searchInput = document.getElementById('search-input');
    const btnAdd = document.getElementById('btn-add');
    const newContentInput = document.getElementById('new-content');
    const pointIdInput = document.getElementById('point-id');
    const loading = document.getElementById('loading');
    const toggleForm = document.getElementById('toggle-add-form');
    const formContainer = document.getElementById('add-form-container');
    const formTitle = document.querySelector('.add-header h2');

    let allPoints = [];
    let currentEditingPoint = null;

    // Toggle Form
    if (toggleForm) {
        toggleForm.addEventListener('click', () => {
            const isHidden = formContainer.style.display === 'none';
            formContainer.style.display = isHidden ? 'block' : 'none';
            toggleForm.querySelector('span').textContent = isHidden ? '▲' : '▼';

            // Reset form if closing? No, maybe user wants to keep it.
            // But if opening, we might want to ensure it's in "Add" mode if it was closed?
            // Let's leave it as is.
        });
    }

    // Load Data
    async function loadData() {
        try {
            if (loading) loading.style.display = 'flex';
            allPoints = await fetchAllQdrantPoints();
            renderPoints(allPoints);
        } catch (error) {
            console.error(error);
            if (pointsList) pointsList.innerHTML = '<tr><td colspan="6" class="error-message">Error al cargar los datos.</td></tr>';
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    // Render Points
    function renderPoints(points) {
        if (!pointsList) return;
        pointsList.innerHTML = '';
        if (points.length === 0) {
            pointsList.innerHTML = '<tr><td colspan="6" class="empty-message">No se encontraron puntos.</td></tr>';
            return;
        }

        points.forEach(point => {
            const tr = document.createElement('tr');

            let contentText = point.Contenido || '';
            const statusClass = point.Estado === 'activo' ? 'status-active' : 'status-inactive';
            // Prioritize IdQdrant (UUID) for operations, use Id (int) for display if available
            const id = point.IdQdrant || point.Id;
            const displayId = point.Id || point.IdQdrant;

            tr.innerHTML = `
                <td><span title="${id}">#${String(displayId).substring(0, 8)}...</span></td>
                <td class="content-cell">
                    <div class="content-text" title="Clic para expandir/contraer">
                        ${contentText}
                    </div>
                </td>
                <td><span class="collection-badge">${point.Coleccion || 'General'}</span></td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ● ${point.Estado || 'Desconocido'}
                    </span>
                </td>
                <td class="date-cell">${formatDate(point.FechaCreacion)}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${id}">Editar</button>
                    <button class="btn-action btn-delete" data-id="${id}" data-collection="${point.Coleccion}">Eliminar</button>
                </td>
            `;

            // Add click event to toggle expansion
            const contentDiv = tr.querySelector('.content-text');
            if (contentDiv) {
                contentDiv.addEventListener('click', () => {
                    contentDiv.classList.toggle('expanded');
                });
            }

            pointsList.appendChild(tr);
        });

        // Add event listeners for buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => handleEdit(e.target.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => handleDelete(e.target.dataset.id, e.target.dataset.collection));
        });
    }

    // Handle Edit
    function handleEdit(id) {
        const point = allPoints.find(p => (p.Id == id || p.IdQdrant == id));
        if (!point) return;

        currentEditingPoint = point;
        newContentInput.value = point.Contenido;
        pointIdInput.value = id;

        // Update UI to Edit Mode
        formTitle.textContent = 'Editar Punto';
        btnAdd.textContent = 'Actualizar Punto';
        formContainer.style.display = 'block';
        toggleForm.querySelector('span').textContent = '▲';

        // Scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Handle Delete
    async function handleDelete(id, collection) {
        if (!confirm('¿Estás seguro de eliminar este punto?')) return;

        try {
            if (loading) loading.style.display = 'flex';
            // Default collection if missing
            const col = collection && collection !== 'undefined' ? collection : 'smart_cert_general';
            await deleteQdrantPoint(col, id);
            alert('Punto eliminado correctamente.');
            await loadData();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar: ' + error.message);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allPoints.filter(p =>
                (p.Contenido && p.Contenido.toLowerCase().includes(term)) ||
                (p.Coleccion && p.Coleccion.toLowerCase().includes(term)) ||
                String(p.Id).includes(term)
            );
            renderPoints(filtered);
        });
    }

    // Add/Update Point
    if (btnAdd) {
        btnAdd.addEventListener('click', async () => {
            const content = newContentInput.value.trim();
            if (!content) {
                alert('Por favor ingresa contenido.');
                return;
            }

            const isEdit = !!pointIdInput.value;
            const actionText = isEdit ? 'actualizar' : 'agregar';

            if (!confirm(`¿Estás seguro de ${actionText} este punto ? `)) return;

            try {
                btnAdd.disabled = true;
                btnAdd.textContent = 'Procesando...';

                if (isEdit) {
                    // Update
                    const payload = {
                        IdQdrant: pointIdInput.value,
                        Coleccion: currentEditingPoint ? currentEditingPoint.Coleccion : 'smart_cert_general',
                        Contenido: content,
                        Estado: currentEditingPoint ? currentEditingPoint.Estado : 'activo'
                    };
                    await updateQdrantPoint(payload);
                    alert('Punto actualizado correctamente.');
                } else {
                    // Add
                    const payload = {
                        Coleccion: 'smart_cert_general',
                        Contenido: content,
                        Estado: 'activo'
                    };
                    await addQdrantPoint(payload);
                    alert('Punto agregado correctamente.');
                }

                // Reset Form
                newContentInput.value = '';
                pointIdInput.value = '';
                currentEditingPoint = null;
                formTitle.textContent = 'Agregar Nuevo Punto';
                btnAdd.textContent = 'Agregar Punto';
                formContainer.style.display = 'none';
                toggleForm.querySelector('span').textContent = '▼';

                // Reload points
                await loadData();

            } catch (error) {
                console.error(error);
                alert(`Error al ${actionText}: ` + error.message);
            } finally {
                btnAdd.disabled = false;
                btnAdd.textContent = isEdit ? 'Actualizar Punto' : 'Agregar Punto';
            }
        });
    }

    // Initial Load
    loadData();
});
