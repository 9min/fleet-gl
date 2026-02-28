import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FilterControls from '@/components/filter/FilterControls';
import { useUIStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';
import ConnectionStatus from '@/components/panel/ConnectionStatus';
import ExportMenu from '@/components/panel/ExportMenu';

type HeaderProps = {
  wsConnected?: boolean;
};

const Header = ({ wsConnected = false }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const toggleShortcutGuide = useUIStore((s) => s.toggleShortcutGuide);
  const toggleAnalyticsPanel = useUIStore((s) => s.toggleAnalyticsPanel);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  const handleShortcutClick = useCallback(() => {
    toggleShortcutGuide();
  }, [toggleShortcutGuide]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleAnalyticsClick = useCallback(() => {
    toggleAnalyticsPanel();
  }, [toggleAnalyticsPanel]);

  const handleLanguageToggle = useCallback(() => {
    const next = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  }, [i18n]);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-card/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-accent-cyan font-bold text-lg tracking-tight">{t('header.title')}</span>
        <span className="text-text-secondary text-xs hidden sm:inline">{t('header.subtitle')}</span>
        <ConnectionStatus connected={wsConnected} />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex">
          <FilterControls />
        </div>
        {/* Analytics */}
        <button
          onClick={handleAnalyticsClick}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title={t('header.analytics')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        {/* Export */}
        <ExportMenu />
        {/* Theme toggle */}
        <button
          onClick={handleThemeToggle}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title={t('header.themeToggle', { mode: resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark') })}
        >
          {resolvedTheme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        {/* Language toggle */}
        <button
          onClick={handleLanguageToggle}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-xs"
          title={t('lang.switchLanguage')}
        >
          {i18n.language === 'ko' ? 'EN' : '한'}
        </button>
        {/* Shortcut guide */}
        <button
          onClick={handleShortcutClick}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title={t('header.shortcuts')}
        >
          <span className="font-mono text-xs font-bold">?</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
