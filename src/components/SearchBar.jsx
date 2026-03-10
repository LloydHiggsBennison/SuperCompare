import { Search } from 'lucide-react';

export default function SearchBar({ query, setQuery, onSearch, loading }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="search-container">
                <Search 
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    size={20} 
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca un producto... (ej: Arroz, Leche, Fideos)"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="search-btn"
                >
                    Buscar
                </button>
            </div>
        </form>
    );
}
