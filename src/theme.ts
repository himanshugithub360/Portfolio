import type { Theme } from './data/portfolio';

/** Fonts offered in the admin's Design page. All load from Google Fonts. */
export const FONT_CHOICES = {
  display: ['Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Big Shoulders Display', 'Teko', 'League Gothic', 'Playfair Display'],
  serif: ['Instrument Serif', 'Playfair Display', 'DM Serif Display', 'Lora', 'Fraunces', 'Cormorant Garamond'],
  sans: ['Inter', 'Manrope', 'DM Sans', 'Poppins', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans', 'Sora'],
} as const;

/** Fonts that index.html already loads, so no extra request is needed for them. */
const PRELOADED = new Set(['Bebas Neue', 'Instrument Serif', 'Inter']);

const FALLBACK = {
  display: "'Oswald', Impact, sans-serif",
  serif: 'Georgia, serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
};

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(229,19,43,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function fontParam(name: string, kind: 'display' | 'serif' | 'sans') {
  const family = name.trim().replace(/ /g, '+');
  if (kind === 'serif') return `family=${family}:ital@0;1`;
  if (kind === 'sans') return `family=${family}:wght@300;400;500;600;700;800`;
  return `family=${family}`;
}

/** Push the theme into the CSS variables Tailwind's utilities read, and load any non-default fonts. */
export function applyTheme(t: Theme) {
  const root = document.documentElement.style;
  const colors: Record<string, string> = {
    '--color-crimson': t.accent,
    '--color-crimson-2': t.accentBright,
    '--color-ink': t.background,
    '--color-ink-2': t.surface,
    '--color-ink-3': t.surface2,
    '--color-bone': t.text,
    '--color-mist': t.muted,
    '--color-smoke': t.faint,
  };
  for (const [k, v] of Object.entries(colors)) if (v) root.setProperty(k, v);

  root.setProperty('--font-display', `'${t.fontDisplay}', ${FALLBACK.display}`);
  root.setProperty('--font-serif', `'${t.fontSerif}', ${FALLBACK.serif}`);
  root.setProperty('--font-sans', `'${t.fontSans}', ${FALLBACK.sans}`);

  const extra = (
    [
      [t.fontDisplay, 'display'],
      [t.fontSerif, 'serif'],
      [t.fontSans, 'sans'],
    ] as const
  ).filter(([name]) => name && !PRELOADED.has(name));

  const id = 'theme-fonts';
  document.getElementById(id)?.remove();
  if (extra.length) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${extra.map(([n, k]) => fontParam(n, k)).join('&')}&display=swap`;
    document.head.appendChild(link);
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.background);
}
