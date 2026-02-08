
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
        const title = item.title.replace(/【VR】/g, '').trim();
        const actresses = item.iteminfo?.actress?.map((a: any) => a.name) || [];
        const genres = item.iteminfo?.genre?.map((g: any) => g.name) || [];
        const maker = item.iteminfo?.maker?.[0]?.name || '';

        // Massively expanded templates for 1/100 variety
        const introTemplates = [
            `${actresses.length > 0 ? actresses.join('・') + 'の' : ''}最新作！`, `${maker}が放つ、珠玉のVR作品！`, `待望の新作！没入感抜群のVRタイトルがついに解禁！`,
            `大人気シリーズ最新作！VRでしか味わえない興奮を！`, `${actresses.length > 0 ? actresses[0] : '美少女'}との濃密なひととき！`, `ファン待望！最高峰のビジュアルで贈るVR大作！`,
            `ついに登場！VR専用ならではの密着体験！`, `異次元の興奮！話題のVRタイトルを体感せよ！`, `${maker}渾身の演出！圧倒的なリアリティをその目に！`,
            `${actresses.length > 0 ? actresses.join(', ') : '憧れの彼女'}と一緒に過ごす夢の時間！`, `これぞVRの決定版！興奮必至の最新作！`, `解禁！これまでにない至近距離の快楽を！`,
            `話題沸騰！驚異の没入感で贈るVR体験！`, `見逃し厳禁！最高にエキサイティングな新作！`, `夢のような設定！VRならすべてが現実に！`,
            `${maker}が贈る、究極のシチュエーション！`, `最先端のVR技術を結集！驚きの臨場感！`, `${actresses.length > 0 ? actresses[0] : '話題の人気女優'}が至近距離で魅せる！`,
            `ドキドキが止まらない！最高にポップなVR作品！`, `テンション爆上げ！VRならではの刺激的な展開！`, `理屈抜きの楽しさ！最旬のVRトレンドをチェック！`,
            `圧倒的支持！ファンを虜にする最高傑作！`, `今すぐ体感！これぞ次世代のエンターテインメント！`, `${maker}のこだわりが詰まった最高級VR！`,
            `一瞬で別世界へ！驚きの没入体験！`, `視点を変えれば、そこは官能の別天地！`, `未体験の感動！VRが描く究極のリアリティ！`,
            `心拍数急上昇！情熱的な演出に酔いしれる！`, `至福の快感！VR技術の粋を集めた傑作！`, `五感で感じる、彼女の温もりと情熱！`,
            `これぞプロの技！${maker}が贈る最高傑作！`, `本物以上の臨場感！VRの世界に浸り尽くせ！`, `驚愕のクオリティ！最前線のVRタイトル！`,
            `もう戻れない！VRならではの超密着体験！`, `まさに革命的！VRエンタメの最前線へ！`, `贅沢すぎるひととき！極上の女優陣が彩る！`,
            `一目惚れ確実！息を呑む美しさが目の前に！`, `最優先チェック！今年のVRシーンを総括する一作！`, `情熱が止まらない！VRファン必携の最新作！`,
            `目覚める快感！VRがもたらす新次元の刺激！`, `完璧な演出！シチュエーションの極致へ！`, `夢の競演！華やかな女優陣がVRで輝く！`,
            `本能を刺激する、鮮烈なVRビジュアル！`, `一切の妥協なし！${maker}渾身の最新作！`, `一瞬で虜になる、魔法のようなVR空間！`,
            `日常を脱ぎ捨てて、VRの深淵へ！`, `最高の思い出作り！VRで彼女と密会！`, `圧倒的なカリスマ性！話題の女優を独占！`,
            `心ゆくまで堪能！こだわり抜いたVR設定！`, `究極のファンアイテム！VRが変える視聴体験！`
        ];

        const bodyTemplates = [
            `8KVRの超高精細映像。彼女の体温や吐息までもが至近距離で伝わります。`,
            `まるでそこにいるかのような感覚。圧倒的な臨場感に驚くこと間違いなし。`,
            `細部までこだわり抜かれた映像美。刺激的なシチュエーションが満載です。`,
            `主観視点で楽しむ極上のひととき。彼女の柔らかな肌が目の前に迫る超密着体験。`,
            `最先端の撮影技術。手の届きそうな距離で繰り広げられる、夢のような光景。`,
            `VR専用設計の没入感。360度どこを見ても、そこは快感のパラダイス。`,
            `高画質ならではのリアリティ。彼女のわずかな表情の変化も見逃せません。`,
            `息を呑むほどの美しさ。VRという異次元の空間で、最高の贅沢を。`,
            `まさに究極のリアリティ。これまでの常識を覆す、圧倒的な体験が待っています。`,
            `臨場感MAX！彼女の囁きが耳元で聞こえるような、強烈な没入体験。`,
            `視界いっぱいに広がる興奮。彼女とあなただけの秘密の時間が流れます。`,
            `これこそがVRの真骨頂。一切の妥協を許さない、驚愕のビジュアル。`,
            `五感を刺激する演出。今までにない興奮が全身を駆け巡ります。`,
            `最高にエキサイティング！目の前の光景すべてがあなたのものになる贅沢感。`,
            `夢が現実になる瞬間。VRだからこそ叶う、至福のシチュエーション。`,
            `驚愕の3D表現。手を伸ばせば触れそうな距離に、彼女の笑顔が。`,
            `圧倒的な映像クオリティ。一瞬一瞬が、色鮮やかな記憶として刻まれます。`,
            `VRが生み出す濃密な空気感。彼女の情熱的な視線から目が離せません。`,
            `完璧なまでに再現された臨場感。まるで彼女の吐息が肌に触れるよう。`,
            `異次元の官能体験。VRならではの立体的な描写が本能を呼び覚ます。`,
            `こだわり抜いたライティングとアングル。彼女の美しさが際立ちます。`,
            `これぞデジタル技術の粋。未だかつてない鮮明さで綴られる物語。`,
            `360度すべてがステージ。彼女の情熱的なパフォーマンスを特等席で。`,
            `驚きのパノラマビュー。どこを向いても彼女の魅力に包まれます。`,
            `極上のサウンドと映像の融合。VR空間があなたの五感を支配します。`,
            `彼女の微かな声、柔らかな質感を完全に再現。これぞ技術の勝利。`,
            `圧倒的なスケール感。VR空間だからこそ可能な、大胆な演出の数々。`,
            `心震えるシチュエーション。彼女との心の距離まで縮まるような感覚。`,
            `これまでにない解像度。毛穴の一つひとつまで見えるような緊迫感！`,
            `VRならではのインタラクティブな感覚。彼女の反応がダイレクトに！`
        ];

        const punchTemplates = [
            `興奮が押し寄せる究極のVR体験！`, `これぞVRの真骨頂！至福のひとときを！`, `日常を忘れるほどの圧倒的な没入感！`,
            `あなたを夢中にさせる、極上のエンターテインメント！`, `視覚と聴覚を刺激する、最高のファンタジー！`,
            `理屈抜きで楽しめる、最上級の興奮！`, `今までにない衝撃！驚きの連続を体感せよ！`, `最高にハッピーなVRライフをあなたに！`,
            `ドキドキの加速が止まらない、珠玉のひととき！`, `これぞ、選ばれし者だけが味わえる特権！`, `一歩踏み出せば、そこはもう理想郷！`,
            `テンション最高潮！最高の盛り上がりをその手に！`, `心ゆくまで堪能できる、至高のシチュエーション！`, `圧倒的な満足感！今すぐチェックするしかない！`,
            `明日への活力になる、ミラクルな体験！`, `心の底からリフレッシュ！至極のVRタイム！`, `驚きを超えた感動！これぞVRマジック！`,
            `本能が求めるすべてがここに。究極の満足を！`, `一瞬の油断も許さない、爆音と快感の嵐！`, `永遠に浸っていたい、奇跡のようなVR体験！`,
            `あなたの期待を裏切らない、約束された最高傑作！`, `これを見ずしてVRは語れない。殿堂入りの一本！`, `五感を解放して、新世界の快感を味わい尽くせ！`,
            `一度味わえば病みつき。魔力のような没入感！`, `興奮のレッドゾーン！限界突破のVR体験へ！`, `最高にポップで、最高にセクシーな時間を！`,
            `まさに唯一無二。あなただけの特別な物語が始まる！`, `興奮度120%！アドレナリンが止まらない展開！`, `これぞ現代の贅沢。至れり尽くせりのVR空間！`,
            `最高の自分へのご褒美を。今、扉が開かれる！`
        ];

        // Ensure variety by picking based on idx with a larger prime multiplier for shuffle effect
        const shuffleIdx = (arr: any[], multiplier: number) => {
            return (idx * multiplier + Math.floor(idx / arr.length)) % arr.length;
        };

        const intro = introTemplates[shuffleIdx(introTemplates, 7)];
        let body = bodyTemplates[shuffleIdx(bodyTemplates, 13)];
        let punch = punchTemplates[shuffleIdx(punchTemplates, 19)];

        // Specialized genre logic with even more variety
        if (genres.includes('痴女')) {
            const chiIntro = [
                `大胆な痴女プレイに翻弄される至近距離の快楽！`, `攻めまくる彼女の誘惑！理性が崩壊する痴女体験！`,
                `予測不能な痴女シチュエーションに、ドキドキが加速！`, `恥じらいを捨てた彼女の豹変！最高に刺激的な痴女VR！`,
                `誘惑の波が止まらない！脳を揺さぶる濃厚な痴女シチュ！`
            ][idx % 5];
            body = `${chiIntro}8KVRのド迫力で、彼女の奔放な姿がガッツリ伝わります。`;
            punch = punchTemplates[shuffleIdx(punchTemplates, 23)];
        } else if (genres.includes('ハーレム') || genres.includes('3P・4P')) {
            const harIntro = [
                `美女に囲まれる夢のハーレム体験をVRで！`, `どこを見ても美少女だらけの贅沢な空間！テンション最高潮！`,
                `豪華出演陣！理屈抜きで楽しめる絶頂ハーレム！`, `ハーレムの夢を具現化！視界いっぱいに広がる快楽！`,
                `これぞ男のロマン。VRで叶える究極のハーレム！`
            ][idx % 5];
            body = `${harIntro}VRならではの360度シチュエーションに、息つく暇もありません。`;
            punch = punchTemplates[shuffleIdx(punchTemplates, 31)];
        } else if (genres.includes('人妻・主婦')) {
            const hitIntro = [
                `しっとりとした色香漂う人妻との禁断の密会！`, `VRだからこそ伝わる、人妻ならではの柔らかな質感！`,
                `ドキドキが止まらない。大人の色香に浸る究極のVR体験！`, `禁断のシチュエーション。人妻との秘密の時間がVRで解禁！`,
                `落ち着いた魅力に溺れる。人妻VRならではの濃厚な臨場感！`
            ][idx % 5];
            body = `${hitIntro}8KVRの高画質で、彼女の繊細な吐息までもが目の前に。`;
            punch = punchTemplates[shuffleIdx(punchTemplates, 37)];
        }

        let desc = `${intro}${body}${punch}`;

        // Ensure duplication check: if punch is already in desc (via specialized logic), don't append it again
        // Actually, the current logic overrides body/punch for specific genres, so desc = intro + body + punch is clean there.
        // But the previous bug was in the length adjustment.

        // Adjust length to 100-150
        if (desc.length > 150) {
            desc = desc.substring(0, 147) + '...';
        } else if (desc.length < 105) {
            // Only append punch if it's NOT already there
            const extraPunch = [
                `今すぐチェック！`, `最高級の興奮！`, `必見の最新作！`, `圧倒的満足感！`, `極上のひととき！`, `絶対に見逃すな！`, `驚きの臨場感！`,
                `ファン必見！`, `最上級の快楽！`, `異次元の感動！`, `珠玉の一本！`, `今すぐ体感せよ！`, `究極の没入体験！`
            ][idx % 13];
            if (!desc.includes(extraPunch)) {
                desc += extraPunch;
            }
            if (desc.length > 150) desc = desc.substring(0, 150);
        }

        descriptions[item.content_id] = desc;
    });

    fs.writeFileSync(DESCRIPTIONS_JSON_PATH, JSON.stringify(descriptions, null, 2));
    console.log(`Successfully generated ${Object.keys(descriptions).length} descriptions.`);
}

generate();
