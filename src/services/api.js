const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function searchProducts(query) {
    const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Error al buscar productos');
    }
    return response.json();
}
