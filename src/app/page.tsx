import Link from 'next/link';
import { SYLLABARY_ROWS } from '@/lib/utils';;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-12 text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          VR Actress Database
        </h1>

        <div className="text-center mb-16">
          <p className="text-xl text-gray-400 mb-8">
            厳選されたVR出演女優を「50音順」から探せます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {SYLLABARY_ROWS.map((row) => (
            <Link
              key={row.char}
              href={`/list/${row.char}`}
              className="flex flex-col items-center justify-center h-32 rounded-xl bg-gray-900 border border-gray-800 transition-all hover:bg-gray-800 hover:border-[#ff8f00] hover:scale-105 group"
            >
              <span className="text-4xl font-bold text-gray-300 group-hover:text-[#ff8f00] transition-colors mb-2">
                {row.char}
              </span>
              <span className="text-sm text-gray-500 group-hover:text-gray-400">
                {row.label}
              </span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
