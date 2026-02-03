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
    // ... other props extended from DmmActress
}

// Cast the JSON to our type
const actressesData = actressesDataRaw as unknown as LocalActressData[];

export async function generateStaticParams() {
    // Generate paths for ALL actresses in our local data
    return actressesData.map((actress) => ({
        id: actress.id.toString(),
    }));
}

export default async function ActressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Find the actress in our local data
    const actress = actressesData.find(a => a.id.toString() === id);

    if (!actress) {
        notFound();
    }

    // Use data from local JSON
    const videos = actress.videos || [];
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
            </div>
        </div>
    );
}
