import FilterControls from '@/components/filter/FilterControls';

const Header = () => {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-card/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-accent-cyan font-bold text-lg tracking-tight">logi-twin</span>
        <span className="text-text-secondary text-xs hidden sm:inline">3D logistics</span>
      </div>

      <div className="hidden md:flex">
        <FilterControls />
      </div>
    </header>
  );
};

export default Header;
