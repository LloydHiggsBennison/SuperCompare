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

const scrapers = {
    lider: scrapeLider,
    unimarc: scrapeUnimarc,
    santaisabel: scrapeSantaIsabel,
    tottus: scrapeTottus,
    acuenta: scrapeAcuenta
};

// Per-supermarket search endpoint
app.get('/api/search/:supermarket', async (req, res) => {
    const { supermarket } = req.params;
    const { q } = req.query;
    
    if (!scrapers[supermarket]) {
        return res.status(404).json({ error: 'Supermarket not found' });
    }
    
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        const { results, debug, error } = await scrapers[supermarket](q);
        const responseData = {
            supermarket,
            version: '1.0.9',
            timestamp: new Date().toISOString(),
            count: results.length,
            results,
            debug: debug || null,
            error: error || null
        };
        
        res.json(responseData);
    } catch (err) {
        log(`[${supermarket.toUpperCase()}] Crash: ${err.message}`);
        res.status(500).json({ 
            supermarket,
            version: '1.0.9',
            error: err.message, 
            results: [] 
        });
    }
});

// Main search endpoint
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    log(`\n🔍 Buscando: ${q}`);
    log('Consultando: Líder, Unimarc, Santa Isabel, Tottus, Acuenta (Optimizado para Memoria)\n');

    const resultsByScraper = {};
    const errors = {};

    // 1. Light scrapers (API-based) - Run in parallel
    const lightScrapers = {
        santaisabel: scrapeSantaIsabel,
        tottus: scrapeTottus,
        unimarc: scrapeUnimarc
    };

    const lightPromiseResults = await Promise.allSettled(
        Object.entries(lightScrapers).map(async ([name, scraper]) => {
            const res = await scraper(q);
            return { name, data: res };
        })
    );

    lightPromiseResults.forEach(p => {
        if (p.status === 'fulfilled') {
            resultsByScraper[p.value.name] = p.value.data;
            log(`✅ ${p.value.name}: ${p.value.data.length} productos`);
        } else {
            const name = scraperNames.find(n => lightScrapers[n]) || 'unknown';
            errors[name] = p.reason?.message || 'Error desconocido';
            log(`❌ ${name} falló: ${errors[name]}`);
        }
    });

    // 2. Heavy scrapers (Puppeteer-based) - Run sequentially to save memory
    const heavyScrapers = [
        { name: 'lider', scraper: scrapeLider },
        { name: 'acuenta', scraper: scrapeAcuenta }
    ];

    for (const { name, scraper } of heavyScrapers) {
        try {
            const data = await scraper(q);
            resultsByScraper[name] = data;
            log(`✅ ${name}: ${data.length} productos`);
        } catch (err) {
            errors[name] = err.message || 'Error en Puppeteer';
            log(`❌ ${name} falló: ${errors[name]}`);
            resultsByScraper[name] = [];
        }
    }

    const allResults = Object.values(resultsByScraper)
        .flat()
        .sort((a, b) => a.price - b.price);

    // Count by supermarket
    const bySupermarket = {};
    allResults.forEach(product => {
        bySupermarket[product.supermarketName] = (bySupermarket[product.supermarketName] || 0) + 1;
    });

    log('\n📊 Resumen de búsqueda:');
    Object.entries(bySupermarket).forEach(([name, count]) => {
        log(`   ${name}: ${count}`);
    });
    if (Object.keys(errors).length > 0) {
        log('⚠️ Errores detectados en:', Object.keys(errors).join(', '));
    }

    log(`\n✅ Total: ${allResults.length} resultados\n`);
    res.json({
        query: q,
        version: '1.0.9',
        timestamp: new Date().toISOString(),
        count: allResults.length,
        summary: bySupermarket,
        errors,
        results: allResults
    });
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
