import { marked } from 'marked';
import { fetchQdrantPoint } from '../../lib/api.js';
import { openQdrantModal } from './qdrantModal.js';

export function renderMessages(messages) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    container.innerHTML = '';

    if (!messages?.length) {
        container.innerHTML = '<div class="empty-state">No hay mensajes.</div>';
        return;
    }

    messages.forEach(msg => {
        const isUser = msg.Sender === 'user';
        const div = document.createElement('div');
        div.className = `message ${isUser ? 'user' : 'assistant'}`;

        const text = msg.Text ? marked.parse(msg.Text) : '';
        let extra = '';
        if (msg.Sender === 'assistant' &&
            msg.Answer === 'CONSULTA_ESPECIFICA_SMARTCLIC' &&
            msg.QdrantPoint) {
            extra = `<button class="qdrant-btn" data-qdrant="${msg.QdrantPoint}">Ver Qdrant Points</button>`;
        }

        div.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-meta"><span class="message-time">${new Date(msg.CreatedAt).toLocaleTimeString()}</span></div>
            ${extra}
        `;
        container.appendChild(div);
    });

    // Attach Qdrant button handlers
    container.querySelectorAll('.qdrant-btn').forEach(btn => {
        btn.onclick = () => {
            const ids = btn.dataset.qdrant.split(',');
            // Get callback from container if available
            const onUpdate = container._onQdrantUpdate || null;
            openQdrantModal(ids, onUpdate);
        };
    });

    // Auto‑scroll to bottom
    container.scrollTop = container.scrollHeight;
}
