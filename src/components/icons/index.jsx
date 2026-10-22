// Jyotishly icon set — original line icons drawn for this app (24×24, round caps).
// Same props as lucide-react (className, strokeWidth, aria-*), so they drop in.
// Vedic motifs where they carry meaning: old Indian coin for tokens, palm-leaf
// manuscript for reading, the kundli diamond for the chart, Surya and Chandra.
import React, { forwardRef } from 'react';

function make(name, children, { fill = false } = {}) {
  const Icon = forwardRef(function Icon({ className = '', strokeWidth = 1.7, ...rest }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={fill ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...rest}
      >
        {children}
      </svg>
    );
  });
  Icon.displayName = name;
  return Icon;
}

/* ── Vedic & app-specific ─────────────────────────────────────────────── */

// Speech bubble with a small star: talking to your guide.
export const MessageCircle = make('MessageCircle', (
  <>
    <path d="M20 11.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.3-.2-3.3-.6L4 20l1.3-3.6C4.5 15 4 13.3 4 11.5 4 7.4 7.6 4 12 4s8 3.4 8 7.5Z" />
    <path d="m12 8.6.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8Z" />
  </>
));

// Old Indian coin with a square centre hole.
export const Coins = make('Coins', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="6" strokeDasharray="1.2 2" />
    <rect x="10" y="10" width="4" height="4" rx=".6" />
  </>
));

// Tara: a four-point star with two small companions.
export const Sparkles = make('Sparkles', (
  <>
    <path d="M10 3.5 11.6 8.4 16.5 10l-4.9 1.6L10 16.5 8.4 11.6 3.5 10l4.9-1.6Z" />
    <path d="M18 14.5v4M16 16.5h4" />
    <path d="M17.5 3.5v2M16.5 4.5h2" />
  </>
));

// Surya: disc with eight rays.
export const Sun = make('Sun', (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </>
));

// Chandra with a tara.
export const Moon = make('Moon', (
  <>
    <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
    <path d="m17.5 4 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5Z" />
  </>
));

// Sun rising over the horizon: "Today".
export const Sunrise = make('Sunrise', (
  <>
    <path d="M7 16a5 5 0 0 1 10 0" />
    <path d="M3 19.5h18M12 4.5v3M5.2 9.2l1.7 1.7M18.8 9.2l-1.7 1.7M2.5 16h2M19.5 16h2" />
  </>
));

// North Indian kundli: square, diagonals and the inner diamond.
export const Diamond = make('Diamond', (
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" />
    <path d="m3.5 3.5 17 17M20.5 3.5l-17 17" opacity=".55" />
  </>
));

// Palm-leaf manuscript: stacked leaves bound with a cord.
export const BookOpen = make('BookOpen', (
  <>
    <rect x="2.5" y="6.5" width="19" height="4.5" rx="2.25" />
    <rect x="2.5" y="13" width="19" height="4.5" rx="2.25" />
    <path d="M7.5 8.75h0M7.5 15.25h0" strokeWidth="2.6" />
    <path d="M10.5 8.75h7.5M10.5 15.25h7.5" opacity=".55" />
    <path d="M7.5 4v3M7.5 17.5V20" />
  </>
));

// Mukut: crown for Pro.
export const Crown = make('Crown', (
  <>
    <path d="M4 17.5 3 8l5 3.5L12 5l4 6.5L21 8l-1 9.5Z" />
    <path d="M4 20.5h16" />
    <circle cx="12" cy="13.5" r="1.2" />
  </>
));

export const Heart = make('Heart', (
  <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />
));

export const Briefcase = make('Briefcase', (
  <>
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18M11 12.5v1.5h2v-1.5" />
  </>
));

export const Hourglass = make('Hourglass', (
  <>
    <path d="M6.5 3.5h11M6.5 20.5h11" />
    <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
    <path d="M9.5 18.5h5" opacity=".6" />
  </>
));

// Dik-chakra: compass with four points.
export const Compass = make('Compass', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </>
));

/* ── General UI ───────────────────────────────────────────────────────── */

export const User = make('User', (
  <>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
  </>
));

export const MapPin = make('MapPin', (
  <>
    <path d="M12 21s6.5-5.8 6.5-11.2a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21Z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </>
));

export const Clock = make('Clock', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>
));

export const Timer = make('Timer', (
  <>
    <circle cx="12" cy="13.5" r="7" />
    <path d="M12 10v3.5l2 1.5M10 3h4M18.5 7l1.2-1.2" />
  </>
));

export const Calendar = make('Calendar', (
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="m12 13.3.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6Z" />
  </>
));

export const Mail = make('Mail', (
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7.5 8 6 8-6" />
  </>
));

export const Lock = make('Lock', (
  <>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
  </>
));

// Gear with eight teeth, like a small chakra.
export const Settings = make('Settings', (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    <circle cx="12" cy="12" r="6.8" />
  </>
));

export const LogOut = make('LogOut', (
  <>
    <path d="M14 4.5H7a2.5 2.5 0 0 0-2.5 2.5v10A2.5 2.5 0 0 0 7 19.5h7" />
    <path d="M11 12h9.5M17 8.5l3.5 3.5-3.5 3.5" />
  </>
));

export const ArrowRight = make('ArrowRight', <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />);
export const ArrowUp = make('ArrowUp', <path d="M12 19.5v-15M6.5 10 12 4.5l5.5 5.5" />);
export const ChevronDown = make('ChevronDown', <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />);
export const ChevronRight = make('ChevronRight', <path d="m9.5 6.5 5.5 5.5-5.5 5.5" />);
export const Check = make('Check', <path d="m5 12.5 4.5 4.5L19 7.5" />);
export const X = make('X', <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />);
export const Plus = make('Plus', <path d="M12 5v14M5 12h14" />);

export const CheckCircle2 = make('CheckCircle2', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.3 2.4 2.4 4.6-5" />
  </>
));

export const AlertCircle = make('AlertCircle', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.8v5M12 16.2h0" />
  </>
));

export const AlertTriangle = make('AlertTriangle', (
  <>
    <path d="M10.3 4.6 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h0" />
  </>
));

export const Info = make('Info', (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.8h0" />
  </>
));

export const Trash2 = make('Trash2', (
  <>
    <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.5h6.4a1.5 1.5 0 0 0 1.5-1.5l.8-12" />
    <path d="M10 11v5.5M14 11v5.5" />
  </>
));

export const Copy = make('Copy', (
  <>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
  </>
));

export const Share2 = make('Share2', (
  <>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
  </>
));

export const Bookmark = make('Bookmark', <path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17l-5.5 4Z" />);

export const Mic = make('Mic', (
  <>
    <rect x="9" y="3" width="6" height="11.5" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
  </>
));

export const Square = make('Square', <rect x="6" y="6" width="12" height="12" rx="2" />);

export const MoreVertical = make('MoreVertical', <path d="M12 5.5h0M12 12h0M12 18.5h0" strokeWidth="3" />);

export const RefreshCw = make('RefreshCw', (
  <>
    <path d="M19.5 9A8 8 0 0 0 5 7.5L3.5 9.5M4.5 15A8 8 0 0 0 19 16.5l1.5-2" />
    <path d="M3.5 4.5v5h5M20.5 19.5v-5h-5" />
  </>
));

export const ListChecks = make('ListChecks', (
  <>
    <path d="m3.5 6 1.5 1.5L8 4.5M3.5 13l1.5 1.5L8 11.5" />
    <path d="M11.5 6h9M11.5 13h9M11.5 19.5h9M4.5 19.5h2" />
  </>
));

// Spinner: a turning arc.
export const Loader2 = make('Loader2', <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5" />);
