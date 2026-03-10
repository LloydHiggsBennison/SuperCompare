const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeLider(query) {
    log('[Líder] Iniciando...');
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--js-flags="--max-old-space-size=256"', // Limit V8 memory
                '--disable-extensions',
                '--disable-component-update',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-default-apps',
                '--disable-hang-monitor',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-sync'
            ]
        });

        const page = await browser.newPage();
        
        // Aggressive resource blocking to save memory
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            const url = req.url().toLowerCase();
            const blockedTypes = ['image', 'font', 'media', 'stylesheet', 'other'];
            const blockedDomains = ['google-analytics', 'facebook', 'hotjar', 'doubleclick', 'analytics', 'bing', 'clarity'];

            if (blockedTypes.includes(type) || blockedDomains.some(d => url.includes(d))) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Use realistic headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });

        // Set critical cookies before navigation
        await page.setCookie(
            { name: 'assortmentStoreId', value: '0000057', domain: '.lider.cl', path: '/' },
            { name: 'hasLocData', value: '1', domain: '.lider.cl', path: '/' },
            { name: 'NEXT_LOCALE', value: 'es', domain: 'super.lider.cl', path: '/' },
            { name: 'defaultAccessibility', value: 'false', domain: 'super.lider.cl', path: '/' },
            { name: 'hasCID', value: 'false', domain: '.lider.cl', path: '/' },
            { name: 'AID', value: 'wm_no_aid', domain: '.lider.cl', path: '/' }
        );

        // Collect products via API interception
        let apiProducts = [];
        page.on('response', async (response) => {
            try {
                if (response.url().includes('/orchestra/graphql/search') && response.status() === 200) {
                    const json = await response.json();
                    const stacks = json?.data?.search?.searchResult?.itemStacks || [];
                    for (const stack of stacks) {
                        for (const item of (stack.itemsV2 || [])) {
                            if (apiProducts.length >= 15) break;
                            if (item?.__typename === 'Product' && item?.name && item?.priceInfo?.currentPrice?.price > 0) {
                                apiProducts.push(extractItem(item));
                            }
                        }
                    }
                    if (apiProducts.length > 0) log(`[Líder] API: ${apiProducts.length} productos`);
                }
            } catch (e) { /* ignore */ }
        });

        const url = `https://super.lider.cl/search?q=${encodeURIComponent(query)}`;
        log(`[Líder] Navegando a: ${url}`);

        // Navigate with a generous timeout
        const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Check for bot challenge or redirect
        const currentUrl = page.url();
        log(`[Líder] URL actual: ${currentUrl}`);
        
        if (currentUrl.includes('/blocked') || currentUrl.includes('challenge')) {
            log('[Líder] ⚠️ Bloqueado por WAF/Bot detection. Reintentando...');
            // Wait for challenge to potentially resolve
            await new Promise(r => setTimeout(r, 2000));
            // Try to navigate again
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        }

        // Wait for any remaining requests
        await new Promise(r => setTimeout(r, 3000));

        // Method 1: API interception
        if (apiProducts.length > 0) {
            log(`[Líder] Encontrados ${apiProducts.length} productos (API)`);
            return formatProducts(apiProducts);
        }

        // Method 2: __NEXT_DATA__ extraction
        const ssrProducts = await page.evaluate(() => {
            try {
                const el = document.getElementById('__NEXT_DATA__');
                if (!el) return [];
                const data = JSON.parse(el.textContent);
                const sr = data?.props?.pageProps?.initialData?.searchResult;
                if (!sr) return [];

                const results = [];
                for (const stack of (sr.itemStacks || [])) {
                    for (const item of (stack.itemsV2 || [])) {
                        if (results.length >= 15) break;
                        if (item.__typename && item.__typename !== 'Product') continue;
                        const name = item.name || '';
                        const price = item.priceInfo?.currentPrice?.price || 0;
                        if (name && price > 0) {
                            results.push({
                                name,
                                brand: item.brand || '',
                                price: Math.round(price),
                                unitPrice: item.priceInfo?.unitPrice?.priceString || '',
                                image: item.imageInfo?.thumbnailUrl || '',
                                url: item.canonicalUrl || ''
                            });
                        }
                    }
                }
                return results;
            } catch (e) { return []; }
        });

        if (ssrProducts.length > 0) {
            log(`[Líder] Encontrados ${ssrProducts.length} productos (SSR)`);
            return formatProducts(ssrProducts);
        }

        // Method 3: DOM scraping
        log('[Líder] Intentando DOM...');
        const domProducts = await page.evaluate(() => {
            const results = [];
            // Look for product links
            const links = document.querySelectorAll('a[href*="/ip/"]');
            const seen = new Set();

            links.forEach(link => {
                if (results.length >= 15) return;
                // Find the product card container
                let card = link;
                for (let i = 0; i < 5; i++) {
                    card = card.parentElement;
                    if (!card) break;
                    if (card.querySelector('img') && card.innerText?.includes('$')) break;
                }
                if (!card || seen.has(card)) return;
                seen.add(card);

                const text = card.innerText || '';
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                
                let price = 0;
                for (const line of lines) {
                    const m = line.match(/\$\s*([\d.]+)/);
                    if (m) { 
                        const p = parseInt(m[1].replace(/\./g, '')); 
                        if (p > 100 && p < 500000) { price = p; break; }
                    }
                }

                const nameLines = lines.filter(l => 
                    l.length > 8 && 
                    !l.startsWith('$') && 
                    !l.includes('Agregar') && 
                    !l.includes('precio') &&
                    !l.includes('Robot') &&
                    !/^\d+$/.test(l)
                );
                const name = nameLines[0] || '';
                const img = card.querySelector('img');
                const image = img?.src || '';

                if (name && price > 0) {
                    results.push({ name, brand: '', price, unitPrice: '', image, url: link.href });
                }
            });
            return results;
        });

        if (domProducts.length > 0) {
            const formatted = formatProducts(domProducts);
            log(`[Líder] Encontrados ${formatted.length} productos (DOM)`);
            if (formatted.length === 0) {
                const sample = await page.evaluate(() => document.body.innerText.slice(0, 300));
                log(`[Líder] 0 resultados después de formatear. Muestra de página: ${sample.replace(/\n/g, ' ')}`);
            }
            return formatted;
        }

        // Diagnostic log if 0 results
        const pageSample = await page.evaluate(() => document.body.innerText.slice(0, 300));
        log(`[Líder] 0 resultados. Muestra de página: ${pageSample.replace(/\n/g, ' ')}`);

        log('[Líder] No se encontraron resultados (posible bot challenge)');
        return [];

    } catch (error) {
        log(`[Líder] Error: ${error.message}`);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

function extractItem(item) {
    return {
        name: item.name || '',
        brand: item.brand || '',
        price: Math.round(item.priceInfo?.currentPrice?.price || 0),
        unitPrice: item.priceInfo?.unitPrice?.priceString || '',
        image: item.imageInfo?.thumbnailUrl || '',
        url: item.canonicalUrl || ''
    };
}

function formatProducts(products) {
    return products.map((p, i) => ({
        id: `lider-${i}`,
        productName: p.name,
        brand: p.brand || 'Líder',
        category: 'Supermercado',
        image: p.image,
        supermarketName: 'Líder',
        supermarketLogo: 'https://super.lider.cl/catalogo/images/site-logo.svg',
        price: p.price,
        normalPrice: p.price,
        unitPrice: p.unitPrice || '',
        stock: true,
        productUrl: p.url ? (p.url.startsWith('http') ? p.url : `https://super.lider.cl${p.url}`) : ''
    }));
}

module.exports = scrapeLider;
