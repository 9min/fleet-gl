import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type SnapPoint = 'peek' | 'half' | 'full';

type BottomSheetProps = {
  children: ReactNode;
  snapTo?: SnapPoint;
  onSnapChange?: (snap: SnapPoint) => void;
};

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '80px',
  half: '45vh',
  full: '85vh',
};

const SNAP_ORDER: SnapPoint[] = ['peek', 'half', 'full'];

const BottomSheet = ({ children, snapTo, onSnapChange }: BottomSheetProps) => {
  const [snap, setSnap] = useState<SnapPoint>(snapTo ?? 'peek');
  const startYRef = useRef(0);
  const currentSnapRef = useRef(snap);

  useEffect(() => {
    if (snapTo && snapTo !== snap) {
      setSnap(snapTo);
      currentSnapRef.current = snapTo;
    }
  }, [snapTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0]!.clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endY = e.changedTouches[0]!.clientY;
    const delta = startYRef.current - endY;
    const currentIdx = SNAP_ORDER.indexOf(currentSnapRef.current);

    let newSnap: SnapPoint;
    if (delta > 50 && currentIdx < SNAP_ORDER.length - 1) {
      // Swiped up
      newSnap = SNAP_ORDER[currentIdx + 1]!;
    } else if (delta < -50 && currentIdx > 0) {
      // Swiped down
      newSnap = SNAP_ORDER[currentIdx - 1]!;
    } else {
      return;
    }

    setSnap(newSnap);
    currentSnapRef.current = newSnap;
    onSnapChange?.(newSnap);
  }, [onSnapChange]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 glass-panel rounded-b-none transition-all duration-300 ease-out overflow-hidden"
      style={{ height: SNAP_HEIGHTS[snap] }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag handle */}
      <div className="flex justify-center py-2 cursor-grab">
        <div className="bottom-sheet-handle" />
      </div>
      {/* Content */}
      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: `calc(${SNAP_HEIGHTS[snap]} - 32px)` }}>
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
