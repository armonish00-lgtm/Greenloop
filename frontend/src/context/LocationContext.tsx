import React, { createContext, useContext, useState } from 'react';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export const CHENNAI_NEIGHBORHOODS: Record<string, LocationCoords> = {
  'Anna Nagar': { lat: 13.0850, lng: 80.2100 },
  'Ashok Nagar': { lat: 13.0373, lng: 80.2123 },
  'Guindy': { lat: 13.0067, lng: 80.2025 },
  'Guindy Industrial Estate': { lat: 13.0125, lng: 80.2080 },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Velachery': { lat: 12.9780, lng: 80.2210 },
  'T. Nagar': { lat: 13.0418, lng: 80.2341 },
};

interface LocationContextType {
  neighborhood: string;
  setNeighborhood: (name: string) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  coordinates: LocationCoords;
  detectCurrentLocation: () => Promise<void>;
  isDetecting: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [neighborhood, setNeighborhoodState] = useState<string>('Anna Nagar');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [coordinates, setCoordinates] = useState<LocationCoords>(CHENNAI_NEIGHBORHOODS['Anna Nagar']);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const setNeighborhood = (name: string) => {
    setNeighborhoodState(name);
    if (CHENNAI_NEIGHBORHOODS[name]) {
      setCoordinates(CHENNAI_NEIGHBORHOODS[name]);
    }
  };

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoordinates(userCoords);
        setNeighborhoodState('Current Location');
        setIsDetecting(false);
      },
      (err) => {
        console.warn('Geolocation failed or denied, using Chennai fallback:', err.message);
        setIsDetecting(false);
        setNeighborhood('Anna Nagar');
      },
      { timeout: 8000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        neighborhood,
        setNeighborhood,
        radiusKm,
        setRadiusKm,
        coordinates,
        detectCurrentLocation,
        isDetecting,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
