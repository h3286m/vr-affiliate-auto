
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DMM_API_ID = process.env.DMM_API_ID;
const DMM_AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;

async function check(floor: string, cid: string, site: 'FANZA' | 'DMM.co.jp' = 'FANZA') {
    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${DMM_API_ID}&affiliate_id=${DMM_AFFILIATE_ID}&site=${site}&service=digital&floor=${floor}&cid=${cid}&output=json`;
    try {
        const res = await fetch(url);
        const data: any = await res.json();
        const item = data.result?.items?.[0];

        if (item) {
            console.log(`[FOUND] Site: ${site}, Floor: ${floor}, CID: ${cid}`);
            console.log(`  Title: ${item.title}`);
            console.log(`  Sample: ${item.sampleMovieURL || 'NONE'}`);
            console.log(`  Review: ${item.review?.average || '0'} (${item.review?.count || '0'})`);
        } else {
            console.log(`[NOT FOUND] Site: ${site}, Floor: ${floor}, CID: ${cid}`);
        }
    } catch (e) {
        console.error(`[ERROR] Site: ${site}, Floor: ${floor}, CID: ${cid}`, e);
    }
}

async function main() {
    const testCids = ['vrkm01780', 'avvr00214', 'vrkm01746'];
    for (const cid of testCids) {
        console.log(`\n--- Testing CID: ${cid} ---`);
        await check('videoa', cid, 'FANZA');
        await check('videoc', cid, 'FANZA');
        await check('videoa', cid, 'DMM.co.jp');
    }
}

main();
