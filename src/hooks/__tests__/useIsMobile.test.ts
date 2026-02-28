import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../useIsMobile';

type ChangeHandler = (e: { matches: boolean }) => void;

let changeHandler: ChangeHandler | null = null;

const createMockMQ = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
    changeHandler = handler;
  }),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => false),
});

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia, writable: true });
    changeHandler = null;
  });

  it('returns false when window width >= 1024', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      value: () => createMockMQ(false),
      writable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when window width < 1024', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      value: () => createMockMQ(true),
      writable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('responds to matchMedia change events', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
    Object.defineProperty(window, 'matchMedia', {
      value: () => createMockMQ(false),
      writable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      changeHandler?.({ matches: true });
    });
    expect(result.current).toBe(true);

    // Simulate resize back to desktop
    act(() => {
      changeHandler?.({ matches: false });
    });
    expect(result.current).toBe(false);
  });
});
