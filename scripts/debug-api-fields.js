const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function probe() {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;
    const cid = 'savr00976'; // Sample

    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=videoa&cid=${cid}&output=json`;

    try {
        const res = await axios.get(url);
        const item = res.data.result.items[0];
        fs.writeFileSync('api_debug_dump.json', JSON.stringify(item, null, 2), 'utf-8');
        console.log('Results written to api_debug_dump.json');
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

probe();
