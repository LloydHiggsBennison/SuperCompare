const express = require('express');
const cors = require('cors');

// Import all supermarket scrapers
const scrapeLider = require('./scrapers/lider');
const scrapeUnimarc = require('./scrapers/unimarc');
const scrapeSantaIsabel = require('./scrapers/santaisabel');
const scrapeTottus = require('./scrapers/tottus');
const scrapeAcuenta = require('./scrapers/acuenta');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const log = (message) => console.log(message);

// Scrapers object for easy management
const scrapers = {
    lider: scrapeLider,
    unimarc: scrapeUnimarc,
    santaisabel: scrapeSantaIsabel,
    tottus: scrapeTottus,
    acuenta: scrapeAcuenta
};

// Main search endpoint
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    log(`\n🔍 Buscando: ${q}`);
    log('\nConsultando: Líder, Unimarc, Santa Isabel, Tottus, Acuenta\n');

    // Run all scrapers in parallel
    const scraperNames = Object.keys(scrapers);
    const promiseResults = await Promise.allSettled(Object.values(scrapers).map(scraper => scraper(q)));

    // Process results with detailed logging
    const allResults = promiseResults
        .map((p, index) => {
            const scraperName = scraperNames[index];
            if (p.status === 'fulfilled') {
                const count = p.value.length;
                log(`✅ ${scraperName}: ${count} productos`);
                return p.value;
            } else {
                log(`❌ ${scraperName} falló: ${p.reason?.message || 'Error desconocido'}`);
                return [];
            }
        })
        .flat()
        .sort((a, b) => a.price - b.price);

    // Count by supermarket
    const bySupermarket = {};
    allResults.forEach(product => {
        bySupermarket[product.supermarketName] = (bySupermarket[product.supermarketName] || 0) + 1;
    });

    log('\n📊 Productos por supermercado:');
    Object.entries(bySupermarket).forEach(([name, count]) => {
        log(`   ${name}: ${count}`);
    });

    log(`\n✅ Total: ${allResults.length} resultados\n`);
    res.json(allResults);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', scrapers: Object.keys(scrapers) });
});

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🛒 SuperCompare - Cotizador de Supermercados`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Scrapers disponibles: ${Object.keys(scrapers).join(', ')}`);
    console.log(`${'='.repeat(60)}\n`);
});
