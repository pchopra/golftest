import { Play, Search } from 'lucide-react';

interface Props {
  area: string;
  videoId: string;
  title: string;
}

export default function VideoTip({ area, title }: Props) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' golf tutorial')}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="relative w-full bg-gradient-to-br from-red-600 to-red-700" style={{ paddingTop: '50%' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-xs">
            <Search size={12} />
            <span>Watch on YouTube</span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-golf-700 mb-0.5">
          Improve your {area.toLowerCase()}
        </p>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
    </a>
  );
}
