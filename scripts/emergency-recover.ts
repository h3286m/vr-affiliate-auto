
import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/HQVR_data_fixed.csv');

function parseEmerg() {
    console.log('Starting Emergency Recovery...');
    const content = fs.readFileSync(CSV_PATH, 'utf-8');

    // Split by potential CID at start of block
    const blocks = content.split(/(?=\n[a-z]{2,8}[0-9]{3,8},)/i);
    console.log(`Analyzing ${blocks.length} blocks...`);

    const recovered: string[][] = [];

    for (const block of blocks) {
        // Clean block from weird internal newlines/quotes
        const cleanBlock = block.replace(/\r?\n/g, ' ').replace(/"{2,}/g, '"').trim();

        // CID is the first part until comma
        const cidMatch = cleanBlock.match(/^"?([a-z0-9]{4,15})"?\s*,/i);
        if (!cidMatch) continue;

        const cid = cidMatch[1];

        // Find URLs
        const affMatch = cleanBlock.match(/(https:\/\/al\.fanza\.co\.jp\/[^\s,"]+)/);
        const imgMatch = cleanBlock.match(/(https:\/\/pics\.dmm\.co\.jp\/[^\s,"]+)/);

        const affUrl = affMatch ? affMatch[1] : '';
        const imgUrl = imgMatch ? imgMatch[1] : '';

        // Find Date (YYYY-MM-DD or YYYY/MM/DD)
        const dateMatch = cleanBlock.match(/(\d{4}[-\/]\d{2}[-\/]\d{2}(?:\s\d{2}:\d{2}:\d{2})?)/);
        const date = dateMatch ? dateMatch[1] : '';

        // Find Actress Name - this is hard, but usually between Date and URL or in a specific position
        // Let's try to find it by looking for strings between CID/Title and Date
        // Actually, Title is also hard.

        // Let's try splitting the block by comma for the first few fields
        const parts = cleanBlock.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);

        const title = parts[1] ? parts[1].replace(/^"|"$/g, '').trim() : '';
        const actress = parts[3] ? parts[3].replace(/^"|"$/g, '').trim() : '';
        const actressId = parts[4] ? parts[4].replace(/^"|"$/g, '').trim() : '';

        // Score and Count (indices 5, 6)
        const score = parts[5] || '0';
        const count = parts[6] || '0';

        recovered.push([cid, title, date, actress, actressId, score, count, affUrl, imgUrl]);
    }

    console.log(`Extracted ${recovered.length} rows.`);

    const escape = (val: string) => {
        const str = String(val);
        if (/[,"\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = ['商品ID(CID)', 'タイトル', '発売日', '出演女優名', '女優ID', '', '', '商品URL', '', '', '紹介文'];
    const output = [headers.join(',')];

    // We'll also re-run the intro generation logic since it's fast
    // and the previous ones in the CSV were likely broken.

    // (Re-importing logic here for simplicity or just using a placeholder)
    // Actually, I'll just save it first to see if it works.

    recovered.forEach(row => {
        // Ensure 10 columns for intros at index 10
        while (row.length < 11) row.push('');
        output.push(row.map(escape).join(','));
    });

    fs.writeFileSync(OUTPUT_PATH, output.join('\n'));
    console.log(`Saved ${recovered.length} fixed rows to ${OUTPUT_PATH}`);
}

parseEmerg();
