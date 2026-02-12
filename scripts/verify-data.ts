import fs from 'fs';
import path from 'path';

async function verify() {
    console.log('--- Data Integrity Verification ---');
    const productsPath = path.join(process.cwd(), 'src', 'data', 'products.json');
    const actressesPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');

    if (!fs.existsSync(productsPath)) {
        console.error('products.json not found!');
        return;
    }

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const actresses = JSON.parse(fs.readFileSync(actressesPath, 'utf-8'));

    const cids = products.map((p: any) => p.content_id);
    const uniqueCids = new Set(cids);
    const hasDuplicates = cids.length !== uniqueCids.size;

    const withSample = products.filter((p: any) => p.sampleMovieURL && p.sampleMovieURL !== '').length;
    const withReview = products.filter((p: any) => p.review_average > 0).length;
    const withDescription = products.filter((p: any) => p.description && p.description !== '').length;

    console.log(`Total Products: ${products.length}`);
    console.log(`Unique CIDs: ${uniqueCids.size}`);
    console.log(`Has Duplicates: ${hasDuplicates}`);

    if (hasDuplicates) {
        const counts: any = {};
        cids.forEach((id: string) => counts[id] = (counts[id] || 0) + 1);
        const dupes = Object.keys(counts).filter(id => counts[id] > 1);
        console.log(`Duplicate CIDs found (${dupes.length}): ${dupes.slice(0, 5).join(', ')}...`);
    }

    console.log(`Products with Sample Movie: ${withSample} (${((withSample / products.length) * 100).toFixed(1)}%)`);
    console.log(`Products with Review Score: ${withReview} (${((withReview / products.length) * 100).toFixed(1)}%)`);
    console.log(`Products with Description: ${withDescription} (${((withDescription / products.length) * 100).toFixed(1)}%)`);

    // Check actresses
    const actressNamesInProducts = new Set();
    products.forEach((p: any) => {
        if (p.actresses) {
            p.actresses.forEach((a: any) => actressNamesInProducts.add(a.name));
        }
    });

    console.log(`\nTotal Actresses in actresses.json: ${actresses.length}`);
    console.log(`Unique Actress Names used in Products: ${actressNamesInProducts.size}`);

    // Verify a known duplicate from before
    const savr00976 = products.filter((p: any) => p.content_id === 'savr00976');
    console.log(`\nVerification of savr00976 (formerly duplicate): Found ${savr00976.length} entries.`);

    console.log('-----------------------------------');
}

verify().catch(console.error);
