import React from 'react';

interface TopBannerProps {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
}

export const TopBanner: React.FC<TopBannerProps> = ({
    title = "魁！E子、エロい子、ドエロい子",
    subtitle = "最高のVR体験をあなたに",
    backgroundImage = "/images/banner-bg.jpg" // Placeholder, handle if missing
}) => {
    return (
        <div className="w-full bg-slate-900 border-b border-slate-800 mb-8">
            <div className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center bg-slate-900">
                {/* Premium CSS Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-900 to-slate-950 z-0"></div>
                <div className="absolute inset-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-slate-900 to-transparent z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-violet-400 mb-4 tracking-wider drop-shadow-sm">
                        {title}
                    </h1>
                    <p className="text-xl text-indigo-200/80 font-light tracking-wide">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TopBanner;
