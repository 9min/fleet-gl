import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setResolvedTheme: (resolved: ResolvedTheme) => void;
};

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === 'system' ? getSystemTheme() : theme;

const stored = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('theme')
  : null) as Theme | null;

const initialTheme: Theme = stored ?? 'dark';

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: initialTheme,
  resolvedTheme: resolveTheme(initialTheme),

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('theme', theme);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    set({ theme: next, resolvedTheme: next });
  },

  setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),
}));
