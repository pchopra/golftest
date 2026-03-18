interface Props {
  area: string;
  videoId: string;
  title: string;
}

export default function VideoTip({ area, videoId, title }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-golf-700 mb-0.5">Improve your {area.toLowerCase()}</p>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
    </div>
  );
}
