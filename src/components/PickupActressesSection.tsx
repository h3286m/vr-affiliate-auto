'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface PickupActress {
  id: string;
  name: string;
  ruby?: string;
  count: number;
  coverImage: string;
  bestRating: number;
}

interface ActressCardProps {
  actress: PickupActress;
}

function ActressCard({ actress }: ActressCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/actress/${actress.id}`}
      className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        {actress.coverImage && !imgError ? (
          <img
            src={actress.coverImage}
            alt={actress.name}
            className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* VR count badge */}
        <div className="absolute top-2 right-2 bg-violet-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider">
          VR {actress.count}本
        </div>
      </div>

      {/* Actress Info (on top of gradient) */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {actress.ruby && (
          <p className="text-[10px] text-slate-400 mb-0.5 tracking-wider">{actress.ruby}</p>
        )}
        <h3 className="text-white font-bold text-sm group-hover:text-violet-300 transition-colors leading-tight">
          {actress.name}
        </h3>
        {actress.bestRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`text-[10px] ${star <= Math.round(actress.bestRating) ? 'text-violet-400' : 'text-slate-700'}`}
              >
                ★
              </span>
            ))}
            <span className="text-slate-300 text-[10px] ml-1">{actress.bestRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/0 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
}

interface PickupActressesSectionProps {
  actresses: PickupActress[];
}

export default function PickupActressesSection({ actresses }: PickupActressesSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {actresses.map((actress) => (
        <ActressCard key={actress.id} actress={actress} />
      ))}
    </div>
  );
}
