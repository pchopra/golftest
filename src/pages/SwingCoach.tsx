import { Loader2 } from 'lucide-react';
import { useSwingAnalysis } from '../hooks/useSwingAnalysis';
import VideoUploader from '../components/VideoUploader';
import AnalysisResults from '../components/AnalysisResults';

export default function SwingCoach() {
  const { analyzing, results, analyze, reset } = useSwingAnalysis();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-golf-800 to-golf-600 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white mt-2">Swing Coach</h1>
        <p className="text-golf-200 text-sm mt-1">
          {results
            ? 'Your swing analysis is ready'
            : analyzing
            ? 'Analyzing your swing...'
            : 'Upload a video for AI-powered analysis'}
        </p>
      </div>

      <div className="mt-6">
        {/* Upload state */}
        {!analyzing && !results && <VideoUploader onUpload={analyze} />}

        {/* Analyzing state */}
        {analyzing && (
          <div className="px-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-golf-100 rounded-full flex items-center justify-center mb-5 animate-pulse-green">
                <Loader2 size={36} className="text-golf-600 animate-spin" />
              </div>
              <p className="text-lg font-bold text-gray-900">Analyzing Your Swing</p>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Our AI is examining your grip, posture, backswing, and follow-through...
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-6">
                <div className="h-full bg-gradient-to-r from-golf-500 to-golf-700 rounded-full animate-fill" />
              </div>
              <p className="text-xs text-gray-400 mt-2">This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* Results state */}
        {results && <AnalysisResults results={results} onReset={reset} />}
      </div>
    </div>
  );
}
