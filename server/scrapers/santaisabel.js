const axios = require('axios');

const log = (message) => console.log(message);

async function scrapeSantaIsabel(query) {
    log('[Santa Isabel] Iniciando (API Cencosud BFF)...');

    try {
        const url = 'https://be-reg-groceries-bff-sisa.ecomm.cencosud.com/catalog/plp';

        const { data } = await axios.post(url, {
            store: 'pedrofontova',
            collections: [],
            fullText: query,
            brands: [],
            hideUnavailableItems: false,
            from: 0,
            to: 19,
            orderBy: '',
            selectedFacets: [],
            promotionalCards: false,
            sponsoredProducts: true
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': 'be-reg-groceries-sisa-catalog-wdhhq5a2fken',
                'x-client-platform': 'web',
                'x-client-version': '2.3.3',
                'Origin': 'https://www.santaisabel.cl',
                'Referer': 'https://www.santaisabel.cl/'
            },
            timeout: 20000
        });

        const products = [];
        const productList = data?.products || [];

        for (const product of productList) {
            if (products.length >= 15) break;

            const item = product?.items?.[0] || {};
            const name = item?.name || product?.name || '';
            const price = item?.price || 0;
            const listPrice = item?.listPrice || price;
            const image = item?.images?.[0] || '';
            const brand = product?.brand || '';
            const slug = product?.slug || '';

            if (name && price > 0) {
                products.push({
                    id: `santaisabel-${products.length}`,
                    productName: name,
                    brand: brand || 'Santa Isabel',
                    category: 'Supermercado',
                    image: image,
                    supermarketName: 'Santa Isabel',
                    supermarketLogo: 'https://www.santaisabel.cl/arquivos/logo-santa-isabel.png',
                    price: Math.round(price),
                    normalPrice: Math.round(listPrice),
                    unitPrice: '',
                    stock: true,
                    productUrl: slug ? `https://www.santaisabel.cl/${slug}/p` : ''
                });
            }
        }

        log(`[Santa Isabel] Encontrados ${products.length} resultados`);
        return { results: products.slice(0, 15) };
    } catch (err) {
        log(`[Santa Isabel] Error: ${err.message}`);
        return { results: [], error: err.message };
    }
}

module.exports = scrapeSantaIsabel;
