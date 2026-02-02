import Link from 'next/link';
import { fetchAllActressesByInitial, fetchActressItems } from '@/lib/dmm-api';

export default async function Home() {
  // Fetch 'あ' actresses for the homepage index
  const actresses = await fetchAllActressesByInitial('あ');

  // Filter actresses to only include those with at least 1 VR video
  // Note: This increases build time but ensures high quality list.
  // Filter actresses to only include those with at least 1 VR video
  // Note: This increases build time but ensures high quality list.
  // We throttled requests to avoid API rate limits (200+ requests at once will fail).
  const BATCH_SIZE = 5;
  const DELAY_MS = 100;
  const checks = [];

  for (let i = 0; i < actresses.length; i += BATCH_SIZE) {
    const batch = actresses.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (actress) => {
        // Fetch just 1 item to check existence
        try {
          const items = await fetchActressItems(actress.id.toString(), 1);
          return { ...actress, hasVideos: items.length > 0 };
        } catch (e) {
          console.error(`Check failed for ${actress.name}`, e);
          return { ...actress, hasVideos: false };
        }
      })
    );
    checks.push(...batchResults);
    // Slight delay between batches
    if (i + BATCH_SIZE < actresses.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const filteredActresses = checks.filter(a => a.hasVideos);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-12 text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          VR Actress Database
        </h1>

        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold border-b border-gray-800 pb-2">
            「あ」行の女優一覧 (Top {filteredActresses.length})
          </h2>

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
        </div>

      </main>
    </div>
  );
}
