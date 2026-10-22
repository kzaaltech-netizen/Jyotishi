import React, { useId } from 'react';

// Friendly illustrated portraits of the six rishi guides (original drawings).
// Warm skin tones, soft smiles and open eyes so it feels like talking to a person.

const LOOKS = {
  // Parashara: elder with a long white beard, white jata, tripundra, rudraksha mala.
  general: { bg: '#F7DDB8', skin: '#E2A878', hair: '#F4F1EC', robe: '#E07A2E', beard: 'long', top: 'bun', tilak: 'tripundra', mala: true },
  // Bhrigu: grey beard, intense brows, saffron shawl.
  career: { bg: '#F3D3C2', skin: '#C98A5C', hair: '#D3CEC6', robe: '#B9562B', beard: 'long', top: 'bun', tilak: 'tripundra', brows: 'strong' },
  // Garga: kind face, short grey beard, ochre robe.
  wealth: { bg: '#F1E3B6', skin: '#DDA16E', hair: '#C9C3BA', robe: '#C9902A', beard: 'short', top: 'bun', tilak: 'line', mala: true },
  // Vasishtha: gentle elder, white beard, cream robe with saffron sash.
  union: { bg: '#F6D6D2', skin: '#E3AD82', hair: '#F2EFEA', robe: '#EFE2C8', sash: '#D9622B', beard: 'medium', top: 'bun', tilak: 'line' },
  // Jaimini: younger scholar, dark hair and beard.
  abundance: { bg: '#D7E7DA', skin: '#C7895B', hair: '#3A2A22', robe: '#9C3F2C', beard: 'short', top: 'bun', tilak: 'line' },
  // Varahamihira: astronomer with a saffron turban and trimmed grey beard.
  forecast: { bg: '#D8E2F0', skin: '#D49866', hair: '#BDB6AD', robe: '#2F5D6B', beard: 'short', top: 'turban', turban: '#E08A2E', tilak: 'tripundra' },
};

function Emblem({ kind }) {
  const ring = <circle r="6.5" fill="#FFF8EE" stroke="#C8902E" strokeWidth="1.2" />;
  switch (kind) {
    case 'general':
      return (
        <g transform="translate(50.5 50)">
          {ring}
          <path d="M0-4.5 1.3-1.3 4.5 0 1.3 1.3 0 4.5-1.3 1.3-4.5 0-1.3-1.3Z" fill="#C8902E" />
        </g>
      );
    case 'career':
      return (
        <g transform="translate(50.5 50)">
          {ring}
          <rect x="-4.5" y="-2" width="9" height="4" rx="2" fill="none" stroke="#C8902E" strokeWidth="1.2" />
        </g>
      );
    case 'wealth':
      return (
        <g transform="translate(50.5 50)">
          {ring}
          <circle r="4" fill="none" stroke="#C8902E" strokeWidth="1.2" />
          <rect x="-1.3" y="-1.3" width="2.6" height="2.6" fill="#C8902E" />
        </g>
      );
    case 'union':
      return (
        <g transform="translate(50.5 50)" fill="#E07A6E">
          {ring}
          <path d="M0-4.2c1.6 1.7 1.6 3.8 0 5.6-1.6-1.8-1.6-3.9 0-5.6Z" />
          <path d="M-.8 1.6C-3.6 1.4-4.7-.4-4.9-2.3-2.7-2.1-1.2-.9-.8 1.6Z" />
          <path d="M.8 1.6C3.6 1.4 4.7-.4 4.9-2.3 2.7-2.1 1.2-.9.8 1.6Z" />
        </g>
      );
    case 'abundance':
      return (
        <g transform="translate(50.5 50)">
          {ring}
          <path d="M-3.5 3 0-3.5 3.5 3Z" fill="none" stroke="#C8902E" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      );
    case 'forecast':
      return (
        <g transform="translate(50.5 50)" stroke="#C8902E" strokeWidth="1.1" strokeLinecap="round">
          {ring}
          <circle r="2.4" fill="#F0B44C" stroke="none" />
          <path d="M0-5v1M0 4v1M-5 0h1M4 0h1M-3.5-3.5l.7.7M2.8 2.8l.7.7M-3.5 3.5l.7-.7M2.8-2.8l.7-.7" />
        </g>
      );
    default:
      return null;
  }
}

export default function GuruAvatar({ guide, size = 36, className = '', emblem = true }) {
  const L = LOOKS[guide.mode] || LOOKS.general;
  const clip = useId();
  const showEmblem = emblem && size >= 40;

  return (
    <span className={`inline-flex shrink-0 rounded-full shadow-soft ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="4 3 56 56" width={size} height={size}>
        <defs>
          <clipPath id={clip}>
            <circle cx="32" cy="31" r="28" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <rect width="64" height="64" fill={L.bg} />

          {/* robe and shoulders */}
          <path d="M6 64c1.5-11 10-17.5 26-17.5S56.5 53 58 64Z" fill={L.robe} />
          <path d="M22 48.5c3 6 7 9.5 10 15.5" stroke="rgba(0,0,0,.12)" strokeWidth="2" fill="none" />
          {L.sash && <path d="M14 51 40 64h-9L10 55Z" fill={L.sash} />}

          {/* neck */}
          <path d="M27 40h10v8c-1.5 1.6-3.2 2.4-5 2.4s-3.5-.8-5-2.4Z" fill={L.skin} />
          <path d="M27 44.5c3 1.4 7 1.4 10 0" stroke="rgba(0,0,0,.12)" strokeWidth="1.2" fill="none" />

          {/* mala beads */}
          {L.mala && (
            <g fill="#7A3B22">
              {[-9, -6, -3, 0, 3, 6, 9].map((x, i) => (
                <circle key={i} cx={32 + x} cy={49.5 + Math.abs(x) * -0.25 + (Math.abs(x) < 4 ? 1.2 : 0)} r="1.25" />
              ))}
            </g>
          )}

          {/* ears */}
          <ellipse cx="20.3" cy="28.5" rx="2.2" ry="3.2" fill={L.skin} />
          <ellipse cx="43.7" cy="28.5" rx="2.2" ry="3.2" fill={L.skin} />

          {/* head */}
          <ellipse cx="32" cy="27" rx="11.5" ry="13" fill={L.skin} />

          {/* hair: knot or turban */}
          {L.top === 'turban' ? (
            <g>
              <path d="M19.5 22.5C20 14 25.5 10 32 10s12 4 12.5 12.5c-3-2.2-7.5-3.4-12.5-3.4s-9.5 1.2-12.5 3.4Z" fill={L.turban} />
              <path d="M22 18c4-2.6 16-2.6 20 0" stroke="rgba(0,0,0,.15)" strokeWidth="1.2" fill="none" />
              <circle cx="32" cy="14.5" r="1.6" fill="#FFF3D6" />
            </g>
          ) : (
            <g fill={L.hair}>
              <circle cx="32" cy="10.5" r="5.2" />
              <path d="M20.6 25c-.4-7.8 4.6-12.6 11.4-12.6S43.8 17.2 43.4 25c-2.6-4.4-6.6-6.4-11.4-6.4S23.2 20.6 20.6 25Z" />
            </g>
          )}

          {/* brows */}
          <path
            d={L.brows === 'strong' ? 'M24.6 23.2c1.6-1.3 3.6-1.5 5.2-.6M34.2 22.6c1.6-.9 3.6-.7 5.2.6' : 'M25 23.4c1.4-.9 3.2-1 4.6-.3M34.4 23.1c1.4-.7 3.2-.6 4.6.3'}
            stroke={L.hair === '#3A2A22' ? '#2A1D17' : '#9E968C'}
            strokeWidth={L.brows === 'strong' ? 1.6 : 1.2}
            strokeLinecap="round"
            fill="none"
          />

          {/* eyes: open, warm */}
          <g fill="#2B1C14">
            <ellipse cx="27.3" cy="26.6" rx="1.35" ry="1.6" />
            <ellipse cx="36.7" cy="26.6" rx="1.35" ry="1.6" />
          </g>
          <g fill="#FFFFFF">
            <circle cx="27.8" cy="26" r=".45" />
            <circle cx="37.2" cy="26" r=".45" />
          </g>
          {/* smile lines at the eyes */}
          <path d="M24.4 27.6c.4.6.9 1 1.4 1.2M39.6 27.6c-.4.6-.9 1-1.4 1.2" stroke="rgba(0,0,0,.18)" strokeWidth=".8" strokeLinecap="round" fill="none" />

          {/* cheeks */}
          <ellipse cx="25" cy="31" rx="2.2" ry="1.4" fill="#E9806A" opacity=".28" />
          <ellipse cx="39" cy="31" rx="2.2" ry="1.4" fill="#E9806A" opacity=".28" />

          {/* nose */}
          <path d="M32 27.5c-.5 1.8-1 3-1.6 3.8.9.5 2.2.5 3.2 0" stroke="rgba(0,0,0,.2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* beard + moustache */}
          <path
            d={
              L.beard === 'long'
                ? 'M20.8 29c.6 9.8 4.8 18 11.2 21 6.4-3 10.6-11.2 11.2-21-1.6 3.4-4 5-6.2 5.4-1.5-1.3-3.2-1.9-5-1.9s-3.5.6-5 1.9c-2.2-.4-4.6-2-6.2-5.4Z'
                : L.beard === 'medium'
                ? 'M20.8 29c.8 7.6 4.6 13.2 11.2 15.4 6.6-2.2 10.4-7.8 11.2-15.4-1.6 3.4-4 5-6.2 5.4-1.5-1.3-3.2-1.9-5-1.9s-3.5.6-5 1.9c-2.2-.4-4.6-2-6.2-5.4Z'
                : 'M21.6 30c1 5.4 4.4 9 10.4 10.4 6-1.4 9.4-5 10.4-10.4-1.6 2.6-3.8 3.8-5.8 4.2-1.4-1.1-3-1.6-4.6-1.6s-3.2.5-4.6 1.6c-2-.4-4.2-1.6-5.8-4.2Z'
            }
            fill={L.hair}
          />
          {/* smiling mouth, peeking through the beard */}
          <path d="M29.4 35.8c1.6 1.3 3.6 1.3 5.2 0" stroke="#7A3B2A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* tilak */}
          {L.tilak === 'tripundra' ? (
            <g>
              <path d="M27.5 18.6h9M27.2 20.2h9.6M27.5 21.8h9" stroke="#FFFFFF" strokeWidth=".9" strokeLinecap="round" opacity=".95" />
              <circle cx="32" cy="20.2" r="1.1" fill="#C0392B" />
            </g>
          ) : (
            <path d="M32 18.2v4.2" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </g>
        {showEmblem && <Emblem kind={guide.mode} />}
      </svg>
    </span>
  );
}
