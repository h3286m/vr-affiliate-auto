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
                    metadataMap.set(item.content_id, {
                        sampleMovieURL: item.sampleMovieURL,
                        // We could fetch other fields too, but we mainly need sampleURL
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

    // NEW: Fetch Metadata from API to get sample URLs
    const metadataMap = await fetchMetadataMap(3000);

    console.log('Loading Products CSV...');
    if (!fs.existsSync(PRODUCTS_CSV_PATH)) {
        console.error('Products CSV not found:', PRODUCTS_CSV_PATH);
        process.exit(1);
    }
    const prodContent = fs.readFileSync(PRODUCTS_CSV_PATH, 'utf-8');
    const prodRecords = parse(prodContent, {
        columns: false,
        from_line: 2,
        skip_empty_lines: true
    });

    const allProducts: DmmItem[] = [];
    const actressAggregation = new Map<string, LocalActress>();

    console.log(`Processing ${prodRecords.length} product rows...`);

    for (const row of prodRecords) {
        if (row.length < 8) continue;

        const cid = row[0];
        const title = row[1];
        const dateRaw = row[2];
        const actNamesRaw = row[3];
        const scoreVal = row[5] ? parseFloat(row[5]) : 0;
        const countVal = row[6] ? parseInt(row[6]) : 0;
        const affUrl = row[7];
        const imgUrl = row[8];

        if (!title.includes('【VR】') && !cid.startsWith('vr')) {
            if (!title.includes('【VR】')) continue;
        }

        const date = dateRaw ? dateRaw.split(' ')[0].replace(/\//g, '-') : '';

        // Merge API Metadata (Sample URL)
        const apiData = metadataMap.get(cid);

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
            sampleMovieURL: apiData?.sampleMovieURL, // Add sample URL from API
            service_code: 'digital',
            floor_code: 'videoa',
            review_count: countVal,
            review_average: scoreVal,
        };

        allProducts.push(product);

        if (actNamesRaw) {
            const rawNames = actNamesRaw.split(/,|、/).map((s: string) => s.trim());

            for (const rName of rawNames) {
                if (!rName) continue;
                const normalizedName = rName.replace(/（.*?）/g, '').trim();
                let profile = actressMapByName.get(normalizedName);

                if (!profile && normalizedName !== rName) {
                    profile = actressMapByName.get(rName);
                }

                const safeNameId = (name: string) => `nm_${Buffer.from(name).toString('hex')}`;
                const actressId = profile ? profile.id : safeNameId(normalizedName);
                const displayName = profile ? profile.name : normalizedName;

                if (!actressAggregation.has(actressId)) {
                    const enrich = enrichmentMap.get(displayName);
                    actressAggregation.set(actressId, {
                        id: actressId,
                        name: displayName,
                        ruby: profile?.ruby || '',
                        bust: enrich?.custom_bust || profile?.bust,
                        cup: profile?.cup,
                        waist: enrich?.custom_waist || profile?.waist,
                        hip: enrich?.custom_hip || profile?.hip,
                        height: profile?.height,
                        birthday: profile?.birthday,
                        hobby: enrich?.custom_bio || profile?.hobby,
                        prefectures: profile?.prefectures,
                        videos: [],
                        videoCount: 0
                    });
                }

                const entry = actressAggregation.get(actressId)!;
                if (!entry.videos.some(v => v.content_id === cid)) {
                    entry.videos.push(product);
                    entry.videoCount++;
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
