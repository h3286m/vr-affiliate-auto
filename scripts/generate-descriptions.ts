
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

    products.forEach((item: any, idx: number) => {
        const fullTitle = item.title.replace(/【VR】/g, '').replace(/\[VR\]/g, '').trim();
        const actresses = item.iteminfo?.actress?.map((a: any) => a.name) || [];
        const genres = item.iteminfo?.genre?.map((g: any) => g.name) || [];
        const maker = item.iteminfo?.maker?.[0]?.name || '';

        // Extract a "hook" from the title (usually the first sentence or first 40 chars)
        let titleHook = fullTitle.split(/[。！!？?]/)[0].substring(0, 50).trim();
        if (titleHook.length < 10 && fullTitle.length > 10) {
            titleHook = fullTitle.substring(0, 40).trim();
        }

        const introTemplates = [
            `${actresses.length > 0 ? actresses.join('・') + 'の' : ''}最新作！`, `${maker}が放つ、注目のVR作品！`, `待望の新作！没入感抜群のVRタイトルが登場！`,
            `大人気シリーズ最新作が登場！`, `${actresses.length > 0 ? actresses[0] : '美少女'}と過ごす濃密な時間。`, `ファン待望！最高峰のビジュアルで贈るVR大作！`,
            `ついに登場！VR専用ならではの密着体験。`, `話題のVRタイトル。この臨場感、ぜひ体感してください。`, `${maker}渾身の最新作をその目に！`,
            `${actresses.length > 0 ? actresses[0] : '憧れの彼女'}と一緒に過ごす夢の時間。`, `これぞVR！興奮必至の最新作。`, `解禁！これまでにない至近距離の快楽を。`,
            `話題沸騰！驚異の没入感で贈るVR体験！`, `見逃し厳禁！最高にエキサイティングな新作。`, `夢のような設定！VRならすべてが現実に。`,
            `${maker}が贈る、究極のシチュエーション。`, `最先端のVR技術を結集！驚きの臨場感。`,
            `ドキドキが止まらない！最高にポップなVR作品。`, `テンション爆上げ！VRならではの刺激的な展開。`,
            `圧倒的支持！ファンを虜にする最高傑作！`, `今すぐ体感。これぞ次世代のエンターテインメント。`, `${maker}のこだわりが詰まった最高級VR。`
        ];

        const bodyTemplates = [
            `${titleHook}という、VRならではの没入感を活かしたシチュエーション。`,
            `8KVRの高精細映像で綴られる${titleHook}。彼女の体温や吐息までもが至近距離で伝わります。`,
            `${titleHook}。まるでそこにいるかのような感覚、圧倒的な臨場感に驚くこと間違いなし。`,
            `細部までこだわり抜かれた映像美。${titleHook}という刺激的な体験が待っています。`,
            `主観視点で楽しむ極上のひととき。${titleHook}をテーマにした超密着体験。`,
            `手の届きそうな距離で繰り広げられる${titleHook}。夢のような光景が視界いっぱいに広がります。`,
            `VR専用設計の没入感。360度どこを見ても${titleHook}の世界が広がります。`,
            `高画質ならではのリアリティ。${titleHook}というシチュエーションを余すことなく再現。`,
            `驚きのパノラマビュー。${titleHook}を特等席で堪能できる至福の時間。`,
            `主観視点ならではの官能。${titleHook}の緊張感と快感がダイレクトに伝わります。`
        ];

        const punchTemplates = [
            `興奮が押し寄せる究極のVR体験！`, `これぞVRの真骨頂！至福のひとときを。`, `日常を忘れるほどの圧倒的な没入感。`,
            `あなたを夢中にさせる、極上のエンタメ！`, `視覚と聴覚を刺激する、最高のファンタジー。`,
            `理屈抜きで楽しめる、最上級の興奮！`, `今までにない衝撃。驚きの連続を体感せよ！`, `最高にハッピーなVRライフをあなたに。`,
            `ドキドキの加速が止まらない、珠玉のひととき！`, `心ゆくまで堪能できる、至高のシチュエーション。`, `圧倒的な満足感！今すぐチェックするしかない！`,
            `驚きを超えた感動！これぞVRマジック。`, `本能を刺激する、新次元の刺激を。`, `一度味わえば病みつき、魔力のような没入感。`,
            `興奮度120%！アドレナリンが止まらない展開！`
        ];

        // Ensure variety by picking based on idx with a larger prime multiplier for shuffle effect
        const shuffleIdx = (arr: any[], multiplier: number) => {
            return (idx * multiplier + Math.floor(idx / 100)) % arr.length;
        };

        const intro = introTemplates[shuffleIdx(introTemplates, 7)];
        let body = bodyTemplates[shuffleIdx(bodyTemplates, 13)];
        let punch = punchTemplates[shuffleIdx(punchTemplates, 19)];

        // Specialized genre logic
        if (genres.includes('痴女')) {
            const chiIntro = [
                `大胆な痴女プレイに翻弄される至近距離の快楽。`, `攻めまくる彼女の誘惑！理性が崩壊する痴女体験。`,
                `予測不能な痴女シチュエーションに、ドキドキが加速！`, `恥じらいを捨てた彼女の豹変。最高に刺激的な痴女VR！`
            ][idx % 4];
            body = `${chiIntro}${titleHook}を8KVRのド迫力で体感。彼女の奔放な姿がガッツリ伝わります。`;
        } else if (genres.includes('ハーレム') || genres.includes('3P・4P')) {
            const harIntro = [
                `美女に囲まれる夢のハーレム体験。`, `どこを見ても美少女だらけの贅沢な空間！`,
                `豪華出演陣！理屈抜きで楽しめる絶頂ハーレム。`
            ][idx % 3];
            body = `${harIntro}${titleHook}というVRならではの360度シチュエーションに、息つく暇もありません。`;
        } else if (genres.includes('人妻・主婦')) {
            const hitIntro = [
                `しっとりとした色香漂う人妻との禁断の密会。`, `VRだからこそ伝わる、人妻ならではの柔らかな質感。`,
                `大人の色香に浸る究極のVR体験。`
            ][idx % 3];
            body = `${hitIntro}${titleHook}を8KVRの高画質で。彼女の繊細な吐息までもが目の前に。`;
        }

        // --- STRICT DUPLICATION CHECK ---
        const components = [intro, body, punch];
        let finalDesc = "";
        const seenPhrases = new Set<string>();

        for (const comp of components) {
            // Simplified repetition check: if a sentence or main phrase of the component already exists in finalDesc, skip it.
            // Split by punctuation
            const sentences = comp.split(/[。！!？?]/).filter(s => s.trim().length > 0);
            for (const s of sentences) {
                const trimmed = s.trim();
                if (!seenPhrases.has(trimmed)) {
                    finalDesc += trimmed + (trimmed.match(/[。！!？?]$/) ? "" : "！");
                    seenPhrases.add(trimmed);
                }
            }
        }

        // --- LENGTH ADJUSTMENT ---
        if (finalDesc.length > 155) {
            finalDesc = finalDesc.substring(0, 150) + '...';
        } else if (finalDesc.length < 100) {
            const extraPunchTemplates = [
                `今すぐチェック！`, `最高級の興奮！`, `必見の最新作！`, `圧倒的満足感！`, `極上のひととき！`, `驚きの臨場感！`,
                `ファン必見！`, `最上級の快楽！`, `今すぐ体感せよ！`, `究極の没入体験！`
            ];
            for (const ep of extraPunchTemplates) {
                if (!seenPhrases.has(ep) && finalDesc.length < 130) {
                    finalDesc += ep;
                    seenPhrases.add(ep);
                }
            }
            if (finalDesc.length > 155) finalDesc = finalDesc.substring(0, 155);
        }

        descriptions[item.content_id] = finalDesc;
    });

    fs.writeFileSync(DESCRIPTIONS_JSON_PATH, JSON.stringify(descriptions, null, 2));
    console.log(`Successfully generated ${Object.keys(descriptions).length} descriptions.`);
}

generate();
