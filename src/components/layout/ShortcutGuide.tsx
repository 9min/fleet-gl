import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';

const SHORTCUT_KEYS: { keys: string[]; tKey: string }[] = [
  { keys: ['Space'], tKey: 'shortcuts.playPause' },
  { keys: ['←'], tKey: 'shortcuts.seekBackward' },
  { keys: ['→'], tKey: 'shortcuts.seekForward' },
  { keys: ['1'], tKey: 'shortcuts.speed1' },
  { keys: ['2'], tKey: 'shortcuts.speed2' },
  { keys: ['3'], tKey: 'shortcuts.speed3' },
  { keys: ['4'], tKey: 'shortcuts.speed4' },
  { keys: ['T'], tKey: 'shortcuts.toggleTheme' },
  { keys: ['A'], tKey: 'shortcuts.toggleAnalytics' },
  { keys: ['P'], tKey: 'shortcuts.toggleFPS' },
  { keys: ['Esc'], tKey: 'shortcuts.deselect' },
  { keys: ['?'], tKey: 'shortcuts.toggleGuide' },
];

const ShortcutGuide = () => {
  const { t } = useTranslation();
  const isOpen = useUIStore((s) => s.isShortcutGuideOpen);
  const toggle = useUIStore((s) => s.toggleShortcutGuide);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={toggle}
    >
      <div
        className="glass-panel p-6 w-[340px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">{t('shortcuts.title')}</h2>
          <button
            onClick={toggle}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {SHORTCUT_KEYS.map((s) => (
            <div key={s.tKey} className="flex items-center justify-between py-1">
              <span className="text-sm text-text-secondary">{t(s.tKey)}</span>
              <div className="flex gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 rounded bg-white/10 text-text-primary font-mono text-xs border border-white/15"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-text-secondary mt-4 text-center">
          Press <kbd className="px-1 rounded bg-white/10 text-text-primary font-mono text-[10px]">?</kbd> or <kbd className="px-1 rounded bg-white/10 text-text-primary font-mono text-[10px]">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
};

export default ShortcutGuide;
