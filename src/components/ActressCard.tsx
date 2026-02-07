import Link from 'next/link';
import { DmmActress, DmmItem } from '@/types/dmm';

interface ActressCardProps {
    actress: DmmActress & { videos?: DmmItem[] }; // Allow videos prop
}

export default function ActressCard({ actress }: ActressCardProps) {
    const vrCount = actress.videos?.length || 0;

    return (
        <Link
            href={`/actress/${actress.id}`}
            className="block bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-[#ff8f00]/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff8f00]/10 group"
        >
            <div className="flex items-center space-x-4">
                {/* Icon / Avatar */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#ff8f00] transition-colors bg-gray-800">
                        {actress.imageURL?.small ? (
                            <img
                                src={actress.imageURL.small}
                                alt={actress.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-100 group-hover:text-white truncate pr-2">
                            {actress.name}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">
                        {actress.ruby}
                    </p>

                    {/* VR Badge */}
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            VR: {vrCount}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
