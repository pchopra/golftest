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

// Stunning bright daytime golf course images (Pexels + Unsplash, free to use)
const bgImages = [
  "https://images.pexels.com/photos/914682/pexels-photo-914682.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/164260/pexels-photo-164260.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6542733/pexels-photo-6542733.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/69657/pexels-photo-69657.jpeg?auto=compress&cs=tinysrgb&w=800",
];

// Bright Pexels golf images for feature cards (free, no auth)
const cardImages = {
  fairway: "https://images.pexels.com/photos/914682/pexels-photo-914682.jpeg?auto=compress&cs=tinysrgb&w=400",
  golfer: "https://images.pexels.com/photos/54123/pexels-photo-54123.jpeg?auto=compress&cs=tinysrgb&w=400",
  green: "https://images.pexels.com/photos/164260/pexels-photo-164260.jpeg?auto=compress&cs=tinysrgb&w=400",
  aerial: "https://images.pexels.com/photos/6542733/pexels-photo-6542733.jpeg?auto=compress&cs=tinysrgb&w=400",
  landscape: "https://images.pexels.com/photos/69657/pexels-photo-69657.jpeg?auto=compress&cs=tinysrgb&w=400",
};

const features = [
  {
    title: "Find Courses",
    description: "Top-rated courses near you",
    icon: MapPin,
    route: "/courses",
    image: cardImages.fairway,
    gradient: "from-emerald-600/70 to-green-900/80",
  },
  {
    title: "AI Swing Coach",
    description: "Real-time feedback on your swing",
    icon: Video,
    route: "/swing",
    image: cardImages.golfer,
    gradient: "from-blue-600/70 to-indigo-900/80",
  },
  {
    title: "Live Tournaments",
    description: "Scores & leaderboards live",
    icon: Trophy,
    route: "/tournaments",
    image: cardImages.green,
    gradient: "from-amber-500/70 to-orange-900/80",
  },
  {
    title: "Golf GPS",
    description: "Slope, wind & yardage",
    icon: Crosshair,
    route: "/gps",
    image: cardImages.aerial,
    gradient: "from-teal-500/70 to-cyan-900/80",
  },
  {
    title: "KidsLoveGolf",
    description: "Coaching & tips for juniors",
    icon: Heart,
    route: "/kids",
    image: cardImages.landscape,
    gradient: "from-pink-500/70 to-rose-900/80",
  },
  {
    title: "PGA Tour Live",
    description: "News, stats & live scoring",
    icon: Tv,
    route: "/pga",
    image: cardImages.fairway,
    gradient: "from-violet-500/70 to-purple-900/80",
  },
  {
    title: "Golf News",
    description: "Latest golf world headlines",
    icon: Newspaper,
    route: "/news",
    image: cardImages.green,
    gradient: "from-sky-500/70 to-blue-900/80",
  },
  {
    title: "Equipment Deals",
    description: "Save on clubs, balls & gear",
    icon: ShoppingBag,
    route: "/deals",
    image: cardImages.golfer,
    gradient: "from-red-500/70 to-rose-900/80",
  },
  {
    title: "Top Videos",
    description: "Best golf clips this week",
    icon: Play,
    route: "/videos",
    image: cardImages.aerial,
    gradient: "from-orange-500/70 to-red-900/80",
  },
  {
    title: "Golf Podcasts",
    description: "Top rated golf shows",
    icon: Headphones,
    route: "/podcasts",
    image: cardImages.landscape,
    gradient: "from-indigo-500/70 to-violet-900/80",
  },
  {
    title: "Let's Play Buddy",
    description: "Find partners & schedule rounds",
    icon: Users,
    route: "/buddy",
    image: cardImages.green,
    gradient: "from-green-500/70 to-emerald-900/80",
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
          {/* Light overlay for readability — keeps images bright */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-gray-950/90" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 pt-8 pb-12 text-center">
          {/* Logo: circular badge with golf course photo + bold golfer */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-600/20 blur-lg" />

              {/* Main circular logo */}
              <div
                className="relative w-36 h-36 rounded-full overflow-hidden border-[3px] border-white/40 shadow-2xl"
                style={{ boxShadow: "0 0 40px rgba(34, 197, 94, 0.3), 0 0 80px rgba(34, 197, 94, 0.1)" }}
              >
                {/* Golf course background photo inside circle */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images.pexels.com/photos/914682/pexels-photo-914682.jpeg?auto=compress&cs=tinysrgb&w=400)",
                  }}
                />
                {/* Green tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 via-transparent to-green-950/60" />

                {/* Bold golfer silhouette */}
                <svg
                  className="absolute inset-0 w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  viewBox="0 0 144 144"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Golfer in follow-through pose — bold strokes */}
                  <g transform="translate(32, 18)">
                    {/* Head */}
                    <circle cx="48" cy="14" r="10" fill="white" stroke="white" strokeWidth="1" />
                    {/* Neck */}
                    <path d="M48 24 L48 30" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    {/* Torso */}
                    <path d="M48 30 L46 62" stroke="white" strokeWidth="7" strokeLinecap="round" />
                    {/* Left leg (front, planted) */}
                    <path d="M46 62 L34 90" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    {/* Left foot */}
                    <path d="M34 90 L28 94" stroke="white" strokeWidth="5" strokeLinecap="round" />
                    {/* Right leg (back) */}
                    <path d="M46 62 L62 88" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    {/* Right foot */}
                    <path d="M62 88 L68 90" stroke="white" strokeWidth="5" strokeLinecap="round" />
                    {/* Shoulders */}
                    <path d="M36 34 L60 32" stroke="white" strokeWidth="5" strokeLinecap="round" />
                    {/* Left arm (follow through, extended up-left) */}
                    <path d="M38 34 L20 18" stroke="white" strokeWidth="5" strokeLinecap="round" />
                    {/* Right arm (follow through, extended up-left) */}
                    <path d="M56 32 L28 12" stroke="white" strokeWidth="5" strokeLinecap="round" />
                    {/* Club shaft (extending from hands) */}
                    <path d="M20 18 L2 2" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    {/* Club head */}
                    <path d="M2 2 L-4 6" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  </g>

                  {/* Golf ball with motion trail */}
                  <circle cx="108" cy="98" r="8" fill="white" opacity="0.95" />
                  <circle cx="105" cy="95" r="0.9" fill="#c0c0c0" />
                  <circle cx="108" cy="93" r="0.9" fill="#c0c0c0" />
                  <circle cx="111" cy="95" r="0.9" fill="#c0c0c0" />
                  <circle cx="106" cy="98" r="0.9" fill="#c0c0c0" />
                  <circle cx="110" cy="98" r="0.9" fill="#c0c0c0" />
                  <circle cx="108" cy="101" r="0.9" fill="#c0c0c0" />
                  {/* Motion lines */}
                  <path d="M98 96 L90 94" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
                  <path d="M98 99 L88 99" stroke="white" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                  <path d="M99 102 L91 104" stroke="white" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Small green accent badge */}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="14" r="5" />
                  <line x1="12" y1="9" x2="12" y2="2" />
                  <path d="M12 2 L18 6 L12 10" fill="white" stroke="none" />
                </svg>
              </div>
            </div>
          </div>

          {/* App name */}
          <h1
            className="text-5xl font-extrabold tracking-tight mb-3"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            <span className="bg-gradient-to-r from-white via-green-200 to-emerald-300 bg-clip-text text-transparent">
              GolfBuddy
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="text-white text-lg font-semibold mb-3 tracking-wide"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
          >
            Your AI-Powered Caddie for the Modern Game
          </p>

          {/* Description */}
          <p
            className="text-white/90 text-sm leading-relaxed max-w-xs mx-auto"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
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
      <div className="px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
          {/* Accent stripe */}
          <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

          <div className="px-6 py-7">
            <p className="text-xl text-white font-extrabold leading-8 text-center" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              One app. Every golfer's dream.
            </p>
            <p className="text-sm text-gray-300 font-medium leading-6 text-center mt-3">
              Live tournaments, AI swing coaching, GPS range finder, tee time deals, equipment savings, junior programs, and a community of players — all in your pocket.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/40" />
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-amber-300">
                Download-free and always up to date
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/40" />
            </div>

            <p className="text-center mt-4 text-gray-400 text-[11px] font-semibold tracking-widest uppercase">
              Powered by AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
