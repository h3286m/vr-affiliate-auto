
const cids = [
    'vrkm01780',
    'h_1245avvr00214', // Complex CID
    'savr00981'
];

async function check(cid: string) {
    const base = "https://cc3001.dmm.co.jp/litevideo/freepv";
    const p1 = cid.charAt(0);
    const p3 = cid.substring(0, 3); // "vrk", "h_1" -> includes underscore?

    // Check if substring handles underscore correctly
    // h_1245avvr00214 -> p1="h", p3="h_1"

    const url = `${base}/${p1}/${p3}/${cid}/${cid}_dmb_w.mp4`;

    try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`CID: ${cid}`);
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.status}`);
        if (res.status !== 200) {
            // Try sm_w
            const url2 = `${base}/${p1}/${p3}/${cid}/${cid}_sm_w.mp4`;
            const res2 = await fetch(url2, { method: 'HEAD' });
            console.log(`  Retry sm_w: ${res2.status}`);
        }
    } catch (e: any) {
        console.log(`CID: ${cid} Error: ${e.message}`);
    }
}

async function main() {
    for (const cid of cids) {
        await check(cid);
    }
}

main();
