import { Store, Tag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

export default function FilterSidebar({ results, filters, setFilters }) {
    const [showAllBrands, setShowAllBrands] = useState(false);

    // Normalize brand name to Title Case for deduplication
    const normalizeBrand = (brand) => {
        if (!brand) return '';
        return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    };

    // Extract unique supermarkets with counts
    const supermarketCounts = {};
    const brandCounts = {};

    results.forEach(p => {
        supermarketCounts[p.supermarketName] = (supermarketCounts[p.supermarketName] || 0) + 1;
        const rawBrand = p.brand || '';
        if (rawBrand) {
            const normalized = normalizeBrand(rawBrand);
            brandCounts[normalized] = (brandCounts[normalized] || 0) + 1;
        }
    });

    const supermarkets = Object.entries(supermarketCounts).sort((a, b) => b[1] - a[1]);
    const brands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
    const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

    const toggleSupermarket = (name) => {
        setFilters(prev => {
            const current = new Set(prev.supermarkets);
            if (current.has(name)) current.delete(name);
            else current.add(name);
            return { ...prev, supermarkets: current };
        });
    };

    const toggleBrand = (name) => {
        setFilters(prev => {
            const current = new Set(prev.brands);
            if (current.has(name)) current.delete(name);
            else current.add(name);
            return { ...prev, brands: current };
        });
    };

    const clearAll = () => {
        setFilters({ supermarkets: new Set(), brands: new Set() });
    };

    const activeCount = filters.supermarkets.size + filters.brands.size;

    const supermarketColors = {
        'Líder': '#0032a0',
        'Unimarc': '#e31e24',
        'Santa Isabel': '#d4145a',
        'Tottus': '#00843d',
        'Acuenta': '#f59e0b'
    };

    return (
        <aside className="filter-sidebar">
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '20px' 
            }}>
                <h2 style={{ 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/>
                    </svg>
                    Filtros
                </h2>
                {activeCount > 0 && (
                    <button 
                        onClick={clearAll}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#ef4444',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={12} /> Limpiar ({activeCount})
                    </button>
                )}
            </div>

            {/* Supermarkets section */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.8px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Store size={14} />
                    Supermercados
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {supermarkets.map(([name, count]) => {
                        const isActive = filters.supermarkets.has(name);
                        const color = supermarketColors[name] || '#64748b';
                        return (
                            <button
                                key={name}
                                onClick={() => toggleSupermarket(name)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: isActive ? `2px solid ${color}` : '2px solid transparent',
                                    background: isActive ? `${color}0D` : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '3px',
                                        backgroundColor: isActive ? color : '#cbd5e1',
                                        transition: 'all 0.2s',
                                        border: isActive ? 'none' : '1.5px solid #94a3b8'
                                    }}></div>
                                    <span style={{ 
                                        fontSize: '13px', 
                                        fontWeight: isActive ? 700 : 500, 
                                        color: isActive ? color : '#475569' 
                                    }}>
                                        {name}
                                    </span>
                                </div>
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: 600,
                                    color: isActive ? color : '#94a3b8',
                                    background: isActive ? `${color}15` : '#f1f5f9',
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Brands section */}
            {brands.length > 0 && (
                <div>
                    <h3 style={{ 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        color: '#64748b', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.8px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Tag size={14} />
                        Marcas
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {visibleBrands.map(([name, count]) => {
                            const isActive = filters.brands.has(name);
                            return (
                                <button
                                    key={name}
                                    onClick={() => toggleBrand(name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: isActive ? '2px solid #16a34a' : '2px solid transparent',
                                        background: isActive ? '#f0fdf4' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '3px',
                                            backgroundColor: isActive ? '#16a34a' : '#cbd5e1',
                                            transition: 'all 0.2s',
                                            border: isActive ? 'none' : '1.5px solid #94a3b8'
                                        }}></div>
                                        <span style={{ 
                                            fontSize: '13px', 
                                            fontWeight: isActive ? 700 : 500, 
                                            color: isActive ? '#15803d' : '#475569',
                                            maxWidth: '140px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {name}
                                        </span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 600,
                                        color: isActive ? '#16a34a' : '#94a3b8',
                                        background: isActive ? '#dcfce7' : '#f1f5f9',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        flexShrink: 0
                                    }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {brands.length > 8 && (
                        <button
                            onClick={() => setShowAllBrands(!showAllBrands)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#16a34a',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: '8px 12px',
                                marginTop: '4px'
                            }}
                        >
                            {showAllBrands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {showAllBrands ? 'Ver menos' : `Ver todas (${brands.length})`}
                        </button>
                    )}
                </div>
            )}
        </aside>
    );
}
