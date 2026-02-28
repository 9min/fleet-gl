import { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';

type DeckGLOverlayProps = MapboxOverlayProps & {
  onOverlayReady?: (overlay: MapboxOverlay) => void;
};

const DeckGLOverlay = ({ onOverlayReady, ...props }: DeckGLOverlayProps) => {
  const overlay = useControl<MapboxOverlay>(
    () => {
      const instance = new MapboxOverlay(props);
      onOverlayReady?.(instance);
      return instance;
    },
  );
  overlay.setProps(props);
  return null;
};

export default DeckGLOverlay;
