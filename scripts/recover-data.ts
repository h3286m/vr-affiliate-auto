
import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');
const RECOVERED_PATH = path.join(process.cwd(), 'src/data/HQVR_data_recovered.csv');

function recover() {
    console.log('Recovering data from corrupted CSV...');
    const buffer = fs.readFileSync(CSV_PATH);
    let content = buffer.toString('utf-8');

    // The main issue is that some lines are joined or have extra quotes.
    // Each record should start with a Content ID.
    // Content IDs: vrkm01746, savr00977, etc. (mostly 10-12 chars, letters then numbers)

    // Split by Content ID pattern at the start of a line or after a newline
    // But wait, the content might be very large.

    // Let's use a more granular approach.
    // We know the columns: 0: CID, 1: Title, 2: Date, 3: Actress, 4: ActressID, 5, 6, 7: URL, 8: Thumb, 9, 10: Intro

    const lines = content.split('\n');
    const recoveredRows: string[][] = [];

    console.log(`Analyzing ${lines.length} potential lines...`);

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Try to identify the CID. It usually starts the line.
        // It might be quoted like "vrkm01746" or not.
        const cidMatch = line.match(/^"??([a-z0-9]{4,15})"??,/i);
        if (cidMatch) {
            // This looks like a new start. 
            // We'll try to split the rest.
            // But since the line itself might be corrupted (contains other rows),
            // this is tricky.

            // Let's try splitting by the CID pattern globally to find all records hidden in the text.
            const recordStarts = [...line.matchAll(/(?:\r?\n|^)"??([a-z]{2,10}[0-9]{3,8})"??,/gi)];
            // This is also complex.
        }
    }

    // SIMPLER APPROACH:
    // Just replace the double-double quotes and try to fix the line endings.

    let cleaned = content
        .replace(/""/g, '"') // Reduce double quotes
        .replace(/"{2,}/g, '"'); // Reduce any remaining multiple quotes to single

    // Now try to split by line again, but be careful with the "CID," at the start.
    const records = cleaned.split(/\r?\n(?="??[a-z]{2,10}[0-9]{3,8}"??,)/gi);

    console.log(`Found ${records.length} potential records.`);

    const finalRecords: string[][] = [];

    for (let rec of records) {
        // Split by comma BUT skip commas inside quotes.
        // Since we cleaned quotes, we need to be careful.
        const parts = rec.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
        if (parts.length >= 4) {
            finalRecords.push(parts.map(p => p.replace(/^"|"$/g, '').trim()));
        }
    }

    console.log(`Successfully extracted ${finalRecords.length} records.`);

    const escape = (val: string) => {
        const str = String(val);
        if (/[,"\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const output = finalRecords.map(row => row.map(escape).join(',')).join('\n');
    fs.writeFileSync(RECOVERED_PATH, output, 'utf-8');
    console.log(`Saved to ${RECOVERED_PATH}`);
}

recover();
