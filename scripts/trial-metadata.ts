
import fs from 'fs';
import path from 'path';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'src/data/products.json');

function generateDryRun() {
    if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
        console.error('products.json not found');
        return;
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
    const samples = products.slice(0, 5);

    console.log('--- Trial Generation Metadata ---');
    samples.forEach((item: any, idx: number) => {
        const title = item.title;
        const genres = item.iteminfo?.genre?.map((g: any) => g.name).join(', ') || 'なし';
        const actresses = item.iteminfo?.actress?.map((a: any) => a.name).join(', ') || 'なし';
        const maker = item.iteminfo?.maker?.[0]?.name || '不明';

        console.log(`\n[Item ${idx + 1}]`);
        console.log(`CID: ${item.content_id}`);
        console.log(`Title: ${title}`);
        console.log(`Actresses: ${actresses}`);
        console.log(`Genres: ${genres}`);
        console.log(`Maker: ${maker}`);
    });
}

generateDryRun();
