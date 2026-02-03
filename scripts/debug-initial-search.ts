
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { fetchActresses } from '../src/lib/dmm-api';

async function debug() {
    const initial = 'あ';
    console.log(`Searching for actresses with initial '${initial}'...`);

    // Fetch a few pages to be safe, Aoi Tsukasa is popular so she should be early?
    // Sort is not documented for search, probably ID or popularity?
    // Let's fetch 500 items. s
    let all: any[] = [];
    const hits = 100;
    for (let offset = 1; offset < 500; offset += hits) {
        const batch = await fetchActresses(initial, hits, offset);
        if (batch.length === 0) break;
        all = all.concat(batch);
        console.log(`Fetched ${batch.length} items (Total ${all.length})`);
    }

    const targetId = '1006229';
    const found = all.find(a => a.id.toString() === targetId);

    if (found) {
        console.log("FOUND Aoi Tsukasa!");
        console.log(JSON.stringify(found, null, 2));
    } else {
        console.log("Aoi Tsukasa NOT found in the first 500 results for 'あ'.");
        console.log("First 5 names:", all.slice(0, 5).map(a => a.name));
    }
}

debug();
