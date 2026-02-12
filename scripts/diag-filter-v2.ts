import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvPath = 'src/data/HQVR_data.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

const OMNIBUS_GENRE_IDS = [4025, 5015, 6003, 6609, 6012];
const OMNIBUS_KEYWORDS = ['オムニバス', 'ベスト', '総集編', 'BEST', 'ベスト版', 'セレクション', '厳選'];

let count_total = 0;
let count_phase1 = 0;
let count_no_cid_title = 0;
let count_not_vr = 0;
let count_omnibus_title = 0;
let count_final = 0;

for (const record of rows) {
    count_total++;
    const cid = record['商品ID(CID)'];
    const title = record['タイトル'] || '';

    if (!cid || !title) {
        count_no_cid_title++;
        continue;
    }

    if (!title.includes('【VR】') && !cid.toLowerCase().startsWith('vr')) {
        if (!title.includes('【VR】')) {
            count_not_vr++;
            continue;
        }
    }

    count_phase1++;

    const isOmnibusByTitle = OMNIBUS_KEYWORDS.some(k => title.includes(k));
    if (isOmnibusByTitle) {
        count_omnibus_title++;
        continue;
    }

    count_final++;
}

console.log({
    totalRows: count_total,
    noCidOrTitle: count_no_cid_title,
    notVr: count_not_vr,
    phase1Total: count_phase1,
    omnibusByTitle: count_omnibus_title,
    finalBeforeGenreAPI: count_final
});
