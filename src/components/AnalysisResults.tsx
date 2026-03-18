import type { SwingAnalysis } from '../hooks/useSwingAnalysis';
import VideoTip from './VideoTip';

interface Props {
  results: SwingAnalysis;
  onReset: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-400';
  return 'bg-red-400';
}

function getStatusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'excellent':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
    case 'good':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
    default:
      return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Needs Work' };
  }
}

function getGaugeGradient(score: number): string {
  if (score >= 80) return '#22c55e, #16a34a';
  if (score >= 60) return '#f59e0b, #eab308';
  return '#ef4444, #f97316';
}

export default function AnalysisResults({ results, onReset }: Props) {
  const needsWorkAreas = results.areas.filter((a) => a.status === 'needs-work');

  return (
    <div className="px-4 animate-fade-in">
      {/* Overall Score Gauge */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-6">
          {/* Circular gauge */}
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={`url(#scoreGradient)`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${results.overallScore * 2.64} 264`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getGaugeGradient(results.overallScore).split(', ')[0]} />
                  <stop offset="100%" stopColor={getGaugeGradient(results.overallScore).split(', ')[1]} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ 100</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallGrade}
              </span>
              <span className="text-sm text-gray-500">Overall Grade</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{results.summary}</p>
          </div>
        </div>
      </div>

      {/* Area Breakdown */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Swing Breakdown</h3>
      <div className="space-y-3 mb-4">
        {results.areas.map((area) => {
          const badge = getStatusBadge(area.status);
          return (
            <div
              key={area.name}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{area.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(area.score)}`}
                  style={{ width: `${area.score}%` }}
                />
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{area.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Video Tips for areas that need work */}
      {needsWorkAreas.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
            Recommended Videos
          </h3>
          <div className="space-y-3 mb-4">
            {needsWorkAreas.map((area) => (
              <VideoTip
                key={area.name}
                area={area.name}
                videoId={area.tipVideoId}
                title={area.tipVideoTitle}
              />
            ))}
          </div>
        </>
      )}

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-3 mb-8 bg-golf-700 text-white text-sm font-semibold rounded-xl hover:bg-golf-800 transition-colors"
      >
        Analyze Another Swing
      </button>
    </div>
  );
}
