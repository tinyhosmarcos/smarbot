import { fetchCompanies, fetchConversations, fetchMessages } from '../lib/api.js';
import { renderCompanies, renderConversations, renderMessages } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const companyFilterInput = document.getElementById('company-filter');

    let allCompanies = [];

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    if (startDateInput) startDateInput.value = today;
    if (endDateInput) endDateInput.value = today;

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const start = startDateInput.value;
            const end = endDateInput.value;

            if (!start || !end) {
                alert('Por favor selecciona ambas fechas');
                return;
            }

            try {
                const list = document.getElementById('company-list');
                if (list) list.innerHTML = '<div class="loading">Cargando...</div>';

                // Fetch companies from API
                allCompanies = await fetchCompanies(start, end);

                // Render all companies initially
                renderCompanies(allCompanies, handleCompanySelect);

                // Reset other views
                const convList = document.getElementById('conversation-list');
                if (convList) convList.innerHTML = '';

                const msgContainer = document.getElementById('messages-container');
                if (msgContainer) msgContainer.innerHTML = '<div class="empty-state">Selecciona una conversación</div>';
            } catch (error) {
                console.error(error);
                const list = document.getElementById('company-list');
                if (list) list.innerHTML = '<div class="error">Error al cargar</div>';
            }
        });
    }

    // Client-side filtering
    if (companyFilterInput) {
        companyFilterInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allCompanies.filter(c =>
                c.RazonSocial.toLowerCase().includes(term) ||
                c.Ruc.includes(term)
            );
            renderCompanies(filtered, handleCompanySelect);
        });
    }
});

async function handleCompanySelect(company) {
    try {
        const list = document.getElementById('conversation-list');
        if (list) list.innerHTML = '<div class="loading">Cargando...</div>';

        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const start = startDateInput.value;
        const end = endDateInput.value;

        const conversations = await fetchConversations(company.Identidad, start, end);
        renderConversations(conversations, handleConversationSelect);

        const header = document.getElementById('current-company-name');
        if (header) header.textContent = company.RazonSocial;

        const rucBadge = document.getElementById('current-company-ruc');
        if (rucBadge) rucBadge.textContent = company.Ruc;

        const companyInfo = document.getElementById('company-info');
        if (companyInfo) companyInfo.style.display = 'block';

    } catch (error) {
        console.error(error);
        const list = document.getElementById('conversation-list');
        if (list) list.innerHTML = '<div class="error">Error al cargar</div>';
    }
}

let currentConversationId = null;

async function handleConversationSelect(conversation) {
    currentConversationId = conversation.ConversationId;
    try {
        const container = document.getElementById('messages-container');
        if (container) container.innerHTML = '<div class="loading">Cargando...</div>';
        const messages = await fetchMessages(conversation.ConversationId);
        renderMessages(messages);
        
        // Set callback for refreshing messages after Qdrant updates
        if (container) {
            container._onQdrantUpdate = async () => {
                try {
                    const updatedMessages = await fetchMessages(currentConversationId);
                    renderMessages(updatedMessages);
                } catch (error) {
                    console.error('Error al actualizar mensajes:', error);
                }
            };
        }
    } catch (error) {
        console.error(error);
        const container = document.getElementById('messages-container');
        if (container) container.innerHTML = '<div class="error">Error al cargar</div>';
    }
}
