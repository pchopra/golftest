import React, { useState } from "react";
import {
  Newspaper,
  Rss,
  RefreshCw,
  ExternalLink,
  Filter,
} from "lucide-react";

type Category =
  | "All"
  | "PGA Tour"
  | "LPGA"
  | "Equipment"
  | "Instruction"
  | "Lifestyle"
  | "Majors";

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  category: Exclude<Category, "All">;
  source: string;
  timeAgo: string;
}

const categories: Category[] = [
  "All",
  "PGA Tour",
  "LPGA",
  "Equipment",
  "Instruction",
  "Lifestyle",
  "Majors",
];

const categoryColors: Record<Exclude<Category, "All">, { badge: string; border: string }> = {
  "PGA Tour": {
    badge: "bg-blue-100 text-blue-800",
    border: "border-l-blue-500",
  },
  LPGA: {
    badge: "bg-pink-100 text-pink-800",
    border: "border-l-pink-500",
  },
  Equipment: {
    badge: "bg-amber-100 text-amber-800",
    border: "border-l-amber-500",
  },
  Instruction: {
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-l-emerald-500",
  },
  Lifestyle: {
    badge: "bg-purple-100 text-purple-800",
    border: "border-l-purple-500",
  },
  Majors: {
    badge: "bg-red-100 text-red-800",
    border: "border-l-red-500",
  },
};

const articles: NewsArticle[] = [
  {
    id: 1,
    headline: "Scheffler Extends World No. 1 Reign with Dominant Win",
    summary:
      "Scottie Scheffler continued his remarkable run atop the world rankings with a commanding five-stroke victory, solidifying his status as the game's best player.",
    category: "PGA Tour",
    source: "PGA Tour",
    timeAgo: "1h ago",
  },
  {
    id: 2,
    headline: "LPGA Announces Record Prize Money for 2026 Season",
    summary:
      "The LPGA Tour revealed a historic increase in total purse money for the upcoming season, marking a significant milestone for women's professional golf.",
    category: "LPGA",
    source: "GolfWeek",
    timeAgo: "2h ago",
  },
  {
    id: 3,
    headline: "TaylorMade Launches Revolutionary Qi35 Driver",
    summary:
      "TaylorMade's latest innovation features AI-designed face technology and a carbon chassis that promises faster ball speeds and tighter dispersion for all skill levels.",
    category: "Equipment",
    source: "Golf Digest",
    timeAgo: "3h ago",
  },
  {
    id: 4,
    headline: "5 Drills to Fix Your Slice This Weekend",
    summary:
      "Top instructor shares five simple practice drills that can help eliminate your slice and start hitting consistent draws within a single range session.",
    category: "Instruction",
    source: "Golf Digest",
    timeAgo: "4h ago",
  },
  {
    id: 5,
    headline: "Augusta National Announces Course Changes Ahead of Masters",
    summary:
      "Augusta National Golf Club has revealed modifications to three holes ahead of the 2026 Masters, including a lengthened 13th hole and redesigned bunkers on the 5th.",
    category: "Majors",
    source: "Golf Channel",
    timeAgo: "5h ago",
  },
  {
    id: 6,
    headline: "Nelly Korda Sets Sights on Grand Slam",
    summary:
      "After a dominant 2025 campaign, Nelly Korda has declared her intention to win all five major championships in a single season — a feat never accomplished.",
    category: "LPGA",
    source: "GolfWeek",
    timeAgo: "6h ago",
  },
  {
    id: 7,
    headline: "Callaway's New Paradym AI Smoke Irons Review",
    summary:
      "Our in-depth review of Callaway's latest iron offering reveals impressive forgiveness and distance gains powered by next-generation artificial intelligence design.",
    category: "Equipment",
    source: "MyGolfSpy",
    timeAgo: "8h ago",
  },
  {
    id: 8,
    headline: "The Rise of Golf Among Gen Z",
    summary:
      "A new report shows golf participation among 18-to-25-year-olds has surged 40% over the past three years, driven by social media influencers and relaxed dress codes.",
    category: "Lifestyle",
    source: "Golf Digest",
    timeAgo: "10h ago",
  },
  {
    id: 9,
    headline: "US Open 2026: Oakmont Preview and Favorites",
    summary:
      "With the US Open heading back to Oakmont Country Club, we break down the brutal layout and identify the players best suited to conquer its legendary difficulty.",
    category: "Majors",
    source: "Golf Channel",
    timeAgo: "12h ago",
  },
  {
    id: 10,
    headline: "Bryson DeChambeau's YouTube Channel Hits 5M Subscribers",
    summary:
      "The former US Open champion's YouTube channel has reached a major milestone, reflecting golf's expanding digital footprint and the appetite for behind-the-scenes content.",
    category: "Lifestyle",
    source: "GolfWeek",
    timeAgo: "14h ago",
  },
  {
    id: 11,
    headline: "How to Read Greens Like a Tour Pro",
    summary:
      "Learn the techniques PGA Tour professionals use to read break and slope on the greens, including AimPoint and plumb-bobbing methods explained step by step.",
    category: "Instruction",
    source: "Golf Digest",
    timeAgo: "16h ago",
  },
  {
    id: 12,
    headline: "PGA Tour and LIV Golf Merger Update",
    summary:
      "Negotiations between the PGA Tour and Saudi Arabia's Public Investment Fund continue as both sides work toward a framework agreement that could reshape professional golf.",
    category: "PGA Tour",
    source: "PGA Tour",
    timeAgo: "18h ago",
  },
];

const GolfNews: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-golf-50 pt-safe pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 pt-6 pb-8">
        {/* RSS indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
              <Rss className="h-3 w-3" />
              RSS Feed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-golf-200 text-xs">
            <RefreshCw className="h-3 w-3" />
            <span>Last updated: Just now</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2.5">
            <Newspaper className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Golf News</h1>
            <p className="text-golf-200 text-sm">Latest Stories &amp; Updates</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-4 py-3 bg-white border-b border-golf-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-golf-500" />
          <span className="text-xs font-medium text-golf-600">Filter by category</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-golf-700 text-white"
                  : "bg-golf-100 text-golf-700 hover:bg-golf-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News feed */}
      <div className="px-4 pt-4 space-y-3">
        {filteredArticles.map((article) => {
          const colors = categoryColors[article.category];
          return (
            <article
              key={article.id}
              className={`rounded-xl bg-white shadow-sm border border-golf-100 border-l-4 ${colors.border} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-golf-400">{article.timeAgo}</span>
                </div>

                <h2 className="text-base font-bold text-golf-900 leading-snug mb-1.5">
                  {article.headline}
                </h2>

                <p className="text-sm text-golf-600 leading-relaxed line-clamp-2 mb-3">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-golf-500">
                    {article.source}
                  </span>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-golf-700 hover:text-golf-900 transition-colors"
                  >
                    Read more
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-golf-300 mx-auto mb-3" />
            <p className="text-golf-500 font-medium">No articles found</p>
            <p className="text-golf-400 text-sm mt-1">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GolfNews;
