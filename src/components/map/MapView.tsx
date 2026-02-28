import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_CONFIG, ENTRY_ANIMATION, FIT_PADDING_DESKTOP, FIT_PADDING_MOBILE, AUTO_FIT_RESUME_DELAY } from '@/constants/map';
import { useIsMobile } from '@/hooks/useIsMobile';
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

// Auto-fit behavior configuration (MapView-specific)
const AUTO_FIT_INTERVAL = 2000;
const FIT_DURATION = 1800;
const ZOOM_OUT_RATIO = 0.20;  // >20% of vehicles outside → zoom out
const ZOOM_IN_RATIO = 0.50;  // bbox fills <50% of effective viewport → zoom in

const MapView = ({ layers, positions, ready }: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();
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
  const lastFitRef = useRef<[number, number, number, number] | null>(null); // [minLng, minLat, maxLng, maxLat]
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
  // Uses originalEvent to distinguish user gestures from programmatic moves (fitBounds/flyTo)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    let interactionTimeout: number | null = null;

    // MapLibre events include originalEvent only for user-initiated gestures
    const isUserGesture = (e: { originalEvent?: unknown }) => !!e.originalEvent;

    const onInteract = (e: { originalEvent?: unknown }) => {
      if (!isUserGesture(e)) return;
      userInteractedRef.current = true;
    };

    const onInteractEnd = (e: { originalEvent?: unknown }) => {
      if (!isUserGesture(e)) return;
      // Clear previous timeout to prevent accumulation
      if (interactionTimeout !== null) {
        clearTimeout(interactionTimeout);
      }
      interactionTimeout = window.setTimeout(() => {
        userInteractedRef.current = false;
      }, AUTO_FIT_RESUME_DELAY);
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
      if (interactionTimeout !== null) {
        clearTimeout(interactionTimeout);
      }
    };
  }, [ready]);

  // Responsive padding based on screen size
  const fitPadding = isMobile ? FIT_PADDING_MOBILE : FIT_PADDING_DESKTOP;

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

      const canvas = map.getCanvas();
      const effectiveW = canvas.clientWidth - fitPadding.left - fitPadding.right;
      const effectiveH = canvas.clientHeight - fitPadding.top - fitPadding.bottom;
      const effectiveCenterX = fitPadding.left + effectiveW / 2;
      const effectiveCenterY = fitPadding.top + effectiveH / 2;

      // Compute vehicle bounding box (actual distribution, not symmetric)
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      for (const p of active) {
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
      }
      const bW = maxLng - minLng;
      const bH = maxLat - minLat;

      // Early state: vehicles clustered at origin → panBy to correct entry animation centering
      if (bW < 0.001 && bH < 0.001) {
        const clusterPx = map.project([minLng, minLat]);
        const offsetX = clusterPx.x - effectiveCenterX;
        const offsetY = clusterPx.y - effectiveCenterY;
        if (Math.abs(offsetX) > 30 || Math.abs(offsetY) > 30) {
          map.panBy([offsetX, offsetY], { duration: 1000 });
        }
        return;
      }

      // Count vehicles outside visible bounds → need zoom out
      const vBounds = map.getBounds();
      const outside = active.filter(
        (p) => p.lng < vBounds.getWest() || p.lng > vBounds.getEast() ||
               p.lat < vBounds.getSouth() || p.lat > vBounds.getNorth(),
      );
      const needZoomOut = outside.length / active.length > ZOOM_OUT_RATIO;

      // Project actual vehicle bbox to screen pixels (handles pitch distortion)
      const topLeftPx = map.project([minLng, maxLat]);
      const bottomRightPx = map.project([maxLng, minLat]);
      const bboxPxW = Math.abs(bottomRightPx.x - topLeftPx.x);
      const bboxPxH = Math.abs(bottomRightPx.y - topLeftPx.y);

      // Zoom in only if bbox is tiny relative to the effective viewport
      const needZoomIn = effectiveW > 0 && effectiveH > 0 && bboxPxW > 0 && bboxPxH > 0 &&
        bboxPxW < effectiveW * (1 - ZOOM_IN_RATIO) && bboxPxH < effectiveH * (1 - ZOOM_IN_RATIO);

      // Zoom out if bbox exceeds effective viewport
      const bboxExceedsViewport = bboxPxW > effectiveW * 1.2 || bboxPxH > effectiveH * 1.2;

      // Recenter if bbox center has drifted from effective viewport center
      const bboxCenterPx = map.project([(minLng + maxLng) / 2, (minLat + maxLat) / 2]);
      const driftX = Math.abs(bboxCenterPx.x - effectiveCenterX) / effectiveW;
      const driftY = Math.abs(bboxCenterPx.y - effectiveCenterY) / effectiveH;
      const needRecenter = driftX > 0.15 || driftY > 0.15;

      if (needZoomOut || needZoomIn || needRecenter || bboxExceedsViewport) {
        // Skip if bbox hasn't changed meaningfully since last fitBounds
        const last = lastFitRef.current;
        const bboxChanged = !last ||
          Math.abs(minLng - last[0]) > bW * 0.05 || Math.abs(minLat - last[1]) > bH * 0.05 ||
          Math.abs(maxLng - last[2]) > bW * 0.05 || Math.abs(maxLat - last[3]) > bH * 0.05;

        if (bboxChanged) {
          lastFitRef.current = [minLng, minLat, maxLng, maxLat];
          map.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            {
              padding: fitPadding,
              pitch: MAP_CONFIG.pitch,
              bearing: MAP_CONFIG.bearing,
              duration: FIT_DURATION,
              maxZoom: MAP_CONFIG.zoom,
            },
          );

          // Correct pitch-induced center offset after fitBounds animation completes
          // fitBounds with pitch>0 doesn't perfectly center the bbox in the padded viewport
          const snapMinLng = minLng, snapMaxLng = maxLng;
          const snapMinLat = minLat, snapMaxLat = maxLat;
          map.once('moveend', () => {
            if (userInteractedRef.current) return;
            const postCenter = map.project([
              (snapMinLng + snapMaxLng) / 2,
              (snapMinLat + snapMaxLat) / 2,
            ]);
            const cx = fitPadding.left + (map.getCanvas().clientWidth - fitPadding.left - fitPadding.right) / 2;
            const cy = fitPadding.top + (map.getCanvas().clientHeight - fitPadding.top - fitPadding.bottom) / 2;
            const dx = postCenter.x - cx;
            const dy = postCenter.y - cy;
            if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
              map.panBy([dx, dy], { duration: 600 });
            }
          });
        }
      }
    }, AUTO_FIT_INTERVAL);
    return () => clearInterval(interval);
  }, [ready, selectedVehicleId, fitPadding]); // positions accessed via ref — no dep needed

  // Fly-to selected vehicle
  useEffect(() => {
    if (!selectedVehicleId || !positions.length) return;
    const v = positions.find((p) => p.vehicleId === selectedVehicleId);
    if (!v) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.flyTo({
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
