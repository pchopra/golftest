import { useState, useEffect } from 'react';

const CACHE_KEY = 'golf-course-images';

/** Read the full cache object from localStorage */
function readCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Write a single entry into the cache */
function writeCache(key: string, url: string) {
  const cache = readCache();
  cache[key] = url;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

/**
 * Fetches the real Wikipedia thumbnail for a golf course by name.
 * Uses the Wikipedia search API (CORS-enabled via origin=*) so that
 * partial / informal names still match the right article.
 * Results are cached in localStorage so each course is fetched only once.
 */
export function useCourseImage(courseName: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => readCache()[courseName] ?? null);
  const [loading, setLoading] = useState(!imageUrl);

  useEffect(() => {
    // Already have a cached URL (including from initial state)
    if (imageUrl) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Strip parentheticals like "(South)" and add "golf" to improve search
    const cleaned = courseName.replace(/\s*\([^)]+\)/g, '').trim();
    const query = cleaned.toLowerCase().includes('golf') ? cleaned : `${cleaned} golf`;

    const apiUrl =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1` +
      `&prop=pageimages&pithumbsize=800&format=json&origin=*`;

    fetch(apiUrl)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const pages = data.query?.pages;
        if (!pages) return;
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        const thumb = page?.thumbnail?.source;
        if (thumb) {
          writeCache(courseName, thumb);
          setImageUrl(thumb);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseName, imageUrl]);

  return { imageUrl, loading };
}
