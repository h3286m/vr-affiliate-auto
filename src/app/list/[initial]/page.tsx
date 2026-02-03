
import Link from 'next/link';
import { notFound } from 'next/navigation';
import actressesDataRaw from '@/data/actresses.json';
import { DmmActress, DmmItem } from '@/types/dmm';
import { SYLLABARY_ROWS, getRowChar } from '@/lib/utils';

// Define the interface for the extended actress object matches the JSON
interface ActressWithVideo extends DmmActress {
    videos?: DmmItem[];
}

const actressesData = actressesDataRaw as unknown as ActressWithVideo[];

export async function generateStaticParams() {
    return SYLLABARY_ROWS.map((row) => ({
        initial: row.char,
    }));
}

export default async function ListPage({ params }: { params: Promise<{ initial: string }> }) {
    const { initial } = await params;
    const decodedInitial = decodeURIComponent(initial);

    // Filter actresses by the requested initial row
    const filteredActresses = actressesData.filter(actress => {
        return getRowChar(actress.ruby) === decodedInitial;
    });

    // Find the label for display
    // Find the row info (e.g., to get the range ['あ', 'い', ...])
    const rowInfo = SYLLABARY_ROWS.find(r => r.char === decodedInitial);
    const label = rowInfo ? rowInfo.label : `「${decodedInitial}」行`;

    // Group actresses by their specific initial character
    const groupedActresses: Record<string, ActressWithVideo[]> = {};
    const characters = rowInfo ? rowInfo.range : [decodedInitial];

    // Initialize groups
    characters.forEach(char => {
        groupedActresses[char] = [];
    });
    // Fallback for others
    groupedActresses['others'] = [];

    filteredActresses.forEach(actress => {
        const firstChar = actress.ruby.charAt(0);
        if (characters.includes(firstChar)) {
            groupedActresses[firstChar].push(actress);
        } else {
            groupedActresses['others'].push(actress);
        }
    });

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
            <main className="mx-auto max-w-6xl px-4 py-16">

                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="text-[#ff8f00] hover:text-[#ffca28] transition-colors inline-flex items-center text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        トップに戻る
                    </Link>
                </div>

                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                        {label}
                    </h1>
                    <p className="text-gray-400">
                        {filteredActresses.length}人の女優が登録されています
                    </p>
                </div>

                {characters.map((char) => {
                    const group = groupedActresses[char];
                    if (!group || group.length === 0) return null;

                    return (
                        <div key={char} className="mb-16">
                            <div className="flex items-baseline border-b border-gray-800 pb-4 mb-6">
                                <h2 className="text-4xl font-bold text-[#ff8f00] mr-4">{char}</h2>
                                <span className="text-gray-500 text-sm">{group.length}名</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {group.map((actress) => (
                                    <Link
                                        key={actress.id}
                                        href={`/actress/${actress.id}`}
                                        className="block bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-[#ff8f00]/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff8f00]/10 group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Icon / Avatar */}
                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#ff8f00] transition-colors bg-gray-800">
                                                    {actress.imageURL?.small ? (
                                                        <img
                                                            src={actress.imageURL.small}
                                                            alt={actress.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-white truncate pr-2">
                                                        {actress.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mb-2">
                                                    {actress.ruby}
                                                </p>

                                                {/* VR Badge */}
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-800">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        VR: {actress.videos?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Handle "others" if any exist (though minimal/unlikely with standard rows) */}
                {groupedActresses['others'] && groupedActresses['others'].length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-gray-500 border-b border-gray-800 pb-2 mb-6">その他</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedActresses['others'].map(actress => (
                                <Link
                                    key={actress.id}
                                    href={`/actress/${actress.id}`}
                                    className="block bg-gray-900 hover:bg-gray-800 p-4 rounded-lg"
                                >
                                    {actress.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
