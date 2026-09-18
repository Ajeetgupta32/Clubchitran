/**
 * Resolves media and photo URLs dynamically.
 * - Absolute URLs (Cloudinary, Unsplash, HTTPS) are returned as-is.
 * - Relative URLs (/uploads/...) are prepended with VITE_API_BASE_URL in production,
 *   or kept relative in local development where Vite dev server proxies /uploads.
 *
 * @param {string} url
 * @returns {string}
 */
export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  const rawBase = import.meta.env.VITE_API_BASE_URL;
  if (!rawBase) {
    return url;
  }
  
  const cleanBase = rawBase.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export default resolveImageUrl;
