'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DmmItem } from '@/types/dmm';

interface FeaturedProductsGridProps {
  products: DmmItem[];
}

function ProductCard({ product }: { product: DmmItem }) {
  const [imgError, setImgError] = useState(false);
  const cid = product.content_id;
  const imageUrl = imgError
    ? (product.imageURL?.large || product.imageURL?.list || '')
    : `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;

  return (
    <Link
      href={`/product/${cid}`}
      className="group relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 flex flex-col"
    >
      {/* Jacket Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* NEW badge */}
        <div className="absolute top-2 left-2 bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
          NEW
        </div>
        {/* Rating badge */}
        {product.review_average != null && product.review_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-pink-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>★</span>
            <span>{Number(product.review_average).toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-white line-clamp-2 font-medium leading-relaxed flex-1">
          {product.title}
        </p>
        {product.iteminfo?.actress && product.iteminfo.actress.length > 0 && (
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            {product.iteminfo.actress.map(a => a.name).join(' / ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.content_id} product={product} />
      ))}
    </div>
  );
}
