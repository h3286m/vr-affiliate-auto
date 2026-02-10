
import fs from 'fs';
import path from 'path';

function probe() {
    const csvPath = 'src/data/HQVR_data.csv';
    const enrichmentPath = 'src/data/actress_enrichment.csv';

    if (fs.existsSync(csvPath)) {
        const content = fs.readFileSync(csvPath, 'utf-8');
        console.log('HQVR_data headers:', content.split('\n')[0]);
        console.log('HQVR_data sample:', content.split('\n')[1]);
    }

    if (fs.existsSync(enrichmentPath)) {
        // Enrichment usually contains height/cup
        const content = fs.readFileSync(enrichmentPath, 'utf-8');
        console.log('\nEnrichment headers:', content.split('\n')[0]);
        console.log('Enrichment sample:', content.split('\n')[1]);
    }
}

probe();
