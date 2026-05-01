import React, { useState, useMemo } from "react";
import {
  Crosshair,
  Wind,
  Mountain,
  Thermometer,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Star,
  ArrowLeft,
  Phone,
  Globe,
  Navigation,
} from "lucide-react";
import { mockCourses, type GolfCourse } from "../data/mockCourses";
import { matchesState } from "../utils/stateNames";
import { useAuth } from "../context/AuthContext";
import { getDistanceMiles } from "../utils/distance";
import { getCoordinatesForZip } from "../data/zipCoordinates";

/* ------------------------------------------------------------------ */
/*  Generate 18 holes of data from a course's par / yardage           */
/* ------------------------------------------------------------------ */
function generateHoleData(course: GolfCourse) {
  const parSequences: Record<number, number[]> = {
    68: [4, 3, 4, 4, 3, 4, 3, 4, 4, 4, 3, 4, 4, 3, 4, 3, 4, 4],
    70: [4, 3, 5, 4, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 3, 4, 4, 4],
    71: [4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 4, 4],
    72: [4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4],
  };
  const pars = parSequences[course.par] ?? parSequences[72]!;
  const totalParYds = pars.reduce((s, p) => s + (p === 3 ? 165 : p === 5 ? 530 : 400), 0);
  const scale = course.yardage / totalParYds;

  // Seed a simple deterministic random from course id
  let seed = 0;
  for (let i = 0; i < course.id.length; i++) seed = seed * 31 + course.id.charCodeAt(i);
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0xffff) / 0xffff; };

  const handicaps = Array.from({ length: 18 }, (_, i) => i + 1).sort(() => rand() - 0.5);

  return pars.map((par, i) => {
    const baseYds = par === 3 ? 165 : par === 5 ? 530 : 400;
    const champ = Math.round(baseYds * scale + (rand() - 0.5) * 20);
    const mens = Math.round(champ * (0.92 + rand() * 0.04));
    const womens = Math.round(mens * (0.85 + rand() * 0.03));
    const distToPin = Math.round(80 + rand() * (champ * 0.4));
    const front = Math.round(distToPin * (0.88 + rand() * 0.04));
    const back = Math.round(distToPin * (1.06 + rand() * 0.06));
    return {
      hole: i + 1,
      par,
      handicap: handicaps[i],
      champ,
      mens,
      womens,
      distToPin,
      front,
      back,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Club recommendation                                                */
/* ------------------------------------------------------------------ */
function getClubRecommendation(distance: number): { club: string; note: string } {
  if (distance >= 220) return { club: "3 Wood", note: "Full swing, consider wind" };
  if (distance >= 200) return { club: "4 Iron", note: "Smooth swing, aim left for wind" };
  if (distance >= 185) return { club: "5 Iron", note: "Full swing, play for fade" };
  if (distance >= 175) return { club: "6 Iron", note: "Solid contact, trust the club" };
  if (distance >= 160) return { club: "7 Iron", note: "Take one extra club for uphill & wind" };
  if (distance >= 148) return { club: "8 Iron", note: "Smooth tempo, aim center of green" };
  if (distance >= 135) return { club: "9 Iron", note: "Attack the pin" };
  if (distance >= 120) return { club: "PW", note: "Control distance with backswing length" };
  if (distance >= 100) return { club: "GW", note: "Three-quarter swing" };
  return { club: "SW", note: "Finesse shot, soft hands" };
}

/* ================================================================== */
/*  Course Search Screen                                               */
/* ================================================================== */
function CourseSearchScreen({ onSelect }: { onSelect: (c: GolfCourse) => void }) {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState("");

  // Extract state abbreviation from user address (e.g. "123 Main St, City, VA 20171")
  const userState = useMemo(() => {
    if (!currentUser?.address) return null;
    const match = currentUser.address.match(/\b([A-Z]{2})\b/);
    return match ? match[1] : null;
  }, [currentUser]);

  const userLat = currentUser?.lat;
  const userLng = currentUser?.lng;

  const coursesWithDistance = useMemo(() => {
    return mockCourses.map((course) => {
      const distance =
        userLat && userLng
          ? getDistanceMiles(userLat, userLng, course.lat, course.lng)
          : null;
      return { course, distance };
    });
  }, [userLat, userLng]);

  const filtered = useMemo(() => {
    const q = query.trim();
    const qLower = q.toLowerCase();

    let results: { course: GolfCourse; distance: number | null }[];

    // Check if query is a zip code (5 digits)
    const zipMatch = q.match(/^\d{5}$/);

    if (zipMatch) {
      // Zip code search — find courses nearest to that zip
      const zipCoords = getCoordinatesForZip(q);
      if (zipCoords) {
        results = mockCourses.map((course) => ({
          course,
          distance: getDistanceMiles(zipCoords.lat, zipCoords.lng, course.lat, course.lng),
        }))
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
        .slice(0, 15);
      } else {
        results = [];
      }
    } else if (qLower) {
      // Text search — match across name, city, state
      results = coursesWithDistance.filter(
        ({ course: c }) =>
          c.name.toLowerCase().includes(qLower) ||
          c.city.toLowerCase().includes(qLower) ||
          matchesState(c.state, qLower)
      );
      if (userLat && userLng) {
        results.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
      }
    } else if (userLat && userLng) {
      // No search — show nearest courses based on registered address
      results = [...coursesWithDistance]
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
        .slice(0, 15);
    } else if (userState) {
      results = coursesWithDistance.filter(
        ({ course: c }) => c.state === userState
      );
    } else {
      results = coursesWithDistance;
    }

    return results;
  }, [query, coursesWithDistance, userState, userLat, userLng]);

  const locationLabel = userLat && userLng
    ? `Nearest courses to your registered address`
    : userState
    ? `Showing courses in ${userState}`
    : "Select a course to begin";

  return (
    <div className="min-h-screen bg-golf-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 py-6">
        <div className="flex items-center gap-3">
          <Crosshair className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Golf GPS</h1>
            <p className="text-sm text-golf-200">{locationLabel}</p>
          </div>
        </div>

        {/* Search box */}
        <div className="mt-4 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-golf-300"
          />
          <input
            type="text"
            placeholder="Search by name, city, state, or zip code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white/15 text-white placeholder-golf-300 text-sm rounded-xl border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20"
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <Search size={32} className="text-golf-600 mb-3" />
            <p className="text-golf-400 text-sm">No courses found. Try a different search.</p>
          </div>
        )}

        {filtered.map(({ course, distance }) => (
          <button
            key={course.id}
            onClick={() => onSelect(course)}
            className="w-full text-left rounded-2xl bg-golf-900 p-4 shadow-lg transition-colors hover:bg-golf-800 active:bg-golf-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  {course.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-golf-400 shrink-0" />
                  <span className="text-xs text-golf-400">
                    {course.city}, {course.state}
                    {distance !== null && ` · ${distance} mi`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-white">
                  {course.rating}
                </span>
              </div>
            </div>

            <div className="mt-3 flex gap-3">
              <span className="rounded-lg bg-golf-800 px-2.5 py-1 text-xs font-medium text-golf-300">
                {course.holes} holes
              </span>
              <span className="rounded-lg bg-golf-800 px-2.5 py-1 text-xs font-medium text-golf-300">
                Par {course.par}
              </span>
              <span className="rounded-lg bg-golf-800 px-2.5 py-1 text-xs font-medium text-golf-300">
                {course.yardage.toLocaleString()} yds
              </span>
              <span className="rounded-lg bg-golf-800 px-2.5 py-1 text-xs font-medium text-golf-300">
                {course.priceRange}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GPS Range-finder View (after course selection)                     */
/* ================================================================== */
function GPSView({
  course,
  onBack,
}: {
  course: GolfCourse;
  onBack: () => void;
}) {
  const holeData = useMemo(() => generateHoleData(course), [course]);
  const [selectedHole, setSelectedHole] = useState(0);
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));

  const hole = holeData[selectedHole];
  const playsLike = hole.distToPin + 6;
  const recommendation = getClubRecommendation(playsLike);

  const handleScoreChange = (delta: number) => {
    setScores((prev) => {
      const next = [...prev];
      const newVal = next[selectedHole] + delta;
      if (newVal >= 0) next[selectedHole] = newVal;
      return next;
    });
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const totalPar = holeData.reduce((a, h) => a + h.par, 0);
  const scoreDiff = totalScore - totalPar;

  return (
    <div className="min-h-screen bg-golf-950 pb-24">
      {/* Header with course info */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-golf-200 text-sm mb-2 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Change Course
        </button>
        <div className="flex items-center gap-3">
          <Crosshair className="h-7 w-7 text-white shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {course.name}
            </h1>
            <p className="text-sm text-golf-200">
              {course.city}, {course.state} &middot; Par {course.par} &middot;{" "}
              {course.yardage.toLocaleString()} yds
            </p>
          </div>
        </div>

        {/* Quick-info chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {course.phone && (
            <a
              href={`tel:${course.phone}`}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white"
            >
              <Phone size={12} /> Call
            </a>
          )}
          {course.website && (
            <a
              href={course.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white"
            >
              <Globe size={12} /> Website
            </a>
          )}
          <a
            href={`https://maps.google.com/?q=${course.lat},${course.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white"
          >
            <Navigation size={12} /> Directions
          </a>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {/* Main Distance Display */}
        <div className="relative flex flex-col items-center rounded-2xl bg-golf-900 p-6 shadow-lg">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-golf-700 to-golf-500 shadow-xl">
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-golf-900 shadow-inner">
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-gradient-to-br from-golf-800 to-golf-700">
                <Crosshair className="mb-1 h-5 w-5 text-golf-300" />
                <span className="text-5xl font-extrabold leading-none text-white">
                  {hole.distToPin}
                </span>
                <span className="mt-1 text-sm font-medium tracking-wider text-golf-300">
                  YARDS
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex w-full max-w-xs justify-between">
            <div className="flex flex-col items-center rounded-xl bg-golf-800 px-5 py-2">
              <span className="text-xs font-medium uppercase text-golf-400">Front</span>
              <span className="text-lg font-bold text-white">{hole.front} yds</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-golf-800 px-5 py-2">
              <span className="text-xs font-medium uppercase text-golf-400">Back</span>
              <span className="text-lg font-bold text-white">{hole.back} yds</span>
            </div>
          </div>
        </div>

        {/* Wind & Conditions Panel */}
        <div className="rounded-2xl bg-golf-900 p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-golf-400">
            Conditions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center rounded-xl bg-golf-800 px-3 py-3">
              <Wind className="mb-1 h-5 w-5 text-golf-400" />
              <span className="text-xs text-golf-400">Wind</span>
              <span className="text-sm font-bold text-white">8 mph</span>
              <span className="text-xs text-golf-300">NNW</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-golf-800 px-3 py-3">
              <Mountain className="mb-1 h-5 w-5 text-golf-400" />
              <span className="text-xs text-golf-400">Slope</span>
              <span className="text-sm font-bold text-white">+3 ft</span>
              <span className="text-xs text-golf-300">Uphill</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-golf-800 px-3 py-3">
              <Crosshair className="mb-1 h-5 w-5 text-golf-400" />
              <span className="text-xs text-golf-400">Plays Like</span>
              <span className="text-sm font-bold text-white">{playsLike} yds</span>
              <span className="text-xs text-golf-300">Adjusted</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-golf-800 px-4 py-3">
              <Thermometer className="h-5 w-5 text-golf-400" />
              <div>
                <span className="text-xs text-golf-400">Temp</span>
                <p className="text-sm font-bold text-white">72°F</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-golf-800 px-4 py-3">
              <Droplets className="h-5 w-5 text-golf-400" />
              <div>
                <span className="text-xs text-golf-400">Humidity</span>
                <p className="text-sm font-bold text-white">45%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Club Recommendation */}
        <div className="rounded-2xl bg-gradient-to-r from-golf-800 to-golf-700 p-4 shadow-lg">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-golf-400">
            Suggested Club
          </h3>
          <p className="text-2xl font-bold text-white">{recommendation.club}</p>
          <p className="mt-1 text-sm text-golf-300">{recommendation.note}</p>
        </div>

        {/* Hole Info Panel */}
        <div className="rounded-2xl bg-golf-900 p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-golf-400">
            Hole Selection
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedHole((prev) => Math.max(0, prev - 1))}
              className="shrink-0 rounded-full bg-golf-800 p-1 text-golf-300 transition-colors hover:bg-golf-700"
              aria-label="Previous hole"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {holeData.map((h, i) => (
                <button
                  key={h.hole}
                  onClick={() => setSelectedHole(i)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    selectedHole === i
                      ? "bg-golf-500 text-white"
                      : "bg-golf-800 text-golf-400 hover:bg-golf-700"
                  }`}
                >
                  {h.hole}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedHole((prev) => Math.min(17, prev + 1))}
              className="shrink-0 rounded-full bg-golf-800 p-1 text-golf-300 transition-colors hover:bg-golf-700"
              aria-label="Next hole"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-golf-800 px-4 py-3 text-center">
              <span className="text-xs text-golf-400">Par</span>
              <p className="text-2xl font-bold text-white">{hole.par}</p>
            </div>
            <div className="rounded-xl bg-golf-800 px-4 py-3 text-center">
              <span className="text-xs text-golf-400">Handicap</span>
              <p className="text-2xl font-bold text-white">{hole.handicap}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-golf-800 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-golf-300">Championship</span>
              </div>
              <span className="text-sm font-bold text-white">{hole.champ} yds</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-golf-800 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white" />
                <span className="text-sm text-golf-300">Men&apos;s</span>
              </div>
              <span className="text-sm font-bold text-white">{hole.mens} yds</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-golf-800 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="text-sm text-golf-300">Women&apos;s</span>
              </div>
              <span className="text-sm font-bold text-white">{hole.womens} yds</span>
            </div>
          </div>
        </div>

        {/* Score Tracker */}
        <div className="rounded-2xl bg-golf-900 p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-golf-400">
            Score Tracker
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-golf-400">Hole {hole.hole} Score</span>
              <p className="text-3xl font-bold text-white">
                {scores[selectedHole] || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleScoreChange(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-golf-800 text-2xl font-bold text-golf-300 transition-colors hover:bg-golf-700"
              >
                −
              </button>
              <button
                onClick={() => handleScoreChange(1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-golf-600 text-2xl font-bold text-white transition-colors hover:bg-golf-500"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-golf-800 pt-3">
            <span className="text-sm text-golf-400">Total Score</span>
            <div className="text-right">
              <span className="text-lg font-bold text-white">{totalScore}</span>
              {totalScore > 0 && (
                <span
                  className={`ml-2 text-sm font-medium ${
                    scoreDiff > 0
                      ? "text-red-400"
                      : scoreDiff < 0
                        ? "text-green-400"
                        : "text-golf-300"
                  }`}
                >
                  ({scoreDiff > 0 ? "+" : ""}
                  {scoreDiff})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main GolfGPS component                                             */
/* ================================================================== */
const GolfGPS: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);

  if (!selectedCourse) {
    return <CourseSearchScreen onSelect={setSelectedCourse} />;
  }

  return (
    <GPSView course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  );
};

export default GolfGPS;
