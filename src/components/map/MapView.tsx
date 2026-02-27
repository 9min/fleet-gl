import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_CONFIG, ENTRY_ANIMATION } from '@/constants/map';
import { getMapStyle } from '@/api/vworld/tileConfig';
import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useThemeStore } from '@/stores/themeStore';
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

// Auto-fit: smoothly track the fleet bounding box
const AUTO_FIT_INTERVAL = 2000;
const FIT_PADDING = { top: 100, bottom: 80, left: 80, right: 340 }; // right accounts for sidebar
const FIT_DURATION = 1800;
// Only refit when vehicle bbox vs viewport ratio drifts beyond these thresholds
const ZOOM_OUT_RATIO = 0.20; // >20% of vehicles outside → zoom out
const ZOOM_IN_RATIO = 0.30;  // viewport is >30% wider than bbox on each axis → zoom in

const MapView = ({ layers, positions, ready }: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const mapStyle = useMemo(() => getMapStyle(resolvedTheme), [resolvedTheme]);
  const selectVehicle = useUIStore((s) => s.selectVehicle);
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    vehicle: VehiclePosition;
  } | null>(null);
  const entryDoneRef = useRef(false);
  const userInteractedRef = useRef(false);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  // Cinematic entry animation — triggered on map load
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.flyTo({
      center: MAP_CONFIG.center as [number, number],
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      duration: ENTRY_ANIMATION.duration,
      essential: true,
    });

    // Auto-play after camera animation
    setTimeout(() => {
      entryDoneRef.current = true;
      useSimulationStore.getState().play();
    }, ENTRY_ANIMATION.duration + ENTRY_ANIMATION.autoPlayDelay);
  }, []);

  // Track user manual interaction to pause auto-fit
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const onInteract = () => { userInteractedRef.current = true; };
    const onInteractEnd = () => {
      // Resume auto-fit after 10s of no interaction
      setTimeout(() => { userInteractedRef.current = false; }, 10000);
    };
    map.on('dragstart', onInteract);
    map.on('zoomstart', onInteract);
    map.on('dragend', onInteractEnd);
    map.on('zoomend', onInteractEnd);
    return () => {
      map.off('dragstart', onInteract);
      map.off('zoomstart', onInteract);
      map.off('dragend', onInteractEnd);
      map.off('zoomend', onInteractEnd);
    };
  }, [ready]);

  // Auto-fit: zoom in/out to keep all running vehicles visible
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      if (!entryDoneRef.current || userInteractedRef.current) return;
      if (selectedVehicleId) return;
      const map = mapRef.current?.getMap();
      if (!map || map.isMoving()) return;

      const cur = positionsRef.current;
      const active = cur.filter((p) => p.status === 'running' || p.status === 'idle');
      if (active.length < 2) return;

      // Compute vehicle bounding box
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      for (const p of active) {
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
      }

      const vBounds = map.getBounds();
      const vW = vBounds.getEast() - vBounds.getWest();
      const vH = vBounds.getNorth() - vBounds.getSouth();
      const bW = maxLng - minLng;
      const bH = maxLat - minLat;

      // Check if vehicles are outside viewport → need zoom out
      const outside = active.filter(
        (p) => p.lng < vBounds.getWest() || p.lng > vBounds.getEast() ||
               p.lat < vBounds.getSouth() || p.lat > vBounds.getNorth(),
      );
      const needZoomOut = outside.length / active.length > ZOOM_OUT_RATIO;

      // Check if viewport is much wider than vehicle spread → can zoom in
      const needZoomIn = vW > 0 && vH > 0 && bW > 0 && bH > 0 &&
        (bW / vW < (1 - ZOOM_IN_RATIO)) && (bH / vH < (1 - ZOOM_IN_RATIO));

      if (needZoomOut || needZoomIn) {
        map.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          {
            padding: FIT_PADDING,
            pitch: MAP_CONFIG.pitch,
            bearing: MAP_CONFIG.bearing,
            duration: FIT_DURATION,
            maxZoom: MAP_CONFIG.zoom,
          },
        );
      }
    }, AUTO_FIT_INTERVAL);
    return () => clearInterval(interval);
  }, [ready, selectedVehicleId]); // positions accessed via ref — no dep needed

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
        longitude: ENTRY_ANIMATION.startCenter[0],
        latitude: ENTRY_ANIMATION.startCenter[1],
        zoom: ENTRY_ANIMATION.startZoom,
        pitch: ENTRY_ANIMATION.startPitch,
        bearing: ENTRY_ANIMATION.startBearing,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      onLoad={handleMapLoad}
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
