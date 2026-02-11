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
                        iteminfo: item.iteminfo // Store genre/maker info
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
    console.log(`\nFetched metadata for ${metadataMap.size} items.`);
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

async function fetchActressProfiles(): Promise<Map<string, ApiActressProfile>> {
    console.log('Fetching actress profiles from API (with pagination)...');
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
        console.warn("Skipping Actress API fetch: Missing API keys");
        return new Map();
    }

    const initials = [
        'あ', 'い', 'う', 'え', 'お',
        'か', 'き', 'く', 'け', 'こ',
        'さ', 'し', 'す', 'せ', 'そ',
        'た', 'ち', 'つ', 'て', 'と',
        'な', 'に', 'ぬ', 'ね', 'の',
        'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ま', 'み', 'む', 'め', 'も',
        'や', 'ゆ', 'よ',
        'ら', 'り', 'る', 'れ', 'ろ',
        'わ'
    ];

    const profileMap = new Map<string, ApiActressProfile>();

    for (const initial of initials) {
        let offset = 1;
        let fetchedDetail = 0;
        let totalCount = 0;

        // Loop until we fetch all for this initial
        while (true) {
            const hits = 100;
            const url = `https://api.dmm.com/affiliate/v3/ActressSearch?api_id=${apiId}&affiliate_id=${affiliateId}&initial=${encodeURIComponent(initial)}&hits=${hits}&offset=${offset}&output=json`;

            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn(`Actress API Error for ${initial} offset ${offset}: ${res.status}`);
                    break;
                }
                const data: any = await res.json();
                const actresses = data.result?.actress || [];
                totalCount = data.result?.total_count || 0;

                if (actresses.length === 0) break;

                for (const act of actresses) {
                    // normalize name to trim
                    const name = act.name.trim();
                    profileMap.set(name, {
                        id: act.id,
                        name: name,
                        ruby: act.ruby, // API ruby is strict/correct
                        bust: act.bust,
                        cup: act.cup,
                        waist: act.waist,
                        hip: act.hip,
                        height: act.height,
                        birthday: act.birthday,
                        blood_type: act.blood_type,
                        hobby: act.hobby,
                        prefectures: act.prefectures,
                        imageURL: act.imageURL
                    });
                }

                fetchedDetail += actresses.length;

                if (fetchedDetail >= totalCount) break;

                offset += hits;

                // Rate limit slightly
                await new Promise(r => setTimeout(r, 50));

            } catch (e) {
                console.error(`Error fetching actress initial ${initial}:`, e);
                break;
            }
        }
        process.stdout.write(initial); // progress indicator
    }
    console.log(`\nFetched profiles for ${profileMap.size} unique actresses from API.`);
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
        4025, // Omnibus (オムニバス)
        5015, // Best/Compilation (ベスト・総集編)
        6003, // Best/Compilation (ベスト・総集編)
        6609, // 10 hours plus (10時間以上作品)
        6012  // 4 hours plus (4時間以上作品)
    ];

    // Define Omnibus Keywords to exclude even if Genre ID is missing
    const OMNIBUS_KEYWORDS = ['オムニバス', 'ベスト', '総集編', 'BEST', 'ベスト版', 'セレクション', '厳選'];



    // NEW: Fetch Metadata from API to get sample URLs
    const metadataMap = await fetchMetadataMap(3000);
    const actressProfileMap = await fetchActressProfiles();





    console.log('Loading Products CSV...');
    if (!fs.existsSync(PRODUCTS_CSV_PATH)) {
        console.error('Products CSV not found:', PRODUCTS_CSV_PATH);
        process.exit(1);
    }
    const prodContent = fs.readFileSync(PRODUCTS_CSV_PATH, 'utf-8');
    const records = parse(prodContent, {
        columns: true, // Use headers
        skip_empty_lines: true,
        relax_column_count: true // Handle the trailing empty column if needed
    });
    const allProducts: DmmItem[] = [];
    const actressAggregation = new Map<string, LocalActress>();

    console.log(`Processing ${records.length} product rows...`);

    let currentRow = 0;
    for (const record of records as any[]) {
        currentRow++;
        const cid = record['商品ID(CID)'];
        const title = record['タイトル'];
        const dateRaw = record['発売日'];
        const actNamesRaw = record['出演女優名'];
        const scoreRaw = record['評価'];
        const countRaw = record['レビュー数'];
        const affUrl = record['商品URL'];
        const imgUrl = record['画像URL'];

        if (!cid || !title) continue;

        if (!title.includes('【VR】') && !cid.startsWith('vr')) {
            if (!title.includes('【VR】')) continue;
        }

        const date = dateRaw ? dateRaw.split(' ')[0].replace(/\//g, '-') : '';
        const scoreVal = scoreRaw ? parseFloat(scoreRaw) : 0;
        const countVal = countRaw ? parseInt(countRaw) : 0;

        // Merge API Metadata (Sample URL & Genre)
        const apiData = metadataMap.get(cid);

        // Check for Omnibus/Compilation Keywords in Title (Primary safeguard)
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
                large: imgUrl
            },
            sampleMovieURL: apiData?.sampleMovieURL,
            iteminfo: {
                ...(apiData?.iteminfo || {}),
                actress: [] // Will be populated below
            },
            service_code: 'digital',
            floor_code: 'videoa',
            review_count: countVal,
            review_average: scoreVal,
        };

        allProducts.push(product);

        if (actNamesRaw) {
            // Filter out purely numeric strings (IDs) and trim
            // ALSO filter out strings that are too long or contain title markers to avoid leaks
            const rawNames = (actNamesRaw || '').split(/,|、/).map((s: string) => s.trim())
                .filter((s: string) => {
                    return s &&
                        isNaN(Number(s)) &&
                        s.length < 40 &&
                        !s.includes('【VR】') &&
                        !s.includes('http');
                });

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

                if (currentRow < 5) console.log(`DEBUG: Row ${currentRow} actNamesRaw: "${actNamesRaw}" -> rawNames: ${JSON.stringify(rawNames)}`);

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
