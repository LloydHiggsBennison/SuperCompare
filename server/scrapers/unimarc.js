const axios = require('axios');
const crypto = require('crypto');

const log = (message) => console.log(message);

const parsePrice = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return Math.round(val);
    const match = String(val).match(/[\d.]+/);
    return match ? parseInt(match[0].replace(/\./g, '')) : 0;
};

async function scrapeUnimarc(query) {
    log('[Unimarc] Iniciando (API BFF)...');

    try {
        const url = 'https://bff-unimarc-ecommerce.unimarc.cl/catalog/product/search';

        log(`[Unimarc] Consultando API para: ${query}`);
        const { data } = await axios.post(url, {
            from: '0',
            orderBy: '',
            searching: query,
            promotionsOnly: false,
            to: '19',
            userTriggered: true
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
                'Content-Type': 'application/json',
                'channel': 'UNIMARC',
                'source': 'web',
                'version': '1.0.0',
                'anonymous': crypto.randomUUID(),
                'session': crypto.randomUUID(),
                'Origin': 'https://www.unimarc.cl',
                'Referer': 'https://www.unimarc.cl/'
            },
            timeout: 25000
        });

        const products = [];
        const availableProducts = data?.availableProducts || [];

        for (const product of availableProducts) {
            if (products.length >= 15) break;

            // Unimarc structure: product.item contains name, brand, images, slug
            // product.price contains price, listPrice, ppum
            const item = product?.item || {};
            const priceInfo = product?.price || {};

            const name = item.name || item.nameComplete || '';
            const brand = item.brand || '';
            const price = parsePrice(priceInfo.price);
            const listPrice = parsePrice(priceInfo.listPrice) || price;
            const ppum = priceInfo.ppum || '';
            const image = item.images?.[0] || '';
            const slug = item.slug || '';

            if (name && price > 0) {
                products.push({
                    id: `unimarc-${products.length}`,
                    productName: name,
                    brand: brand || 'Unimarc',
                    category: 'Supermercado',
                    image: image,
                    supermarketName: 'Unimarc',
                    supermarketLogo: 'https://www.unimarc.cl/arquivos/logo-unimarc.png',
                    price: price,
                    normalPrice: listPrice,
                    unitPrice: ppum,
                    stock: true,
                    productUrl: slug ? `https://www.unimarc.cl${slug}` : ''
                });
            }
        }

        log(`[Unimarc] Encontrados ${products.length} resultados`);
        return products;

    } catch (error) {
        log(`[Unimarc] Error en performUnimarcSearch: ${error.message}`);
        throw error; // Re-throw to be caught by scrapeUnimarc
    }
}

async function scrapeUnimarc(query) {
    try {
        const results = await performUnimarcSearch(query);
        return { results: results.slice(0, 15) };
    } catch (err) {
        log(`[Unimarc] Error: ${err.message}`);
        return { results: [], error: err.message };
    }
}

module.exports = scrapeUnimarc;
