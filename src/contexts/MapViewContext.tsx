'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type MapView = '2D' | '3D';
const STORAGE_KEY = 'globenews-map-view';

interface MapViewContextType {
  mapView: MapView;
  setMapView: (v: MapView) => void;
}

const MapViewContext = createContext<MapViewContextType>({
  mapView: '2D',
  setMapView: () => {},
});

export function MapViewProvider({ children }: { children: React.ReactNode }) {
  const [mapView, setMapViewState] = useState<MapView>('2D');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === '2D' || saved === '3D') setMapViewState(saved);
    } catch {}
  }, []);

  const setMapView = (v: MapView) => {
    setMapViewState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  };

  return (
    <MapViewContext.Provider value={{ mapView, setMapView }}>
      {children}
    </MapViewContext.Provider>
  );
}

export const useMapView = () => useContext(MapViewContext);
