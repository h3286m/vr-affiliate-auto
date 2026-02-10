
import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');

function check() {
    const buffer = fs.readFileSync(CSV_PATH);
    const content = buffer.toString('utf-8');
    const lines = content.split('\n').slice(0, 10);

    console.log('--- FIRST 10 LINES RAW ---');
    lines.forEach((line, i) => {
        console.log(`L${i + 1}: ${line}`);
    });
}

check();
