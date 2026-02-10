
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const HQVR_DATA_PATH = path.join(process.cwd(), 'src/data/HQVR_data.csv');

// キーワード定義
const settings = ['家庭教師', '先生', '人妻', '義母', '幼馴染', 'OL', '女子高生', 'JK', 'ナース', 'メイド', '妹', '姉', '叔母', '姪', '担任', '部下', '上司', '義理の娘', '風俗嬢', 'エステ嬢', 'セラピスト'];
const attributes = ['Jカップ', 'Iカップ', 'Hカップ', 'Gカップ', 'Fカップ', '巨乳', '爆乳', 'スレンダー', '美脚', '美尻', '美白', '清楚', 'ギャル', '熟女', '美魔女', '微乳', '貧乳', '高身長', '低身長', 'むっちり', 'もち肌', '透明感'];
const fetishes = ['濡れ髪', 'ベロキス', '中出し', '潮吹き', '絶頂', 'アヘ顔', '寸止め', '射精指示', '顔面特化', '天井特化', '主観', 'POV', '密着', '至近距離', '囁き', '淫語', 'フェラ', '騎乗位', 'バック', '手錠'];

function extractKeywords(title: string) {
    const foundSettings = settings.filter(s => title.includes(s));
    const foundAttributes = attributes.filter(a => title.includes(a));
    const foundFetishes = fetishes.filter(f => title.includes(f));
    return {
        setting: foundSettings[0] || '',
        attribute: foundAttributes[0] || '',
        fetish: foundFetishes[0] || ''
    };
}

function generateIntro(title: string, actress: string) {
    const { setting, attribute, fetish } = extractKeywords(title);

    const actressNames = actress.split(/,|、/).map(n => n.trim()).filter(n => n !== '');
    const mainActress = actressNames[0] || '人気女優';

    const hooks = [
        `【VRの衝撃】今すぐその目で確かめてください。`,
        `目の前に実在するかのような圧倒的臨場感。`,
        `これがVRの到達点。最高画質で贈る至極の一篇。`,
        `理性を揺さぶる、究極の没入体験へ。`
    ];
    const hook = hooks[Math.floor(Math.random() * hooks.length)];

    const bodyParts = [];
    if (actressNames.length > 0) bodyParts.push(`${mainActress}${actressNames.length > 1 ? 'ら豪華キャスト' : ''}が贈る最新作。`);
    if (setting) bodyParts.push(`「${setting}」という夢のようなシチュエーションが実現。`);
    if (attribute) bodyParts.push(`${attribute}の美ボディが、手を伸ばせば届きそうな至近距離に迫ります。`);
    if (fetish) bodyParts.push(`特に${fetish}のシーンは、VRならではの臨場感で脳が震えるほどの快感を約束。`);

    const callToAction = `今この瞬間、彼女とあなただけの濃密な時間を。この感動を今すぐ体感してください。`;

    let intro = `${hook}${bodyParts.join('')}${callToAction}`;

    if (intro.length < 150) {
        intro += "VRファンなら絶対に見逃せない、細部までこだわり抜かれたハイクオリティな一本をぜひ。";
    }

    if (intro.length > 200) {
        intro = intro.substring(0, 197) + "...";
    }

    return intro;
}

function escapeCsv(str: string) {
    if (typeof str !== 'string') return '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function processCsv() {
    if (!fs.existsSync(HQVR_DATA_PATH)) {
        console.error('HQVR_data.csv not found');
        return;
    }

    console.log('Reading CSV with csv-parse...');
    const content = fs.readFileSync(HQVR_DATA_PATH, 'utf-8');
    const records: string[][] = parse(content, {
        columns: false,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        escape: '"'
    });

    if (records.length === 0) return;

    const headers = records[0];
    while (headers.length < 11) headers.push('');
    headers[10] = '紹介文';

    console.log(`Processing ${records.length - 1} records...`);

    const processedRecords = records.map((row, i) => {
        if (i === 0) return row;

        const title = row[1] || '';
        const actress = row[3] || '';
        const intro = generateIntro(title, actress);

        const newRow = [...row];
        while (newRow.length < 11) newRow.push('');
        newRow[10] = intro;
        return newRow;
    });

    console.log('Stringifying and saving CSV...');
    const csvContent = processedRecords.map(row => row.map(escapeCsv).join(',')).join('\n');

    fs.writeFileSync(HQVR_DATA_PATH, csvContent);
    console.log(`Successfully updated: ${HQVR_DATA_PATH}`);
}

processCsv();
