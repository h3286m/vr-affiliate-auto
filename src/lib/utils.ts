
export const SYLLABARY_ROWS = [
    { label: 'あ行', char: 'あ', range: ['あ', 'い', 'う', 'え', 'お'] },
    { label: 'か行', char: 'か', range: ['か', 'き', 'く', 'け', 'こ', 'が', 'ぎ', 'ぐ', 'げ', 'ご'] },
    { label: 'さ行', char: 'さ', range: ['さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
    { label: 'た行', char: 'た', range: ['た', 'ち', 'つ', 'て', 'と', 'だ', 'ぢ', 'づ', 'で', 'ど'] },
    { label: 'な行', char: 'な', range: ['な', 'に', 'ぬ', 'ね', 'の'] },
    { label: 'は行', char: 'は', range: ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
    { label: 'ま行', char: 'ま', range: ['ま', 'み', 'む', 'め', 'も'] },
    { label: 'や行', char: 'や', range: ['や', 'ゆ', 'よ'] },
    { label: 'ら行', char: 'ら', range: ['ら', 'り', 'る', 'れ', 'ろ'] },
    { label: 'わ行', char: 'わ', range: ['わ', 'を', 'ん'] }, // Usually just Wa
];

export function getRowChar(ruby: string): string | null {
    if (!ruby) return null;
    const firstChar = ruby.charAt(0);
    for (const row of SYLLABARY_ROWS) {
        if (row.range.includes(firstChar)) {
            return row.char;
        }
    }
    return 'others';
}
