import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useSimulationStore } from '@/stores/simulationStore';
import { useUIStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';

const fireKey = (code: string, extra: Partial<KeyboardEventInit> = {}) => {
  const event = new KeyboardEvent('keydown', {
    code,
    key: extra.key ?? code,
    bubbles: true,
    ...extra,
  });
  document.dispatchEvent(event);
};

describe('useKeyboardShortcuts', () => {
  const seekMock = vi.fn();

  beforeEach(() => {
    seekMock.mockClear();
    useSimulationStore.setState({
      isPlaying: false,
      playbackSpeed: 60,
      currentTime: 1000,
      totalDuration: 57600,
    });
    useUIStore.setState({
      selectedVehicleId: null,
      isPanelOpen: false,
      isAnalyticsPanelOpen: false,
      isShortcutGuideOpen: false,
      isPerformanceOverlayOpen: false,
    });
    useThemeStore.setState({
      theme: 'dark',
      resolvedTheme: 'dark',
    });
  });

  afterEach(() => {
    // Cleanup is handled by renderHook unmount
  });

  const setup = () => renderHook(() => useKeyboardShortcuts({ seek: seekMock }));

  it('Space toggles play/pause', () => {
    const { unmount } = setup();
    fireKey('Space', { key: ' ' });
    expect(useSimulationStore.getState().isPlaying).toBe(true);
    fireKey('Space', { key: ' ' });
    expect(useSimulationStore.getState().isPlaying).toBe(false);
    unmount();
  });

  it('ArrowLeft seeks backward', () => {
    const { unmount } = setup();
    fireKey('ArrowLeft', { key: 'ArrowLeft' });
    expect(seekMock).toHaveBeenCalledWith(700); // 1000 - 300
    unmount();
  });

  it('ArrowRight seeks forward', () => {
    const { unmount } = setup();
    fireKey('ArrowRight', { key: 'ArrowRight' });
    expect(seekMock).toHaveBeenCalledWith(1300); // 1000 + 300
    unmount();
  });

  it('ArrowLeft does not go below 0', () => {
    useSimulationStore.setState({ currentTime: 100 });
    const { unmount } = setup();
    fireKey('ArrowLeft', { key: 'ArrowLeft' });
    expect(seekMock).toHaveBeenCalledWith(0);
    unmount();
  });

  it('ArrowRight does not exceed totalDuration', () => {
    useSimulationStore.setState({ currentTime: 57500 });
    const { unmount } = setup();
    fireKey('ArrowRight', { key: 'ArrowRight' });
    expect(seekMock).toHaveBeenCalledWith(57600);
    unmount();
  });

  it('Escape clears vehicle selection', () => {
    useUIStore.setState({ selectedVehicleId: 'V-001', isPanelOpen: true });
    const { unmount } = setup();
    fireKey('Escape', { key: 'Escape' });
    expect(useUIStore.getState().selectedVehicleId).toBeNull();
    unmount();
  });

  it('Escape closes shortcut guide if open', () => {
    useUIStore.setState({ isShortcutGuideOpen: true });
    const { unmount } = setup();
    fireKey('Escape', { key: 'Escape' });
    expect(useUIStore.getState().isShortcutGuideOpen).toBe(false);
    unmount();
  });

  it('KeyP toggles performance overlay', () => {
    const { unmount } = setup();
    fireKey('KeyP', { key: 'p' });
    expect(useUIStore.getState().isPerformanceOverlayOpen).toBe(true);
    unmount();
  });

  it('KeyT toggles theme', () => {
    const { unmount } = setup();
    fireKey('KeyT', { key: 't' });
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    unmount();
  });

  it('KeyA toggles analytics panel', () => {
    const { unmount } = setup();
    fireKey('KeyA', { key: 'a' });
    expect(useUIStore.getState().isAnalyticsPanelOpen).toBe(true);
    unmount();
  });

  it('number keys 1-4 set playback speed', () => {
    const { unmount } = setup();
    fireKey('Digit1', { key: '1' });
    expect(useSimulationStore.getState().playbackSpeed).toBe(60);
    fireKey('Digit2', { key: '2' });
    expect(useSimulationStore.getState().playbackSpeed).toBe(120);
    fireKey('Digit3', { key: '3' });
    expect(useSimulationStore.getState().playbackSpeed).toBe(300);
    fireKey('Digit4', { key: '4' });
    expect(useSimulationStore.getState().playbackSpeed).toBe(600);
    unmount();
  });

  it('ignores shortcuts when focused on an input', () => {
    const { unmount } = setup();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      code: 'Space',
      key: ' ',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);

    expect(useSimulationStore.getState().isPlaying).toBe(false);
    document.body.removeChild(input);
    unmount();
  });
});
