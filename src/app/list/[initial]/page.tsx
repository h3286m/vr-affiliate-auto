import ActressCard from '@/components/ActressCard';
import actresses from '@/data/actresses.json';
import { DmmActress, DmmItem } from '@/types/dmm';

// Type assertion
const allActresses = actresses as (DmmActress & { videos: DmmItem[] })[];

export const dynamicParams = false;

// Generate Static Params for SSG (あ-わ)
export async function generateStaticParams() {
    const syllabary = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
    const params = [];
    for (const char of syllabary) {
        params.push({ initial: char });
        params.push({ initial: encodeURIComponent(char) });
    }
    return params;
}

export default async function ActressListPage(props: { params: Promise<{ initial: string }> }) {
    const params = await props.params;
    // Decode param just in case (though Next.js usually handles it)
    const initial = decodeURIComponent(params.initial);

    // Filter Logic
    const getRowChar = (char: string) => {
        if (!char) return '';
        const c = char.charAt(0);
        if (/[あ-お]/.test(c)) return 'あ';
        if (/[か-こ]/.test(c)) return 'か';
        if (/[さ-そ]/.test(c)) return 'さ';
        if (/[た-と]/.test(c)) return 'た';
        if (/[な-の]/.test(c)) return 'な';
        if (/[は-ほ]/.test(c)) return 'は';
        if (/[ま-も]/.test(c)) return 'ま';
        if (/[や-よ]/.test(c)) return 'や';
        if (/[ら-ろ]/.test(c)) return 'ら';
        if (/[わ-ん]/.test(c)) return 'わ';
        return 'other';
    };

    const filteredActresses = allActresses.filter(actress => {
        const firstChar = actress.ruby?.charAt(0);
        if (!firstChar) return false;
        return getRowChar(firstChar) === initial;
    });

    const syllabaryRows = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
    const currentIndex = syllabaryRows.indexOf(initial);
    const prevInitial = currentIndex > 0 ? syllabaryRows[currentIndex - 1] : null;
    const nextInitial = currentIndex !== -1 && currentIndex < syllabaryRows.length - 1 ? syllabaryRows[currentIndex + 1] : null;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center mb-8">
                <div className="w-1.5 h-8 bg-pink-500 mr-3 rounded-full" />
                <h2 className="text-3xl font-bold text-white">
                    "{initial}"行の女優 ({filteredActresses.length})
                </h2>
            </div>

            {filteredActresses.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                    該当する女優が見つかりませんでした。
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredActresses.map(actress => (
                        <ActressCard key={actress.id} actress={actress} />
                    ))}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-16 pt-8 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Prev Row */}
                    {prevInitial ? (
                        <a
                            href={`/list/${prevInitial}`}
                            className="flex items-center px-6 py-3 bg-gray-900 border border-gray-700 hover:border-[#ff8f00] rounded-lg text-gray-300 hover:text-[#ff8f00] transition-colors w-full sm:w-auto justify-center max-w-[200px]"
                        >
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            <span>{prevInitial}行へ</span>
                        </a>
                    ) : (
                        <div className="w-full sm:w-auto px-6 py-3" />
                    )}

                    {/* Back to Top */}
                    <a
                        href="/"
                        className="flex items-center px-6 py-3 bg-[#ff8f00] hover:bg-[#ffca28] text-white font-bold rounded-lg shadow-lg hover:shadow-[#ff8f00]/20 transition-all w-full sm:w-auto justify-center"
                    >
                        トップに戻る
                    </a>

                    {/* Next Row */}
                    {nextInitial ? (
                        <a
                            href={`/list/${nextInitial}`}
                            className="flex items-center px-6 py-3 bg-gray-900 border border-gray-700 hover:border-[#ff8f00] rounded-lg text-gray-300 hover:text-[#ff8f00] transition-colors w-full sm:w-auto justify-center max-w-[200px]"
                        >
                            <span>{nextInitial}行へ</span>
                            <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </a>
                    ) : (
                        <div className="w-full sm:w-auto px-6 py-3" />
                    )}
                </div>
            </div>
        </div>
    );
}
