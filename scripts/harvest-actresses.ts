
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fetchPopularVRVideos, fetchActressItems } from '../src/lib/dmm-api';
import { DmmItem } from '../src/types/dmm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OUTPUT_CSV_PATH = path.join(process.cwd(), 'master_data.csv');
const HARVEST_PAGES = 30; // 30 pages * 100 items = 3000 videos
const SLEEP_MS = 200;

interface ActressSummary {
    id: string;
    name: string;
    ruby: string;
    vrCount: number;
    latestDate: string;
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Starting Popular VR Harvest...');

    const uniqueActresses = new Map<string, { name: string, ruby: string }>();

    // 1. Harvest Phase
    for (let page = 0; page < HARVEST_PAGES; page++) {
        const offset = (page * 100) + 1;
        console.log(`Harvesting Page ${page + 1}/${HARVEST_PAGES} (Offset: ${offset})...`);

        const items = await fetchPopularVRVideos(100, offset);
        if (items.length === 0) break;

        let newCount = 0;
        for (const item of items) {
            if (item.iteminfo?.actress) {
                for (const act of item.iteminfo.actress) {
                    const idStr = act.id.toString();
                    if (!uniqueActresses.has(idStr)) {
                        uniqueActresses.set(idStr, {
                            name: act.name,
                            ruby: act.ruby || ''
                        });
                        newCount++;
                    }
                }
            }
        }
        console.log(`  -> Found ${newCount} new actresses. Total Unique: ${uniqueActresses.size}`);
        await delay(SLEEP_MS);
    }

    console.log(`\nHarvest Complete. Found ${uniqueActresses.size} unique actresses.`);
    console.log('Starting Enrichment Phase (Verification & Details)...');

    const masterList: ActressSummary[] = [];
    let processed = 0;
    const total = uniqueActresses.size;

    // 2. Enrichment Phase
    const BATCH_SIZE = 15; // Concurrent requests

    for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = Array.from(uniqueActresses.entries()).slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async ([id, basicInfo]) => {
            try {
                // Fetch up to 100 items to get a decent count estimate + latest date
                // sort='date' to get the real latest
                const vrItems = await fetchActressItems(id, 100, 'VR', 'date');

                if (vrItems.length > 0) {
                    masterList.push({
                        id,
                        name: basicInfo.name,
                        ruby: basicInfo.ruby,
                        vrCount: vrItems.length,
                        latestDate: vrItems[0].date || ''
                    });
                }
            } catch (e) {
                console.error(`Error enriching ${basicInfo.name}:`, e);
            }
        }));

        processed += batch.length;
        process.stdout.write(`\rEnriching: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);

        // Small delay between batches to be polite to API
        await delay(500);
    }

    // 3. Write CSV
    console.log('\n\nWriting CSV...');
    const header = 'ID,女優名,読み,VR作品数,最新VR発売日\n';
    const rows = masterList.map(a =>
        `${a.id},${a.name},${a.ruby},${a.vrCount},${a.latestDate}`
    ).join('\n');

    fs.writeFileSync(OUTPUT_CSV_PATH, header + rows);
    console.log(`Successfully generated ${OUTPUT_CSV_PATH}`);
    console.log(`Total Actresses: ${masterList.length}`);
}

main();
