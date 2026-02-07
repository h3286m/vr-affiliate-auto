import Link from 'next/link';
import React from 'react';

const syllabaryRows = [
    { label: 'あ行', initial: 'あ', chars: 'あいうえお' },
    { label: 'か行', initial: 'か', chars: 'かきくけこ' },
    { label: 'さ行', initial: 'さ', chars: 'さしすせそ' },
    { label: 'た行', initial: 'た', chars: 'たちつてと' },
    { label: 'な行', initial: 'な', chars: 'なにぬねの' },
    { label: 'は行', initial: 'は', chars: 'はひふへほ' },
    { label: 'ま行', initial: 'ま', chars: 'まみむめも' },
    { label: 'や行', initial: 'や', chars: 'やゆよ' },
    { label: 'ら行', initial: 'ら', chars: 'らりるれろ' },
    { label: 'わ行', initial: 'わ', chars: 'わをん' },
];

export const SyllabaryNavigation: React.FC = () => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {syllabaryRows.map((row) => (
                    <Link
                        key={row.initial}
                        href={`/list/${row.initial}`}
                        className="group relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg p-6 transition-all duration-300 flex flex-col items-center justify-center h-full"
                    >
                        <span className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {row.label}
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400 tracking-widest">
                            {row.chars}
                        </span>

                        {/* Hover effect accent */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SyllabaryNavigation;
