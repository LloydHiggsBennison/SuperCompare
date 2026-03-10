const axios = require('axios');

const log = (message) => console.log(message);

async function scrapeTottus(query) {
    log('[Tottus] Iniciando (API Falabella Browse)...');

    try {
        const url = `https://www.falabella.com/s/browse/v1/search/cl`;

        const { data } = await axios.get(url, {
            params: {
                Ntt: query,
                store: 'to_com',
                page: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.tottus.cl',
                'Referer': 'https://www.tottus.cl/'
            },
            timeout: 20000
        });

        const products = [];
        const results = data?.data?.results || [];

        for (const item of results) {
            if (products.length >= 15) break;

            const name = item?.displayName || '';
            const brand = item?.brand || '';
            const imageUrl = item?.mediaUrls?.[0] || '';
            const productUrl = item?.url || '';

            // Parse prices from the prices array
            let price = 0;
            let normalPrice = 0;
            let unitPrice = '';

            const prices = item?.prices || [];
            for (const p of prices) {
                const val = p?.price?.[0] || '';
                const numericPrice = parseInt(String(val).replace(/[.,]/g, ''));
                
                if (p?.type === 'internetPrice' || p?.type === 'cmrPrice') {
                    if (price === 0 || numericPrice < price) {
                        price = numericPrice;
                    }
                } else if (p?.type === 'normalPrice') {
                    normalPrice = numericPrice;
                }

                // Unit price - pum can be string or object {label, price, type, symbol}
                if (p?.pum) {
                    if (typeof p.pum === 'string') {
                        unitPrice = p.pum;
                    } else if (typeof p.pum === 'object') {
                        unitPrice = p.pum.label || `${p.pum.symbol || '$'}${p.pum.price || ''} x ${p.pum.type || ''}`;
                    }
                }
            }

            // If no internet price, use normal price
            if (price === 0) price = normalPrice;
            if (normalPrice === 0) normalPrice = price;

            if (name && price > 0) {
                products.push({
                    id: `tottus-${products.length}`,
                    productName: name,
                    brand: brand || 'Tottus',
                    category: 'Supermercado',
                    image: imageUrl,
                    supermarketName: 'Tottus',
                    supermarketLogo: 'https://www.tottus.cl/static/img/logo_tottus.svg',
                    price: price,
                    normalPrice: normalPrice,
                    unitPrice: unitPrice,
                    stock: true,
                    productUrl: productUrl.startsWith('http') ? productUrl : `https://www.tottus.cl${productUrl}`
                });
            }
        }

        log(`[Tottus] Encontrados ${products.length} resultados`);
        return products;

    } catch (error) {
        log(`[Tottus] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeTottus;
