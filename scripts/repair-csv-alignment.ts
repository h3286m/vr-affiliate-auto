
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const CSV_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');
const CACHE_PATH = path.join(process.cwd(), 'src/data/product_metadata_cache.json');

async function fetchItemMetadata(cid: string) {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) return null;

    // Try videoa first
    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=videoa&cid=${cid}&output=json`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data: any = await res.json();
        let item = data.result?.items?.[0];

        if (!item) {
            // Try videoc
            const urlC = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=videoc&cid=${cid}&output=json`;
            const resC = await fetch(urlC);
            if (resC.ok) {
                const dataC: any = await resC.json();
                item = dataC.result?.items?.[0];
            }
        }
        return item;
    } catch (e) {
        return null;
    }
}

async function repair() {
    console.log('--- Repairing CSV Alignment ---');

    if (!fs.existsSync(CSV_PATH)) {
        console.error('CSV not found');
        return;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, {
        columns: false,
        relax_column_count: true,
        bom: true,
        trim: true
    });

    const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) : {};
    const repairedRows: string[][] = [];
    const headers = ['商品ID(CID)', 'タイトル', '発売日', '出演女優名', '女優ID', '評価', 'レビュー数', '商品URL', '画像URL', '', '紹介文'];
    repairedRows.push(headers);

    console.log(`Processing ${records.length - 1} records...`);

    for (let i = 1; i < records.length; i++) {
        const row = records[i];
        const cid = row[0];
        if (!cid) continue;

        // Validation: Is this row broken?
        // Shifted if Column 4 (ID) has Japanese or Column 5 (Score) has text
        const isBroken = (row[4] && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(row[4])) ||
            (row[5] && isNaN(parseFloat(row[5])) && row[5] !== '');

        // Even if not "broken", we'll normalize everything for consistency
        let title = row[1];
        let date = row[2];
        let actresses = row[3];
        let ids = row[4];
        let score = row[5];
        let count = row[6];
        let url = row[7];
        let img = row[8];
        let intro = row[10] || '';

        // Try to recover from cache or API if suspected broken or missing info
        if (isBroken || !actresses || !ids) {
            let apiInfo = cache[cid];
            if (!apiInfo || !apiInfo.iteminfo) {
                // Not in cache, try live API (only for broken ones to save time)
                console.log(`[Repairing Row ${i + 1}] ${cid} - Fetching from API...`);
                apiInfo = await fetchItemMetadata(cid);
                if (apiInfo) {
                    cache[cid] = apiInfo; // update cache
                }
            }

            if (apiInfo) {
                title = apiInfo.title || title;
                date = apiInfo.date ? apiInfo.date.split(' ')[0] : date;

                const apiActresses = apiInfo.iteminfo?.actress || [];
                actresses = apiActresses.map((a: any) => a.name).join('、');
                ids = apiActresses.map((a: any) => a.id).join('、');

                url = apiInfo.affiliateURL || apiInfo.URL || url;
                img = apiInfo.imageURL?.large || apiInfo.imageURL?.list || img;

                if (!score || score === '0') {
                    score = apiInfo.review?.average || '0';
                    count = apiInfo.review?.count || '0';
                }
            }
        }

        // Final normalization and assembly
        const newRow = [
            cid,
            title,
            date,
            actresses,
            ids,
            score,
            count,
            url,
            img,
            '', // col 9 placeholder
            intro
        ];
        repairedRows.push(newRow);

        if (i % 500 === 0) process.stdout.write('.');
    }

    console.log('\nFinalizing and saving...');

    const escapeCsv = (str: string) => {
        if (!str) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    const csvContent = repairedRows.map(r => r.map(escapeCsv).join(',')).join('\n');
    const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
    fs.writeFileSync(CSV_PATH, Buffer.concat([bom, Buffer.from(csvContent, 'utf-8')]));

    // Save updated cache
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

    console.log(`Successfully repaired at ${CSV_PATH}`);
}

repair();
