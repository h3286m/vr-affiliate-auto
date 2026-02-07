import React from 'react';
import { DmmItem } from '@/types/dmm';

interface NewsSectionProps {
    items: DmmItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ items }) => {
    return (
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-blue-500 mr-3"></div>
                <h3 className="text-xl font-bold text-white">NEWS</h3>
            </div>

            <div className="flex flex-col space-y-3">
                {items.length === 0 ? (
                    <p className="text-slate-500">最新のニュースはありません。</p>
                ) : (
                    items.map((item) => (
                        <div key={item.content_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors p-2 rounded">
                            <a href={item.affiliateURL} target="_blank" rel="noopener noreferrer" className="block flex-1 group">
                                <div className="flex items-baseline">
                                    <span className="text-xs font-mono text-blue-400 mr-3 shrink-0">{new Date(item.date).toLocaleDateString('ja-JP')}</span>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-1">{item.title}</span>
                                </div>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NewsSection;
