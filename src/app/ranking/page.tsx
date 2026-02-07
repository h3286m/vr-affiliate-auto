import ActressCard from '@/components/ActressCard';
import actresses from '@/data/actresses.json';
import { DmmActress, DmmItem } from '@/types/dmm';

// Type assertion
const allActresses = actresses as (DmmActress & { videos: DmmItem[] })[];

// Helper to parse "B00" -> Number
// Bust: "90" -> 90
// Cup: "G" -> ... we need mapping for sorting, but maybe just string compare for now or Bust size
const parseBust = (val?: string | number | null) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseInt(val.replace(/cm/i, ''), 10) || 0;
};

export default function RankingPage() {
    // Top 20 by Bust Size
    const bustRanking = [...allActresses]
        .filter(a => parseBust(a.bust) > 0)
        .sort((a, b) => parseBust(b.bust) - parseBust(a.bust))
        .slice(0, 20);

    // Top 20 by Video Count
    const countRanking = [...allActresses]
        .sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0))
        .slice(0, 20);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-12 text-center drop-shadow-sm">
                Actress Rankings
            </h1>

            {/* Video Count Ranking */}
            <section className="mb-20">
                <div className="flex items-center mb-8">
                    <div className="w-1.5 h-8 bg-yellow-500 mr-3 rounded-full" />
                    <h2 className="text-3xl font-bold text-white">出演本数ランキング</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {countRanking.map((actress, index) => (
                        <div key={actress.id} className="relative">
                            <div className="absolute -top-3 -left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-black font-bold shadow-lg border border-white">
                                {index + 1}
                            </div>
                            <ActressCard actress={actress} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Bust Ranking */}
            <section>
                <div className="flex items-center mb-8">
                    <div className="w-1.5 h-8 bg-pink-500 mr-3 rounded-full" />
                    <h2 className="text-3xl font-bold text-white">バストサイズランキング</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {bustRanking.map((actress, index) => (
                        <div key={actress.id} className="relative">
                            <div className="absolute -top-3 -left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-pink-500 text-white font-bold shadow-lg border border-pink-300">
                                {index + 1}
                            </div>
                            <ActressCard actress={actress} />
                            <div className="mt-2 text-center text-sm font-bold text-pink-400">
                                {actress.cup}カップ / {actress.bust}cm
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
