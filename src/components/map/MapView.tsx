import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_CONFIG, ENTRY_ANIMATION } from '@/constants/map';
import { getMapStyle } from '@/api/vworld/tileConfig';
import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import DeckGLOverlay from './DeckGLOverlay';
import VehicleTooltip from './VehicleTooltip';
import type { PickingInfo } from '@deck.gl/core';
import type { VehiclePosition } from '@/types/vehicle';
import type { Layer } from '@deck.gl/core';

type MapViewProps = {
  layers: Layer[];
  positions: VehiclePosition[];
  ready: boolean;
};

const MapView = ({ layers, positions, ready }: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useMemo(() => getMapStyle(), []);
  const selectVehicle = useUIStore((s) => s.selectVehicle);
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    vehicle: VehiclePosition;
  } | null>(null);

  // Cinematic entry animation
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.easeTo({
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      duration: ENTRY_ANIMATION.duration,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    // Auto-play after camera animation
    const timer = setTimeout(() => {
      useSimulationStore.getState().play();
    }, ENTRY_ANIMATION.duration + ENTRY_ANIMATION.autoPlayDelay);

    return () => clearTimeout(timer);
  }, [ready]);

  // Fly-to selected vehicle
  useEffect(() => {
    if (!selectedVehicleId || !positions.length) return;
    const v = positions.find((p) => p.vehicleId === selectedVehicleId);
    if (!v) return;
    mapRef.current?.getMap()?.flyTo({
      center: [v.lng, v.lat],
      zoom: 14,
      pitch: 55,
      duration: 1500,
    });
  }, [selectedVehicleId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleHover = useCallback((info: PickingInfo) => {
    if (info.object) {
      const vehicle = info.object as VehiclePosition;
      setHoverInfo({ x: info.x, y: info.y, vehicle });
    } else {
      setHoverInfo(null);
    }
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: MAP_CONFIG.center[0],
        latitude: MAP_CONFIG.center[1],
        zoom: ENTRY_ANIMATION.startZoom,
        pitch: ENTRY_ANIMATION.startPitch,
        bearing: ENTRY_ANIMATION.startBearing,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
    >
      <DeckGLOverlay layers={layers} onClick={handleClick} onHover={handleHover} />
      {hoverInfo && (
        <VehicleTooltip
          x={hoverInfo.x}
          y={hoverInfo.y}
          vehicle={hoverInfo.vehicle}
        />
      )}
    </Map>
  );
};

export default MapView;
