
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
    const rowInfo = SYLLABARY_ROWS.find(r => r.char === decodedInitial);
    const label = rowInfo ? rowInfo.label : `「${decodedInitial}」行`;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
            <main className="mx-auto max-w-4xl px-4 py-16">

                {/* Back Link */}
                <div className="mb-4">
                    <Link href="/" className="text-[#ff8f00] hover:text-[#ffca28] transition-colors inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        トップに戻る
                    </Link>
                </div>

                <h1 className="mb-12 text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    VR Actress Database
                </h1>

                <div className="mb-8">
                    <h2 className="mb-6 text-2xl font-bold border-b border-gray-800 pb-2">
                        {label}の女優一覧 (Top {filteredActresses.length})
                    </h2>

                    {filteredActresses.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">この行の女優は見つかりませんでした。</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {filteredActresses.map((actress) => (
                                <Link
                                    key={actress.id}
                                    href={`/actress/${actress.id}`}
                                    className="group block overflow-hidden rounded-lg bg-gray-900 transition hover:bg-gray-800"
                                >
                                    {/* Image Placeholder or Actual Image if available */}
                                    <div className="aspect-[3/4] w-full bg-gray-800 relative">
                                        {actress.imageURL?.large ? (
                                            <img
                                                src={actress.imageURL.large}
                                                alt={actress.name}
                                                className="absolute h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-600">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <h3 className="truncate font-bold text-sm text-gray-200 group-hover:text-white">
                                            {actress.name}
                                        </h3>
                                        {actress.ruby && (
                                            <div className="truncate text-xs text-gray-500">
                                                {actress.ruby}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
