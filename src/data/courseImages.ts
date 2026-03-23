// Curated golf course images from Unsplash (free, no attribution required)
// Each URL is a real golf course / scenic fairway photo.
// Format: images.unsplash.com/photo-{id}?w=800&h=400&fit=crop&q=80

const GOLF_COURSE_PHOTOS = [
  // Aerial view of golf course with water hazard
  'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=400&fit=crop&q=80',
  // Lush green fairway with trees
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop&q=80',
  // Golf course landscape
  'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=400&fit=crop&q=80',
  // Scenic course at golden hour
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop&q=80',
  // Green fairway panorama
  'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=400&fit=crop&q=80',
  // Rolling green hills
  'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=400&fit=crop&q=80',
  // Course with mountain backdrop
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=400&fit=crop&q=80',
  // Sunset over fairway
  'https://images.unsplash.com/photo-1506318164473-2dab10d73e39?w=800&h=400&fit=crop&q=80',
  // Manicured green with bunkers
  'https://images.unsplash.com/photo-1580144131916-5a5673b75e30?w=800&h=400&fit=crop&q=80',
  // Oceanside course
  'https://images.unsplash.com/photo-1605183830295-98aad6e6e20a?w=800&h=400&fit=crop&q=80',
  // Tree-lined fairway
  'https://images.unsplash.com/photo-1632670468613-4cf649c42f02?w=800&h=400&fit=crop&q=80',
  // Morning mist on course
  'https://images.unsplash.com/photo-1609783643543-af0a0e68bf47?w=800&h=400&fit=crop&q=80',
  // Desert course landscape
  'https://images.unsplash.com/photo-1559304022-afbf28f53c43?w=800&h=400&fit=crop&q=80',
  // Links-style course
  'https://images.unsplash.com/photo-1621405512324-14e3fb1e743c?w=800&h=400&fit=crop&q=80',
  // Elevated tee box view
  'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800&h=400&fit=crop&q=80',
];

/**
 * Returns a deterministic image URL for a given course ID.
 * Uses a simple hash to pick from the pool so each course always
 * gets the same image.
 */
export function getCourseImageUrl(courseId: string): string {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash * 31 + courseId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % GOLF_COURSE_PHOTOS.length;
  return GOLF_COURSE_PHOTOS[idx];
}
