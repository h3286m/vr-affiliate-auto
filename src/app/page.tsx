import Link from 'next/link';
import products from '@/data/products.json';
import { DmmItem } from '@/types/dmm';
import TopBanner from '@/components/TopBanner';
import NewsSection from '@/components/NewsSection';
import SyllabaryNavigation from '@/components/SyllabaryNavigation';
import FeaturedProductsGrid from '@/components/FeaturedProductsGrid';
import PickupActressesSection, { PickupActress } from '@/components/PickupActressesSection';
import TopRankingSection from '@/components/TopRankingSection';

// Type assertion for the imported JSON
const allProducts = products as DmmItem[];

// ── Section Header Helper ───────────────────────────────────────────────────
type AccentColor = 'pink' | 'violet' | 'amber' | 'blue';
const accentClasses: Record<AccentColor, { bar: string; title: string; more: string }> = {
  pink:   { bar: 'bg-pink-500',   title: 'text-pink-400',   more: 'border-pink-500/50 text-pink-400 hover:bg-pink-500/10' },
  violet: { bar: 'bg-violet-500', title: 'text-violet-400', more: 'border-violet-500/50 text-violet-400 hover:bg-violet-500/10' },
  amber:  { bar: 'bg-amber-500',  title: 'text-amber-400',  more: 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10' },
  blue:   { bar: 'bg-blue-500',   title: 'text-blue-400',   more: 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10' },
};

function SectionHeader({
  title,
  accent = 'pink',
  moreHref,
  moreLabel = 'もっと見る →',
}: {
  title: string;
  accent?: AccentColor;
  moreHref?: string;
  moreLabel?: string;
}) {
  const cls = accentClasses[accent];
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-7 ${cls.bar} rounded-full`} />
        <h2 className={`text-2xl font-extrabold text-white tracking-tight`}>
          {title}
        </h2>
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${cls.more}`}
        >
          {moreLabel}
        </Link>
      )}
    </div>
  );
}

// ── Data Preparation ────────────────────────────────────────────────────────
function prepareData() {
  // Deduplicate by content_id
  const seen = new Set<string>();
  const unique = allProducts.filter(item => {
    if (seen.has(item.content_id)) return false;
    seen.add(item.content_id);
    return true;
  });

  // Pickup (best rated)
  const featuredPickup = [...unique]
    .sort((a, b) => (b.review_average || 0) - (a.review_average || 0))[0];

  // News (latest 5)
  const newsItems = [...unique]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  // 新着VR作品 (latest 8)
  const latestProducts = [...unique]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  // ピックアップ女優 (top 8 by appearance count)
  const actressMap = new Map<string, PickupActress>();
  unique.forEach(product => {
    product.iteminfo?.actress?.forEach(actress => {
      const aid = String(actress.id);
      if (!aid || !actress.name) return;
      if (!actressMap.has(aid)) {
        actressMap.set(aid, {
          id: aid,
          name: actress.name,
          ruby: actress.ruby,
          count: 0,
          coverImage: product.imageURL?.large || product.imageURL?.list || '',
          bestRating: 0,
        });
      }
      const existing = actressMap.get(aid)!;
      existing.count += 1;
      if ((product.review_average || 0) > existing.bestRating) {
        existing.bestRating = product.review_average || 0;
        existing.coverImage = product.imageURL?.large || product.imageURL?.list || existing.coverImage;
      }
    });
  });
  const pickupActresses = [...actressMap.values()]
    .filter(a => a.count >= 2 && a.coverImage)
    .sort((a, b) => b.count - a.count || b.bestRating - a.bestRating)
    .slice(0, 8);

  // 高評価ランキング TOP10
  const topRated = [...unique]
    .filter(item => (item.review_average || 0) >= 3.5 && (item.review_count || 0) >= 3)
    .sort((a, b) => (b.review_average || 0) - (a.review_average || 0))
    .slice(0, 10);

  return { featuredPickup, newsItems, latestProducts, pickupActresses, topRated };
}

// ── Page Component ──────────────────────────────────────────────────────────
export default function Home() {
  const { featuredPickup, newsItems, latestProducts, pickupActresses, topRated } = prepareData();

  return (
    <div className="min-h-screen bg-slate-950 pb-20">

      {/* ①  TOP BANNER */}
      <TopBanner />

      <div className="container mx-auto px-4 max-w-7xl space-y-16">

        {/* ② PICKUP & NEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Pickup (Left) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-6 bg-pink-500 rounded-full mr-3" />
                <h2 className="text-2xl font-bold text-white">Pickup</h2>
              </div>

              {featuredPickup && (
                <div className="flex-1 flex flex-col justify-center">
                  <Link
                    href={`/product/${featuredPickup.content_id}`}
                    className="group flex flex-row items-center gap-4 hover:bg-slate-800/40 p-2 rounded-lg transition-colors"
                  >
                    <div className="shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-pink-500 transition-colors shadow-lg">
                        <img
                          src={featuredPickup.imageURL?.small || featuredPickup.imageURL?.list}
                          alt={featuredPickup.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-3 mb-1">
                        {featuredPickup.title}
                      </h3>
                      {featuredPickup.iteminfo?.actress && featuredPickup.iteminfo.actress.length > 0 && (
                        <p className="text-xs text-slate-400 mb-2 flex flex-wrap gap-1">
                          {featuredPickup.iteminfo.actress.map((a, i) => (
                            <span key={i} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {a.name}
                            </span>
                          ))}
                        </p>
                      )}
                      {featuredPickup.review_average != null && featuredPickup.review_average > 0 && (
                        <div className="flex items-center text-pink-500 text-sm font-bold">
                          <span className="mr-1">★</span>
                          <span>{Number(featuredPickup.review_average).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* News (Right) */}
          <div className="lg:col-span-2">
            <NewsSection items={newsItems} />
          </div>
        </div>

        {/* ③ 新着VR作品 */}
        <section>
          <SectionHeader title="新着VR作品" accent="pink" moreHref="/list/あ" />
          <FeaturedProductsGrid products={latestProducts} />
        </section>

        {/* ④ ピックアップ女優 */}
        {pickupActresses.length > 0 && (
          <section>
            <SectionHeader title="ピックアップ女優" accent="violet" moreHref="/list/あ" moreLabel="女優一覧 →" />
            <PickupActressesSection actresses={pickupActresses} />
          </section>
        )}

        {/* ⑤ 高評価ランキング */}
        {topRated.length > 0 && (
          <section>
            <SectionHeader title="高評価ランキング" accent="amber" />
            <TopRankingSection products={topRated} />
          </section>
        )}

        {/* ⑥ 女優から探す (Syllabary) */}
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
