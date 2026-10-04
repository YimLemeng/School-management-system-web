import React from 'react';

export const SchoolLogo = ({ size = 44, className = '', rounded = true, shadow = true }) => {
  const borderRadius = rounded ? Math.round(size * 0.28) : 0;
  const iconSize = Math.round(size * 0.78);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #1d4ed8 100%)',
        boxShadow: shadow ? '0 4px 14px rgba(37, 99, 235, 0.32)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        border: '1.5px solid rgba(255, 255, 255, 0.28)',
        boxSizing: 'border-box',
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={iconSize}
        height={iconSize}
        fill="none"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <g style={{ filter: 'drop-shadow(0px 2px 3px rgba(15, 23, 42, 0.3))' }}>
          {/* Mortarboard Diamond Top */}
          <polygon points="32,11 55,21.5 32,32 9,21.5" fill="#ffffff" />

          {/* Skull Cap Base */}
          <path d="M18 26 V33 C18 39 46 39 46 33 V26" fill="#f8fafc" />
          <path d="M22 28 V33.5 C22 37 42 37 42 33.5 V28" fill="#e2e8f0" />

          {/* Golden Tassel */}
          <circle cx="32" cy="21.5" r="2.2" fill="#fbbf24" />
          <path
            d="M32 21.5 Q47 22.5 49.5 30"
            stroke="#fbbf24"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <polygon points="47.5,30 51.5,30 50.5,38 48.5,38" fill="#f59e0b" />
          <circle cx="49.5" cy="38.5" r="1.3" fill="#f59e0b" />

          {/* Open Book Motif Below */}
          <path
            d="M32 43 C26.5 40 20 40 14 42 C13.4 42.2 13 42.7 13 43.3 L13 48 C13 48.6 13.5 49.1 14.1 48.9 C19.5 47.2 25.5 47.2 31 50.5 L32 51 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <path
            d="M32 43 C37.5 40 44 40 50 42 C50.6 42.2 51 42.7 51 43.3 L51 48 C51 48.6 50.5 49.1 49.9 48.9 C44.5 47.2 38.5 47.2 33 50.5 L32 51 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <line
            x1="32"
            y1="43"
            x2="32"
            y2="51"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};
