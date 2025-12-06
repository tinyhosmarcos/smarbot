import { formatDate } from '../../lib/utils.js';

export function renderConversations(conversations, onSelect) {
    const container = document.getElementById('conversation-list');
    if (!container) return;
    container.innerHTML = '';

    if (!conversations?.length) {
        container.innerHTML = '<div class="empty-list">No hay conversaciones.</div>';
        return;
    }

    conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.innerHTML = `
            <div class="conv-header">
                <span class="conv-id">#${conv.ConversationId}</span>
                <span class="conv-status ${conv.Status?.toLowerCase() || ''}">${conv.Status || 'Unknown'}</span>
            </div>
            <div class="conv-date">${formatDate(conv.StartedAt)}</div>
        `;
        div.onclick = () => {
            document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            onSelect(conv);
        };
        container.appendChild(div);
    });
}
