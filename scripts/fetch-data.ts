
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
                    // Fetch up to 20 items to filter down to 10 valid ones
                    // We need enough videos to populate the detail page
                    const items = await fetchActressItems(actress.id.toString(), 20);

                    if (items.length > 0) {
                        process.stdout.write('O'); // Found videos
                        // Return the actress object EXTENDED with the videos
                        // We don't strictly need a separate profile fetch if the list data is enough,
                        // but page.tsx used it. The list object usually contains the name correctly.
                        // We'll trust the list object for now to save time/requests, 
                        // as DmmActress entries from search have names.
                        return {
                            ...actress,
                            videos: items // Attach videos here
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
