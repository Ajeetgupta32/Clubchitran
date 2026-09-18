import { resolveImageUrl } from './imageUrl.js';

/**
 * Utility to reliably download an image from a URL as a file with a custom filename.
 * Handles both local backend static URLs and remote Cloudinary URLs via Blob conversion.
 */
export const downloadImage = async (url, filename = 'club_proof.jpg') => {
  const targetUrl = resolveImageUrl(url);
  try {
    const response = await fetch(targetUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
    return true;
  } catch (error) {
    console.warn('Direct blob download failed, falling back to window.open:', error);
    // Fallback: direct window open or anchor
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }
};

export default downloadImage;
