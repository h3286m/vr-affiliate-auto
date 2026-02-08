
import fs from 'fs';
import path from 'path';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'src/data/products.json');
const DESCRIPTIONS_JSON_PATH = path.join(process.cwd(), 'src/data/descriptions.json');

interface DescriptionData {
    [contentId: string]: string;
}

function generate() {
    if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
        console.error('products.json not found');
        return;
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
    const descriptions: DescriptionData = {};

    console.log(`Generating descriptions for ${products.length} products...`);

    products.forEach((item: any) => {
        const title = item.title.replace(/【VR】/g, '').trim();
        const actresses = item.iteminfo?.actress?.map((a: any) => a.name) || [];
        const genres = item.iteminfo?.genre?.map((g: any) => g.name) || [];
        const maker = item.iteminfo?.maker?.[0]?.name || '';

        // Randomize templates to keep it fresh
        const introTemplates = [
            `${actresses.length > 0 ? actresses.join('・') + 'の' : ''}注目作が登場！`,
            `${maker}がおくる渾身のVR作品！`,
            `圧倒的な没入感で話題のVRタイトル！`,
            `大人気シリーズの最新作がついに解禁！`,
            `${actresses.length > 0 ? actresses[0] : '美少女'}との濃密な時間をVRで！`
        ];

        const bodyTemplates = [
            `8KVRの超高精細映像で、彼女の体温や吐息までもが至近距離で伝わります。`,
            `まるでそこにいるかのような感覚。VRならではの圧倒的な臨場感に驚くこと間違いなし。`,
            `細部までこだわり抜かれた映像美。${genres.join('、')}など、刺激的なシチュエーションが満載です。`,
            `主観視点で楽しむ極上のひととき。彼女の柔らかな肌が目の前に迫る、超密着体験です。`
        ];

        const punchTemplates = [
            `理屈抜きの興奮が押し寄せる究極のVR体験！`,
            `これぞVRの真骨頂！至福のひとときを！`,
            `日常を忘れるほどの圧倒的な没入感！`,
            `あなたを夢中にさせる、極上のエンターテインメント！`,
            `視覚と聴覚を刺激する、最高のファンタジー！`
        ];

        const intro = introTemplates[Math.floor(Math.random() * introTemplates.length)];
        const body = bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)];
        const punch = punchTemplates[Math.floor(Math.random() * punchTemplates.length)];

        // Clean up title for inclusion if needed
        let shortTitle = title;
        if (shortTitle.length > 40) shortTitle = shortTitle.substring(0, 37) + '...';

        let desc = `${intro}${body}${punch}`;

        // If specific genres exist, replace body to match
        if (genres.includes('痴女')) {
            desc = `${intro}大胆な痴女プレイに翻弄される至近距離の快楽。8KVRのド迫力で彼女の誘惑がガッツリ伝わります！理性を忘れて溺れる、最上級の没入感！濃密すぎるひととき！`;
        } else if (genres.includes('ハーレム') || genres.includes('3P・4P')) {
            desc = `${intro}多数の美女に囲まれる、夢のハーレム体験をVRで！どこを見ても美少女だらけの贅沢な空間にテンションも最高潮！エスカレートする快楽の渦！究極のシチュエーション！`;
        } else if (genres.includes('人妻・主婦')) {
            desc = `${intro}しっとりとした色香漂う人妻との禁断の密会。VRだからこそ伝わる、彼女の柔らかな肌の質感やリアルな距離感にドキドキが止まりません！現実逃避必至のひととき！`;
        }

        // Adjust length to 100-150
        if (desc.length > 150) {
            desc = desc.substring(0, 147) + '...';
        } else if (desc.length < 100) {
            desc += ` ${punch}`; // Add more punch if too short
            if (desc.length > 150) desc = desc.substring(0, 150);
        }

        descriptions[item.content_id] = desc;
    });

    fs.writeFileSync(DESCRIPTIONS_JSON_PATH, JSON.stringify(descriptions, null, 2));
    console.log(`Successfully generated ${Object.keys(descriptions).length} descriptions.`);
}

generate();
