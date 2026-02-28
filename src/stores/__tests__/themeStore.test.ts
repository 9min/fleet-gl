import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({
      theme: 'dark',
      resolvedTheme: 'dark',
    });
  });

  it('has dark as default theme', () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
  });

  it('setTheme updates theme and resolvedTheme', () => {
    useThemeStore.getState().setTheme('light');
    const state = useThemeStore.getState();
    expect(state.theme).toBe('light');
    expect(state.resolvedTheme).toBe('light');
  });

  it('setTheme persists to localStorage', () => {
    useThemeStore.getState().setTheme('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('setTheme("system") resolves via matchMedia', () => {
    // setup.ts mocks matchMedia to return matches=true for (prefers-color-scheme: dark)
    useThemeStore.getState().setTheme('system');
    const state = useThemeStore.getState();
    expect(state.theme).toBe('system');
    expect(state.resolvedTheme).toBe('dark');
  });

  it('toggleTheme switches dark → light', () => {
    useThemeStore.setState({ resolvedTheme: 'dark' });
    useThemeStore.getState().toggleTheme();
    const state = useThemeStore.getState();
    expect(state.theme).toBe('light');
    expect(state.resolvedTheme).toBe('light');
  });

  it('toggleTheme switches light → dark', () => {
    useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' });
    useThemeStore.getState().toggleTheme();
    const state = useThemeStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
  });

  it('toggleTheme persists to localStorage', () => {
    useThemeStore.getState().toggleTheme();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('setResolvedTheme only updates resolvedTheme', () => {
    useThemeStore.getState().setResolvedTheme('light');
    const state = useThemeStore.getState();
    expect(state.theme).toBe('dark'); // unchanged
    expect(state.resolvedTheme).toBe('light');
  });
});
