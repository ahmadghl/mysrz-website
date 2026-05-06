/**
 * Converts any Google Drive share URL to a direct image URL.
 * Also passes through any other URL unchanged.
 *
 * Supported input formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=...
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - Any other URL (returned as-is)
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  // Already a direct uc?export=view link — pass through
  if (url.includes('drive.google.com/uc') && url.includes('export=view')) {
    return url;
  }

  // Format: /file/d/FILE_ID/view
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  // Format: open?id=FILE_ID or uc?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && url.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  }

  return url;
}
