import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Leaflet and React-Leaflet for headless testing
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(),
    map: vi.fn(),
    tileLayer: vi.fn(),
    marker: vi.fn(),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Marker: ({ children }: any) => <div>{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn() }),
}));
