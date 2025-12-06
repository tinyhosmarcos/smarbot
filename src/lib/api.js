
import { API_BASE_URL, API_VERSION } from './config.js';

export async function fetchCompanies(startDate, endDate) {
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();

    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/agentesEntidades?fechaInicio=${start}&fechaFin=${end}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch companies');
    return await response.json();
}

export async function fetchConversations(identidad, startDate, endDate) {
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/conversaciones/${identidad}?fechaInicio=${start}&fechaFin=${end}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
}

export async function fetchMessages(conversationId) {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/mensajesConversaciones/${conversationId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
}

export async function fetchQdrantPoint(idQdrant) {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/qdrantPoints/${idQdrant}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch Qdrant Point');
    return await response.json();
}

export async function updateQdrantPoint(payload) {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/qdrantPoints`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update Qdrant Point');
    return await response.json();
}

export async function deleteQdrantPoint(collection, idQdrant) {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/qdrantPoints/${collection}/${idQdrant}`;
    const response = await fetch(url, {
        method: 'DELETE'
    });
    // DELETE usually returns 204 No Content or 200 OK. 
    // If it returns JSON, parse it, otherwise return true/null.
    if (!response.ok) throw new Error('Failed to delete Qdrant Point');

    // Check if response has content before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : true;
}

export async function fetchAllQdrantPoints() {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/qdrantPoints`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch all Qdrant Points');
    return await response.json();
}

export async function addQdrantPoint(payload) {
    const url = `${API_BASE_URL}/api/v${API_VERSION}/agentes/qdrantPoints`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to add Qdrant Point');
    return await response.json();
}