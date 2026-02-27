import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const useSystemTheme = () => {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setResolvedTheme = useThemeStore((s) => s.setResolvedTheme);

  // Sync OS preference when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, setResolvedTheme]);

  // Apply data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return resolvedTheme;
};
