import { useState, useMemo } from 'react';
import { ShoppingCart, Info, TrendingDown, Sparkles, SlidersHorizontal } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import LoadingModal from './components/LoadingModal';
import FilterSidebar from './components/FilterSidebar';
import { searchProducts } from './services/api';

function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ supermarkets: new Set(), brands: new Set() });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const handleSearch = async (searchQuery) => {
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setFilters({ supermarkets: new Set(), brands: new Set() });
        try {
            const data = await searchProducts(searchQuery);
            // Handle both plain array and structured response
            const products = Array.isArray(data) ? data : (data.results || []);
            setResults(products);
            
            // Handle partial errors
            if (!Array.isArray(data) && data.errors && Object.keys(data.errors).length > 0) {
                const failedStores = Object.keys(data.errors).join(', ');
                setError(`Aviso: Algunos supermercados no respondieron (${failedStores}). El resto de resultados se muestra abajo.`);
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter results
    const filteredResults = useMemo(() => {
        return results.filter(p => {
            if (filters.supermarkets.size > 0 && !filters.supermarkets.has(p.supermarketName)) return false;
            if (filters.brands.size > 0) {
                const rawBrand = p.brand || '';
                if (!rawBrand) return false;
                const normalized = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1).toLowerCase();
                if (!filters.brands.has(normalized)) return false;
            }
            return true;
        });
    }, [results, filters]);

    const hasActiveFilters = filters.supermarkets.size > 0 || filters.brands.size > 0;

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', top: '-200px', right: '-200px', width: '500px', height: '500px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'fixed', bottom: '-150px', left: '-150px', width: '400px', height: '400px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}></div>

            <LoadingModal isOpen={loading} />

            {/* Header */}
            <header style={{ paddingTop: '48px', paddingBottom: '12px', textAlign: 'center' }}>
                <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="animate-fade-in" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 22px', borderRadius: '100px', marginBottom: '24px',
                        fontSize: '15px', fontWeight: 700, color: '#1e293b',
                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                    }}>
                        <ShoppingCart style={{ color: '#16a34a' }} size={20} />
                        SuperCompare
                    </div>

                    <h1 className="animate-fade-in" style={{
                        fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#0f172a',
                        lineHeight: 1.15, marginBottom: '12px', letterSpacing: '-0.02em'
                    }}>
                        Cotiza tus compras{' '}
                        <span className="gradient-text">al mejor precio</span>
                    </h1>

                    <p className="animate-fade-in" style={{
                        fontSize: '16px', color: '#64748b', maxWidth: '480px',
                        margin: '0 auto 32px', lineHeight: 1.6
                    }}>
                        Compara precios en tiempo real de los principales supermercados de Chile.
                    </p>

                    <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading} />

                    <div style={{ maxWidth: '600px', margin: '16px auto 0' }}>
                        <div className="info-banner" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <Info size={16} style={{ marginTop: '1px', flexShrink: 0, color: '#16a34a' }} />
                            <p>
                                <strong>Información:</strong> Los precios se obtienen en tiempo real desde las páginas oficiales y pueden variar al comprar presencialmente.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content with sidebar */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>
                {/* Error */}
                {error && (
                    <div className="animate-fade-in" style={{
                        maxWidth: '600px', margin: '0 auto 32px', padding: '14px 20px',
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px',
                        fontSize: '14px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <Info size={16} style={{ flexShrink: 0 }} /> {error}
                    </div>
                )}

                {/* Results layout: sidebar + grid */}
                {hasSearched && !loading && results.length > 0 && (
                    <div className="results-layout">
                        {/* Sidebar - desktop */}
                        <div className="sidebar-desktop">
                            <FilterSidebar results={results} filters={filters} setFilters={setFilters} />
                        </div>

                        {/* Main results area */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Results header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
                            }}>
                                <div className="animate-fade-in" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    color: '#64748b', fontSize: '14px'
                                }}>
                                    <Sparkles size={16} style={{ color: '#16a34a' }} />
                                    <p>
                                        Mostrando <strong style={{ color: '#1e293b' }}>{filteredResults.length}</strong>
                                        {hasActiveFilters && <> de {results.length}</>} resultados
                                    </p>
                                </div>

                                {/* Mobile filter toggle */}
                                <button
                                    className="mobile-filter-btn"
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    style={{
                                        display: 'none', alignItems: 'center', gap: '6px',
                                        padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: showMobileFilters ? '#f0fdf4' : 'white', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: 600, color: '#475569'
                                    }}
                                >
                                    <SlidersHorizontal size={15} />
                                    Filtros
                                    {hasActiveFilters && (
                                        <span style={{
                                            background: '#16a34a', color: 'white', fontSize: '10px',
                                            padding: '1px 6px', borderRadius: '6px', fontWeight: 700
                                        }}>
                                            {filters.supermarkets.size + filters.brands.size}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Mobile filters panel */}
                            {showMobileFilters && (
                                <div className="sidebar-mobile animate-fade-in" style={{ marginBottom: '20px' }}>
                                    <FilterSidebar results={results} filters={filters} setFilters={setFilters} />
                                </div>
                            )}

                            {/* Product grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '20px'
                            }}>
                                {filteredResults.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>

                            {/* No filtered results */}
                            {filteredResults.length === 0 && hasActiveFilters && (
                                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '48px 20px' }}>
                                    <TrendingDown style={{ margin: '0 auto 12px', color: '#cbd5e1' }} size={48} />
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                        Sin resultados con estos filtros
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                        Prueba quitando algunos filtros
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* No results at all */}
                {hasSearched && !loading && results.length === 0 && !error && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '64px 20px' }}>
                        <TrendingDown style={{ margin: '0 auto 16px', color: '#cbd5e1' }} size={56} />
                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                            No se encontraron resultados
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
                            Intenta buscando con otro nombre de producto
                        </p>
                    </div>
                )}

                {/* Initial skeleton */}
                {!hasSearched && !loading && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '20px', marginTop: '32px', opacity: 0.3
                    }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                background: 'white', borderRadius: '20px', padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}>
                                <div className="skeleton" style={{ height: '140px', marginBottom: '16px' }}></div>
                                <div className="skeleton" style={{ height: '14px', width: '75%', marginBottom: '8px' }}></div>
                                <div className="skeleton" style={{ height: '14px', width: '50%' }}></div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer style={{
                textAlign: 'center', padding: '24px 20px', fontSize: '13px',
                color: '#94a3b8', borderTop: '1px solid #f1f5f9'
            }}>
                <p>SuperCompare © 2026 — Cotizador de Supermercados de Chile</p>
                <p style={{ marginTop: '4px', fontSize: '11px', color: '#cbd5e1' }}>
                    Líder • Unimarc • Santa Isabel • Tottus • Acuenta
                </p>
            </footer>
        </div>
    );
}

export default App;
