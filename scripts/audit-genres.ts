import fs from 'fs';

const productsPath = 'src/data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Count occurrences of genre IDs in survived products
const genreCounts = new Map();
const genreNames = new Map();

for (const p of products) {
    if (p.iteminfo?.genre) {
        for (const g of p.iteminfo.genre) {
            genreCounts.set(g.id, (genreCounts.get(g.id) || 0) + 1);
            genreNames.set(g.id, g.name);
        }
    }
}

console.log('Survived Genre IDs (Top 20):');
const sorted = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]);
console.log(sorted.slice(0, 20).map(([id, count]) => `${id}: ${genreNames.get(id)} (${count})`).join('\n'));

// Now let's see if any of our OMNIBUS_GENRE_IDS are common in the catalog (if we can)
// Since they were filtered, we can't see them in products.json.
// Let's check the metadataMap if it was saved? No.
