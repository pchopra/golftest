import { Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Props {
  area: string;
  videoId: string;
  title: string;
}

export default function VideoTip({ area, videoId, title }: Props) {
  const [imgError, setImgError] = useState(false);
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (imgError) {
    return (
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <ExternalLink size={22} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-golf-700 mb-0.5">
              Improve your {area.toLowerCase()}
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tap to search on YouTube</p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Play size={28} className="text-white ml-1" fill="white" />
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
