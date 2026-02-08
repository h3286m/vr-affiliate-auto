'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DmmItem } from '@/types/dmm';

interface VideoCardProps {
    item: DmmItem;
    hideVideo?: boolean;
    hideDescription?: boolean;
}

export default function VideoCard({ item, hideVideo = false, hideDescription = false }: VideoCardProps) {
    const [videoError, setVideoError] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Logic from Step 94 & 371:
    // CID (Content ID) is used for iframe and links.
    const cid = item.content_id;
    const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID || "erotrick-001";

    // Construct URLs
    const detailUrl = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3D${cid}%2F&af_id=${affiliateId}&ch=toolbar&ch_id=link`;
    const moreVideosUrl = `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/?affi_id=${affiliateId}`;

    // Image URL logic
    const imageUrl = `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;

    // Video Player Logic
    // 1. Try to get URL from API data (sampleMovieURL)
    let playerUrl = '';
    let hasSample = false;

    if (item.sampleMovieURL) {
        // sampleMovieURL is an object like { size_720_480: "...", size_476_306: "..." }
        // We prefer the largest size.
        const sizes = item.sampleMovieURL as { [key: string]: string };
        const keys = Object.keys(sizes);

        // Priority keys
        const priorityKeys = ['size_720_480', 'size_644_414', 'size_560_360', 'size_476_306'];

        for (const k of priorityKeys) {
            if (sizes[k]) {
                playerUrl = sizes[k];
                hasSample = true;
                break;
            }
        }

        // Fallback to any key
        if (!hasSample && keys.length > 0) {
            playerUrl = sizes[keys[0]];
            hasSample = true;
        }
    }

    // 2. Fallback (Legacy): Construction for non-VR or if API missing? 
    // User requested "If it's a 2D video sample, it should display".
    // But we found constructed URLs fail for VR. 
    // We strictly trust the API now. If API didn't give a sample, we assume none exists or it's broken.
    // However, for standard items, maybe we still want to try?
    // Let's only use API data to be safe and avoid broken players (the user's main complaint).

    // State
    const [showVideo, setShowVideo] = useState(false);

    // If image is missing/broken, we hide the entire card per user request
    if (imageError) {
        return null;
    }

    return (
        <div className="mb-12">
            <h3 className="mb-6 border-b-2 border-gray-700 pb-2 text-xl font-bold text-gray-100 sm:text-2xl">
                {item.title}
            </h3>



            {/* Ratings */}
            {(item.review_average !== undefined || item.review_count !== undefined) && (
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center text-[#ff8f00]">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const rating = item.review_average || 0;
                            // Full star if rating >= star
                            // Half star if rating >= star - 0.5 (optional, but let's stick to full/empty for now for simplicity or use a specific char)
                            if (rating >= star) {
                                return <span key={star} className="text-xl">★</span>;
                            } else if (rating >= star - 0.5) {
                                return <span key={star} className="text-xl">☆</span>; // Could use half star icon if available
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

            {/* Video Player Area */}
            {!hideVideo && hasSample && (
                <div className="mb-6 w-full bg-black rounded-lg overflow-hidden shadow-lg relative" style={{ paddingTop: '56.25%' }}>
                    {!showVideo ? (
                        // Poster Image & Play Button
                        <div
                            className="absolute top-0 left-0 w-full h-full cursor-pointer group"
                            onClick={() => setShowVideo(true)}
                        >
                            <img
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-20 h-20 bg-[#ff8f00] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-opacity-90">
                                    <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <div className="mt-2 text-white font-bold text-shadow text-center">再生する</div>
                            </div>
                        </div>
                    ) : (
                        // MP4 Player
                        <video
                            src={playerUrl}
                            controls
                            autoPlay
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ objectFit: 'contain' }}
                        />
                    )}
                </div>
            )}

            {/* Affiliate Image Link */}
            <figure className="mb-6 flex justify-center">
                <a href={detailUrl} rel="sponsored" target="_blank">
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="h-auto max-w-full rounded-lg shadow-md hover:opacity-90 transition-opacity"
                        onError={() => setImageError(true)}
                    />
                </a>
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
            <div className="mb-8 text-center">
                <a
                    href={moreVideosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block relative rounded-md bg-[#ff8f00] px-8 py-2 text-lg font-bold text-white shadow-lg transition-all duration-500 hover:translate-y-1 hover:shadow-sm"
                >
                    もっと動画を見る
                </a>
            </div>

            {/* Description Box */}
            {!hideDescription && (
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
                    <div className="mb-4 inline-block rounded bg-gray-800 px-3 py-1 text-sm text-gray-300">
                        作品紹介
                    </div>
                    <div className="text-gray-400">
                        <p>{item.description || item.headline || item.title}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
