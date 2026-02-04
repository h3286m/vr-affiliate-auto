
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { DmmItemListResponse } from '../src/types/dmm';

// Inline API call with logging for debug
const DMM_API_BASE_ITEM = "https://api.dmm.com/affiliate/v3/ItemList";
const DMM_API_BASE_ACTRESS = "https://api.dmm.com/affiliate/v3/ActressSearch";

function getBaseParams() {
    return {
        api_id: process.env.DMM_API_ID ?? '',
        affiliate_id: process.env.DMM_AFFILIATE_ID ?? '',
        output: 'json',
    };
}

// Custom paginated fetcher for debug
async function fetchAllItemsDebug(actressId: string, keyword: string) {
    let allItems: any[] = [];
    let offset = 1;
    let hasMore = true;
    let pageCount = 0;

    console.log(`\n--- Fetching for ID: ${actressId} | Keyword: '${keyword}' ---`);

    while (hasMore && pageCount < 20) { // Limit to 20 pages (2000 items) for safety
        const params = new URLSearchParams({
            ...getBaseParams(),
            site: 'FANZA',
            service: 'digital',
            floor: 'videoa',
            hits: '100',
            offset: offset.toString(),
            sort: 'date', // Process newest first
            keyword: keyword,
            article: 'actress',
            article_id: actressId,
        });

        const url = `${DMM_API_BASE_ITEM}?${params.toString()}`;
        // console.log(`Fetch URL: ${url}`);
        const res = await fetch(url);
        const data: DmmItemListResponse = await res.json();
        const items = data.result?.items || [];

        if (items.length > 0) {
            allItems = allItems.concat(items);
            console.log(`  Page ${pageCount + 1}: Found ${items.length} items. (Total: ${allItems.length})`);
            offset += 100;
            pageCount++;
        } else {
            hasMore = false;
        }
    }
    return allItems;
}

async function run() {
    const ACTRESS_ID = '1006229'; // Aoi Tsukasa

    // Strategy 1: Keyword = 'VR'
    const vrKeywordItems = await fetchAllItemsDebug(ACTRESS_ID, 'VR');
    console.log(`Strategy 1 (keyword='VR') Total: ${vrKeywordItems.length}`);
    vrKeywordItems.forEach(i => {
        if (i.title.includes('VR')) process.stdout.write('.');
        else console.log(`\n[Warn] Item returned by 'VR' keyword but no 'VR' in title: ${i.title}`);
    });
    console.log('');

    // Strategy 2: No Keyword (Local Filter)
    const allItems = await fetchAllItemsDebug(ACTRESS_ID, '');
    console.log(`Strategy 2 (No Keyword) Total: ${allItems.length}`);

    const localFiltered = allItems.filter(i => i.title.includes('【VR】') || i.title.includes('[VR]'));
    console.log(`Strategy 2 Local Filtered Count: ${localFiltered.length}`);

    // Compare
    const vrIds = new Set(vrKeywordItems.map(i => i.content_id));
    const localIds = new Set(localFiltered.map(i => i.content_id));

    // Find items found locally but NOT by keyword
    const missedByKeyword = localFiltered.filter(i => !vrIds.has(i.content_id));
    console.log(`\nItems missed by API Keyword 'VR': ${missedByKeyword.length}`);
    if (missedByKeyword.length > 0) {
        console.log("Samples:");
        missedByKeyword.slice(0, 5).forEach(i => console.log(` - ${i.title} (${i.date})`));
    }
}

run();
