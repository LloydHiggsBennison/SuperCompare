const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeAcuenta(query) {
    log('[Acuenta] Iniciando (Puppeteer + DOM)...');
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8'
        });

        const url = `https://www.acuenta.cl/search?name=${encodeURIComponent(query)}`;
        log(`[Acuenta] Navegando: ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for products to render
        await page.waitForSelector('a[href*="/p/"], [class*="product"], [class*="Product"]', { timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));

        // Extract products from DOM
        const products = await page.evaluate(() => {
            const results = [];

            // Strategy 1: Find product cards by links containing /p/ (product pages)
            const productLinks = document.querySelectorAll('a[href*="/p/"]');
            const seen = new Set();

            productLinks.forEach(link => {
                if (results.length >= 15) return;
                
                // Walk up to find the product card container
                let card = link;
                for (let i = 0; i < 6; i++) {
                    card = card.parentElement;
                    if (!card) break;
                    const text = card.innerText || '';
                    if (text.includes('$') && card.querySelector('img')) break;
                }
                
                if (!card || seen.has(card)) return;
                seen.add(card);

                const text = card.innerText || '';
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);

                // Extract price - look for $ patterns
                let price = 0;
                let normalPrice = 0;
                for (const line of lines) {
                    const priceMatch = line.match(/\$\s*([\d.]+)/);
                    if (priceMatch) {
                        const p = parseInt(priceMatch[1].replace(/\./g, ''));
                        if (p > 0 && p < 500000) {
                            if (price === 0) price = p;
                            else if (p !== price) normalPrice = Math.max(price, p);
                        }
                    }
                }

                if (normalPrice === 0) normalPrice = price;

                // Extract name - longest meaningful text line
                const nameLines = lines.filter(l => 
                    l.length > 5 && 
                    !l.startsWith('$') && 
                    !l.includes('Agregar') &&
                    !l.includes('Inicio') &&
                    !l.includes('añadir') &&
                    !l.includes('Ver ') &&
                    !/^\d+$/.test(l) &&
                    !/^[\d.,]+$/.test(l) &&
                    !/^-\d+%$/.test(l)
                );
                const name = nameLines[0] || '';

                // Extract image
                const img = card.querySelector('img');
                const image = img ? (img.src || img.getAttribute('data-src') || '') : '';

                // Extract brand - usually second meaningful line
                const brand = nameLines.length > 1 ? nameLines[1] : '';

                const href = link.href || '';

                if (name && price > 0) {
                    results.push({
                        name,
                        brand: brand.length < 30 ? brand : '',
                        price,
                        normalPrice,
                        image,
                        url: href
                    });
                }
            });

            return results;
        });

        const formatted = products.map((p, i) => ({
            id: `acuenta-${i}`,
            productName: p.name,
            brand: p.brand || 'Acuenta',
            category: 'Supermercado',
            image: p.image,
            supermarketName: 'Acuenta',
            supermarketLogo: 'https://www.acuenta.cl/images/logo-acuenta.svg',
            price: p.price,
            normalPrice: p.normalPrice || p.price,
            unitPrice: '',
            stock: true,
            productUrl: p.url ? (p.url.startsWith('http') ? p.url : `https://www.acuenta.cl${p.url}`) : ''
        }));

        log(`[Acuenta] Encontrados ${formatted.length} productos`);
        return formatted;

    } catch (error) {
        log(`[Acuenta] Error: ${error.message}`);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = scrapeAcuenta;
