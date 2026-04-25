import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Transform a user-provided video URL into an embeddable URL.
 * Currently supports YouTube watch and youtu.be short links.
 * Returns the embed URL string or null if unsupported/invalid.
 */
export function transformEmbedUrl(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;

  let input = raw.trim();
  // Try to ensure protocol exists for URL parsing
  if (!/^https?:\/\//i.test(input)) {
    input = 'https://' + input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    // YouTube long links: youtube.com/watch?v=VIDEO_ID
    if (host.endsWith('youtube.com')) {
      // handle /watch
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        if (v && /^[A-Za-z0-9_-]+$/.test(v)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
        }
        return null;
      }

      // handle /shorts/VIDEO_ID or other direct paths
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'shorts' || parts[0] === 'embed')) {
        const id = parts[1];
        if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
        }
        return null;
      }
    }

    // youtu.be short links: youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = parts[0];
      if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      return null;
    }

    // Not supported provider
    return null;
  } catch (e) {
    return null;
  }
}
