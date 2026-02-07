import Link from 'next/link';
import { Home, Search, Trophy } from 'lucide-react';

export const Navigation = () => {
    const syllabary = [
        { label: 'あ', value: 'あ' },
        { label: 'か', value: 'か' },
        { label: 'さ', value: 'さ' },
        { label: 'た', value: 'た' },
        { label: 'な', value: 'な' },
        { label: 'は', value: 'は' },
        { label: 'ま', value: 'ま' },
        { label: 'や', value: 'や' },
        { label: 'ら', value: 'ら' },
        { label: 'わ', value: 'わ' },
    ];

    return (
        <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                {/* Top Bar: Logo & Main Actions */}
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            VR Affiliate
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                            <Home size={18} />
                            <span>ホーム</span>
                        </Link>
                        <Link href="/ranking" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                            <Trophy size={18} />
                            <span>ランキング</span>
                        </Link>
                    </div>
                </div>

                {/* Syllabary Scroller (Mobile Friendy) */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-2 md:justify-center min-w-max">
                        {syllabary.map(({ label, value }) => (
                            <Link
                                key={value}
                                href={`/list/${value}`}
                                className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-pink-500/50 transition-all text-sm font-medium whitespace-nowrap"
                            >
                                {label}行
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};
