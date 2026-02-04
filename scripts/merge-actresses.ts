
import fs from 'fs';
import path from 'path';

const BASE_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.base.json');
const NEW_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.json');
const MERGED_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.merged.json');

function mergeData() {
    try {
        let baseData = [];
        let newData = [];

        if (fs.existsSync(BASE_PATH)) {
            baseData = JSON.parse(fs.readFileSync(BASE_PATH, 'utf-8'));
            console.log(`Loaded ${baseData.length} existing actresses.`);
        } else {
            console.log("No base data found.");
        }

        if (fs.existsSync(NEW_PATH)) {
            newData = JSON.parse(fs.readFileSync(NEW_PATH, 'utf-8'));
            console.log(`Loaded ${newData.length} new/updated actresses.`);
        } else {
            console.log("No new data found.");
        }

        // Map base data by ID for easy update
        const mergedMap = new Map();
        baseData.forEach((a: any) => mergedMap.set(a.id, a));

        // Update/Add new data
        newData.forEach((a: any) => {
            mergedMap.set(a.id, a);
        });

        const mergedList = Array.from(mergedMap.values());

        // Final Sort by Date
        mergedList.sort((a: any, b: any) => {
            const dateA = a.videos && a.videos.length > 0 ? a.videos[0].date : '';
            const dateB = b.videos && b.videos.length > 0 ? b.videos[0].date : '';
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            return 0;
        });

        fs.writeFileSync(NEW_PATH, JSON.stringify(mergedList, null, 2));
        console.log(`Merged complete. Saved ${mergedList.length} actresses to ${NEW_PATH}`);

    } catch (e) {
        console.error("Merge error:", e);
    }
}

mergeData();
