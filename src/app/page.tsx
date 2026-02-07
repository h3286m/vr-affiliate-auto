import VideoCard from '@/components/VideoCard';
import products from '@/data/products.json';
import { DmmItem } from '@/types/dmm';
import TopBanner from '@/components/TopBanner';
import NewsSection from '@/components/NewsSection';
import SyllabaryNavigation from '@/components/SyllabaryNavigation';

// Type assertion for the imported JSON
const allProducts = products as DmmItem[];

export default function Home() {
  // Sort by Score (Review Average) Descending for Pickup
  // Filter items that have a score > 0 to avoid empty ones at top if any
  const pickupItems = [...allProducts]
    .sort((a, b) => (b.review_average || 0) - (a.review_average || 0))
    .slice(0, 1); // Only showing 1 pickup for the "Pickup" box style in the reference, or maybe small list?
  // User image shows "Pickup" as a box. Let's make it a small featured section.
  // The reference image layout:
  // [Pickup Box] [News Lines ....]
  // [News Lines ....]
  // [News Lines ....]
  // But since we want to show video cards, let's adapt.
  // Let's create a "Pickup" section on the left and "News" on the right as per the prompt's diagram.

  // Let's grab slightly more for a nice grid or just 1 big one.
  // The diagram shows "Pickup" as a large square on left, and News bars on right.
  const featuredPickup = pickupItems[0];

  // News Items (New Arrivals) - Deduplicate by content_id
  const seenIds = new Set();
  const newsItems = [...allProducts]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .filter(item => {
      const duplicate = seenIds.has(item.content_id);
      seenIds.add(item.content_id);
      return !duplicate;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">

      {/* 1. TOP BANNER */}
      <TopBanner />

      <div className="container mx-auto px-4 max-w-7xl">

        {/* 2. PICKUP & NEWS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* Pickup Area (Left - 1 col) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 h-full flex flex-col">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-6 bg-pink-500 mr-3"></div>
                <h2 className="text-2xl font-bold text-white">Pickup App</h2>
              </div>

              {featuredPickup && (
                <div className="flex-1 flex flex-col justify-center">
                  <a
                    href={featuredPickup.affiliateURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-row items-center gap-4 hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
                  >
                    {/* Actress Icon (Circle) */}
                    <div className="shrink-0 relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-pink-500 transition-colors shadow-lg">
                        {/* Fallback to small package image as icon since we don't have direct actress icons yet */}
                        <img
                          src={featuredPickup.imageURL?.small || featuredPickup.imageURL?.list}
                          alt={featuredPickup.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2 md:line-clamp-3 mb-1">
                        {featuredPickup.title}
                      </h3>

                      {featuredPickup.iteminfo?.actress && featuredPickup.iteminfo.actress.length > 0 && (
                        <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap gap-1">
                          {featuredPickup.iteminfo.actress.map((actress, index) => (
                            <span key={index} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {actress.name}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* News Area (Right - 2 cols) */}
          <div className="lg:col-span-2">
            <NewsSection items={newsItems} />
          </div>
        </div>

        {/* 3. SYLLABARY NAVIGATION */}
        <section>
          <div className="flex items-center mb-8 justify-center">
            <h2 className="text-3xl font-bold text-white border-b-2 border-blue-500 pb-2 px-10">
              女優から探す
            </h2>
          </div>
          <SyllabaryNavigation />
        </section>

      </div>
    </div>
  );
}
