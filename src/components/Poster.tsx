import type { ReactNode } from 'react';
import type { Motif, Palette, Project } from '../data/portfolio';

/**
 * Generated "key art" for thumbnails — layered gradients, light falloff and a motif.
 * No stock imagery: every card is art-directed from its palette.
 */
export function PosterBackdrop({ palette, children, className = '' }: { palette: Palette; children?: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, ${palette.via} 0%, transparent 60%),
          radial-gradient(90% 80% at 0% 100%, ${palette.from} 0%, transparent 70%),
          linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -right-1/4 -top-1/3 h-[140%] w-[70%] rotate-[18deg] opacity-40 blur-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}55, transparent)` }}
      />
      <div aria-hidden className="absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_4px)]" />
      {children}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
    </div>
  );
}

/** Motif illustrations for each Original, built from the project's own architecture. */
export function ProjectArt({ project, className = '' }: { project: Project; className?: string }) {
  return (
    <PosterBackdrop palette={project.palette} className={className}>
      <MotifArt motif={project.motif} accent={project.palette.accent} uid={`p-${project.id}`} />
    </PosterBackdrop>
  );
}

/** The line-art illustration on its own, drawn on the right-hand side of a 400×300 canvas. */
export function MotifArt({ motif, accent: a, uid }: { motif: Motif; accent: string; uid: string }) {
  const gid = `g-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={gid} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={a} stopOpacity="0.55" />
            <stop offset="100%" stopColor={a} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="290" cy="120" r="130" fill={`url(#${gid})`} />
        {motif === 'neural' && (
          <g stroke={a} fill="none">
            {NEURAL.slice(0, -1).flatMap(([x1, ys1], li) =>
              ys1.flatMap((y1) => NEURAL[li + 1][1].map((y2) => <line key={`${li}-${y1}-${y2}`} x1={x1} y1={y1} x2={NEURAL[li + 1][0]} y2={y2} strokeOpacity="0.16" strokeWidth="1" />)),
            )}
            {NEURAL.flatMap(([x, ys], li) =>
              ys.map((y, i) => <circle key={`${x}-${y}`} cx={x} cy={y} r="9" strokeWidth="2" strokeOpacity="0.85" fill={(i + li) % 3 === 0 ? a : 'none'} fillOpacity="0.55" />),
            )}
          </g>
        )}
        {motif === 'chip' && (
          <g stroke={a} fill="none">
            <rect x="235" y="80" width="110" height="110" rx="10" strokeWidth="2" strokeOpacity="0.9" />
            <rect x="258" y="103" width="64" height="64" rx="6" strokeOpacity="0.5" fill={a} fillOpacity="0.12" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7">
                <line x1={245 + i * 18} x2={245 + i * 18} y1="62" y2="80" />
                <line x1={245 + i * 18} x2={245 + i * 18} y1="190" y2="208" />
                <line x1="217" x2="235" y1={90 + i * 18} y2={90 + i * 18} />
                <line x1="345" x2="363" y1={90 + i * 18} y2={90 + i * 18} />
              </g>
            ))}
            <path d="M272 135 h18 l8 -12 h12" strokeWidth="2" strokeOpacity="0.8" />
            <circle cx="314" cy="123" r="4" fill={a} stroke="none" />
          </g>
        )}
        {motif === 'terminal' && (
          <g stroke={a} fill="none">
            <rect x="190" y="58" width="190" height="150" rx="10" strokeWidth="2" strokeOpacity="0.85" />
            <line x1="190" x2="380" y1="80" y2="80" strokeOpacity="0.4" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={204 + i * 13} cy="69" r="3.5" fill={a} fillOpacity={0.9 - i * 0.25} stroke="none" />
            ))}
            <path d="M206 102 l10 8 l-10 8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {[
              [226, 110, 300],
              [206, 132, 344],
              [206, 150, 310],
              [206, 168, 356],
            ].map(([x1, y, x2], i) => (
              <line key={y} x1={x1} x2={x2} y1={y} y2={y} strokeWidth="3" strokeLinecap="round" strokeOpacity={0.75 - i * 0.12} />
            ))}
            <rect x="206" y="182" width="10" height="16" fill={a} fillOpacity="0.85" stroke="none" />
          </g>
        )}
        {motif === 'network' && (
          <g stroke={a} fill="none">
            {NETWORK.map(([x, y]) => (
              <line key={`l${x}${y}`} x1="290" y1="140" x2={x} y2={y} strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="6 5" />
            ))}
            {NETWORK.map(([x, y], i) => (
              <circle key={`n${x}${y}`} cx={x} cy={y} r="11" strokeWidth="2" strokeOpacity="0.8" fill={i % 2 ? 'none' : a} fillOpacity="0.3" />
            ))}
            <circle cx="290" cy="140" r="22" strokeWidth="2.5" fill={a} fillOpacity="0.35" />
            <circle cx="290" cy="140" r="34" strokeOpacity="0.3" />
            {[0.35, 0.6].map((t) => (
              <circle key={t} cx={290 + (NETWORK[1][0] - 290) * t} cy={140 + (NETWORK[1][1] - 140) * t} r="4" fill={a} stroke="none" />
            ))}
          </g>
        )}
        {motif === 'chart' && (
          <g stroke={a} fill="none">
            <path d="M200 60 V220 H384" strokeWidth="2" strokeOpacity="0.6" />
            {[70, 110, 90, 140, 125, 170].map((h, i) => (
              <rect key={i} x={214 + i * 28} y={218 - h} width="18" height={h} rx="3" fill={a} fillOpacity={0.15 + i * 0.07} strokeOpacity="0.5" />
            ))}
            <polyline points={[70, 110, 90, 140, 125, 170].map((h, i) => `${223 + i * 28},${200 - h}`).join(' ')} strokeWidth="2.5" strokeLinejoin="round" />
            {[70, 110, 90, 140, 125, 170].map((h, i) => (
              <circle key={i} cx={223 + i * 28} cy={200 - h} r="4" fill={a} stroke="none" />
            ))}
          </g>
        )}
        {motif === 'chat' && (
          <g stroke={a} fill="none">
            <path d="M200 70 h130 a12 12 0 0 1 12 12 v44 a12 12 0 0 1 -12 12 h-96 l-22 18 v-18 h-12 a12 12 0 0 1 -12 -12 v-44 a12 12 0 0 1 12 -12 z" strokeWidth="2" strokeOpacity="0.85" />
            <line x1="214" x2="320" y1="92" y2="92" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
            <line x1="214" x2="290" y1="112" y2="112" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
            <path d="M262 168 h110 a12 12 0 0 1 12 12 v36 a12 12 0 0 1 -12 12 h-12 v16 l-20 -16 h-78 a12 12 0 0 1 -12 -12 v-36 a12 12 0 0 1 12 -12 z" strokeWidth="2" fill={a} fillOpacity="0.18" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={296 + i * 16} cy="198" r="4.5" fill={a} fillOpacity={0.9 - i * 0.25} stroke="none" />
            ))}
          </g>
        )}
        {motif === 'database' && (
          <g stroke={a} fill="none">
            {[0, 1, 2].map((i) => (
              <g key={i} strokeWidth="2" strokeOpacity={0.9 - i * 0.15}>
                <path d={`M220 ${92 + i * 46} v30 a50 13 0 0 0 100 0 v-30`} fill={a} fillOpacity="0.08" />
                <ellipse cx="270" cy={92 + i * 46} rx="50" ry="13" fill={i === 0 ? a : 'none'} fillOpacity="0.25" />
              </g>
            ))}
            {DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 2.5} fill={a} fillOpacity={0.4 + (i % 4) * 0.15} stroke="none" />
            ))}
          </g>
        )}
        {motif === 'signal' && (
          <g stroke={a} fill="none" strokeLinecap="round">
            <path d="M250 232 l14 -70 l14 70 M256 204 h16" strokeWidth="2.5" />
            <circle cx="264" cy="156" r="6" fill={a} stroke="none" />
            {[26, 46, 66].map((r, i) => (
              <g key={r} strokeWidth="2.5" strokeOpacity={0.85 - i * 0.22}>
                <path d={`M${264 - r * 0.7} ${156 - r * 0.7} a${r} ${r} 0 0 0 0 ${r * 1.4}`} />
                <path d={`M${264 + r * 0.7} ${156 - r * 0.7} a${r} ${r} 0 0 1 0 ${r * 1.4}`} />
              </g>
            ))}
            <path d="M190 262 q15 -24 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" strokeWidth="2" strokeOpacity="0.5" />
          </g>
        )}
        {motif === 'shield' && (
          <g transform="translate(232 40)" fill="none" stroke={a} strokeOpacity="0.85">
            <path d="M58 0 L116 22 V78 C116 120 90 146 58 160 C26 146 0 120 0 78 V22 Z" strokeWidth="2" />
            <path d="M58 16 L102 33 V78 C102 111 82 132 58 144 C34 132 14 111 14 78 V33 Z" strokeWidth="1" strokeOpacity="0.4" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="30" x2={i % 2 ? 72 : 86} y1={56 + i * 14} y2={56 + i * 14} strokeWidth="3" strokeLinecap="round" strokeOpacity={0.35 + i * 0.1} />
            ))}
            <path d="M40 124 l12 12 l26 -28" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {motif === 'flow' && (
          <g fill="none" stroke={a}>
            <rect x="200" y="56" width="150" height="94" rx="12" strokeWidth="2" strokeOpacity="0.85" />
            <rect x="214" y="72" width="28" height="20" rx="4" strokeOpacity="0.7" />
            <line x1="214" x2="330" y1="124" y2="124" strokeWidth="3" strokeOpacity="0.4" strokeDasharray="18 8" />
            <g transform="translate(176 196)" fontFamily="Inter" fontSize="10" fill={a} stroke="none" letterSpacing="2">
              <circle cx="16" cy="16" r="16" fill="none" stroke={a} strokeWidth="2" />
              <path d="M34 16 h46" stroke={a} strokeWidth="2" />
              <circle cx="96" cy="16" r="16" fill="none" stroke={a} strokeWidth="2" strokeOpacity="0.8" />
              <path d="M112 8 l38 -22 M112 24 l38 22" stroke={a} strokeWidth="2" strokeOpacity="0.6" />
              <circle cx="166" cy="-18" r="10" fill={a} fillOpacity="0.8" />
              <circle cx="166" cy="50" r="10" fill="none" stroke={a} strokeWidth="2" strokeOpacity="0.5" />
            </g>
          </g>
        )}
        {motif === 'tenants' && (
          <g fill="none" stroke={a}>
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={196 + c * 44}
                  y={50 + r * 44}
                  width="34"
                  height="34"
                  rx="7"
                  strokeWidth="1.6"
                  strokeOpacity={0.25 + ((r + c) % 3) * 0.25}
                  fill={(r + c) % 4 === 0 ? a : 'none'}
                  fillOpacity="0.25"
                />
              )),
            )}
            <path d="M188 200 h190" strokeWidth="2" strokeOpacity="0.7" />
            <path d="M188 214 h190" strokeWidth="1" strokeOpacity="0.35" />
            <path d="M188 228 h190" strokeWidth="1" strokeOpacity="0.2" />
          </g>
        )}
      </svg>
  );
}

// Layout data for the motifs above.
const NEURAL: [number, number[]][] = [
  [210, [85, 135, 185, 235]],
  [290, [60, 105, 150, 195, 240]],
  [370, [105, 155, 205]],
];
const NETWORK: [number, number][] = [
  [210, 80],
  [370, 75],
  [385, 175],
  [330, 245],
  [215, 225],
  [195, 150],
];
const DOTS: [number, number][] = [
  [340, 84], [356, 104], [372, 88], [348, 130], [366, 146], [382, 122], [344, 172], [362, 190], [378, 168], [352, 214], [370, 230], [386, 206],
];

/** Small fictional platform mark used in the nav and on cards. */
export function SeriesMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 24 32" className="h-[1.1em] w-auto" aria-hidden>
        <path d="M6 4v24M18 4v24M6 16h12" fill="none" style={{ stroke: 'var(--color-crimson)' }} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-[0.62em] font-bold tracking-[0.36em] text-mist">SERIES</span>
    </span>
  );
}
