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

/**
 * Formats recipe durations into a compact format (e.g., "1h 20mins" or "30mins")
 * Supports ranges (e.g. "1 hour 15 minutes – 1 hour 20 minutes" -> "1h 15mins – 1h 20mins")
 */
export function formatTimeCompact(timeStr: string | null | undefined, justFirstPart: boolean = false): string {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  
  // Regex to match range separators: – (en-dash), - (hyphen), to
  const rangeMatch = clean.match(/\s*(–|-|\bto\b)\s*/);
  if (!rangeMatch) {
    return formatSingleTimeCompact(clean);
  }
  
  const separator = rangeMatch[0];
  const parts = clean.split(separator);
  const firstPart = parts[0].trim();
  const secondPart = parts[1].trim();
  
  if (justFirstPart) {
    const formattedFirst = formatSingleTimeCompact(firstPart);
    const firstHasUnit = /[a-zA-Z]/.test(formattedFirst);
    if (!firstHasUnit) {
      const formattedSecond = formatSingleTimeCompact(secondPart);
      const unitMatch = formattedSecond.match(/[a-zA-Z]+/);
      if (unitMatch) {
        return `${formattedFirst}${unitMatch[0]}`;
      }
    }
    return formattedFirst;
  }
  
  const formattedFirst = formatSingleTimeCompact(firstPart);
  const formattedSecond = formatSingleTimeCompact(secondPart);
  
  const firstHasUnit = /[a-zA-Z]/.test(formattedFirst);
  const secondHasUnit = /[a-zA-Z]/.test(formattedSecond);
  
  if (!firstHasUnit && secondHasUnit) {
    const unitMatch = formattedSecond.match(/[a-zA-Z]+/);
    if (unitMatch) {
      const unit = unitMatch[0];
      return `${formattedFirst}${unit}${separator}${formattedSecond}`;
    }
  }
  
  return `${formattedFirst}${separator}${formattedSecond}`;
}

function formatSingleTimeCompact(target: string): string {
  let hours = 0;
  let minutes = 0;
  
  // Match hours: numbers followed by h, hr, hrs, hour, hours
  const hourMatch = target.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)\b/i);
  if (hourMatch) {
    hours = parseInt(hourMatch[1], 10);
  }
  
  // Match minutes: numbers followed by m, min, mins, minute, minutes
  const minMatch = target.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  if (minMatch) {
    minutes = parseInt(minMatch[1], 10);
  }
  
  if (!hourMatch && !minMatch) {
    const justNumber = target.match(/^(\d+)$/);
    if (justNumber) {
      minutes = parseInt(justNumber[1], 10);
    } else {
      const decimalHourMatch = target.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
      if (decimalHourMatch) {
        const hVal = parseFloat(decimalHourMatch[1]);
        hours = Math.floor(hVal);
        minutes = Math.round((hVal - hours) * 60);
      } else {
        return target;
      }
    }
  }
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}mins`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}mins`;
  }
  
  return target;
}

/**
 * Formats recipe durations to show just a single time on card layouts
 * rather than a range (e.g. "1 hour 15 minutes – 1 hour 20 minutes" -> "1h 15mins")
 */
export function formatCardTime(timeStr: string | null | undefined): string {
  return formatTimeCompact(timeStr, true);
}