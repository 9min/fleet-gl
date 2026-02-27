import { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';

type DeckGLOverlayProps = MapboxOverlayProps;

const DeckGLOverlay = (props: DeckGLOverlayProps) => {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay(props),
  );
  overlay.setProps(props);
  return null;
};

export default DeckGLOverlay;
