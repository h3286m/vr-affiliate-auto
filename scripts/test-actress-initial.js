
require('dotenv').config({ path: '.env.local' });

async function testActressInitial() {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    // Test initial 'あ' (a)
    const initial = 'あ';
    // Need to encode? Usually libraries do, but native fetch might need manual encoding if not handled.
    // DMM API expects UTF-8 usually.

    const url = `https://api.dmm.com/affiliate/v3/ActressSearch?api_id=${apiId}&affiliate_id=${affiliateId}&initial=${encodeURIComponent(initial)}&hits=10&output=json`;
    console.log(`Fetching: ${url}`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log('Result Count:', data.result?.result_count);
        if (data.result?.actress) {
            data.result.actress.forEach(a => {
                console.log(`- [${a.id}] ${a.name}: ${JSON.stringify(a.imageURL)}`);
            });
        } else {
            console.log('No actress data found or error:', data);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testActressInitial();
