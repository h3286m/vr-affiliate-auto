
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { fetchActressItems } from '../src/lib/dmm-api';

async function patch() {
    console.log("Patching Aoi Tsukasa...");

    // 1. Get existing data
    const dataPath = path.join(process.cwd(), 'src', 'data', 'actresses.json');
    const actresses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // 2. Check if exists
    if (actresses.find((a: any) => a.id === '1006229' || a.id === 1006229)) {
        console.log("Aoi Tsukasa already exists.");
        return;
    }

    // 3. Define Profile (From debug logs)
    const profile = {
        "id": "1006229",
        "name": "葵つかさ",
        "ruby": "あおいつかさ",
        "bust": "88",
        "cup": "E",
        "waist": "58",
        "hip": "86",
        "height": "163",
        "birthday": "1990-08-14",
        "blood_type": "O",
        "hobby": "ジョギング、ジャズ鑑賞、アルトサックス、ピアノ、一輪車",
        "prefectures": "大阪府",
        "imageURL": {
            "small": "http://pics.dmm.co.jp/mono/actjpgs/thumbnail/aoi_tukasa.jpg",
            "large": "http://pics.dmm.co.jp/mono/actjpgs/aoi_tukasa.jpg"
        },
        "listURL": {
            "digital": "https://al.fanza.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Flist%2F%3Factress%3D1006229%2F&af_id=erotrick-990&ch=api",
            "monthly": "https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fmonthly%2Fpremium%2F-%2Flist%2F%3D%2Farticle%3Dactress%2Fid%3D1006229%2F&af_id=erotrick-990&ch=api",
            "mono": "https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fmono%2Fdvd%2F-%2Flist%2F%3D%2Farticle%3Dactress%2Fid%3D1006229%2F&af_id=erotrick-990&ch=api"
        }
    };

    // 4. Fetch Videos
    console.log("Fetching videos...");
    const items = await fetchActressItems('1006229', 100, 'VR', 'rank');
    const strictVrItems = items.filter(item => {
        const isVR = item.title && item.title.startsWith('【VR】');
        const isRecent = item.date && item.date >= '2016-01-01';
        return isVR && isRecent;
    });

    const videos = strictVrItems.slice(0, 10);
    console.log(`Found ${videos.length} videos.`);

    if (videos.length > 0) {
        // 5. Merge
        const entry = {
            ...profile,
            videos: videos
        };
        actresses.push(entry);

        // Re-sort
        actresses.sort((a: any, b: any) => (b.videos?.length || 0) - (a.videos?.length || 0));

        fs.writeFileSync(dataPath, JSON.stringify(actresses, null, 2));
        console.log("Patched actresses.json with Aoi Tsukasa.");
    } else {
        console.error("No valid videos found for Aoi Tsukasa, skipping patch.");
    }
}

patch();
