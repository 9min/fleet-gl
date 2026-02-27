import { useAlertStore } from '../alertStore';

describe('alertStore', () => {
  beforeEach(() => {
    useAlertStore.setState({ alerts: [] });
  });

  it('addAlert adds an alert with id and timestamp', () => {
    useAlertStore.getState().addAlert({ message: 'Test alert', type: 'info' });
    const alerts = useAlertStore.getState().alerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.message).toBe('Test alert');
    expect(alerts[0]!.type).toBe('info');
    expect(alerts[0]!.id).toBeDefined();
    expect(alerts[0]!.timestamp).toBeGreaterThan(0);
  });

  it('keeps max 5 alerts (oldest removed)', () => {
    for (let i = 0; i < 6; i++) {
      useAlertStore.getState().addAlert({ message: `Alert ${i}`, type: 'info' });
    }
    const alerts = useAlertStore.getState().alerts;
    expect(alerts).toHaveLength(5);
    expect(alerts[0]!.message).toBe('Alert 1');
    expect(alerts[4]!.message).toBe('Alert 5');
  });

  it('dismissAlert removes alert by id', () => {
    useAlertStore.getState().addAlert({ message: 'To dismiss', type: 'warning' });
    const id = useAlertStore.getState().alerts[0]!.id;
    useAlertStore.getState().dismissAlert(id);
    expect(useAlertStore.getState().alerts).toHaveLength(0);
  });

  it('markDismissing sets dismissing flag', () => {
    useAlertStore.getState().addAlert({ message: 'Dismissing', type: 'error' });
    const id = useAlertStore.getState().alerts[0]!.id;
    useAlertStore.getState().markDismissing(id);
    expect(useAlertStore.getState().alerts[0]!.dismissing).toBe(true);
  });

  it('each alert has a unique id', () => {
    useAlertStore.getState().addAlert({ message: 'A', type: 'info' });
    useAlertStore.getState().addAlert({ message: 'B', type: 'info' });
    const [a, b] = useAlertStore.getState().alerts;
    expect(a!.id).not.toBe(b!.id);
  });

  it('dismissAlert does nothing for non-existent id', () => {
    useAlertStore.getState().addAlert({ message: 'Keep', type: 'info' });
    useAlertStore.getState().dismissAlert('non-existent');
    expect(useAlertStore.getState().alerts).toHaveLength(1);
  });
});
