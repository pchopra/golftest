import { useState, useMemo, useEffect, useCallback } from 'react';
import { MapPin, SlidersHorizontal, Search, Flame, Calendar, ExternalLink } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { mockCourses, type GolfCourse } from '../data/mockCourses';
import { hotDeals } from '../data/hotDeals';
import { getCoordinatesForZip } from '../data/zipCoordinates';
import { getDistanceMiles } from '../utils/distance';
import CourseCard from '../components/CourseCard';
import CourseDetailSheet from '../components/CourseDetailSheet';
import LocationPrompt from '../components/LocationPrompt';
import HotDealCard from '../components/HotDealCard';

type SortMode = 'nearest' | 'top-rated' | 'best-value';
type RadiusFilter = 10 | 25 | 50 | null;

export default function FindCourses() {
  const { latitude, longitude, loading, error, granted, requestLocation } = useGeolocation();
  const [sortMode, setSortMode] = useState<SortMode>('nearest');
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [zipCoords, setZipCoords] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>(25);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // The effective lat/lng — zip code overrides geolocation
  const effectiveLat = zipCoords?.lat ?? latitude;
  const effectiveLng = zipCoords?.lng ?? longitude;

  const isZipCode = (value: string) => /^\d{5}$/.test(value.trim());

  const handleSearch = useCallback(() => {
    const query = searchQuery.trim();
    if (!query) return;

    if (isZipCode(query)) {
      // Zip code search
      const coords = getCoordinatesForZip(query);
      if (coords) {
        setZipCoords(coords);
        setSearchError('');
        setNameFilter('');
      } else {
        setSearchError('Invalid zip code. Please enter a valid US zip code.');
        setZipCoords(null);
      }
    } else {
      // Name search — filter courses by name
      setNameFilter(query.toLowerCase());
      setSearchError('');
    }
  }, [searchQuery]);

  const clearNameFilter = useCallback(() => {
    setNameFilter('');
    setSearchQuery('');
  }, []);

  const coursesWithDistance = useMemo(() => {
    return mockCourses.map((course) => ({
      course,
      distance:
        effectiveLat && effectiveLng
          ? getDistanceMiles(effectiveLat, effectiveLng, course.lat, course.lng)
          : null,
    }));
  }, [effectiveLat, effectiveLng]);

  const sortedCourses = useMemo(() => {
    let filtered = [...coursesWithDistance];

    // If searching by name, filter by name match (ignores radius)
    if (nameFilter) {
      filtered = filtered.filter(({ course }) =>
        course.name.toLowerCase().includes(nameFilter) ||
        course.city.toLowerCase().includes(nameFilter)
      );
    } else if (effectiveLat && effectiveLng && radiusFilter) {
      // Filter by radius when any location is available
      filtered = filtered.filter(
        ({ distance }) => distance !== null && distance <= radiusFilter
      );
    }

    switch (sortMode) {
      case 'nearest':
        filtered.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        break;
      case 'top-rated':
        filtered.sort((a, b) => b.course.rating - a.course.rating);
        break;
      case 'best-value':
        filtered.sort(
          (a, b) => a.course.priceRange.length - b.course.priceRange.length
        );
        break;
    }
    return filtered;
  }, [coursesWithDistance, sortMode, effectiveLat, effectiveLng, radiusFilter, nameFilter]);

  // Check if the name search found no results — we'll offer a Google search link
  const showGoogleFallback = nameFilter && sortedCourses.length === 0;
  const googleSearchUrl = nameFilter
    ? `https://www.google.com/search?q=${encodeURIComponent(nameFilter + ' golf course tee times')}`
    : '';

  // Nearest courses fallback — shown when radius filter yields no results
  const nearestFallback = useMemo(() => {
    if (sortedCourses.length > 0 || (!effectiveLat && !effectiveLng) || !radiusFilter) return [];
    return [...coursesWithDistance]
      .filter(({ distance }) => distance !== null)
      .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
      .slice(0, 3);
  }, [sortedCourses, coursesWithDistance, effectiveLat, effectiveLng, radiusFilter]);

  // Filter hot deals by selected date's day of week and proximity, sorted by distance
  const activeDeals = useMemo(() => {
    const date = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = date.getDay();
    let filtered = hotDeals.filter((deal) => deal.validDays.includes(dayOfWeek));

    if (effectiveLat && effectiveLng) {
      // Only show deals within 50 miles of the user's location
      filtered = filtered
        .map(deal => ({ deal, dist: getDistanceMiles(effectiveLat!, effectiveLng!, deal.lat, deal.lng) }))
        .filter(({ dist }) => dist <= 50)
        .sort((a, b) => a.dist - b.dist)
        .map(({ deal }) => deal);
    }
    return filtered;
  }, [selectedDate, effectiveLat, effectiveLng]);

  const selectedDistance = selectedCourse
    ? coursesWithDistance.find((c) => c.course.id === selectedCourse.id)?.distance ?? null
    : null;

  const locationLabel = nameFilter
    ? `Searching courses by name`
    : zipCoords
    ? radiusFilter
      ? `Courses within ${radiusFilter} mi of ${zipCoords.city}`
      : `Showing all courses near ${zipCoords.city}`
    : granted && latitude
    ? error
      ? 'Showing all courses'
      : 'Courses near your location'
    : 'Search by zip code or course name';

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-golf-800 to-golf-600 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white mt-2">Find Courses</h1>
        <p className="text-golf-200 text-sm mt-1">{locationLabel}</p>

        {/* Search — zip code or course name */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-golf-300" />
            <input
              type="text"
              placeholder="Zip code or course name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-2.5 bg-white/15 text-white placeholder-golf-300 text-sm rounded-xl border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-white text-golf-800 text-sm font-semibold rounded-xl hover:bg-golf-50 transition-colors flex items-center gap-1.5"
          >
            <Search size={16} />
            Search
          </button>
        </div>
        {searchError && (
          <p className="text-red-300 text-xs mt-1.5 pl-1">{searchError}</p>
        )}
        {nameFilter && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-golf-200">Searching: &quot;{nameFilter}&quot;</span>
            <button onClick={clearNameFilter} className="text-xs text-white/70 underline hover:text-white">Clear</button>
          </div>
        )}

        {/* Radius filter — visible when any location is available */}
        {(zipCoords || (granted && latitude)) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-golf-200 font-medium">Radius:</span>
            {([10, 25, 50] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRadiusFilter(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  radiusFilter === r
                    ? 'bg-white text-golf-800'
                    : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
                }`}
              >
                {r} mi
              </button>
            ))}
            <button
              onClick={() => setRadiusFilter(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                radiusFilter === null
                  ? 'bg-white text-golf-800'
                  : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
              }`}
            >
              All
            </button>
          </div>
        )}
      </div>

      {/* Location prompt */}
      <div className="mt-4">
        {!granted && !zipCoords ? (
          <LocationPrompt onRequest={requestLocation} loading={loading} />
        ) : error && !zipCoords ? (
          <div className="mx-4 mb-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl">
            <MapPin size={16} />
            {error}
          </div>
        ) : null}
      </div>

      {/* Hot Deals Section */}
      <div className="mt-2 mb-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">Hot Tee Time Deals</h2>
          </div>
          <div className="relative flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs text-golf-700 font-semibold bg-golf-50 border border-golf-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-golf-400"
            />
          </div>
        </div>

        {activeDeals.length > 0 ? (
          <div className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
            {activeDeals.map((deal) => {
              const dist =
                effectiveLat && effectiveLng
                  ? getDistanceMiles(effectiveLat, effectiveLng, deal.lat, deal.lng)
                  : null;
              return <HotDealCard key={deal.id} deal={deal} distance={dist} />;
            })}
          </div>
        ) : (
          <div className="mx-4 bg-gray-50 rounded-2xl p-6 flex flex-col items-center">
            <Flame size={24} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              No hot deals available for this date. Try another day!
            </p>
          </div>
        )}
      </div>

      {/* Sort controls */}
      <div className="px-4 mb-4 flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-gray-400" />
        {(['nearest', 'top-rated', 'best-value'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              sortMode === mode
                ? 'bg-golf-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode === 'nearest' ? 'Nearest' : mode === 'top-rated' ? 'Top Rated' : 'Best Value'}
          </button>
        ))}
      </div>

      {/* Course list */}
      <div>
        {sortedCourses.length > 0 ? (
          <>
            {nameFilter && (
              <p className="px-4 mb-2 text-xs text-gray-500">
                {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} matching &quot;{nameFilter}&quot;
              </p>
            )}
            {sortedCourses.map(({ course, distance }) => (
              <CourseCard
                key={course.id}
                course={course}
                distance={distance}
                onSelect={setSelectedCourse}
              />
            ))}
            {nameFilter && (
              <div className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-golf-600 to-emerald-500 flex items-center justify-center shrink-0">
                    <Search size={20} className="text-white/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">Find more courses on Google</p>
                    <p className="text-xs text-gray-500 mt-0.5">See additional results for &quot;{nameFilter}&quot;</p>
                  </div>
                  <a
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-golf-700 text-white text-xs font-semibold rounded-xl hover:bg-golf-800 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Google
                  </a>
                </div>
              </div>
            )}
          </>
        ) : showGoogleFallback ? (
          <div className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gradient header matching CourseCard style */}
            <div className="h-28 bg-gradient-to-br from-golf-600 to-emerald-500 relative flex items-center justify-center">
              <Search size={40} className="text-white/30" />
              <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Web Result
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-base leading-tight capitalize">{nameFilter}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Not in our database — view on Google for details</p>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <ExternalLink size={12} />
                <span>Tee times, reviews &amp; directions available via Google</span>
              </div>

              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 bg-golf-700 text-white text-sm font-semibold rounded-xl hover:bg-golf-800 transition-colors"
              >
                <ExternalLink size={14} />
                Search on Google
              </a>
            </div>
          </div>
        ) : (effectiveLat && effectiveLng) && radiusFilter && nearestFallback.length > 0 ? (
          <>
            <div className="mx-4 mt-2 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-semibold text-amber-800">
                No courses found within {radiusFilter} miles
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Here are the nearest golf courses{zipCoords ? ` to ${zipCoords.city}` : ''}
              </p>
            </div>
            {nearestFallback.map(({ course, distance }) => (
              <CourseCard
                key={course.id}
                course={course}
                distance={distance}
                onSelect={setSelectedCourse}
              />
            ))}
          </>
        ) : null}
      </div>

      {/* Detail sheet */}
      {selectedCourse && (
        <CourseDetailSheet
          course={selectedCourse}
          distance={selectedDistance}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
