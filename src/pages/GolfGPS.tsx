import React, { useState } from "react";
import {
  Crosshair,
  Wind,
  Mountain,
  Thermometer,
  Droplets,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const holeData = [
  { hole: 1, par: 4, handicap: 7, champ: 412, mens: 385, womens: 340, distToPin: 156, front: 142, back: 171 },
  { hole: 2, par: 3, handicap: 15, champ: 178, mens: 160, womens: 128, distToPin: 134, front: 120, back: 148 },
  { hole: 3, par: 5, handicap: 1, champ: 547, mens: 520, womens: 468, distToPin: 213, front: 198, back: 228 },
  { hole: 4, par: 4, handicap: 9, champ: 398, mens: 372, womens: 330, distToPin: 145, front: 131, back: 160 },
  { hole: 5, par: 4, handicap: 3, champ: 435, mens: 410, womens: 365, distToPin: 172, front: 158, back: 186 },
  { hole: 6, par: 3, handicap: 17, champ: 162, mens: 145, womens: 112, distToPin: 118, front: 105, back: 132 },
  { hole: 7, par: 5, handicap: 5, champ: 532, mens: 505, womens: 455, distToPin: 198, front: 184, back: 215 },
  { hole: 8, par: 4, handicap: 11, champ: 387, mens: 362, womens: 318, distToPin: 163, front: 149, back: 178 },
  { hole: 9, par: 4, handicap: 13, champ: 405, mens: 380, womens: 335, distToPin: 141, front: 127, back: 155 },
  { hole: 10, par: 4, handicap: 8, champ: 420, mens: 395, womens: 348, distToPin: 168, front: 154, back: 183 },
  { hole: 11, par: 3, handicap: 16, champ: 185, mens: 168, womens: 135, distToPin: 152, front: 138, back: 166 },
  { hole: 12, par: 5, handicap: 2, champ: 558, mens: 530, womens: 478, distToPin: 225, front: 210, back: 240 },
  { hole: 13, par: 4, handicap: 10, champ: 392, mens: 368, womens: 322, distToPin: 137, front: 123, back: 151 },
  { hole: 14, par: 4, handicap: 4, champ: 442, mens: 418, womens: 372, distToPin: 189, front: 175, back: 204 },
  { hole: 15, par: 3, handicap: 18, champ: 155, mens: 138, womens: 108, distToPin: 112, front: 98, back: 126 },
  { hole: 16, par: 5, handicap: 6, champ: 525, mens: 498, womens: 448, distToPin: 205, front: 191, back: 220 },
  { hole: 17, par: 4, handicap: 12, champ: 378, mens: 355, womens: 310, distToPin: 148, front: 134, back: 162 },
  { hole: 18, par: 4, handicap: 14, champ: 410, mens: 388, womens: 342, distToPin: 176, front: 162, back: 191 },
];

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

const GolfGPS: React.FC = () => {
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
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 py-6">
        <div className="flex items-center gap-3">
          <Crosshair className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Golf GPS</h1>
            <p className="text-sm text-golf-200">Range Finder &amp; Course Info</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {/* Main Distance Display */}
        <div className="relative flex flex-col items-center rounded-2xl bg-golf-900 p-6 shadow-lg">
          {/* Outer ring */}
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-golf-700 to-golf-500 shadow-xl">
            {/* Middle ring */}
            <div className="flex h-44 w-44 items-center justify-center rounded-full bg-golf-900 shadow-inner">
              {/* Inner display */}
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

          {/* Front / Back indicators */}
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

          {/* Hole selector - horizontal scroll */}
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

          {/* Hole details */}
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

          {/* Tee yardages */}
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
          {/* Running total */}
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
};

export default GolfGPS;
