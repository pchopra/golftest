import { useState } from 'react';
import {
  Trophy,
  MapPin,
  Tv,
  Monitor,
  Hotel,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type Tour = 'men' | 'women';

interface Player {
  name: string;
  score: string;
}

interface Tournament {
  id: string;
  name: string;
  course: string;
  city: string;
  state: string;
  dates: string;
  purse: string;
  leaderboard: Player[];
}

const mensTournaments: Tournament[] = [
  {
    id: 'players-championship',
    name: 'The Players Championship',
    course: 'TPC Sawgrass',
    city: 'Ponte Vedra Beach',
    state: 'FL',
    dates: 'Mar 20–23, 2026',
    purse: '$25M',
    leaderboard: [
      { name: 'Scottie Scheffler', score: '-12' },
      { name: 'Rory McIlroy', score: '-10' },
      { name: 'Xander Schauffele', score: '-9' },
      { name: 'Collin Morikawa', score: '-8' },
      { name: 'Viktor Hovland', score: '-7' },
    ],
  },
  {
    id: 'valspar-championship',
    name: 'Valspar Championship',
    course: 'Innisbrook Resort',
    city: 'Palm Harbor',
    state: 'FL',
    dates: 'Mar 27–30, 2026',
    purse: '$8.4M',
    leaderboard: [
      { name: 'Sam Burns', score: '-12' },
      { name: 'Justin Thomas', score: '-10' },
      { name: 'Taylor Montgomery', score: '-9' },
      { name: 'Davis Riley', score: '-8' },
      { name: 'Keegan Bradley', score: '-7' },
    ],
  },
];

const womensTournaments: Tournament[] = [
  {
    id: 'jtbc-classic',
    name: 'JTBC Classic',
    course: 'Aviara Golf Club',
    city: 'Carlsbad',
    state: 'CA',
    dates: 'Mar 20–23, 2026',
    purse: '$1.8M',
    leaderboard: [
      { name: 'Nelly Korda', score: '-12' },
      { name: 'Lydia Ko', score: '-10' },
      { name: 'Jin Young Ko', score: '-9' },
      { name: 'Celine Boutier', score: '-8' },
      { name: 'Lilia Vu', score: '-7' },
    ],
  },
  {
    id: 'kia-classic',
    name: 'Kia Classic',
    course: 'Aviara Golf Club',
    city: 'Carlsbad',
    state: 'CA',
    dates: 'Mar 27–30, 2026',
    purse: '$2M',
    leaderboard: [
      { name: 'Rose Zhang', score: '-12' },
      { name: 'Minjee Lee', score: '-10' },
      { name: 'Atthaya Thitikul', score: '-9' },
      { name: 'Charley Hull', score: '-8' },
      { name: 'Hae Ran Ryu', score: '-7' },
    ],
  },
];

const tvCoverage = [
  { network: 'ESPN', schedule: 'Thu–Fri 2:00 PM – 6:00 PM EST' },
  { network: 'CBS', schedule: 'Sat–Sun 1:00 PM – 6:00 PM EST' },
  { network: 'Golf Channel', schedule: 'Daily 9:00 AM – 2:00 PM EST' },
];

const streamingLinks = [
  { label: 'ESPN+', url: 'https://www.espn.com' },
  { label: 'PGA Tour Live', url: 'https://www.pgatour.com' },
  { label: 'YouTube Free Highlights', url: 'https://www.youtube.com/@pgatour' },
];

const nearbyHotels = [
  { name: 'Marriott Resort', price: '$189/night', url: 'https://www.marriott.com' },
  { name: 'Hilton Garden Inn', price: '$129/night', url: 'https://www.hilton.com' },
  { name: 'Holiday Inn Express', price: '$99/night', url: 'https://www.ihg.com' },
];

export default function Tournaments() {
  const [selectedTour, setSelectedTour] = useState<Tour>('men');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tournaments = selectedTour === 'men' ? mensTournaments : womensTournaments;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-golf-50 pt-safe-top pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-5 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Golf Tournaments
        </h1>
        <p className="text-golf-200 mt-1 text-sm">This Week&apos;s Action</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-4">
        <button
          onClick={() => {
            setSelectedTour('men');
            setExpandedId(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedTour === 'men'
              ? 'bg-golf-700 text-white shadow-md'
              : 'bg-white text-golf-700 border border-golf-200'
          }`}
        >
          Men&apos;s Tour
        </button>
        <button
          onClick={() => {
            setSelectedTour('women');
            setExpandedId(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selectedTour === 'women'
              ? 'bg-golf-700 text-white shadow-md'
              : 'bg-white text-golf-700 border border-golf-200'
          }`}
        >
          Women&apos;s Tour
        </button>
      </div>

      {/* Tournament Cards */}
      <div className="px-5 mt-5 space-y-4">
        {tournaments.map((t) => {
          const isExpanded = expandedId === t.id;
          return (
            <div
              key={t.id}
              className="rounded-2xl shadow-md bg-white overflow-hidden transition-all duration-300"
            >
              {/* Card Header — always visible */}
              <button
                onClick={() => toggleExpand(t.id)}
                className="w-full text-left p-4 bg-gradient-to-r from-golf-700 to-golf-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{t.name}</h3>
                    <p className="text-golf-100 text-sm mt-0.5">{t.course}</p>
                    <div className="flex items-center gap-1 text-golf-200 text-xs mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {t.city}, {t.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-3">
                    <span className="text-xs font-medium text-golf-200">{t.dates}</span>
                    <span className="text-sm font-bold text-white mt-1">
                      Purse: {t.purse}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-white mt-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white mt-2" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expandable Details */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 space-y-5">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-golf-700">
                    <MapPin className="w-5 h-5 text-golf-600" />
                    <span className="text-sm font-medium">
                      {t.course}, {t.city}, {t.state}
                    </span>
                  </div>

                  {/* Leaderboard */}
                  <div>
                    <h4 className="text-sm font-bold text-golf-800 mb-2 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-golf-600" />
                      Leaderboard
                    </h4>
                    <div className="bg-golf-50 rounded-xl overflow-hidden">
                      {t.leaderboard.map((player, idx) => (
                        <div
                          key={player.name}
                          className={`flex items-center justify-between px-3 py-2 text-sm ${
                            idx !== t.leaderboard.length - 1 ? 'border-b border-golf-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                idx === 0
                                  ? 'bg-yellow-400 text-yellow-900'
                                  : idx === 1
                                  ? 'bg-gray-300 text-gray-700'
                                  : idx === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-golf-100 text-golf-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-golf-800 font-medium">{player.name}</span>
                          </div>
                          <span className="font-bold text-golf-700">{player.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TV Coverage */}
                  <div>
                    <h4 className="text-sm font-bold text-golf-800 mb-2 flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-golf-600" />
                      TV Coverage
                    </h4>
                    <div className="space-y-2">
                      {tvCoverage.map((item) => (
                        <div
                          key={item.network}
                          className="flex items-center justify-between bg-golf-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm font-semibold text-golf-800">
                            {item.network}
                          </span>
                          <span className="text-xs text-golf-600">{item.schedule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streaming Links */}
                  <div>
                    <h4 className="text-sm font-bold text-golf-800 mb-2 flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-golf-600" />
                      Streaming
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {streamingLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-golf-600 hover:bg-golf-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Nearby Hotels */}
                  <div>
                    <h4 className="text-sm font-bold text-golf-800 mb-2 flex items-center gap-1.5">
                      <Hotel className="w-4 h-4 text-golf-600" />
                      Nearby Hotels
                    </h4>
                    <div className="space-y-2">
                      {nearbyHotels.map((hotel) => (
                        <a
                          key={hotel.name}
                          href={hotel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-gradient-to-r from-golf-50 to-white border border-golf-100 rounded-xl px-4 py-3 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <p className="text-sm font-semibold text-golf-800">{hotel.name}</p>
                            <p className="text-xs text-golf-500">
                              from{' '}
                              <span className="font-bold text-golf-700">{hotel.price}</span>
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-golf-400" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate Links */}
                  <div className="flex gap-2">
                    <a
                      href="#"
                      className="flex-1 text-center bg-gradient-to-r from-golf-700 to-golf-600 text-white text-sm font-semibold py-3 rounded-xl hover:from-golf-800 hover:to-golf-700 transition-all"
                    >
                      Official Merchandise
                    </a>
                    <a
                      href="#"
                      className="flex-1 text-center bg-gradient-to-r from-golf-600 to-golf-500 text-white text-sm font-semibold py-3 rounded-xl hover:from-golf-700 hover:to-golf-600 transition-all"
                    >
                      Tickets &amp; Hospitality
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
