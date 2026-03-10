import { ShoppingCart, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const supermarkets = [
    { name: 'Líder', color: '#0032a0' },
    { name: 'Unimarc', color: '#e31e24' },
    { name: 'Santa Isabel', color: '#d4145a' },
    { name: 'Tottus', color: '#00843d' },
    { name: 'Acuenta', color: '#f59e0b' }
];

export default function LoadingModal({ isOpen, progress = {} }) {
    if (!isOpen) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-card" style={{ maxWidth: '400px', width: '90%' }}>
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
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    {supermarkets.map((market, i) => {
                        const status = progress[market.name] || 'pending';
                        const isDone = status === 'done';
                        const isError = status === 'error';
                        const isLoading = status === 'loading';

                        return (
                            <div
                                key={market.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: isDone ? '#f0fdf4' : isError ? '#fef2f2' : 'white',
                                    borderRadius: '12px',
                                    border: `1px solid ${isDone ? '#bbf7d0' : isError ? '#fecaca' : '#f1f5f9'}`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: market.color,
                                        opacity: isDone || isError ? 0.3 : 1,
                                        animation: isLoading ? 'pulse 1.5s infinite' : 'none'
                                    }}></div>
                                    <span style={{ 
                                        fontWeight: 600, 
                                        fontSize: '13px', 
                                        color: isDone ? '#166534' : isError ? '#991b1b' : '#334155' 
                                    }}>
                                        {market.name}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isDone && <CheckCircle2 size={16} color="#16a34a" />}
                                    {isError && <XCircle size={16} color="#dc2626" />}
                                    {isLoading && <Loader2 size={16} color="#16a34a" className="animate-spin" />}
                                    <span style={{ 
                                        fontSize: '11px', 
                                        color: isDone ? '#16a34a' : isError ? '#dc2626' : '#94a3b8', 
                                        fontWeight: 600 
                                    }}>
                                        {isDone ? 'Listo' : isError ? 'Error' : isLoading ? 'Buscando...' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
