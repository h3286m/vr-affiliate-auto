
// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';
import { fetchAllActressesByInitial, fetchActressItems } from '../src/lib/dmm-api';

async function main() {
    console.log('Starting local data fetch...');

    try {
        // 1. Fetch all actresses starting with 'あ'
        console.log("Fetching 'あ' actresses...");
        const actresses = await fetchAllActressesByInitial('あ');
        console.log(`Found ${actresses.length} actresses.`);

        // 2. Filter for VR videos (batch processing)
        console.log('Checking for VR videos (this may take a while)...');

        // Determine throttle parameters based on API limits
        // DMM API is roughly 1 req/sec officially, but bursts are often tolerated.
        // We'll be conservative.
        const BATCH_SIZE = 5;
        const DELAY_MS = 200;

        const validActresses = [];

        for (let i = 0; i < actresses.length; i += BATCH_SIZE) {
            const batch = actresses.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(async (actress) => {
                try {
                    // Fetch items sorted by rank (popularity)
                    const items = await fetchActressItems(actress.id.toString(), 20, 'VR', 'rank');

                    // Strict Filter: Title must start with 【VR】 AND release date >= 2016
                    const strictVrItems = items.filter(item => {
                        const isVR = item.title && item.title.startsWith('【VR】');
                        const isRecent = item.date && item.date >= '2016-01-01';
                        return isVR && isRecent;
                    });

                    // Limit to 10 items for the view
                    const limitedItems = strictVrItems.slice(0, 10);

                    if (limitedItems.length > 0) {
                        process.stdout.write('O'); // Found videos
                        return {
                            ...actress,
                            videos: limitedItems
                        };
                    } else {
                        process.stdout.write('.'); // No videos
                        return null;
                    }
                } catch (e) {
                    process.stdout.write('X'); // Error
                    console.error(`\nError checking ${actress.name}:`, e);
                    return null;
                }
            }));

            validActresses.push(...results.filter(a => a !== null));

            if (i + BATCH_SIZE < actresses.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        // 4. Sort Valid Actresses by Video Count (Popularity Proxy)
        validActresses.sort((a, b) => b.videos.length - a.videos.length);

        console.log(`\n\nFinished! Found ${validActresses.length} valid VR actresses out of ${actresses.length}.`);

        // 3. Save to file
        const outputPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');
        fs.writeFileSync(outputPath, JSON.stringify(validActresses, null, 2));
        console.log(`Data saved to ${outputPath}`);

    } catch (error) {
        console.error('Fatal error during execution:', error);
        process.exit(1);
    }
}

main();
