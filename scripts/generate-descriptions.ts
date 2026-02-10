
import fs from 'fs';
import path from 'path';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'src/data/products.json');
const DESCRIPTIONS_JSON_PATH = path.join(process.cwd(), 'src/data/descriptions.json');
const HQVR_DATA_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');
const ACTRESS_DATA_PATH = path.join(process.cwd(), 'src/data/actress_data_all.csv');

interface DescriptionData {
    [contentId: string]: string;
}

interface ActressMetadata {
    height?: string;
    cup?: string;
    bust?: string;
}

function loadHqvrIntro(): Map<string, string> {
    const introMap = new Map<string, string>();
    try {
        if (fs.existsSync(HQVR_DATA_PATH)) {
            const content = fs.readFileSync(HQVR_DATA_PATH, 'utf-8');
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            const cidIdx = headers.findIndex(h => h.includes('商品ID'));
            const introIdx = headers.findIndex(h => h === '商品紹介');

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < headers.length) continue;
                const cid = parts[cidIdx]?.trim();
                const intro = parts[introIdx]?.replace(/^"|"$/g, '').trim();
                if (cid && intro) {
                    introMap.set(cid, intro);
                }
            }
        }
    } catch (e) {
        console.error('Error loading HQVR data:', e);
    }
    return introMap;
}

function loadActressMetadata(): Map<string, ActressMetadata> {
    const metaMap = new Map<string, ActressMetadata>();
    try {
        if (fs.existsSync(ACTRESS_DATA_PATH)) {
            const content = fs.readFileSync(ACTRESS_DATA_PATH, 'utf-8');
            const lines = content.split('\n');
            const headers = lines[0].split(',');

            const nameIdx = headers.findIndex(h => h === 'name');
            const cupIdx = headers.findIndex(h => h === 'cup');
            const heightIdx = headers.findIndex(h => h === 'height');
            const bustIdx = headers.findIndex(h => h === 'bust');

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < headers.length) continue;

                const name = parts[nameIdx]?.replace(/"/g, '').trim();
                const cup = parts[cupIdx]?.replace(/"/g, '').trim();
                const height = parts[heightIdx]?.replace(/"/g, '').trim();
                const bust = parts[bustIdx]?.replace(/"/g, '').trim();

                if (name && (cup || height)) {
                    metaMap.set(name, {
                        cup: cup && cup !== '-' ? cup : undefined,
                        height: height && height !== '0' ? height : undefined,
                        bust: bust && bust !== '0' ? bust : undefined
                    });
                }
            }
        }
    } catch (e) {
        console.error('Error loading actress metadata:', e);
    }
    return metaMap;
}

function generate() {
    if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
        console.error('products.json not found');
        return;
    }

    const hqvrIntros = loadHqvrIntro();
    const actressMeta = loadActressMetadata();
    const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
    const descriptions: DescriptionData = {};

    console.log(`Generating high-quality descriptions for ${products.length} products...`);

    const roles = ['妹', '人妻', 'JK', '女子高生', 'OL', '義母', '従姉妹', '幼馴染', '義理の母', '未亡人', '先生', 'ナース', '清楚', 'ギャル', 'お姉さん', '母'];
    const actions = ['中出し', '調教', '潮吹き', 'フェラ', '騎乗位', 'バック', '駅弁', 'イラマ', '絶頂', '連続絶頂', '強制', '愛液', '精液', '生パコ', '生中出し'];
    const vrKeywords = ['POV', '主観', '一人称', '至近距離', '密着', '8K', '超高精細', '実在感', '没入感'];

    products.forEach((item: any) => {
        const contentId = item.content_id;
        const rawTitle = item.title;
        const normalizedTitle = rawTitle.replace(/【VR】/g, '').replace(/\[VR\]/g, '').trim();
        const actresses = item.iteminfo?.actress?.map((a: any) => a.name) || [];
        const maker = item.iteminfo?.maker?.[0]?.name || '';

        // 1. Role/Action Semantic Extraction
        const foundRoles = roles.filter(r => normalizedTitle.includes(r));
        const foundActions = actions.filter(a => normalizedTitle.includes(a));

        // 2. Official Intro Fallback
        const officialIntro = hqvrIntros.get(contentId) || "";

        // 3. Physical Data Integration
        let physicalData = "";
        for (const name of actresses) {
            const meta = actressMeta.get(name);
            if (meta) {
                if (meta.height && meta.cup) {
                    physicalData = `${meta.cup}カップの重量感と身長${meta.height}cmの抜群のスタイルを至近距離で。`;
                    break;
                } else if (meta.cup) {
                    physicalData = `迫りくる${meta.cup}カップの豊満なボディをVRで独占。`;
                    break;
                }
            }
        }

        // 4. VR Immersion Description
        let immersionText = "";
        if (rawTitle.includes('8K') || rawTitle.includes('POV')) {
            immersionText = "超高精細な8KVR映像が、圧倒的な視覚的臨場感をもたらします。あたかもそこに彼女がいるかのような錯覚。";
        } else {
            immersionText = "VRならではの一人称視点で、手を伸ばせば届きそうな距離感を体感してください。";
        }

        // 5. Semantic Prefix
        let semanticPrefix = "";
        if (foundRoles.length > 0 && foundActions.length > 0) {
            semanticPrefix = `憧れの${foundRoles[0]}との濃厚な${foundActions[0]}をVRで体感！`;
        } else if (foundRoles.length > 0) {
            semanticPrefix = `目の前に広がる${foundRoles[0]}との禁断のシチュエーション。`;
        } else if (foundActions.length > 0) {
            semanticPrefix = `至近距離で繰り広げられる過激な${foundActions[0]}に理性が崩壊。`;
        }

        // Final Assembly Logic
        // We prioritize: Official Intro (Cleaned) + Physical Data + Immersion
        // If official is too long, we truncate or pick parts.

        let coreDesc = officialIntro.length > 20 ? officialIntro.split(/[。！!？?]/)[0] + "！" : semanticPrefix;
        if (!coreDesc) coreDesc = "極上のVR体験をお届けします。";

        const intro = actresses.length > 0 ? `${actresses.join('・')}出演。` : `${maker}のVR最新作。`;

        let finalDesc = `${intro}${coreDesc}${physicalData}${immersionText}`;

        // Deduplication & Truncation
        const seen = new Set<string>();
        const parts = finalDesc.split(/([。！!？?])/).filter(p => p.length > 0);
        let result = "";
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (p.match(/[。！!？?]/)) continue;
            const term = p.trim();
            const punctuation = (i + 1 < parts.length && parts[i + 1].match(/[。！!？?]/)) ? parts[i + 1] : "！";
            if (term && !seen.has(term)) {
                result += term + punctuation;
                seen.add(term);
            }
        }

        // Adjustment
        if (result.length > 155) result = result.substring(0, 150) + "...";
        if (result.length < 80) result += "VRファン必見の、リアリティを追求した作品です！";

        descriptions[contentId] = result;
    });

    fs.writeFileSync(DESCRIPTIONS_JSON_PATH, JSON.stringify(descriptions, null, 2));
    console.log(`Successfully generated ${Object.keys(descriptions).length} descriptions.`);
}

generate();
