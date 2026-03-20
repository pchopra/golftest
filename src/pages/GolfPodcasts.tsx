import { Headphones, Star, Play, ExternalLink, Clock } from "lucide-react";

interface Podcast {
  rank: number;
  name: string;
  episode: string;
  host: string;
  duration: string;
  rating: number;
  gradientFrom: string;
  gradientTo: string;
  appleUrl: string;
  spotifyUrl: string;
}

const podcasts: Podcast[] = [
  {
    rank: 1,
    name: "No Laying Up",
    episode: "TPC Sawgrass Preview & Players Picks",
    host: "Chris Solomon & Co.",
    duration: "1h 12m",
    rating: 4.9,
    gradientFrom: "from-emerald-600",
    gradientTo: "to-teal-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/no-laying-up",
    spotifyUrl: "https://open.spotify.com/show/no-laying-up",
  },
  {
    rank: 2,
    name: "The Fried Egg",
    episode: "Architecture Deep Dive: Sawgrass",
    host: "Andy Johnson",
    duration: "58m",
    rating: 4.8,
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/the-fried-egg",
    spotifyUrl: "https://open.spotify.com/show/the-fried-egg",
  },
  {
    rank: 3,
    name: "Chasing Scratch",
    episode: "Breaking 80 at Pebble Beach",
    host: "Mike & Eli",
    duration: "1h 05m",
    rating: 4.8,
    gradientFrom: "from-blue-600",
    gradientTo: "to-cyan-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/chasing-scratch",
    spotifyUrl: "https://open.spotify.com/show/chasing-scratch",
  },
  {
    rank: 4,
    name: "Golf's Subpar",
    episode: "Interview: Xander Schauffele",
    host: "Colt Knost & Drew Stoltz",
    duration: "52m",
    rating: 4.7,
    gradientFrom: "from-purple-600",
    gradientTo: "to-pink-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/golfs-subpar",
    spotifyUrl: "https://open.spotify.com/show/golfs-subpar",
  },
  {
    rank: 5,
    name: "The Erik Anders Lang Show",
    episode: "Golf in Scotland Part 3",
    host: "Erik Anders Lang",
    duration: "1h 20m",
    rating: 4.7,
    gradientFrom: "from-rose-600",
    gradientTo: "to-red-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/erik-anders-lang",
    spotifyUrl: "https://open.spotify.com/show/erik-anders-lang",
  },
  {
    rank: 6,
    name: "Fore Play",
    episode: "Masters Preview & Bold Predictions",
    host: "Barstool Sports",
    duration: "1h 15m",
    rating: 4.6,
    gradientFrom: "from-indigo-600",
    gradientTo: "to-blue-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/fore-play",
    spotifyUrl: "https://open.spotify.com/show/fore-play",
  },
  {
    rank: 7,
    name: "Golf Channel Podcast",
    episode: "Tour Confidential: Who Wins The Players?",
    host: "Golf Channel",
    duration: "45m",
    rating: 4.5,
    gradientFrom: "from-sky-600",
    gradientTo: "to-emerald-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/golf-channel-podcast",
    spotifyUrl: "https://open.spotify.com/show/golf-channel-podcast",
  },
  {
    rank: 8,
    name: "Shotgun Start",
    episode: "Equipment Wars: Driver Edition",
    host: "Andy & Brendan",
    duration: "55m",
    rating: 4.5,
    gradientFrom: "from-lime-600",
    gradientTo: "to-green-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/shotgun-start",
    spotifyUrl: "https://open.spotify.com/show/shotgun-start",
  },
  {
    rank: 9,
    name: "Sweet Spot",
    episode: "How to Practice Like a Pro",
    host: "Adam Young",
    duration: "40m",
    rating: 4.4,
    gradientFrom: "from-fuchsia-600",
    gradientTo: "to-violet-400",
    appleUrl: "https://podcasts.apple.com/us/podcast/sweet-spot",
    spotifyUrl: "https://open.spotify.com/show/sweet-spot",
  },
  {
    rank: 10,
    name: "Rick Shiels Golf Show",
    episode: "I Played with a Tour Pro for a Day",
    host: "Rick Shiels",
    duration: "48m",
    rating: 4.6,
    gradientFrom: "from-teal-600",
    gradientTo: "to-cyan-300",
    appleUrl: "https://podcasts.apple.com/us/podcast/rick-shiels-golf-show",
    spotifyUrl: "https://open.spotify.com/show/rick-shiels-golf-show",
  },
];

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-yellow-400"
        />
      ))}
      {hasHalf && (
        <div className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-gray-300" />
          <div className="absolute overflow-hidden w-1/2 h-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
      <span className="ml-1 text-sm font-medium text-golf-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-golf-100 p-4 flex gap-4 items-start">
      {/* Rank */}
      <div className="flex-shrink-0 w-8 text-center">
        <span className="text-2xl font-bold text-golf-700">
          {podcast.rank}
        </span>
      </div>

      {/* Artwork placeholder */}
      <div
        className={`flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${podcast.gradientFrom} ${podcast.gradientTo} flex items-center justify-center`}
      >
        <Headphones className="w-8 h-8 text-white/80" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-golf-900 text-base truncate">
          {podcast.name}
        </h3>
        <p className="text-sm text-golf-600 truncate mt-0.5">
          {podcast.episode}
        </p>
        <p className="text-xs text-golf-500 mt-1">{podcast.host}</p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-golf-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{podcast.duration}</span>
          </div>
          <StarRating rating={podcast.rating} />
        </div>

        {/* Listen buttons */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={podcast.appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-golf-50 hover:bg-golf-100 text-golf-800 text-xs font-medium rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Apple Podcasts
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={podcast.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-golf-50 hover:bg-golf-100 text-golf-800 text-xs font-medium rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Spotify
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function GolfPodcasts() {
  return (
    <div className="min-h-screen bg-golf-50 pt-safe pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Headphones className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Golf Podcasts</h1>
        </div>
        <p className="text-golf-200 text-sm">Top Rated This Week</p>
      </div>

      {/* Podcast list */}
      <div className="px-4 mt-6 space-y-4">
        {podcasts.map((podcast) => (
          <PodcastCard key={podcast.rank} podcast={podcast} />
        ))}
      </div>
    </div>
  );
}
