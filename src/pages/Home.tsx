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
} from "lucide-react";

const features = [
  {
    title: "Find Courses Nearby",
    description: "Discover top-rated courses around you",
    icon: MapPin,
    route: "/courses",
  },
  {
    title: "AI Swing Coach",
    description: "Get real-time feedback on your swing",
    icon: Video,
    route: "/swing",
  },
  {
    title: "Live Tournaments",
    description: "Follow scores and leaderboards live",
    icon: Trophy,
    route: "/tournaments",
  },
  {
    title: "Golf GPS & Range Finder",
    description: "Precise yardage to every pin",
    icon: Crosshair,
    route: "/gps",
  },
  {
    title: "KidsLoveGolf",
    description: "Fun coaching programs for juniors",
    icon: Heart,
    route: "/kids",
  },
  {
    title: "PGA Tour Live",
    description: "Stream every round as it happens",
    icon: Tv,
    route: "/pga",
  },
  {
    title: "Golf News & RSS",
    description: "Latest headlines from the golf world",
    icon: Newspaper,
    route: "/news",
  },
  {
    title: "Equipment Deals",
    description: "Save big on clubs, balls, and gear",
    icon: ShoppingBag,
    route: "/deals",
  },
  {
    title: "Top Golf Videos",
    description: "Watch tips, tricks, and highlights",
    icon: Play,
    route: "/videos",
  },
  {
    title: "Golf Podcasts",
    description: "Listen to the best golf shows",
    icon: Headphones,
    route: "/podcasts",
  },
  {
    title: "Let's Play Buddy",
    description: "Find partners and schedule rounds",
    icon: Users,
    route: "/buddy",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-golf-50">
      {/* Hero Section */}
      <div
        className="bg-gradient-to-br from-golf-800 to-golf-600 text-white animate-fade-in"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-md mx-auto px-6 pb-10 text-center">
          {/* SVG Logo */}
          <div className="flex justify-center pt-6 mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Golf ball */}
              <circle cx="40" cy="34" r="20" fill="white" />
              <circle cx="34" cy="28" r="1.5" fill="#d1d5db" />
              <circle cx="40" cy="26" r="1.5" fill="#d1d5db" />
              <circle cx="46" cy="28" r="1.5" fill="#d1d5db" />
              <circle cx="37" cy="33" r="1.5" fill="#d1d5db" />
              <circle cx="43" cy="33" r="1.5" fill="#d1d5db" />
              <circle cx="34" cy="38" r="1.5" fill="#d1d5db" />
              <circle cx="40" cy="40" r="1.5" fill="#d1d5db" />
              <circle cx="46" cy="38" r="1.5" fill="#d1d5db" />
              {/* Tee */}
              <rect x="38" y="54" width="4" height="14" rx="2" fill="white" />
              <rect x="35" y="52" width="10" height="4" rx="2" fill="white" />
              {/* Flag pole */}
              <line x1="56" y1="10" x2="56" y2="50" stroke="white" strokeWidth="2" />
              {/* Flag */}
              <path d="M56 10 L72 18 L56 26 Z" fill="#f87171" />
            </svg>
          </div>

          {/* App Name */}
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white to-golf-100 bg-clip-text text-transparent">
              GolfBuddy
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-golf-100 text-lg font-medium mb-3">
            Your AI-Powered Caddie for the Modern Game
          </p>

          {/* Description */}
          <p className="text-golf-200 text-sm leading-relaxed">
            The #1 smart golf companion trusted by players nationwide. Everything
            you need — courses, coaching, tournaments, deals, and community — all
            in one powerful app.
          </p>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.route}
                onClick={() => navigate(feature.route)}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 p-4 text-left flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-golf-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-golf-700" />
                </div>
                <h3 className="text-sm font-semibold text-golf-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-golf-500 leading-snug">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-md mx-auto px-6 pb-24 animate-fade-in">
        <p className="text-center text-sm text-golf-600 leading-relaxed">
          From tee time deals to real-time leaderboards, swing analysis to junior
          coaching — GolfBuddy brings the entire golf world to your fingertips.
          Download-free, always updated, powered by AI.
        </p>
      </div>
    </div>
  );
}
