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

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

                {/* Header Block matching user's HTML structure for "Actress Name とは" */}
                <div className="mb-12">
                    <h2 className="mb-4 border-l-4 border-[#ff8f00] pl-4 text-3xl font-bold">
                        {actressName}さんとは
                    </h2>
                    <p className="text-lg text-gray-400">
                        {actressName}さんのおすすめ動画を紹介します。
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
