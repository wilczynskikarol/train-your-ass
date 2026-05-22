import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserSettings, saveUserSettings } from '../firebase/helpers';

// Tokeny dopasowane 1:1 do handoffu z Claude Design
export const TOKENS = {
  soft: {
    key: 'soft',
    bg: '#f7f2ec', bgSubtle: '#efe8de', surface: '#ffffff', surfaceAlt: '#faf6f1',
    ink: '#2b2521', inkMid: '#5a4f47', inkMute: '#9a8e82', inkFaint: '#c5b8a9',
    border: 'rgba(43,37,33,0.08)', borderStrong: 'rgba(43,37,33,0.16)',
    accent: '#c98a4b', accentDeep: '#a86d33', accentSoft: '#e8c89a', accentTint: '#f4e6d2',
    success: '#7a9468', warn: '#c4814b',
    fontDisplay: "'Fraunces', Georgia, serif",
    fontUI:      "'Inter', system-ui, sans-serif",
    fontNum:     "'Inter', system-ui, sans-serif",
    radiusCard:  '22px', radiusInput: '14px', radiusPill: '9999px',
    shadowSm: '0 1px 2px rgba(43,37,33,0.04), 0 1px 3px rgba(43,37,33,0.03)',
    shadowMd: '0 2px 6px rgba(43,37,33,0.05), 0 8px 24px rgba(43,37,33,0.05)',
    shadowLg: '0 4px 12px rgba(43,37,33,0.06), 0 16px 48px rgba(43,37,33,0.08)',
  },
  iron: {
    key: 'iron',
    bg: '#0b0b0c', bgSubtle: '#101012', surface: '#161618', surfaceAlt: '#1d1d20',
    ink: '#f5f5f5', inkMid: '#a3a3a8', inkMute: '#6a6a70', inkFaint: '#4a4a4e',
    border: 'rgba(255,255,255,0.08)', borderStrong: 'rgba(255,255,255,0.18)',
    accent: '#ffffff', accentDeep: '#e5e5e5', accentSoft: '#2a2a2d', accentTint: '#1d1d20',
    success: '#9ecb7a', warn: '#e8a04b',
    fontDisplay: "'Inter', system-ui, sans-serif",
    fontUI:      "'Inter', system-ui, sans-serif",
    fontNum:     "'JetBrains Mono', ui-monospace, monospace",
    radiusCard:  '6px', radiusInput: '4px', radiusPill: '4px',
    shadowSm: 'none', shadowMd: 'none', shadowLg: 'none',
  },
};

const ACCENT_OVERRIDES = {
  soft: {
    mauve: { accent: '#a87c8f', accentSoft: '#d8c0ca', accentTint: '#f1e5ea' },
    sage:  { accent: '#8a9a7b', accentSoft: '#c1cdb6', accentTint: '#e6ece1' },
  },
  iron: {
    green:  { accent: '#2bd96c' },
    orange: { accent: '#ff6b1a' },
    blue:   { accent: '#3a86ff' },
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState]   = useState('soft');
  const [accent, setAccentState] = useState(null);
  const [ready, setReady]        = useState(false);

  // Załaduj motyw z localStorage przy starcie
  useEffect(() => {
    const t = localStorage.getItem('tya-theme');
    const a = localStorage.getItem('tya-accent');
    if (t === 'soft' || t === 'iron') setThemeState(t);
    if (a) setAccentState(a);
    setReady(true);
  }, []);

  // Synchronizuj z Firestore po zalogowaniu
  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then(s => {
      if (s?.theme === 'soft' || s?.theme === 'iron') {
        setThemeState(s.theme);
        localStorage.setItem('tya-theme', s.theme);
      }
      if (s?.accent) {
        setAccentState(s.accent);
        localStorage.setItem('tya-accent', s.accent);
      }
    });
  }, [user?.uid]);

  // Aplikuj klasę na body
  useEffect(() => {
    if (!ready) return;
    document.body.className = theme === 'iron' ? 'theme-m' : 'theme-f';
    if (accent) document.body.setAttribute('data-accent', accent);
    else document.body.removeAttribute('data-accent');
    const meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', TOKENS[theme].bg);
  }, [theme, accent, ready]);

  const setTheme = useCallback((newTheme, newAccent) => {
    setThemeState(newTheme);
    setAccentState(newAccent ?? null);
    localStorage.setItem('tya-theme', newTheme);
    localStorage.setItem('tya-accent', newAccent ?? '');
    if (user) saveUserSettings(user.uid, { theme: newTheme, accent: newAccent ?? null });
  }, [user]);

  // Tokeny z nadpisanymi akcentami
  const tokens = {
    ...TOKENS[theme],
    ...(accent ? (ACCENT_OVERRIDES[theme]?.[accent] ?? {}) : {}),
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, tokens, setTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
