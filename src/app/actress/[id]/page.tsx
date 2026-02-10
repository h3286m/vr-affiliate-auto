import Link from 'next/link'; // Added import for Back button
import { notFound } from 'next/navigation';
// import { fetchActressItems, fetchAllActressesByInitial, fetchActressProfile } from '@/lib/dmm-api';
// import VideoCard from '@/components/VideoCard';
import VideoCard from '@/components/VideoCard';
import { DmmItem } from '@/types/dmm';
import actressesDataRaw from '@/data/actresses.json';

// Define the shape of our local data
interface LocalActressData {
    id: string | number;
    name: string;
    ruby: string; // Added for sorting
    videos: DmmItem[];
    bust?: number | string | null;
    waist?: number | string | null;
    hip?: number | string | null;
    birthday?: string | null;
    blood_type?: string | null;
    hobby?: string | null;
    imageURL?: {
        large?: string;
        small?: string;
    };
}

// Cast the JSON to our type
const actressesData = actressesDataRaw as unknown as LocalActressData[];

// Sort actresses by Ruby (Syllabary order) for navigation
const sortedActresses = [...actressesData].sort((a, b) => {
    return (a.ruby || '').localeCompare(b.ruby || '', 'ja');
});

export const dynamicParams = false;

export async function generateStaticParams() {
    // Generate paths for ALL actresses in our local data
    return actressesData.map((actress) => ({
        id: actress.id.toString(),
    }));
}

export default async function ActressPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Find the actress in our local data
    const currentIndex = sortedActresses.findIndex(a => a.id.toString() === id);
    const actress = sortedActresses[currentIndex];

    const prevActress = currentIndex > 0 ? sortedActresses[currentIndex - 1] : null;
    const nextActress = currentIndex !== -1 && currentIndex < sortedActresses.length - 1 ? sortedActresses[currentIndex + 1] : null;

    if (!actress) {
        notFound();
    }

    // Use data from local JSON, filter out Omnibus (>10 actresses), and sort
    const videos = [...(actress.videos || [])]
        .filter(item => (item.iteminfo?.actress?.length || 0) <= 10) // Exclude Omnibus
        .sort((a, b) => {
            // Categorize by actress count
            const getPriority = (item: DmmItem) => {
                const count = item.iteminfo?.actress?.length || 0;
                if (count === 1) return 1;    // Single
                return 2;                    // Multiple (2-10)
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            // 1. Category Priority (Ascending: 1 > 2)
            if (priorityA !== priorityB) return priorityA - priorityB;

            // 2. Review Count (Desc)
            const countA = a.review_count || 0;
            const countB = b.review_count || 0;
            if (countB !== countA) return countB - countA;

            // 3. Review Average / Score (Desc)
            const scoreA = a.review_average || 0;
            const scoreB = b.review_average || 0;
            if (scoreB !== scoreA) return scoreB - scoreA;

            // 4. Release Date (Desc)
            return (b.date || '').localeCompare(a.date || '');
        });
    const actressName = actress.name;
    const profileImage = actress.imageURL?.large || actress.imageURL?.small || null;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

                {/* Back Button */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-[#ff8f00] hover:text-[#ffca28] transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        トップページへ戻る
                    </Link>
                </div>

                {/* Profile Section */}
                <div className="mb-12 rounded-lg border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-8">
                        {/* Profile Image */}
                        {profileImage && (
                            <div className="mb-6 flex-shrink-0 sm:mb-0">
                                <img
                                    src={profileImage}
                                    alt={actressName}
                                    className="h-48 w-48 rounded-full border-4 border-gray-800 object-cover shadow-lg"
                                />
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="mb-4 text-3xl font-bold text-white">{actressName}</h1>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 sm:grid-cols-2">
                                {/* Birthday */}
                                <div>生年月日:</div>
                                <div className="text-gray-200">{actress.birthday || ''}</div>

                                {/* Blood Type */}
                                <div>血液型:</div>
                                <div className="text-gray-200">{actress.blood_type ? `${actress.blood_type}型` : '型'}</div>

                                {/* Three Sizes */}
                                <div>スリーサイズ:</div>
                                <div className="text-gray-200">
                                    B{actress.bust || ''} / W{actress.waist || ''} / H{actress.hip || ''}
                                </div>

                                {/* Hobby */}
                                <div>趣味:</div>
                                <div className="text-gray-200">{actress.hobby || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="mb-12">
                    <h2 className="mb-4 border-l-4 border-[#ff8f00] pl-4 text-3xl font-bold">
                        {actressName}さんのおすすめVR動画
                    </h2>
                    <p className="text-lg text-gray-400">
                        厳選された高画質VR作品をご紹介します。
                    </p>
                </div>

                {/* Video List */}
                <div className="space-y-16">
                    {videos.map((item) => (
                        <VideoCard key={item.content_id} item={item} />
                    ))}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Previous Actress */}
                        {prevActress ? (
                            <Link
                                href={`/actress/${prevActress.id}`}
                                className="flex items-center px-6 py-3 bg-gray-900 border border-gray-700 hover:border-[#ff8f00] rounded-lg text-gray-300 hover:text-[#ff8f00] transition-colors w-full sm:w-auto justify-center max-w-[200px]"
                            >
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                <span className="truncate">{prevActress.name}</span>
                            </Link>
                        ) : (
                            <div className="w-full sm:w-auto px-6 py-3" />
                        )}

                        {/* Back to Top */}
                        <Link
                            href="/"
                            className="flex items-center px-6 py-3 bg-[#ff8f00] hover:bg-[#ffca28] text-white font-bold rounded-lg shadow-lg hover:shadow-[#ff8f00]/20 transition-all w-full sm:w-auto justify-center"
                        >
                            トップに戻る
                        </Link>

                        {/* Next Actress */}
                        {nextActress ? (
                            <Link
                                href={`/actress/${nextActress.id}`}
                                className="flex items-center px-6 py-3 bg-gray-900 border border-gray-700 hover:border-[#ff8f00] rounded-lg text-gray-300 hover:text-[#ff8f00] transition-colors w-full sm:w-auto justify-center max-w-[200px]"
                            >
                                <span className="truncate">{nextActress.name}</span>
                                <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <div className="w-full sm:w-auto px-6 py-3" />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
