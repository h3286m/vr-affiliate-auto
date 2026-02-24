'use client';

import Link from 'next/link';
import { ExternalLink, Star, Calendar, Building, Tag, ArrowLeft, Play, Info } from 'lucide-react';
import { DmmItem } from '@/types/dmm';

interface ProductDetailPageProps {
    product: DmmItem;
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
    const cid = product.content_id;
    const affiliateId = process.env.NEXT_PUBLIC_AFFILIATE_ID || "erotrick-001";

    // Construct URLs
    const affiliateUrl = product.affiliateURL || `https://al.fanza.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D${cid}&af_id=${affiliateId}&ch=api`;
    const imageUrl = `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;

    // Format review score
    const rating = product.review_average ? Number(product.review_average) : 0;
    const reviewCount = product.review_count || 0;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-pink-500/30 selection:text-pink-200">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header / Breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="group inline-flex items-center px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-pink-500/50 transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">トップへ戻る</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Media & Description */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Title Section (Mobile) */}
                        <div className="lg:hidden space-y-4 mb-6">
                            <h1 className="text-2xl font-black leading-tight text-white tracking-tight">
                                {product.title}
                            </h1>
                        </div>

                        {/* Hero Image */}
                        <div className="group relative aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-slate-800">
                            <img
                                src={imageUrl}
                                alt={product.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-white/90 uppercase tracking-widest">
                                Premium VR Content
                            </div>
                        </div>

                        {/* Title Section (Desktop) */}
                        <div className="hidden lg:block space-y-4">
                            <h1 className="text-4xl font-black leading-tight text-white tracking-tight lg:leading-[1.15]">
                                {product.title}
                            </h1>
                        </div>

                        {/* Description */}
                        <section className="relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50" />
                            <h2 className="flex items-center text-xl font-bold text-white mb-6">
                                <Info className="w-5 h-5 mr-3 text-pink-500" />
                                作品解説
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                {product.description ? (
                                    <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                ) : (
                                    <p className="text-lg italic text-slate-500">
                                        作品の魅力的な紹介文は現在準備中です。
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Genres / Tags */}
                        <section className="space-y-4">
                            <h2 className="flex items-center text-lg font-bold text-white">
                                <Tag className="w-5 h-5 mr-3 text-violet-500" />
                                ジャンル・タグ
                            </h2>
                            <div className="flex flex-wrap gap-2.5">
                                {product.iteminfo?.genre?.map(g => (
                                    <span
                                        key={g.id}
                                        className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm font-medium hover:border-violet-500/50 hover:text-white transition-all cursor-default"
                                    >
                                        #{g.name}
                                    </span>
                                )) || <span className="text-slate-500 italic">タグ情報なし</span>}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: CTA & Metadata */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* CTA Card */}
                        <div className="sticky top-24 space-y-6">
                            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-slate-900 to-slate-950 p-1 shadow-2xl ring-1 ring-slate-800">
                                {/* Glass Effect Overlay */}
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

                                <div className="rounded-[1.9rem] bg-slate-950/40 backdrop-blur-xl p-8 space-y-8">
                                    {/* Rating */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">User Rating</span>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-pink-500 text-pink-500' : 'text-slate-700'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-baseline space-x-3">
                                            <span className="text-6xl font-black text-white">{rating.toFixed(1)}</span>
                                            <span className="text-slate-500 font-medium">/ 5.0</span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-bold">
                                            {reviewCount.toLocaleString()} ユーザーによる評価
                                        </p>
                                    </div>

                                    {/* Main Button */}
                                    <div className="space-y-4">
                                        <a
                                            href={affiliateUrl}
                                            target="_blank"
                                            rel="sponsored"
                                            className="group relative block w-full outline-none"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
                                            <div className="relative flex items-center justify-center px-8 py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 transition-all group-hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                                                <Play className="w-6 h-6 mr-3 text-white fill-current" />
                                                <span className="text-xl font-black text-white">本編を視聴する</span>
                                            </div>
                                        </a>
                                        <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            ※ FANZA公式サイト（18禁）へ移動します
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata List */}
                            <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm space-y-6">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-4">
                                    Technical Details
                                </h3>

                                <div className="space-y-6">
                                    {/* Actress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <Star className="w-3.5 h-3.5 mr-2 text-pink-500" />
                                            Cast
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {product.iteminfo?.actress?.map(a => (
                                                <Link
                                                    key={a.id}
                                                    href={`/actress/${a.id}`}
                                                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-pink-500/20 hover:text-pink-400 border border-slate-700 transition-colors text-sm font-bold"
                                                >
                                                    {a.name}
                                                </Link>
                                            )) || '---'}
                                        </div>
                                    </div>

                                    {/* Release Date */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5 mr-2" />
                                            Release
                                        </div>
                                        <span className="text-sm font-bold text-slate-200">{product.date || '---'}</span>
                                    </div>

                                    {/* Maker */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <Building className="w-3.5 h-3.5 mr-2" />
                                            Studio
                                        </div>
                                        <span className="text-sm font-bold text-slate-200">{product.iteminfo?.maker?.[0]?.name || '---'}</span>
                                    </div>

                                    {/* Label */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <Tag className="w-3.5 h-3.5 mr-2" />
                                            Label
                                        </div>
                                        <span className="text-sm font-bold text-slate-200">{product.iteminfo?.label?.[0]?.name || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="mt-20 relative overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 p-12 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            圧倒的VR体験を今すぐお手元に
                        </h2>
                        <p className="text-slate-400 text-lg">
                            最高画質VRならではの臨場感と、手が届きそうな距離感をぜひ体感してください。<br />
                            FANZA公式サイトなら安全にすぐ視聴可能です。
                        </p>
                        <div className="pt-4">
                            <a
                                href={affiliateUrl}
                                target="_blank"
                                rel="sponsored"
                                className="inline-flex items-center px-12 py-4 rounded-full bg-white text-slate-950 text-lg font-black hover:bg-pink-50 transition-all hover:scale-105 shadow-xl"
                            >
                                FANZAで作品を見る
                                <ExternalLink className="w-5 h-5 ml-2" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
