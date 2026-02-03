
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
        console.log(`Found ${items.length} items.`);
        items.slice(0, 10).forEach((item, index) => {
            console.log(`[${index}] Date: ${item.date} | Title: ${item.title}`);
        });
    } else {
        console.log("No items found.");
    }
}

probe();
