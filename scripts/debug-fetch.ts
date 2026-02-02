
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { fetchActresses } from '../src/lib/dmm-api';

async function debug() {
    console.log('--- DEBUG START ---');
    console.log('API_ID present:', !!process.env.DMM_API_ID);
    console.log('AFFILIATE_ID present:', !!process.env.DMM_AFFILIATE_ID);

    try {
        console.log("Fetching first 20 'あ' actresses...");
        // Call fetchActresses directly to see if it throws or returns empty
        const actresses = await fetchActresses('あ', 20, 1);
        console.log('Result count:', actresses.length);
        if (actresses.length > 0) {
            console.log('First actress:', actresses[0].name);
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

debug();
