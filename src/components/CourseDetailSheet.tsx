import { useState } from 'react';
import { X, Star, Phone, Globe, Navigation, Flag, Clock } from 'lucide-react';
import type { GolfCourse } from '../data/mockCourses';
import { getCourseImageUrl } from '../data/courseImages';

interface Props {
  course: GolfCourse;
  distance: number | null;
  onClose: () => void;
}

export default function CourseDetailSheet({ course, distance, onClose }: Props) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {/* Header image with gradient fallback */}
        <div className={`mx-4 mt-2 h-36 rounded-2xl overflow-hidden relative ${imgError ? `bg-gradient-to-br ${course.imageGradient} flex items-center justify-center` : ''}`}>
          {!imgError ? (
            <img
              src={getCourseImageUrl(course.id)}
              alt={course.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Flag size={48} className="text-white/30" />
          )}
          <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full">
            {course.priceRange}
          </div>
        </div>

        <div className="p-4 pb-8">
          <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{course.city}, {course.state}</p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold">{course.rating}</span>
              <span className="text-gray-400">({course.reviewCount.toLocaleString()})</span>
            </div>
            {distance !== null && (
              <div className="flex items-center gap-1 text-sm text-golf-700">
                <Navigation size={14} />
                <span className="font-semibold">{distance} miles away</span>
              </div>
            )}
          </div>

          {/* Course info */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{course.holes}</p>
              <p className="text-xs text-gray-500">Holes</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{course.par}</p>
              <p className="text-xs text-gray-500">Par</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{course.yardage.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Yards</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mt-4">{course.description}</p>

          {/* Amenities */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {course.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-golf-50 text-golf-800 px-3 py-1.5 rounded-full font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-4 space-y-2">
            <a
              href={`tel:${course.phone}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Phone size={18} className="text-gray-400" />
              {course.phone}
            </a>
            <a
              href={course.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Globe size={18} className="text-gray-400" />
              Visit Website
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${course.lat},${course.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Navigation size={18} />
              Directions
            </a>
            <a
              href={course.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-golf-700 text-white text-sm font-semibold rounded-xl hover:bg-golf-800 transition-colors"
            >
              <Clock size={18} />
              Book Tee Time
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
