import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Transform a user-provided video URL into an embeddable URL.
 * Supports YouTube, youtu.be, Vimeo, and TikTok.
 * Returns the embed URL string or null if unsupported/invalid.
 */
export function transformEmbedUrl(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;

  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) {
    input = 'https://' + input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    // YouTube long links: youtube.com/watch?v=VIDEO_ID
    if (host.endsWith('youtube.com')) {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        if (v && /^[A-Za-z0-9_-]+$/.test(v)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
        }
        return null;
      }

      // handle /shorts/VIDEO_ID or /embed/VIDEO_ID
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'shorts' || parts[0] === 'embed')) {
        const id = parts[1];
        if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
          return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
        }
        return null;
      }

      // Direct /v/VIDEO_ID or /embed/VIDEO_ID patterns
      const embedMatch = url.pathname.match(/^\/(?:embed|v)\/([A-Za-z0-9_-]+)/);
      if (embedMatch) {
        return `https://www.youtube.com/embed/${encodeURIComponent(embedMatch[1])}`;
      }

      return null;
    }

    // youtu.be short links
    if (host === 'youtu.be') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = parts[0];
      if (id && /^[A-Za-z0-9_-]+$/.test(id)) {
        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      return null;
    }

    // Vimeo links
    if (host.endsWith('vimeo.com')) {
      // vimeo.com/VIDEO_ID
      const parts = url.pathname.split('/').filter(Boolean);
      const id = parts[0];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
      // vimeo.com/channels/staffpicks/VIDEO_ID etc.
      if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1])) {
        return `https://player.vimeo.com/video/${parts[parts.length - 1]}`;
      }
      return null;
    }

    // TikTok links — pass through for iframe embedding
    if (host.endsWith('tiktok.com')) {
      return input;
    }

    return null;
  } catch {
    return null;
  }
}