import { useState, useMemo, useEffect } from 'react';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { mockCourses, type GolfCourse } from '../data/mockCourses';
import { getDistanceMiles } from '../utils/distance';
import CourseCard from '../components/CourseCard';
import CourseDetailSheet from '../components/CourseDetailSheet';
import LocationPrompt from '../components/LocationPrompt';

type SortMode = 'nearest' | 'top-rated' | 'best-value';

export default function FindCourses() {
  const { latitude, longitude, loading, error, granted, requestLocation } = useGeolocation();
  const [sortMode, setSortMode] = useState<SortMode>('nearest');
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const coursesWithDistance = useMemo(() => {
    return mockCourses.map((course) => ({
      course,
      distance:
        latitude && longitude
          ? getDistanceMiles(latitude, longitude, course.lat, course.lng)
          : null,
    }));
  }, [latitude, longitude]);

  const sortedCourses = useMemo(() => {
    const sorted = [...coursesWithDistance];
    switch (sortMode) {
      case 'nearest':
        sorted.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        break;
      case 'top-rated':
        sorted.sort((a, b) => b.course.rating - a.course.rating);
        break;
      case 'best-value':
        sorted.sort(
          (a, b) => a.course.priceRange.length - b.course.priceRange.length
        );
        break;
    }
    return sorted;
  }, [coursesWithDistance, sortMode]);

  const selectedDistance = selectedCourse
    ? coursesWithDistance.find((c) => c.course.id === selectedCourse.id)?.distance ?? null
    : null;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-golf-800 to-golf-600 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white mt-2">Find Courses</h1>
        <p className="text-golf-200 text-sm mt-1">
          {granted && latitude
            ? error
              ? 'Showing Bay Area courses'
              : 'Courses near your location'
            : 'Discover nearby golf courses'}
        </p>
      </div>

      {/* Location prompt or status */}
      <div className="mt-4">
        {!granted ? (
          <LocationPrompt onRequest={requestLocation} loading={loading} />
        ) : error ? (
          <div className="mx-4 mb-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl">
            <MapPin size={16} />
            {error}
          </div>
        ) : null}
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
        {sortedCourses.map(({ course, distance }) => (
          <CourseCard
            key={course.id}
            course={course}
            distance={distance}
            onSelect={setSelectedCourse}
          />
        ))}
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
