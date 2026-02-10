
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const PRODUCTS_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'HQVR_data.csv');

function probe() {
    const prodContent = fs.readFileSync(PRODUCTS_CSV_PATH, 'utf-8');
    const prodRecords = parse(prodContent, {
        columns: false,
        from_line: 2,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        escape: '"'
    });

    console.log(`Probe: Total rows found: ${prodRecords.length}`);
    if (prodRecords.length > 0) {
        console.log(`Probe: First row: ${JSON.stringify(prodRecords[0])}`);
        console.log(`Probe: First row length: ${prodRecords[0].length}`);
        console.log(`Probe: Actress Names (Col 3): ${prodRecords[0][3]}`);
    }
}

probe();
