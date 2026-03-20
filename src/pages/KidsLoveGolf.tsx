import React, { useState } from "react";
import {
  Heart,
  BookOpen,
  ScrollText,
  GraduationCap,
  Trophy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface Tip {
  title: string;
  description: string;
}

interface CoachingProgram {
  title: string;
  ages: string;
  schedule: string;
  price: string;
  link: string;
}

interface Tournament {
  title: string;
  date: string;
  ages: string;
  scope: string;
  link: string;
}

interface Rule {
  title: string;
  description: string;
}

const learningTips: Tip[] = [
  {
    title: "The Perfect Grip",
    description:
      "Hold the club with your fingers, not your palms. A relaxed grip lets the club swing freely and gives you more control over every shot.",
  },
  {
    title: "Stance & Posture",
    description:
      "Stand tall with your feet shoulder-width apart, then bend slightly at the hips. Good posture keeps your swing balanced and powerful from start to finish.",
  },
  {
    title: "The Putting Stroke",
    description:
      "Keep your wrists quiet and rock your shoulders like a pendulum. A smooth, steady stroke rolls the ball right into the cup.",
  },
  {
    title: "Chipping Made Easy",
    description:
      "Use a narrow stance and let the club do the work. A simple back-and-through motion will get you up and down like a champ.",
  },
  {
    title: "Golf Etiquette",
    description:
      "Always be respectful on the course by staying quiet during others' shots and repairing your divots. Being a great playing partner is just as important as a great swing.",
  },
];

const golfRules: Rule[] = [
  {
    title: "Tee Box Rules",
    description:
      "Always place your tee between or behind the tee markers, never in front of them. You get to pick any spot between the markers that feels comfortable.",
  },
  {
    title: "On the Green",
    description:
      "Use a ball marker to mark your ball when it's on the green. Never walk on the imaginary line between another player's ball and the hole.",
  },
  {
    title: "Out of Bounds",
    description:
      "If your ball goes past the white stakes, it's out of bounds. You'll need to play another ball from where you hit the last one and add a penalty stroke.",
  },
  {
    title: "Water Hazards",
    description:
      "When your ball splashes into a pond or stream, you can drop a new ball near where it went in. You add one penalty stroke to your score and keep playing.",
  },
  {
    title: "Pace of Play",
    description:
      "Keep up with the group ahead of you and be ready to hit when it's your turn. If you lose a ball, don't search too long - drop a new one and keep the fun going.",
  },
];

const coachingPrograms: CoachingProgram[] = [
  {
    title: "Junior Golf Academy",
    ages: "Ages 6-12",
    schedule: "Saturday mornings",
    price: "$25/session",
    link: "https://www.firsttee.org",
  },
  {
    title: "Teen Golf Clinic",
    ages: "Ages 13-17",
    schedule: "Weekday evenings",
    price: "$35/session",
    link: "https://www.pga.com/junior",
  },
  {
    title: "First Tee Program",
    ages: "Ages 5-18",
    schedule: "Free introductory classes",
    price: "Free",
    link: "https://www.firsttee.org",
  },
  {
    title: "PGA Junior League",
    ages: "Ages 13 & under",
    schedule: "Team-based, Spring season",
    price: "Varies",
    link: "https://www.pga.com/junior",
  },
];

const tournaments: Tournament[] = [
  {
    title: "Junior Club Championship",
    date: "Mar 28, 2026",
    ages: "Ages 10-17",
    scope: "Local courses",
    link: "https://www.uskidsgolf.org",
  },
  {
    title: "First Tee Spring Classic",
    date: "Apr 5, 2026",
    ages: "Ages 7-15",
    scope: "Regional",
    link: "https://www.firsttee.org",
  },
  {
    title: "US Kids Golf Local Tour",
    date: "Apr 12, 2026",
    ages: "Ages 6-14",
    scope: "Local",
    link: "https://www.uskidsgolf.org",
  },
  {
    title: "Drive Chip & Putt Qualifier",
    date: "Apr 19, 2026",
    ages: "Ages 7-15",
    scope: "National qualifier",
    link: "https://www.drivechipandputt.com",
  },
];

type SectionKey = "tips" | "rules" | "coaching" | "tournaments";

const KidsLoveGolf: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    tips: true,
    rules: false,
    coaching: false,
    tournaments: false,
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-golf-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-700 to-emerald-500 px-6 pt-14 pb-10 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-amber-300 fill-amber-300" />
          <h1 className="text-3xl font-extrabold tracking-tight">KidsLoveGolf</h1>
          <Heart className="w-8 h-8 text-amber-300 fill-amber-300" />
        </div>
        <p className="text-golf-100 text-lg font-medium">
          Growing the Next Generation of Golfers
        </p>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto">
        {/* Learning Tips Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-amber-400">
          <button
            onClick={() => toggleSection("tips")}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-golf-900">Learning Tips</h2>
            </div>
            {openSections.tips ? (
              <ChevronUp className="w-5 h-5 text-golf-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-golf-500" />
            )}
          </button>
          {openSections.tips && (
            <div className="px-5 pb-5 space-y-3">
              {learningTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                >
                  <h3 className="font-semibold text-golf-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-golf-600 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Golf Rules Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-golf-500">
          <button
            onClick={() => toggleSection("rules")}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-golf-100 p-2 rounded-xl">
                <ScrollText className="w-6 h-6 text-golf-600" />
              </div>
              <h2 className="text-lg font-bold text-golf-900">Golf Rules for Kids</h2>
            </div>
            {openSections.rules ? (
              <ChevronUp className="w-5 h-5 text-golf-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-golf-500" />
            )}
          </button>
          {openSections.rules && (
            <div className="px-5 pb-5 space-y-3">
              {golfRules.map((rule, index) => (
                <div
                  key={index}
                  className="bg-golf-50 rounded-xl p-4 border border-golf-200"
                >
                  <h3 className="font-semibold text-golf-800 mb-1">{rule.title}</h3>
                  <p className="text-sm text-golf-600 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coaching Near You Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-sky-400">
          <button
            onClick={() => toggleSection("coaching")}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="text-lg font-bold text-golf-900">Coaching Near You</h2>
            </div>
            {openSections.coaching ? (
              <ChevronUp className="w-5 h-5 text-golf-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-golf-500" />
            )}
          </button>
          {openSections.coaching && (
            <div className="px-5 pb-5 space-y-3">
              {coachingPrograms.map((program, index) => (
                <div
                  key={index}
                  className="bg-sky-50 rounded-xl p-4 border border-sky-200"
                >
                  <h3 className="font-semibold text-golf-800 mb-1">{program.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      {program.ages}
                    </span>
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {program.schedule}
                    </span>
                    <span className="text-xs font-medium bg-golf-100 text-golf-700 px-2 py-0.5 rounded-full">
                      {program.price}
                    </span>
                  </div>
                  <a
                    href={program.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    Find Near Me
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kids Tournaments Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-rose-400">
          <button
            onClick={() => toggleSection("tournaments")}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-xl">
                <Trophy className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-lg font-bold text-golf-900">Kids Tournaments</h2>
            </div>
            {openSections.tournaments ? (
              <ChevronUp className="w-5 h-5 text-golf-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-golf-500" />
            )}
          </button>
          {openSections.tournaments && (
            <div className="px-5 pb-5 space-y-3">
              {tournaments.map((tournament, index) => (
                <div
                  key={index}
                  className="bg-rose-50 rounded-xl p-4 border border-rose-200"
                >
                  <h3 className="font-semibold text-golf-800 mb-1">
                    {tournament.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {tournament.date}
                    </span>
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {tournament.ages}
                    </span>
                    <span className="text-xs font-medium bg-golf-100 text-golf-700 px-2 py-0.5 rounded-full">
                      {tournament.scope}
                    </span>
                  </div>
                  <a
                    href={tournament.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Register
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fun Fact Banner */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl p-5 shadow-md">
          <p className="text-golf-900 font-bold text-center text-sm leading-relaxed">
            Did you know? Tiger Woods shot a 48 for 9 holes when he was just 3 years
            old!
          </p>
        </div>
      </div>
    </div>
  );
};

export default KidsLoveGolf;
