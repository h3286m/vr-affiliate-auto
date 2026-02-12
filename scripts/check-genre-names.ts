import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const apiId = process.env.DMM_API_ID;
    const affId = process.env.DMM_AFFILIATE_ID;
    const cid = 'vrkm01765'; // Just a random VR cid to check common genres

    // I want to find one that likely has 4025.
    // Let's try to search for items with genre 4025.
    const url = `https://api.dmm.com/affiliate/v3/GenreSearch?api_id=${apiId}&affiliate_id=${affId}&floor_id=43&output=json`;

    const res = await fetch(url);
    const data: any = await res.json();
    const genres = data.result?.genre || [];

    const target = genres.find((g: any) => g.id === 4025);
    const target2 = genres.find((g: any) => g.id === 5015);
    const target3 = genres.find((g: any) => g.id === 6012);

    console.log('Genre 4025:', target);
    console.log('Genre 5015:', target2);
    console.log('Genre 6012:', target3);

    // Let's also print first 10 genres to see what they are
    console.log('Top genres:', genres.slice(0, 10));
}

check().catch(console.error);
