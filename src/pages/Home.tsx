import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Video,
  Trophy,
  Crosshair,
  Heart,
  Tv,
  Newspaper,
  ShoppingBag,
  Play,
  Headphones,
  Users,
  ChevronRight,
} from "lucide-react";

// Beautiful golf course images from Unsplash (free, no auth needed)
const bgImages = [
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
  "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80",
  "https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80",
  "https://images.unsplash.com/photo-1593111774240-004f3da24853?w=800&q=80",
];

const features = [
  {
    title: "Find Courses",
    description: "Top-rated courses near you",
    icon: MapPin,
    route: "/courses",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=75",
    gradient: "from-emerald-600/80 to-green-900/90",
  },
  {
    title: "AI Swing Coach",
    description: "Real-time feedback on your swing",
    icon: Video,
    route: "/swing",
    image: "https://images.unsplash.com/photo-1593111774240-004f3da24853?w=400&q=75",
    gradient: "from-blue-600/80 to-indigo-900/90",
  },
  {
    title: "Live Tournaments",
    description: "Scores & leaderboards live",
    icon: Trophy,
    route: "/tournaments",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=75",
    gradient: "from-amber-600/80 to-orange-900/90",
  },
  {
    title: "Golf GPS",
    description: "Slope, wind & yardage",
    icon: Crosshair,
    route: "/gps",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&q=75",
    gradient: "from-teal-600/80 to-cyan-900/90",
  },
  {
    title: "KidsLoveGolf",
    description: "Coaching & tips for juniors",
    icon: Heart,
    route: "/kids",
    image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=400&q=75",
    gradient: "from-pink-500/80 to-rose-900/90",
  },
  {
    title: "PGA Tour Live",
    description: "News, stats & live scoring",
    icon: Tv,
    route: "/pga",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=75",
    gradient: "from-violet-600/80 to-purple-900/90",
  },
  {
    title: "Golf News",
    description: "Latest golf world headlines",
    icon: Newspaper,
    route: "/news",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=75",
    gradient: "from-sky-600/80 to-blue-900/90",
  },
  {
    title: "Equipment Deals",
    description: "Save on clubs, balls & gear",
    icon: ShoppingBag,
    route: "/deals",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&q=75",
    gradient: "from-red-600/80 to-rose-900/90",
  },
  {
    title: "Top Videos",
    description: "Best golf clips this week",
    icon: Play,
    route: "/videos",
    image: "https://images.unsplash.com/photo-1593111774240-004f3da24853?w=400&q=75",
    gradient: "from-orange-500/80 to-red-900/90",
  },
  {
    title: "Golf Podcasts",
    description: "Top rated golf shows",
    icon: Headphones,
    route: "/podcasts",
    image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=400&q=75",
    gradient: "from-indigo-500/80 to-violet-900/90",
  },
  {
    title: "Let's Play Buddy",
    description: "Find partners & schedule rounds",
    icon: Users,
    route: "/buddy",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=75",
    gradient: "from-green-600/80 to-emerald-900/90",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(new Array(bgImages.length).fill(false));

  // Preload images
  useEffect(() => {
    bgImages.forEach((src, i) => {
      const img = new Image();
      img.onload = () =>
        setLoaded((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      img.src = src;
    });
  }, []);

  // Rotate background every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-24 bg-gray-950">
      {/* Hero with slideshow background */}
      <div
        className="relative overflow-hidden"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
      >
        {/* Background slideshow */}
        <div className="absolute inset-0">
          {bgImages.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
              style={{
                backgroundImage: loaded[i] ? `url(${src})` : undefined,
                opacity: i === bgIndex && loaded[i] ? 1 : 0,
              }}
            />
          ))}
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-950" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 pt-8 pb-12 text-center">
          {/* Logo: golfer silhouette + ball */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Glow circle behind */}
                <circle cx="60" cy="60" r="56" fill="url(#glowGrad)" opacity="0.3" />
                <circle cx="60" cy="60" r="48" stroke="white" strokeWidth="1.5" opacity="0.3" />

                {/* Golfer swinging silhouette */}
                <g transform="translate(28, 18) scale(0.7)">
                  {/* Head */}
                  <circle cx="52" cy="12" r="8" fill="white" />
                  {/* Body */}
                  <path
                    d="M52 20 L52 55"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Left leg (planted) */}
                  <path
                    d="M52 55 L40 80"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Right leg (back) */}
                  <path
                    d="M52 55 L65 78"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Left arm (follow through up) */}
                  <path
                    d="M52 30 L30 15"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Right arm (follow through up) */}
                  <path
                    d="M52 30 L35 8"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Club shaft */}
                  <path
                    d="M35 8 L18 -5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Club head */}
                  <rect
                    x="12"
                    y="-10"
                    width="10"
                    height="5"
                    rx="2"
                    fill="white"
                    transform="rotate(-30 17 -7)"
                  />
                </g>

                {/* Golf ball with dimples */}
                <circle cx="88" cy="82" r="12" fill="white" />
                <circle cx="84" cy="78" r="1.2" fill="#d1d5db" />
                <circle cx="88" cy="76" r="1.2" fill="#d1d5db" />
                <circle cx="92" cy="78" r="1.2" fill="#d1d5db" />
                <circle cx="86" cy="82" r="1.2" fill="#d1d5db" />
                <circle cx="90" cy="82" r="1.2" fill="#d1d5db" />
                <circle cx="84" cy="86" r="1.2" fill="#d1d5db" />
                <circle cx="88" cy="88" r="1.2" fill="#d1d5db" />
                <circle cx="92" cy="86" r="1.2" fill="#d1d5db" />

                {/* Motion arc */}
                <path
                  d="M70 20 Q45 5, 30 15"
                  stroke="rgba(74, 222, 128, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  fill="none"
                />

                <defs>
                  <radialGradient id="glowGrad" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* App name */}
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-white bg-clip-text text-transparent drop-shadow-lg">
              GolfBuddy
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-green-300 text-lg font-semibold mb-3 tracking-wide">
            Your AI-Powered Caddie for the Modern Game
          </p>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto">
            The #1 smart golf companion trusted by players nationwide. Courses,
            coaching, live tournaments, deals & community — all in one app.
          </p>

          {/* Slideshow dots */}
          <div className="flex justify-center gap-2 mt-6">
            {bgImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setBgIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === bgIndex
                    ? "bg-green-400 w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.route}
                onClick={() => navigate(feature.route)}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-200 text-left group"
                style={{ aspectRatio: "1 / 0.85" }}
              >
                {/* Card background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${feature.gradient}`}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/20">
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-white/75 mt-0.5 leading-snug">
                    {feature.description}
                  </p>
                  <ChevronRight
                    size={14}
                    className="absolute top-3 right-3 text-white/50 group-hover:text-white/90 transition-colors"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="px-6 py-8">
        <div className="bg-gradient-to-r from-golf-800 to-golf-600 rounded-2xl p-5 text-center shadow-lg">
          <p className="text-sm text-green-100 leading-relaxed font-medium">
            From tee time deals to real-time leaderboards, swing analysis to
            junior coaching — GolfBuddy brings the entire golf world to your
            fingertips. Always updated, powered by AI.
          </p>
        </div>
      </div>
    </div>
  );
}
