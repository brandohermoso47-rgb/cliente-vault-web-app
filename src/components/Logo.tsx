import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'text-only';
  mode?: 'default' | 'bw-light' | 'bw-dark';
}

export default function Logo({ className = '', variant = 'full', mode = 'default' }: LogoProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className} select-none bg-transparent`}>
      <svg
        viewBox="0 0 300 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-full overflow-visible"
        role="img"
        aria-label="Waack On Official Logo"
      >
        <defs>
          {/* Pristine 3D White Porcelain / Chrome Metallic Gradient — used on dark backgrounds */}
          <linearGradient id="waack-metal-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Dark graphite metallic gradient — used on light backgrounds for legibility */}
          <linearGradient id="waack-metal-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="25%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="75%" stopColor="#334155" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Highlight Specular Gradient */}
          <linearGradient id="waack-specular" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.9" />
          </linearGradient>

          {/* Subtle Bevel Shadow for 3D depth */}
          <filter id="clean-3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        <g filter="url(#clean-3d-shadow)">
          {/* --- TOP: "WAACK" TEXT --- */}
          {variant !== 'compact' && (
            <g transform="translate(150, 70)">
              {/* Main Pristine Metallic "WAACK" */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                className="font-sans font-black uppercase tracking-widest text-[52px]"
                style={{
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fill: 'var(--logo-metal-fill, url(#waack-metal-dark))',
                  letterSpacing: '0.14em',
                  fontWeight: 900
                }}
              >
                WAACK
              </text>
            </g>
          )}

          {/* --- BOTTOM: "ON" WITH DANCER SCULPTURE IN "O" RING --- */}
          {variant !== 'text-only' && (
            <g transform="translate(0, 110)">
              {/* --- "O" CHROME RING & DANCER --- */}
              <g transform="translate(100, 75)">
                {/* 3D Torus Ring Outer Body */}
                <path
                  d="M0 -55 C30 -55 55 -30 55 0 C55 30 30 55 0 55 C-30 55 -55 30 -55 0 C-55 -30 -30 -55 0 -55 Z"
                  fill="none"
                  stroke="var(--logo-metal-fill, url(#waack-metal-dark))"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d="M0 -55 C30 -55 55 -30 55 0 C55 30 30 55 0 55 C-30 55 -55 30 -55 0 C-55 -30 -30 -55 0 -55 Z"
                  fill="none"
                  stroke="url(#waack-specular)"
                  strokeWidth="3"
                  opacity="0.9"
                />

                {/* --- 3D DANCER SILHOUETTE INSIDE "O" --- */}
                <g transform="translate(0, -10)">
                  {/* Head & Hair Knot */}
                  <circle cx="0" cy="-36" r="9" fill="var(--logo-metal-fill, url(#waack-metal-dark))" />
                  <path d="M-2 -45 C-1 -48 4 -48 5 -45 C3 -43 -1 -43 -2 -45 Z" fill="var(--logo-metal-fill, url(#waack-metal-dark))" />

                  {/* Graceful Sculpted Torso & Waacking Stance */}
                  <path
                    d="M-3 -25 
                       C-11 -18, -14 -5, -12 12 
                       C-10 24, -4 34, 0 42 
                       C4 34, 10 24, 12 12 
                       C14 -5, 11 -18, 3 -25 Z"
                    fill="var(--logo-metal-fill, url(#waack-metal-dark))"
                  />

                  {/* Right Arm Reaching Overhead (Waacking Extension) */}
                  <path
                    d="M2 -18
                       C14 -28, 28 -38, 42 -46
                       C44 -48, 46 -45, 43 -43
                       C30 -34, 15 -22, 4 -12 Z"
                    fill="var(--logo-metal-fill, url(#waack-metal-dark))"
                  />
                  {/* Hand flare at wrist */}
                  <path d="M42 -46 C45 -48, 47 -46, 44 -43 Z" fill="var(--logo-metal-fill, url(#waack-metal-dark))" />

                  {/* Left Arm Curved on Waist */}
                  <path
                    d="M-4 -18
                       C-16 -12, -24 -2, -26 10
                       C-27 12, -25 13, -24 11
                       C-21 2, -14 -7, -3 -12 Z"
                    fill="var(--logo-metal-fill, url(#waack-metal-dark))"
                  />
                </g>
              </g>

              {/* --- "N" METALLIC LETTER --- */}
              <g transform="translate(200, 75)">
                <text
                  x="0"
                  y="20"
                  textAnchor="middle"
                  className="font-sans font-black uppercase"
                  style={{
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fill: 'var(--logo-metal-fill, url(#waack-metal-dark))',
                    fontSize: '85px',
                    fontWeight: 900
                  }}
                >
                  N
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

