
// Script to generate a CSV template for missing data
import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';

// Define minimal types
interface Actress {
    id: string;
    name: string;
    bust?: any;
    videos: any[];
}

const dataPath = path.join(process.cwd(), 'src/data/actresses.json');
const outputPath = path.join(process.cwd(), 'src/data/actress_enrichment.csv');

try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const actresses: Actress[] = JSON.parse(raw);

    const headers = ['id', 'name', 'custom_bio', 'custom_bust', 'custom_waist', 'custom_hip'];
    const rows = [headers.join(',')];

    actresses.forEach(a => {
        // Only include those missing bust data (proxy for missing profile)
        if (!a.bust) {
            // Escape name for CSV
            const name = `"${a.name.replace(/"/g, '""')}"`;
            rows.push(`${a.id},${name},,,,`);
        }
    });

    fs.writeFileSync(outputPath, rows.join('\n'));
    console.log(`Generated CSV with ${rows.length - 1} entries at ${outputPath}`);

} catch (e) {
    console.error(e);
}
