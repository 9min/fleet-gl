import { exportVehiclePositions, exportFleetStats, exportGeofenceEvents } from '../exportCsv';
import type { VehiclePosition } from '@/types/vehicle';
import type { SimulationStats } from '@/types/simulation';

// Mock DOM APIs used by downloadCsv
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

let capturedBlob: Blob | null = null;

beforeAll(() => {
  globalThis.URL.createObjectURL = mockCreateObjectURL;
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement;
    }
    return document.createElement(tag);
  });

  // Capture the Blob passed to createObjectURL
  mockCreateObjectURL.mockImplementation((blob: Blob) => {
    capturedBlob = blob;
    return 'blob:mock-url';
  });
});

beforeEach(() => {
  mockClick.mockClear();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  capturedBlob = null;
});

describe('exportVehiclePositions', () => {
  const positions: VehiclePosition[] = [
    {
      vehicleId: 'V-001',
      lng: 126.978388,
      lat: 37.566535,
      bearing: 90.5,
      status: 'running',
      speed: 45.3,
      waypointIndex: 3,
      totalWaypoints: 10,
    },
  ];

  it('triggers download', () => {
    exportVehiclePositions(positions);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('creates a Blob and revokes URL', () => {
    exportVehiclePositions(positions);
    expect(mockCreateObjectURL).toHaveBeenCalledOnce();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('CSV contains correct header', async () => {
    exportVehiclePositions(positions);
    const text = await capturedBlob!.text();
    const lines = text.split('\n');
    // BOM + header
    expect(lines[0]).toContain('Vehicle ID,Longitude,Latitude,Bearing,Status,Speed,Waypoint Index,Total Waypoints');
  });

  it('CSV contains vehicle data row', async () => {
    exportVehiclePositions(positions);
    const text = await capturedBlob!.text();
    const lines = text.split('\n');
    expect(lines[1]).toContain('V-001');
    expect(lines[1]).toContain('126.978388');
    expect(lines[1]).toContain('running');
  });
});

describe('exportFleetStats', () => {
  const stats: SimulationStats = {
    totalVehicles: 100,
    running: 50,
    idle: 20,
    completed: 20,
    delayed: 10,
    progressPercent: 60,
    totalDistance: 12345,
  };

  it('triggers download', () => {
    exportFleetStats(stats, 3600);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('CSV contains metric rows', async () => {
    exportFleetStats(stats, 3600);
    const text = await capturedBlob!.text();
    expect(text).toContain('Metric,Value');
    expect(text).toContain('Total Vehicles,100');
    expect(text).toContain('Running,50');
    expect(text).toContain('Progress,60%');
  });
});

describe('exportGeofenceEvents', () => {
  const events = [
    { vehicleId: 'V-001', message: 'Entered hub zone', timestamp: 1000000, type: 'geofence' },
    { message: 'System alert', timestamp: 2000000, type: 'alert' },
  ];

  it('triggers download', () => {
    exportGeofenceEvents(events);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('CSV handles missing vehicleId', async () => {
    exportGeofenceEvents(events);
    const text = await capturedBlob!.text();
    const lines = text.split('\n');
    // Second event has no vehicleId → empty field
    expect(lines[2]).toContain('alert,,');
  });
});
