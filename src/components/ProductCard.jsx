import { ShoppingCart, ExternalLink } from 'lucide-react';

const badgeClass = {
    'Líder': 'badge-lider',
    'Unimarc': 'badge-unimarc',
    'Santa Isabel': 'badge-santaisabel',
    'Tottus': 'badge-tottus',
    'Acuenta': 'badge-acuenta'
};

const accentColor = {
    'Líder': '#0032a0',
    'Unimarc': '#e31e24',
    'Santa Isabel': '#d4145a',
    'Tottus': '#00843d',
    'Acuenta': '#f59e0b'
};

export default function ProductCard({ product, index }) {
    const badge = badgeClass[product.supermarketName] || 'badge-tottus';
    const accent = accentColor[product.supermarketName] || '#16a34a';

    const hasDiscount = product.normalPrice > product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.normalPrice - product.price) / product.normalPrice) * 100)
        : 0;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div
            className="product-card animate-slide-up"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Header: badge + discount */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
                <span className={`badge ${badge}`}>{product.supermarketName}</span>
                {hasDiscount && (
                    <span className="badge badge-discount">-{discountPercent}%</span>
                )}
            </div>

            {/* Product image */}
            <div className="product-image-wrapper">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.productName}
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div style={{ 
                    display: product.image ? 'none' : 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '100%', 
                    height: '100%',
                    background: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <ShoppingCart style={{ color: '#cbd5e1' }} size={48} />
                </div>
            </div>

            {/* Product info */}
            <div style={{ flex: 1, padding: '0 20px 8px' }}>
                {product.brand && (
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: accent,
                        marginBottom: '4px',
                        letterSpacing: '0.2px'
                    }}>
                        <span style={{ 
                            width: '5px', 
                            height: '5px', 
                            borderRadius: '50%', 
                            backgroundColor: accent 
                        }}></span>
                        {product.brand}
                    </div>
                )}
                <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#1e293b', 
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '40px'
                }}>
                    {product.productName}
                </h3>
                {product.unitPrice && typeof product.unitPrice === 'string' && (
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {product.unitPrice}
                    </p>
                )}
            </div>

            {/* Price + action */}
            <div style={{ 
                padding: '12px 20px 20px', 
                borderTop: '1px solid #f1f5f9',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginTop: 'auto'
            }}>
                <div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '2px' }}>
                        Precio
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: accent, lineHeight: 1 }}>
                            {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                            <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                {formatPrice(product.normalPrice)}
                            </span>
                        )}
                    </div>
                </div>
                {product.productUrl && (
                    <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            backgroundColor: accent,
                            color: 'white',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${accent}33`
                        }}
                        title="Ver en tienda"
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
            </div>
        </div>
    );
}
