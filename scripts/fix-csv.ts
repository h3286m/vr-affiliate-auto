
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');

function fixCsv() {
    console.log('Attempting to recover HQVR_data.csv...');

    // Read raw buffer to handle encoding issues
    const buffer = fs.readFileSync(CSV_PATH);

    // Try reading as UTF-8 first
    let content = buffer.toString('utf-8');

    // If it's suspiciously garbled, it might be Shift-JIS or something else
    // But since I wrote it as UTF-8 from Node, it's probably UTF-8 with some weirdness.

    try {
        const records = parse(content, {
            columns: false,
            relax_quotes: true,
            relax_column_count: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Successfully parsed ${records.length} records.`);

        // Use a more robust stringifier pattern
        const escape = (val: string) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            // Always quote if it contains comma, quote, or newline
            if (/[,"\n\r]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const cleanCsv = records.map(row => row.map(escape).join(',')).join('\n');

        fs.writeFileSync(CSV_PATH, cleanCsv, 'utf-8');
        console.log('Cleaned CSV saved.');

    } catch (e) {
        console.error('Failed to parse CSV even with relaxed rules:', e);

        // Fallback: Extremely manual line-by-line fix if parser fails
        console.log('Trying manual line-by-line recovery...');
        const lines = content.split(/\r?\n/);
        const fixedLines = lines.map(line => {
            // Try to fix the ""cid" issue observed
            return line.replace(/^""/, '"').replace(/,""/g, ',"');
        });
        fs.writeFileSync(CSV_PATH, fixedLines.join('\n'), 'utf-8');
    }
}

fixCsv();
