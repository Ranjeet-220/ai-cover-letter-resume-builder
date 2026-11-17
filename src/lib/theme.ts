export type ThemeMode = 'dark' | 'light';

export type AccentPreset =
  | 'monochrome'
  | 'electric-blue'
  | 'violet-aurora'
  | 'emerald-matrix'
  | 'rose-gold';

export interface AccentColorConfig {
  id: AccentPreset;
  name: string;
  badge: string;
  primaryColor: string;
  glow: string;
  bgHex: string;
  borderHex: string;
  description: string;
}

export const ACCENT_PRESETS: AccentColorConfig[] = [
  {
    id: 'monochrome',
    name: 'Obsidian & White',
    badge: 'Classic Minimal',
    primaryColor: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.2)',
    bgHex: '#18181b',
    borderHex: '#3f3f46',
    description: 'High-contrast monochrome dark & crisp silver highlights.',
  },
  {
    id: 'electric-blue',
    name: 'Electric Cyan & Blue',
    badge: 'Tech & Modern',
    primaryColor: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.25)',
    bgHex: '#0c4a6e',
    borderHex: '#0284c7',
    description: 'Deep navy background with neon cyan and electric blue accents.',
  },
  {
    id: 'violet-aurora',
    name: 'Violet Aurora',
    badge: 'Creative & Deep',
    primaryColor: '#8b5cf6',
    glow: 'rgba(192, 132, 252, 0.25)',
    bgHex: '#4c1d95',
    borderHex: '#8b5cf6',
    description: 'Solid violet accents on a dark background.',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    badge: 'Executive & Growth',
    primaryColor: '#10b981',
    glow: 'rgba(52, 211, 153, 0.25)',
    bgHex: '#064e3b',
    borderHex: '#10b981',
    description: 'Rich forest green and glowing mint emerald highlights.',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold & Amber',
    badge: 'Warm & Elegant',
    primaryColor: '#f43f5e',
    glow: 'rgba(251, 113, 133, 0.25)',
    bgHex: '#881337',
    borderHex: '#f43f5e',
    description: 'Sophisticated warm rose, coral, and luxury amber tones.',
  },
];

const THEME_MODE_KEY = 'covercraft_theme_mode';
const ACCENT_PRESET_KEY = 'covercraft_accent_preset';

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    return localStorage.getItem(THEME_MODE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function getStoredAccentPreset(): AccentPreset {
  if (typeof window === 'undefined') return 'monochrome';
  try {
    const val = localStorage.getItem(ACCENT_PRESET_KEY) as AccentPreset;
    if (val && ACCENT_PRESETS.some((p) => p.id === val)) return val;
  } catch {
    // Use the default when storage is unavailable.
  }
  return 'monochrome';
}

export function applyThemeSettings(mode: ThemeMode, accent: AccentPreset) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Set mode attribute
  root.setAttribute('data-theme', mode);
  if (mode === 'light') {
    root.classList.add('light-mode');
    root.classList.remove('dark-mode');
  } else {
    root.classList.add('dark-mode');
    root.classList.remove('light-mode');
  }

  // Set accent attribute
  root.setAttribute('data-accent', accent);

  // Set accent CSS custom properties directly on root
  const preset = ACCENT_PRESETS.find((p) => p.id === accent) || ACCENT_PRESETS[0];
  root.style.setProperty('--accent-primary-color', preset.primaryColor);
  root.style.setProperty('--accent-border-hex', preset.borderHex);
  root.style.setProperty('--accent-bg-hex', preset.bgHex);
  root.style.setProperty('--accent-glow-rgba', preset.glow);

  // Dispatch custom event for active listeners
  window.dispatchEvent(
    new CustomEvent('covercraft-theme-change', {
      detail: { mode, accent },
    })
  );
}

export function saveThemeMode(mode: ThemeMode) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
      // The in-memory theme can still be applied.
    }
  }
  const currentAccent = getStoredAccentPreset();
  applyThemeSettings(mode, currentAccent);
}

export function saveAccentPreset(accent: AccentPreset) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACCENT_PRESET_KEY, accent);
    } catch {
      // The in-memory theme can still be applied.
    }
  }
  const currentMode = getStoredThemeMode();
  applyThemeSettings(currentMode, accent);
}
