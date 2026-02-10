
import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/HQVR_data_fixed.csv');

function parseUltra() {
    console.log('Starting Ultra Recovery...');
    const buffer = fs.readFileSync(CSV_PATH);
    const content = buffer.toString('utf-8');

    // Pattern to find records. They start with a Content ID at the beginning of the file or after a newline.
    // Content IDs are usually 4-10 letters followed by 5+ numbers.
    const cidRegex = /(?:\r?\n|^)"??([a-z]{2,10}[0-9]{3,8})"??,/gi;

    const matches = [...content.matchAll(cidRegex)];
    console.log(`Found ${matches.length} record starts.`);

    const recovered: any[] = [];

    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index || 0;
        const end = (i + 1 < matches.length) ? matches[i + 1].index : content.length;
        const block = content.substring(start, end).trim();

        const cid = matches[i][1];

        // Find anchors in this block
        const affMatch = block.match(/(https:\/\/al\.fanza\.co\.jp\/[^\s,"]+)/);
        const imgMatch = block.match(/(https:\/\/pics\.dmm\.co\.jp\/[^\s,"]+)/);
        const dateMatch = block.match(/(\d{4}[-\/]\d{2}[-\/]\d{2}(?:\s\d{2}:\d{2}:\d{2})?)/);

        const affUrl = affMatch ? affMatch[1] : '';
        const imgUrl = imgMatch ? imgMatch[1] : '';
        const date = dateMatch ? dateMatch[1] : '';

        // Title and Actress are between CID and Date.
        // Usually: CID,Title,Date,Actress...
        // We'll try a very simple split by comma for the first few fields
        const firstComma = block.indexOf(',');
        const secondComma = block.indexOf(',', firstComma + 1);
        const thirdComma = block.indexOf(',', secondComma + 1);
        const fourthComma = block.indexOf(',', thirdComma + 1);
        const fifthComma = block.indexOf(',', fourthComma + 1);

        let title = '';
        if (firstComma !== -1 && secondComma !== -1) {
            title = block.substring(firstComma + 1, secondComma).replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        }

        let actress = '';
        if (thirdComma !== -1 && fourthComma !== -1) {
            actress = block.substring(thirdComma + 1, fourthComma).replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        }

        let actressId = '';
        if (fourthComma !== -1 && fifthComma !== -1) {
            actressId = block.substring(fourthComma + 1, fifthComma).replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        }

        // If Title or Actress are empty or suspiciously short/long, we might have missed them
        // but this is a good start.

        recovered.push({ cid, title, date, actress, actressId, affUrl, imgUrl });
    }

    console.log(`Successfully extracted ${recovered.length} potential records.`);

    const escape = (val: string) => {
        const str = String(val);
        if (/[,"\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = ['商品ID(CID)', 'タイトル', '発売日', '出演女優名', '女優ID', '評価', 'レビュー数', '商品URL', '画像URL', '', '紹介文'];
    const output = [headers.join(',')];

    recovered.forEach(r => {
        const row = [r.cid, r.title, r.date, r.actress, r.actressId, '0', '0', r.affUrl, r.imgUrl, '', ''];
        output.push(row.map(escape).join(','));
    });

    fs.writeFileSync(OUTPUT_PATH, output.join('\n'), 'utf-8');
    console.log(`Results saved to ${OUTPUT_PATH}`);
}

parseUltra();
