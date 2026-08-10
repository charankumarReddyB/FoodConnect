import '@testing-library/jest-dom';
import React from 'react';
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
  MapContainer: ({ children }: any) => React.createElement('div', null, children),
  TileLayer: () => React.createElement('div', null, 'TileLayer'),
  Marker: ({ children }: any) => React.createElement('div', null, children),
  Popup: ({ children }: any) => React.createElement('div', null, children),
  useMap: () => ({ setView: vi.fn() }),
}));
