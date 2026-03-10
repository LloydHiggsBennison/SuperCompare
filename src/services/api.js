const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function searchProducts(query) {
    const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Error al buscar productos');
    }
    return response.json();
}

export async function searchStore(store, query) {
    const storeMap = {
        'Líder': 'lider',
        'Unimarc': 'unimarc',
        'Santa Isabel': 'santaisabel',
        'Tottus': 'tottus',
        'Acuenta': 'acuenta'
    };
    const storeKey = storeMap[store] || store.toLowerCase().replace(' ', '');
    const response = await fetch(`${API_URL}/api/search/${storeKey}?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Error en ${store}`);
    }
    return response.json();
}
