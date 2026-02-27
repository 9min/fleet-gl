import { useCallback } from 'react';
import FilterControls from '@/components/filter/FilterControls';
import { useUIStore } from '@/stores/uiStore';

const Header = () => {
  const toggleShortcutGuide = useUIStore((s) => s.toggleShortcutGuide);

  const handleShortcutClick = useCallback(() => {
    toggleShortcutGuide();
  }, [toggleShortcutGuide]);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-card/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-accent-cyan font-bold text-lg tracking-tight">logi-twin</span>
        <span className="text-text-secondary text-xs hidden sm:inline">3D logistics</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex">
          <FilterControls />
        </div>
        <button
          onClick={handleShortcutClick}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          title="Keyboard shortcuts (?)"
        >
          <span className="font-mono text-xs font-bold">?</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
