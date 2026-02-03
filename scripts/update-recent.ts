
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { fetchNewestVRVideos, fetchActressProfile, fetchActressItems } from '../src/lib/dmm-api';

async function main() {
    console.log("Starting Fast Update (Recent Release Check)...");

    // 1. Fetch Newest Videos
    // We'll fetch 100 recent videos to cover enough ground
    const recentVideos = await fetchNewestVRVideos(100);
    console.log(`Found ${recentVideos.length} recent VR videos.`);

    if (recentVideos.length === 0) {
        console.log("No recent videos found. Exiting.");
        return;
    }

    // 2. Extract Actress IDs
    const actressIdsToUpdate = new Set<string>();
    for (const video of recentVideos) {
        if (video.iteminfo && video.iteminfo.actress) {
            for (const actress of video.iteminfo.actress) {
                if (actress.id) {
                    actressIdsToUpdate.add(actress.id.toString());
                }
            }
        }
    }
    console.log(`Identified ${actressIdsToUpdate.size} unique actresses from recent videos.`);

    if (actressIdsToUpdate.size === 0) {
        console.log("No actress info found in recent videos. Exiting.");
        return;
    }

    // 3. Load Existing Data
    const dataPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');
    let actresses: any[] = [];
    if (fs.existsSync(dataPath)) {
        actresses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    const existingMap = new Map(actresses.map(a => [a.id.toString(), a]));

    // 4. Update Each Actress
    let updatedCount = 0;

    // Also load enrichment data to apply if needed
    const csvPath = path.join(process.cwd(), 'src', 'data', 'actress_enrichment.csv');
    const enrichmentMap = new Map();
    if (fs.existsSync(csvPath)) {
        const lines = fs.readFileSync(csvPath, 'utf-8').split('\n');
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) enrichmentMap.set(parts[0].trim(), parts);
        }
    }

    console.log("Updating actress profiles...");

    for (const id of actressIdsToUpdate) {
        try {
            // Fetch Profile
            const profile = await fetchActressProfile(id);
            if (!profile) continue;

            const actressIdStr = profile.id.toString();

            // Fetch Items (to check VR count/validity)
            // Use standard logic: 100 items, rank sort, VR keyword
            const items = await fetchActressItems(actressIdStr, 100, 'VR', 'rank');
            const strictVrItems = items.filter(item => {
                return item.title && item.title.startsWith('【VR】') && item.date >= '2016-01-01';
            });

            if (strictVrItems.length > 0) {
                const limitedVideos = strictVrItems.slice(0, 10);

                // Construct Entry
                const newEntry = {
                    ...profile,
                    videos: limitedVideos
                };

                // Apply Enrichment
                const extra = enrichmentMap.get(actressIdStr);
                if (extra) {
                    if (extra[3]) newEntry.bust = extra[3]; // bust
                    if (extra[4]) newEntry.waist = extra[4]; // waist
                    if (extra[5]) newEntry.hip = extra[5]; // hip
                    if (extra[2] && !newEntry.hobby) newEntry.hobby = extra[2]; // bio
                }

                // Update or Add
                if (existingMap.has(actressIdStr)) {
                    // Update existing
                    const index = actresses.findIndex(a => a.id.toString() === actressIdStr);
                    if (index !== -1) {
                        actresses[index] = newEntry;
                    }
                } else {
                    // Add new
                    actresses.push(newEntry);
                }
                updatedCount++;
                process.stdout.write('+');
            } else {
                process.stdout.write('.');
            }
            // Sleep slightly
            await new Promise(r => setTimeout(r, 200));

        } catch (e) {
            console.error(`Error updating actress ${id}:`, e);
            process.stdout.write('X');
        }
    }

    // 5. Re-sort and Save
    console.log(`\nUpdated/Added ${updatedCount} actresses.`);
    actresses.sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0));

    fs.writeFileSync(dataPath, JSON.stringify(actresses, null, 2));
    console.log(`Saved updated data to ${dataPath}`);
}

main();
