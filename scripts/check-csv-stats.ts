
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = path.join(process.cwd(), 'src', 'data', 'HQVR_data.csv');
const EXISTING_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.json');

function main() {
    if (!fs.existsSync(CSV_PATH)) {
        console.error('CSV not found');
        return;
    }

    // Load Existing
    const existingIds = new Set();
    if (fs.existsSync(EXISTING_JSON_PATH)) {
        const data = JSON.parse(fs.readFileSync(EXISTING_JSON_PATH, 'utf-8'));
        data.forEach((a: any) => existingIds.add(a.id));
    }

    // Load CSV
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, { from_line: 2 });

    const csvIds = new Set();
    records.forEach((row: string[]) => {
        // ID is at index 4 (csv format in previous step)
        // row[4] "1078559, 1078560" maybe?
        const ids = row[4];
        if (ids) {
            ids.split(',').forEach((id: string) => {
                const clean = id.trim();
                // Check if it looks like a DMM ID (numeric usually)
                if (clean && !isNaN(Number(clean)) && clean !== '0') {
                    csvIds.add(clean);
                }
            });
        }
    });

    const totalCsv = csvIds.size;
    const missings: string[] = [];
    csvIds.forEach((id: unknown) => {
        if (!existingIds.has(id)) {
            missings.push(id as string);
        }
    });

    console.log(`Total Unique Actresses in CSV: ${totalCsv}`);
    console.log(`Already in JSON: ${totalCsv - missings.length}`);
    console.log(`New Actresses (Need Fetch): ${missings.length}`);
    console.log(`Estimated Time (@200ms/req): ~${Math.ceil(missings.length * 0.2)} seconds`);
}

main();
