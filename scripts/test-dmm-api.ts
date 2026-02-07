
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DMM_API_ID = process.env.DMM_API_ID;
const DMM_AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;

async function check(floor: string, cid: string) {
    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${DMM_API_ID}&affiliate_id=${DMM_AFFILIATE_ID}&site=DMM.co.jp&service=digital&floor=${floor}&cid=${cid}&output=json`;
    console.log(`Checking ${floor} / ${cid}...`);
    try {
        const res = await fetch(url);
        const data = await res.json();
        const item = data.result?.items?.[0];

        if (item) {
            console.log('FOUND!');
            console.log('Title:', item.title);
            console.log('Sample URL:', item.sampleMovieURL);
        } else {
            console.log('Not Found');
        }
    } catch (e) { console.error(e); }
}

async function main() {
    await check('videoa', 'vrkm01780');
    await check('videoc', 'vrkm01780'); // videoc = amateur?
    await check('videoa', 'avvr00214');
}

main();
