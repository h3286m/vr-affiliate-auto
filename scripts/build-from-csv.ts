import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import 'tsconfig-paths/register';

// ... (imports remain)
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { DmmItem } from '../src/types/dmm';

// Config
const PRODUCTS_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'HQVR_data.csv');
const ACTRESS_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'actress_data_all.csv');
const ENRICHMENT_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'actress_enrichment.csv');

const OUTPUT_ACTRESSES_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'actresses.json');
const OUTPUT_PRODUCTS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

// Interface for Actress Data from CSV
interface CsvActress {
    id: string; // Internal ID in csv
    name: string;
    ruby: string;
    bust: string;
    cup: string;
    waist: string;
    hip: string;
    height: string;
    birthday: string;
    hobby: string;
    prefectures: string;
}

interface EnrichmentData {
    id: string; // "1006229"
    name: string; // "葵つかさ"
    custom_bio?: string;
    custom_bust?: string;
    custom_waist?: string;
    custom_hip?: string;
}

interface LocalActress {
    id: string;
    name: string;
    ruby: string;
    bust?: string;
    cup?: string;
    waist?: string;
    hip?: string;
    height?: string;
    birthday?: string;
    bloodType?: string;
    hobby?: string;
    prefectures?: string;
    imageURL?: { list?: string; small?: string; large?: string; };
    videos: DmmItem[];
    // For sorting/filtering convenience
    videoCount: number;
}

// Fetch Logic (Inlined to avoid import issues or circular deps)
async function fetchMetadataMap(limit: number = 3000): Promise<Map<string, any>> {
    console.log(`Fetching metadata for top ${limit} VR videos...`);
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
        console.warn("Skipping API fetch: Missing DMM_API_ID or DMM_AFFILIATE_ID");
        return new Map();
    }

    const metadataMap = new Map<string, any>();
    let offset = 1;
    let fetchedCount = 0;

    // Fetch batches
    while (fetchedCount < limit) {
        const hits = 100;
        const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=videoa&hits=${hits}&offset=${offset}&sort=date&keyword=VR&output=json`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`API Error at offset ${offset}: ${res.status}`);
                break;
            }
            const data: any = await res.json();
            const items = data.result?.items || [];

            if (items.length === 0) break;

            for (const item of items) {
                // Store relevant metadata keyed by Content ID
                if (item.content_id) {
                    if (fetchedCount === 0 && items.indexOf(item) === 0) {
                        console.log('DEBUG: First item keys:', Object.keys(item));
                        if (item.iteminfo) {
                            console.log('DEBUG: iteminfo keys:', Object.keys(item.iteminfo));
                        } else {
                            console.log('DEBUG: iteminfo is MISSING');
                        }
                    }
                    metadataMap.set(item.content_id, {
                        sampleMovieURL: item.sampleMovieURL,
                        iteminfo: item.iteminfo, // Store genre/maker info
                        review: item.review // Store review info
                    });
                }
            }

            fetchedCount += items.length;
            offset += hits;
            process.stdout.write('.'); // progress indicator
            await new Promise(r => setTimeout(r, 100)); // Rate limit

        } catch (e) {
            console.error("Fetch error:", e);
            break;
        }
    }
    console.log(`\nFetched metadata for ${metadataMap.size} items in Pass 1.`);
    return metadataMap;
}

/**
 * Fetch metadata for specific CIDs in batches (Pass 2)
 */
async function fetchMetadataInBatches(cids: string[], floor: string): Promise<Map<string, any>> {
    const metadataMap = new Map<string, any>();
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId || cids.length === 0) return metadataMap;

    console.log(`Fetching metadata for ${cids.length} items from floor ${floor} in batches of 10...`);

    for (let i = 0; i < cids.length; i += 10) {
        const batch = cids.slice(i, i + 10);
        const cidString = batch.join(',');
        const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=${floor}&cid=${cidString}&output=json`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[Pass 2] API Error for batch starting with ${batch[0]} (${floor}): ${res.status}`);
                continue;
            }
            const data: any = await res.json();
            const items = data.result?.items || [];

            for (const item of items) {
                const dataToSave = {
                    sampleMovieURL: item.sampleMovieURL,
                    iteminfo: item.iteminfo,
                    review: item.review,
                    floor_code: floor
                };
                metadataMap.set(item.content_id, dataToSave);
            }

            // Incremental Cache Saving (every 100 items - roughly 10 batches)
            if (i % 100 === 0) {
                const PRODUCT_METADATA_CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'product_metadata_cache.json');
                const currentCache = fs.existsSync(PRODUCT_METADATA_CACHE_PATH) ? JSON.parse(fs.readFileSync(PRODUCT_METADATA_CACHE_PATH, 'utf-8')) : {};
                metadataMap.forEach((v, k) => { currentCache[k] = v; });
                fs.writeFileSync(PRODUCT_METADATA_CACHE_PATH, JSON.stringify(currentCache, null, 2));
            }

            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 200)); // Rate limit
        } catch (e) {
            console.error(`Error fetching batch starting with ${batch[0]}:`, e);
        }
    }
    console.log(`\nEnriched ${metadataMap.size} products from ${floor}.`);
    return metadataMap;
}


interface ApiActressProfile {
    id: string;
    name: string;
    ruby: string;
    bust?: string;
    cup?: string;
    waist?: string;
    hip?: string;
    height?: string;
    birthday?: string;
    blood_type?: string;
    hobby?: string;
    prefectures?: string;
    imageURL?: { small?: string; large?: string; };
}

async function fetchActressProfilesByNames(names: string[]): Promise<Map<string, ApiActressProfile>> {
    const profileMap = new Map<string, ApiActressProfile>();
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId || names.length === 0) return profileMap;

    console.log(`Directly fetching profiles for ${names.length} actresses by name...`);

    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const url = `https://api.dmm.com/affiliate/v3/ActressSearch?api_id=${apiId}&affiliate_id=${affiliateId}&keyword=${encodeURIComponent(name)}&output=json`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[API Error] ${name}: ${res.status}`);
                continue;
            }
            const data: any = await res.json();
            const actresses = data.result?.actress || [];

            // If found, take the best match (exact name match preferred)
            const match = actresses.find((a: any) => a.name.trim() === name) || actresses[0];

            if (match) {
                profileMap.set(name, {
                    id: match.id,
                    name: match.name.trim(),
                    ruby: match.ruby,
                    bust: match.bust,
                    cup: match.cup,
                    waist: match.waist,
                    hip: match.hip,
                    height: match.height,
                    birthday: match.birthday,
                    blood_type: match.blood_type,
                    hobby: match.hobby,
                    prefectures: match.prefectures,
                    imageURL: match.imageURL
                });
            }
            if (i % 20 === 0) process.stdout.write('.');
            await new Promise(r => setTimeout(r, 100)); // Respect rate limit
        } catch (e) {
            console.error(`Error fetching ${name}:`, e);
        }
    }
    console.log(`\nFetched ${profileMap.size} actress profiles from API.`);
    return profileMap;
}


async function main() {
    console.log('--- Building Data from CSVs ---');

    console.log('Loading Actress CSV...');
    const actressMapByName = new Map<string, CsvActress>();

    if (fs.existsSync(ACTRESS_CSV_PATH)) {
        const actContent = fs.readFileSync(ACTRESS_CSV_PATH, 'utf-8');
        const actRecords = parse(actContent, {
            columns: true,
            skip_empty_lines: true
        });

        for (const row of actRecords as any[]) {
            if (!row.name) continue;
            actressMapByName.set(row.name.trim(), {
                id: row.id,
                name: row.name.trim(),
                ruby: row.ruby,
                bust: row.bust,
                cup: row.cup,
                waist: row.waist,
                hip: row.hip,
                height: row.height,
                birthday: row.birthday,
                hobby: row.hobby,
                prefectures: row.prefectures
            });
        }
        console.log(`Loaded ${actressMapByName.size} actress profiles.`);
    } else {
        console.error('Actress CSV not found:', ACTRESS_CSV_PATH);
    }

    console.log('Loading Enrichment CSV...');
    const enrichmentMap = new Map<string, EnrichmentData>();
    if (fs.existsSync(ENRICHMENT_CSV_PATH)) {
        const enrichContent = fs.readFileSync(ENRICHMENT_CSV_PATH, 'utf-8');
        const enrichRecords = parse(enrichContent, {
            columns: true,
            skip_empty_lines: true
        });
        for (const row of enrichRecords as any[]) {
            if (row.name) {
                enrichmentMap.set(row.name.trim(), {
                    id: row.id,
                    name: row.name.trim(),
                    custom_bio: row.custom_bio,
                    custom_bust: row.custom_bust,
                    custom_waist: row.custom_waist,
                    custom_hip: row.custom_hip
                });
            }
        }
    }

    // Define Omnibus/Compilation Genre IDs to exclude
    const OMNIBUS_GENRE_IDS = [
        4022, // Omnibus (オムニバス) - FIXED from 4025
        5015, // Best/Compilation (ベスト・総集編)
        6003, // Best/Compilation (ベスト・総集編)
        6609, // 10 hours plus (10時間以上作品)
        6179  // 4 hours plus (4時間以上作品) - FIXED from 6012
    ];

    // Define Omnibus Keywords to exclude even if Genre ID is missing
    const OMNIBUS_KEYWORDS = ['オムニバス', 'ベスト', '総集編', 'BEST', 'ベスト版', 'セレクション', '厳選'];



    // --- PHASE 1: Initial CSV Analysis ---
    console.log('Analyzing Products CSV...');
    if (!fs.existsSync(PRODUCTS_CSV_PATH)) {
        console.error('Products CSV not found:', PRODUCTS_CSV_PATH);
        process.exit(1);
    }
    const prodContent = fs.readFileSync(PRODUCTS_CSV_PATH, 'utf-8');
    const records = parse(prodContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    });

    const productRowsByCid = new Map<string, any>();
    const allActressNamesInProducts = new Set<string>();

    for (const record of records as any[]) {
        const cid = record['商品ID(CID)'];
        const title = record['タイトル'];
        const actNamesRaw = record['出演女優名'];

        if (!cid || !title) continue;
        if (!title.includes('【VR】') && !cid.toLowerCase().startsWith('vr')) {
            if (!title.includes('【VR】')) continue;
        }

        if (!productRowsByCid.has(cid)) {
            productRowsByCid.set(cid, record);
        }

        if (actNamesRaw) {
            const names = actNamesRaw.split(/,|、/).map((s: string) => s.trim());
            for (const name of names) {
                if (name && isNaN(Number(name)) && name.length < 40 && !name.includes('【VR】')) {
                    allActressNamesInProducts.add(name);
                }
            }
        }
    }

    // Determine which actresses need an API lookup
    const missingActressNames = Array.from(allActressNamesInProducts).filter(name => !actressMapByName.has(name));

    console.log(`Found ${productRowsByCid.size} unique VR products and ${allActressNamesInProducts.size} unique actress names.`);
    console.log(`${missingActressNames.length} actresses need API profile lookups.`);

    // --- PHASE 2: API Enrichment ---
    // Pass 1: Broad keyword search
    const metadataMap = await fetchMetadataMap(4000);

    // PERSISTENT METADATA CACHE: Load previously fetched one-by-one metadata to avoid re-fetching
    const PRODUCT_METADATA_CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'product_metadata_cache.json');
    if (fs.existsSync(PRODUCT_METADATA_CACHE_PATH)) {
        try {
            const cachedMetadata = JSON.parse(fs.readFileSync(PRODUCT_METADATA_CACHE_PATH, 'utf-8'));
            console.log(`Loaded ${Object.keys(cachedMetadata).length} products from metadata cache.`);
            Object.entries(cachedMetadata).forEach(([cid, val]) => {
                if (!metadataMap.has(cid)) metadataMap.set(cid, val);
            });
        } catch (e) {
            console.warn('Failed to load product metadata cache:', e);
        }
    }

    // Pass 2: Targeted Actress Profiles (by name)
    // Check cache first
    const CACHE_ACTRESS_PATH = path.join(process.cwd(), 'src', 'data', 'actress_api_cache.json');
    let actressApiCache = new Map<string, ApiActressProfile>();
    if (fs.existsSync(CACHE_ACTRESS_PATH)) {
        try {
            const cachedData = JSON.parse(fs.readFileSync(CACHE_ACTRESS_PATH, 'utf-8'));
            Object.keys(cachedData).forEach(k => actressApiCache.set(k, cachedData[k]));
            console.log(`Loaded ${actressApiCache.size} actress profiles from cache.`);
        } catch (e) { }
    }

    const strictlyMissingActressNames = missingActressNames.filter(name => !actressApiCache.has(name));
    console.log(`${strictlyMissingActressNames.length} actresses still need API profile lookups.`);

    const newApiProfiles = await fetchActressProfilesByNames(strictlyMissingActressNames);
    const actressProfileMap = new Map<string, ApiActressProfile>();

    // Merge cache and new profiles
    actressApiCache.forEach((v, k) => actressProfileMap.set(k, v));
    newApiProfiles.forEach((v, k) => actressProfileMap.set(k, v));

    // --- PHASE 3: Detailed Item Lookups ---
    const cidsNeedingMetadata = Array.from(productRowsByCid.keys()).filter(cid => !metadataMap.has(cid));
    if (cidsNeedingMetadata.length > 0) {
        const pass2Items = await fetchMetadataInBatches(cidsNeedingMetadata, 'videoa');
        pass2Items.forEach((v, k) => metadataMap.set(k, v));

        const stillMissing = cidsNeedingMetadata.filter(cid => !metadataMap.has(cid));
        if (stillMissing.length > 0) {
            console.log(`${stillMissing.length} items still missing after videoa lookup. Trying videoc...`);
            const pass3Items = await fetchMetadataInBatches(stillMissing, 'videoc');
            pass3Items.forEach((v, k) => metadataMap.set(k, v));
        }

        // Save metadata cache
        const metadataToCache: any = {};
        metadataMap.forEach((v, k) => {
            // Only cache items that have useful data (sample or review) 
            // and weren't already in the broad search (though broad search is fast anyway)
            metadataToCache[k] = v;
        });
        fs.writeFileSync(PRODUCT_METADATA_CACHE_PATH, JSON.stringify(metadataToCache, null, 2));
        console.log(`Updated metadata cache with ${metadataMap.size} products.`);
    }

    console.log(`Final metadata coverage: ${Array.from(productRowsByCid.keys()).filter(cid => metadataMap.has(cid)).length} / ${productRowsByCid.size}`);

    // OPTIONAL: Save API Actress Profiles to a local cache to speed up next runs
    const CACHE_ACTRESS_FILE = path.join(process.cwd(), 'src', 'data', 'actress_api_cache.json');
    let existingArtCache: any = {};
    if (fs.existsSync(CACHE_ACTRESS_FILE)) {
        try { existingArtCache = JSON.parse(fs.readFileSync(CACHE_ACTRESS_FILE, 'utf-8')); } catch (e) { }
    }
    const mergedCache = { ...existingArtCache };
    actressProfileMap.forEach((v, k) => { mergedCache[k] = v; });
    fs.writeFileSync(CACHE_ACTRESS_FILE, JSON.stringify(mergedCache, null, 2));
    console.log(`Saved ${actressProfileMap.size} actress profiles to cache.`);

    // --- PHASE 3: Final Assembly ---
    const allProducts: DmmItem[] = [];
    const actressAggregation = new Map<string, LocalActress>();

    console.log(`Processing unified product list and aggregating actresses...`);
    let currentRow = 0;
    for (const [cid, record] of productRowsByCid.entries()) {
        currentRow++;
        const title = record['タイトル'];
        const dateRaw = record['発売日'];
        const actNamesRaw = record['出演女優名'];
        const scoreRaw = record['評価'];
        const countRaw = record['レビュー数'];
        const affUrl = record['商品URL'];
        const imgUrl = record['画像URL'];

        const date = dateRaw ? dateRaw.split(' ')[0].replace(/\//g, '-') : '';
        let scoreVal = scoreRaw ? parseFloat(scoreRaw) : 0;
        let countVal = countRaw ? parseInt(countRaw) : 0;

        // Merge API Metadata
        const apiData = metadataMap.get(cid);

        // Fallback to API data if CSV is 0
        if (scoreVal === 0 && countVal === 0 && apiData?.review) {
            scoreVal = apiData.review.average ? parseFloat(apiData.review.average) : 0;
            countVal = apiData.review.count || 0;
        }

        // Safeguard: Content IDs that are missing from API might be old or deleted
        // but we still include them if they are in the CSV.

        // Check for Omnibus/Compilation Keywords in Title
        const isOmnibusByTitle = OMNIBUS_KEYWORDS.some(k => title.includes(k));
        if (isOmnibusByTitle) continue;

        // Check for Omnibus/Compilation Genres (API-based)
        if (apiData?.iteminfo?.genre) {
            const hasOmnibus = apiData.iteminfo.genre.some((g: any) => OMNIBUS_GENRE_IDS.includes(g.id));
            if (hasOmnibus) continue;
        }

        const product: DmmItem = {
            content_id: cid,
            product_id: cid,
            title: title,
            date: date,
            URL: affUrl || `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/`,
            affiliateURL: affUrl,
            imageURL: {
                list: imgUrl ? imgUrl.replace('pl.jpg', 'pt.jpg') : '',
                small: imgUrl ? imgUrl.replace('pl.jpg', 'ps.jpg') : '',
                large: imgUrl.replace('pt.jpg', 'pl.jpg').replace('ps.jpg', 'pl.jpg') // normalization
            },
            sampleMovieURL: apiData?.sampleMovieURL,
            iteminfo: {
                ...(apiData?.iteminfo || {}),
                actress: []
            },
            service_code: 'digital',
            floor_code: apiData?.floor_code || 'videoa',
            review_count: countVal,
            review_average: scoreVal,
        };

        allProducts.push(product);

        if (actNamesRaw) {
            const rawNames = (actNamesRaw || '').split(/,|、/).map((s: string) => s.trim())
                .filter((s: string) => s && isNaN(Number(s)) && s.length < 40 && !s.includes('【VR】') && !s.includes('http'));

            for (const rName of rawNames) {
                const normalizedName = rName.replace(/（.*?）/g, '').trim();
                if (!normalizedName || normalizedName.length < 2) continue;

                let profile = actressMapByName.get(normalizedName);
                if (!profile && normalizedName !== rName) {
                    profile = actressMapByName.get(rName);
                }

                const safeNameId = (name: string) => `nm_${Buffer.from(name).toString('hex')}`;
                const actressId = profile ? profile.id : safeNameId(normalizedName);
                const displayName = profile ? profile.name : normalizedName;

                if (!actressAggregation.has(actressId)) {
                    const enrich = enrichmentMap.get(displayName);
                    const apiProfile = actressProfileMap.get(displayName);

                    const finalRuby = apiProfile?.ruby || profile?.ruby || '';
                    const finalBust = apiProfile?.bust || enrich?.custom_bust || profile?.bust;
                    const finalWaist = apiProfile?.waist || enrich?.custom_waist || profile?.waist;
                    const finalHip = apiProfile?.hip || enrich?.custom_hip || profile?.hip;
                    const finalHeight = apiProfile?.height || profile?.height;
                    const finalBirthday = apiProfile?.birthday || profile?.birthday;
                    const finalHobby = apiProfile?.hobby || enrich?.custom_bio || profile?.hobby;
                    const finalPref = apiProfile?.prefectures || profile?.prefectures;

                    actressAggregation.set(actressId, {
                        id: actressId,
                        name: displayName,
                        ruby: finalRuby,
                        bust: finalBust?.toString(),
                        cup: apiProfile?.cup || profile?.cup,
                        waist: finalWaist?.toString(),
                        hip: finalHip?.toString(),
                        height: finalHeight?.toString(),
                        birthday: finalBirthday,
                        hobby: finalHobby,
                        prefectures: finalPref,
                        imageURL: apiProfile?.imageURL,
                        videos: [],
                        videoCount: 0
                    });
                }

                const entry = actressAggregation.get(actressId)!;
                if (!entry.videos.some(v => v.content_id === cid)) {
                    entry.videos.push(product);
                    entry.videoCount++;
                }

                // ALSO add to product iteminfo
                if (!product.iteminfo) product.iteminfo = { actress: [] };
                if (!product.iteminfo.actress) product.iteminfo.actress = [];
                if (!product.iteminfo.actress.some((a: any) => a.id === actressId)) {
                    product.iteminfo.actress.push({
                        id: actressId,
                        name: displayName,
                        ruby: entry.ruby as any
                    });
                }
            }
        }
    }

    console.log(`\nResults:`);
    console.log(`Total VR Products: ${allProducts.length}`);
    console.log(`Total Actresses (Aggregated): ${actressAggregation.size}`);

    allProducts.sort((a, b) => (a.date < b.date ? 1 : -1));

    const sortedActresses = Array.from(actressAggregation.values()).sort((a, b) => {
        if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount;
        return a.ruby.localeCompare(b.ruby, 'ja');
    });

    fs.writeFileSync(OUTPUT_PRODUCTS_JSON_PATH, JSON.stringify(allProducts, null, 2));
    console.log(`Written ${OUTPUT_PRODUCTS_JSON_PATH}`);

    fs.writeFileSync(OUTPUT_ACTRESSES_JSON_PATH, JSON.stringify(sortedActresses, null, 2));
    console.log(`Written ${OUTPUT_ACTRESSES_JSON_PATH}`);
}

main();
