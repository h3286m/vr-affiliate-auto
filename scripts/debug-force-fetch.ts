
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import { fetchActressProfile, fetchActressItems } from '../src/lib/dmm-api';

async function debug() {
    console.log("Debugging Force Fetch Logic...");

    // Hardcoded test for specific ID from CSV (Ayaka Koyoi or similar from Sa/A row)
    const targetId = '1077618';
    const forceFetchIds = [targetId];

    const results = [];

    for (const id of forceFetchIds) {
        console.log(`Processing ID '${id}'`);
        try {
            const profile = await fetchActressProfile(id);
            if (profile) {
                console.log(`  -> Fetched Profile: ${profile.name} (ID: ${profile.id})`);
                console.log(`  -> Ruby: '${profile.ruby}'`);

                console.log(`  -> Fetching videos (VR filtered)...`);
                // Use same logic as main script
                const items = await fetchActressItems(profile.id.toString(), 100, 'VR', 'rank');
                console.log(`  -> VR Items Fetch Count: ${items.length}`);

                console.log(`  -> Fetching ALL videos (No keyword)...`);
                const allItems = await fetchActressItems(profile.id.toString(), 100, '', 'rank');
                console.log(`  -> All Items Fetch Count: ${allItems.length}`);
                if (allItems.length > 0) {
                    console.log(`     Example All-Item Title 1: ${allItems[0].title}`);
                }

                const strictVrItems = items.filter(item => {
                    const isVR = item.title && (item.title.startsWith('【VR】') || item.title.startsWith('[VR]'));
                    const isRecent = item.date && item.date >= '2016-01-01';

                    if (!isVR) {
                        // Log first few non-VR failures
                        if (Math.random() < 0.2) console.log(`     [Filter Fail VR] Title: ${item.title}`);
                    }
                    if (isVR && !isRecent) {
                        console.log(`     [Filter Fail Date] Date: ${item.date}, Title: ${item.title}`);
                    }
                    return isVR && isRecent;
                });
                console.log(`  -> Strict VR Items: ${strictVrItems.length}`);

                if (strictVrItems.length === 0) {
                    console.log("  -> RESULT: 0 Valid Videos. This actress would be DROPPED.");
                    if (items.length > 0) {
                        console.log(`     Example Raw Title 1: ${items[0].title}`);
                        console.log(`     Example Raw Title 2: ${items[1]?.title}`);
                    }
                } else {
                    console.log("  -> RESULT: Keeping Actress with " + strictVrItems.length + " videos.");
                }

                results.push({
                    id,
                    name: profile.name,
                    ruby: profile.ruby,
                    videoCount: strictVrItems.length,
                    rawVrCount: items.length,
                    allCount: allItems.length,
                    success: true,
                    rawTitles: items.slice(0, 3).map(i => i.title)
                });
            } else {
                console.log(`  -> Profile fetch returned null`);
                results.push({ id, success: false });
            }
        } catch (e) {
            console.error(e);
            results.push({ id, success: false, error: String(e) });
        }
    }

    fs.writeFileSync('debug_results.json', JSON.stringify(results, null, 2));
    console.log("Written to debug_results.json");
}

debug();
