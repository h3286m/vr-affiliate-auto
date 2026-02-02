import Image from 'next/image';
import { DmmItem } from '@/types/dmm';

interface VideoCardProps {
    item: DmmItem;
}

export default function VideoCard({ item }: VideoCardProps) {
    // Logic from Step 94:
    // CID (Content ID) is used for iframe and links.
    // Note: API returns 'content_id' (e.g. 1star00923) and 'product_id' (e.g. 1star00923).
    // Sometimes 'product_id' is needed for standard URLs.
    const cid = item.content_id;
    const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID || "erotrick-001";

    // Construct URLs as per user's Python script
    const playerUrl = `https://www.dmm.co.jp/litevideo/-/part/=/affi_id=${affiliateId}/cid=${cid}/size=1280_720/`;
    const detailUrl = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3D${cid}%2F&af_id=${affiliateId}&ch=toolbar&ch_id=link`;
    const moreVideosUrl = `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/?affi_id=${affiliateId}`;

    // Image URL logic: The user script uses https://pics.dmm.co.jp/digital/video/{cid}/{cid}pl.jpg
    // The API returns imageURL object. Accessing direct path is reliably consistent with user script.
    const imageUrl = `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;

    return (
        <div className="mb-12">
            <h3 className="mb-6 border-b-2 border-gray-700 pb-2 text-xl font-bold text-gray-100 sm:text-2xl">
                {item.title}
            </h3>

            {/* Video Iframe (Responsive 4:3 aspect ratio per user request) */}
            <div className="mb-6 w-full" style={{ position: 'relative', paddingTop: '75%' }}>
                <iframe
                    title={item.title}
                    src={playerUrl}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        maxWidth: '1280px'
                    }}
                />
            </div>

            {/* Affiliate Image Link */}
            <figure className="mb-6 flex justify-center">
                <a href={detailUrl} rel="sponsored" target="_blank">
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="h-auto max-w-full rounded-lg shadow-md hover:opacity-90 transition-opacity"
                    />
                </a>
            </figure>

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

            {/* Description Box (Placeholder as per script) */}
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
                <div className="mb-4 inline-block rounded bg-gray-800 px-3 py-1 text-sm text-gray-300">
                    作品紹介
                </div>
                <div className="text-gray-400">
                    <p>ここに説明文を入力してください。</p>
                </div>
            </div>
        </div>
    );
}
