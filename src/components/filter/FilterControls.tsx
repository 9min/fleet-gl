import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import type { VehicleStatus } from '@/types/vehicle';

const FILTER_OPTIONS: { status: VehicleStatus; label: string; color: string }[] = [
  { status: 'running', label: 'Running', color: '#00D4FF' },
  { status: 'idle', label: 'Idle', color: '#FFB800' },
  { status: 'completed', label: 'Completed', color: '#00FF88' },
  { status: 'delayed', label: 'Delayed', color: '#FF4757' },
];

const FilterControls = () => {
  const activeFilters = useUIStore((s) => s.filters.status);
  const setStatusFilter = useUIStore((s) => s.setStatusFilter);

  const handleToggle = useCallback(
    (status: VehicleStatus) => {
      const isActive = activeFilters.includes(status);
      if (isActive) {
        // Don't allow deselecting all
        if (activeFilters.length <= 1) return;
        setStatusFilter(activeFilters.filter((s) => s !== status));
      } else {
        setStatusFilter([...activeFilters, status]);
      }
    },
    [activeFilters, setStatusFilter],
  );

  return (
    <div className="flex items-center gap-1">
      {FILTER_OPTIONS.map(({ status, label, color }) => {
        const isActive = activeFilters.includes(status);
        return (
          <button
            key={status}
            onClick={() => handleToggle(status)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
              isActive
                ? 'bg-white/10 text-text-primary'
                : 'text-text-secondary opacity-50 hover:opacity-75'
            }`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isActive ? color : '#8892A0' }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterControls;
