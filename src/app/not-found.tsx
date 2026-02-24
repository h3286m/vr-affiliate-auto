import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-9xl font-black text-slate-800 animate-pulse">404</h1>
                <div className="mt-4 space-y-4">
                    <h2 className="text-3xl font-bold text-white">ページが見つかりません</h2>
                    <p className="text-slate-400">
                        お探しのページは削除されたか、URLが変更された可能性があります。
                    </p>
                </div>
                <div className="mt-10">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg shadow-pink-500/20"
                    >
                        トップページへ戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
