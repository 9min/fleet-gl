import { useSimulationStore } from '../simulationStore';

describe('simulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      isPlaying: false,
      playbackSpeed: 60,
      currentTime: 0,
    });
  });

  it('has correct initial state', () => {
    const state = useSimulationStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.playbackSpeed).toBe(60);
    expect(state.currentTime).toBe(0);
  });

  it('play() sets isPlaying to true', () => {
    useSimulationStore.getState().play();
    expect(useSimulationStore.getState().isPlaying).toBe(true);
  });

  it('pause() sets isPlaying to false', () => {
    useSimulationStore.getState().play();
    useSimulationStore.getState().pause();
    expect(useSimulationStore.getState().isPlaying).toBe(false);
  });

  it('togglePlay() toggles isPlaying', () => {
    useSimulationStore.getState().togglePlay();
    expect(useSimulationStore.getState().isPlaying).toBe(true);
    useSimulationStore.getState().togglePlay();
    expect(useSimulationStore.getState().isPlaying).toBe(false);
  });

  it('setSpeed() updates playbackSpeed', () => {
    useSimulationStore.getState().setSpeed(120);
    expect(useSimulationStore.getState().playbackSpeed).toBe(120);
  });

  it('seek() updates currentTime', () => {
    useSimulationStore.getState().seek(1000);
    expect(useSimulationStore.getState().currentTime).toBe(1000);
  });
});
