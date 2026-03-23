import { Star, MapPin, Flag } from 'lucide-react';
import type { GolfCourse } from '../data/mockCourses';
import { useCourseImage } from '../hooks/useCourseImage';

interface Props {
  course: GolfCourse;
  distance: number | null;
  onSelect: (course: GolfCourse) => void;
}

export default function CourseCard({ course, distance, onSelect }: Props) {
  const { imageUrl } = useCourseImage(course.name);

  return (
    <div
      onClick={() => onSelect(course)}
      className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Course banner image with gradient fallback */}
      <div className={`h-28 relative bg-gradient-to-br ${course.imageGradient} flex items-center justify-center`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={course.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Flag size={40} className="text-white/30" />
        )}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {course.priceRange}
        </div>
        {course.holes > 18 && (
          <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {course.holes} Holes
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{course.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{course.city}, {course.state}</p>
          </div>
          {distance !== null && (
            <span className="text-xs font-semibold text-golf-700 bg-golf-50 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              {distance} mi
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-900">{course.rating}</span>
            <span className="text-gray-400">({course.reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-gray-400" />
            <span>{course.holes} holes</span>
          </div>
          <span>Par {course.par}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(course.bookingUrl, '_blank');
          }}
          className="w-full mt-3 py-2.5 bg-golf-700 text-white text-sm font-semibold rounded-xl hover:bg-golf-800 transition-colors"
        >
          Book Tee Time
        </button>
      </div>
    </div>
  );
}
