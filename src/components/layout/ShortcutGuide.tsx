import { useUIStore } from '@/stores/uiStore';

const SHORTCUTS = [
  { keys: ['Space'], description: 'Play / Pause' },
  { keys: ['←'], description: 'Seek backward 5 min' },
  { keys: ['→'], description: 'Seek forward 5 min' },
  { keys: ['1'], description: 'Speed ×1 (60s/s)' },
  { keys: ['2'], description: 'Speed ×2 (120s/s)' },
  { keys: ['3'], description: 'Speed ×5 (300s/s)' },
  { keys: ['4'], description: 'Speed ×10 (600s/s)' },
  { keys: ['T'], description: 'Toggle dark/light theme' },
  { keys: ['A'], description: 'Toggle analytics panel' },
  { keys: ['P'], description: 'Toggle FPS overlay' },
  { keys: ['Esc'], description: 'Deselect / Close' },
  { keys: ['?'], description: 'Toggle this guide' },
];

const ShortcutGuide = () => {
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
          <h2 className="text-base font-bold text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={toggle}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.description} className="flex items-center justify-between py-1">
              <span className="text-sm text-text-secondary">{s.description}</span>
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
