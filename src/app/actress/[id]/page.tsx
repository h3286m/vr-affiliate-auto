import { notFound } from 'next/navigation';
import { fetchActressItems, fetchAllActressesByInitial, fetchActressProfile } from '@/lib/dmm-api';
import VideoCard from '@/components/VideoCard';
import { DmmItem } from '@/types/dmm';

// Initial build scope: Generate pages for actresses starting with 'あ'
// In a full production build, we would iterate through all initials 'あ' through 'ん'.
const BUILD_INITIALS = ['あ'];

export async function generateStaticParams() {
    let allActresses: { id: string }[] = [];

    for (const initial of BUILD_INITIALS) {
        const actresses = await fetchAllActressesByInitial(initial);
        const paths = actresses.map((actress) => ({
            id: actress.id.toString(),
        }));
        allActresses = [...allActresses, ...paths];
    }

    // Deduplicate just in case
    const uniqueIds = Array.from(new Set(allActresses.map(a => a.id)))
        .map(id => ({ id }));

    return uniqueIds;
}

export default async function ActressPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params correctly for Next.js 15+
    const { id } = await params;

    // 1. Fetch Videos (Filtered by VR, Sample, & Limit 10 in API)
    const videos = await fetchActressItems(id);

    // If no videos found (after filtering), we do not display the page (return 404)
    if (videos.length === 0) {
        notFound();
    }

    // 2. Fetch Actress Profile (for accurate Name)
    const profile = await fetchActressProfile(id);
    const actressName = profile?.name || id;

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
