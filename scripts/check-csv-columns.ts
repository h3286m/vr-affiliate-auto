
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = path.join(process.cwd(), 'src', 'data', 'HQVR_data.csv');

function main() {
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, { from_line: 2 });

    let hasReviewCount = false;
    let hasReviewScore = false;

    for (const row of records) {
        if (Number(row[5]) > 0) hasReviewCount = true;
        if (Number(row[6]) > 0) hasReviewScore = true;
        if (hasReviewCount && hasReviewScore) break;
    }

    console.log(`HasReviewCount: ${hasReviewCount}`);
    console.log(`HasReviewScore: ${hasReviewScore}`);
}

main();
