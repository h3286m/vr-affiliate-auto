
// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';
import { fetchAllActressesByInitial, fetchActressItems, fetchActressProfile, fetchFullActressVideoList } from '../src/lib/dmm-api';
import { SYLLABARY_ROWS } from '../src/lib/utils';

async function main() {
    console.log('Starting local data fetch...');

    try {
        // 0. Load Enrichment CSV
        const csvPath = path.join(process.cwd(), 'src', 'data', 'actress_enrichment.csv');
        const enrichmentMap = new Map();
        const forceFetchIds: string[] = [];

        if (fs.existsSync(csvPath)) {
            console.log('Loading enrichment data from CSV...');
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length >= 2) {
                    const id = parts[0].trim();
                    const bio = parts[2];
                    const bust = parts[3];
                    const waist = parts[4];
                    const hip = parts[5];
                    enrichmentMap.set(id, { bio, bust, waist, hip });
                    forceFetchIds.push(id);
                }
            }
        }

        // 0.5 Load Priority Actresses JSON
        const priorityPath = path.join(process.cwd(), 'src', 'data', 'priority-actresses.json');
        if (fs.existsSync(priorityPath)) {
            console.log('Loading priority actresses from JSON...');
            try {
                const priorityContent = fs.readFileSync(priorityPath, 'utf-8');
                const priorityIds = JSON.parse(priorityContent);
                if (Array.isArray(priorityIds)) {
                    priorityIds.forEach((id: string) => {
                        // IDs might be strings or numbers in the JSON, ensure string
                        forceFetchIds.push(String(id));
                    });
                    console.log(`Loaded ${priorityIds.length} priority IDs.`);
                }
            } catch (jsonErr) {
                console.error('Error reading priority-actresses.json:', jsonErr);
            }
        }

        // 0.6 Load Priority Actresses from CSV (New)
        const priorityCsvPath = path.join(process.cwd(), 'src', 'data', 'priority.csv');
        if (fs.existsSync(priorityCsvPath)) {
            console.log('Loading priority actresses from CSV...');
            try {
                const csvContent = fs.readFileSync(priorityCsvPath, 'utf-8');
                const lines = csvContent.split('\n');
                let csvCount = 0;
                // Simple CSV parser: assume ID is first column
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const parts = line.split(',');
                    const id = parts[0].trim().replace(/['"]/g, ''); // Remove quotes if present

                    if (id.toLowerCase() === 'id' || id.toLowerCase().includes('actress')) continue;

                    if (id.length > 0) {
                        forceFetchIds.push(id);
                        csvCount++;
                    }
                }
                console.log(`Loaded ${csvCount} priority IDs from CSV.`);
            } catch (csvErr) {
                console.error('Error reading priority.csv:', csvErr);
            }
        }

        // 1. Fetch all actresses starting with Japanese syllabary
        // Flatten all ranges to get every character (あ, い, う, え, お, か... etc)
        const initials = SYLLABARY_ROWS.flatMap(row => row.range);
        let actresses: any[] = [];

        if (process.argv.includes('--quick')) {
            console.log("--- QUICK MODE: Skipping main syllabary fetch ---");
        } else {
            console.log(`Starting fetch loop for initials: ${initials.join(', ')}`);

            for (const initial of initials) {
                console.log(`\nFetching '${initial}' actresses...`);
                try {
                    const batch = await fetchAllActressesByInitial(initial);
                    console.log(`  -> Fetched ${batch.length} actresses for '${initial}'.`);
                    actresses = actresses.concat(batch);

                    // Sleep to respect API limits (1 second)
                    console.log(`  -> Sleeping for 1s...`);
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {
                    console.error(`  -> Failed to fetch '${initial}':`, err);
                }
            }
        }
        console.log(`\nTotal actresses fetched: ${actresses.length}`);

        // 1.5 Force Fetch Missing Actresses from CSV
        if (forceFetchIds.length > 0) {
            console.log(`Checking ${forceFetchIds.length} IDs from CSV for force-fetch...`);
            const existingIds = new Set(actresses.map(a => a.id.toString()));

            for (const id of forceFetchIds) {
                if (!existingIds.has(id)) {
                    console.log(`Force fetching profile for missing ID: ${id}`);
                    try {
                        const profile = await fetchActressProfile(id);
                        if (profile) {
                            // Use FULL fetch (no keyword, all pages) for priority
                            console.log(`  -> Fetching ALL videos for ${profile.name}...`);
                            const allItems = await fetchFullActressVideoList(id);

                            // Apply Strict VR Filter locally
                            const strictVrItems = allItems.filter(item => {
                                const isVR = item.title && (item.title.includes('【VR】') || item.title.includes('[VR]'));
                                const isRecent = item.date && item.date >= '2016-01-01';
                                return isVR && isRecent;
                            });

                            // Limit to newest 10
                            const limitedItems = strictVrItems.slice(0, 10);

                            if (limitedItems.length > 0) {
                                actresses.push({
                                    ...profile,
                                    videos: limitedItems
                                });
                                console.log(`  -> Added ${profile.name} with ${limitedItems.length} videos`);
                            } else {
                                // Fallback: Keep even if 0 videos (as requested previously, but usually won't happen now)
                                console.log(`  -> Added ${profile.name} (0 videos found despite full scan)`);
                                actresses.push({
                                    ...profile,
                                    videos: []
                                });
                            }
                        } else {
                            console.log(`  -> Failed to fetch profile for ${id}`);
                        }
                    } catch (e) {
                        console.error(`  -> Error fetching ${id}:`, e);
                    }
                    // Small delay to be polite
                    await new Promise(r => setTimeout(r, 200));
                }
            }
            console.log(`Total actresses after force-fetch: ${actresses.length}`);
        }

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
                // If videos are already populated (Priority Step), return as is
                if (actress.videos) {
                    return actress;
                }

                try {
                    // Fetch items sorted by rank (popularity)
                    // Updated to support pagination internally in dmm-api.ts
                    const items = await fetchActressItems(actress.id.toString(), 100, 'VR', 'rank');

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

        // 5. Merge with Enrichment CSV (Already loaded in Step 0)
        // Just apply the map to validActresses
        console.log('Applying enrichment data to final list...');
        validActresses.forEach(actress => {
            const extra = enrichmentMap.get(actress.id.toString());
            if (extra) {
                if (extra.bust) actress.bust = extra.bust;
                if (extra.waist) actress.waist = extra.waist;
                if (extra.hip) actress.hip = extra.hip;
                if (extra.bio && !actress.hobby) actress.hobby = extra.bio;
            }
        });

        console.log(`\n\nFinished! Found ${validActresses.length} valid VR actresses out of ${actresses.length}.`);

        // 3. Save to file
        const outputPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');
        // Sort actresses by the date of their newest video (videos[0].date) descending
        actresses.sort((a, b) => {
            const dateA = a.videos && a.videos.length > 0 ? a.videos[0].date : '';
            const dateB = b.videos && b.videos.length > 0 ? b.videos[0].date : '';
            // Descending order (Newest first)
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            return 0;
        });

        // Save to JSON
        const ACTRESSES_PATH = outputPath; // Assuming outputPath is the target for this
        fs.writeFileSync(ACTRESSES_PATH, JSON.stringify(actresses, null, 2));
        console.log(`\nSaved ${actresses.length} actresses to ${ACTRESSES_PATH}`);
    } catch (error) {
        console.error('Fatal error during execution:', error);
        process.exit(1);
    }
}

main();
