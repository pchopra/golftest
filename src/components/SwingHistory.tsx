import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SwingHistoryEntry } from '../hooks/useSwingAnalysis';

interface Props {
  entries: SwingHistoryEntry[];
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SwingHistory({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Clock size={32} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">No History Yet</p>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Analyze a swing to start building your history
          </p>
        </div>
      </div>
    );
  }

  // Show comparison if we have 2 entries
  const showComparison = entries.length === 2;
  const older = entries[0];
  const newer = entries[entries.length - 1];

  return (
    <div className="px-4 space-y-4 animate-fade-in">
      {/* Comparison header */}
      {showComparison && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Score Comparison</h3>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 mb-1">{formatDate(older.date)}</p>
              <span className={`text-3xl font-bold ${getScoreColor(older.results.overallScore)}`}>
                {older.results.overallScore}
              </span>
              <p className="text-xs text-gray-500 mt-1">{older.results.overallGrade}</p>
            </div>
            <div className="flex flex-col items-center px-4">
              {newer.results.overallScore > older.results.overallScore ? (
                <TrendingUp size={24} className="text-green-500" />
              ) : newer.results.overallScore < older.results.overallScore ? (
                <TrendingDown size={24} className="text-red-500" />
              ) : (
                <Minus size={24} className="text-gray-400" />
              )}
              <span
                className={`text-sm font-bold mt-1 ${
                  newer.results.overallScore > older.results.overallScore
                    ? 'text-green-600'
                    : newer.results.overallScore < older.results.overallScore
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}
              >
                {newer.results.overallScore > older.results.overallScore ? '+' : ''}
                {newer.results.overallScore - older.results.overallScore}
              </span>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 mb-1">{formatDate(newer.date)}</p>
              <span className={`text-3xl font-bold ${getScoreColor(newer.results.overallScore)}`}>
                {newer.results.overallScore}
              </span>
              <p className="text-xs text-gray-500 mt-1">{newer.results.overallGrade}</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual entries */}
      {[...entries].reverse().map((entry, idx) => (
        <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Video thumbnail */}
          {entry.videoUrl && (
            <div className="relative w-full bg-gray-900" style={{ paddingTop: '56.25%' }}>
              <video
                src={entry.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                controls
                preload="metadata"
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  Swing #{entries.length - idx}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(entry.results.overallScore)}`}>
                  {entry.results.overallScore}
                </span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>

            {/* Area scores mini bars */}
            <div className="space-y-2">
              {entry.results.areas.map((area) => (
                <div key={area.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 shrink-0">{area.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(area.score)}`}
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-7 text-right ${getScoreColor(area.score)}`}>
                    {area.score}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3 leading-relaxed">{entry.results.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
