'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DmmItem } from '@/types/dmm';

interface TopRankingSectionProps {
  products: DmmItem[];
}

const rankStyles = [
  { bg: 'from-yellow-500 to-amber-600', text: 'text-black', shadow: 'shadow-yellow-500/30' },
  { bg: 'from-slate-300 to-slate-400', text: 'text-black', shadow: 'shadow-slate-400/20' },
  { bg: 'from-amber-600 to-amber-800', text: 'text-white', shadow: 'shadow-amber-600/20' },
  { bg: 'from-slate-600 to-slate-700', text: 'text-white', shadow: 'shadow-slate-600/10' },
  { bg: 'from-slate-700 to-slate-800', text: 'text-white', shadow: 'shadow-slate-700/10' },
];

function RankItem({ product, rank }: { product: DmmItem; rank: number }) {
  const [imgError, setImgError] = useState(false);
  const cid = product.content_id;
  const imageUrl = imgError
    ? (product.imageURL?.list || '')
    : `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;
  const style = rankStyles[rank - 1] || rankStyles[4];

  return (
    <Link
      href={`/product/${cid}`}
      className="group flex items-center gap-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
    >
      {/* Rank badge */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${style.bg} flex items-center justify-center font-extrabold text-lg shadow-lg ${style.shadow} ${style.text}`}
      >
        {rank}
      </div>

      {/* Thumbnail */}
      <div className="shrink-0 w-14 h-20 overflow-hidden rounded-lg bg-slate-800">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-amber-300 transition-colors mb-1.5 leading-snug">
          {product.title}
        </h3>
        {product.iteminfo?.actress && product.iteminfo.actress.length > 0 && (
          <p className="text-xs text-slate-500 mb-2 truncate">
            {product.iteminfo.actress.map(a => a.name).join(' / ')}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {product.review_average != null && product.review_average > 0 && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-xs ${star <= Math.round(product.review_average || 0) ? 'text-amber-400' : 'text-slate-700'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-amber-400 text-xs font-bold ml-1">
                {Number(product.review_average).toFixed(1)}
              </span>
            </div>
          )}
          {product.review_count != null && (
            <span className="text-slate-600 text-xs">({product.review_count.toLocaleString()}件)</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-slate-700 group-hover:text-amber-400 transition-colors text-lg">
        ›
      </div>
    </Link>
  );
}

export default function TopRankingSection({ products }: TopRankingSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {products.map((product, index) => (
        <RankItem key={product.content_id} product={product} rank={index + 1} />
      ))}
    </div>
  );
}
