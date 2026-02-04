
import fs from 'fs';
import path from 'path';

const ACTRESSES_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.json');

try {
    const data = JSON.parse(fs.readFileSync(ACTRESSES_PATH, 'utf-8'));
    const initialCount = data.length;

    // Filter out actresses with no videos
    const filtered = data.filter((a: any) => a.videos && a.videos.length > 0);
    const finalCount = filtered.length;

    console.log(`Original count: ${initialCount}`);
    console.log(`Removed: ${initialCount - finalCount}`);
    console.log(`Final count: ${finalCount}`);

    fs.writeFileSync(ACTRESSES_PATH, JSON.stringify(filtered, null, 2));
    console.log('Update complete.');
} catch (e) {
    console.error(e);
}
