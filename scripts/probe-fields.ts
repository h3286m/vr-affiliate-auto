
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { fetchActressItems } from '../src/lib/dmm-api';

async function probe() {
    // Aoi Tsukasa ID: 1006229
    console.log("Fetching items for Aoi Tsukasa...");
    // Fetch with fetch-data params
    const items = await fetchActressItems('1006229', 100, 'VR', 'rank');
    if (items.length > 0) {
        const item = items[0];
        console.log("--- Item Fields ---");
        console.log(`Title: ${item.title}`);
        console.log(`Headline: ${item.headline || 'N/A'}`);
        console.log(`Comment: ${item.comment || 'N/A'}`);
        console.log(`ItemInfo present? ${!!item.iteminfo}`);
        if (item.iteminfo) {
            console.log(`Genres: ${JSON.stringify(item.iteminfo.genre)}`);
        }
    } else {
        console.log("No items found.");
    }
}

probe();
