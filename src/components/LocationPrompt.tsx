import { MapPin, Loader2 } from 'lucide-react';

interface Props {
  onRequest: () => void;
  loading: boolean;
}

export default function LocationPrompt({ onRequest, loading }: Props) {
  return (
    <div className="mx-4 mb-4 p-4 bg-golf-50 border border-golf-200 rounded-2xl flex items-center gap-4">
      <div className="w-12 h-12 bg-golf-100 rounded-full flex items-center justify-center shrink-0">
        <MapPin size={24} className="text-golf-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Find courses near you</p>
        <p className="text-xs text-gray-500 mt-0.5">Share your location to see nearby courses</p>
      </div>
      <button
        onClick={onRequest}
        disabled={loading}
        className="px-4 py-2 bg-golf-700 text-white text-sm font-semibold rounded-full hover:bg-golf-800 transition-colors disabled:opacity-60 shrink-0"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Share'}
      </button>
    </div>
  );
}
