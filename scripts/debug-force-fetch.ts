
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { fetchActressProfile, fetchActressItems } from '../src/lib/dmm-api';

async function debug() {
    console.log("Debugging Force Fetch Logic...");
    const csvPath = path.join(process.cwd(), 'src', 'data', 'actress_enrichment.csv');
    const forceFetchIds: string[] = [];

    if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                forceFetchIds.push(parts[0].trim());
            }
        }
    }

    // Load Priority Actresses JSON
    const priorityPath = path.join(process.cwd(), 'src', 'data', 'priority-actresses.json');
    if (fs.existsSync(priorityPath)) {
        console.log('Loading priority actresses from JSON...');
        try {
            const priorityContent = fs.readFileSync(priorityPath, 'utf-8');
            const priorityIds = JSON.parse(priorityContent);
            if (Array.isArray(priorityIds)) {
                priorityIds.forEach((id: string) => {
                    forceFetchIds.push(String(id));
                });
                console.log(`Loaded ${priorityIds.length} priority IDs.`);
            }
        } catch (jsonErr) {
            console.error('Error reading priority-actresses.json:', jsonErr);
        }
    }
    console.log(`CSV IDs: ${forceFetchIds.join(', ')}`);

    // Mock existing list (empty)
    const actresses: any[] = [];

    // Run Logic
    for (const id of forceFetchIds) {
        console.log(`Processing ID '${id}' (length: ${id.length})`);
        try {
            const profile = await fetchActressProfile(id);
            if (profile) {
                console.log(`  -> Fetched Profile: ${profile.name} (ID: ${profile.id})`);

                // Test Video Fetching for this profile
                console.log(`  -> Fetching videos...`);
                // Use same logic as main script
                const items = await fetchActressItems(profile.id.toString(), 100, 'VR', 'rank');
                const strictVrItems = items.filter(item => {
                    const isVR = item.title && item.title.startsWith('【VR】');
                    const isRecent = item.date && item.date >= '2016-01-01';
                    return isVR && isRecent;
                });
                console.log(`  -> Found ${strictVrItems.length} valid videos.`);
                if (strictVrItems.length === 0 && items.length > 0) {
                    console.log(`  -> WARNING: 0 valid videos, but ${items.length} raw items. First raw title: ${items[0].title}`);
                }

            } else {
                console.log(`  -> Profile fetch returned null`);
            }
        } catch (e) {
            console.error(e);
        }
    }

    console.log("--- HARDCODED CHECK ---");
    const results = [];
    // Run Logic
    for (const id of forceFetchIds) {
        console.log(`Processing ID '${id}'`);
        try {
            const profile = await fetchActressProfile(id);
            if (profile) {
                console.log(`  -> Fetched Profile: ${profile.name}`);
                results.push({ id, name: profile.name, success: true });
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
