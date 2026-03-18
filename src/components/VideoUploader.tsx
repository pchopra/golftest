import { Upload, Camera } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  onUpload: (file: File | null) => void;
}

export default function VideoUploader({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-golf-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-golf-500 hover:bg-golf-50/50 transition-colors min-h-[220px]"
      >
        <div className="w-16 h-16 bg-golf-100 rounded-full flex items-center justify-center mb-4">
          <Camera size={32} className="text-golf-600" />
        </div>
        <p className="text-base font-semibold text-gray-900">Upload a Swing Video</p>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Tap to record or choose a video from your library
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <Upload size={14} />
          <span>MP4, MOV, or WebM supported</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (file) onUpload(file);
        }}
      />

      <button
        onClick={() => onUpload(null)}
        className="w-full mt-4 py-3 text-golf-700 text-sm font-semibold border border-golf-200 rounded-xl hover:bg-golf-50 transition-colors"
      >
        Try a Sample Analysis
      </button>
    </div>
  );
}
