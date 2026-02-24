'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DmmItem } from '@/types/dmm';

interface VideoCardProps {
    item: DmmItem;
    hideVideo?: boolean;
}

export default function VideoCard({ item, hideVideo = false }: VideoCardProps) {
    const [imageError, setImageError] = useState(false);

    const cid = item.content_id;
    const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID || "erotrick-001";

    // Construct URLs
    const detailUrl = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3D${cid}%2F&af_id=${affiliateId}&ch=toolbar&ch_id=link`;
    const imageUrl = `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;

    if (imageError) return null;

    return (
        <div className="mb-12">
            <Link href={`/product/${cid}`}>
                <h3 className="mb-6 border-b-2 border-gray-700 pb-2 text-xl font-bold text-gray-100 sm:text-2xl hover:text-[#ff8f00] transition-colors">
                    {item.title}
                </h3>
            </Link>

            {/* Ratings */}
            {(item.review_average !== undefined || item.review_count !== undefined) && (
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center text-[#ff8f00]">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const rating = item.review_average || 0;
                            if (rating >= star) {
                                return <span key={star} className="text-xl">★</span>;
                            } else if (rating >= star - 0.5) {
                                return <span key={star} className="text-xl">☆</span>;
                            } else {
                                return <span key={star} className="text-xl text-gray-600">☆</span>;
                            }
                        })}
                        <span className="ml-2 text-lg font-bold text-white">
                            {item.review_average ? Number(item.review_average).toFixed(1) : '0.0'}
                        </span>
                    </div>
                    {item.review_count !== undefined && (
                        <span className="text-sm text-gray-400">
                            ({item.review_count.toLocaleString()} レビュー)
                        </span>
                    )}
                </div>
            )}

            {/* Image Area */}
            <figure className="mb-6 flex justify-center">
                <Link href={`/product/${cid}`}>
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="h-auto max-w-full rounded-lg shadow-md hover:opacity-90 transition-opacity"
                        onError={() => setImageError(true)}
                    />
                </Link>
            </figure>

            {/* Tags (Genres) */}
            {item.iteminfo?.genre && item.iteminfo.genre.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 justify-center">
                    {item.iteminfo.genre.map((g) => (
                        <span key={g.id} className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                            {g.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Button */}
            <div className="mb-8 text-center flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href={`/product/${cid}`}
                    className="inline-block rounded-md bg-[#ff8f00] border border-[#ff8f00] px-12 py-3 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#ffca28] hover:scale-105 active:scale-95"
                >
                    詳細解説を見る
                </Link>
            </div>
        </div>
    );
}
