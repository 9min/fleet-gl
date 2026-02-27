import { useCallback, useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_CONFIG } from '@/constants/map';
import { getMapStyle } from '@/api/vworld/tileConfig';
import { useUIStore } from '@/stores/uiStore';
import DeckGLOverlay from './DeckGLOverlay';
import type { PickingInfo } from '@deck.gl/core';
import type { VehiclePosition } from '@/types/vehicle';
import type { Layer } from '@deck.gl/core';

type MapViewProps = {
  layers: Layer[];
};

const MapView = ({ layers }: MapViewProps) => {
  const mapStyle = useMemo(() => getMapStyle(), []);
  const selectVehicle = useUIStore((s) => s.selectVehicle);

  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (info.object) {
        const vehicle = info.object as VehiclePosition;
        selectVehicle(vehicle.vehicleId);
      } else {
        selectVehicle(null);
      }
    },
    [selectVehicle],
  );

  return (
    <Map
      initialViewState={{
        longitude: MAP_CONFIG.center[0],
        latitude: MAP_CONFIG.center[1],
        zoom: MAP_CONFIG.zoom,
        pitch: MAP_CONFIG.pitch,
        bearing: MAP_CONFIG.bearing,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
    >
      <DeckGLOverlay layers={layers} onClick={handleClick} />
    </Map>
  );
};

export default MapView;
