
require('dotenv').config({ path: '.env.local' });

async function testActressBatch() {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    // IDs from CSV: 160 (北川ゆい), 1068671 (北野未奈), 2351 (瀬戸準)
    const testIds = '160,1068671,2351';

    const url = `https://api.dmm.com/affiliate/v3/ActressSearch?api_id=${apiId}&affiliate_id=${affiliateId}&actress_id=${testIds}&output=json`;
    console.log(`Fetching: ${url}`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log('Result Count:', data.result?.result_count);
        if (data.result?.actress) {
            data.result.actress.forEach(a => {
                console.log(`- [${a.id}] ${a.name}: ${a.imageURL?.small}`);
            });
        } else {
            console.log('No actress data found or error:', data);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testActressBatch();
