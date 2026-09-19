export const DEFAULT_ACTIVITY_BANNER = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_PHOTO_PLACEHOLDER = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80';

/**
 * Image error handler to reliably swap broken images with a high quality placeholder.
 */
export const handleImageFallback = (e, fallbackUrl = DEFAULT_PHOTO_PLACEHOLDER) => {
  if (e && e.target) {
    e.target.onerror = null;
    e.target.src = fallbackUrl;
  }
};

/**
 * Resolves media and photo URLs dynamically.
 * - Absolute URLs (HTTPS, external CDNs) are returned as-is.
 * - Relative URLs (/uploads/...) are prepended with VITE_API_BASE_URL in production,
 *   or kept relative in local development where Vite dev server proxies /uploads.
 * - Stored directly on local device storage via Multer.
 *
 * @param {string} url
 * @param {string} fallback
 * @returns {string}
 */
export const resolveImageUrl = (url, fallback = '') => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  const rawBase = import.meta.env.VITE_API_BASE_URL;
  if (rawBase) {
    const cleanBase = rawBase.replace(/\/+$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanPath}`;
  }

  // When deployed to production (e.g. Vercel) without VITE_API_BASE_URL,
  // relative /uploads paths will fail to load from Vercel static hosting.
  if (import.meta.env.PROD && url.startsWith('/uploads/')) {
    return fallback || DEFAULT_PHOTO_PLACEHOLDER;
  }
  
  return url;
};

export default resolveImageUrl;
