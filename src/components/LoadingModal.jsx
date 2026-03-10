import { ShoppingCart } from 'lucide-react';

const supermarkets = [
    { name: 'Líder', color: '#0032a0' },
    { name: 'Unimarc', color: '#e31e24' },
    { name: 'Santa Isabel', color: '#d4145a' },
    { name: 'Tottus', color: '#00843d' },
    { name: 'Acuenta', color: '#f59e0b' }
];

export default function LoadingModal({ isOpen }) {
    if (!isOpen) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-card">
                {/* Spinner */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <div className="spinner-ring"></div>
                        <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <ShoppingCart style={{ color: '#16a34a' }} size={22} />
                        </div>
                    </div>
                </div>

                <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    color: '#1e293b', 
                    marginBottom: '4px' 
                }}>
                    Obteniendo precios...
                </h3>
                <p style={{ 
                    fontSize: '14px', 
                    color: '#94a3b8', 
                    textAlign: 'center', 
                    marginBottom: '28px' 
                }}>
                    Consultando supermercados en tiempo real
                </p>

                {/* Supermarket checklist */}
                <div style={{ 
                    background: '#f8fafc', 
                    borderRadius: '16px', 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    {supermarkets.map((market, i) => (
                        <div
                            key={market.name}
                            className="animate-fade-in"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                                animationDelay: `${i * 150}ms`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: market.color,
                                    animation: 'spin 1.5s linear infinite',
                                    boxShadow: `0 0 8px ${market.color}44`
                                }}></div>
                                <span style={{ 
                                    fontWeight: 600, 
                                    fontSize: '14px', 
                                    color: market.color 
                                }}>
                                    {market.name}
                                </span>
                            </div>
                            <span style={{ 
                                fontSize: '12px', 
                                color: '#94a3b8', 
                                fontWeight: 500 
                            }}>
                                Consultando...
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
