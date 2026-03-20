import React, { useState } from "react";
import { Play, Eye, Clock, ExternalLink, Filter } from "lucide-react";

const categories = ["All", "Best Shots", "Tutorials", "Highlights", "Funny", "Reviews"];

const videos = [
  {
    title: "Top 10 Shots of the Week | The Players Championship",
    channel: "PGA Tour",
    views: "2.1M views",
    timeAgo: "6h ago",
    category: "Best Shots",
    duration: "4:32",
    gradient: "from-blue-500 to-green-600",
    url: "https://youtube.com/@pgatour",
  },
  {
    title: "How to Hit a Draw Every Time",
    channel: "Rick Shiels Golf",
    views: "890K views",
    timeAgo: "1d ago",
    category: "Tutorials",
    duration: "12:15",
    gradient: "from-orange-400 to-red-500",
    url: "https://youtube.com/@RickShielsGolf",
  },
  {
    title: "Scottie Scheffler's Perfect Swing in Slow Motion",
    channel: "Golf Digest",
    views: "1.5M views",
    timeAgo: "2d ago",
    category: "Highlights",
    duration: "8:47",
    gradient: "from-purple-500 to-pink-500",
    url: "https://youtube.com/@GolfDigest",
  },
  {
    title: "Funniest Golf Fails Compilation 2026",
    channel: "Golf Gods",
    views: "3.2M views",
    timeAgo: "3d ago",
    category: "Funny",
    duration: "15:03",
    gradient: "from-yellow-400 to-orange-500",
    url: "https://youtube.com/@GolfGods",
  },
  {
    title: "TaylorMade Qi35 vs Callaway Paradym Ai Smoke",
    channel: "TXG",
    views: "670K views",
    timeAgo: "4d ago",
    category: "Reviews",
    duration: "22:18",
    gradient: "from-teal-400 to-blue-600",
    url: "https://youtube.com/@TXGGolf",
  },
  {
    title: "Tiger Woods Returns to Practice",
    channel: "Golf Channel",
    views: "4.1M views",
    timeAgo: "5d ago",
    category: "Highlights",
    duration: "6:55",
    gradient: "from-red-500 to-rose-600",
    url: "https://youtube.com/@GolfChannel",
  },
  {
    title: "Fix Your Putting in 5 Minutes",
    channel: "Me and My Golf",
    views: "445K views",
    timeAgo: "5d ago",
    category: "Tutorials",
    duration: "5:12",
    gradient: "from-green-400 to-emerald-600",
    url: "https://youtube.com/@meandmygolf",
  },
  {
    title: "Hole-in-One Compilation | Best Aces of 2026",
    channel: "PGA Tour",
    views: "1.8M views",
    timeAgo: "6d ago",
    category: "Best Shots",
    duration: "10:44",
    gradient: "from-indigo-500 to-violet-600",
    url: "https://youtube.com/@pgatour",
  },
  {
    title: "What's in the Bag: Rory McIlroy 2026",
    channel: "TaylorMade Golf",
    views: "920K views",
    timeAgo: "6d ago",
    category: "Reviews",
    duration: "18:30",
    gradient: "from-cyan-400 to-blue-500",
    url: "https://youtube.com/@TaylorMadeGolf",
  },
  {
    title: "When Pros Hit Into the Water",
    channel: "Golf Shorts",
    views: "2.5M views",
    timeAgo: "7d ago",
    category: "Funny",
    duration: "7:21",
    gradient: "from-amber-400 to-pink-500",
    url: "https://youtube.com/@GolfShorts",
  },
];

const GolfVideos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredVideos =
    activeCategory === "All"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-golf-50 pt-safe pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-white">Top Golf Videos</h1>
        <p className="text-golf-200 mt-1">This Week's Best Clips</p>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 bg-white border-b border-golf-100">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-golf-500 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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

      {/* Video Feed */}
      <div className="px-4 py-4 space-y-4">
        {filteredVideos.map((video, index) => (
          <a
            key={index}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative">
              <div
                className={`w-full aspect-video bg-gradient-to-br ${video.gradient} rounded-t-xl`}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-medium px-2 py-0.5 rounded">
                {video.duration}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-golf-900 leading-snug line-clamp-2">
                  {video.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-golf-400 flex-shrink-0 mt-0.5" />
              </div>

              <p className="text-xs text-golf-600 mt-1">{video.channel}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-golf-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {video.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {video.timeAgo}
                  </span>
                </div>

                <span className="text-xs font-medium bg-golf-100 text-golf-700 px-2 py-0.5 rounded-full">
                  {video.category}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GolfVideos;
