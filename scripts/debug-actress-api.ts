
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { fetchActressProfile } from '../src/lib/dmm-api';

import fs from 'fs';
import path from 'path';

async function debug() {
    const ids = ['1006229', '1036351']; // Aoi Tsukasa, Amano Miyu
    const logPath = path.join(process.cwd(), 'debug_profile.txt');
    const logs: string[] = [];

    for (const id of ids) {
        console.log(`Fetching profile for ID: ${id}`);
        const profile = await fetchActressProfile(id);
        logs.push(`--- ID ${id} ---`);
        logs.push(JSON.stringify(profile, null, 2));
    }

    fs.writeFileSync(logPath, logs.join('\n'));
    console.log(`Logged to ${logPath}`);
}

debug();
