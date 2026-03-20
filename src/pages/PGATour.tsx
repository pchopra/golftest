import React, { useState } from "react";
import {
  Trophy,
  Newspaper,
  Users,
  Play,
  ExternalLink,
  Circle,
  RefreshCw,
} from "lucide-react";

type Tab = "scores" | "news" | "players" | "videos";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "scores", label: "Live Scores", icon: Trophy },
  { key: "news", label: "News", icon: Newspaper },
  { key: "players", label: "Players", icon: Users },
  { key: "videos", label: "Videos", icon: Play },
];

const leaderboard = [
  { pos: 1, player: "Scottie Scheffler", score: -18, today: -6, thru: "F" },
  { pos: 2, player: "Rory McIlroy", score: -15, today: -4, thru: "F" },
  { pos: 3, player: "Xander Schauffele", score: -14, today: -5, thru: "F" },
  { pos: 4, player: "Jon Rahm", score: -13, today: -3, thru: 16 },
  { pos: 5, player: "Collin Morikawa", score: -12, today: -4, thru: "F" },
  { pos: 6, player: "Wyndham Clark", score: -11, today: -2, thru: 15 },
  { pos: 7, player: "Viktor Hovland", score: -10, today: -3, thru: "F" },
  { pos: "T8", player: "Patrick Cantlay", score: -9, today: -1, thru: "F" },
  { pos: "T8", player: "Ludvig Åberg", score: -9, today: -2, thru: 17 },
  { pos: 10, player: "Sahith Theegala", score: -8, today: -3, thru: "F" },
  { pos: 11, player: "Tommy Fleetwood", score: -7, today: 0, thru: 14 },
  { pos: 12, player: "Matt Fitzpatrick", score: -6, today: -1, thru: "F" },
  { pos: "T13", player: "Shane Lowry", score: -5, today: 1, thru: 13 },
  { pos: "T13", player: "Justin Thomas", score: -5, today: -2, thru: "F" },
  { pos: 15, player: "Cameron Young", score: -4, today: 0, thru: 12 },
];

const newsArticles = [
  {
    headline: "Scheffler Surges to 54-Hole Lead at The Players",
    summary:
      "World No. 1 Scottie Scheffler fired a bogey-free 64 to take a commanding three-shot lead heading into the final round at TPC Sawgrass.",
    source: "PGA Tour",
    time: "2h ago",
  },
  {
    headline: "McIlroy Eyes Fifth Major Ahead of Masters Prep",
    summary:
      "Rory McIlroy discusses his preparation for Augusta National and his renewed confidence after a strong start to the 2026 season.",
    source: "Golf Digest",
    time: "4h ago",
  },
  {
    headline: "TaylorMade Unveils Qi35 Driver with AI-Designed Face",
    summary:
      "The new Qi35 driver features a machine-learning optimized face pattern promising higher ball speeds and tighter dispersion for all handicaps.",
    source: "Golf.com",
    time: "6h ago",
  },
  {
    headline: "USGA Announces Revised Model Local Rule on Green Reading",
    summary:
      "Starting in 2027, detailed green-reading materials will be further restricted under a new rule aimed at preserving skill-based putting.",
    source: "USGA",
    time: "8h ago",
  },
  {
    headline: "Hovland: 'I Finally Found Something With My Wedges'",
    summary:
      "Viktor Hovland opened up about the swing changes that have revitalized his short game and led to back-to-back top-5 finishes this spring.",
    source: "PGA Tour",
    time: "12h ago",
  },
  {
    headline: "2026 Ryder Cup Teams Taking Shape After Players Championship",
    summary:
      "With automatic qualifying points on the line, several players made big moves in the standings for this fall's Ryder Cup at Bethpage Black.",
    source: "ESPN",
    time: "1d ago",
  },
];

const players = [
  {
    name: "Scottie Scheffler",
    rank: 1,
    flag: "🇺🇸",
    wins: 4,
    fedex: 3280,
    avg: 68.2,
    drive: 305,
    gir: 72.4,
    putt: 1.71,
    slug: "scottie-scheffler",
  },
  {
    name: "Rory McIlroy",
    rank: 2,
    flag: "🇬🇧",
    wins: 2,
    fedex: 2540,
    avg: 68.9,
    drive: 312,
    gir: 70.1,
    putt: 1.73,
    slug: "rory-mcilroy",
  },
  {
    name: "Jon Rahm",
    rank: 3,
    flag: "🇪🇸",
    wins: 1,
    fedex: 1890,
    avg: 69.1,
    drive: 308,
    gir: 71.2,
    putt: 1.72,
    slug: "jon-rahm",
  },
  {
    name: "Xander Schauffele",
    rank: 4,
    flag: "🇺🇸",
    wins: 3,
    fedex: 2310,
    avg: 68.7,
    drive: 302,
    gir: 69.8,
    putt: 1.74,
    slug: "xander-schauffele",
  },
  {
    name: "Wyndham Clark",
    rank: 5,
    flag: "🇺🇸",
    wins: 1,
    fedex: 1720,
    avg: 69.3,
    drive: 310,
    gir: 68.5,
    putt: 1.76,
    slug: "wyndham-clark",
  },
  {
    name: "Viktor Hovland",
    rank: 6,
    flag: "🇳🇴",
    wins: 2,
    fedex: 1980,
    avg: 69.0,
    drive: 301,
    gir: 70.5,
    putt: 1.75,
    slug: "viktor-hovland",
  },
  {
    name: "Patrick Cantlay",
    rank: 7,
    flag: "🇺🇸",
    wins: 1,
    fedex: 1650,
    avg: 69.4,
    drive: 296,
    gir: 71.0,
    putt: 1.70,
    slug: "patrick-cantlay",
  },
  {
    name: "Collin Morikawa",
    rank: 8,
    flag: "🇺🇸",
    wins: 2,
    fedex: 2050,
    avg: 68.8,
    drive: 298,
    gir: 72.1,
    putt: 1.73,
    slug: "collin-morikawa",
  },
];

const videos = [
  {
    title: "Best Shots from Round 2 at The Players",
    duration: "8:42",
    gradient: "from-golf-700 to-golf-500",
  },
  {
    title: "Top 10 Plays of the Week",
    duration: "12:15",
    gradient: "from-golf-800 to-golf-600",
  },
  {
    title: "Scheffler's Incredible Eagle on 16",
    duration: "3:28",
    gradient: "from-golf-600 to-golf-400",
  },
  {
    title: "Every Shot from McIlroy's 63",
    duration: "18:05",
    gradient: "from-golf-900 to-golf-700",
  },
  {
    title: "Island Green Highlights – Hole 17 TPC Sawgrass",
    duration: "6:51",
    gradient: "from-golf-700 to-golf-400",
  },
  {
    title: "Mic'd Up: Caddie Conversations on the Back Nine",
    duration: "10:33",
    gradient: "from-golf-800 to-golf-500",
  },
];

function formatScore(score: number): string {
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : `${score}`;
}

function scoreColor(score: number): string {
  if (score < 0) return "text-green-400";
  if (score > 0) return "text-red-400";
  return "text-gray-300";
}

const PGATour: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("scores");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-golf-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 py-8">
        <h1 className="text-3xl font-bold text-white">PGA Tour Live</h1>
        <p className="mt-1 text-golf-200">News, Stats &amp; Live Scoring</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 flex border-b border-golf-800 bg-golf-950/95 backdrop-blur">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-golf-400 text-golf-300"
                  : "text-golf-500 hover:text-golf-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Live Scores Tab */}
        {activeTab === "scores" && (
          <div>
            {/* Tournament Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  THE PLAYERS Championship
                </h2>
                <p className="text-sm text-golf-400">
                  TPC Sawgrass — Round 3
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-red-900/40 px-3 py-1 text-xs font-semibold text-red-400">
                <Circle className="h-2 w-2 animate-pulse fill-red-500 text-red-500" />
                LIVE
              </span>
            </div>

            {/* Leaderboard */}
            <div className="overflow-hidden rounded-xl bg-golf-900 shadow-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-golf-800 text-left text-xs uppercase text-golf-500">
                    <th className="px-3 py-2.5 font-medium">Pos</th>
                    <th className="px-3 py-2.5 font-medium">Player</th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      Score
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">
                      Today
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">Thru</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-golf-800/50 ${
                        i === 0 ? "bg-golf-800/30" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium text-golf-300">
                        {row.pos}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-white">
                        {row.player}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-bold ${scoreColor(
                          row.score
                        )}`}
                      >
                        {formatScore(row.score)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-medium ${scoreColor(
                          row.today
                        )}`}
                      >
                        {formatScore(row.today)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-golf-400">
                        {row.thru}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auto-refresh indicator */}
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-golf-500">
                <RefreshCw className="h-3 w-3" />
                Updated 30s ago
              </span>
              <a
                href="https://www.pgatour.com/leaderboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-golf-400 hover:text-golf-300"
              >
                Full Leaderboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div className="space-y-3">
            {newsArticles.map((article, i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-br from-golf-900 to-golf-800 p-4 shadow-lg"
              >
                <h3 className="font-bold leading-snug text-white">
                  {article.headline}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-golf-400">
                  {article.summary}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-golf-500">
                    {article.source} &middot; {article.time}
                  </span>
                  <a
                    href="https://www.pgatour.com/news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-golf-400 hover:text-golf-300"
                  >
                    Read more on PGATour.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === "players" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {players.map((p) => {
              const isExpanded = expandedPlayer === p.slug;
              return (
                <button
                  key={p.slug}
                  onClick={() =>
                    setExpandedPlayer(isExpanded ? null : p.slug)
                  }
                  className="w-full rounded-xl bg-golf-900 p-4 text-left shadow-lg transition-all hover:bg-golf-800/80"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {p.flag} {p.name}
                      </p>
                      <p className="text-xs text-golf-500">
                        World Ranking #{p.rank}
                      </p>
                    </div>
                    <Trophy className="h-4 w-4 text-golf-500" />
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-golf-500">Wins</p>
                      <p className="font-bold text-golf-300">{p.wins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-golf-500">FedEx Pts</p>
                      <p className="font-bold text-golf-300">
                        {p.fedex.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t border-golf-800 pt-3">
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div>
                          <p className="text-xs text-golf-500">Scoring Avg</p>
                          <p className="font-medium text-golf-300">{p.avg}</p>
                        </div>
                        <div>
                          <p className="text-xs text-golf-500">
                            Driving Distance
                          </p>
                          <p className="font-medium text-golf-300">
                            {p.drive} yds
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-golf-500">GIR%</p>
                          <p className="font-medium text-golf-300">{p.gir}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-golf-500">Putting Avg</p>
                          <p className="font-medium text-golf-300">{p.putt}</p>
                        </div>
                      </div>
                      <a
                        href={`https://www.pgatour.com/players/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex items-center gap-1 text-xs font-medium text-golf-400 hover:text-golf-300"
                      >
                        Full profile
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {videos.map((video, i) => (
              <a
                key={i}
                href="https://www.youtube.com/@pgatour"
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl bg-golf-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                {/* Thumbnail placeholder */}
                <div
                  className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${video.gradient}`}
                >
                  <Play className="h-10 w-10 text-white/70 transition-transform group-hover:scale-110" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-snug text-white">
                    {video.title}
                  </h3>
                  <span className="mt-1.5 flex items-center gap-1 text-xs text-golf-500">
                    Watch on YouTube
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PGATour;
