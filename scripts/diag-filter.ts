import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvPath = 'src/data/HQVR_data.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parse(content, { columns: true, skip_empty_lines: true });

let total = rows.length;
let uniqueCids = new Set();
let afterOmnibus = 0;
let afterGenre = 0;
let uniqueIdsAfterFilter = new Set();

for (const row of rows) {
    const cid = row.content_id;
    if (!cid) continue;
    uniqueCids.add(cid);

    const isOmnibus = row.title.includes('総集編') || row.title.includes('オムニバス');
    if (isOmnibus) continue;
    afterOmnibus++;

    const genreIdsStr = row.genre_ids || '';
    const isGenreFiltered = genreIdsStr.includes('5097') || genreIdsStr.includes('20');
    if (isGenreFiltered) continue;
    afterGenre++;

    uniqueIdsAfterFilter.add(cid);
}

console.log({
    totalRows: total,
    uniqueCids: uniqueCids.size,
    afterOmnibusTitleFilter: afterOmnibus,
    afterGenreFilter: afterGenre,
    uniqueCidsFinal: uniqueIdsAfterFilter.size
});
